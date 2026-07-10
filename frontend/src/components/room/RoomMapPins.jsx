import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Star } from 'lucide-react';

// Deterministic pseudo-random position from a room's id, so pins don't
// jump around on re-render. This is a decorative placeholder — there's
// no map library (Leaflet/Mapbox/Google Maps) wired into this project
// yet, so pins aren't plotted from real lat/lng coordinates.
function pinPosition(seed) {
  const hash = String(seed)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    top: `${10 + ((hash * 37) % 75)}%`,
    left: `${8 + ((hash * 53) % 80)}%`,
  };
}

export default function RoomMapPins({ rooms }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl bg-[#c9c2b4]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.15) 0px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, transparent 1px, transparent 40px)',
        }}
      />

      {rooms.map((room) => {
        const pos = pinPosition(room.uuid);
        return (
          <div key={room.uuid} className="absolute z-10" style={pos} onMouseLeave={() => setHoveredId(null)}>
            <button
              type="button"
              onMouseEnter={() => setHoveredId(room.uuid)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-colors ${
                hoveredId === room.uuid ? 'bg-gold-dark text-white' : 'bg-white text-text'
              }`}
            >
              ${room.price_per_month}
            </button>

            {hoveredId === room.uuid && (
              <Link
                to={`/rooms/${room.uuid}`}
                className="absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl bg-white p-3 text-left shadow-xl"
              >
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-bg">
                  {room.images?.[0]?.image_url && (
                    <img src={room.images[0].image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <p className="font-bold text-text">
                    ${room.price_per_month} <span className="font-normal text-text-soft">/month</span>
                  </p>
                  {room.rating && (
                    <span className="flex items-center gap-1 text-xs font-medium text-text">
                      <Star size={12} className="fill-gold text-gold" />
                      {room.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-text-soft">
                  {room.district}, {room.city}
                </p>
              </Link>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          aria-label="Zoom in"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-text shadow-md hover:bg-bg"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-text shadow-md hover:bg-bg"
        >
          <Minus size={16} />
        </button>
      </div>
    </div>
  );
}
