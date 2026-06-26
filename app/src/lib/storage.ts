import { promises as fs } from "fs";
import path from "path";
import type { RedisClientType } from "redis";
import { AppDoc } from "./appDoc";

// The single key under which the entire knowledge base is stored.
const STORE_KEY = "food-knowledge-db";

const isProd = process.env.NODE_ENV === "production";

// A Redis (TCP) connection string. Vercel's Redis integrations inject this as
// REDIS_URL (some also expose KV_URL). It is a redis:// or rediss:// URL.
const URL_VAR = process.env.REDIS_URL ? "REDIS_URL" : process.env.KV_URL ? "KV_URL" : null;
const REDIS_URL = URL_VAR ? process.env[URL_VAR] : undefined;
const useRedis = !!REDIS_URL;

// Diagnostics for /api/health — reports the active backend and which env var
// supplied the connection string, WITHOUT exposing the value.
export function storageInfo() {
  return {
    backend: useRedis ? "redis" : "file",
    configured: useRedis,
    urlVar: URL_VAR,
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}

// Open a fresh connection per operation. For a low-traffic personal app this is
// simpler and more reliable on serverless than caching a socket that can go
// stale between invocations.
async function withRedis<T>(fn: (client: RedisClientType) => Promise<T>): Promise<T> {
  const { createClient } = await import("redis");
  const client: RedisClientType = createClient({ url: REDIS_URL });
  // Prevent an emitted 'error' from crashing the process; surface via the
  // rejected connect()/command promise instead.
  client.on("error", () => {});
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.quit().catch(() => {});
  }
}

function localFilePath() {
  return path.join(process.cwd(), ".data", "store.json");
}

const NO_PERSISTENCE_MESSAGE =
  "No persistent database is configured. Connect a Redis database in Vercel " +
  "(Storage tab) so REDIS_URL is set in the project's environment, then redeploy.";

export async function readDoc(): Promise<AppDoc | null> {
  if (useRedis) {
    return withRedis(async (client) => {
      const raw = await client.get(STORE_KEY);
      return raw ? (JSON.parse(raw) as AppDoc) : null;
    });
  }
  // In production the local-file fallback is meaningless (read-only, ephemeral
  // filesystem), so don't pretend — let writes surface the real config error.
  if (isProd) return null;
  try {
    const raw = await fs.readFile(localFilePath(), "utf8");
    return JSON.parse(raw) as AppDoc;
  } catch {
    return null;
  }
}

export async function writeDoc(doc: AppDoc): Promise<void> {
  if (useRedis) {
    await withRedis(async (client) => {
      await client.set(STORE_KEY, JSON.stringify(doc));
    });
    return;
  }
  // Never silently "save" to a file the platform will discard. Fail loudly so
  // the client can warn the user instead of losing data.
  if (isProd) {
    throw new Error(NO_PERSISTENCE_MESSAGE);
  }
  const file = localFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(doc, null, 2), "utf8");
}
