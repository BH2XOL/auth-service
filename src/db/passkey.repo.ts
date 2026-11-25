import type { DatabaseSync } from "node:sqlite";
import { getDb } from "./client.ts";

export interface PasskeyRow {
  id: string;
  public_key: Uint8Array;
  counter: number;
  transports: string;
  name: string;
  created_at: string;
}

export interface PasskeySummary {
  id: string;
  transports: string;
}

export interface UpsertPasskeyInput {
  id: string;
  publicKey: Uint8Array;
  counter: number;
  transports: string;
  name: string;
  createdAt: string;
}

/** Repository for WebAuthn passkey credentials in SQLite. */
export function createPasskeyRepo(db: DatabaseSync = getDb()) {
  return {
    count(): number {
      const row = db.prepare("SELECT COUNT(*) AS cnt FROM passkeys").get() as { cnt: number };
      return row.cnt;
    },
    listSummaries(): PasskeySummary[] {
      return db.prepare("SELECT id, transports FROM passkeys").all() as unknown as PasskeySummary[];
    },
    findById(id: string): PasskeyRow | undefined {
      return db.prepare("SELECT * FROM passkeys WHERE id = ?").get(id) as PasskeyRow | undefined;
    },
    upsert(input: UpsertPasskeyInput): void {
      db.prepare(`
        INSERT OR REPLACE INTO passkeys (id, public_key, counter, transports, name, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        input.id,
        Buffer.from(input.publicKey),
        input.counter,
        input.transports,
        input.name,
        input.createdAt
      );
    },
    updateCounter(id: string, counter: number): void {
      db.prepare("UPDATE passkeys SET counter = ? WHERE id = ?").run(counter, id);
    },
  };
}
