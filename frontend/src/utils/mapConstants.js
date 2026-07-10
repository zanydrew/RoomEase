import { Home, Building2, Building, Users2 } from 'lucide-react';

// Muted, near-monochrome style matching the Figma mockup: dark base,
// pale hairline roads, no POI/transit clutter.
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#79766f' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#e8e6e1' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#5c5952' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#c9c6be' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#79766f' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e8e6e1' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#d4d1c9' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#a8a59c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#6b6862' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#79766f' }] },
];

export const CATEGORY_META = {
  STUDIO: { label: 'Studio', icon: Home, color: '#b08d3f' },
  '1BR': { label: '1 Bedroom', icon: Building2, color: '#5f8a5a' },
  '2BR': { label: '2 Bedroom', icon: Building, color: '#5a76a8' },
  SHARED: { label: 'Shared', icon: Users2, color: '#a15a8f' },
};

export const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function markerIcon(color) {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="8" fill="${color}" stroke="#ffffff" stroke-width="2"/>
    </svg>`
  );
  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

/**
 * Unpack a Sequelize GEOMETRY(POINT) field into { lat, lng }.
 * Sequelize/MySQL returns GeoJSON, whose `coordinates` are ordered
 * [lng, lat] — NOT [lat, lng]. Returns null if the shape is missing
 * or malformed, so callers can fall back gracefully.
 */
export function unpackLocation(location) {
  const coords = location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const [lng, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}
