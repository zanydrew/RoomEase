import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import * as viewingService from '../../services/viewingService';
import * as conversationService from '../../services/conversationService';
import { notify } from '../../context/ToastConfig';

export default function BookingCard({ room }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [requestSent, setRequestSent] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCheckingRequest(false);
      return;
    }
    viewingService
      .getMyRequests()
      .then((res) => {
        const requests = res.data?.data?.requests ?? res.data?.data ?? [];
        const active = requests.find(
          (r) =>
            r.room_id === room.uuid &&
            ['PENDING', 'APPROVED', 'SUGGESTED'].includes(r.status),
        );
        if (active) setExistingRequest(active);
      })
      .catch(() => {})
      .finally(() => setCheckingRequest(false));
  }, [isAuthenticated, room.uuid]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { requested_date: '', requested_time: '' } });

  async function onSubmit(data) {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await viewingService.requestViewing({ room_id: room.uuid, ...data });
      setRequestSent(true);
    } catch (err) {
      notify.error(err);
    }
  }

  async function handleChatOwner() {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setChatLoading(true);
    try {
      const res = await conversationService.startConversation(room.uuid);
      const conversationId = res.data.data.conversation?.uuid || res.data.data.conversation?.id;
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      notify.error(err);
    } finally {
      setChatLoading(false);
    }
  }

  if (requestSent) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-6 text-center shadow-sm">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg text-gold-dark">
          <CheckCircle2 size={28} />
        </span>
        <h3 className="mt-4 text-lg font-bold text-text">Request Sent Successfully!</h3>
        <p className="mt-2 text-sm text-text-soft">
          Waiting for owner's acceptance. We'll notify you once{' '}
          <span className="font-semibold text-text">{room.owner?.full_name || 'the owner'}</span> responds.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/renter/requests')}
          className="mt-5 w-full rounded-full bg-gold-dark py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View My Requests
        </button>
        <p className="mt-4 text-xs text-text-soft">
          You can manage all your viewing requests in your dashboard.
        </p>
      </div>
    );
  }

  if (!checkingRequest && existingRequest) {
    const statusLabels = {
      PENDING: 'Pending',
      APPROVED: 'Approved',
      SUGGESTED: 'Awaiting your response',
    };
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-dark/10 text-gold-dark">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">Already Requested</p>
            <p className="text-xs text-text-soft">
              Status: {statusLabels[existingRequest.status] || existingRequest.status}
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-soft">
          You already have an active viewing request for this room. You can cancel it from your dashboard to request a new time.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/renter/requests')}
          className="mt-4 w-full rounded-full bg-gold-dark py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          View My Requests
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-card p-6 shadow-sm">
      <p className="text-2xl font-bold text-text">
        ${room.price_per_month}
        <span className="text-sm font-normal text-text-soft"> / month</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 flex flex-col gap-3">
        <div>
          <label htmlFor="requested_date" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
            Viewing Date
          </label>
          <input
            id="requested_date"
            type="date"
            className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
              errors.requested_date ? 'border-danger' : 'border-border'
            }`}
            {...register('requested_date', { required: 'Please select a date.' })}
          />
          {errors.requested_date && <p className="mt-1 text-xs text-danger">{errors.requested_date.message}</p>}
        </div>

        <div>
          <label htmlFor="requested_time" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
            Time
          </label>
          <input
            id="requested_time"
            type="time"
            className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
              errors.requested_time ? 'border-danger' : 'border-border'
            }`}
            {...register('requested_time', { required: 'Please select a time.' })}
          />
          {errors.requested_time && <p className="mt-1 text-xs text-danger">{errors.requested_time.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-full bg-gold-dark py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? 'Sending request...' : 'Request Viewing'}
        </button>

        <button
          type="button"
          onClick={handleChatOwner}
          disabled={chatLoading}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-text hover:bg-bg disabled:opacity-60"
        >
          <MessageSquare size={16} />
          {chatLoading ? 'Opening chat...' : 'Chat Owner'}
        </button>

        <p className="text-center text-xs text-text-soft">You won't be charged yet</p>
      </form>
    </div>
  );
}
