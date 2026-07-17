import { useEffect, useState } from 'react';
import { Home, DoorOpen, DoorClosed } from 'lucide-react';
import { getMyRooms } from '../../services/ownerService';

const STAT_CARDS = [
  { key: 'total', label: 'Total Posted', icon: Home, color: 'bg-gold-dark' },
  { key: 'available', label: 'Available', icon: DoorOpen, color: 'bg-emerald-600' },
  { key: 'unavailable', label: 'Unavailable', icon: DoorClosed, color: 'bg-red-600' },
];

export default function Report() {
  const [values, setValues] = useState({ total: 0, available: 0, unavailable: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyRooms({ limit: 9999 })
      .then((res) => {
        if (cancelled) return;
        const rooms = res.data?.data?.rooms ?? [];
        const total = rooms.length;
        const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
        const unavailable = rooms.filter((r) => r.status === 'RENTED').length;
        setValues({ total, available, unavailable });
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        if (!cancelled) setError('Could not load statistics.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Reports</h1>
      <p className="mt-1 text-sm text-text-soft">
        Overview of your room listings on the platform.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm"
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${color} text-white`}>
              <Icon size={22} />
            </span>
            <div>
              {loading ? (
                <div className="h-7 w-12 animate-pulse rounded bg-bg" />
              ) : (
                <p className="text-2xl font-bold text-text">{values[key]}</p>
              )}
              <p className="text-sm text-text-soft">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
