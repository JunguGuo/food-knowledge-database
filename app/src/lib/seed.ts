import { Restaurant, MenuItem } from "./types";

const now = new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const seedRestaurants: Restaurant[] = [
  // ── Cleveland ──────────────────────────────────────────────
  {
    id: "r1",
    name: "Szechuan House",
    city: "Cleveland",
    cuisineTags: ["Chinese", "Szechuan"],
    labels: ["Spicy", "Reliable", "Late Night", "Comfort"],
    overallRating: 5,
    notes: "Great for late-night comfort food. Dry pot is very reliable — the lamb version is the standout. Dumplings have improved since they changed suppliers. The cold appetizers are hit or miss; stick with the cucumber salad. Service is fast but not particularly warm. Good for groups.",
    location: "Chinatown, Cleveland",
    dateAdded: daysAgo(90),
    lastUpdated: daysAgo(0),
  },
  {
    id: "r4",
    name: "Noodle Project",
    city: "Cleveland",
    cuisineTags: ["Chinese"],
    labels: ["Comfort", "Reliable"],
    overallRating: 4,
    notes: "Would reorder the dumplings, skip the cold noodles. Xiao Long Bao is the star here.",
    location: "Ohio City, Cleveland",
    dateAdded: daysAgo(30),
    lastUpdated: daysAgo(5),
  },
  {
    id: "r6",
    name: "Thai Orchid",
    city: "Cleveland",
    cuisineTags: ["Thai"],
    labels: ["Delivery Risk"],
    overallRating: 3,
    notes: "Inconsistent quality. Green curry can be great or disappointing. Better for dine-in.",
    location: "Tremont, Cleveland",
    dateAdded: daysAgo(75),
    lastUpdated: daysAgo(14),
  },
  // ── Chicago ────────────────────────────────────────────────
  {
    id: "r2",
    name: "Bangkok Garden",
    city: "Chicago",
    cuisineTags: ["Thai"],
    labels: ["Spicy", "Good Value"],
    overallRating: 4,
    notes: "Curry was good but portion felt small. Tom Yum is consistently excellent. Pad Thai is fine but unremarkable.",
    location: "Wicker Park, Chicago",
    dateAdded: daysAgo(60),
    lastUpdated: daysAgo(3),
  },
  {
    id: "r5",
    name: "Golden Wok",
    city: "Chicago",
    cuisineTags: ["Chinese", "Cantonese"],
    labels: ["Good Value", "Late Night"],
    overallRating: 4,
    notes: "Excellent value, crispy items hold up well. Wonton soup is a safe default. Avoid the fried rice.",
    location: "Chinatown, Chicago",
    dateAdded: daysAgo(20),
    lastUpdated: daysAgo(1),
  },
  // ── New York ───────────────────────────────────────────────
  {
    id: "r3",
    name: "Yuzu Ramen",
    city: "New York",
    cuisineTags: ["Japanese", "Ramen"],
    labels: ["Delivery Risk"],
    overallRating: 5,
    notes: "Solid ramen, but broth gets too salty on delivery. Dine-in recommended. Gyoza is a must-order.",
    location: "East Village, New York",
    dateAdded: daysAgo(45),
    lastUpdated: daysAgo(3),
  },
  {
    id: "r7",
    name: "Joe's Shanghai",
    city: "New York",
    cuisineTags: ["Chinese", "Dim Sum"],
    labels: ["Comfort", "Reliable"],
    overallRating: 5,
    notes: "Legendary soup dumplings. Always a line but worth it. Order the crab and pork XLB — nothing else compares. Cash only.",
    location: "Flushing, New York",
    dateAdded: daysAgo(12),
    lastUpdated: daysAgo(2),
  },
];

