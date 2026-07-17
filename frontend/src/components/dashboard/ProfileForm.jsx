import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormInput from '../forms/FormInput';
import AvatarUpload from './AvatarUpload';
import useAuth from '../../hooks/useAuth';
import * as userService from '../../services/userService';
import { notify } from '../../context/ToastConfig';

export default function ProfileForm({ title, subtitle }) {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      location: user?.location || '',
    },
  });

  async function onSubmit(data) {
    try {
      const res = await userService.updateMe(data);
      updateUser(res.data.data.user);
      notify.success('Profile updated successfully.');
    } catch (err) {
      notify.error(err);
    }
  }

  async function handleAvatarUpload(file) {
    setUploading(true);
    try {
      const res = await userService.updateAvatar(file);
      updateUser(res.data.data.user);
      notify.success('Profile picture updated.');
    } catch (err) {
      notify.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleAvatarRemove() {
    setUploading(true);
    try {
      const res = await userService.deleteAvatar();
      updateUser(res.data.data.user);
      notify.success('Profile picture removed.');
    } catch (err) {
      notify.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="mt-1 text-sm text-text-soft">{subtitle}</p>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card p-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-[auto_1fr]">
          <AvatarUpload
            avatarUrl={user?.avatar_url}
            onUpload={handleAvatarUpload}
            onRemove={handleAvatarRemove}
            uploading={uploading}
          />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className="text-base font-bold text-text">Personal Details</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Full Name"
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required.' })}
              />
              <FormInput
                label="Email Address"
                type="email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
                })}
              />
              <FormInput label="Phone Number" {...register('phone_number')} />
              <FormInput label="Location" placeholder="Phnom Penh, Cambodia" {...register('location')} />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gold-dark px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
