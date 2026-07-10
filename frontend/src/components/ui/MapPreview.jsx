import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, MarkerF, InfoWindowF, useLoadScript } from '@react-google-maps/api';
import { MapPin, LocateFixed, LoaderCircle } from 'lucide-react';
import { getRoomsForMap } from '../../services/roomService';
import { DARK_MAP_STYLE, CATEGORY_META, CURRENCY_FORMATTER, markerIcon } from '../../utils/mapConstants';

// Vite projects: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
// CRA projects: swap this line for process.env.REACT_APP_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function formatDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters)) return null;
  const km = distanceMeters / 1000;
  return `${km < 1 ? Math.round(distanceMeters) + ' m' : km.toFixed(1) + ' km'} away`;
}

function userLocationIcon() {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="15" fill="#2b6cb0" fill-opacity="0.18"/>
      <circle cx="17" cy="17" r="7" fill="#2b6cb0" stroke="#ffffff" stroke-width="2.5"/>
    </svg>`
  );
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

/**
 * Interactive Google Map teaser. Shows the "Search by Area" card on load;
 * clicking "Browse Map" reveals every room in the database as a marker.
 * The locate button just centers the map on the user — it no longer
 * filters which rooms are shown.
 */
export default function MapPreview({
  title = 'Search by Area',
  description = 'Find the perfect spot based on proximity to your favorite local cafes, parks, and campuses.',
  buttonText = 'Browse Map',
  center = { lat: 11.5564, lng: 104.9282 }, // Phnom Penh
  zoom = 13,
}) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

  const [browsing, setBrowsing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState(null);

  const mapRef = useRef(null);
  const categories = Object.keys(CATEGORY_META);

  const normalizeRooms = (raw) =>
    (Array.isArray(raw) ? raw : []).map((room) => ({
      ...room,
      lat: Number(room.lat),
      lng: Number(room.lng),
      price_per_month: Number(room.price_per_month),
      distance_meters:
        room.distance_meters !== undefined ? Number(room.distance_meters) : undefined,
    }));

  // Load every approved/available listing so the map always shows the
  // full set of rooms in the database, regardless of the user's location.
  const loadAllRooms = useCallback(async () => {
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const res = await getRoomsForMap();
      setRooms(normalizeRooms(res.data?.data?.rooms));
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setRoomsError('Could not load listings. Please try again.');
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.setOptions({ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true });
  }, []);

  // Ask for the user's location and pan the map there. This is purely
  // for orientation — it does not change which rooms are displayed.
  const handleFindMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Location is not supported by this browser.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(coords);
        setLocating(false);

        if (mapRef.current) {
          mapRef.current.panTo(coords);
          mapRef.current.setZoom(14);
        }
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location access was denied. Enable it in your browser settings to see your position on the map.'
            : 'Could not determine your location.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // As soon as the map is opened, load every room from the database.
  useEffect(() => {
    if (browsing && rooms.length === 0 && !roomsLoading) {
      loadAllRooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browsing]);

  const visibleMarkers = useMemo(() => {
    const filtered =
      activeCategory === 'all' ? rooms : rooms.filter((room) => room.room_type === activeCategory);
    return filtered.filter((room) => Number.isFinite(room.lat) && Number.isFinite(room.lng));
  }, [activeCategory, rooms]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#8a8681]">
      <div className="h-80 w-full sm:h-96">
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
            center={center}
            zoom={zoom}
            onLoad={onMapLoad}
            options={{ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          >
            {browsing &&
              visibleMarkers.map((room) => (
                <MarkerF
                  key={room.uuid}
                  position={{ lat: room.lat, lng: room.lng }}
                  icon={{
                    url: markerIcon(CATEGORY_META[room.room_type]?.color || '#8a8681'),
                    scaledSize: new window.google.maps.Size(28, 28),
                    anchor: new window.google.maps.Point(14, 14),
                  }}
                  onClick={() => setSelected(room)}
                />
              ))}

            {browsing && userLocation && (
              <MarkerF
                position={userLocation}
                icon={{
                  url: userLocationIcon(),
                  scaledSize: new window.google.maps.Size(34, 34),
                  anchor: new window.google.maps.Point(17, 17),
                }}
                zIndex={999}
              />
            )}

            {browsing && selected && (
              <InfoWindowF
                position={{ lat: selected.lat, lng: selected.lng }}
                onCloseClick={() => setSelected(null)}
              >
                <div className="max-w-[200px] text-sm">
                  <p className="font-semibold text-text">{selected.title}</p>
                  <p className="text-text-soft">
                    {CATEGORY_META[selected.room_type]?.label || selected.room_type} ·{' '}
                    {CURRENCY_FORMATTER.format(selected.price_per_month)}/mo
                  </p>
                  <p className="text-text-soft">
                    {[selected.address, selected.district].filter(Boolean).join(', ')}
                  </p>
                  {formatDistance(selected.distance_meters) && (
                    <p className="mt-1 text-xs font-medium text-gold-dark">
                      {formatDistance(selected.distance_meters)}
                    </p>
                  )}
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        )}
      </div>

      {browsing && (
        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-2 rounded-full bg-white/95 p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === 'all' ? 'bg-[#2b2b28] text-white' : 'text-text-soft hover:bg-bg'
            }`}
          >
            All
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_META[cat].icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === cat ? 'bg-[#2b2b28] text-white' : 'text-text-soft hover:bg-bg'
                }`}
              >
                <Icon size={14} />
                {CATEGORY_META[cat].label}
              </button>
            );
          })}
        </div>
      )}

      {browsing && (
        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
          {locationError && (
            <div className="max-w-[200px] rounded-lg bg-white/95 px-3 py-2 text-xs text-red-700 shadow-lg">
              {locationError}
            </div>
          )}
          <button
            type="button"
            onClick={handleFindMyLocation}
            disabled={locating}
            aria-label="Find my current location"
            title="Find my current location"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b2b28] shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {locating ? <LoaderCircle size={20} className="animate-spin" /> : <LocateFixed size={20} />}
          </button>
        </div>
      )}

      {browsing && (roomsLoading || roomsError) && (
        <div className="absolute left-1/2 top-16 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs shadow-lg">
          {roomsLoading && <span className="text-text-soft">Loading listings…</span>}
          {!roomsLoading && roomsError && <span className="text-red-700">{roomsError}</span>}
        </div>
      )}

      {!browsing && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg text-gold-dark">
              <MapPin size={22} />
            </span>
            <h3 className="mt-3 text-base font-bold text-text">{title}</h3>
            <p className="mt-2 text-sm text-text-soft">{description}</p>
            <button
              type="button"
              onClick={() => setBrowsing(true)}
              className="mt-4 w-full rounded-full bg-[#2b2b28] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {buttonText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
