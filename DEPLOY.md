# Deployment Guide

This app now syncs your knowledge base to the cloud and gates access behind a
password. Hosting is on **Vercel**; the database is a single JSON blob stored in
**Upstash Redis**.

## Architecture

- **Frontend / API:** Next.js 16 on Vercel.
- **Database:** the entire knowledge base (restaurants, menu items, cities, tags)
  is stored as one JSON document under the key `food-knowledge-db` in Upstash
  Redis. Last-write-wins — perfect for a single user across devices.
- **Auth:** one shared password (`APP_PASSWORD`). A `proxy` (middleware) redirects
  unauthenticated visitors to `/login` and 401s unauthenticated API calls.
- **Local dev:** if Upstash env vars are absent, the app falls back to a local
  file at `app/.data/store.json` so it runs with zero external setup.

Data flows through one document: the client loads it once on startup
(`GET /api/data`), holds it in memory, and debounce-saves the whole document
back (`PUT /api/data`) on every change.

## One-time setup on Vercel

### 1. Create the Vercel project
1. Go to [vercel.com/new](https://vercel.com/new) and import
   `JunguGuo/food-knowledge-database`.
2. **Root Directory:** set to `app` (the Next.js app lives in the `app/` subfolder).
3. Framework preset auto-detects as **Next.js**. Leave build/output settings default.
4. Don't deploy yet — add the database and env vars first (steps 2–3).

### 2. Add the Upstash Redis database
1. In the Vercel project → **Storage** tab → **Create / Connect Database**.
2. Choose **Upstash → Redis** (in the Marketplace). Create a free database.
3. Connecting it automatically injects `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` into the project's environment variables.

### 3. Set the password
1. Project → **Settings** → **Environment Variables**.
2. Add `APP_PASSWORD` = your chosen password, for all environments
   (Production, Preview, Development).

### 4. Deploy
Trigger a deploy (push to `master`, or click **Redeploy**). Once live, open the
URL, enter the password, and you're in. The seed data appears on first load and
becomes editable; every change is saved to Upstash and follows you across devices.

## Moving your existing local data up

Your current browser data isn't automatically uploaded (it lived in
`localStorage`). To bring it over:

1. On your **old** setup, open **Settings → Data Management → Export as JSON**.
2. On the **deployed** app, open **Settings → Data Management → Choose JSON File**
   and import it. Records merge by ID.

## Environment variables reference

| Variable | Required | Purpose |
|---|---|---|
| `APP_PASSWORD` | Yes (prod) | Shared password gating the app. If unset, the app is left open. |
| `UPSTASH_REDIS_REST_URL` | Yes (prod) | Upstash Redis REST endpoint. |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (prod) | Upstash Redis REST token. |

If `UPSTASH_*` are unset, data is written to `app/.data/store.json` instead —
fine for local dev, but **not** persistent on Vercel's serverless filesystem, so
set them in production.

## Local development

```bash
cd app
cp .env.example .env.local   # set APP_PASSWORD; leave UPSTASH_* blank for file fallback
npm install
npm run dev
```

Open http://localhost:3000 and log in with your `APP_PASSWORD`.

## Notes & future upgrades

- **Concurrency:** writes save the whole document (last-write-wins). With a
  single user this is a non-issue. If you ever add other users, graduate to
  per-record writes and per-user keys (or a relational DB like Neon Postgres).
- **Backups:** the JSON export on the Data Management page is your portable
  backup. Upstash also retains the single key; export periodically for safety.
