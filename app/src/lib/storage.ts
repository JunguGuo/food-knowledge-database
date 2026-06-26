import { promises as fs } from "fs";
import path from "path";
import { AppDoc } from "./appDoc";

// The single key under which the entire knowledge base is stored.
const STORE_KEY = "food-knowledge-db";

const isProd = process.env.NODE_ENV === "production";

// Credentials may arrive under different names depending on how the database
// was connected:
//   - Upstash directly:        UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   - Vercel KV / Marketplace: KV_REST_API_URL        / KV_REST_API_TOKEN
// Accept either so a naming mismatch doesn't silently disable persistence.
const URL_VAR = process.env.UPSTASH_REDIS_REST_URL
  ? "UPSTASH_REDIS_REST_URL"
  : process.env.KV_REST_API_URL
  ? "KV_REST_API_URL"
  : null;
const TOKEN_VAR = process.env.UPSTASH_REDIS_REST_TOKEN
  ? "UPSTASH_REDIS_REST_TOKEN"
  : process.env.KV_REST_API_TOKEN
  ? "KV_REST_API_TOKEN"
  : null;

const REDIS_URL = URL_VAR ? process.env[URL_VAR] : undefined;
const REDIS_TOKEN = TOKEN_VAR ? process.env[TOKEN_VAR] : undefined;

const useUpstash = !!(REDIS_URL && REDIS_TOKEN);

// Diagnostics for /api/health — reports the active backend and which env var
// names were found, WITHOUT exposing any secret values.
export function storageInfo() {
  return {
    backend: useUpstash ? "upstash" : "file",
    configured: useUpstash,
    urlVar: URL_VAR,
    tokenVar: TOKEN_VAR,
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

function localFilePath() {
  return path.join(process.cwd(), ".data", "store.json");
}

const NO_PERSISTENCE_MESSAGE =
  "No persistent database is configured. Set UPSTASH_REDIS_REST_URL and " +
  "UPSTASH_REDIS_REST_TOKEN (or KV_REST_API_URL / KV_REST_API_TOKEN) in the " +
  "Vercel project's Environment Variables, then redeploy.";

export async function readDoc(): Promise<AppDoc | null> {
  if (useUpstash) {
    const redis = await getRedis();
    // @upstash/redis transparently JSON-deserializes objects.
    const doc = await redis.get<AppDoc>(STORE_KEY);
    return doc ?? null;
  }
  // In production the local-file fallback is meaningless (read-only, ephemeral
  // filesystem), so don't pretend — just report "empty" and let writes surface
  // the real configuration error.
  if (isProd) return null;
  try {
    const raw = await fs.readFile(localFilePath(), "utf8");
    return JSON.parse(raw) as AppDoc;
  } catch {
    return null;
  }
}

export async function writeDoc(doc: AppDoc): Promise<void> {
  if (useUpstash) {
    const redis = await getRedis();
    await redis.set(STORE_KEY, doc);
    return;
  }
  // Never silently "save" to a file that the platform will discard. Fail loudly
  // so the client can warn the user instead of losing data.
  if (isProd) {
    throw new Error(NO_PERSISTENCE_MESSAGE);
  }
  const file = localFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(doc, null, 2), "utf8");
}
