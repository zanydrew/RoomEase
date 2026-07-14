import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomForm from '../../components/dashboard/RoomForm';
import ErrorState from '../../components/ui/ErrorState';
import useAsync from '../../hooks/useAsync';
import * as ownerService from '../../services/ownerService';
import * as roomService from '../../services/roomService';
import { notify } from '../../context/ToastConfig';
import LoadingOverlay from '../../components/ui/LoadingOverlay';

export default function EditRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const { data: room, loading, error, refetch } = useAsync(
    () => ownerService.getMyRoomById(roomId).then((res) => res.data.data.room),
    [roomId],
  );

  const [images, setImages] = useState([]);
    const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [amenityIds, setAmenityIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [originalStatus, setOriginalStatus] = useState(null);

  useEffect(() => {
    if (!room) return;
    setImages(
      (room.images || []).map((img) => ({ id: img.id, url: img.image_url, is_primary: img.is_primary, isNew: false })),
    );
    setAmenityIds((room.amenities || []).map((a) => a.id));
    setOriginalStatus(room.status);
  }, [room]);

  async function handleImagesAdded(staged) {
    try {
      const uploadRes = await roomService.uploadRoomImages(roomId, staged.map((img) => img.file));
      const uploaded = (uploadRes.data.data.images || []).map((img) => ({
        id: img.id,
        url: img.image_url,
        is_primary: img.is_primary,
        isNew: false,
      }));
      setImages((current) => [...current, ...uploaded]);
    } catch (err) {
      notify.error(err);
    }
  }

  async function handleImageRemove(id) {
    try {
      await roomService.deleteRoomImage(roomId, id);
      setImages((current) => current.filter((img) => img.id !== id));
    } catch (err) {
      notify.error(err);
    }
  }

  async function handleImageSetCover(id) {
    try {
      await roomService.setRoomImagePrimary(roomId, id);
      setImages((current) => current.map((img) => ({ ...img, is_primary: img.id === id })));
    } catch (err) {
      notify.error(err);
    }
  }

  function handleToggleAmenity(id) {
    setAmenityIds((current) => (current.includes(id) ? current.filter((a) => a !== id) : [...current, id]));
  }

  async function handleSubmitForm(data) {
    setSubmitting(true);
    try {
      await ownerService.updateRoom(roomId, {
        title: data.title,
        description: data.description,
        price: data.price,
        address: data.address,
        district: data.district,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        room_type: data.room_type,
        size_sqm: data.size_sqm,
        amenity_ids: amenityIds,
      });

      if (data.status !== originalStatus) {
        await ownerService.updateRoomStatus(roomId, data.status);
      }

      notify.success('Listing updated successfully.');
      navigate('/dashboard/owner/listings');
    } catch (err) {
      notify.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-soft">Loading room...</p>;
  }

  if (error || !room) {
    return <ErrorState message="Couldn't load this listing." onRetry={refetch} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">Edit Room</h1>
      <p className="mt-1 text-sm text-text-soft">Update your listing details to keep your room information accurate for potential tenants.</p>

      <div className="mt-6">
        <RoomForm
          mode="edit"
          defaultValues={{
            title: room.title,
            price: room.price_per_month,
            room_type: room.room_type,
            size_sqm: room.size_sqm,
            status: room.status,
            district: room.district,
            city: room.city,
            description: room.description || '',
            address: room.address,
            latitude: room.latitude,
            longitude: room.longitude,
          }}
          images={images}
          onImagesAdded={handleImagesAdded}
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
