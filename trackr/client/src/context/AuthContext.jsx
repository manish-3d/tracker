import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('trackr_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch { localStorage.removeItem('trackr_token'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('trackr_token', data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('trackr_token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('trackr_token');
    setUser(null);
  };

  const updateUser = (updates) => setUser(u => ({ ...u, ...updates }));

  const toggleTheme = async () => {
    const newTheme = user?.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = newTheme;
    setUser(u => ({ ...u, theme: newTheme }));
    await api.put('/auth/theme', { theme: newTheme });
  };

  // Apply theme on load
  useEffect(() => {
    if (user?.theme) document.documentElement.className = user.theme;
  }, [user?.theme]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
