"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getRestaurants, getMenuItems } from "@/lib/store";
import { useCityContext } from "@/lib/cityContext";
import { Restaurant, MenuItem, MenuItemStatus } from "@/lib/types";
import { RatingDisplay } from "@/components/Rating";
import { StatusBadge } from "@/components/StatusBadge";
import { LabelPill } from "@/components/LabelPill";

type SortKey = "rating" | "name" | "status";

function MenuItemsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as MenuItemStatus | null;
  const { selectedCity } = useCityContext();

  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<string>(
    initialStatus === "favorite" ? "Favorites Only"
    : initialStatus === "avoid" ? "Avoid"
    : initialStatus === "want_to_try" ? "Want to Try"
    : "All"
  );
  const [sortKey, setSortKey] = useState<SortKey>("rating");

  const reload = useCallback(() => {
    setAllRestaurants(getRestaurants());
    setAllMenuItems(getMenuItems());
  }, []);

  useEffect(() => { reload(); }, [reload, selectedCity]);

  // Apply city filter
  const restaurants = allRestaurants.filter((r) => !selectedCity || r.city === selectedCity);
  const restIds = new Set(restaurants.map((r) => r.id));
  const menuItems = allMenuItems.filter((m) => restIds.has(m.restaurantId));

  const restaurantMap = Object.fromEntries(allRestaurants.map((r) => [r.id, r]));

  const chips = ["All", "Favorites Only", "4★+ Rated", "Spicy", "Comfort", "Want to Try", "Avoid"];

  let filtered = menuItems.filter((m) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !m.name.toLowerCase().includes(q) &&
        !m.notes.toLowerCase().includes(q) &&
        !m.tags.some((t) => t.toLowerCase().includes(q)) &&
        !(restaurantMap[m.restaurantId]?.name.toLowerCase().includes(q))
      ) return false;
    }
    if (activeChip === "Favorites Only") return m.status === "favorite";
    if (activeChip === "4★+ Rated") return m.rating !== null && m.rating >= 4;
    if (activeChip === "Spicy") return m.tags.some((t) => t.toLowerCase().includes("spicy"));
    if (activeChip === "Comfort") return m.tags.some((t) => t.toLowerCase().includes("comfort"));
    if (activeChip === "Want to Try") return m.status === "want_to_try";
    if (activeChip === "Avoid") return m.status === "avoid";
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortKey === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    if (sortKey === "name") return a.name.localeCompare(b.name);
    const order: Record<MenuItemStatus, number> = { favorite: 0, liked: 1, neutral: 2, not_tried: 3, want_to_try: 4, avoid: 5 };
    return order[a.status] - order[b.status];
  });

  const cityLabel = selectedCity ? ` in ${selectedCity}` : "";

  return (
    <div className="screen">
      <div className="page-header">
        <div className="page-title">Menu Items</div>
        <div className="page-subtitle">{menuItems.length} items across {restaurants.length} restaurants{cityLabel}</div>
      </div>

      <div className="toolbar">
        <div className="search-field">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search all menu items..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {chips.map((c) => (
          <div key={c} className={`chip${activeChip === c ? " active" : ""}`} onClick={() => setActiveChip(activeChip === c ? "All" : c)}>{c}</div>
        ))}
        <div className="sort-dropdown" onClick={() => setSortKey(sortKey === "rating" ? "name" : sortKey === "name" ? "status" : "rating")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          Sort: {sortKey === "rating" ? "Rating" : sortKey === "name" ? "Name" : "Status"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍜</div>
          <div className="empty-state-title">No items found</div>
          <div className="empty-state-desc">Try adjusting your search or filters</div>
        </div>
      ) : (
        <div>
          {filtered.map((m) => (
            <Link href={`/restaurants/${m.restaurantId}`} key={m.id} className="global-item-row" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="global-item-name">{m.name}</div>
              <div className="global-item-restaurant">
                {restaurantMap[m.restaurantId]?.name}
                {!selectedCity && restaurantMap[m.restaurantId]?.city && (
                  <span style={{ marginLeft: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                    · {restaurantMap[m.restaurantId].city}
                  </span>
                )}
              </div>
              <div className="global-item-tags">
                {m.category && <span className="tag">{m.category}</span>}
                {m.tags.map((t) => <LabelPill key={t} label={t} />)}
              </div>
              <div className="global-item-note">{m.notes}</div>
              <div className="global-item-rating"><RatingDisplay value={m.rating} /></div>
              <div className="global-item-status"><StatusBadge status={m.status} /></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuItemsPage() {
  return (
    <Suspense fallback={<div className="screen"><div className="page-title">Loading...</div></div>}>
      <MenuItemsContent />
    </Suspense>
  );
}
