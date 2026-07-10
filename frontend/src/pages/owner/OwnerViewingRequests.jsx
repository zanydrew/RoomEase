import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CalendarClock } from 'lucide-react';
import OwnerViewingRequestRow from '../../components/dashboard/OwnerViewingRequestRow';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Modal from '../../components/ui/Modal';
import useAsync from '../../hooks/useAsync';
import * as viewingService from '../../services/viewingService';
import * as conversationService from '../../services/conversationService';
import { notify } from '../../context/ToastConfig';

export default function OwnerViewingRequests() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useAsync(
    () => viewingService.getOwnerRequests().then((res) => res.data.data.requests),
    [],
  );
  const [busyId, setBusyId] = useState(null);
  const [suggestTarget, setSuggestTarget] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { suggested_date: '', suggested_time: '', owner_note: '' } });

  async function handleAccept(id) {
    setBusyId(id);
    try {
      await viewingService.acceptViewing(id);
      notify.success('Viewing request accepted.');
      refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id) {
    setBusyId(id);
    try {
      await viewingService.rejectViewing(id);
      notify.success('Viewing request rejected.');
      refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  }

  async function handleSuggestSubmit(formData) {
    setBusyId(suggestTarget.uuid);
    try {
      await viewingService.suggestNewTime(suggestTarget.uuid, formData);
      notify.success('New time suggested to the renter.');
      setSuggestTarget(null);
      reset();
      refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusyId(null);
    }
  }

  // The backend's startConversation is renter-only (it rejects when the
  // caller owns the room), so the owner side can only open a conversation
  // that already exists — not create a new one from here.
  async function handleChat(request) {
    try {
      const res = await conversationService.getMyConversations();
      const match = (res.data.data.conversations || []).find(
        (c) => c.room?.uuid === request.room?.uuid && c.renter_id === request.renter?.uuid,
      );
      if (match) {
        navigate(`/chat/${match.uuid}`);
      } else {
        notify.error('No conversation yet — the renter needs to start the chat first.');
      }
    } catch (err) {
      notify.error(err);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Viewing Requests</h1>
      <p className="mt-1 text-sm text-text-soft">
        You have {(data || []).filter((r) => r.status === 'PENDING').length} pending viewing requests that need
        your attention.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-bg-card p-6">
        {error && <ErrorState message="Couldn't load viewing requests." onRetry={refetch} />}

        {!error && loading && <p className="text-sm text-text-soft">Loading...</p>}

        {!error && !loading && (data || []).length === 0 && (
          <EmptyState icon={CalendarClock} title="No viewing requests yet" />
        )}

        {!error && !loading && (data || []).length > 0 && (
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase text-text-soft">
                <th className="pb-3 pr-4">Renter</th>
                <th className="pb-3 pr-4">Requested Property</th>
                <th className="pb-3 pr-4">Date & Time</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((request) => (
                <OwnerViewingRequestRow
                  key={request.uuid}
                  request={request}
                  busy={busyId === request.uuid}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onSuggestNewTime={setSuggestTarget}
                  onChat={handleChat}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={!!suggestTarget}
        onClose={() => setSuggestTarget(null)}
        title="Suggest a new time"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSubmit(handleSuggestSubmit)} noValidate className="flex flex-col gap-3">
          <div>
            <label htmlFor="suggested_date" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Date
            </label>
            <input
              id="suggested_date"
              type="date"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
              {...register('suggested_date', { required: true })}
            />
          </div>
          <div>
            <label htmlFor="suggested_time" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Time
            </label>
            <input
              id="suggested_time"
              type="time"
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
              {...register('suggested_time', { required: true })}
            />
          </div>
          <div>
            <label htmlFor="owner_note" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Note (optional)
            </label>
            <textarea
              id="owner_note"
              rows={2}
              className="w-full resize-none rounded-lg border border-border px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
              {...register('owner_note')}
            />
          </div>
          <button
            type="submit"
            disabled={!!errors.suggested_date}
            className="mt-2 rounded-lg bg-gold-dark py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Send Suggestion
          </button>
        </form>
      </Modal>
    </div>
  );
}
