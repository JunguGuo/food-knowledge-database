# Food Knowledge Database

A local-first personal food intelligence system for managing restaurant and menu item knowledge over time. Not a food delivery app — a personal database and decision companion for remembering restaurants, dishes, ratings, notes, and labels.

## What It Does

- Track restaurants and menu items you've tried across multiple cities
- Record ratings (1-5 stars), statuses (not tried/favorite/liked/neutral/avoid/want to try), notes, descriptions, tags, and prices
- Filter and search your knowledge by cuisine, label, rating, status, and more
- Dashboard with top-rated restaurants, best dishes, want-to-try items, and recent updates
- Import/export your entire database as JSON for backup and portability
- Bulk-add a restaurant with its full menu via JSON paste

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 with custom design tokens (see `globals.css`)
- **Maps:** Leaflet + react-leaflet with OpenStreetMap tiles (no API key required)
- **Persistence:** Browser localStorage (client-side only, no backend)
- **State Management:** React Context API (CityProvider, TagProvider)
- **Dev Server:** Turbopack (`next dev --turbopack`)

No external UI libraries, no backend, no database server. The entire app runs in the browser.

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app ships with seed data (7 restaurants, 29 menu items across Cleveland, Chicago, and New York) so the UI is populated on first launch.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve production build |

## Project Structure

```
app/src/
├── app/                        # Next.js pages (file-based routing)
│   ├── page.tsx                # Dashboard (/)
│   ├── restaurants/
│   │   ├── page.tsx            # Restaurant list (/restaurants)
│   │   └── [id]/page.tsx       # Restaurant detail (/restaurants/[id])
│   ├── menu-items/page.tsx     # Global menu items (/menu-items)
│   ├── settings/
│   │   ├── page.tsx            # Settings hub (/settings)
│   │   ├── tags/page.tsx       # Tag management (/settings/tags)
│   │   └── data/page.tsx       # Import/export (/settings/data)
│   ├── data/page.tsx           # Redirect to /settings/data
│   ├── layout.tsx              # Root layout with providers
│   └── globals.css             # Full design system
├── components/
│   ├── Sidebar.tsx             # Navigation sidebar with city selector
│   ├── RestaurantForm.tsx      # Add/edit restaurant modal (manual + JSON paste)
│   ├── MenuItemForm.tsx        # Add/edit menu item modal
│   ├── Rating.tsx              # RatingInput (interactive) + RatingDisplay (read-only)
│   ├── TagInput.tsx            # Tag input with autocomplete suggestions
│   ├── StatusBadge.tsx         # Menu item status indicator
│   ├── LabelPill.tsx           # Restaurant label with emoji
│   ├── RestaurantMap.tsx        # Interactive map view (Leaflet/OpenStreetMap)
│   ├── ConfirmDialog.tsx       # Delete confirmation modal
│   └── Toast.tsx               # Toast notification system
├── lib/
│   ├── types.ts                # TypeScript interfaces (Restaurant, MenuItem, AppData)
│   ├── store.ts                # CRUD operations + localStorage persistence
│   ├── seed.ts                 # Sample data for first launch
│   ├── cityContext.tsx          # City selection state
│   ├── tagContext.tsx           # Tag/label management state
│   └── utils.ts                # Helpers (timeAgo, etc.)
```

## Data Models

### Restaurant

| Field | Type | Notes |
|-------|------|-------|
| id | string | Auto-generated |
| name | string | Required |
| city | string | Used for city-based filtering |
| cuisineTags | string[] | e.g. Chinese, Thai, Szechuan |
| labels | string[] | e.g. Spicy, Comfort, Reliable |
| overallRating | number \| null | 1-5 scale |
| notes | string | Free-text impressions |
| location | string | Optional address/district |
| latitude | number \| null | GPS latitude for map view |
| longitude | number \| null | GPS longitude for map view |
| dateAdded | string | ISO timestamp |
| lastUpdated | string | ISO timestamp |

### MenuItem

| Field | Type | Notes |
|-------|------|-------|
| id | string | Auto-generated |
| restaurantId | string | Foreign key to Restaurant |
| name | string | Required |
| category | string | e.g. Main, Appetizer, Dim Sum |
| rating | number \| null | 1-5 scale |
| status | enum | `not_tried` \| `favorite` \| `liked` \| `neutral` \| `avoid` \| `want_to_try` |
| tags | string[] | e.g. Spicy, Comfort, Vegetarian |
| notes | string | Free-text |
| description | string | Detailed info about the dish (optional) |
| price | number \| null | Optional |
| dateAdded | string | ISO timestamp |
| lastUpdated | string | ISO timestamp |

## Features

### Dashboard (`/`)
- City switcher with tabs (All Cities, or filter by city)
- Summary cards: restaurant count, menu item count, favorites, want-to-try
- Top Rated Restaurants (by overall rating)
- Best Dishes (favorites and liked items, sorted by rating)
- Want to Try items
- Recently Updated restaurants

