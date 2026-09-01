const express = require('express');

const {
  ASSIGNMENT_ROLES,
  getElectricians,
  getUnassignedTickets,
  getAllocatedTickets,
  openTicket,
  assignElectrician,
} = require('../controllers/ticketController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
  '/electricians',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  getElectricians
);

router.get(
  '/unassigned',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  getUnassignedTickets
);

router.get(
  '/allocated',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  getAllocatedTickets
);

router.get(
  '/tracking',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  getAllocatedTickets
);

router.post(
  '/open/:complaintId',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  openTicket
);

router.patch(
  '/:id/assign-electrician',
  authenticate,
  authorizeRoles(...ASSIGNMENT_ROLES),
  assignElectrician
);

module.exports = router;
