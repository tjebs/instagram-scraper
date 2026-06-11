export default function StatusBadge({ trygt }: { trygt: boolean }) {
  return trygt ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-light px-2.5 py-1 text-xs font-semibold text-brand-dark">
      ✓ Trygt – Ja
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-varsel-light px-2.5 py-1 text-xs font-semibold text-varsel">
      ⚠ Nei – kontakt leder
    </span>
  );
}