### Restaurants (`/restaurants`)
- Searchable, filterable card grid
- Filter by cuisine tag or label via chips
- Sort by highest rated, name, or recently updated
- **Map view** — toggle between card grid and interactive map (Leaflet + OpenStreetMap) showing restaurants with coordinates as markers; click a marker for a popup with name, rating, tags, and a link to the detail page
- Add Restaurant button opens modal with two modes:
  - **Manual Entry** — form with all fields including optional latitude/longitude for map placement; a **"Get Coordinates"** button appears next to the Location field and auto-fills lat/lng via OpenStreetMap Nominatim geocoding
  - **Paste JSON** — paste a full restaurant with menu items, with schema placeholder and real-time validation

### Restaurant Detail (`/restaurants/[id]`)
- Restaurant info summary with rating, tags, labels, notes
- Edit and delete restaurant
- **Two view modes for menu items:**
  - **List view** — table with columns for item, category, rating, status, tags, notes, and price
  - **Category view** — items grouped by category in a card grid with a sticky sidebar for quick navigation between categories; clicking a category scrolls to that section. Edit/delete actions appear as icon-only buttons (pen/trash) on hover in the bottom-right corner of each card
- Toggle between views via list/grid icons
- **Dropdown filters** for status, tags, and rating (minimum threshold, e.g. "4★+" shows 4- and 5-star items)
- Descriptions shown as subdued text on category view cards when available
- Add Menu Item button

### Menu Items (`/menu-items`)
- Global view of all menu items across restaurants
- **Dropdown filters** for status (all statuses from the data model) and tags (dynamically populated from items)
- Search across item name, notes, tags, and restaurant name
- Sort by rating, name, status, or recently updated
- Click-through to parent restaurant

### Settings (`/settings`)
- **Manage Tags** (`/settings/tags`) — add, rename, and delete cuisine tags, restaurant labels, and menu item tags with bulk rename across all records
- **Data Management** (`/settings/data`) — export full database as timestamped JSON file, import JSON with merge (skips duplicates)

### Sidebar
- Navigation links with item counts
- City selector dropdown
- Quick filters: Favorites, Avoid, Want to Try

## Data Persistence

All data is stored in `localStorage` under the key `food-knowledge-db`. A version key (`food-knowledge-db-version`) triggers a reset to seed data when the schema version is bumped.

City list and tag lists are stored in separate localStorage keys (`food-knowledge-cities`, `food-knowledge-city`, `food-knowledge-tags`).

### Import/Export

- **Export:** Downloads a `food-knowledge-backup-YYYY-MM-DD.json` file containing all restaurants and menu items
- **Import:** Merges incoming data by ID — existing records are preserved, new records are added

### JSON Paste (Add Restaurant)

The Add Restaurant modal supports pasting a JSON object with the restaurant and its menu items in one action. The textarea shows the expected schema as placeholder text and validates the input in real-time, showing specific error messages for format issues.

## Design Reference

The app's visual design is based on the prototype file `food-knowledge-db.html` in the project root. The implementation preserves:
- Layout structure (sidebar + main content)
- Spacing rhythm and typography scale (Newsreader for display, Outfit for body)
- Color palette (warm neutrals with gold accent)
- Card, form, and component styling
- Status colors (orange for favorite, green for liked, gray for neutral, light gray for not tried, red for avoid, blue for want-to-try)

## Design Decisions and Deviations from Original Spec

The following are intentional differences from the original build prompt:

1. **`city` field added to Restaurant model** — the original spec did not include a `city` field, but it was added to enable city-based filtering throughout the app (sidebar city selector, dashboard city switcher, restaurant grouping). This is a meaningful enhancement to the knowledge-base use case.

2. **localStorage instead of IndexedDB** — the spec preferred IndexedDB if easy but accepted localStorage for MVP. localStorage was chosen for simplicity and is sufficient for a personal database.

3. **Custom components instead of shadcn/ui** — the spec suggested shadcn/ui "only when they help support the existing prototype style." Custom components were built instead to closely match the prototype's design language without introducing a third-party design system.

4. **React Context instead of Zustand** — the spec mentioned Zustand as an option. React Context was chosen since the state management needs (city selection, tag lists) are straightforward.

5. **Dashboard omits explicit "Avoid" section** — the spec listed avoid items on the dashboard. These are accessible via the sidebar's "Avoid" quick filter (`/menu-items?status=avoid`) rather than a dedicated dashboard section, keeping the dashboard focused on positive/aspirational content.

6. **Filtering by rating** — the restaurant detail page includes a dedicated rating filter dropdown (minimum threshold) for menu items. The restaurants list page uses sort order for rating-based browsing.
