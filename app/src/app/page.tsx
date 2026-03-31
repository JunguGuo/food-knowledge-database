"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getRestaurants, getMenuItems } from "@/lib/store";
import { useCityContext } from "@/lib/cityContext";
import { Restaurant, MenuItem } from "@/lib/types";
import { RatingDisplay } from "@/components/Rating";
import { StatusBadge } from "@/components/StatusBadge";
import { timeAgo } from "@/lib/utils";

function CitySwitcher() {
  const { cities, selectedCity, setSelectedCity, addCity } = useCityContext();
  const [showAdd, setShowAdd] = useState(false);
  const [newCity, setNewCity] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAdd) inputRef.current?.focus();
  }, [showAdd]);

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newCity.trim()) {
      addCity(newCity.trim());
      setSelectedCity(newCity.trim());
    }
    setNewCity("");
    setShowAdd(false);
  }

  return (
    <div className="city-switcher">
      <div className="city-switcher-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        City
      </div>
      <div className="city-tabs">
        <button
          className={`city-tab${selectedCity === null ? " active" : ""}`}
          onClick={() => setSelectedCity(null)}
        >
          All Cities
        </button>
        {cities.map((city) => (
          <button
            key={city}
            className={`city-tab${selectedCity === city ? " active" : ""}`}
            onClick={() => setSelectedCity(city)}
          >
            {city}
          </button>
        ))}
        {showAdd ? (
          <form className="city-add-inline" onSubmit={handleAddSubmit}>
            <input
              ref={inputRef}
              className="city-add-input"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="City name…"
              onKeyDown={(e) => { if (e.key === "Escape") { setShowAdd(false); setNewCity(""); } }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 12 }}>Add</button>
            <button type="button" className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 12 }} onClick={() => { setShowAdd(false); setNewCity(""); }}>Cancel</button>
          </form>
        ) : (
          <button className="city-tab city-tab-add" onClick={() => setShowAdd(true)}>
            + Add City
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { selectedCity } = useCityContext();
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    setAllRestaurants(getRestaurants());
    setAllMenuItems(getMenuItems());
  }, [selectedCity]);

  const restaurants = allRestaurants.filter((r) => !selectedCity || r.city === selectedCity);
  const restIds = new Set(restaurants.map((r) => r.id));
  const menuItems = allMenuItems.filter((m) => restIds.has(m.restaurantId));

  const topRestaurants = [...restaurants]
    .filter((r) => r.overallRating !== null)
    .sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))
    .slice(0, 4);

  const bestDishes = [...menuItems]
    .filter((m) => m.status === "favorite" || m.status === "liked")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  const wantToTry = [...menuItems]
    .filter((m) => m.status === "want_to_try")
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 4);

  const recentlyUpdated = [...restaurants]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 4);

  const restaurantMap = Object.fromEntries(allRestaurants.map((r) => [r.id, r]));
  const favCount = menuItems.filter((m) => m.status === "favorite").length;
  const tryCount = menuItems.filter((m) => m.status === "want_to_try").length;
  const highRated = menuItems.filter((m) => m.rating !== null && m.rating >= 4).length;

  const cityLabel = selectedCity ? ` in ${selectedCity}` : "";

  return (
    <div className="screen">
      <CitySwitcher />

      <div className="dashboard-welcome">
        <h1>Good evening, <em>Jungu</em></h1>
        <p>Your food knowledge base{cityLabel} — {restaurants.length} restaurants, {menuItems.length} menu items tracked</p>
      </div>

      <div className="insight-grid">
        <div className="insight-card">
          <div className="insight-label">Restaurants</div>
          <div className="insight-value">{restaurants.length}</div>
          <div className="insight-sub">{restaurants.filter((r) => {
            const d = new Date(r.dateAdded);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          }).length} added this month</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Menu Items</div>
          <div className="insight-value">{menuItems.length}</div>
          <div className="insight-sub">{highRated} rated 4★+</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Favorites</div>
          <div className="insight-value">{favCount}</div>
          <div className="insight-sub">Across {new Set(menuItems.filter((m) => m.status === "favorite").map((m) => m.restaurantId)).size} restaurants</div>
        </div>
        <div className="insight-card">
          <div className="insight-label">Want to Try</div>
          <div className="insight-value">{tryCount}</div>
          <div className="insight-sub">{menuItems.filter((m) => m.status === "want_to_try" && Date.now() - new Date(m.dateAdded).getTime() < 7 * 86400000).length} added recently</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Top Rated Restaurants</div>
            <Link href="/restaurants" className="dash-section-link">View all →</Link>
          </div>
          {topRestaurants.length === 0 && <div style={{ padding: "12px 0", color: "var(--text-tertiary)", fontSize: 13 }}>No restaurants yet</div>}
          {topRestaurants.map((r, i) => (
            <Link href={`/restaurants/${r.id}`} key={r.id} className="dash-item" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="dash-item-rank">{i + 1}</div>
              <div className="dash-item-content">
                <div className="dash-item-name">{r.name}</div>
                <div className="dash-item-sub">{r.cuisineTags.join(" · ")} · {allMenuItems.filter((m) => m.restaurantId === r.id).length} items tracked</div>
              </div>
              <div className="dash-item-right">
                <RatingDisplay value={r.overallRating} showValue />
              </div>
            </Link>
          ))}
        </div>

        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Best Dishes</div>
            <Link href="/menu-items" className="dash-section-link">View all →</Link>
          </div>
          {bestDishes.length === 0 && <div style={{ padding: "12px 0", color: "var(--text-tertiary)", fontSize: 13 }}>No rated dishes yet</div>}
          {bestDishes.map((m, i) => (
            <div key={m.id} className="dash-item">
              <div className="dash-item-rank">{i + 1}</div>
              <div className="dash-item-content">
                <div className="dash-item-name">{m.name}</div>
                <div className="dash-item-sub">{restaurantMap[m.restaurantId]?.name}</div>
              </div>
              <div className="dash-item-right">
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
        </div>

        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Want to Try</div>
            <Link href="/menu-items?status=want_to_try" className="dash-section-link">View all →</Link>
          </div>
          {wantToTry.map((m) => (
            <div key={m.id} className="dash-item">
              <div className="dash-item-content">
                <div className="dash-item-name">{m.name}</div>
                <div className="dash-item-sub">{restaurantMap[m.restaurantId]?.name} · Added {timeAgo(m.dateAdded)}</div>
              </div>
              <div className="dash-item-right">
                <StatusBadge status={m.status} />
              </div>
            </div>
          ))}
          {wantToTry.length === 0 && (
            <div style={{ padding: "12px 0", color: "var(--text-tertiary)", fontSize: 13 }}>No items yet</div>
          )}
        </div>

        <div className="dash-section">
          <div className="dash-section-header">
            <div className="dash-section-title">Recently Updated Notes</div>
            <Link href="/restaurants" className="dash-section-link">View all →</Link>
          </div>
          {recentlyUpdated.length === 0 && <div style={{ padding: "12px 0", color: "var(--text-tertiary)", fontSize: 13 }}>No restaurants yet</div>}
          {recentlyUpdated.map((r) => (
            <Link href={`/restaurants/${r.id}`} key={r.id} className="dash-item" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="dash-item-content">
                <div className="dash-item-name">{r.name}</div>
                <div className="dash-item-sub" style={{ fontStyle: "italic" }}>
                  &ldquo;{r.notes.length > 60 ? r.notes.slice(0, 60) + "..." : r.notes}&rdquo;
                </div>
              </div>
              <div className="dash-item-right" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{timeAgo(r.lastUpdated)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
