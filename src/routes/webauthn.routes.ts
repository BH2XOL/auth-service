import { Hono } from "hono";
import { createSessionToken, extractToken, isTokenValid, setSessionCookie } from "../services/session.service.ts";
import {
  createLoginOptions,
  createRegistrationOptions,
  getPasskeyStatus,
  verifyAndSaveRegistration,
  verifyLoginAssertion,
} from "../services/webauthn.service.ts";

export function createWebAuthnRoutes(): Hono {
  const routes = new Hono();

  routes.get("/webauthn/status", (c) => {
    return c.json(getPasskeyStatus());
  });

  routes.post("/webauthn/register/options", async (c) => {
    if (!isTokenValid(extractToken(c))) {
      return c.json({ error: "请先登录后再绑定 Passkey" }, 401);
    }
    const options = await createRegistrationOptions();
    return c.json(options);
  });

  routes.post("/webauthn/register/verify", async (c) => {
    if (!isTokenValid(extractToken(c))) {
      return c.json({ error: "unauthorized" }, 401);
    }

    const body = await c.req.json().catch(() => ({}));
    const result = await verifyAndSaveRegistration(String(body.challengeId || ""), body.response, body.name);
    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }
    return c.json({ ok: true, id: result.id });
  });

  routes.post("/webauthn/login/options", async (c) => {
    const result = await createLoginOptions();
    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }
    return c.json(result.data);
  });

  routes.post("/webauthn/login/verify", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = await verifyLoginAssertion(String(body.challengeId || ""), body.response);
    if (!result.ok) {
      return c.json({ error: result.error }, result.status);
    }

    const token = createSessionToken();
    setSessionCookie(c, token);
    return c.json({ ok: true, token });
  });

  return routes;
}
