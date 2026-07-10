import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AmenityPicker({ amenities, selectedIds, onToggle, onAddCustom }) {
  const [customName, setCustomName] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);

  function handleAddCustom(event) {
    event.preventDefault();
    const trimmed = customName.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setCustomName('');
    setAddingCustom(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Amenities</p>
        <button
          type="button"
          onClick={() => setAddingCustom((v) => !v)}
          className="flex items-center gap-1 text-sm font-medium text-gold-dark hover:underline"
        >
          <Plus size={14} />
          Add Custom
        </button>
      </div>

      {addingCustom && (
        <form onSubmit={handleAddCustom} className="mt-3 flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g., Rooftop Pool"
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          />
          <button type="submit" className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-semibold text-white">
            Add
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {amenities.map((amenity) => {
          const isSelected = selectedIds.includes(amenity.id);
          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => onToggle(amenity.id)}
              aria-pressed={isSelected}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-gold-dark bg-gold/20 text-gold-dark'
                  : 'border-border text-text-soft hover:border-text-muted'
              }`}
            >
              {amenity.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
