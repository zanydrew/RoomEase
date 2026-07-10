import { useMemo } from 'react';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import SearchBar from '../components/forms/SearchBar';
import RoomCard from '../components/room/RoomCard';
import RoomCardSkeleton from '../components/room/RoomCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import MapPreview from '../components/ui/MapPreview';
import useAsync from '../hooks/useAsync';
import * as roomService from '../services/roomService';
import * as universityService from '../services/universityService';
// import GoogleMapSection from '../components/googleMap/googleMaoSection';

const RAIL_SIZE = 4;

function RoomRail({ title, browseHref, rooms, loading, error }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text">{title}</h2>
        <a
          href={browseHref}
          aria-label={`See more ${title}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-soft transition-colors hover:bg-bg"
        >
          <ChevronRight size={18} />
        </a>
      </div>

      {error && <ErrorState message="Couldn't load these rooms." />}

      {!error && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading &&
            Array.from({ length: RAIL_SIZE }).map((_, i) => <RoomCardSkeleton key={i} />)}

          {!loading && rooms.length === 0 && (
            <div className="col-span-full">
              <EmptyState icon={HomeIcon} title="No rooms found in this area yet" />
            </div>
          )}

          {!loading && rooms.map((room) => <RoomCard key={room.uuid} room={room} />)}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  // Rail 1 — a specific district
  const toulKork = useAsync(
    () => roomService.getRooms({ district: 'Toul Kork', limit: RAIL_SIZE }).then((res) => res.data.data.rooms),
    [],
  );

  // Rail 2 — rooms near Royal University of Phnom Penh. We look the
  // university up by name since Home doesn't otherwise need the full list.
  const rupp = useAsync(async () => {
    const { data } = await universityService.getUniversities();
    const universities = data.data.universities || [];
    const match = universities.find((u) => u.name.toLowerCase().includes('royal university of phnom penh'));

    const res = match
      ? await roomService.getRooms({ university_id: match.id, limit: RAIL_SIZE })
      : await roomService.getFeaturedRooms({ limit: RAIL_SIZE });

    return res.data.data.rooms;
  }, []);

  // Rail 3 — "Affordable rooms for workers": cheapest rooms first.
  const affordable = useAsync(
    () => roomService.getRooms({ sort: 'price_asc', limit: RAIL_SIZE }).then((res) => res.data.data.rooms),
    [],
  );

  const rails = useMemo(
    () => [
      { title: 'Rooms around Toul Kork', browseHref: '/browse?district=Toul+Kork', state: toulKork },
      {
        title: 'Rooms around Royal University of Phnom Penh',
        browseHref: '/browse',
        state: rupp,
      },
      { title: 'Affordable rooms for workers', browseHref: '/browse?sort=price_asc', state: affordable },
    ],
    [toulKork, rupp, affordable],
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[420px] items-end overflow-hidden bg-gradient-to-br from-[#2f2a22] via-[#4a3f2e] to-[#7c6640] sm:min-h-[480px]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            Find Your Place in Phnom Penh
          </h1>
        </div>
      </section>

      {/* Search bar overlapping the hero's bottom edge */}
      <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4 sm:-mt-10 sm:px-6 lg:px-8">
        <SearchBar />
      </div>

      {rails.map((rail) => (
        <RoomRail
          key={rail.title}
          title={rail.title}
          browseHref={rail.browseHref}
          rooms={rail.state.data || []}
          loading={rail.state.loading}
          error={rail.state.error}
        />
      ))}

      {/* Explore the Neighborhood */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-text">Explore the Neighborhood</h2>
          <p className="mt-2 text-sm text-text-soft">
            Visualise your commute and nearby amenities with our interactive concierge map.
          </p>
        </div>
        <div className="mt-8">
          <MapPreview />
          {/* <GoogleMapSection /> */}
        </div>
      </section>
    </div>
  );
}
