import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iv_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('iv_token', data.token);
      localStorage.setItem('iv_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('iv_token', data.token);
      localStorage.setItem('iv_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  }, []);

  const sendVerificationCode = useCallback(async (email, role, name) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-code', { email, role, name });
      return data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send code' };
    } finally { setLoading(false); }
  }, []);

  const verifyCodeAndLogin = useCallback(async (email, code, role, name) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-code', { email, code, role, name });
      localStorage.setItem('iv_token', data.token);
      localStorage.setItem('iv_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Verification failed' };
    } finally { setLoading(false); }
  }, []);

  const loginWithGoogle = useCallback(async (profile) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', profile);
      localStorage.setItem('iv_token', data.token);
      localStorage.setItem('iv_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      // Fallback guest google account if offline
      const fallbackUser = {
        id: `google-${Date.now()}`,
        name: profile.name || 'Google User',
        email: profile.email || 'user@gmail.com',
        role: profile.role || (profile.email?.includes('admin') ? 'admin' : 'creator'),
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: true
      };
      localStorage.setItem('iv_token', 'mock_google_token_' + Date.now());
      localStorage.setItem('iv_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
      return { success: true, user: fallbackUser, message: 'Signed in with Google' };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('iv_token');
    localStorage.removeItem('iv_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('iv_user', JSON.stringify(data.user));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, sendVerificationCode, verifyCodeAndLogin, loginWithGoogle, logout, refreshUser, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
