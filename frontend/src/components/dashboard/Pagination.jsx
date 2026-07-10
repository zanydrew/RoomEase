import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(page, totalPages) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-soft transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pageNumbers.map((num, index) => {
        const prev = pageNumbers[index - 1];
        const showEllipsis = prev !== undefined && num - prev > 1;

        return (
          <span key={num} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-sm text-text-muted">...</span>}
            <button
              type="button"
              aria-current={num === page ? 'page' : undefined}
              onClick={() => onPageChange(num)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                num === page ? 'bg-gold-dark text-white' : 'border border-border text-text hover:bg-bg'
              }`}
            >
              {num}
            </button>
          </span>
        );
      })}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-soft transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
