import * as api from './api';

export const ticketService = {
  async getUnassignedTickets(token) {
    return await api.getUnassignedTickets(token);
  },

  async getAllocatedTickets(token) {
    return await api.getAllocatedTickets(token);
  },

  async getElectricians(token) {
    return await api.getElectricians(token);
  },

  async assignElectrician(token, complaintId, electricianId, remarks) {
    return await api.assignElectrician(token, complaintId, electricianId, remarks);
  },
};
