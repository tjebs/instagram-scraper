// PoC-implementasjon av SheetSync: skriver rader til en lokal CSV-fil med
// samme kolonner som det fremtidige Google-regnearket vil få.

import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "../db";
import type { Submission } from "../types";
import { SHEET_HEADERS, submissionToRow, type SheetSync } from "./types";

const CSV_PATH = path.join(DATA_DIR, "sheet-sync.csv");

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvLine(values: readonly string[]): string {
  return values.map(csvEscape).join(",") + "\r\n";
}

export class CsvSheetSync implements SheetSync {
  async appendSubmission(submission: Submission): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    let needsHeader = false;
    try {
      await fs.access(CSV_PATH);
    } catch {
      needsHeader = true;
    }
    const line =
      (needsHeader ? toCsvLine(SHEET_HEADERS) : "") +
      toCsvLine(submissionToRow(submission));
    await fs.appendFile(CSV_PATH, line, "utf-8");
  }
}
