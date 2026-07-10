import { MessageSquare, X } from 'lucide-react';
import Badge from '../ui/Badge';
import { VIEWING_STATUS } from '../../utils/constants';

const STATUS_CONFIG = {
  [VIEWING_STATUS.PENDING]: { label: 'Pending', variant: 'warning' },
  [VIEWING_STATUS.APPROVED]: { label: 'Accepted', variant: 'success' },
  [VIEWING_STATUS.REJECTED]: { label: 'Rejected', variant: 'danger' },
  [VIEWING_STATUS.SUGGESTED]: { label: 'Suggested New Time', variant: 'info' },
};

export default function OwnerViewingRequestRow({ request, onAccept, onReject, onSuggestNewTime, onChat, busy }) {
  const status = STATUS_CONFIG[request.status] || { label: request.status, variant: 'neutral' };

  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          {request.renter?.avatar_url ? (
            <img src={request.renter.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-bg" />
          )}
          <p className="text-sm font-semibold text-text">{request.renter?.full_name || 'Renter'}</p>
        </div>
      </td>
      <td className="py-4 pr-4 text-sm text-text">{request.room?.title || 'Room'}</td>
      <td className="py-4 pr-4 text-sm text-text-soft">
        {request.requested_date}
        <br />
        {request.requested_time}
      </td>
      <td className="py-4 pr-4">
        <Badge variant={status.variant}>{status.label}</Badge>
      </td>
      <td className="py-4 text-right">
        {request.status === VIEWING_STATUS.PENDING && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept(request.uuid)}
              className="rounded-lg bg-gold-dark px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSuggestNewTime(request)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg disabled:opacity-60"
            >
              Suggest New Time
            </button>
            <button
              type="button"
              aria-label="Reject request"
              disabled={busy}
              onClick={() => onReject(request.uuid)}
              className="flex items-center justify-center rounded-lg px-2 text-danger hover:bg-danger-bg disabled:opacity-60"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {request.status === VIEWING_STATUS.SUGGESTED && (
          <span className="text-xs text-text-soft">Waiting for Renter...</span>
        )}

        {request.status === VIEWING_STATUS.APPROVED && (
          <button
            type="button"
            onClick={() => onChat(request)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg"
          >
            <MessageSquare size={14} />
            Chat
          </button>
        )}

        {request.status === VIEWING_STATUS.REJECTED && (
          <span className="text-xs text-text-soft">Declined by you</span>
        )}
      </td>
    </tr>
  );
}
