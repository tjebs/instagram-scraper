import type { MetadataRoute } from "next";

// Web app-manifest: lar ansatte legge appen på hjemskjermen
// («Legg til på Hjem-skjerm» i Safari / «Installer app» i Chrome).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Seniorene – Sikker Jobb Analyse",
    short_name: "SJA",
    description: "Risikovurdering (SJA) for oppdrag – Seniorene.no",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5f3",
    theme_color: "#1d6b46",
    lang: "nb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
