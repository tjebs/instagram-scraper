import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/db";
import { insertSubmission, searchSubmissions } from "@/lib/repository";
import { getSheetSync } from "@/lib/sheets";
import type { SubmissionInput } from "@/lib/types";

const MAX_BILDE_BYTES = 10 * 1024 * 1024;
const TILLATTE_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic"]);

function str(form: FormData, key: string): string | null {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

function jsonArray(form: FormData, key: string): string[] {
  const raw = str(form, key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function num(form: FormData, key: string): number | null {
  const raw = str(form, key);
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function lagreBilde(form: FormData): Promise<string | null> {
  const fil = form.get("bilde");
  if (!(fil instanceof File) || fil.size === 0) return null;
  if (fil.size > MAX_BILDE_BYTES) {
    throw new Error("Bildet er for stort (maks 10 MB).");
  }
  const ext = (fil.name.split(".").pop() ?? "").toLowerCase();
  if (!TILLATTE_EXT.has(ext)) {
    throw new Error("Ugyldig bildeformat. Tillatt: jpg, jpeg, png, webp, heic.");
  }
  const filnavn = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(
    path.join(UPLOADS_DIR, filnavn),
    Buffer.from(await fil.arrayBuffer()),
  );
  return filnavn;
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Forventet multipart/form-data." },
      { status: 400 },
    );
  }

  const prosjekt = str(form, "prosjekt");
  const ansatt = str(form, "ansatt");
  const trygtRaw = str(form, "trygt");
  const mangler: string[] = [];
  if (!prosjekt) mangler.push("prosjekt");
  if (!ansatt) mangler.push("ansatt");
  if (trygtRaw === null) mangler.push("trygt");
  if (mangler.length) {
    return NextResponse.json(
      { error: `Påkrevde felt mangler: ${mangler.join(", ")}.` },
      { status: 400 },
    );
  }

  let bildeFilnavn: string | null = null;
  try {
    bildeFilnavn = await lagreBilde(form);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Kunne ikke lagre bildet." },
      { status: 400 },
    );
  }

  const input: SubmissionInput = {
    prosjekt: prosjekt!,
    ansatt: ansatt!,
    avdeling: str(form, "avdeling"),
    datoTid: str(form, "dato_tid") ?? new Date().toLocaleString("nb-NO"),
    arbeidsadresse: str(form, "arbeidsadresse"),
    gpsLat: num(form, "gps_lat"),
    gpsLng: num(form, "gps_lng"),
    bildeFilnavn,
    oppdragTyper: jsonArray(form, "oppdrag_typer"),
    oppdragInnenfor: str(form, "oppdrag_innenfor") === "1",
    oppdragBeskrivelse: str(form, "oppdrag_beskrivelse"),
    kompetanse: jsonArray(form, "kompetanse"),
    kompetanseKommentar: str(form, "kompetanse_kommentar"),
    risiko: jsonArray(form, "risiko"),
    tiltak: str(form, "tiltak"),
    trygt: trygtRaw === "1",
    diskutert: str(form, "diskutert") === "1",
    diskutertKommentar: str(form, "diskutert_kommentar"),
  };

  const submission = insertSubmission(input);

  // Best-effort speiling til regneark — databasen er autoritativ, så feil her
  // skal aldri feile selve innsendingen.
  try {
    await getSheetSync().appendSubmission(submission);
  } catch (e) {
    console.error("Sheets-sync feilet for innsending", submission.id, e);
  }

  return NextResponse.json({ id: submission.id }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const resultat = searchSubmissions({
    ansatt: params.get("ansatt") ?? undefined,
    prosjekt: params.get("prosjekt") ?? undefined,
  });
  return NextResponse.json(resultat);
}
