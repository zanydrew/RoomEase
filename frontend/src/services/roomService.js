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

// ── Images (owner-only on the backend) ──────────────────────────
export function uploadRoomImages(roomId, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  return client.post(`/rooms/${roomId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function deleteRoomImage(roomId, imageId) {
  return client.delete(`/rooms/${roomId}/images/${imageId}`);
}

export function setRoomImagePrimary(roomId, imageId) {
  return client.patch(`/rooms/${roomId}/images/${imageId}`, { is_primary: true });
}
