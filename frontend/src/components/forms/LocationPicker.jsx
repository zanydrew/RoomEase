import { useEffect, useState } from 'react';
import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { DARK_MAP_STYLE, CATEGORY_META, CURRENCY_FORMATTER, markerIcon, unpackLocation } from '../../utils/mapConstants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 11.5564, lng: 104.9282 };

function toLocation(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }

  return null;
}

export default function LocationPicker({
  address,
  onAddressChange,
  latitude,
  longitude,
  onLatChange,
  onLngChange,
  errors = {},
}) {
  
  const [pinnedLocation, setPinnedLocation] = useState(() => toLocation(latitude, longitude));
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
  });
 

  useEffect(() => {
    const nextLocation = toLocation(latitude, longitude);
    if (nextLocation) {
      setPinnedLocation(nextLocation);
    }
  }, [latitude, longitude]);

  const updateCoordinates = (lat, lng) => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      onLatChange(String(lat));
      onLngChange(String(lng));
      setPinnedLocation({ lat, lng });
    }
  };
 

  const handleMapClick = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    updateCoordinates(lat, lng);
  };

  const handleMarkerDragEnd = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    updateCoordinates(lat, lng);
  };

  const center = pinnedLocation || DEFAULT_CENTER;

  return (
    <div>
      <p className="text-sm font-semibold text-text">Location</p>

      <div className="mt-3">
        <label htmlFor="address" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
          Exact Address
        </label>
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
        {errors.address && <p className="mt-1 text-xs text-danger">{errors.address}</p>}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl bg-bg">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-text-soft">
            Add a Google Maps API key to enable the interactive map picker.
          </div>
        ) : loadError ? (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-text-soft">
            The map could not be loaded. Check the API key and Google Maps permissions.
          </div>
        ) : !isLoaded ? (
          <div className="flex h-48 items-center justify-center text-sm text-text-soft">
            Loading map...
          </div>
        ) : (
          <GoogleMap
            mapContainerClassName="h-48 w-full"
            center={{ lat: 11.5564, lng: 104.9282 }}
            zoom={13}
            onClick={handleMapClick}
            options={{ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          >
              

            <MarkerF position={center} draggable onDragEnd={handleMarkerDragEnd} />
          </GoogleMap>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs text-text-soft shadow-sm">
          Click or drag the pin to choose the exact location.
        </div>
      </div>

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
    </div>
  );
}
