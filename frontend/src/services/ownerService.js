import client from '../api/client';

export function getDashboard() {
  return client.get('/owner/dashboard');
}

export function getStatistics() {
  return client.get('/owner/statistics');
}

export function getMyRooms(params = {}) {
  return client.get('/owner/rooms', { params });
}

export function getMyRoomById(roomId) {
  return client.get(`/owner/rooms/${roomId}`);
}

export function createRoom(payload) {
  return client.post('/owner/rooms', payload);
}

// NOTE: the backend's updateRoom expects `price`, while createRoom
// expects `price_per_month` — inconsistent, but matching each exactly.
export function updateRoom(roomId, payload) {
  return client.patch(`/owner/rooms/${roomId}`, payload);
}

export function updateRoomStatus(roomId, status) {
  return client.patch(`/owner/rooms/${roomId}/status`, { status });
}

export function deleteRoom(roomId) {
  return client.delete(`/owner/rooms/${roomId}`);
}

export function getViewingRequests(params = {}) {
  return client.get('/owner/viewing-requests', { params });
}
