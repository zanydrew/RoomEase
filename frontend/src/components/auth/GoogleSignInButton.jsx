import { useEffect, useRef, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';

const SCRIPT_ID = 'google-identity-services';

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/**
 * Renders Google's own Sign-In button (via Google Identity Services) and
 * exchanges the resulting ID token for a RoomEase session through
 * POST /api/auth/google.
 *
 * A fully custom-drawn "Sign in with Google" button that triggers the
 * prompt programmatically isn't reliable/ToS-compliant, so this renders
 * Google's official button (pill shape, outline theme) to stay as close
 * to the Figma's button styling as their branding guidelines allow.
 */
export default function GoogleSignInButton({ onAuthenticated, onError }) {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            try {
              const user = await loginWithGoogle(credential);
              onAuthenticated?.(user);
            } catch (err) {
              onError?.(err);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          width: buttonRef.current.offsetWidth || 360,
        });
      })
      .catch(() => setScriptFailed(true));

    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onAuthenticated, onError]);

  if (!GOOGLE_CLIENT_ID || scriptFailed) {
    return (
      <button
        type="button"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID to enable Google Sign-In"
        className="w-full cursor-not-allowed rounded-full border border-border py-2.5 text-sm font-medium text-text-muted"
      >
        Google
      </button>
    );
  }

  return <div ref={buttonRef} className="flex w-full justify-center" />;
}
