import * as api from './api';

export const DEMO_USERS = [
  {
    role: 'SUPERVISOR',
    roleLabel: 'Staff / Maintenance Supervisor',
    username: 'supervisor1',
    password: 'LocalSupervisor!2026',
    fullName: 'Dr. M. Senthil Nathan',
    department: 'Electrical Engineering & Maintenance',
    description: 'Can register complaints, view institutional issues, and verify completed jobs.',
  },
  {
    role: 'HOD',
    roleLabel: 'Head of Department (HOD)',
    username: 'hod1',
    password: 'LocalSupervisor!2026',
    fullName: 'Dr. R. Vijayakumar (HOD EEE)',
    department: 'Electrical & Electronics Engineering',
    description: 'Can review, approve, and reject department repair and maintenance complaints.',
  },
  {
    role: 'ELECTRICIAN_HEAD',
    roleLabel: 'Electrician Head / In-Charge',
    username: 'electricianhead1',
    password: 'LocalSupervisor!2026',
    fullName: 'Thiru. K. Rajendran',
    department: 'Central Maintenance Cell',
    description: 'Can review approved tickets and assign field electricians to open work orders.',
  },
  {
    role: 'ELECTRICIAN',
    roleLabel: 'Field Technician / Electrician',
    username: 'electrician1',
    password: 'LocalSupervisor!2026',
    fullName: 'S. Murugan (Senior Electrician)',
    department: 'Central Maintenance Cell',
    description: 'Can view assigned work orders, update task progress, and submit Action Taken Reports (ATR).',
  },
  {
    role: 'MANAGER',
    roleLabel: 'Estate / Facility Manager',
    username: 'manager1',
    password: 'LocalSupervisor!2026',
    fullName: 'Mr. A. Sundaram (Campus Facility Manager)',
    department: 'Campus Administration',
    description: 'Can monitor institute-wide repair tickets, verifications, and closures.',
  },
];

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
