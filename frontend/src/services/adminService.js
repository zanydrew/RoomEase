import client from '../api/client';

export function getAnalytics() {
  return client.get('/admin/analytics');
}

export function getUsers(params = {}) {
  return client.get('/admin/users', { params });
}

export function getRenters(params = {}) {
  return client.get('/admin/renters', { params });
}

export function getOwners(params = {}) {
  return client.get('/admin/owners', { params });
}

export function updateUser(id, payload) {
  return client.patch(`/admin/users/${id}`, payload);
}

export function updateRenter(id, payload) {
  return client.patch(`/admin/renters/${id}`, payload);
}

export function updateOwner(id, payload) {
  return client.patch(`/admin/owners/${id}`, payload);
}

export function deleteUser(id) {
  return client.delete(`/admin/users/${id}`);
}

export function deleteRenter(id) {
  return client.delete(`/admin/renters/${id}`);
}

export function deleteOwner(id) {
  return client.delete(`/admin/owners/${id}`);
}
