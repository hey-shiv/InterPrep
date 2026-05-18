import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL?.trim();
const usingFallbackDatabase = !databaseUrl;

const client = createClient({
  url: databaseUrl || "file:/tmp/interprep-local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

let ready: Promise<void> | null = null;

export function isFallbackDatabase() {
  return usingFallbackDatabase;
}

export function ensureDatabaseReady() {
  if (!usingFallbackDatabase) return Promise.resolve();
  if (!ready) {
    ready = client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        role_id TEXT NOT NULL,
        role_title TEXT NOT NULL,
        candidate_name TEXT,
        resume_analysis TEXT,
        questions TEXT,
        metrics TEXT,
        verdict TEXT,
        shadow_questions TEXT,
        improvement_plan TEXT,
        status TEXT NOT NULL DEFAULT 'setup',
        created_at INTEGER,
        completed_at INTEGER
      )
    `).then(() => undefined);
  }
  return ready;
}
