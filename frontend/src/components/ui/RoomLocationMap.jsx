import { useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useLoadScript } from '@react-google-maps/api';
import { MapPin, Navigation } from 'lucide-react';
import { DARK_MAP_STYLE, CATEGORY_META, CURRENCY_FORMATTER, markerIcon, unpackLocation } from '../../utils/mapConstants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/**
 * Shows a single room's exact location on a Google Map, matching the
 * dark/muted theme used on the "Browse Map" preview. Falls back to a
 * simple placeholder if the room has no usable location data.
 */
export default function RoomLocationMap({ room }) {
  const [infoOpen, setInfoOpen] = useState(true);
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  const position = unpackLocation(room?.location);
  const categoryMeta = CATEGORY_META[room?.room_type];

  const onMapLoad = (map) => {
    map.setOptions({ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true });
  };

  const directionsUrl = position
    ? `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`
    : null;

  if (!position) {
    return (
      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-[#e7ddc9]">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, transparent 1px, transparent 36px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, transparent 1px, transparent 36px)',
          }}
        />
        <span className="relative rounded-full bg-white px-4 py-2 text-xs font-semibold text-text shadow-md">
          Location not available for this room
        </span>
        <MapPin size={22} className="absolute text-gold-dark" style={{ top: '58%' }} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#8a8681]">
      <div className="h-64 w-full sm:h-80">
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
            mapContainerClassName="h-full w-full"
            center={position}
            zoom={15}
            onLoad={onMapLoad}
            options={{ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          >
            <MarkerF
              position={position}
              icon={{
                url: markerIcon(categoryMeta?.color || '#b08d3f'),
                scaledSize: new window.google.maps.Size(32, 32),
                anchor: new window.google.maps.Point(16, 16),
              }}
              onClick={() => setInfoOpen((v) => !v)}
            />

            {infoOpen && (
              <InfoWindowF position={position} onCloseClick={() => setInfoOpen(false)}>
                <div className="max-w-[200px] text-sm">
                  <p className="font-semibold text-text">{room.title}</p>
                  <p className="text-text-soft">
                    {categoryMeta?.label || room.room_type}
                    {Number.isFinite(Number(room.price_per_month)) &&
                      ` · ${CURRENCY_FORMATTER.format(Number(room.price_per_month))}/mo`}
                  </p>
                  <p className="text-text-soft">
                    {[room.address, room.district].filter(Boolean).join(', ')}
                  </p>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </div>

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#2b2b28] shadow-lg transition-opacity hover:opacity-90"
        >
          <Navigation size={14} />
          Get directions
        </a>
      )}
    </div>
  );
}
