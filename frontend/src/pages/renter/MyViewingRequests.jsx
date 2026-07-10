import { useState } from 'react';
import { CalendarX } from 'lucide-react';
import ViewingRequestCard from '../../components/dashboard/ViewingRequestCard';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import useAsync from '../../hooks/useAsync';
import * as viewingService from '../../services/viewingService';
import { notify } from '../../context/ToastConfig';

export default function MyViewingRequests() {
  const { data, loading, error, refetch } = useAsync(
    () => viewingService.getMyRequests().then((res) => res.data.data.requests),
    [],
  );
  const [busyId, setBusyId] = useState(null);

  async function handleAction(id, action, successMessage) {
    setBusyId(id);
    try {
      await action(id);
      notify.success(successMessage);
      refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">My Viewing Request</h1>
      <p className="mt-1 text-sm text-text-soft">Manage and track your upcoming and pending room visits.</p>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card p-6">
        {error && <ErrorState message="Couldn't load your viewing requests." onRetry={refetch} />}

        {!error && loading && <p className="text-sm text-text-soft">Loading...</p>}

        {!error && !loading && (data || []).length === 0 && (
          <EmptyState
            icon={CalendarX}
            title="No viewing requests yet"
            description="Request a viewing from any room's detail page to see it here."
          />
        )}

        {!error &&
          !loading &&
          (data || []).map((request) => (
            <ViewingRequestCard
              key={request.uuid}
              request={request}
              busy={busyId === request.uuid}
              onCancel={(id) => handleAction(id, viewingService.cancelViewing, 'Viewing request cancelled.')}
              onDecline={(id) => handleAction(id, viewingService.cancelViewing, 'Suggested time declined.')}
              onReschedule={(id) =>
                handleAction(id, viewingService.requestReschedule, 'Reschedule requested.')
              }
              onConfirmNewTime={(id) =>
                handleAction(id, viewingService.confirmSuggestedTime, 'New time confirmed.')
              }
            />
          ))}
      </div>
    </div>
  );
}
