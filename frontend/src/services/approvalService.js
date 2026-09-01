import * as api from './api';

export const approvalService = {
  async getPendingApprovals(token) {
    return await api.getPendingApprovals(token);
  },

  async getApprovalHistory(token) {
    return await api.getApprovalHistory(token);
  },

  async approveComplaint(token, id, remarks) {
    return await api.approveComplaint(token, id, remarks);
  },

  async rejectComplaint(token, id, rejectionReason) {
    return await api.rejectComplaint(token, id, rejectionReason);
  },

  async getPendingActionReports(token) {
    return await api.getPendingActionReportApprovals(token);
  },

  async reviewActionReport(token, id, status, remarks, reason) {
    return await api.reviewActionReport(token, id, status, remarks, reason);
  },
};
