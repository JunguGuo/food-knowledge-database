"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getRestaurants, getMenuItems, createRestaurant, createMenuItem } from "@/lib/store";
import { useCityContext } from "@/lib/cityContext";
import { Restaurant, MenuItem } from "@/lib/types";
import { RatingDisplay } from "@/components/Rating";
import { LabelPill } from "@/components/LabelPill";
import { RestaurantForm } from "@/components/RestaurantForm";
import { showToast } from "@/components/Toast";
import { timeAgo } from "@/lib/utils";

type SortKey = "rating" | "name" | "updated";

export default function RestaurantsPage() {
  const { selectedCity } = useCityContext();
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [showForm, setShowForm] = useState(false);

  const reload = useCallback(() => {
    setAllRestaurants(getRestaurants());
    setMenuItems(getMenuItems());
  }, []);

  useEffect(() => { reload(); }, [reload, selectedCity]);

  // Apply city filter first
  const cityRestaurants = allRestaurants.filter((r) => !selectedCity || r.city === selectedCity);

  const allTags = Array.from(new Set(cityRestaurants.flatMap((r) => [...r.cuisineTags, ...r.labels])));
  const chips = ["All", ...allTags];

  let filtered = cityRestaurants.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTag !== "All") {
      const tags = [...r.cuisineTags, ...r.labels].map((t) => t.toLowerCase());
      if (!tags.includes(activeTag.toLowerCase())) return false;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortKey === "rating") return (b.overallRating ?? 0) - (a.overallRating ?? 0);
    if (sortKey === "name") return a.name.localeCompare(b.name);
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });

  const itemCounts = Object.fromEntries(
    allRestaurants.map((r) => [r.id, menuItems.filter((m) => m.restaurantId === r.id).length])
  );

  const cityLabel = selectedCity ? ` in ${selectedCity}` : "";

  return (
    <div className="screen">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">Restaurants</div>
          <div className="page-subtitle">{cityRestaurants.length} restaurants{cityLabel} in your knowledge base</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Restaurant
        </button>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {chips.map((c) => (
          <div key={c} className={`chip${activeTag === c ? " active" : ""}`} onClick={() => setActiveTag(c)}>{c}</div>
        ))}
        <div className="sort-dropdown" onClick={() => setSortKey(sortKey === "rating" ? "name" : sortKey === "name" ? "updated" : "rating")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          Sort: {sortKey === "rating" ? "Highest Rated" : sortKey === "name" ? "Name" : "Recently Updated"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <div className="empty-state-title">No restaurants found</div>
          <div className="empty-state-desc">{search || activeTag !== "All" ? "Try adjusting your search or filters" : `Add your first restaurant${cityLabel} to get started`}</div>
          {!search && activeTag === "All" && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add Restaurant</button>
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((r) => (
            <Link href={`/restaurants/${r.id}`} key={r.id} className="card">
              <div className="card-header">
                <div className="card-title">{r.name}</div>
                <RatingDisplay value={r.overallRating} showValue />
              </div>
              <div className="card-meta">
                {/* Show city badge only when viewing all cities */}
                {!selectedCity && <span className="city-badge">📍 {r.city}</span>}
                {r.cuisineTags.map((t) => <span key={t} className="tag">{t}</span>)}
                {r.labels.map((l) => <LabelPill key={l} label={l} />)}
              </div>
              <div className="card-note">{r.notes}</div>
              <div className="card-footer">
                <span>{itemCounts[r.id] || 0} items tracked</span>
                <span>Updated {timeAgo(r.lastUpdated)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <RestaurantForm
          defaultCity={selectedCity ?? undefined}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            createRestaurant(data);
            reload();
            setShowForm(false);
            showToast("Restaurant added");
          }}
          onSaveWithMenuItems={(data) => {
            const { menuItems: items, ...restData } = data;
            const newRestaurant = createRestaurant(restData);
            for (const item of items) {
              createMenuItem({ ...item, restaurantId: newRestaurant.id });
            }
            reload();
            setShowForm(false);
            showToast(`Restaurant added with ${items.length} menu item${items.length !== 1 ? "s" : ""}`);
          }}
        />
      )}
    </div>
  );
}
