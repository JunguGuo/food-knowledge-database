"use client";

import { useState, useEffect } from "react";
import { Restaurant, MenuItem } from "@/lib/types";
import { useCityContext } from "@/lib/cityContext";
import { useTagContext } from "@/lib/tagContext";
import { RatingInput } from "./Rating";
import { TagInput } from "./TagInput";

const JSON_SCHEMA_PLACEHOLDER = `{
  "name": "Restaurant Name",
  "city": "City Name",
  "cuisineTags": ["Chinese", "Szechuan"],
  "labels": ["Spicy", "Reliable"],
  "overallRating": 4,
  "notes": "Great food, fast service",
  "location": "123 Main St",
  "menuItems": [
    {
      "name": "Kung Pao Chicken",
      "category": "Main",
      "rating": 5,
      "status": "favorite",
      "tags": ["Spicy"],
      "notes": "Best in town",
      "description": "Wok-fried chicken with peanuts and dried chilies",
      "price": 15.99
    }
  ]
}

Status options: "not_tried" | "favorite" | "liked" | "neutral" | "avoid" | "want_to_try"
  Default status is "not_tried" if omitted
Rating: 1-5 or null
Price: number or null
Fields "menuItems", "labels", "notes", "location", "overallRating", "description" are optional`;

type TabMode = "form" | "json";

interface JsonRestaurant {
  name: string;
  city: string;
  cuisineTags: string[];
  labels: string[];
  overallRating: number | null;
  notes: string;
  location: string;
  menuItems: JsonMenuItem[];
}

interface JsonMenuItem {
  name: string;
  category: string;
  rating: number | null;
  status: MenuItem["status"];
  tags: string[];
  notes: string;
  description: string;
  price: number | null;
}

const VALID_STATUSES = ["not_tried", "favorite", "liked", "neutral", "avoid", "want_to_try"];

function validateJsonRestaurant(data: unknown): { valid: boolean; errors: string[]; parsed?: JsonRestaurant } {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { valid: false, errors: ["Must be a JSON object"] };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.name !== "string" || !obj.name.trim()) {
    errors.push('"name" is required and must be a non-empty string');
  }
  if (typeof obj.city !== "string" || !obj.city.trim()) {
    errors.push('"city" is required and must be a non-empty string');
  }

  if (obj.cuisineTags !== undefined) {
    if (!Array.isArray(obj.cuisineTags) || !obj.cuisineTags.every((t) => typeof t === "string")) {
      errors.push('"cuisineTags" must be an array of strings');
    }
  }
  if (obj.labels !== undefined) {
    if (!Array.isArray(obj.labels) || !obj.labels.every((t) => typeof t === "string")) {
      errors.push('"labels" must be an array of strings');
    }
  }
  if (obj.overallRating !== undefined && obj.overallRating !== null) {
    if (typeof obj.overallRating !== "number" || obj.overallRating < 1 || obj.overallRating > 5) {
      errors.push('"overallRating" must be a number between 1 and 5, or null');
    }
  }
  if (obj.notes !== undefined && typeof obj.notes !== "string") {
    errors.push('"notes" must be a string');
  }
  if (obj.location !== undefined && typeof obj.location !== "string") {
    errors.push('"location" must be a string');
  }

  if (obj.menuItems !== undefined) {
    if (!Array.isArray(obj.menuItems)) {
      errors.push('"menuItems" must be an array');
    } else {
      obj.menuItems.forEach((item: unknown, i: number) => {
        if (typeof item !== "object" || item === null) {
          errors.push(`menuItems[${i}]: must be an object`);
          return;
        }
        const mi = item as Record<string, unknown>;
        if (typeof mi.name !== "string" || !mi.name.trim()) {
          errors.push(`menuItems[${i}]: "name" is required and must be a non-empty string`);
        }
        if (mi.category !== undefined && typeof mi.category !== "string") {
          errors.push(`menuItems[${i}]: "category" must be a string`);
        }
        if (mi.rating !== undefined && mi.rating !== null) {
          if (typeof mi.rating !== "number" || mi.rating < 1 || mi.rating > 5) {
            errors.push(`menuItems[${i}]: "rating" must be 1-5 or null`);
          }
        }
        if (mi.status !== undefined && !VALID_STATUSES.includes(mi.status as string)) {
          errors.push(`menuItems[${i}]: "status" must be one of: ${VALID_STATUSES.join(", ")}`);
        }
        if (mi.tags !== undefined) {
          if (!Array.isArray(mi.tags) || !mi.tags.every((t) => typeof t === "string")) {
            errors.push(`menuItems[${i}]: "tags" must be an array of strings`);
          }
        }
        if (mi.description !== undefined && typeof mi.description !== "string") {
          errors.push(`menuItems[${i}]: "description" must be a string`);
        }
        if (mi.price !== undefined && mi.price !== null && typeof mi.price !== "number") {
          errors.push(`menuItems[${i}]: "price" must be a number or null`);
        }
      });
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    errors: [],
    parsed: {
      name: (obj.name as string).trim(),
      city: (obj.city as string).trim(),
      cuisineTags: (obj.cuisineTags as string[] | undefined) ?? [],
      labels: (obj.labels as string[] | undefined) ?? [],
      overallRating: (obj.overallRating as number | null | undefined) ?? null,
      notes: (obj.notes as string | undefined) ?? "",
      location: (obj.location as string | undefined) ?? "",
      menuItems: ((obj.menuItems as JsonMenuItem[] | undefined) ?? []).map((mi) => ({
        name: mi.name.trim(),
        category: mi.category ?? "",
        rating: mi.rating ?? null,
        status: mi.status ?? "not_tried",
        tags: mi.tags ?? [],
        notes: mi.notes ?? "",
        description: mi.description ?? "",
        price: mi.price ?? null,
      })),
    },
  };
}

