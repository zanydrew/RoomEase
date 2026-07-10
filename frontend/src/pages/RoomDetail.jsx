import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import RoomGallery from '../components/room/RoomGallery';
import AmenityList from '../components/room/AmenityList';
import NearbyUniversityList from '../components/room/NearbyUniversityList';
import BookingCard from '../components/room/BookingCard';
import RoomCard from '../components/room/RoomCard';
import RoomCardSkeleton from '../components/room/RoomCardSkeleton';
import StarRating from '../components/ui/StarRating';
import ErrorState from '../components/ui/ErrorState';
import RoomLocationMap from '../components/ui/RoomLocationMap';
import useAsync from '../hooks/useAsync';
import useFavorite from '../hooks/useFavorite';
import * as roomService from '../services/roomService';
export default function RoomDetail() {
  const { roomId } = useParams();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const { data: room, loading, error, refetch } = useAsync(
    () => roomService.getRoomById(roomId).then((res) => res.data.data.room),
    [roomId],
  );

  const { data: similarRooms, loading: similarLoading } = useAsync(
    () => roomService.getSimilarRooms(roomId).then((res) => res.data.data.rooms),
    [roomId],
  );

  const { isFavorited, toggleFavorite } = useFavorite(roomId, room?.is_favorited);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-text-soft">Loading room...</div>;
  }

  if (error || !room) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorState message="Couldn't load this room." onRetry={refetch} />
      </div>
    );
  }

  const description = room.description || '';
  const isLongDescription = description.length > 260;
  const visibleDescription =
    !descriptionExpanded && isLongDescription ? `${description.slice(0, 260)}...` : description;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text sm:text-3xl">{room.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-soft">
            <StarRating rating={room.rating} />
            {room.reviews_count !== undefined && <span>{room.reviews_count} reviews</span>}
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {room.district}, {room.city}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFavorite}
          className="flex shrink-0 items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg"
        >
          <Heart size={16} className={isFavorited ? 'fill-gold-dark text-gold-dark' : ''} />
          Save
        </button>
      </div>

      {/* Gallery */}
      <div className="mt-6">
        <RoomGallery images={room.images} title={room.title} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-border pb-6">
            {room.owner?.avatar_url ? (
              <img src={room.owner.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-bg" />
            )}
            <div>
              <p className="font-semibold text-text">Hosted by {room.owner?.full_name || 'the owner'}</p>
              {room.owner?.phone_number && <p className="text-sm text-text-soft">{room.owner.phone_number}</p>}
            </div>
          </div>

          <div className="border-b border-border py-6">
            <h2 className="text-lg font-bold text-text">About this room</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-soft">{visibleDescription}</p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((v) => !v)}
                className="mt-2 flex items-center gap-1 text-sm font-semibold text-gold-dark hover:underline"
              >
                {descriptionExpanded ? 'Show less' : 'Show more'}
                {descriptionExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {room.amenities?.length > 0 && (
            <div className="border-b border-border py-6">
              <h2 className="text-lg font-bold text-text">What this room offers</h2>
              <div className="mt-4">
                <AmenityList amenities={room.amenities} />
              </div>
            </div>
          )}

          {room.nearbyUniversities?.length > 0 && (
            <div className="border-b border-border py-6">
              <h2 className="text-lg font-bold text-text">Nearby Universities</h2>
              <div className="mt-4">
                <NearbyUniversityList universities={room.nearbyUniversities} />
              </div>
            </div>
          )}

          <div className="py-6">
            <h2 className="text-lg font-bold text-text">Where you'll be</h2>
            <p className="mt-1 text-sm text-text-soft">
              {room.district}, {room.city}, Cambodia
            </p>
            <div className="mt-4">
              <RoomLocationMap room={room} />
            </div>
          </div>
        </div>

        {/* Right column — sticky booking card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <BookingCard room={room} />
          </div>
        </div>
      </div>

      {/* Similar rooms */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-xl font-bold text-text">Explore similar rooms</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {similarLoading && Array.from({ length: 4 }).map((_, i) => <RoomCardSkeleton key={i} />)}
          {!similarLoading && (similarRooms || []).map((similar) => <RoomCard key={similar.uuid} room={similar} />)}
        </div>
      </div>
    </div>
  );
}
