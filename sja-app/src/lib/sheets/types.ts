// Grensesnitt for synkronisering av innsendinger til et regneark.
// Databasen er alltid autoritativ — sync er en best-effort-kopi, og feil her
// skal aldri stoppe en innsending.

import {
  KOMPETANSE_PUNKTER,
  OPPDRAG_TYPER,
  RISIKO_PUNKTER,
  labelsFor,
  type Submission,
} from "../types";

export interface SheetSync {
  appendSubmission(submission: Submission): Promise<void>;
}

// Kolonnene slik de skal se ut i regnearket (CSV nå, Google Sheets senere).
export const SHEET_HEADERS = [
  "ID",
  "Registrert (server)",
  "Prosjektnr./Kundenavn",
  "Ansatt",
  "Avdeling",
  "Dato og klokkeslett",
  "Arbeidsadresse",
  "GPS",
  "Bilde",
  "Type oppdrag",
  "Innenfor det vi kan utføre",
  "Beskrivelse",
  "Kompetanse og utstyr",
  "Kommentar kompetanse",
  "Risiko",
  "Tiltak",
  "Kan utføres trygt",
  "Diskutert med andre",
  "Kommentar formidling",
] as const;

export function submissionToRow(s: Submission): string[] {
  return [
    String(s.id),
    s.createdAt,
    s.prosjekt,
    s.ansatt,
    s.avdeling ?? "",
    s.datoTid,
    s.arbeidsadresse ?? "",
    s.gpsLat != null && s.gpsLng != null ? `${s.gpsLat}, ${s.gpsLng}` : "",
    s.bildeFilnavn ?? "",
    labelsFor(OPPDRAG_TYPER, s.oppdragTyper).join("; "),
    s.oppdragInnenfor ? "Ja" : "Nei",
    s.oppdragBeskrivelse ?? "",
    labelsFor(KOMPETANSE_PUNKTER, s.kompetanse).join("; "),
    s.kompetanseKommentar ?? "",
    labelsFor(RISIKO_PUNKTER, s.risiko).join("; "),
    s.tiltak ?? "",
    s.trygt ? "Ja" : "Nei",
    s.diskutert ? "Ja" : "Nei",
    s.diskutertKommentar ?? "",
  ];
}
