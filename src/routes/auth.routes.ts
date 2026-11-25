import { Hono } from "hono";
import { config } from "../config/env.ts";
import { issueAndSendOtp, verifyOtp } from "../services/otp.service.ts";
import {
  clearLoginFailures,
  extractClientIp,
  getLockRemainingMinutes,
  recordLoginFailure,
} from "../services/rate-limit.service.ts";
import {
  createSessionToken,
  extractToken,
  isTokenValid,
  revokeToken,
  setSessionCookie,
} from "../services/session.service.ts";

export function createAuthRoutes(): Hono {
  const routes = new Hono();

  routes.post("/login", async (c) => {
    const ip = extractClientIp(c);
    const lockMins = getLockRemainingMinutes(ip);
    if (lockMins > 0) {
      return c.json({ error: `尝试次数过多，请 ${lockMins} 分钟后再试` }, 429);
    }

    const body = await c.req.json().catch(() => ({}));
    if (
      String(body.email || "").toLowerCase() !== config.toEmail.toLowerCase() ||
      body.password !== config.password
    ) {
      recordLoginFailure(ip);
      return c.json({ error: "邮箱或密码错误" }, 401);
    }

    clearLoginFailures(ip);
    const result = await issueAndSendOtp();
    if (!result.ok) {
      return c.json({ error: result.error }, 500);
    }
    return c.json(result.reuse ? { ok: true, reuse: true } : { ok: true });
  });

  routes.post("/verify", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = verifyOtp(body.code);
    if (!result.ok) {
      return c.json({ error: result.error }, 401);
    }

    const token = createSessionToken();
    setSessionCookie(c, token);
    return c.json({ ok: true, token });
  });

  routes.get("/verify-token", (c) => {
    const token = c.req.query("token") || "";
    if (!isTokenValid(token)) return c.json({ ok: false }, 401);
    return c.json({ ok: true });
  });

  routes.post("/logout", (c) => {
    const token = c.req.query("token") || extractToken(c);
    revokeToken(token);
    return c.json({ ok: true });
  });

  return routes;
}