export const seedMenuItems: MenuItem[] = [
  // Szechuan House (Cleveland)
  { id: "m1", restaurantId: "r1", name: "Dry Pot Lamb", category: "Main", rating: 5, status: "favorite", tags: ["Spicy"], notes: "The standout. Perfectly balanced heat.", price: 18.95, dateAdded: daysAgo(80), lastUpdated: daysAgo(0) },
  { id: "m2", restaurantId: "r1", name: "Mapo Tofu", category: "Main", rating: 4, status: "liked", tags: ["Spicy", "Comfort"], notes: "Numbing and satisfying. Good with rice.", price: 14.5, dateAdded: daysAgo(80), lastUpdated: daysAgo(5) },
  { id: "m3", restaurantId: "r1", name: "Pork Dumplings", category: "Appetizer", rating: 4, status: "liked", tags: ["Comfort"], notes: "Much improved. Wrapper thinner now.", price: 9.5, dateAdded: daysAgo(70), lastUpdated: daysAgo(10) },
  { id: "m4", restaurantId: "r1", name: "Cucumber Salad", category: "Appetizer", rating: 4, status: "liked", tags: [], notes: "Refreshing. Good starter for the table.", price: 7.0, dateAdded: daysAgo(70), lastUpdated: daysAgo(15) },
  { id: "m5", restaurantId: "r1", name: "Dan Dan Noodles", category: "Main", rating: 3, status: "neutral", tags: ["Spicy"], notes: "Decent but not their best. A bit oily.", price: 13.0, dateAdded: daysAgo(60), lastUpdated: daysAgo(20) },
  { id: "m6", restaurantId: "r1", name: "Crispy Eggplant", category: "Side", rating: 2, status: "avoid", tags: [], notes: "Greasy and soggy. Skip this one.", price: 11.0, dateAdded: daysAgo(50), lastUpdated: daysAgo(30) },
  { id: "m7", restaurantId: "r1", name: "Kung Pao Shrimp", category: "Main", rating: null, status: "want_to_try", tags: ["Spicy"], notes: "Recommended by regular. Try next visit.", price: 16.5, dateAdded: daysAgo(2), lastUpdated: daysAgo(2) },
  // Noodle Project (Cleveland)
  { id: "m16", restaurantId: "r4", name: "Xiao Long Bao", category: "Appetizer", rating: 4, status: "liked", tags: ["Comfort"], notes: "Delicate wrappers, rich broth. The star here.", price: 12.0, dateAdded: daysAgo(25), lastUpdated: daysAgo(5) },
  { id: "m17", restaurantId: "r4", name: "Cold Noodles", category: "Main", rating: 2, status: "avoid", tags: [], notes: "Bland and rubbery texture. Skip.", price: 11.0, dateAdded: daysAgo(25), lastUpdated: daysAgo(20) },
  { id: "m18", restaurantId: "r4", name: "Pork Buns", category: "Appetizer", rating: 4, status: "liked", tags: ["Comfort"], notes: "Fluffy and flavorful. Good starter.", price: 8.0, dateAdded: daysAgo(20), lastUpdated: daysAgo(10) },
  // Thai Orchid (Cleveland)
  { id: "m23", restaurantId: "r6", name: "Green Curry", category: "Main", rating: 3, status: "neutral", tags: ["Spicy"], notes: "Inconsistent. Can be great or disappointing.", price: 14.0, dateAdded: daysAgo(70), lastUpdated: daysAgo(14) },
  { id: "m24", restaurantId: "r6", name: "Pad See Ew", category: "Main", rating: 2, status: "avoid", tags: [], notes: "Too sweet and soggy noodles. Avoid.", price: 13.0, dateAdded: daysAgo(70), lastUpdated: daysAgo(30) },
  { id: "m25", restaurantId: "r6", name: "Spring Rolls", category: "Appetizer", rating: 3, status: "neutral", tags: [], notes: "Decent but generic. Nothing memorable.", price: 7.0, dateAdded: daysAgo(60), lastUpdated: daysAgo(25) },
  // Bangkok Garden (Chicago)
  { id: "m8", restaurantId: "r2", name: "Tom Yum Goong", category: "Soup", rating: 5, status: "favorite", tags: ["Spicy"], notes: "Consistently excellent. Perfect heat level.", price: 13.0, dateAdded: daysAgo(55), lastUpdated: daysAgo(3) },
  { id: "m9", restaurantId: "r2", name: "Pad Thai", category: "Main", rating: 3, status: "neutral", tags: [], notes: "Fine but unremarkable. Nothing special.", price: 14.0, dateAdded: daysAgo(55), lastUpdated: daysAgo(20) },
  { id: "m10", restaurantId: "r2", name: "Massaman Curry", category: "Main", rating: null, status: "want_to_try", tags: ["Spicy"], notes: "Heard good things. Next visit.", price: 15.5, dateAdded: daysAgo(5), lastUpdated: daysAgo(5) },
  { id: "m11", restaurantId: "r2", name: "Green Papaya Salad", category: "Appetizer", rating: 4, status: "liked", tags: ["Spicy"], notes: "Fresh and crunchy. Good kick.", price: 9.0, dateAdded: daysAgo(40), lastUpdated: daysAgo(10) },
  // Golden Wok (Chicago)
  { id: "m19", restaurantId: "r5", name: "Wonton Soup", category: "Soup", rating: 4, status: "liked", tags: ["Comfort", "Reliable"], notes: "Safe default. Always consistent.", price: 10.0, dateAdded: daysAgo(18), lastUpdated: daysAgo(1) },
  { id: "m20", restaurantId: "r5", name: "Crispy Duck Bao", category: "Appetizer", rating: null, status: "want_to_try", tags: [], notes: "On the list. Looks promising from other tables.", price: 12.5, dateAdded: daysAgo(2), lastUpdated: daysAgo(2) },
  { id: "m21", restaurantId: "r5", name: "Fried Rice", category: "Main", rating: 2, status: "avoid", tags: [], notes: "Greasy and bland. Not worth it.", price: 12.0, dateAdded: daysAgo(15), lastUpdated: daysAgo(10) },
  { id: "m22", restaurantId: "r5", name: "Salt & Pepper Squid", category: "Appetizer", rating: 4, status: "favorite", tags: [], notes: "Perfectly crispy. Great portion.", price: 13.0, dateAdded: daysAgo(15), lastUpdated: daysAgo(3) },
  // Yuzu Ramen (New York)
  { id: "m12", restaurantId: "r3", name: "Tonkotsu Special", category: "Main", rating: 4, status: "liked", tags: ["Comfort"], notes: "Rich and creamy. Dine-in only for best results.", price: 16.0, dateAdded: daysAgo(40), lastUpdated: daysAgo(3) },
  { id: "m13", restaurantId: "r3", name: "Gyoza", category: "Appetizer", rating: 4, status: "favorite", tags: [], notes: "Perfectly crispy. Must-order side.", price: 8.5, dateAdded: daysAgo(40), lastUpdated: daysAgo(7) },
  { id: "m14", restaurantId: "r3", name: "Spicy Tantanmen", category: "Main", rating: null, status: "want_to_try", tags: ["Spicy"], notes: "Looks promising. Popular with regulars.", price: 17.0, dateAdded: daysAgo(7), lastUpdated: daysAgo(7) },
  { id: "m15", restaurantId: "r3", name: "Chicken Karaage", category: "Appetizer", rating: 3, status: "neutral", tags: [], notes: "Average. Nothing special.", price: 9.0, dateAdded: daysAgo(30), lastUpdated: daysAgo(15) },
  // Joe's Shanghai (New York)
  { id: "m26", restaurantId: "r7", name: "Crab & Pork XLB", category: "Appetizer", rating: 5, status: "favorite", tags: ["Comfort"], notes: "Life-changing soup dumplings. The whole reason to come.", price: 11.5, dateAdded: daysAgo(10), lastUpdated: daysAgo(2) },
  { id: "m27", restaurantId: "r7", name: "Pork XLB", category: "Appetizer", rating: 5, status: "favorite", tags: ["Comfort"], notes: "Slightly more affordable than the crab version, still exceptional.", price: 8.5, dateAdded: daysAgo(10), lastUpdated: daysAgo(4) },
  { id: "m28", restaurantId: "r7", name: "Lion's Head Meatball", category: "Main", rating: 4, status: "liked", tags: ["Comfort"], notes: "Massive pork meatball braised in cabbage. Deeply satisfying.", price: 16.0, dateAdded: daysAgo(10), lastUpdated: daysAgo(6) },
  { id: "m29", restaurantId: "r7", name: "Pan-Fried Pork Buns", category: "Appetizer", rating: null, status: "want_to_try", tags: [], notes: "Saw someone else order these. Next time.", price: 7.0, dateAdded: daysAgo(2), lastUpdated: daysAgo(2) },
];
