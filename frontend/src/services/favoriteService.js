import client from '../api/client';

export function getMyFavorites(params = {}) {
  return client.get('/favorites', { params });
}

export function checkIfSaved(roomId) {
  return client.get(`/favorites/${roomId}/check`);
}

export function saveRoom(roomId) {
  return client.post(`/favorites/${roomId}`);
}

export function unsaveRoom(roomId) {
  return client.delete(`/favorites/${roomId}`);
}
