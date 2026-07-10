import { Star } from 'lucide-react';

/**
 * Displays a star icon + numeric rating. There's currently no review API
 * (see Step 4 notes — Review model exists but has no exposed routes), so
 * callers pass a placeholder rating for now. Renders nothing if no rating
 * is available, rather than showing a fake "0.0".
 */
export default function StarRating({ rating, size = 14, className = '' }) {
  if (rating === undefined || rating === null) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium text-text ${className}`}>
      <Star size={size} className="fill-gold text-gold" />
      {rating.toFixed(1)}
    </span>
  );
}
