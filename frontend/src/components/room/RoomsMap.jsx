import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleMap, MarkerF, InfoWindowF, useLoadScript } from '@react-google-maps/api';
import { DARK_MAP_STYLE, CATEGORY_META, CURRENCY_FORMATTER, markerIcon, unpackLocation } from '../../utils/mapConstants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PHNOM_PENH_CENTER = { lat: 11.5564, lng: 104.9282 };

/**
 * Real Google Map for the Browse sidebar — plots every room currently
 * shown in the results list as a pin. Rooms without valid coordinates
 * are silently skipped rather than crashing the map.
 */
export default function RoomsMap({ rooms = [], loading = false }) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [selectedId, setSelectedId] = useState(null);

  const pins = useMemo(
    () =>
      rooms
        .map((room) => ({ room, position: unpackLocation(room.location) }))
        .filter((pin) => pin.position !== null),
    [rooms],
  );

  const center = useMemo(() => {
    if (pins.length === 0) return PHNOM_PENH_CENTER;
    const sum = pins.reduce(
      (acc, pin) => ({ lat: acc.lat + pin.position.lat, lng: acc.lng + pin.position.lng }),
      { lat: 0, lng: 0 },
    );
    return { lat: sum.lat / pins.length, lng: sum.lng / pins.length };
  }, [pins]);

  const onMapLoad = (map) => {
    map.setOptions({ styles: true, disableDefaultUI: true, zoomControl: true });
  };

  const selected = pins.find((pin) => pin.room.uuid === selectedId) || null;

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl bg-[#8a8681]">
      {loadError && (
        <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
          Map failed to load. Check the Google Maps API key.
        </div>
      )}

      {!loadError && !isLoaded && (
        <div
          className="h-full w-full animate-pulse opacity-70"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 14px)',
          }}
        />
      )}

      {isLoaded && (
        <GoogleMap
          mapContainerClassName="h-full min-h-[420px] w-full"
          center={center}
          zoom={pins.length ? 13 : 12}
          onLoad={onMapLoad}
          options={{ styles: true, disableDefaultUI: true, zoomControl: true }}
        >
          {pins.map(({ room, position }) => (
            <MarkerF
              key={room.uuid}
              position={position}
              icon={{
                url: markerIcon(CATEGORY_META[room.room_type]?.color || '#b08d3f'),
                scaledSize: new window.google.maps.Size(28, 28),
                anchor: new window.google.maps.Point(14, 14),
              }}
              onClick={() => setSelectedId(room.uuid)}
            />
          ))}

          {selected && (
            <InfoWindowF position={selected.position} onCloseClick={() => setSelectedId(null)}>
              <Link to={`/rooms/${selected.room.uuid}`} className="block max-w-[200px] text-sm">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-bg">
                  {selected.room.images?.[0]?.image_url && (
                    <img
                      src={selected.room.images[0].image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <p className="mt-2 font-semibold text-text">{selected.room.title}</p>
                <p className="text-text-soft">
                  {CATEGORY_META[selected.room.room_type]?.label || selected.room.room_type} ·{' '}
                  {CURRENCY_FORMATTER.format(Number(selected.room.price_per_month))}/mo
                </p>
                <p className="text-text-soft">
                  {[selected.room.district, selected.room.city].filter(Boolean).join(', ')}
                </p>
              </Link>
            </InfoWindowF>
          )}
        </GoogleMap>
      )}

      {isLoaded && !loading && pins.length === 0 && rooms.length > 0 && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs text-text-soft shadow-lg">
          None of these listings have map coordinates yet
        </div>
      )}
    </div>
  );
}