import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-gold-dark">404</p>
      <h1 className="mt-2 text-2xl font-bold text-text">Page not found</h1>
      <p className="mt-2 text-sm text-text-soft">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-gold-dark px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
