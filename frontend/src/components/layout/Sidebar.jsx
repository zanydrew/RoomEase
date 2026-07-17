import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, PlusCircle, Calendar, MessageSquare, LogOut, CircleUserRound, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const NAV_CONFIG = {
  [ROLES.RENTER]: [{ to: '/dashboard/renter/requests', label: 'My Viewing Request', icon: Calendar }],
  [ROLES.OWNER]: [
{
  to: '/dashboard/owner/listings',
  label: 'My Listings',
  icon: LayoutGrid,
  match: (pathname) =>
    pathname === '/dashboard/owner/listings' ||
    /^\/dashboard\/owner\/listings\/[^/]+\/edit$/.test(pathname),
},
{ to: '/dashboard/owner/listings/new', label: 'Post New Room', icon: PlusCircle, end: true },
    { to: '/dashboard/owner/viewing-requests', label: 'Viewing Requests', icon: Calendar },
    { to: '/chat', label: 'Messages', icon: MessageSquare },
  ],
  [ROLES.ADMIN]: [
    { to: '/dashboard/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  ],
};

const PROFILE_ROUTE = {
  [ROLES.RENTER]: '/dashboard/renter/profile',
  [ROLES.OWNER]: '/dashboard/owner/profile',
  [ROLES.ADMIN]: null,
};

function navItemClasses({ isActive }) {
  return [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive ? 'bg-gold text-gold-dark' : 'text-text-soft hover:bg-bg hover:text-text',
  ].join(' ');
}

export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth();
  const navItems = NAV_CONFIG[user?.role] || [];
  const profileRoute = PROFILE_ROUTE[user?.role];
  const { pathname } = useLocation();

  const content = (
    <div className="flex h-full flex-col bg-[#F6F3F2]">
      <div className="flex items-center justify-end px-4 pt-4 md:hidden">
        <button type="button" aria-label="Close menu" onClick={onClose} className="p-1 text-text">
          <X size={20} />
        </button>
      </div>

      {profileRoute ? (
        <NavLink to={profileRoute} onClick={onClose} className="mx-5 mt-6 flex items-center gap-3 rounded-lg p-2 hover:bg-bg">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">Welcome back</p>
            <p className="truncate text-xs text-text-soft">{user?.location || 'Phnom Penh, KH'}</p>
          </div>
        </NavLink>
      ) : (
        <div className="mx-5 mt-6 flex items-center gap-3 p-2">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{user?.full_name || 'Admin'}</p>
            <p className="truncate text-xs text-text-soft">System Admin</p>
          </div>
        </div>
      )}

      <nav className="mt-6 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={item.match ? navItemClasses({ isActive: item.match(pathname) }) : navItemClasses}
                    >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-soft transition-colors hover:bg-bg hover:text-text"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: static column */}
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">{content}</aside>

      {/* Mobile: slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-border shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}

function UserAvatar({ user }) {
  if (user?.avatar_url) {
    return <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-text-soft">
      <CircleUserRound size={22} />
    </span>
  );
}
