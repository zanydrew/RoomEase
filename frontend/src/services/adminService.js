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

export function deleteUser(id) {
  return client.delete(`/admin/users/${id}`);
}

export function deleteRenter(id) {
  return client.delete(`/admin/renters/${id}`);
}

export function deleteOwner(id) {
  return client.delete(`/admin/owners/${id}`);
}

export function banUser(id) {
  return client.put(`/admin/users/${id}/ban`);
}

export function unbanUser(id) {
  return client.put(`/admin/users/${id}/unban`);
}

export function verifyOwner(id) {
  return client.put(`/admin/users/${id}/verify`);
}
