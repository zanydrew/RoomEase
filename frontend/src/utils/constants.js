// ── API ──────────────────────────────────────────────────────────
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── Auth ─────────────────────────────────────────────────────────
export const AUTH_TOKEN_KEY = 'roomease_token';

// Set VITE_GOOGLE_CLIENT_ID in your .env file to your real Google OAuth
// client ID (from Google Cloud Console) for the Google Sign-In button.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const ROLES = {
  RENTER: 'RENTER',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
};

// Where the profile icon / post-login redirect sends each role.
export const ROLE_HOME_ROUTE = {
  [ROLES.RENTER]: '/dashboard/renter/requests',
  [ROLES.OWNER]: '/dashboard/owner/listings',
  [ROLES.ADMIN]: '/dashboard/admin',
};

// ── Rooms ────────────────────────────────────────────────────────
export const ROOM_TYPES = {
  STUDIO: 'Studio Apartment',
  '1BR': '1 Bedroom',
  '2BR': '2 Bedroom',
  SHARED: 'Shared Room',
};

export const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RENTED: 'RENTED',
};

export const ROOM_STATUS_LABEL = {
  AVAILABLE: 'Available',
  RENTED: 'Rented',
};

export const APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// ── Viewing Requests ─────────────────────────────────────────────
export const VIEWING_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUGGESTED: 'SUGGESTED',
};

export const VIEWING_STATUS_LABEL = {
  PENDING: 'Pending',
  APPROVED: 'Confirmed',
  REJECTED: 'Rejected',
  SUGGESTED: 'Suggested New Time',
};

// ── Pagination ───────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;

// ── Uploads (must mirror backend middlewares/upload.js) ─────────
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_ROOM_IMAGES = 10;
