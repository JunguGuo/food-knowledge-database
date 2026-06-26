import { NextRequest, NextResponse } from "next/server";
import { readDoc, writeDoc } from "@/lib/storage";
import { buildSeedDoc, normalizeDoc } from "@/lib/appDoc";
import { AUTH_COOKIE, appPassword } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(req: NextRequest): boolean {
  const pw = appPassword();
  if (!pw) return true; // open when no password configured
  return req.cookies.get(AUTH_COOKIE)?.value === pw;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const doc = await readDoc();
  return NextResponse.json(doc ? normalizeDoc(doc) : buildSeedDoc());
}

export async function PUT(req: NextRequest) {
  if (!authed(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  if (!b || !Array.isArray(b.restaurants) || !Array.isArray(b.menuItems)) {
    return NextResponse.json({ error: "invalid document" }, { status: 400 });
  }
  await writeDoc(normalizeDoc(b));
  return NextResponse.json({ ok: true });
}
