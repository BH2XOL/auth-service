import type { Context } from "hono";
import { config } from "../config/env.ts";

interface FailureRecord {
  count: number;
  lockUntil: number;
}

const loginFailures = new Map<string, FailureRecord>();

/** Extract client IP from reverse-proxy headers, defaulting to "local". */
export function extractClientIp(c: Context): string {
  const raw = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "local";
  return raw.split(",")[0].trim();
}

/** Return remaining lock minutes if the IP is currently locked out, otherwise 0. */
export function getLockRemainingMinutes(ip: string, now: number = Date.now()): number {
  const fail = loginFailures.get(ip);
  if (!fail || fail.lockUntil <= now) return 0;
  return Math.ceil((fail.lockUntil - now) / 60000);
}

/** Increment failure count for an IP and lock it after reaching maxLoginFailures. */
export function recordLoginFailure(ip: string, now: number = Date.now()): void {
  const fail = loginFailures.get(ip);
  const nextCount = (fail && fail.lockUntil <= now ? 0 : fail?.count || 0) + 1;
  loginFailures.set(ip, {
    count: nextCount,
    lockUntil: nextCount >= config.maxLoginFailures ? now + config.lockDurationMs : 0,
  });
}

/** Reset failure tracking for an IP after a successful password check. */
export function clearLoginFailures(ip: string): void {
  loginFailures.delete(ip);
}
