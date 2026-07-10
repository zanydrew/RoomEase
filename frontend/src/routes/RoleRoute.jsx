import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLE_HOME_ROUTE } from '../utils/constants';

/**
 * Restricts a route subtree to specific roles.
 * Must be nested inside <ProtectedRoute/> so `user` is guaranteed to exist.
 *
 * Usage: <Route element={<RoleRoute roles={['OWNER']} />}>...</Route>
 */
export default function RoleRoute({ roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role)) {
    // Logged in, but wrong role — send them to their own dashboard
    // instead of a dead end.
    return <Navigate to={ROLE_HOME_ROUTE[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
