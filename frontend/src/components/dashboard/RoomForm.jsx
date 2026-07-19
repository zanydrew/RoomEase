import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PhotoUploadDropzone from '../forms/PhotoUploadDropzone';
import AmenityPicker from '../forms/AmenityPicker';
import LocationPicker from '../forms/LocationPicker';
import * as amenityService from '../../services/amenityService';
import { notify } from '../../context/ToastConfig';
import { ROOM_TYPES } from '../../utils/constants';

let localImageIdCounter = 0;



export default function RoomForm({
  mode, // 'create' | 'edit'
  defaultValues,
  images,
  onImagesAdded,
  onImageRemove,
  onImageSetCover,
  selectedAmenityIds,
  onToggleAmenity,
  onAmenityCreated,
  onSubmitForm,
  submitting,
  onCancel,
}) {
  const [amenities, setAmenities] = useState([]);
  const [address, setAddress] = useState(defaultValues.address || '');
  const [addressError, setAddressError] = useState('');
  const [latitude, setLatitude] = useState(defaultValues.latitude ?? '');
  const [longitude, setLongitude] = useState(defaultValues.longitude ?? '');

  useEffect(() => {
    amenityService
      .getAmenities()
      .then((res) => setAmenities(res.data.data.amenities || []))
      .catch(() => setAmenities([]));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  function handleFormSubmit(data) {
    if (!address.trim()) {
      setAddressError('Address is required.');
      return;
    }
    setAddressError('');
    onSubmitForm({ ...data, address, latitude: latitude || null, longitude: longitude || null });
  }

  async function handleAddCustomAmenity(name) {
    try {
      const res = await amenityService.createAmenity(name);
      const newAmenity = res.data.data.amenity;
      setAmenities((current) => [...current, newAmenity]);
      onAmenityCreated(newAmenity.id);
    } catch (err) {
      notify.error(err);
    }
  }

  function handleFilesAdded(files) {
    const staged = files.map((file) => ({
      id: `local-${localImageIdCounter++}`,
      url: URL.createObjectURL(file),
      file,
      is_primary: images.length === 0,
      isNew: true,
    }));
    onImagesAdded(staged);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <PhotoUploadDropzone
          images={images}
          onFilesAdded={handleFilesAdded}
          onRemove={onImageRemove}
          onSetCover={onImageSetCover}
        />
      </section>

      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <p className="text-sm font-semibold text-text">Basic Information</p>

        <div className="mt-4">
          <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
            Room Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Luxury Studio with Skyline View"
            className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
              errors.title ? 'border-danger' : 'border-border'
            }`}
            {...register('title', { required: 'Room title is required.' })}
          />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Monthly Price
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-soft">$</span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
                  errors.price ? 'border-danger' : 'border-border'
                }`}
                {...register('price', { required: 'Price is required.', min: { value: 1, message: 'Enter a valid price.' } })}
              />
            </div>
            {errors.price && <p className="mt-1 text-xs text-danger">{errors.price.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">Currency</label>
            <input
              disabled
              value="USD ($)"
              title="RoomEase currently only supports USD"
              className="w-full cursor-not-allowed rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text-muted"
            />
          </div>

          <div>
            <label htmlFor="room_type" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Room Type
            </label>
            <select
              id="room_type"
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
              {...register('room_type', { required: true })}
            >
              {Object.entries(ROOM_TYPES).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="size_sqm" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Size (sqm)
            </label>
            <input
              id="size_sqm"
              type="number"
              min="1"
              placeholder="28"
              className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
                errors.size_sqm ? 'border-danger' : 'border-border'
              }`}
              {...register('size_sqm', { required: 'Size is required.', min: { value: 1, message: 'Enter a valid size.' } })}
            />
            {errors.size_sqm && <p className="mt-1 text-xs text-danger">{errors.size_sqm.message}</p>}
          </div>

          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              Availability Status
            </label>
            <select
              id="status"
              disabled={mode === 'create'}
              title={mode === 'create' ? 'New listings always start as Available' : undefined}
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text disabled:cursor-not-allowed disabled:bg-bg disabled:text-text-muted"
              {...register('status')}
            >
              <option value="AVAILABLE">Available Now</option>
              <option value="RENTED">Rented</option>
            </select>
          </div>

          <div>
            <label htmlFor="district" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              District
            </label>
            <input
              id="district"
              type="text"
              placeholder="Toul Kork"
              className={`w-full rounded-lg border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30 ${
                errors.district ? 'border-danger' : 'border-border'
              }`}
              {...register('district', { required: 'District is required.' })}
            />
            {errors.district && <p className="mt-1 text-xs text-danger">{errors.district.message}</p>}
          </div>

          <div>
            <label htmlFor="city" className="mb-1.5 block text-xs font-semibold uppercase text-text-soft">
              City
            </label>
            <input
              id="city"
              type="text"
              defaultValue="Phnom Penh"
              className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
              {...register('city', { required: true })}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <p className="text-sm font-semibold text-text">Description & Rules</p>
        <textarea
          rows={4}
          maxLength={2000}
          placeholder="Describe the atmosphere, the neighborhood, and any specific rules (e.g., No smoking, pets allowed)..."
          className="mt-3 w-full resize-none rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-gold-dark/30"
          {...register('description')}
        />
      </section>

      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <LocationPicker
          address={address}
          onAddressChange={setAddress}
          latitude={latitude}
          longitude={longitude}
          onLatChange={setLatitude}
          onLngChange={setLongitude}
          errors={{ address: addressError }}
        />
      </section>

      <section className="rounded-2xl border border-border bg-bg-card p-6">
        <AmenityPicker
          amenities={amenities}
          selectedIds={selectedAmenityIds}
          onToggle={onToggleAmenity}
          onAddCustom={handleAddCustomAmenity}
        />
      </section>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-text hover:bg-bg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-gold-dark px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Publish Listing' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
