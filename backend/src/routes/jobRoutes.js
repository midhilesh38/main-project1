const express = require('express');

const {
  getJobs,
  updateJobStatus,
  submitActionTakenReport,
} = require('../controllers/jobController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

const TECHNICIAN_ROLES = [
  'ELECTRICIAN',
  'ELECTRICIAN_INCHARGE',
  'ELECTRICIAN_HEAD',
  'SUPERVISOR',
  'MANAGER',
  'HOD',
  'DEAN_IQAC',
];

router.get(
  '/',
  authenticate,
  authorizeRoles(...TECHNICIAN_ROLES),
  getJobs
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles(...TECHNICIAN_ROLES),
  updateJobStatus
);

router.post(
  '/:id/action-taken',
  authenticate,
  authorizeRoles(...TECHNICIAN_ROLES),
  submitActionTakenReport
);

module.exports = router;
