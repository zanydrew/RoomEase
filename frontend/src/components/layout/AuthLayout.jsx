import { NavLink } from 'react-router-dom';

function tabClasses({ isActive }) {
  return [
    'flex-1 rounded-full py-2 text-center text-sm font-semibold transition-colors',
    isActive ? 'bg-bg-card text-text shadow-sm' : 'text-text-soft',
  ].join(' ');
}

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — replace this gradient with a real photo (src/assets/auth-hero.jpg) when available */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#3d3125] via-[#5c4a34] to-[#8a6f45] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <span className="text-xl font-extrabold text-white">RoomEase</span>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight text-white">
            Find your perfect
            <br />
            sanctuary.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/80">
            Curated, premium living spaces designed for the modern urbanite in Phnom Penh. Elevate
            your living experience.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text">{title}</h1>
            <p className="mt-2 text-sm text-text-soft">{subtitle}</p>
          </div>

          <div className="mt-6 flex rounded-full bg-bg p-1">
            <NavLink to="/login" className={tabClasses}>
              Log In
            </NavLink>
            <NavLink to="/signup" className={tabClasses}>
              Sign Up
            </NavLink>
          </div>

          <div className="mt-6">{children}</div>

          <p className="mt-8 text-center text-xs text-text-soft">
            By continuing, you agree to RoomEase's{' '}
            <a href="/terms" className="underline hover:text-text">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-text">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
