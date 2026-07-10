import {
  Wifi,
  Snowflake,
  UtensilsCrossed,
  Shirt,
  Briefcase,
  Tv,
  ParkingCircle,
  Dumbbell,
  Waves,
  PawPrint,
  CheckCircle2,
} from 'lucide-react';

const ICON_RULES = [
  { keywords: ['wifi', 'internet'], icon: Wifi },
  { keywords: ['air', 'conditioning', 'ac'], icon: Snowflake },
  { keywords: ['kitchen'], icon: UtensilsCrossed },
  { keywords: ['washer', 'laundry'], icon: Shirt },
  { keywords: ['workspace', 'desk'], icon: Briefcase },
  { keywords: ['tv', 'television'], icon: Tv },
  { keywords: ['parking'], icon: ParkingCircle },
  { keywords: ['gym'], icon: Dumbbell },
  { keywords: ['pool'], icon: Waves },
  { keywords: ['pet'], icon: PawPrint },
];

function iconFor(amenity) {
  const key = `${amenity.icon || ''} ${amenity.name || ''}`.toLowerCase();
  const match = ICON_RULES.find((rule) => rule.keywords.some((word) => key.includes(word)));
  return match?.icon || CheckCircle2;
}

export default function AmenityList({ amenities = [] }) {
  if (amenities.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {amenities.map((amenity) => {
        const Icon = iconFor(amenity);
        return (
          <div key={amenity.id} className="flex items-center gap-3 text-sm text-text">
            <Icon size={18} className="text-text-soft" />
            {amenity.name}
          </div>
        );
      })}
    </div>
  );
}
