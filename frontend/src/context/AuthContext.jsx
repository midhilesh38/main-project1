import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEMO_USERS } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authService.getStoredAuth();
    if (stored.token && stored.user) {
      setToken(stored.token);
      setUser(stored.user);
    }
    setLoading(false);
  }, []);

  const loginWithCredentials = async (username, password, role) => {
    const data = await authService.login(username, password, role);
    if (data.token && data.user) {
      setToken(data.token);
      setUser(data.user);
      authService.saveAuth(data.token, data.user);
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    authService.clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login: loginWithCredentials,
        logout,
        demoUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
