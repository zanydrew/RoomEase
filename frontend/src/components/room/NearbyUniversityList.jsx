import { GraduationCap } from 'lucide-react';

export default function NearbyUniversityList({ universities = [] }) {
  if (universities.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {universities.map((uni) => {
        // Sequelize nests through-table columns under the join model's
        // name by default; normalize both shapes defensively.
        const distanceKm = uni.distance_km ?? uni.NearbyUniversity?.distance_km;
        const walkMinutes = uni.walk_minutes ?? uni.NearbyUniversity?.walk_minutes;

        return (
          <div key={uni.id} className="flex items-center gap-3 rounded-lg bg-bg px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/30 text-gold-dark">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-text">{uni.name}</p>
              <p className="text-xs text-text-soft">
                {walkMinutes ? `${walkMinutes} mins walk` : null}
                {walkMinutes && distanceKm ? ' • ' : ''}
                {distanceKm ? `${distanceKm} km` : null}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
