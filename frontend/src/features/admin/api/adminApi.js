import client from '../../../api/client';

export function adminGetUsers(params) {
  return client.get('/admin/users', { params });
}

export function adminBanUser(id) {
  return client.put(`/admin/users/${id}/ban`);
}

export function adminUnbanUser(id) {
  return client.put(`/admin/users/${id}/unban`);
}

export function adminVerifyOwner(id) {
  return client.put(`/admin/users/${id}/verify`);
}

export function adminGetAnalytics() {
  return client.get('/admin/analytics');
}
