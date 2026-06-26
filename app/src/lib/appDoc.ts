import { Restaurant, MenuItem } from "./types";
import { seedRestaurants, seedMenuItems } from "./seed";

// The single document that holds the entire knowledge base. Everything that
// should follow the user across devices lives here and is persisted as one
// JSON blob in the cloud store (see lib/storage.ts).
export interface AppDoc {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  cities: string[];
  cuisineTags: string[];
  restaurantLabels: string[];
  menuItemTags: string[];
}

export const DEFAULT_CITIES = ["Cleveland", "Chicago", "New York", "Los Angeles", "San Francisco"];

export const DEFAULT_CUISINE_TAGS = [
  "Chinese", "Thai", "Japanese", "Korean", "Italian", "Mexican",
  "American", "Indian", "Vietnamese", "Mediterranean", "French",
  "Greek", "Middle Eastern", "Sushi", "BBQ", "Seafood", "Pizza",
];

export const DEFAULT_RESTAURANT_LABELS = [
  "Spicy", "Comfort", "Reliable", "Late Night", "Date Night",
  "Casual", "Delivery", "Fine Dining", "Fast Casual", "Cheap Eats",
  "Takeout", "Vegetarian-friendly",
];

export const DEFAULT_MENU_ITEM_TAGS = [
  "Spicy", "Comfort", "Mild", "Vegetarian", "Vegan", "Gluten-free",
  "Crispy", "Rich", "Fresh", "Hearty", "Light", "Sweet", "Savory", "Umami",
];

// A fresh document populated with the sample data and default lists. Returned
// the first time a user (or a brand-new database) is read before anything has
// been saved.
export function buildSeedDoc(): AppDoc {
  return {
    restaurants: seedRestaurants,
    menuItems: seedMenuItems,
    cities: [...DEFAULT_CITIES],
    cuisineTags: [...DEFAULT_CUISINE_TAGS],
    restaurantLabels: [...DEFAULT_RESTAURANT_LABELS],
    menuItemTags: [...DEFAULT_MENU_ITEM_TAGS],
  };
}

// Fills in any missing fields so older/partial blobs (e.g. a JSON file that
// only contains restaurants + menuItems) still produce a complete document.
export function normalizeDoc(doc: Partial<AppDoc> | null | undefined): AppDoc {
  const seed = buildSeedDoc();
  return {
    restaurants: doc?.restaurants ?? seed.restaurants,
    menuItems: doc?.menuItems ?? seed.menuItems,
    cities: doc?.cities?.length ? doc.cities : seed.cities,
    cuisineTags: doc?.cuisineTags?.length ? doc.cuisineTags : seed.cuisineTags,
    restaurantLabels: doc?.restaurantLabels?.length ? doc.restaurantLabels : seed.restaurantLabels,
    menuItemTags: doc?.menuItemTags?.length ? doc.menuItemTags : seed.menuItemTags,
  };
}
