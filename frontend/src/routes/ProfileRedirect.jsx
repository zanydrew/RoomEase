import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const PROFILE_ROUTE = {
  [ROLES.RENTER]: '/dashboard/renter/profile',
  [ROLES.OWNER]: '/dashboard/owner/profile',
  [ROLES.ADMIN]: '/dashboard/admin',
};

export default function ProfileRedirect() {
  const { user } = useAuth();
  return <Navigate to={PROFILE_ROUTE[user?.role] || '/'} replace />;
}
