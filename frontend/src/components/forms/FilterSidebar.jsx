import { useEffect, useState } from 'react';
import * as amenityService from '../../services/amenityService';

const PRICE_FLOOR = 50;
const PRICE_CEIL = 1000;

export default function FilterSidebar({ minPrice, maxPrice, amenityIds, onPriceChange, onToggleAmenity }) {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    amenityService
      .getAmenities()
      .then((res) => setAmenities(res.data.data.amenities || []))
      .catch(() => setAmenities([]));
  }, []);

  function handleMinChange(value) {
    const next = Math.min(Number(value), maxPrice - 10);
    onPriceChange(next, maxPrice);
  }

  function handleMaxChange(value) {
    const next = Math.max(Number(value), minPrice + 10);
    onPriceChange(minPrice, next);
  }

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div>
        <h3 className="text-sm font-semibold text-text">Price range</h3>

        <div className="relative mt-6 h-1.5 rounded-full bg-border">
          <div
            className="absolute h-1.5 rounded-full bg-gold-dark"
            style={{
              left: `${((minPrice - PRICE_FLOOR) / (PRICE_CEIL - PRICE_FLOOR)) * 100}%`,
              right: `${100 - ((maxPrice - PRICE_FLOOR) / (PRICE_CEIL - PRICE_FLOOR)) * 100}%`,
            }}
          />
          <input
            type="range"
            aria-label="Minimum price"
            min={PRICE_FLOOR}
            max={PRICE_CEIL}
            value={minPrice}
            onChange={(e) => handleMinChange(e.target.value)}
            className="absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-dark [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-dark [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            aria-label="Maximum price"
            min={PRICE_FLOOR}
            max={PRICE_CEIL}
            value={maxPrice}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-gold-dark [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-gold-dark [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm font-medium text-text">
          <span>${minPrice}</span>
          <span>{maxPrice >= PRICE_CEIL ? `$${PRICE_CEIL}+` : `$${maxPrice}`}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-text">Amenities</h3>
        <div className="mt-4 flex flex-col gap-3">
          {amenities.map((amenity) => (
            <label key={amenity.id} className="flex items-center gap-2.5 text-sm text-text">
              <input
                type="checkbox"
                checked={amenityIds.includes(amenity.id)}
                onChange={() => onToggleAmenity(amenity.id)}
                className="h-4 w-4 rounded border-border text-gold-dark focus:ring-gold-dark/30"
              />
              {amenity.name}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
