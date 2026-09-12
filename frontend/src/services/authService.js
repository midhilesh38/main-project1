import * as api from './api';

export const authService = {
  async login(identifier, password, role) {
    return await api.login({
      username: identifier,
      employeeId: identifier,
      password,
      role,
    });
  },

  async getCurrentUser(token) {
    return await api.getCurrentUser(token);
  },

  getStoredAuth() {
    try {
      const token = localStorage.getItem('pec_rmms_token');
      const userStr = localStorage.getItem('pec_rmms_user');
      if (token && userStr) {
        return { token, user: JSON.parse(userStr) };
      }
    } catch {
      // ignore parsing error
    }
    return { token: null, user: null };
  },

  saveAuth(token, user) {
    localStorage.setItem('pec_rmms_token', token);
    localStorage.setItem('pec_rmms_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('pec_rmms_token');
    localStorage.removeItem('pec_rmms_user');
  },
};