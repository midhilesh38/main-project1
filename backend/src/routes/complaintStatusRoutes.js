const express = require('express');

const {
  updateComplaintStatus,
} = require('../controllers/complaintStatusController');

const {
  authenticate,
  authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.patch(
  '/:complaintId/status',
  authenticate,
  authorizeRoles(
    'ELECTRICIAN_INCHARGE',
    'ELECTRICIAN_HEAD',
    'MANAGER'
  ),
  updateComplaintStatus
);

module.exports = router;
