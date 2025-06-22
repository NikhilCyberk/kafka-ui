import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const isRedirecting = useRef(false);

  const logout = useCallback(() => {
    if (isRedirecting.current) return; // Prevent multiple redirects
    
    setToken(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    enqueueSnackbar('Logged out successfully', { variant: 'info' });
  }, [enqueueSnackbar]);

  const validateToken = useCallback(async () => {
    try {
      await api.auth.getProfile();
      setLoading(false);
    } catch (error) {
      console.error('Token validation failed:', error);
      logout();
    }
  }, [logout]);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Validate token by making a test request
        validateToken();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [validateToken, logout]);

  const login = async (username, password) => {
    try {
      const data = await api.auth.login({ username, password });
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const data = await api.auth.register({ username, email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const getProfile = async () => {
    if (!token) return null;

    try {
      const data = await api.auth.getProfile();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout(); // Logout on auth error
      return null;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      await api.auth.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      enqueueSnackbar('Password changed successfully', { variant: 'success' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to change password' };
    }
  };

  // Create auth headers for API calls
  const getAuthHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    getProfile,
    changePassword,
    getAuthHeaders,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 