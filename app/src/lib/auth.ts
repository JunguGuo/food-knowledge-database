// Cookie name holding the auth token. Kept in a tiny module so both the
// Node API routes and the Edge middleware can share the constant.
export const AUTH_COOKIE = "fkdb_auth";

// The app is gated by a single shared password (env APP_PASSWORD). If no
// password is configured the app is left open — convenient for local dev.
export function appPassword(): string | undefined {
  return process.env.APP_PASSWORD;
}
