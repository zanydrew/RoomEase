import { useRef } from 'react';
import { Pencil } from 'lucide-react';
import { MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '../../utils/constants';
import { notify } from '../../context/ToastConfig';

export default function AvatarUpload({ avatarUrl, onUpload, onRemove, uploading }) {
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      notify.error('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      notify.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
      return;
    }

    onUpload(file);
  }

  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="relative">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="h-24 w-24 rounded-full bg-bg" />
        )}
        <button
          type="button"
          aria-label="Change profile picture"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold-dark text-white shadow-md hover:opacity-90"
        >
          <Pencil size={14} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
      </div>

      <p className="mt-3 text-sm font-semibold text-text">Profile Picture</p>
      <p className="text-xs text-text-soft">PNG, JPG or GIF. Max {MAX_IMAGE_SIZE_MB}MB.</p>

      <div className="mt-2 flex gap-4 text-sm font-medium">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="text-text hover:underline disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : 'Upload New'}
        </button>
        {avatarUrl && (
          <button
            type="button"
            disabled={uploading}
            onClick={onRemove}
            className="text-danger hover:underline disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
