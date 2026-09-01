import { describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '../components/Sidebar';

import {
  ApiError,
  approveComplaint,
  assignElectrician,
  getApiBaseUrl,
  getJobs,
  getMyComplaints,
  login,
  rejectComplaint,
} from './api';

describe('api service contract', () => {
  it('resolves default backend URL or configured env var', () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://custom-backend.test:5000/');
    expect(getApiBaseUrl()).toBe('http://custom-backend.test:5000');
    vi.unstubAllEnvs();

    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/');
    expect(getApiBaseUrl()).toBe('http://api.test');
    vi.unstubAllEnvs();

    // Default fallback (relative base path for same-origin server)
    expect(getApiBaseUrl()).toBe('');
  });

  it('uses backend login route without fake token fallback', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test/');
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({
      token: 'real-token',
      user: { role: 'HOD' },
    }), { status: 200 }));

    const data = await login({ username: 'hod1', password: 'pw' });

    expect(data.token).toBe('real-token');
    expect(fetch).toHaveBeenCalledWith('http://api.test/api/auth/login', expect.objectContaining({
      method: 'POST',
    }));

    vi.unstubAllEnvs();
  });

  it('uses authenticated my-complaints route', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test');
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true, complaints: [] }), { status: 200 }));

    await getMyComplaints('jwt');

    expect(fetch).toHaveBeenCalledWith('http://api.test/api/complaints/my', expect.objectContaining({
      method: 'GET',
    }));

    vi.unstubAllEnvs();
  });

  it('uses single PATCH approval contract', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test');
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));

    await approveComplaint('jwt', 'complaint-1');
    await rejectComplaint('jwt', 'complaint-2', 'duplicate');

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://api.test/api/approvals/complaint-1', expect.objectContaining({
      method: 'PATCH',
    }));
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://api.test/api/approvals/complaint-2', expect.objectContaining({
      method: 'PATCH',
    }));

    vi.unstubAllEnvs();
  });

  it('uses authenticated current-user jobs route and assignment route', async () => {
    vi.stubEnv('VITE_BACKEND_URL', 'http://api.test');
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));

    await getJobs('jwt');
    await assignElectrician('jwt', 'complaint-1', 'tech-1');

    expect(fetch).toHaveBeenNthCalledWith(1, 'http://api.test/api/jobs', expect.objectContaining({
      method: 'GET',
    }));
    expect(fetch).toHaveBeenNthCalledWith(2, 'http://api.test/api/tickets/complaint-1/assign-electrician', expect.objectContaining({
      method: 'PATCH',
    }));

    vi.unstubAllEnvs();
  });

  it('correctly filters navigation items for HOD role', () => {
    const hodItems = NAV_ITEMS.filter((item) => item.allowedRoles.includes('HOD'));
    const hodItemIds = hodItems.map((item) => item.id);

    expect(hodItemIds).toEqual(['raise-complaint', 'my-complaints', 'hod-approvals']);
    expect(hodItemIds).not.toContain('assign-electrician');
    expect(hodItemIds).not.toContain('my-jobs');
  });

  it('includes allocated-tracking navigation item for MANAGER role', () => {
    const managerItems = NAV_ITEMS.filter((item) => item.allowedRoles.includes('MANAGER'));
    const managerItemIds = managerItems.map((item) => item.id);

    expect(managerItemIds).toContain('allocated-tracking');
    expect(managerItemIds).toContain('assign-electrician');
    expect(managerItemIds).toContain('my-complaints');
  });
});
