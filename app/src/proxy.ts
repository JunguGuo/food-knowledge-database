import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, appPassword } from "@/lib/auth";

// Routes reachable without authentication.
const PUBLIC_PREFIXES = ["/login", "/api/login"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const pw = appPassword();
  if (!pw) return NextResponse.next(); // open when no password configured

  const authed = req.cookies.get(AUTH_COOKIE)?.value === pw;
  if (authed) return NextResponse.next();

  // Unauthenticated API calls get a 401 so the client can react; page
  // requests are redirected to the login screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
