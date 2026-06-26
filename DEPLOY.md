# Deployment Guide

This app syncs your knowledge base to the cloud and gates access behind a
password. Hosting is on **Vercel**; the database is a single JSON document stored
in **Redis** (connected via a `REDIS_URL` connection string).

## Architecture

- **Frontend / API:** Next.js 16 on Vercel.
- **Database:** the entire knowledge base (restaurants, menu items, cities, tags)
  is stored as one JSON document under the key `food-knowledge-db` in Redis,
  accessed with `node-redis` over the `REDIS_URL` connection string.
  Last-write-wins — perfect for a single user across devices.
- **Auth:** one shared password (`APP_PASSWORD`). A `proxy` (middleware) redirects
  unauthenticated visitors to `/login` and 401s unauthenticated API calls.
- **Local dev:** if `REDIS_URL` is absent, the app falls back to a local file at
  `app/.data/store.json` so it runs with zero external setup.

Data flows through one document: the client loads it once on startup
(`GET /api/data`), holds it in memory, and debounce-saves the whole document
back (`PUT /api/data`) on every change. Each Redis operation opens a fresh
connection — simple and reliable on serverless for low-traffic personal use.

## One-time setup on Vercel

### 1. Create the Vercel project
1. Go to [vercel.com/new](https://vercel.com/new) and import
   `JunguGuo/food-knowledge-database`.
2. **Root Directory:** set to `app` (the Next.js app lives in the `app/` subfolder).
3. Framework preset auto-detects as **Next.js**. Leave build/output settings default.
4. Don't deploy yet — add the database and env vars first (steps 2–3).

### 2. Add a Redis database
1. In the Vercel project → **Storage** tab → **Create / Connect Database**.
2. Choose a **Redis** database (e.g. Upstash or Redis Cloud from the Marketplace).
   Make sure it's a **persistent** tier, not a RAM-only/cache tier.
3. Connecting it automatically injects **`REDIS_URL`** (a `redis://` or `rediss://`
   connection string) into the project's environment variables. The app reads
   `REDIS_URL` (or `KV_URL` as a fallback).

### 3. Set the password
1. Project → **Settings** → **Environment Variables**.
2. Add `APP_PASSWORD` = your chosen password, for all environments
   (Production, Preview, Development).

### 4. Deploy
Trigger a deploy (push to `master`, or click **Redeploy**). Once live, open the
URL, enter the password, and you're in. The seed data appears on first load and
becomes editable; every change is saved to Redis and follows you across devices.

### 5. Verify persistence
Log in, then visit **`/api/health`**. You want to see:

```json
{ "backend": "redis", "configured": true, "urlVar": "REDIS_URL", "canRead": true }
```

- `configured: true` + `canRead: true` → persistence is working. Add a
  restaurant, refresh, and confirm it survives the next deploy.
- `backend: "file"` / `configured: false` → `REDIS_URL` isn't reaching the
  environment you're testing. Re-check step 2 and that the variable is enabled
  for **Production**, then redeploy.

`/api/health` reports the backend and which env var supplied the connection
string, but never exposes the secret value.

## Moving your existing local data up

Browser data from before cloud sync (or entries added while persistence was
misconfigured) isn't uploaded automatically. To bring data over:

1. On the source, open **Settings → Data Management → Export as JSON**.
2. On the **deployed** app, open **Settings → Data Management → Choose JSON File**
   and import it. Records merge by ID.

## Environment variables reference

| Variable | Required | Purpose |
|---|---|---|
| `APP_PASSWORD` | Yes (prod) | Shared password gating the app. If unset, the app is left open. |
| `REDIS_URL` | Yes (prod) | Redis connection string (`redis://` or `rediss://`). `KV_URL` is also accepted. |

If `REDIS_URL` is unset, **in development** data is written to
`app/.data/store.json`; **in production** writes fail loudly (a 503 + an
in-app warning) rather than silently writing to Vercel's ephemeral filesystem.

## Local development

```bash
cd app
cp .env.example .env.local   # set APP_PASSWORD; leave REDIS_URL blank for file fallback
npm install
npm run dev
```

Open http://localhost:3000 and log in with your `APP_PASSWORD`.

To develop against the **real** production database locally, pull its env vars
first: `vercel env pull .env.development.local` (sets `REDIS_URL`), then
`npm run dev`.

## Notes & future upgrades

- **Concurrency:** writes save the whole document (last-write-wins). With a
  single user this is a non-issue. If you ever add other users, graduate to
  per-record writes and per-user keys (or a relational DB like Neon Postgres).
- **Backups:** the JSON export on the Data Management page is your portable
  backup. Export periodically for safety.
