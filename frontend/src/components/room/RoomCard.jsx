import { Link } from 'react-router-dom';
import { Heart, MapPin, ImageOff } from 'lucide-react';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import useFavorite from '../../hooks/useFavorite';
import { ROOM_STATUS, ROOM_STATUS_LABEL } from '../../utils/constants';

export default function RoomCard({ room, onFavoriteChange }) {
  const { isFavorited, toggleFavorite } = useFavorite(room.uuid, room.is_favorited, onFavoriteChange);

  const coverImage = room.images?.find((img) => img.is_primary)?.image_url || room.images?.[0]?.image_url;
  const isAvailable = room.status === ROOM_STATUS.AVAILABLE;

  return (
    <Link to={`/rooms/${room.uuid}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-bg">
        <div className="aspect-[4/3] w-full">
          {coverImage ? (
            <img
              src={coverImage}
              alt={room.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <ImageOff size={28} />
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />

        <Badge
          variant={isAvailable ? 'success' : 'neutral'}
          dot
          className="absolute left-3 top-3 bg-white/90"
        >
          {ROOM_STATUS_LABEL[room.status] || room.status}
        </Badge>

        <button
          type="button"
          aria-label={isFavorited ? 'Remove from saved' : 'Save room'}
          onClick={toggleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 transition-transform hover:scale-105"
        >
          <Heart size={17} className={isFavorited ? 'fill-gold-dark text-gold-dark' : 'text-text'} />
        </button>

        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-text opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100">
          View Details
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-base text-text">
          <span className="font-bold">${room.price_per_month}</span>
          <span className="text-text-soft">/mo</span>
        </p>
        <StarRating rating={room.rating} />
      </div>

      <p className="mt-1 flex items-center gap-1 text-sm text-text-soft">
        <MapPin size={14} />
        {room.district}, {room.city}
      </p>
    </Link>
  );
}
