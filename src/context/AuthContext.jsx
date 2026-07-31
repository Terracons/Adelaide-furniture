'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { read, write, remove } from '@/lib/store';
import { loginCustomer, registerCustomer, adminLogin, logout as apiLogout, updateProfile as apiUpdateProfile } from '@/lib/data';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(read('session', null));
    setAdmin(read('admin-session', null));
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginCustomer(email, password);
    if (res.ok) {
      const safe = { ...res.user };
      delete safe.password;
      setUser(safe);
      write('session', safe);
    }
    return res;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await registerCustomer(payload);
    if (res.ok) {
      const safe = { ...res.user };
      delete safe.password;
      setUser(safe);
      write('session', safe);
    }
    return res;
  }, []);

  const updateProfile = useCallback(
    async (patch) => {
      if (!user) return { ok: false };
      const res = await apiUpdateProfile(patch);
      const next = res?.user ? { ...user, ...res.user } : { ...user, ...patch };
      setUser(next);
      write('session', next);
      return { ok: true };
    },
    [user]
  );

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* clear locally regardless */ }
    setUser(null);
    remove('session');
  }, []);

  const signInAdmin = useCallback(async (email, password) => {
    const res = await adminLogin(email, password);
    if (res.ok) {
      setAdmin(res.user);
      write('admin-session', res.user);
    }
    return res;
  }, []);

  const signOutAdmin = useCallback(async () => {
    try { await apiLogout(); } catch { /* clear locally regardless */ }
    setAdmin(null);
    remove('admin-session');
  }, []);

  const value = useMemo(
    () => ({ user, admin, ready, login, register, logout, updateProfile, signInAdmin, signOutAdmin }),
    [user, admin, ready, login, register, logout, updateProfile, signInAdmin, signOutAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
