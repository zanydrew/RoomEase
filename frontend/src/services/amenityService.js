import client from '../api/client';

export function getAmenities() {
  return client.get('/amenities');
}

// NOTE: no POST /amenities endpoint exists yet on the backend — building
// ahead assuming one will be added, same as other forward-built endpoints.
export function createAmenity(name) {
  return client.post('/amenities', { name });
}
