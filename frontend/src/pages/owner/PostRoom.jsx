import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomForm from '../../components/dashboard/RoomForm';
import * as ownerService from '../../services/ownerService';
import * as roomService from '../../services/roomService';
import { notify } from '../../context/ToastConfig';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

const DEFAULT_VALUES = {
  title: '',
  price: '',
  room_type: 'STUDIO',
  size_sqm: '',
  status: 'AVAILABLE',
  district: '',
  city: 'Phnom Penh',
  description: '',
};

export default function PostRoom() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [amenityIds, setAmenityIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function handleImageRemove(id) {
    setImages((current) => current.filter((img) => img.id !== id));
  }

  function handleImageSetCover(id) {
    setImages((current) => current.map((img) => ({ ...img, is_primary: img.id === id })));
  }

  function handleToggleAmenity(id) {
    setAmenityIds((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));
  }

  async function handleSubmitForm(data) {
    setSubmitting(true);
    try {
      const createRes = await ownerService.createRoom({
        title: data.title,
        description: data.description,
        price_per_month: data.price,
        address: data.address,
        district: data.district,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        room_type: data.room_type,
        size_sqm: data.size_sqm,
        amenity_ids: amenityIds,
      });
      const newRoom = createRes.data.data.room;

      if (images.length > 0) {
        try {
          const uploadRes = await roomService.uploadRoomImages(newRoom.uuid, images.map((img) => img.file));
          const uploadedImages = uploadRes.data.data.images || [];
          const coverIndex = images.findIndex((img) => img.is_primary);
          if (coverIndex >= 0 && uploadedImages[coverIndex]) {
            await roomService.setRoomImagePrimary(newRoom.uuid, uploadedImages[coverIndex].uuid);
          }
        } catch {
          notify.error('Listing created, but some photos failed to upload. You can add them from Edit Room.');
        }
      }

      notify.success('Listing published successfully!');
      navigate('/dashboard/owner/listings');
    } catch (err) {
      notify.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
            {submitting && <LoadingOverlay message="Publishing your room listing..." />}
      <h1 className="text-2xl font-bold text-text">Post New Room</h1>
      <p className="mt-1 text-sm text-text-soft">
        Fill in the details below to list your premium property. Make sure to provide high-quality photos to
        attract verified tenants.
      </p>

      <div className="mt-6">
        <RoomForm
          mode="create"
          defaultValues={DEFAULT_VALUES}
          images={images}
          onImagesAdded={(staged) => setImages((current) => [...current, ...staged])}
          onImageRemove={handleImageRemove}
          onImageSetCover={handleImageSetCover}
          selectedAmenityIds={amenityIds}
          onToggleAmenity={handleToggleAmenity}
          onAmenityCreated={(id) => setAmenityIds((current) => [...current, id])}
          onSubmitForm={handleSubmitForm}
          submitting={submitting}
          onCancel={() => navigate('/dashboard/owner/listings')}
        />
      </div>
    </div>
  );
}
