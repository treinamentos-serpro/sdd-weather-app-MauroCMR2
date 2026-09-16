interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="rounded-2xl border border-red-300/20 bg-red-300/10 p-6 text-center"
      role="alert"
    >
      <p className="text-sm text-red-100">{message}</p>
      <button
        className="mt-4 min-h-10 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
        type="button"
        onClick={onRetry}
      >
        Tentar novamente
      </button>
    </div>
  );
}
