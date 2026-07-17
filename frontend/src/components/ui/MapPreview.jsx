import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { DARK_MAP_STYLE } from '../../utils/mapConstants';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapPreview({
  center = { lat: 11.5564, lng: 104.9282 },
  zoom = 13,
}) {
  const { isLoaded, loadError } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY });

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
            options={{ styles: DARK_MAP_STYLE, disableDefaultUI: true, zoomControl: true }}
          />
        )}
      </div>
    </div>
  );
}
