import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { getSubmission } from "@/lib/repository";
import {
  KOMPETANSE_PUNKTER,
  OPPDRAG_TYPER,
  RISIKO_PUNKTER,
  labelsFor,
} from "@/lib/types";

export const dynamic = "force-dynamic";

function Felt({ navn, verdi }: { navn: string; verdi: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {navn}
      </dt>
      <dd className="text-sm text-gray-900">{verdi || "–"}</dd>
    </div>
  );
}

export default async function AdminDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  const s = Number.isInteger(numId) ? getSubmission(numId) : null;
  if (!s) notFound();

  return (
    <div>
      <Link href="/admin" className="mb-3 inline-block text-sm text-gray-500 hover:underline">
        ← Tilbake til oversikten
      </Link>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-gray-900">
            SJA #{s.id} · {s.prosjekt}
          </h1>
          <StatusBadge trygt={s.trygt} />
        </div>
        {!s.trygt && (
          <p className="mb-3 rounded-lg border border-varsel bg-varsel-light p-3 text-sm font-semibold text-varsel">
            ⚠️ Ansatt svarte «Nei» – avdelingsleder skal kontaktes før arbeidet
            starter.
          </p>
        )}
        <dl className="grid grid-cols-2 gap-3">
          <Felt navn="Ansatt" verdi={s.ansatt} />
          <Felt navn="Avdeling" verdi={s.avdeling} />
          <Felt navn="Dato og klokkeslett" verdi={s.datoTid} />
          <Felt navn="Registrert (server)" verdi={new Date(s.createdAt).toLocaleString("nb-NO")} />
          <Felt navn="Arbeidsadresse" verdi={s.arbeidsadresse} />
          <Felt
            navn="GPS"
            verdi={
              s.gpsLat != null && s.gpsLng != null ? (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${s.gpsLat}&mlon=${s.gpsLng}#map=17/${s.gpsLat}/${s.gpsLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand underline"
                >
                  {s.gpsLat}, {s.gpsLng}
                </a>
              ) : null
            }
          />
        </dl>
      </div>

      {s.bildeFilnavn && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Bilde av arbeidssted
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/uploads/${s.bildeFilnavn}`}
            alt={`Arbeidssted for SJA #${s.id}`}
            className="w-full rounded-lg"
          />
        </div>
      )}

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Oppdrag og arbeidsoppgaver
        </h2>
        <dl className="space-y-3">
          <Felt
            navn="Type oppdrag"
            verdi={labelsFor(OPPDRAG_TYPER, s.oppdragTyper).join(", ")}
          />
          <Felt
            navn="Innenfor det vi kan utføre"
            verdi={s.oppdragInnenfor ? "Ja" : "Nei"}
          />
          <Felt navn="Beskrivelse" verdi={s.oppdragBeskrivelse} />
        </dl>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Kompetanse og utstyr
        </h2>
        <dl className="space-y-3">
          <Felt
            navn="Bekreftet"
            verdi={labelsFor(KOMPETANSE_PUNKTER, s.kompetanse).join(", ")}
          />
          <Felt navn="Kommentar" verdi={s.kompetanseKommentar} />
        </dl>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">
          Risiko og tiltak
        </h2>
        <dl className="space-y-3">
          <Felt
            navn="Identifisert risiko"
            verdi={labelsFor(RISIKO_PUNKTER, s.risiko).join(", ")}
          />
          <Felt navn="Tiltak" verdi={s.tiltak} />
        </dl>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Formidling</h2>
        <dl className="space-y-3">
          <Felt
            navn="Diskutert med andre på prosjektet"
            verdi={s.diskutert ? "Ja" : "Nei"}
          />
          <Felt navn="Kommentar" verdi={s.diskutertKommentar} />
        </dl>
      </div>
    </div>
  );
}
