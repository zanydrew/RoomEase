import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import * as universityService from '../../services/universityService';

const PRICE_RANGES = [
  { label: 'Any price', value: '' },
  { label: '$0 - $200', minPrice: 0, maxPrice: 200 },
  { label: '$200 - $400', minPrice: 200, maxPrice: 400 },
  { label: '$400 - $600', minPrice: 400, maxPrice: 600 },
  { label: '$600+', minPrice: 600, maxPrice: '' },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [priceIndex, setPriceIndex] = useState(0);
  const [universityId, setUniversityId] = useState('');
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    universityService
      .getUniversities()
      .then((res) => setUniversities(res.data.data.universities || []))
      .catch(() => setUniversities([]));
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());

    const range = PRICE_RANGES[priceIndex];
    if (range.minPrice !== undefined && range.minPrice !== '') params.set('minPrice', range.minPrice);
    if (range.maxPrice !== undefined && range.maxPrice !== '') params.set('maxPrice', range.maxPrice);

    if (universityId) params.set('university_id', universityId);

    navigate(`/browse?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2"
    >
      <div className="flex-1 px-4 py-1 sm:border-r sm:border-border">
        <label htmlFor="search-where" className="block text-xs font-semibold text-text">
          Where
        </label>
        <input
          id="search-where"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Toul Kork, BKK1..."
          className="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <div className="flex-1 px-4 py-1 sm:border-r sm:border-border">
        <label htmlFor="search-price" className="block text-xs font-semibold text-text">
          Price Range
        </label>
        <select
          id="search-price"
          value={priceIndex}
          onChange={(e) => setPriceIndex(Number(e.target.value))}
          className="w-full bg-transparent text-sm text-text focus:outline-none"
        >
          {PRICE_RANGES.map((range, index) => (
            <option key={range.label} value={index}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 px-4 py-1">
        <label htmlFor="search-university" className="block text-xs font-semibold text-text">
          Near University
        </label>
        <select
          id="search-university"
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          className="w-full bg-transparent text-sm text-text focus:outline-none"
        >
          <option value="">Any location</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        aria-label="Search rooms"
        className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-dark transition-opacity hover:opacity-90 sm:h-12 sm:w-12 sm:p-0"
      >
        <Search size={18} />
        <span className="sm:hidden">Search</span>
      </button>
    </form>
  );
}
