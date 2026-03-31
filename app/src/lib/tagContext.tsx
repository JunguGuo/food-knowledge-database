"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

const CUISINE_TAGS_KEY = "food-knowledge-cuisine-tags";
const RESTAURANT_LABELS_KEY = "food-knowledge-restaurant-labels";
const MENU_ITEM_TAGS_KEY = "food-knowledge-menu-item-tags";

interface TagContextType {
  cuisineTags: string[];
  restaurantLabels: string[];
  menuItemTags: string[];
  setCuisineTags: (tags: string[]) => void;
  setRestaurantLabels: (tags: string[]) => void;
  setMenuItemTags: (tags: string[]) => void;
}

const TagContext = createContext<TagContextType>({
  cuisineTags: DEFAULT_CUISINE_TAGS,
  restaurantLabels: DEFAULT_RESTAURANT_LABELS,
  menuItemTags: DEFAULT_MENU_ITEM_TAGS,
  setCuisineTags: () => {},
  setRestaurantLabels: () => {},
  setMenuItemTags: () => {},
});

export function TagProvider({ children }: { children: ReactNode }) {
  const [cuisineTags, setCuisineTagsState] = useState<string[]>(DEFAULT_CUISINE_TAGS);
  const [restaurantLabels, setRestaurantLabelsState] = useState<string[]>(DEFAULT_RESTAURANT_LABELS);
  const [menuItemTags, setMenuItemTagsState] = useState<string[]>(DEFAULT_MENU_ITEM_TAGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const ct = localStorage.getItem(CUISINE_TAGS_KEY);
      const rl = localStorage.getItem(RESTAURANT_LABELS_KEY);
      const mt = localStorage.getItem(MENU_ITEM_TAGS_KEY);
      if (ct) setCuisineTagsState(JSON.parse(ct));
      if (rl) setRestaurantLabelsState(JSON.parse(rl));
      if (mt) setMenuItemTagsState(JSON.parse(mt));
    } catch {}
    setHydrated(true);
  }, []);

  function setCuisineTags(tags: string[]) {
    setCuisineTagsState(tags);
    localStorage.setItem(CUISINE_TAGS_KEY, JSON.stringify(tags));
  }

  function setRestaurantLabels(tags: string[]) {
    setRestaurantLabelsState(tags);
    localStorage.setItem(RESTAURANT_LABELS_KEY, JSON.stringify(tags));
  }

  function setMenuItemTags(tags: string[]) {
    setMenuItemTagsState(tags);
    localStorage.setItem(MENU_ITEM_TAGS_KEY, JSON.stringify(tags));
  }

  if (!hydrated) return null;

  return (
    <TagContext.Provider value={{ cuisineTags, restaurantLabels, menuItemTags, setCuisineTags, setRestaurantLabels, setMenuItemTags }}>
      {children}
    </TagContext.Provider>
  );
}

export function useTagContext() {
  return useContext(TagContext);
}
