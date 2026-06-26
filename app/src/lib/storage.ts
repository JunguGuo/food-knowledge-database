import { promises as fs } from "fs";
import path from "path";
import { AppDoc } from "./appDoc";

// The single key under which the entire knowledge base is stored.
const STORE_KEY = "food-knowledge-db";

// Use Upstash Redis when its credentials are present (production / Vercel).
// Otherwise fall back to a local JSON file so the app runs with zero external
// setup during development.
const useUpstash = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function localFilePath() {
  return path.join(process.cwd(), ".data", "store.json");
}

export async function readDoc(): Promise<AppDoc | null> {
  if (useUpstash) {
    const redis = await getRedis();
    // @upstash/redis transparently JSON-deserializes objects.
    const doc = await redis.get<AppDoc>(STORE_KEY);
    return doc ?? null;
  }
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
  const file = localFilePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(doc, null, 2), "utf8");
}
