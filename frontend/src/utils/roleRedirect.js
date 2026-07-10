import { ROLE_HOME_ROUTE } from './constants';

/**
 * Resolves where the profile icon (and post-login redirects) should
 * send a given user, based on their role.
 */
export function getRoleHomeRoute(user) {
  if (!user) return '/login';
  return ROLE_HOME_ROUTE[user.role] || '/';
}
