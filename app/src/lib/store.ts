"use client";

import { Restaurant, MenuItem, AppData } from "./types";
import { seedRestaurants, seedMenuItems } from "./seed";

const STORAGE_KEY = "food-knowledge-db";
// Bump this when the data schema changes to force a reset to fresh seed data.
const DB_VERSION = 5;
const DB_VERSION_KEY = "food-knowledge-db-version";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadData(): AppData {
  if (typeof window === "undefined") {
    return { restaurants: seedRestaurants, menuItems: seedMenuItems };
  }
  const storedVersion = parseInt(localStorage.getItem(DB_VERSION_KEY) ?? "0");
  if (storedVersion < DB_VERSION) {
    const initial: AppData = { restaurants: seedRestaurants, menuItems: seedMenuItems };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    localStorage.setItem(DB_VERSION_KEY, String(DB_VERSION));
    return initial;
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial: AppData = { restaurants: seedRestaurants, menuItems: seedMenuItems };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Restaurants
export function getRestaurants(): Restaurant[] {
  return loadData().restaurants;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return loadData().restaurants.find((r) => r.id === id);
}

export function createRestaurant(input: Omit<Restaurant, "id" | "dateAdded" | "lastUpdated">): Restaurant {
  const data = loadData();
  const now = new Date().toISOString();
  const restaurant: Restaurant = { ...input, id: generateId(), dateAdded: now, lastUpdated: now };
  data.restaurants.push(restaurant);
  saveData(data);
  return restaurant;
}

export function updateRestaurant(id: string, updates: Partial<Omit<Restaurant, "id" | "dateAdded">>): Restaurant | undefined {
  const data = loadData();
  const idx = data.restaurants.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  data.restaurants[idx] = { ...data.restaurants[idx], ...updates, lastUpdated: new Date().toISOString() };
  saveData(data);
  return data.restaurants[idx];
}

export function deleteRestaurant(id: string): boolean {
  const data = loadData();
  const before = data.restaurants.length;
  data.restaurants = data.restaurants.filter((r) => r.id !== id);
  data.menuItems = data.menuItems.filter((m) => m.restaurantId !== id);
  saveData(data);
  return data.restaurants.length < before;
}

// Menu Items
export function getMenuItems(): MenuItem[] {
  return loadData().menuItems;
}

export function getMenuItemsByRestaurant(restaurantId: string): MenuItem[] {
  return loadData().menuItems.filter((m) => m.restaurantId === restaurantId);
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return loadData().menuItems.find((m) => m.id === id);
}

export function createMenuItem(input: Omit<MenuItem, "id" | "dateAdded" | "lastUpdated">): MenuItem {
  const data = loadData();
  const now = new Date().toISOString();
  const item: MenuItem = { ...input, id: generateId(), dateAdded: now, lastUpdated: now };
  data.menuItems.push(item);
  saveData(data);
  return item;
}

export function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, "id" | "dateAdded">>): MenuItem | undefined {
  const data = loadData();
  const idx = data.menuItems.findIndex((m) => m.id === id);
  if (idx === -1) return undefined;
  data.menuItems[idx] = { ...data.menuItems[idx], ...updates, lastUpdated: new Date().toISOString() };
  saveData(data);
  return data.menuItems[idx];
}

export function deleteMenuItem(id: string): boolean {
  const data = loadData();
  const before = data.menuItems.length;
  data.menuItems = data.menuItems.filter((m) => m.id !== id);
  saveData(data);
  return data.menuItems.length < before;
}

// Bulk tag rename
export function renameTagInRestaurants(field: "cuisineTags" | "labels", oldTag: string, newTag: string) {
  const data = loadData();
  let changed = 0;
  for (const r of data.restaurants) {
    const idx = r[field].indexOf(oldTag);
    if (idx !== -1) {
      r[field][idx] = newTag;
      changed++;
    }
  }
  if (changed > 0) saveData(data);
  return changed;
}

export function renameTagInMenuItems(oldTag: string, newTag: string) {
  const data = loadData();
  let changed = 0;
  for (const m of data.menuItems) {
    const idx = m.tags.indexOf(oldTag);
    if (idx !== -1) {
      m.tags[idx] = newTag;
      changed++;
    }
  }
  if (changed > 0) saveData(data);
  return changed;
}

// Import / Export
export function exportData(): AppData {
  return loadData();
}

export function importData(incoming: AppData, mode: "replace" | "merge" = "merge") {
  if (mode === "replace") {
    saveData(incoming);
    return;
  }
  const data = loadData();
  const existingRestIds = new Set(data.restaurants.map((r) => r.id));
  const existingItemIds = new Set(data.menuItems.map((m) => m.id));
  for (const r of incoming.restaurants) {
    if (!existingRestIds.has(r.id)) data.restaurants.push(r);
  }
  for (const m of incoming.menuItems) {
    if (!existingItemIds.has(m.id)) data.menuItems.push(m);
  }
  saveData(data);
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DB_VERSION_KEY);
}
