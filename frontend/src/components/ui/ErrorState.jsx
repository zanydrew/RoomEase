import { AlertTriangle } from 'lucide-react';

export default function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-danger/40 bg-danger-bg/30 py-12 text-center">
      <AlertTriangle size={26} className="mb-3 text-danger" />
      <p className="text-sm font-medium text-text">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-text hover:bg-bg"
        >
          Try again
        </button>
      )}
    </div>
  );
}
