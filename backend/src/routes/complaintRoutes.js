const express = require('express');

const {
  getComplaints,
  getMyComplaints,
  getComplaintById,
  createComplaint,
} = require('../controllers/complaintController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const ALL_ROLES = [
  'SUPERVISOR',
  'HOD',
  'ELECTRICIAN_INCHARGE',
  'ELECTRICIAN_HEAD',
  'ELECTRICIAN',
  'MANAGER',
  'DEAN_IQAC',
];

router.get(
  '/my',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getMyComplaints
);

router.get(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getComplaints
);

router.get(
  '/:id',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  getComplaintById
);

router.post(
  '/',
  authenticate,
  authorizeRoles(...ALL_ROLES),
  createComplaint
);

module.exports = router;
