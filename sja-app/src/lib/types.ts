// Domenetyper og alle norske labels for SJA-skjemaet.
// Dette er eneste kilde for sjekkboks-alternativer — brukes av skjema, admin og CSV-eksport.

export interface CheckOption {
  key: string;
  label: string;
  hint?: string;
}

export const OPPDRAG_TYPER: CheckOption[] = [
  { key: "arbeid_i_hoyden", label: "Arbeid i høyden (over 30 cm)" },
  { key: "bruk_av_stige", label: "Bruk av stige" },
  { key: "motorisert_verktoy", label: "Bruk av motorisert verktøy" },
  { key: "tunge_loft", label: "Tunge løft" },
  { key: "hagearbeid", label: "Hagearbeid" },
  { key: "snekring", label: "Snekring" },
  { key: "annet", label: "Annet" },
];

export const KOMPETANSE_PUNKTER: CheckOption[] = [
  { key: "forstaatt", label: "Har du forstått arbeidsoppgaven?" },
  { key: "kompetanse", label: "Har du nødvendig kompetanse/opplæring?" },
  { key: "verktoy", label: "Har du nødvendig verktøy?" },
  {
    key: "verneutstyr",
    label: "Har du nødvendig verneutstyr?",
    hint: "Vernesko, hansker, hørselsvern, vernebriller, hjelm eller annet nødvendig utstyr",
  },
];

export const RISIKO_PUNKTER: CheckOption[] = [
  { key: "fall", label: "Fall" },
  { key: "glatte_underlag", label: "Glatte underlag" },
  { key: "tunge_loft", label: "Tunge løft" },
  { key: "elektrisitet", label: "Elektrisitet" },
  { key: "kjemikalier", label: "Farlige kjemikalier, asbest etc." },
  { key: "verktoy_maskiner", label: "Verktøy/maskiner" },
  { key: "skade_person", label: "Fare for skade på medarbeider, kunde eller tredjeperson" },
  { key: "daarlig_tilkomst", label: "Dårlig tilkomst" },
  { key: "annet", label: "Annet" },
];

export function labelsFor(options: CheckOption[], keys: string[]): string[] {
  return keys.map((k) => options.find((o) => o.key === k)?.label ?? k);
}

export interface Submission {
  id: number;
  createdAt: string; // ISO 8601, servertid
  prosjekt: string; // Prosjektnr./Kundenavn
  ansatt: string;
  avdeling: string | null;
  datoTid: string; // klientens lokale dato/tid
  arbeidsadresse: string | null;
  gpsLat: number | null;
  gpsLng: number | null;
  bildeFilnavn: string | null;
  oppdragTyper: string[]; // nøkler fra OPPDRAG_TYPER
  oppdragInnenfor: boolean; // "innenfor det vi kan utføre"
  oppdragBeskrivelse: string | null;
  kompetanse: string[]; // nøkler fra KOMPETANSE_PUNKTER
  kompetanseKommentar: string | null;
  risiko: string[]; // nøkler fra RISIKO_PUNKTER
  tiltak: string | null;
  trygt: boolean; // Kan oppdraget utføres trygt?
  diskutert: boolean; // formidlet til andre på prosjektet
  diskutertKommentar: string | null;
}

export type SubmissionInput = Omit<Submission, "id" | "createdAt">;
