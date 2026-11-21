import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready'

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setHousehold(null);
      setStatus('ready');
      return;
    }
    try {
      const data = await api('/auth/me');
      setUser(data.user);
      setHousehold(data.household);
    } catch {
      setUser(null);
      setHousehold(null);
    } finally {
      setStatus('ready');
    }
  }, []);

  useEffect(() => {
    refresh();
    const onLogout = () => {
      setUser(null);
      setHousehold(null);
    };
    window.addEventListener('siaga:logout', onLogout);
    return () => window.removeEventListener('siaga:logout', onLogout);
  }, [refresh]);

  const login = async (email, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    tokenStore.set(data.token);
    await refresh();
    return data;
  };

  const register = async (nama, email, password) => {
    const data = await api('/auth/register', { method: 'POST', body: { nama, email, password }, auth: false });
    tokenStore.set(data.token);
    await refresh();
    return data;
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
    setHousehold(null);
  };

  const value = useMemo(
    () => ({ user, household, status, login, register, logout, refresh }),
    [user, household, status, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
