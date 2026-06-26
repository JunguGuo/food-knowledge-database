"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getCuisineTagsStore,
  getRestaurantLabelsStore,
  getMenuItemTagsStore,
  setCuisineTagsStore,
  setRestaurantLabelsStore,
  setMenuItemTagsStore,
  subscribe,
} from "./store";

// Re-exported for backward compatibility; canonical defaults live in appDoc.
export {
  DEFAULT_CUISINE_TAGS,
  DEFAULT_RESTAURANT_LABELS,
  DEFAULT_MENU_ITEM_TAGS,
} from "./appDoc";

interface TagContextType {
  cuisineTags: string[];
  restaurantLabels: string[];
  menuItemTags: string[];
  setCuisineTags: (tags: string[]) => void;
  setRestaurantLabels: (tags: string[]) => void;
  setMenuItemTags: (tags: string[]) => void;
}

const TagContext = createContext<TagContextType>({
  cuisineTags: [],
  restaurantLabels: [],
  menuItemTags: [],
  setCuisineTags: () => {},
  setRestaurantLabels: () => {},
  setMenuItemTags: () => {},
});

export function TagProvider({ children }: { children: ReactNode }) {
  // The store is already hydrated by DataProvider before this mounts.
  const [cuisineTags, setCuisineTagsState] = useState<string[]>(() => getCuisineTagsStore());
  const [restaurantLabels, setRestaurantLabelsState] = useState<string[]>(() => getRestaurantLabelsStore());
  const [menuItemTags, setMenuItemTagsState] = useState<string[]>(() => getMenuItemTagsStore());

  useEffect(() => {
    // Keep tag lists in sync with store changes (e.g. data import).
    return subscribe(() => {
      setCuisineTagsState([...getCuisineTagsStore()]);
      setRestaurantLabelsState([...getRestaurantLabelsStore()]);
      setMenuItemTagsState([...getMenuItemTagsStore()]);
    });
  }, []);

  function setCuisineTags(tags: string[]) {
    setCuisineTagsState(tags);
    setCuisineTagsStore(tags);
  }

  function setRestaurantLabels(tags: string[]) {
    setRestaurantLabelsState(tags);
    setRestaurantLabelsStore(tags);
  }

  function setMenuItemTags(tags: string[]) {
    setMenuItemTagsState(tags);
    setMenuItemTagsStore(tags);
  }

  return (
    <TagContext.Provider
      value={{ cuisineTags, restaurantLabels, menuItemTags, setCuisineTags, setRestaurantLabels, setMenuItemTags }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTagContext() {
  return useContext(TagContext);
}
