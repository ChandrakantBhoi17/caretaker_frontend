/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import { authService, saveToken, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.debug('[auth] initAuth token', token);
      if (token) {
        setAuthToken(token);
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Auth initialization failed', error);
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const token = data?.access_token || data?.token;
    console.debug('[auth] login response', { data, token });
    if (!token) {
      throw new Error('Login response did not include an access token');
    }
    saveToken(token);
    try {
      const userData = await authService.getMe();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('[auth] getMe after login failed', error.response?.data || error);
      saveToken(null);
      throw error;
    }
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
