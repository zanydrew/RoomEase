import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import FormInput from '../forms/FormInput';

export default function EditUserModal({ open, user, onClose, onSave, saving }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        location: user.location || '',
        is_banned: user.is_banned || false,
        is_verified: user.is_verified || false,
      });
    }
  }, [user, reset]);

  if (!user) return null;

  function onSubmit(data) {
    onSave({
      full_name: data.full_name,
      phone_number: data.phone_number,
      location: data.location,
      is_banned: data.is_banned,
      ...(user.role === 'OWNER' ? { is_verified: data.is_verified } : {}),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${user.full_name}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <FormInput
          label="Full Name"
          error={errors.full_name?.message}
          {...register('full_name', { required: 'Full name is required.' })}
        />
        <FormInput label="Phone Number" {...register('phone_number')} />
        <FormInput label="Location" {...register('location')} />

        <label className="flex items-center gap-2.5 text-sm text-text">
          <input type="checkbox" className="h-4 w-4 rounded border-border text-gold-dark" {...register('is_banned')} />
          Banned
        </label>

        {user.role === 'OWNER' && (
          <label className="flex items-center gap-2.5 text-sm text-text">
            <input type="checkbox" className="h-4 w-4 rounded border-border text-gold-dark" {...register('is_verified')} />
            Verified Owner
          </label>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gold-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
