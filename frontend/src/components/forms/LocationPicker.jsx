import { MapPin } from 'lucide-react';

/**
 * No interactive map library (Leaflet/Mapbox/Google Maps) is wired into
 * this project, so dragging a pin isn't possible yet. Latitude/longitude
 * are entered manually in the meantime — swap the static panel below for
 * a real map component once a map API key is configured.
 */
export default function LocationPicker({ address, onAddressChange, latitude, longitude, onLatChange, onLngChange, errors = {} }) {
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

      <div className="relative mt-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-bg">
        <MapPin size={26} className="text-gold-dark" />
        <span className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-1.5 text-xs text-text-soft shadow-sm">
          Drag the pin to the exact location of your property.
        </span>
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
