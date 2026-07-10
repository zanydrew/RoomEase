import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className={`relative z-10 w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-2xl bg-bg-card p-6 shadow-xl`}>
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-bold text-text">{title}</h2>}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-text-soft hover:bg-bg"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
