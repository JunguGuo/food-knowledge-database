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
  "latitude": 41.4993,
  "longitude": -81.6944,
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
Fields "menuItems", "labels", "notes", "location", "latitude", "longitude", "overallRating", "description" are optional`;

// Prompt the user copies into any AI chat alongside a photo of the menu. It
// describes the exact schema validateJsonRestaurant() accepts so the JSON the
// AI returns can be pasted straight back and imported.
const MENU_TO_JSON_PROMPT = `You convert restaurant menus into structured JSON.

I'm attaching one or more photos of a restaurant menu. Read the menu and return a SINGLE JSON object that exactly matches the schema below. Output ONLY the JSON — no explanations, no markdown code fences, no comments.

Schema (one JSON object):
{
  "name": string,             // restaurant name from the menu; if not shown, use "New Restaurant"
  "city": string,             // city if printed on the menu, otherwise "Unknown"
  "cuisineTags": string[],    // infer from the menu, e.g. ["Chinese","Szechuan"]; or []
  "labels": string[],         // leave as []
  "overallRating": null,      // always null — I rate it myself later
  "priceRange": number|null,  // 1-4 ($ to $$$$) estimated from the prices, or null
  "notes": "",
  "location": string,         // street address if printed on the menu, otherwise ""
  "latitude": null,
  "longitude": null,
  "menuItems": [
    {
      "name": string,         // exact dish name as printed
      "category": string,     // the menu section heading (e.g. "Appetizers","Mains","Drinks"); "" if none
      "rating": null,         // always null
      "status": "not_tried",  // always "not_tried"
      "tags": string[],       // only dietary/spice markers explicitly shown (e.g. "Spicy","Vegetarian","Vegan","Gluten-free"); otherwise []
      "notes": "",
      "description": string,  // the menu's own description of the dish, or "" if none
      "price": number|null    // numeric price with no currency symbol (e.g. 15.99), or null if not shown
    }
  ]
}

Rules:
- The output must be valid JSON: double quotes only, no trailing commas, no comments.
- Include EVERY item on the menu and keep the menu's section groupings as "category".
- Use the exact dish names and prices as printed; strip currency symbols (e.g. "$15.99" becomes 15.99).
- Do NOT invent ratings, statuses, or personal notes — leave those at the defaults above.
- If a value is unknown, use the default shown ("", null, or []).
- Return the JSON only.`;

type TabMode = "form" | "json";

interface JsonRestaurant {
  name: string;
  city: string;
  cuisineTags: string[];
  labels: string[];
  overallRating: number | null;
  priceRange: number | null;
  notes: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
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
  if (obj.priceRange !== undefined && obj.priceRange !== null) {
    if (typeof obj.priceRange !== "number" || obj.priceRange < 1 || obj.priceRange > 4) {
      errors.push('"priceRange" must be a number between 1 and 4, or null');
    }
  }
  if (obj.notes !== undefined && typeof obj.notes !== "string") {
    errors.push('"notes" must be a string');
  }
  if (obj.location !== undefined && typeof obj.location !== "string") {
    errors.push('"location" must be a string');
  }
  if (obj.latitude !== undefined && obj.latitude !== null && typeof obj.latitude !== "number") {
    errors.push('"latitude" must be a number or null');
  }
  if (obj.longitude !== undefined && obj.longitude !== null && typeof obj.longitude !== "number") {
    errors.push('"longitude" must be a number or null');
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
      priceRange: (obj.priceRange as number | null | undefined) ?? null,
      notes: (obj.notes as string | undefined) ?? "",
      location: (obj.location as string | undefined) ?? "",
      latitude: (obj.latitude as number | null | undefined) ?? null,
      longitude: (obj.longitude as number | null | undefined) ?? null,
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
    priceRange: number | null;
    notes: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
  }) => void;
  onSaveWithMenuItems?: (data: {
    name: string;
    city: string;
    cuisineTags: string[];
    labels: string[];
    overallRating: number | null;
    priceRange: number | null;
    notes: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
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
  const [priceRange, setPriceRange] = useState<number | null>(restaurant?.priceRange ?? null);
  const [notes, setNotes] = useState(restaurant?.notes ?? "");
  const [location, setLocation] = useState(restaurant?.location ?? "");
  const [latitude, setLatitude] = useState(restaurant?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(restaurant?.longitude?.toString() ?? "");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  async function handleGeocode() {
    const query = location.trim();
    if (!query) return;
    setGeocoding(true);
    setGeocodeError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { "Accept": "application/json" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setGeocodeError("No results found. Try a more specific address.");
        return;
      }
      setLatitude(parseFloat(data[0].lat).toFixed(6));
      setLongitude(parseFloat(data[0].lon).toFixed(6));
    } catch {
      setGeocodeError("Geocoding failed. Check your connection.");
    } finally {
      setGeocoding(false);
    }
  }

  // JSON paste state
  const [jsonText, setJsonText] = useState("");
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);
  const [jsonValid, setJsonValid] = useState(false);
  const [jsonParsed, setJsonParsed] = useState<JsonRestaurant | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(MENU_TO_JSON_PROMPT);
    } catch {
      // Fallback for browsers/contexts without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = MENU_TO_JSON_PROMPT;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }

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
    const lat = latitude.trim() ? parseFloat(latitude) : null;
    const lng = longitude.trim() ? parseFloat(longitude) : null;
    onSave({ name: name.trim(), city: finalCity, cuisineTags, labels, overallRating, priceRange, notes, location, latitude: lat, longitude: lng });
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
              <div className="form-group">
                <label className="form-label">Price Range</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      style={{
                        padding: "5px 12px",
                        border: `1px solid ${priceRange === n ? "var(--status-liked)" : "var(--border-default)"}`,
                        borderRadius: "var(--radius-sm)",
                        background: priceRange === n ? "var(--status-liked-bg)" : "var(--bg-surface)",
                        color: priceRange === n ? "var(--status-liked)" : "var(--text-tertiary)",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => setPriceRange(priceRange === n ? null : n)}
                    >
                      {"$".repeat(n)}
                    </button>
                  ))}
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Location (optional)</label>
                  {location.trim() && (
                    <button
                      type="button"
                      className="btn btn-ghost geocode-btn"
                      onClick={handleGeocode}
                      disabled={geocoding}
                    >
                      {geocoding ? (
                        <span className="geocode-spinner" />
                      ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      )}
                      {geocoding ? "Locating..." : "Get Coordinates"}
                    </button>
                  )}
                </div>
                <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Downtown, 123 Main St" />
                {geocodeError && <div className="geocode-error">{geocodeError}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input className="form-input" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Auto-filled or manual" />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input className="form-input" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Auto-filled or manual" />
                </div>
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 14px",
                  marginBottom: 14,
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md, 10px)",
                  background: "var(--bg-subtle, var(--bg-surface))",
                }}
              >
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-tertiary)" }}>
                  <strong style={{ color: "var(--text-secondary)" }}>📸 Menu photo → JSON.</strong>{" "}
                  Copy this prompt into ChatGPT, Claude, or any AI chat, attach a photo of the menu,
                  and paste the JSON it returns below.
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCopyPrompt}
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {promptCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      Copy AI prompt
                    </>
                  )}
                </button>
              </div>
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
