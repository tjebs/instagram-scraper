// Skjelett for ekte Google Sheets-synkronisering. Ikke i bruk i PoC-en.
//
// For å ta denne i bruk:
//   1. Opprett en service account i Google Cloud Console og last ned JSON-nøkkelen.
//   2. Del regnearket med service-kontoens e-postadresse (redigeringstilgang).
//   3. `npm install googleapis`
//   4. Sett miljøvariablene:
//        SHEETS_SYNC=google
//        GOOGLE_APPLICATION_CREDENTIALS=/sti/til/service-account.json
//        SHEETS_SPREADSHEET_ID=<id fra regnearkets URL>
//   5. Implementer appendSubmission omtrent slik:
//
//        const auth = new google.auth.GoogleAuth({
//          scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//        });
//        const sheets = google.sheets({ version: "v4", auth });
//        await sheets.spreadsheets.values.append({
//          spreadsheetId: process.env.SHEETS_SPREADSHEET_ID,
//          range: "A1",
//          valueInputOption: "RAW",
//          requestBody: { values: [submissionToRow(submission)] },
//        });
//
// Radformatet (submissionToRow / SHEET_HEADERS) er identisk med CSV-stubben,
// så regnearket får nøyaktig samme kolonner.

import type { Submission } from "../types";
import type { SheetSync } from "./types";

export class GoogleSheetSync implements SheetSync {
  async appendSubmission(_submission: Submission): Promise<void> {
    throw new Error(
      "GoogleSheetSync er ikke implementert i PoC-en. Se kommentarene i denne fila.",
    );
  }
}
