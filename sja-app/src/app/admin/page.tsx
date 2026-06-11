import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { searchSubmissions } from "@/lib/repository";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ ansatt?: string; prosjekt?: string }>;
}) {
  const { ansatt = "", prosjekt = "" } = await searchParams;
  const resultater = searchSubmissions({
    ansatt: ansatt || undefined,
    prosjekt: prosjekt || undefined,
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-gray-900">Innsendte SJA-skjema</h1>
      <p className="mb-4 text-sm text-gray-500">
        Søk på ansattnavn og/eller prosjektnr./kundenavn.
      </p>

      <form
        method="get"
        className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ansatt
            </label>
            <input
              type="text"
              name="ansatt"
              defaultValue={ansatt}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Prosjektnr./Kundenavn
            </label>
            <input
              type="text"
              name="prosjekt"
              defaultValue={prosjekt}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Søk
          </button>
          {(ansatt || prosjekt) && (
            <Link href="/admin" className="text-sm text-gray-500 hover:underline">
              Nullstill
            </Link>
          )}
        </div>
      </form>

      {resultater.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Ingen registreringer funnet.
        </p>
      ) : (
        <ul className="space-y-2">
          {resultater.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/${s.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-brand"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-semibold text-gray-900">
                    #{s.id} · {s.prosjekt}
                  </span>
                  <StatusBadge trygt={s.trygt} />
                </div>
                <div className="text-sm text-gray-500">
                  {s.ansatt}
                  {s.avdeling ? ` · ${s.avdeling}` : ""} · {s.datoTid}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
