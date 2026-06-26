"use client";

import { Restaurant, MenuItem, AppData } from "./types";
import { AppDoc, buildSeedDoc, normalizeDoc } from "./appDoc";

// ---------------------------------------------------------------------------
// In-memory document cache.
//
// The whole knowledge base lives in `cache` as a single object. The app is
// gated on initial load (see DataProvider) so by the time any page renders the
// cache has been hydrated from the cloud. Reads stay synchronous — exactly the
// API the UI was written against — and every write schedules a debounced PUT
// that persists the full document back to the server.
// ---------------------------------------------------------------------------

let cache: AppDoc = buildSeedDoc();
let hydrated = false;
const listeners = new Set<() => void>();

export function hydrate(doc: Partial<AppDoc>) {
  cache = normalizeDoc(doc);
  hydrated = true;
  emit();
}

export function isHydrated(): boolean {
  return hydrated;
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit() {
  for (const fn of listeners) fn();
}

// --- Persistence (debounced) ----------------------------------------------

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pending = false;

function persist() {
  emit();
  pending = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 400);
}

async function flush() {
  saveTimer = null;
  if (!pending) return;
  pending = false;
  try {
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cache),
    });
  } catch {
    // Network hiccup — mark dirty again so the next change retries.
    pending = true;
  }
}

// Best-effort flush when the tab is hidden/closed so a quick edit isn't lost
// inside the debounce window.
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    if (!pending) return;
    pending = false;
    try {
      navigator.sendBeacon(
        "/api/data",
        new Blob([JSON.stringify(cache)], { type: "application/json" })
      );
    } catch {
      /* ignore */
    }
  });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Restaurants
export function getRestaurants(): Restaurant[] {
  return cache.restaurants;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return cache.restaurants.find((r) => r.id === id);
}

export function createRestaurant(input: Omit<Restaurant, "id" | "dateAdded" | "lastUpdated">): Restaurant {
  const now = new Date().toISOString();
  const restaurant: Restaurant = { ...input, id: generateId(), dateAdded: now, lastUpdated: now };
  cache.restaurants.push(restaurant);
  persist();
  return restaurant;
}

export function updateRestaurant(id: string, updates: Partial<Omit<Restaurant, "id" | "dateAdded">>): Restaurant | undefined {
  const idx = cache.restaurants.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  cache.restaurants[idx] = { ...cache.restaurants[idx], ...updates, lastUpdated: new Date().toISOString() };
  persist();
  return cache.restaurants[idx];
}

export function deleteRestaurant(id: string): boolean {
  const before = cache.restaurants.length;
  cache.restaurants = cache.restaurants.filter((r) => r.id !== id);
  cache.menuItems = cache.menuItems.filter((m) => m.restaurantId !== id);
  persist();
  return cache.restaurants.length < before;
}

// Menu Items
export function getMenuItems(): MenuItem[] {
  return cache.menuItems;
}

export function getMenuItemsByRestaurant(restaurantId: string): MenuItem[] {
  return cache.menuItems.filter((m) => m.restaurantId === restaurantId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return cache.menuItems.find((m) => m.id === id);
}

export function createMenuItem(input: Omit<MenuItem, "id" | "dateAdded" | "lastUpdated">): MenuItem {
  const now = new Date().toISOString();
  const item: MenuItem = { ...input, id: generateId(), dateAdded: now, lastUpdated: now };
  cache.menuItems.push(item);
  persist();
  return item;
}

export function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, "id" | "dateAdded">>): MenuItem | undefined {
  const idx = cache.menuItems.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  cache.menuItems[idx] = { ...cache.menuItems[idx], ...updates, lastUpdated: new Date().toISOString() };
  persist();
  return cache.menuItems[idx];
}

export function deleteMenuItem(id: string): boolean {
  const before = cache.menuItems.length;
  cache.menuItems = cache.menuItems.filter((m) => m.id !== id);
  persist();
  return cache.menuItems.length < before;
}

// City list (synced as part of the document)
export function getCities(): string[] {
  return cache.cities;
}

export function setCitiesStore(cities: string[]) {
  cache.cities = cities;
  persist();
}

// Tag lists (synced as part of the document)
export function getCuisineTagsStore(): string[] {
  return cache.cuisineTags;
}
export function getRestaurantLabelsStore(): string[] {
  return cache.restaurantLabels;
}
export function getMenuItemTagsStore(): string[] {
  return cache.menuItemTags;
}
export function setCuisineTagsStore(tags: string[]) {
  cache.cuisineTags = tags;
  persist();
}
export function setRestaurantLabelsStore(tags: string[]) {
  cache.restaurantLabels = tags;
  persist();
}
export function setMenuItemTagsStore(tags: string[]) {
  cache.menuItemTags = tags;
  persist();
}

// Bulk tag rename
export function renameTagInRestaurants(field: "cuisineTags" | "labels", oldTag: string, newTag: string) {
  let changed = 0;
  for (const r of cache.restaurants) {
    const idx = r[field].indexOf(oldTag);
    if (idx !== -1) {
      r[field][idx] = newTag;
      changed++;
    }
  }
  if (changed > 0) persist();
  return changed;
}

export function renameTagInMenuItems(oldTag: string, newTag: string) {
  let changed = 0;
  for (const m of cache.menuItems) {
    const idx = m.tags.indexOf(oldTag);
    if (idx !== -1) {
      m.tags[idx] = newTag;
      changed++;
    }
  }
  if (changed > 0) persist();
  return changed;
}

// Import / Export
export function exportData(): AppData {
  return { restaurants: cache.restaurants, menuItems: cache.menuItems };
}

export function importData(incoming: AppData, mode: "replace" | "merge" = "merge") {
  if (mode === "replace") {
    cache.restaurants = incoming.restaurants;
    cache.menuItems = incoming.menuItems;
    persist();
    return;
  }
  const existingRestIds = new Set(cache.restaurants.map((r) => r.id));
  const existingItemIds = new Set(cache.menuItems.map((m) => m.id));
  for (const r of incoming.restaurants) {
    if (!existingRestIds.has(r.id)) cache.restaurants.push(r);
  }
  for (const m of incoming.menuItems) {
    if (!existingItemIds.has(m.id)) cache.menuItems.push(m);
  }
  persist();
}

export function clearAllData() {
  cache = buildSeedDoc();
  persist();
}
