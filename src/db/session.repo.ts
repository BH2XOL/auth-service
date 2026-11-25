import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./client.ts";

export interface SessionRow {
  token?: string;
  expires_at: number;
}

/** Repository for session token persistence in SQLite. */
export function createSessionRepo(db: DatabaseSync = getDb()) {
  return {
    create(token: string, expiresAt: number): void {
      db.prepare("INSERT INTO sessions (token, expires_at) VALUES (?, ?)").run(token, expiresAt);
    },
    findExpiry(token: string): number | null {
      const row = db
        .prepare("SELECT expires_at FROM sessions WHERE token = ?")
        .get(token) as SessionRow | undefined;
      return row ? row.expires_at : null;
    },
    delete(token: string): void {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    },
  };
}
