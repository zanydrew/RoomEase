import client from '../api/client';

export function getMe() {
  return client.get('/users/me');
}

export function updateMe({ full_name, phone_number, location, email }) {
  return client.patch('/users/me', { full_name, phone_number, location, email });
}

export function updateAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);
  return client.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function changePassword({ current_password, new_password }) {
  return client.patch('/users/me/password', { current_password, new_password });
}
