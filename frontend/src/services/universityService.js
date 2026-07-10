import client from '../api/client';

export function getUniversities() {
  return client.get('/universities');
}
