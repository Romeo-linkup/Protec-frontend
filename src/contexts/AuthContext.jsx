import { createContext, useContext, useState } from 'react';
import api from '../api/client.js';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('protec_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: userData } = res.data;
    localStorage.setItem('protec_user', JSON.stringify(userData));
    localStorage.setItem('protec_token', accessToken);
    if (refreshToken) localStorage.setItem('protec_refresh', refreshToken);
    setUser(userData);
    return userData.role;
  }

  function logout() {
    localStorage.removeItem('protec_user');
    localStorage.removeItem('protec_token');
    localStorage.removeItem('protec_refresh');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}