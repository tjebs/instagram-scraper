import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS submissions (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at            TEXT NOT NULL,
  prosjekt              TEXT NOT NULL,
  ansatt                TEXT NOT NULL,
  avdeling              TEXT,
  dato_tid              TEXT NOT NULL,
  arbeidsadresse        TEXT,
  gps_lat               REAL,
  gps_lng               REAL,
  bilde_filnavn         TEXT,
  oppdrag_typer         TEXT NOT NULL DEFAULT '[]',
  oppdrag_innenfor      INTEGER NOT NULL DEFAULT 0,
  oppdrag_beskrivelse   TEXT,
  kompetanse            TEXT NOT NULL DEFAULT '[]',
  kompetanse_kommentar  TEXT,
  risiko                TEXT NOT NULL DEFAULT '[]',
  tiltak                TEXT,
  trygt                 INTEGER NOT NULL,
  diskutert             INTEGER NOT NULL DEFAULT 0,
  diskutert_kommentar   TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_ansatt   ON submissions (ansatt COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_submissions_prosjekt ON submissions (prosjekt COLLATE NOCASE);
`;

function createDb(): DatabaseSync {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const db = new DatabaseSync(path.join(DATA_DIR, "sja.db"));
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  return db;
}

// Cachet på globalThis så dev-serverens hot reload ikke åpner nye tilkoblinger.
const globalForDb = globalThis as unknown as { sjaDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (!globalForDb.sjaDb) {
    globalForDb.sjaDb = createDb();
  }
  return globalForDb.sjaDb;
}
