import { DatabaseSync } from "node:sqlite";
import { config } from "../config/env.ts";

/** Open SQLite database, enable WAL mode, and ensure required tables exist. */
export function createDatabase(dbPath: string = config.dbPath): DatabaseSync {
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS passkeys (
      id TEXT PRIMARY KEY,
      public_key BLOB NOT NULL,
      counter INTEGER NOT NULL DEFAULT 0,
      transports TEXT NOT NULL DEFAULT '[]',
      name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

let defaultDb: DatabaseSync | null = null;

/** Lazily initialized default database instance for runtime use. */
export function getDb(): DatabaseSync {
  if (!defaultDb) {
    defaultDb = createDatabase(config.dbPath);
  }
  return defaultDb;
}
