import * as api from './api';

export const jobService = {
  async getMyJobs(token) {
    return await api.getJobs(token);
  },

  async startJob(token, assignmentId) {
    return await api.updateJobStatus(token, assignmentId, 'IN_PROGRESS');
  },

  async completeJob(token, assignmentId, actionTaken, partsUsed) {
    // 1. Mark assignment status as COMPLETED first
    await api.updateJobStatus(token, assignmentId, 'COMPLETED');
    // 2. Submit Action Taken Report (ATR)
    const atrRes = await api.submitActionTakenReport(token, assignmentId, actionTaken, partsUsed);
    return atrRes;
  },

  async verifyComplaint(token, complaintId, isVerified, remarks) {
    return await api.verifyComplaint(token, complaintId, isVerified, remarks);
  },

  async closeComplaint(token, complaintId, remarks) {
    return await api.closeComplaint(token, complaintId, remarks);
  },
};
