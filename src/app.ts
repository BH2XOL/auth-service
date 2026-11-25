import { Hono } from "hono";
import { createAuthRoutes } from "./routes/auth.routes.ts";
import { createPageRoutes } from "./routes/page.routes.ts";
import { createWebAuthnRoutes } from "./routes/webauthn.routes.ts";

/** Assemble the Hono application with all modular route groups. */
export function createApp(): Hono {
  const app = new Hono();
  app.route("/", createAuthRoutes());
  app.route("/", createWebAuthnRoutes());
  app.route("/", createPageRoutes());
  return app;
}
