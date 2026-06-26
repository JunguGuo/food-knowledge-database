import { NextRequest, NextResponse } from "next/server";
import { readDoc, storageInfo } from "@/lib/storage";
import { AUTH_COOKIE, appPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(req: NextRequest): boolean {
  const pw = appPassword();
  if (!pw) return true;
  return req.cookies.get(AUTH_COOKIE)?.value === pw;
}

// Diagnostic endpoint: reports which storage backend is active and whether a
// live read succeeds — without exposing any secret values. Visit /api/health
// while logged in to confirm persistence is wired up.
export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const info = storageInfo();
  let canRead = false;
  let hasStoredDoc = false;
  let readError: string | null = null;
  try {
    const doc = await readDoc();
    canRead = true;
    hasStoredDoc = doc !== null;
  } catch (err) {
    readError = (err as Error).message;
  }

  return NextResponse.json({
    ...info,
    persistent: info.configured,
    canRead,
    hasStoredDoc,
    readError,
  });
}
