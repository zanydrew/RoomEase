import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

/**
 * Decorative map teaser. No live map tiles are wired in yet (no Google
 * Maps/Mapbox key configured in this project) — this renders a static
 * placeholder background so the section works today and can be swapped
 * for a real map component later without changing the surrounding layout.
 */
export default function MapPreview({
  title = 'Search by Area',
  description = 'Find the perfect spot based on proximity to your favorite local cafes, parks, and campuses.',
  buttonText = 'Browse Map',
  buttonTo = '/browse',
}) {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#8a8681]">
      <div
        className="h-80 w-full opacity-70 sm:h-96"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 14px)',
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg text-gold-dark">
            <MapPin size={22} />
          </span>
          <h3 className="mt-3 text-base font-bold text-text">{title}</h3>
          <p className="mt-2 text-sm text-text-soft">{description}</p>
          <button
            type="button"
            onClick={() => navigate(buttonTo)}
            className="mt-4 w-full rounded-full bg-[#2b2b28] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
