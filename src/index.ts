import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { config } from "./config/env.ts";
import { getDb } from "./db/client.ts";

// Ensure database is initialized before accepting requests
getDb();

const app = createApp();
serve({ fetch: app.fetch, port: config.port, hostname: config.host });
console.log(`auth-service on ${config.host}:${config.port}`);
