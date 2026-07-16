import { useNavigate } from 'react-router-dom';
import { Trash2, ImageOff } from 'lucide-react';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import { ROOM_STATUS, ROOM_STATUS_LABEL } from '../../utils/constants';

export default function RoomListingCard({ room, onDelete, deleting }) {
  const navigate = useNavigate();
  const coverImage = room.images?.find((img) => img.is_primary)?.image_url || room.images?.[0]?.image_url;
  const isAvailable = room.status === ROOM_STATUS.AVAILABLE;

  return (
    // <Link to={`/rooms/${room.uuid}`} >

    <div className="rounded-xl border border-border bg-bg-card p-3">
          {/* <Link to={`/rooms/${room.uuid}`} className="group block"> */}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-bg">
        {coverImage ? (
          <img src={coverImage} alt={room.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <ImageOff size={28} />
          </div>
        )}
        
        <Badge variant={isAvailable ? 'success' : 'neutral'} dot className="absolute left-3 top-3 bg-white/90">
          {ROOM_STATUS_LABEL[room.status] || room.status}
        </Badge>
      </div>
  {/* </Link> */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-base text-text">
          <span className="font-bold">${room.price_per_month}</span>
          <span className="text-text-soft">/mo</span>
        </p>
        <StarRating rating={room.rating} />
      </div>
      <p className="text-sm text-text-soft">
        {room.district}, {room.city}
      </p>

      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/owner/listings/${room.uuid}/edit`)}
          className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-text hover:bg-bg"
        >
          Edit
        </button>
        <button
          type="button"
          aria-label="Delete listing"
          disabled={deleting}
          onClick={() => onDelete(room.uuid)}
          className="flex items-center justify-center rounded-lg border border-danger/30 px-3 text-danger hover:bg-danger-bg disabled:opacity-60"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
    //  </Link>
  ); 
}
