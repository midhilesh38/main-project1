import * as api from './api';

export const complaintService = {
  async registerComplaint(token, payload) {
    return await api.createComplaint(token, {
      title: payload.title || `${payload.category} Issue at ${payload.locationBuilding} - ${payload.roomAreaNumber}`,
      description: payload.description,
      category: payload.category || 'ELECTRICAL',
      priority: payload.priority || 'MEDIUM',
      slaDueAt: payload.slaDueAt
        ? new Date(payload.slaDueAt).toISOString()
        : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      locationBuilding: payload.locationBuilding,
      floorArea: payload.floorArea,
      roomAreaNumber: payload.roomAreaNumber,
      requesterContact: payload.requesterContact || payload.contactPhone,
      locationIntercom: payload.locationIntercom,
      contactPhone: payload.requesterContact || payload.contactPhone,
      contactEmail: payload.contactEmail,
    });
  },

  async getComplaints(token, params = {}) {
    return await api.getComplaints(token, params);
  },

  async getMyComplaints(token) {
    try {
      return await api.getMyComplaints(token);
    } catch (err) {
      // fallback to getComplaints with my query param if needed
      return await api.getComplaints(token, { my: true });
    }
  },

  async getComplaintById(token, id) {
    return await api.getComplaintById(token, id);
  },
};
