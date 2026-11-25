import { randomBytes } from "node:crypto";
import type { Context } from "hono";
import { config } from "../config/env.ts";
import { createSessionRepo } from "../db/session.repo.ts";

/** Create and persist a new 7-day session token. */
export function createSessionToken(repo = createSessionRepo()): string {
  const token = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + config.sessionTtlMs;
  repo.create(token, expiresAt);
  return token;
}

/** Check whether a session token exists and has not expired (deleting expired tokens). */
export function isTokenValid(token: string, repo = createSessionRepo()): boolean {
  if (!token) return false;
  const expiresAt = repo.findExpiry(token);
  if (expiresAt === null) return false;
  if (expiresAt < Date.now()) {
    repo.delete(token);
    return false;
  }
  return true;
}

/** Revoke a session token if non-empty. */
export function revokeToken(token: string, repo = createSessionRepo()): void {
  if (token) repo.delete(token);
}

/** Extract Bearer token from Authorization header or admin_token cookie. */
export function extractToken(c: Context): string {
  const auth = c.req.header("Authorization") || "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i);
  if (bearer) return bearer[1].trim();
  const cookie = c.req.header("Cookie") || "";
  const m = cookie.match(/admin_token=([^;]+)/);
  return m ? m[1].trim() : "";
}

/** Set the cross-subdomain HttpOnly session cookie on the response. */
export function setSessionCookie(c: Context, token: string): void {
  const { name, domain, maxAgeSec } = config.cookie;
  c.header(
    "Set-Cookie",
    `${name}=${token}; Domain=${domain}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAgeSec}`
  );
}
