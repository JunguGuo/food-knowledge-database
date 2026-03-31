export interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisineTags: string[];
  labels: string[];
  overallRating: number | null;
  notes: string;
  location: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  rating: number | null;
  status: "not_tried" | "favorite" | "liked" | "neutral" | "avoid" | "want_to_try";
  tags: string[];
  notes: string;
  description: string;
  price: number | null;
  dateAdded: string;
  lastUpdated: string;
}

export interface AppData {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
}

export type MenuItemStatus = MenuItem["status"];

export const STATUS_LABELS: Record<MenuItemStatus, string> = {
  not_tried: "Not Tried",
  favorite: "Favorite",
  liked: "Liked",
  neutral: "Neutral",
  avoid: "Avoid",
  want_to_try: "Want to Try",
};

export const STATUS_CLASSES: Record<MenuItemStatus, string> = {
  not_tried: "status-not-tried",
  favorite: "status-favorite",
  liked: "status-liked",
  neutral: "status-neutral",
  avoid: "status-avoid",
  want_to_try: "status-want-to-try",
};
