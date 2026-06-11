"use client";

import { useEffect, useRef, useState } from "react";
import CheckboxGroup from "./CheckboxGroup";
import FormSection from "./FormSection";
import {
  KOMPETANSE_PUNKTER,
  OPPDRAG_TYPER,
  RISIKO_PUNKTER,
} from "@/lib/types";

const PREFILL_KEY = "sja:last";

// Feltene som "henger igjen" fra forrige registrering på samme enhet.
// Bilde, dato/tid, GPS/adresse, trygt og diskutert skal alltid være friske.
interface PrefillData {
  prosjekt: string;
  ansatt: string;
  avdeling: string;
  oppdragTyper: string[];
  oppdragInnenfor: boolean;
  oppdragBeskrivelse: string;
  kompetanse: string[];
  kompetanseKommentar: string;
}

type GpsStatus =
  | { state: "idle" }
  | { state: "henter" }
  | { state: "ok"; lat: number; lng: number }
  | { state: "feil"; melding: string };

export default function SjaForm() {
  const [prosjekt, setProsjekt] = useState("");
  const [ansatt, setAnsatt] = useState("");
  const [avdeling, setAvdeling] = useState("");
  const [datoTid, setDatoTid] = useState("");
  const [arbeidsadresse, setArbeidsadresse] = useState("");
  const [gps, setGps] = useState<GpsStatus>({ state: "idle" });
  const [bilde, setBilde] = useState<File | null>(null);
  const [bildeUrl, setBildeUrl] = useState<string | null>(null);
  const [oppdragTyper, setOppdragTyper] = useState<string[]>([]);
  const [oppdragInnenfor, setOppdragInnenfor] = useState(false);
  const [oppdragBeskrivelse, setOppdragBeskrivelse] = useState("");
  const [kompetanse, setKompetanse] = useState<string[]>([]);
  const [kompetanseKommentar, setKompetanseKommentar] = useState("");
  const [risiko, setRisiko] = useState<string[]>([]);
  const [tiltak, setTiltak] = useState("");
  const [trygt, setTrygt] = useState<boolean | null>(null);
  const [diskutert, setDiskutert] = useState(false);
  const [diskutertKommentar, setDiskutertKommentar] = useState("");

  const [sender, setSender] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [innsendtId, setInnsendtId] = useState<number | null>(null);
  const bildeInputRef = useRef<HTMLInputElement>(null);

  // Auto dato/tid + prefill fra forrige registrering (i useEffect pga SSR).
  useEffect(() => {
    setDatoTid(new Date().toLocaleString("nb-NO"));
    try {
      const raw = localStorage.getItem(PREFILL_KEY);
      if (raw) {
        const p: PrefillData = JSON.parse(raw);
        setProsjekt(p.prosjekt ?? "");
        setAnsatt(p.ansatt ?? "");
        setAvdeling(p.avdeling ?? "");
        setOppdragTyper(p.oppdragTyper ?? []);
        setOppdragInnenfor(p.oppdragInnenfor ?? false);
        setOppdragBeskrivelse(p.oppdragBeskrivelse ?? "");
        setKompetanse(p.kompetanse ?? []);
        setKompetanseKommentar(p.kompetanseKommentar ?? "");
      }
    } catch {
      // Korrupt prefill skal aldri stoppe skjemaet.
    }
  }, []);

  function hentPosisjon() {
    if (!navigator.geolocation) {
      setGps({ state: "feil", melding: "Enheten støtter ikke posisjon." });
      return;
    }
    setGps({ state: "henter" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setGps({ state: "ok", lat, lng });
        // TODO (produksjon): reverse geocoding (f.eks. Nominatim) til gateadresse.
        setArbeidsadresse((prev) => prev || `${lat}, ${lng}`);
      },
      () =>
        setGps({
          state: "feil",
          melding: "Kunne ikke hente posisjon – fyll inn adresse manuelt.",
        }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0] ?? null;
    setBilde(fil);
    if (bildeUrl) URL.revokeObjectURL(bildeUrl);
    setBildeUrl(fil ? URL.createObjectURL(fil) : null);
  }

  function fjernBilde() {
    setBilde(null);
    if (bildeUrl) URL.revokeObjectURL(bildeUrl);
    setBildeUrl(null);
    if (bildeInputRef.current) bildeInputRef.current.value = "";
  }

  function tomSkjema() {
    localStorage.removeItem(PREFILL_KEY);
    window.location.reload();
  }

  async function sendInn(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    if (!prosjekt.trim() || !ansatt.trim()) {
      setFeil("Prosjektnr./Kundenavn og Ansatt må fylles ut.");
      return;
    }
    if (trygt === null) {
      setFeil("Du må svare på om oppdraget kan utføres trygt.");
      return;
    }
    setSender(true);
    try {
      const form = new FormData();
      form.set("prosjekt", prosjekt.trim());
      form.set("ansatt", ansatt.trim());
      form.set("avdeling", avdeling.trim());
      form.set("dato_tid", datoTid);
      form.set("arbeidsadresse", arbeidsadresse.trim());
      if (gps.state === "ok") {
        form.set("gps_lat", String(gps.lat));
        form.set("gps_lng", String(gps.lng));
      }
      if (bilde) form.set("bilde", bilde);
      form.set("oppdrag_typer", JSON.stringify(oppdragTyper));
      form.set("oppdrag_innenfor", oppdragInnenfor ? "1" : "0");
      form.set("oppdrag_beskrivelse", oppdragBeskrivelse.trim());
      form.set("kompetanse", JSON.stringify(kompetanse));
      form.set("kompetanse_kommentar", kompetanseKommentar.trim());
      form.set("risiko", JSON.stringify(risiko));
      form.set("tiltak", tiltak.trim());
      form.set("trygt", trygt ? "1" : "0");
      form.set("diskutert", diskutert ? "1" : "0");
      form.set("diskutert_kommentar", diskutertKommentar.trim());

      const res = await fetch("/api/submissions", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Innsending feilet. Prøv igjen.");
      }

      const prefill: PrefillData = {
        prosjekt: prosjekt.trim(),
        ansatt: ansatt.trim(),
        avdeling: avdeling.trim(),
        oppdragTyper,
        oppdragInnenfor,
        oppdragBeskrivelse: oppdragBeskrivelse.trim(),
        kompetanse,
        kompetanseKommentar: kompetanseKommentar.trim(),
      };
      localStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
      setInnsendtId(data.id);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setFeil(e instanceof Error ? e.message : "Innsending feilet. Prøv igjen.");
    } finally {
      setSender(false);
    }
  }

  if (innsendtId !== null) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-3xl">
          ✓
        </div>
        <h2 className="mb-1 text-xl font-bold text-gray-900">SJA registrert</h2>
        <p className="mb-6 text-sm text-gray-500">
          Referanse <span className="font-semibold">#{innsendtId}</span>. Skjemaet
          er lagret i databasen og synkronisert til regneark.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-brand px-4 py-3.5 font-semibold text-white hover:bg-brand-dark"
        >
          Ny registrering
        </button>
      </div>
    );
  }

  const inputKlasse =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand";

  return (
    <form onSubmit={sendInn}>
      <p className="mb-4 text-sm text-gray-500">
        Fyll ut skjemaet før arbeidet starter. Felter merket * er påkrevde.
      </p>

      <FormSection nummer={1} tittel="Prosjekt og ansatt">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Prosjektnr./Kundenavn *
          </label>
          <input
            type="text"
            value={prosjekt}
            onChange={(e) => setProsjekt(e.target.value)}
            className={inputKlasse}
            placeholder="F.eks. P-1042 / Fru Hansen"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ansatt *
          </label>
          <input
            type="text"
            value={ansatt}
            onChange={(e) => setAnsatt(e.target.value)}
            className={inputKlasse}
            placeholder="Fullt navn"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Avdeling
          </label>
          <input
            type="text"
            value={avdeling}
            onChange={(e) => setAvdeling(e.target.value)}
            className={inputKlasse}
            placeholder="F.eks. Oslo Vest"
          />
        </div>
      </FormSection>

      <FormSection nummer={2} tittel="Tid og sted">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Dato og klokkeslett (auto)
          </label>
          <input
            type="text"
            value={datoTid}
            readOnly
            className={`${inputKlasse} bg-gray-50 text-gray-500`}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Arbeidsadresse
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={arbeidsadresse}
              onChange={(e) => setArbeidsadresse(e.target.value)}
              className={inputKlasse}
              placeholder="Gateadresse eller GPS"
            />
            <button
              type="button"
              onClick={hentPosisjon}
              disabled={gps.state === "henter"}
              className="shrink-0 rounded-lg border border-brand px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand-light disabled:opacity-50"
            >
              {gps.state === "henter" ? "Henter…" : "📍 Hent posisjon"}
            </button>
          </div>
          {gps.state === "ok" && (
            <p className="mt-1 text-xs text-brand-dark">
              Posisjon hentet: {gps.lat}, {gps.lng}
            </p>
          )}
          {gps.state === "feil" && (
            <p className="mt-1 text-xs text-varsel">{gps.melding}</p>
          )}
        </div>
      </FormSection>

      <FormSection nummer={3} tittel="Bilde av arbeidssted">
        {bildeUrl ? (
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bildeUrl}
              alt="Forhåndsvisning av arbeidssted"
              className="mb-2 max-h-64 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={fjernBilde}
              className="text-sm font-medium text-varsel hover:underline"
            >
              Fjern bilde
            </button>
          </div>
        ) : (
          <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-brand hover:bg-brand-light">
            <span className="text-2xl">📷</span>
            <span className="text-sm font-medium text-gray-700">
              Ta bilde eller last opp
            </span>
            <span className="text-xs text-gray-400">JPG, PNG, WEBP eller HEIC</span>
            <input
              ref={bildeInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={velgBilde}
              className="hidden"
            />
          </label>
        )}
      </FormSection>

      <FormSection nummer={4} tittel="Type oppdrag og arbeidsoppgaver">
        <CheckboxGroup
          options={OPPDRAG_TYPER}
          valgte={oppdragTyper}
          onChange={setOppdragTyper}
        />
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={oppdragInnenfor}
            onChange={(e) => setOppdragInnenfor(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
          />
          <span className="text-sm font-medium text-gray-900">
            Er jobben innenfor det vi kan utføre?
            <span className="mt-0.5 block text-xs font-normal text-gray-500">
              Ref. «Risiko ved ulike oppdragstyper»
            </span>
          </span>
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <textarea
            value={oppdragBeskrivelse}
            onChange={(e) => setOppdragBeskrivelse(e.target.value)}
            rows={3}
            className={inputKlasse}
            placeholder="Beskriv arbeidsoppgavene"
          />
        </div>
      </FormSection>

      <FormSection nummer={5} tittel="Kompetanse og utstyr">
        <CheckboxGroup
          options={KOMPETANSE_PUNKTER}
          valgte={kompetanse}
          onChange={setKompetanse}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Kommentar
          </label>
          <textarea
            value={kompetanseKommentar}
            onChange={(e) => setKompetanseKommentar(e.target.value)}
            rows={2}
            className={inputKlasse}
          />
        </div>
      </FormSection>

      <FormSection nummer={6} tittel="Risiko – hva kan gå galt?">
        <CheckboxGroup options={RISIKO_PUNKTER} valgte={risiko} onChange={setRisiko} />
      </FormSection>

      <FormSection nummer={7} tittel="Hvilke tiltak er gjort?">
        <textarea
          value={tiltak}
          onChange={(e) => setTiltak(e.target.value)}
          rows={3}
          className={inputKlasse}
          placeholder="Beskriv tiltakene som reduserer risikoen"
        />
      </FormSection>

      <FormSection nummer={8} tittel="Kan oppdraget utføres trygt? *">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTrygt(true)}
            className={`rounded-lg border-2 px-4 py-3.5 font-semibold transition-colors ${
              trygt === true
                ? "border-brand bg-brand text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-brand"
            }`}
          >
            Ja
          </button>
          <button
            type="button"
            onClick={() => setTrygt(false)}
            className={`rounded-lg border-2 px-4 py-3.5 font-semibold transition-colors ${
              trygt === false
                ? "border-varsel bg-varsel text-white"
                : "border-gray-300 bg-white text-gray-700 hover:border-varsel"
            }`}
          >
            Nei
          </button>
        </div>
        {trygt === false && (
          <div className="flex items-start gap-3 rounded-lg border border-varsel bg-varsel-light p-4">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-semibold text-varsel">
              Kontakt avdelingsleder før arbeidet starter.
            </p>
          </div>
        )}
      </FormSection>

      <FormSection nummer={9} tittel="Formidling til andre på prosjektet">
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={diskutert}
            onChange={(e) => setDiskutert(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
          />
          <span className="text-sm font-medium text-gray-900">
            Risikoanalysen er diskutert og formidlet til de andre som arbeider på
            prosjektet
          </span>
        </label>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Kommentar (hvem gjelder risikoanalysen for?)
          </label>
          <textarea
            value={diskutertKommentar}
            onChange={(e) => setDiskutertKommentar(e.target.value)}
            rows={2}
            className={inputKlasse}
          />
        </div>
      </FormSection>

      {feil && (
        <div className="mb-4 rounded-lg border border-varsel bg-varsel-light p-3 text-sm font-medium text-varsel">
          {feil}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <button
            type="button"
            onClick={tomSkjema}
            className="shrink-0 rounded-lg px-3 py-3 text-sm font-medium text-gray-500 hover:text-varsel"
          >
            Tøm skjema
          </button>
          <button
            type="submit"
            disabled={sender}
            className="w-full rounded-lg bg-brand px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
          >
            {sender ? "Sender inn…" : "Send inn SJA"}
          </button>
        </div>
      </div>
    </form>
  );
}
