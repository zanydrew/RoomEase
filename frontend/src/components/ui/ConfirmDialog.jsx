import Modal from './Modal';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = true, loading }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth="max-w-sm">
      {description && <p className="text-sm text-text-soft">{description}</p>}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 ${
            danger ? 'bg-danger' : 'bg-gold-dark'
          }`}
        >
          {loading ? 'Please wait...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
