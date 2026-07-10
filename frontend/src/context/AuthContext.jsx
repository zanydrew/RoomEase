import { createContext, useState, useEffect, useCallback } from 'react';
import { setUnauthorizedHandler } from '../api/client';
import * as authService from '../services/authService';
import { AUTH_TOKEN_KEY } from '../utils/constants';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, []);

  // Restore session on app load if a token is already stored.
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    authService
      .getMe()
      .then((res) => {
        setUser(res.data.data.user);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clearSession]);

  // Let the axios client force-logout on any 401 response.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  async function login(credentials) {
    const res = await authService.login(credentials);
    const { user: loggedInUser, token } = res.data.data;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function loginWithGoogle(idToken) {
    const res = await authService.googleLogin({ idToken });
    const { user: loggedInUser, token } = res.data.data;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(payload) {
    const res = await authService.register(payload);
    const { user: newUser, token } = res.data.data;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser(newUser);
    return newUser;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Stateless JWT — even if this call fails, clear the local session.
    }
    clearSession();
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
