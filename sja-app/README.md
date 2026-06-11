# Seniorene – Sikker Jobb Analyse (SJA) · PoC

Mobil-først web-app for risikovurdering (SJA): den ansatte fyller ut skjemaet
på arbeidsstedet **uten innlogging**, med bilde av arbeidsstedet og
GPS-posisjon. Alt lagres i en database Seniorene selv eier (source of truth),
og hver innsending speiles til regneark.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS 4
- **SQLite** via Nodes innebygde `node:sqlite` — null eksterne
  database-avhengigheter. Krever **Node 22.13+**.
- All SQL ligger i `src/lib/repository.ts`; bytte til Postgres/Supabase senere
  betyr å skrive om kun den fila (og `db.ts`).

## Kjøre lokalt

```bash
cd sja-app
npm install
npm run dev      # http://localhost:3000
```

- `/` — SJA-skjemaet (mobil-først)
- `/admin` — søk og oversikt over innsendte skjema (ansatt + prosjekt/kunde)

Data havner i `sja-app/data/` (gitignored):

| Fil | Innhold |
| --- | --- |
| `data/sja.db` | SQLite-databasen — autoritativ lagring |
| `data/uploads/` | Opplastede bilder |
| `data/sheet-sync.csv` | Regneark-speilet (stub for Google Sheets) |

## Funksjonalitet fra spec-en

- Auto dato/klokkeslett; «Hent posisjon» bruker enhetens GPS og prefyller
  adressefeltet med koordinater (redigerbart).
- Bilde: `<input capture="environment">` åpner kameraet direkte på mobil.
- Verdier «henger igjen» fra forrige registrering (prosjekt, ansatt, avdeling,
  oppdragstype, kompetanse) via `localStorage` på enheten. Bilde, dato/tid,
  posisjon og trygt/Nei-svaret er alltid friske.
- Svares det **Nei** på «Kan oppdraget utføres trygt?» vises varselet
  «Kontakt avdelingsleder før arbeidet starter» — innsendingen registreres
  likevel, og markeres rødt i admin.

## Legg til på Hjem-skjermen (PWA)

Appen har web app-manifest og ikoner, så ansatte kan lagre den som en app på
mobilen: **Safari → Del → Legg til på Hjem-skjerm** (iPhone) eller
**Chrome → Installer app** (Android). Den åpner da i fullskjerm uten
nettleser-UI. (Offline-støtte/service worker er ikke med i PoC-en.)

## Hosting og seniorene.no/risikovurdering

Seniorene.no ligger på HubSpot, som ikke kan kjøre Node-apper eller databaser.
Anbefalt oppsett:

1. Host appen på et eget subdomene, f.eks. `sja.seniorene.no`
   (DNS CNAME → hosting-leverandøren).
2. Lag en URL-redirect i HubSpot (Settings → Website → Domains & URLs →
   URL Redirects): `seniorene.no/risikovurdering` → `https://sja.seniorene.no`.

Hosting-alternativer:

- **Railway / Fly.io / Render med persistent volum** (~5 USD/mnd): appen
  kjører som den er, med SQLite og bilder på volumet. Enklest.
- **Vercel + Supabase**: Vercel har ikke vedvarende disk, så da byttes
  SQLite til Supabase Postgres (skriv om `src/lib/repository.ts` + `db.ts`)
  og bildene til Supabase Storage.

Husk at appen må serveres over HTTPS for at GPS og kamera skal fungere fra
mobil — alle leverandørene over gir det automatisk.

## Google Sheets-integrasjon

PoC-en skriver hver innsending til `data/sheet-sync.csv` med nøyaktig de
kolonnene regnearket skal ha. Grensesnittet er klart for ekte Google Sheets:

1. Opprett en service account i Google Cloud og del regnearket med den.
2. `npm install googleapis` og implementer `src/lib/sheets/google.ts`
   (ferdig kommentert skjelett med kodeeksempel).
3. Sett `SHEETS_SYNC=google`, `GOOGLE_APPLICATION_CREDENTIALS` og
   `SHEETS_SPREADSHEET_ID`.

Sync er alltid best-effort: feiler regnearket, lagres innsendingen likevel i
databasen (som også fungerer som sikkerhetskopi av regnearket).

## API (for testing)

```bash
# Send inn (multipart):
curl -X POST http://localhost:3000/api/submissions \
  -F prosjekt="P-1042 / Fru Hansen" -F ansatt="Kari Nordmann" -F trygt=1 \
  -F oppdrag_typer='["hagearbeid"]' -F bilde=@bilde.jpg

# Søk:
curl 'http://localhost:3000/api/submissions?ansatt=kari&prosjekt=1042'

# Detalj:
curl http://localhost:3000/api/submissions/1
```

## PoC-begrensninger (før produksjon)

- **Ingen autentisering på `/admin`** — må sikres (f.eks. enkel SSO) før bruk.
- Geolocation krever sikker kontekst: fungerer på `localhost`, men test fra
  mobil over nettverk krever HTTPS (f.eks. en tunnel som `cloudflared`/`ngrok`).
- Reverse geocoding (koordinater → gateadresse) er ikke implementert; markert
  TODO i `SjaForm.tsx` (Nominatim er et gratis alternativ).
- Bilder lagres på lokal disk; bør flyttes til objektlagring i produksjon.
- Google Sheets-synk er stubbet til CSV (se over).
