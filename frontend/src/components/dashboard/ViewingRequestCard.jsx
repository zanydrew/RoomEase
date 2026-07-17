import { Calendar, Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import { VIEWING_STATUS } from '../../utils/constants';

const STATUS_CONFIG = {
  [VIEWING_STATUS.PENDING]: { label: 'Pending', variant: 'warning' },
  [VIEWING_STATUS.APPROVED]: { label: 'Confirmed', variant: 'success' },
  [VIEWING_STATUS.REJECTED]: { label: 'Rejected', variant: 'danger' },
  [VIEWING_STATUS.SUGGESTED]: { label: 'Action Required', variant: 'danger' },
};

export default function ViewingRequestCard({ request, onCancel, onReschedule, onConfirmNewTime, onDecline, busy }) {
  const status = STATUS_CONFIG[request.status] || { label: request.status, variant: 'neutral' };
  const isSuggested = request.status === VIEWING_STATUS.SUGGESTED;

  return (
    <div className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        {request.room?.images?.[0]?.image_url ? (
          <img
            src={request.room.images[0].image_url}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="h-16 w-16 shrink-0 rounded-lg bg-bg" />
        )}

        <div>
          <Badge variant={status.variant}>{status.label}</Badge>
          <p className="mt-1.5 font-semibold text-text">{request.room?.title || 'Room'}</p>

          {isSuggested ? (
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded bg-bg px-2 py-0.5 text-text-muted line-through">
                {request.requested_date}
              </span>
              <span className="rounded bg-gold/20 px-2 py-0.5 font-medium text-gold-dark">
                {request.suggested_date} at {request.suggested_time}
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-3 text-sm text-text-soft">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {request.requested_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {request.requested_time}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:flex-col">
        {isSuggested ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirmNewTime(request.uuid)}
              className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Confirm New Time
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecline(request.uuid)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg disabled:opacity-60"
            >
              Decline
            </button>
          </>
        ) : request.status === VIEWING_STATUS.APPROVED ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => onReschedule(request.uuid)}
              className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              Reschedule
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel(request.uuid)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg disabled:opacity-60"
            >
              Cancel Request
            </button>
          </>
        ) : request.status === VIEWING_STATUS.PENDING ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(request.uuid)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg disabled:opacity-60"
          >
            Cancel Request
          </button>
        ) : request.status === VIEWING_STATUS.REJECTED ? (
          <span className="text-sm text-text-soft">sorry, the room have been rented at the moment</span>
        ) : null}
      </div>
    </div>
  );
}
