import { useCallback, useRef, useState } from 'react';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { LocateFixed, LoaderCircle, Search } from 'lucide-react';
import { DARK_MAP_STYLE } from '../../utils/mapConstants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const PHNOM_PENH_CENTER = { lat: 11.5564, lng: 104.9282 };

function toFixedNumber(value) {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Lets the owner set a room's exact coordinates by clicking or dragging
 * a pin on a real Google Map, or by geocoding the typed address as a
 * starting point. Falls back to manual lat/lng entry if the map script
 * fails to load, so the form is never blocked.
 */
export default function LocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onLatChange,
  onLngChange,
  errors = {},
}) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [pickerError, setPickerError] = useState('');
  const mapRef = useRef(null);

  const hasPosition = latitude !== '' && longitude !== '' && latitude != null && longitude != null;
  const position = hasPosition ? { lat: Number(latitude), lng: Number(longitude) } : null;
  const mapCenter = position || PHNOM_PENH_CENTER;

  const setPosition = useCallback(
    (lat, lng) => {
      onLatChange(toFixedNumber(lat));
      onLngChange(toFixedNumber(lng));
    },
    [onLatChange, onLngChange],
  );

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    map.setOptions({ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true });
  }, []);

  function handleMapClick(e) {
    setPickerError('');
    setPosition(e.latLng.lat(), e.latLng.lng());
  }

  function handleMarkerDragEnd(e) {
    setPickerError('');
    setPosition(e.latLng.lat(), e.latLng.lng());
  }

  function handleGeocodeAddress() {
    if (!address.trim()) {
      setPickerError('Type an address above first.');
      return;
    }
    if (!window.google) return;

    setGeocoding(true);
    setPickerError('');

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: `${address}, Phnom Penh, Cambodia` }, (results, status) => {
      setGeocoding(false);
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        setPosition(loc.lat(), loc.lng());
        if (mapRef.current) {
          mapRef.current.panTo({ lat: loc.lat(), lng: loc.lng() });
          mapRef.current.setZoom(16);
        }
      } else {
        setPickerError('Could not find that address. Try dropping the pin manually instead.');
      }
    });
  }

  function handleFindMyLocation() {
    if (!navigator.geolocation) {
      setPickerError('Location is not supported by this browser.');
      return;
    }
    setLocating(true);
    setPickerError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setPosition(pos.coords.latitude, pos.coords.longitude);
        if (mapRef.current) {
          mapRef.current.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          mapRef.current.setZoom(16);
        }
      },
      (err) => {
        setLocating(false);
        setPickerError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied.'
            : 'Could not determine your location.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-text">Location</p>

      <div className="mt-3">
        <label htmlFor="address" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
          Exact Address
        </label>
        <div className="flex gap-2">
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="House #, Street, Sangkat, Khan..."
            className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
              errors.address ? 'border-danger' : 'border-border'
            }`}
          />
          <button
            type="button"
            onClick={handleGeocodeAddress}
            disabled={!isLoaded || geocoding}
            title="Find this address on the map"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2.5 text-xs font-semibold text-text hover:bg-bg disabled:opacity-60"
          >
            {geocoding ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}
            Locate
          </button>
        </div>
        {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
      </div>

      <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl bg-[#8a8681]">
        {loadError && (
          <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
            Map failed to load. Check the Google Maps API key. You can still enter coordinates manually below.
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
            center={mapCenter}
            zoom={position ? 16 : 13}
            onLoad={onMapLoad}
            onClick={handleMapClick}
            options={{ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          >
            {position && (
              <MarkerF
                position={position}
                draggable
                onDragEnd={handleMarkerDragEnd}
                icon={{
                  url:
                    'data:image/svg+xml;charset=UTF-8,' +
                    encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <circle cx="16" cy="16" r="9" fill="#b08d3f" stroke="#ffffff" stroke-width="2.5"/>
                      </svg>`,
                    ),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 16),
                }}
              />
            )}
          </GoogleMap>
        )}

        {isLoaded && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-1.5 text-xs text-text-soft shadow-sm">
            {position ? 'Drag the pin, or click the map, to fine-tune the exact spot.' : 'Click the map to drop a pin at your property.'}
          </span>
        )}

        {isLoaded && (
          <button
            type="button"
            onClick={handleFindMyLocation}
            disabled={locating}
            aria-label="Use my current location"
            title="Use my current location"
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2b2b28] shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {locating ? <LoaderCircle size={16} className="animate-spin" /> : <LocateFixed size={16} />}
          </button>
        )}
      </div>

      {pickerError && <p className="mt-2 text-xs text-danger">{pickerError}</p>}

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="latitude" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLatChange(e.target.value)}
            placeholder="11.5564"
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLngChange(e.target.value)}
            placeholder="104.9282"
            className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-text-soft">
        These update automatically when you use the map above, but you can also type them directly.
      </p>
    </div>
  );
}
