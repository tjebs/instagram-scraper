export default function FormSection({
  nummer,
  tittel,
  children,
}: {
  nummer: number;
  tittel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2.5 text-base font-semibold text-gray-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
          {nummer}
        </span>
        {tittel}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
