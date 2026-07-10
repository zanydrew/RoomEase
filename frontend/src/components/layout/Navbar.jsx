import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MessageSquare, Globe, CircleUserRound, Menu, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { getRoleHomeRoute } from '../../utils/roleRedirect';

const PUBLIC_NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/browse', label: 'Browse' },
  { to: '/saved', label: 'Saved' },
];

function navLinkClasses({ isActive }) {
  return [
    'text-sm font-medium transition-colors',
    isActive ? 'text-gold-dark border-b-2 border-gold-dark pb-1' : 'text-text hover:text-gold-dark',
  ].join(' ');
}

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-xl font-extrabold text-gold-dark">
          RoomEase
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {PUBLIC_NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop right-side icons */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            aria-label="Change language"
            className="rounded-full p-2 text-text-soft transition-colors hover:bg-bg hover:text-text"
          >
            <Globe size={20} />
          </button>

          {isAuthenticated ? (
            <>
              <button
                type="button"
                aria-label="Messages"
                onClick={() => navigate('/chat')}
                className="rounded-full p-2 text-text-soft transition-colors hover:bg-bg hover:text-text"
              >
                <MessageSquare size={20} />
              </button>
              <button
                type="button"
                aria-label="Go to my dashboard"
                onClick={() => navigate(getRoleHomeRoute(user))}
                className="overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-9 w-9 object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center bg-bg text-text-soft">
                    <CircleUserRound size={22} />
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-full bg-gold-dark px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-md p-2 text-text md:hidden"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-border bg-bg-card px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-3">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-2 py-2 text-sm font-medium ${
                    isActive ? 'bg-bg text-gold-dark' : 'text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate('/chat');
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border py-2 text-sm font-medium text-text"
                >
                  <MessageSquare size={18} /> Messages
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(getRoleHomeRoute(user));
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gold-dark py-2 text-sm font-medium text-white"
                >
                  <CircleUserRound size={18} /> My Dashboard
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/login');
                }}
                className="flex-1 rounded-md bg-gold-dark py-2 text-sm font-semibold text-white"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
