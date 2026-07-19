import { useLocation } from 'react-router-dom';

/**
 * Wraps routed content (an <Outlet/> or a layout's `children`) so that
 * navigating to a new route replays a subtle fade + rise instead of the
 * next page just popping in.
 *
 * Keying the wrapper on `location.pathname` forces React to remount it —
 * and therefore restart the `.page-transition` CSS animation (defined in
 * index.css) — on every navigation, with no animation library needed.
 * Only the content inside is remounted; whatever renders this component
 * (Navbar, Sidebar, the auth hero panel, ...) stays put and doesn't
 * flicker.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}