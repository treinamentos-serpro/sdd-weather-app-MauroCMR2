interface EmptyStateProps {
  title?: string;
  tip?: string;
}

export default function EmptyState({
  title = 'Nenhum resultado encontrado',
  tip = 'Confira a grafia e tente buscar outra cidade.',
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">{tip}</p>
    </div>
  );
}
