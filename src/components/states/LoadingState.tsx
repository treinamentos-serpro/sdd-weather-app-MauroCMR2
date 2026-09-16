interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-400"
      />
      <p className="text-sm text-slate-200">{message}</p>
    </div>
  );
}
