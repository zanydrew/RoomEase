import client from '../api/client';

export function register({ full_name, email, password, role }) {
  return client.post('/auth/register', { full_name, email, password, role });
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password });
}

export function googleLogin({ idToken }) {
  return client.post('/auth/google', { idToken });
}

export function getMe() {
  return client.get('/auth/me');
}

export function logout() {
  return client.post('/auth/logout');
}
