import { Hono } from "hono";
import { extractToken, isTokenValid } from "../services/session.service.ts";
import { getPasskeyStatus } from "../services/webauthn.service.ts";
import { loginPage } from "../ui/login-page.ts";

export function createPageRoutes(): Hono {
  const routes = new Hono();

  routes.get("/login", (c) => {
    const loggedIn = isTokenValid(extractToken(c));
    const { hasPasskey } = getPasskeyStatus();
    return c.html(loginPage(loggedIn, hasPasskey));
  });

  routes.get("/health", (c) => c.json({ ok: true }));

  return routes;
}
