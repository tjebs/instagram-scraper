import { CsvSheetSync } from "./csv";
import { GoogleSheetSync } from "./google";
import type { SheetSync } from "./types";

export type { SheetSync } from "./types";

// Velg implementasjon via miljøvariabelen SHEETS_SYNC ("csv" er default for PoC).
export function getSheetSync(): SheetSync {
  if (process.env.SHEETS_SYNC === "google") {
    return new GoogleSheetSync();
  }
  return new CsvSheetSync();
}
