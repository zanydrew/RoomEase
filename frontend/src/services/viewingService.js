import client from '../api/client';

export function requestViewing({ room_id, requested_date, requested_time, renter_note }) {
  return client.post('/viewing-requests', { room_id, requested_date, requested_time, renter_note });
}

export function getMyRequests(params = {}) {
  return client.get('/viewing-requests/my', { params });
}

export function getOwnerRequests(params = {}) {
  return client.get('/viewing-requests/owner', { params });
}

export function getViewingById(id) {
  return client.get(`/viewing-requests/${id}`);
}

export function acceptViewing(id) {
  return client.patch(`/viewing-requests/${id}/accept`);
}

export function rejectViewing(id) {
  return client.patch(`/viewing-requests/${id}/reject`);
}

export function suggestNewTime(id, { suggested_date, suggested_time, owner_note }) {
  return client.patch(`/viewing-requests/${id}/reschedule`, { suggested_date, suggested_time, owner_note });
}

export function cancelViewing(id) {
  return client.patch(`/viewing-requests/${id}/cancel`);
}

// NOTE: no renter-side "accept suggested new time" endpoint exists yet
// (see Step 4 mismatch #5) — backend work pending, per your instruction
// this calls a placeholder path for now.
export function confirmSuggestedTime(id) {
  return client.patch(`/viewing-requests/${id}/confirm`);
}

// NOTE: similarly, there's no endpoint for a renter to request a
// reschedule on an already-confirmed viewing — placeholder pending backend.
export function requestReschedule(id) {
  return client.patch(`/viewing-requests/${id}/renter-reschedule`);
}
