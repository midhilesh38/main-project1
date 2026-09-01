export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_BACKEND_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  '';

export function getApiBaseUrl() {
  const envBackendUrl =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.VITE_BACKEND_URL || import.meta.env?.VITE_API_BASE_URL
      : undefined;

  const currentEnvUrl = envBackendUrl !== undefined ? envBackendUrl : API_BASE_URL;

  if (!currentEnvUrl || currentEnvUrl === '/' || currentEnvUrl === '') {
    return '';
  }

  const trimmed = String(currentEnvUrl).trim().replace(/\/$/, '');

  // If in browser cloud preview environment (not on localhost) and baseUrl points to localhost,
  // fallback to relative same-origin so requests reach the cloud container backend.
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    (trimmed.includes('localhost') || trimmed.includes('127.0.0.1'))
  ) {
    return '';
  }

  return trimmed;
}

export async function request(path, { method = 'GET', token, body } = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    Accept: 'application/json',
    ...(body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    throw new ApiError(
      'Backend unavailable. Check VITE_BACKEND_URL and confirm the backend is running.',
      0,
      { originalError: networkErr.message }
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(
        'Invalid username/Employee ID or password',
        401,
        payload
      );
    }

    throw new ApiError(
      payload.message || `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload;
}

// Health Check
export const checkHealth = () =>
  request('/api/health');

// Authentication & Users
export const login = (body) =>
  request('/api/auth/login', {
    method: 'POST',
    body,
  });

export const getCurrentUser = (token) =>
  request('/api/auth/me', { token });

// Complaints
export const createComplaint = (token, body) =>
  request('/api/complaints', {
    method: 'POST',
    token,
    body,
  });

export const getComplaints = (token, params = {}) => {
  const query = new URLSearchParams();
  if (params.my) query.append('my', 'true');
  if (params.scope) query.append('scope', params.scope);
  const qs = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/complaints${qs}`, { token });
};

export const getMyComplaints = (token) =>
  request('/api/complaints/my', { token });

export const getComplaintById = (token, id) =>
  request(`/api/complaints/${id}`, { token });

// HOD Approvals
export const getPendingApprovals = (token) =>
  request('/api/approvals/pending', { token });

export const getApprovalHistory = (token) =>
  request('/api/approvals/history', { token });

export const approveComplaint = (token, id, remarks) =>
  request(`/api/approvals/${id}`, {
    method: 'PATCH',
    token,
    body: { status: 'APPROVED', remarks },
  });

export const rejectComplaint = (token, id, rejectionReason) =>
  request(`/api/approvals/${id}`, {
    method: 'PATCH',
    token,
    body: { status: 'REJECTED', rejectionReason },
  });

export const getPendingActionReportApprovals = (token) =>
  request('/api/approvals/action-reports/pending', { token });

export const reviewActionReport = (token, id, status, remarks, rejectionReason) =>
  request(`/api/approvals/action-reports/${id}`, {
    method: 'PATCH',
    token,
    body: { status, remarks, rejectionReason },
  });

// Electrician Allocation / Tickets
export const getUnassignedTickets = (token) =>
  request('/api/tickets/unassigned', { token });

export const getAllocatedTickets = (token) =>
  request('/api/tickets/allocated', { token });

export const getElectricians = (token) =>
  request('/api/tickets/electricians', { token });

export const assignElectrician = (token, complaintId, electricianId, remarks) =>
  request(`/api/tickets/${complaintId}/assign-electrician`, {
    method: 'PATCH',
    token,
    body: { electricianId, remarks },
  });

// Work Orders / Jobs (Technician View)
export const getJobs = (token) =>
  request('/api/jobs', { token });

export const updateJobStatus = (token, assignmentId, status) =>
  request(`/api/jobs/${assignmentId}/status`, {
    method: 'PATCH',
    token,
    body: { status },
  });

export const submitActionTakenReport = (token, assignmentId, actionTaken, partsUsed) =>
  request(`/api/jobs/${assignmentId}/action-taken`, {
    method: 'POST',
    token,
    body: { actionTaken, partsUsed },
  });

// Verifications and Final Closure
export const verifyComplaint = (token, complaintId, isVerified, remarks) =>
  request(`/api/verifications/${complaintId}`, {
    method: 'POST',
    token,
    body: { isVerified, remarks },
  });

export const closeComplaint = (token, complaintId, remarks) =>
  request(`/api/verifications/${complaintId}/close`, {
    method: 'POST',
    token,
    body: { remarks },
  });
