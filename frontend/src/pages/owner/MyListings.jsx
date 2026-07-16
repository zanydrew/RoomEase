import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home as HomeIcon, Plus } from 'lucide-react';
import RoomListingCard from '../../components/dashboard/RoomListingCard';
import Pagination from '../../components/dashboard/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import useAsync from '../../hooks/useAsync';
import * as ownerService from '../../services/ownerService';
import { notify } from '../../context/ToastConfig';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 4;

export default function MyListings() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, refetch } = useAsync(
    () => ownerService.getMyRooms({ page, limit: PAGE_SIZE }).then((res) => res.data.data),
    [page],
  );

  const rooms = data?.rooms || [];
  const total = data?.total ?? rooms.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await ownerService.deleteRoom(deleteTarget);
      notify.success('Listing deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      notify.error(err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">My Listings</h1>
          <p className="mt-1 text-sm text-text-soft">Manage your Phnom Penh properties and view pending requests.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard/owner/listings/new')}
          className="flex items-center gap-2 rounded-full bg-gold-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} />
          Post New Room
        </button>
      </div>
      
      <h2 className="mt-8 text-lg font-bold text-text">All Listings</h2>

      {error && (
        <div className="mt-4">
          <ErrorState message="Couldn't load your listings." onRetry={refetch} />
        </div>
      )}

      {!error && (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-bg" />
            ))}

          {!loading && rooms.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={HomeIcon}
                title="No listings yet"
                description="Post your first room to start receiving viewing requests."
              />
            </div>
          )}

          {!loading &&
            rooms.map((room) => (
              <RoomListingCard
                key={room.uuid}
                room={room}
                onDelete={setDeleteTarget}
                deleting={deleting && deleteTarget === room.uuid}
              />
            ))}
        </div>
      )}

      {!error && !loading && (
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this listing?"
        description="This will permanently remove the listing. This action can't be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
    
  );
}
