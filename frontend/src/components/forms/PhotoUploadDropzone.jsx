import { useRef, useState } from 'react';
import { UploadCloud, X, Star } from 'lucide-react';
import { MAX_IMAGE_SIZE_MB, ALLOWED_IMAGE_TYPES, MAX_ROOM_IMAGES } from '../../utils/constants';
import { notify } from '../../context/ToastConfig';

/**
 * Fully controlled — the parent owns the `images` array (a mix of
 * already-uploaded images from the server and newly-staged local files)
 * and decides when actual upload/delete API calls happen. This lets the
 * same component work for both:
 * - Post Room: photos are staged locally and uploaded only after the
 *   room itself is created (image upload requires an existing roomId).
 * - Edit Room: the room already exists, so the parent can upload each
 *   file immediately.
 */
export default function PhotoUploadDropzone({ images, onFilesAdded, onRemove, onSetCover }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function validateAndAdd(fileList) {
    const files = Array.from(fileList);

    if (images.length + files.length > MAX_ROOM_IMAGES) {
      notify.error(`You can upload up to ${MAX_ROOM_IMAGES} photos.`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        notify.error(`${file.name} isn't a supported image type.`);
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        notify.error(`${file.name} is over ${MAX_IMAGE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) onFilesAdded(validFiles);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    validateAndAdd(event.dataTransfer.files);
  }

  return (
    <div>
      <p className="text-sm font-semibold text-text">Room Photos</p>
      <p className="text-xs text-text-soft">Add at least 5 photos. High-resolution landscape images work best.</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center transition-colors ${
          dragActive ? 'border-gold-dark bg-gold/10' : 'border-border'
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bg text-text-soft">
          <UploadCloud size={22} />
        </span>
        <p className="mt-3 text-sm text-text">
          Drag & drop photos here or{' '}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-gold-dark underline">
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs text-text-soft">Support: JPG, PNG (Max {MAX_IMAGE_SIZE_MB}MB each)</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            validateAndAdd(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-video overflow-hidden rounded-lg bg-bg">
              <img src={image.url} alt="" className="h-full w-full object-cover" />

              {image.is_primary && (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  Cover
                </span>
              )}

              <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/0 p-1.5 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                {!image.is_primary && (
                  <button
                    type="button"
                    aria-label="Set as cover photo"
                    onClick={() => onSetCover(image.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-text-soft hover:text-gold-dark"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => onRemove(image.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-danger"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

          {images.length < MAX_ROOM_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-border text-text-muted hover:border-text-soft"
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
}
