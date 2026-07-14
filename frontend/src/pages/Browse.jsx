import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import FilterSidebar from '../components/forms/FilterSidebar';
import RoomCard from '../components/room/RoomCard';
import RoomCardSkeleton from '../components/room/RoomCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Pagination from '../components/dashboard/Pagination';
import useAsync from '../hooks/useAsync';
import useDebounce from '../hooks/useDebounce';
import * as roomService from '../services/roomService';
import RoomLocationMap from '../components/ui/RoomLocationMap';
import RoomsMap from '../components/room/RoomsMap';

const PAGE_SIZE = 4;

export default function Browse() {
  const [searchParams] = useSearchParams();

  // Filters coming in from Home's search bar / rail links — read once,
  // this page's own controls (price/amenities/pagination) drive the rest.
  const keyword = searchParams.get('keyword') || '';
  const district = searchParams.get('district') || '';
  const universityName = searchParams.get('university') || '';
  const universityId = searchParams.get('university_id') || '';
  const sort = searchParams.get('sort') || '';

  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 10);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 1000);
  
  const [amenityIds, setAmenityIds] = useState([]);
  const [page, setPage] = useState(1);

  const debouncedMinPrice = useDebounce(minPrice, 400);
  const debouncedMaxPrice = useDebounce(maxPrice, 400);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [keyword, district, universityId, sort, debouncedMinPrice, debouncedMaxPrice, amenityIds]);

  const { data, loading, error, refetch } = useAsync(
    () =>
      roomService
        .getRooms({
          keyword: keyword || undefined,
          district: district || undefined,
          university_id: universityId || undefined,
          sort: sort || undefined,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
          amenities: amenityIds.length ? amenityIds.join(',') : undefined,
          page,
          limit: PAGE_SIZE,
        })
        .then((res) => res.data.data),
    [keyword, district, universityId, sort, debouncedMinPrice, debouncedMaxPrice, amenityIds, page],
  );

  const rooms = data?.rooms || [];
  const total = data?.total ?? rooms.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const areaLabel = district || universityName || keyword || 'Phnom Penh';

  function toggleAmenity(id) {
    setAmenityIds((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <FilterSidebar
          minPrice={minPrice}
          maxPrice={maxPrice}
          amenityIds={amenityIds}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
          onToggleAmenity={toggleAmenity}
        />

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-text">
            {total > 0 ? `Over ${total} rooms around ${areaLabel}` : `Rooms around ${areaLabel}`}
          </h1>

          {error && <ErrorState message="Couldn't load rooms." onRetry={refetch} />}

          {!error && (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <RoomCardSkeleton key={i} />)}

              {!loading && rooms.length === 0 && (
                <div className="col-span-full">
                  <EmptyState icon={HomeIcon} title="No rooms match your filters" description="Try widening your price range or removing some amenities." />
                </div>
              )}

              {!loading && rooms.map((room) => <RoomCard key={room.uuid} room={room} />)}
            </div>
          )}

          {!error && !loading && (
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        <div className="hidden w-full max-w-sm shrink-0 lg:block">
          {!loading && !error &&  <RoomsMap rooms={rooms} loading={loading} /> }
        </div>
      </div>
    </div>
  );
}
