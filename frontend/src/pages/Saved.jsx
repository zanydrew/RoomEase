import { useState } from 'react';
import { Heart } from 'lucide-react';
import RoomCard from '../components/room/RoomCard';
import RoomCardSkeleton from '../components/room/RoomCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import useAsync from '../hooks/useAsync';
import * as favoriteService from '../services/favoriteService';

export default function Saved() {
  const [savedRooms, setSavedRooms] = useState(null);

  const { loading, error, refetch } = useAsync(
    () =>
      favoriteService.getMyFavorites().then((res) => {
        const rooms = (res.data.data.rooms || []).map((room) => ({ ...room, is_favorited: true }));
        setSavedRooms(rooms);
        return rooms;
      }),
    [],
  );

  function handleUnsave(roomId, isFavorited) {
    if (!isFavorited) {
      setSavedRooms((current) => current?.filter((room) => room.uuid !== roomId) || []);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-text">Saved Rooms</h1>

      {error && (
        <div className="mt-6">
          <ErrorState message="Couldn't load your saved rooms." onRetry={refetch} />
        </div>
      )}

      {!error && (
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading && Array.from({ length: 8 }).map((_, i) => <RoomCardSkeleton key={i} />)}

          {!loading && savedRooms?.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={Heart}
                title="No saved rooms yet"
                description="Rooms you save while browsing will show up here."
              />
            </div>
          )}

          {!loading &&
            savedRooms?.map((room) => (
              <RoomCard key={room.uuid} room={room} onFavoriteChange={handleUnsave} />
            ))}
        </div>
      )}
    </div>
  );
}
