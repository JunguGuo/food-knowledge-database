"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getRestaurants, getMenuItems } from "@/lib/store";
import { useCityContext } from "@/lib/cityContext";

export function Sidebar() {
  const pathname = usePathname();
  const { cities, selectedCity, setSelectedCity } = useCityContext();
  const [counts, setCounts] = useState({ restaurants: 0, menuItems: 0, favorites: 0, avoid: 0, wantToTry: 0 });
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    const restaurants = getRestaurants().filter((r) => !selectedCity || r.city === selectedCity);
    const allItems = getMenuItems();
    const restIds = new Set(restaurants.map((r) => r.id));
    const items = allItems.filter((i) => restIds.has(i.restaurantId));
    setCounts({
      restaurants: restaurants.length,
      menuItems: items.length,
      favorites: items.filter((i) => i.status === "favorite").length,
      avoid: items.filter((i) => i.status === "avoid").length,
      wantToTry: items.filter((i) => i.status === "want_to_try").length,
    });
  }, [pathname, selectedCity]);

  const navItems = [
    { href: "/", label: "Dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
    { href: "/restaurants", label: "Restaurants", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/></svg>, count: counts.restaurants },
    { href: "/menu-items", label: "Menu Items", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>, count: counts.menuItems },
    { href: "/settings", label: "Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ];

  const quickFilters = [
    { href: "/menu-items?status=favorite", label: "Favorites", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, count: counts.favorites },
    { href: "/menu-items?status=avoid", label: "Avoid", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, count: counts.avoid },
    { href: "/menu-items?status=want_to_try", label: "Want to Try", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, count: counts.wantToTry },
  ];

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const cityOptions = [{ value: null, label: "All Cities" }, ...cities.map((c) => ({ value: c, label: c }))];

  return (
    <nav className="sidebar">
      <Link href="/" className="sidebar-logo" style={{ textDecoration: "none" }}>
        <div className="sidebar-logo-icon">◈</div>
        <div className="sidebar-logo-text">Food Knowledge</div>
      </Link>

      {/* City selector */}
      <div className="sidebar-city">
        <div className="sidebar-city-label">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          City
        </div>
        <div className="sidebar-city-current" onClick={() => setCityOpen((o) => !o)}>
          <span className="sidebar-city-name">{selectedCity ?? "All Cities"}</span>
          <svg className={`sidebar-city-chevron${cityOpen ? " open" : ""}`} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {cityOpen && (
          <div className="sidebar-city-dropdown">
            {cityOptions.map(({ value, label }) => (
              <div
                key={label}
                className={`sidebar-city-option${selectedCity === value ? " active" : ""}`}
                onClick={() => { setSelectedCity(value); setCityOpen(false); }}
              >
                {label}
                {selectedCity === value && <span className="sidebar-city-option-check">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigate</div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-item${isActive(item.href) ? " active" : ""}`}>
            {item.icon}
            {item.label}
            {item.count !== undefined && <span className="nav-item-count">{item.count}</span>}
          </Link>
        ))}
        <div className="sidebar-section-label" style={{ marginTop: 12 }}>Quick Filters</div>
        {quickFilters.map((item) => (
          <Link key={item.href} href={item.href} className={`nav-item${isActive(item.href) ? " active" : ""}`}>
            {item.icon}
            {item.label}
            <span className="nav-item-count">{item.count}</span>
          </Link>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="sidebar-avatar">J</div>
          <div className="sidebar-profile-name">Jungu</div>
          <button
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.55, padding: 4, display: "flex" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
