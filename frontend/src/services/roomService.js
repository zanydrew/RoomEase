import client from '../api/client';

// ── Browsing ─────────────────────────────────────────────────────
export function getRooms(params = {}) {
  return client.get('/rooms', { params });
}

export function getFeaturedRooms(params = {}) {
  return client.get('/rooms/featured', { params });
}

export function getLatestRooms(params = {}) {
  return client.get('/rooms/latest', { params });
}

export function getRoomsForMap(params = {}) {
  return client.get('/rooms/map', { params });
}

export function getNearbyRooms(params = {}) {
  return client.get('/rooms/nearby', { params });
}

export function getRoomById(roomId) {
  return client.get(`/rooms/${roomId}`);
}

export function getSimilarRooms(roomId) {
  return client.get(`/rooms/${roomId}/similar`);
}

const toBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function uploadRoomImages(roomId, files) {
  const base64Images = await Promise.all(files.map(toBase64));
  return client.post(`/rooms/${roomId}/images`, { images: base64Images });
}

export function deleteRoomImage(roomId, imageId) {
  return client.delete(`/rooms/${roomId}/images/${imageId}`);
}

export function setRoomImagePrimary(roomId, imageId) {
  return client.patch(`/rooms/${roomId}/images/${imageId}`, { is_primary: true });
}
