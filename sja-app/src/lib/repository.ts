// Eneste fil som snakker SQL. Bytte til Postgres senere = skriv om denne fila
// (og db.ts), resten av appen bruker bare Submission-typene.

import { getDb } from "./db";
import type { Submission, SubmissionInput } from "./types";

// node:sqlite returnerer rader som null-prototype-objekter; vi typer dem løst her.
type Row = Record<string, string | number | null>;

function rowToSubmission(row: Row): Submission {
  return {
    id: row.id as number,
    createdAt: row.created_at as string,
    prosjekt: row.prosjekt as string,
    ansatt: row.ansatt as string,
    avdeling: (row.avdeling as string) ?? null,
    datoTid: row.dato_tid as string,
    arbeidsadresse: (row.arbeidsadresse as string) ?? null,
    gpsLat: (row.gps_lat as number) ?? null,
    gpsLng: (row.gps_lng as number) ?? null,
    bildeFilnavn: (row.bilde_filnavn as string) ?? null,
    oppdragTyper: JSON.parse((row.oppdrag_typer as string) || "[]"),
    oppdragInnenfor: row.oppdrag_innenfor === 1,
    oppdragBeskrivelse: (row.oppdrag_beskrivelse as string) ?? null,
    kompetanse: JSON.parse((row.kompetanse as string) || "[]"),
    kompetanseKommentar: (row.kompetanse_kommentar as string) ?? null,
    risiko: JSON.parse((row.risiko as string) || "[]"),
    tiltak: (row.tiltak as string) ?? null,
    trygt: row.trygt === 1,
    diskutert: row.diskutert === 1,
    diskutertKommentar: (row.diskutert_kommentar as string) ?? null,
  };
}

export function insertSubmission(input: SubmissionInput): Submission {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO submissions (
      created_at, prosjekt, ansatt, avdeling, dato_tid, arbeidsadresse,
      gps_lat, gps_lng, bilde_filnavn, oppdrag_typer, oppdrag_innenfor,
      oppdrag_beskrivelse, kompetanse, kompetanse_kommentar, risiko, tiltak,
      trygt, diskutert, diskutert_kommentar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    new Date().toISOString(),
    input.prosjekt,
    input.ansatt,
    input.avdeling,
    input.datoTid,
    input.arbeidsadresse,
    input.gpsLat,
    input.gpsLng,
    input.bildeFilnavn,
    JSON.stringify(input.oppdragTyper),
    input.oppdragInnenfor ? 1 : 0,
    input.oppdragBeskrivelse,
    JSON.stringify(input.kompetanse),
    input.kompetanseKommentar,
    JSON.stringify(input.risiko),
    input.tiltak,
    input.trygt ? 1 : 0,
    input.diskutert ? 1 : 0,
    input.diskutertKommentar,
  );
  return getSubmission(Number(result.lastInsertRowid))!;
}

export function getSubmission(id: number): Submission | null {
  const row = getDb()
    .prepare("SELECT * FROM submissions WHERE id = ?")
    .get(id) as Row | undefined;
  return row ? rowToSubmission(row) : null;
}

export function searchSubmissions(filter: {
  ansatt?: string;
  prosjekt?: string;
}): Submission[] {
  const clauses: string[] = [];
  const params: string[] = [];
  if (filter.ansatt) {
    clauses.push("ansatt LIKE ? COLLATE NOCASE");
    params.push(`%${filter.ansatt}%`);
  }
  if (filter.prosjekt) {
    clauses.push("prosjekt LIKE ? COLLATE NOCASE");
    params.push(`%${filter.prosjekt}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = getDb()
    .prepare(`SELECT * FROM submissions ${where} ORDER BY created_at DESC LIMIT 200`)
    .all(...params) as Row[];
  return rows.map(rowToSubmission);
}
