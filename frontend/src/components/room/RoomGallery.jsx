import { useState } from 'react';
import { ImageOff, Images } from 'lucide-react';
import Modal from '../ui/Modal';

export default function RoomGallery({ images = [], title }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-bg text-text-muted">
        <ImageOff size={32} />
      </div>
    );
  }

  const [main, ...rest] = images;
  const thumbnails = rest.slice(0, 4);

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:grid-rows-2 sm:h-[420px]">
        <div className="overflow-hidden rounded-xl sm:col-span-2 sm:row-span-2">
          <img src={main.image_url} alt={title} className="h-full w-full object-cover" />
        </div>

        {thumbnails.map((img, index) => {
          const isLast = index === thumbnails.length - 1;
          return (
            <div key={img.id || index} className="relative hidden overflow-hidden rounded-xl sm:block">
              <img src={img.image_url} alt="" className="h-full w-full object-cover" />
              {isLast && images.length > 5 && (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80"
                >
                  <Images size={14} />
                  Show all photos
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} title={`${title} — Photos`} maxWidth="max-w-3xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {images.map((img, index) => (
            <img key={img.id || index} src={img.image_url} alt="" className="w-full rounded-lg object-cover" />
          ))}
        </div>
      </Modal>
    </>
  );
}