interface RestaurantFormProps {
  restaurant?: Restaurant;
  defaultCity?: string;
  onSave: (data: {
    name: string;
    city: string;
    cuisineTags: string[];
    labels: string[];
    overallRating: number | null;
    notes: string;
    location: string;
  }) => void;
  onSaveWithMenuItems?: (data: {
    name: string;
    city: string;
    cuisineTags: string[];
    labels: string[];
    overallRating: number | null;
    notes: string;
    location: string;
    menuItems: Omit<MenuItem, "id" | "restaurantId" | "dateAdded" | "lastUpdated">[];
  }) => void;
  onClose: () => void;
}

export function RestaurantForm({ restaurant, defaultCity, onSave, onSaveWithMenuItems, onClose }: RestaurantFormProps) {
  const { cities, addCity } = useCityContext();
  const { cuisineTags: cuisineOptions, restaurantLabels: labelOptions } = useTagContext();
  const [tab, setTab] = useState<TabMode>("form");
  const [name, setName] = useState(restaurant?.name ?? "");
  const [city, setCity] = useState(restaurant?.city ?? defaultCity ?? cities[0] ?? "");
  const [customCity, setCustomCity] = useState("");
  const [showCustomCity, setShowCustomCity] = useState(false);
  const [cuisineTags, setCuisineTags] = useState<string[]>(restaurant?.cuisineTags ?? []);
  const [labels, setLabels] = useState<string[]>(restaurant?.labels ?? []);
  const [overallRating, setOverallRating] = useState<number | null>(restaurant?.overallRating ?? null);
  const [notes, setNotes] = useState(restaurant?.notes ?? "");
  const [location, setLocation] = useState(restaurant?.location ?? "");

  // JSON paste state
  const [jsonText, setJsonText] = useState("");
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);
  const [jsonValid, setJsonValid] = useState(false);
  const [jsonParsed, setJsonParsed] = useState<JsonRestaurant | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleCityChange(val: string) {
    if (val === "__custom__") {
      setShowCustomCity(true);
    } else {
      setCity(val);
      setShowCustomCity(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCity = showCustomCity ? customCity.trim() : city;
    if (!name.trim() || !finalCity) return;
    if (showCustomCity && customCity.trim()) {
      addCity(customCity.trim());
    }
    onSave({ name: name.trim(), city: finalCity, cuisineTags, labels, overallRating, notes, location });
  }

  function handleJsonChange(text: string) {
    setJsonText(text);
    setJsonErrors([]);
    setJsonValid(false);
    setJsonParsed(null);

    if (!text.trim()) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setJsonErrors([(err as Error).message]);
      return;
    }

    const result = validateJsonRestaurant(parsed);
    if (result.valid && result.parsed) {
      setJsonValid(true);
      setJsonParsed(result.parsed);
      setJsonErrors([]);
    } else {
      setJsonErrors(result.errors);
    }
  }

  function handleJsonSubmit() {
    if (!jsonParsed) return;
    const { menuItems: jsonMenuItems, ...restData } = jsonParsed;

    // Add city if not already in the list
    if (!cities.includes(jsonParsed.city)) {
      addCity(jsonParsed.city);
    }

    if (jsonMenuItems && jsonMenuItems.length > 0 && onSaveWithMenuItems) {
      onSaveWithMenuItems({ ...restData, menuItems: jsonMenuItems });
    } else {
      onSave(restData);
    }
  }

  const isEditing = !!restaurant;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{isEditing ? "Edit Restaurant" : "Add Restaurant"}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tab switcher - only show when adding, not editing */}
        {!isEditing && (
          <div className="form-tabs">
            <button
              type="button"
              className={`form-tab${tab === "form" ? " active" : ""}`}
              onClick={() => setTab("form")}
            >
              Manual Entry
            </button>
            <button
              type="button"
              className={`form-tab${tab === "json" ? " active" : ""}`}
              onClick={() => setTab("json")}
            >
              Paste JSON
            </button>
          </div>
        )}

        {tab === "form" ? (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Restaurant Name</label>
                <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Szechuan House" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  {showCustomCity ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="form-input"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        placeholder="Enter city name"
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => { setShowCustomCity(false); setCustomCity(""); }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <select className="form-input" value={city} onChange={(e) => handleCityChange(e.target.value)}>
                      {cities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">+ Add new city…</option>
                    </select>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Overall Rating</label>
                  <RatingInput value={overallRating} onChange={setOverallRating} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cuisine Tags</label>
                  <TagInput value={cuisineTags} onChange={setCuisineTags} suggestions={cuisineOptions} placeholder="e.g. Chinese, Thai" />
                </div>
                <div className="form-group">
                  <label className="form-label">Labels</label>
                  <TagInput value={labels} onChange={setLabels} suggestions={labelOptions} placeholder="e.g. Comfort, Reliable" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location (optional)</label>
                <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Downtown, 123 Main St" />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General impressions, tips, delivery notes..." />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">{isEditing ? "Save Changes" : "Add Restaurant"}</button>
            </div>
          </form>
        ) : (
          <div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Paste Restaurant JSON</label>
                <textarea
                  className="form-input json-paste-area"
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  placeholder={JSON_SCHEMA_PLACEHOLDER}
                  rows={16}
                  spellCheck={false}
                  style={{ fontFamily: "monospace", fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre", resize: "vertical" }}
                />
              </div>

              {jsonErrors.length > 0 && (
                <div className="json-validation-errors">
                  <div className="json-validation-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Format errors
                  </div>
                  <ul className="json-validation-list">
                    {jsonErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {jsonValid && jsonParsed && (
                <div className="json-validation-success">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span>
                    Valid — <strong>{jsonParsed.name}</strong> in {jsonParsed.city}
                    {jsonParsed.menuItems && jsonParsed.menuItems.length > 0 && (
                      <> with {jsonParsed.menuItems.length} menu item{jsonParsed.menuItems.length !== 1 ? "s" : ""}</>
                    )}
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!jsonValid}
                onClick={handleJsonSubmit}
              >
                Import Restaurant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
