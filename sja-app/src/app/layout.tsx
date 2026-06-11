import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Seniorene – Sikker Jobb Analyse",
  description: "Risikovurdering (SJA) for oppdrag – Seniorene.no",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb">
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
            <Link href="/" className="leading-tight">
              <span className="block text-xl font-bold tracking-tight text-brand">
                Seniorene
              </span>
              <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                Sikker Jobb Analyse
              </span>
            </Link>
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-brand"
            >
              Admin
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-xl px-4 pb-28 pt-6">{children}</main>
        <footer className="mx-auto max-w-xl px-4 pb-8 text-center text-xs text-gray-400">
          Seniorene.no · PoC for sikker jobb analyse
        </footer>
      </body>
    </html>
  );
}
