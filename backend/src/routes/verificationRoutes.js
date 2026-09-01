const express = require('express');

const {
  VERIFIER_ROLES,
  getPendingVerifications,
  verifyComplaint,
  closeComplaint,
  verifyAndCloseComplaint,
} = require('../controllers/verificationController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/verifications/pending
// List complaints ready for verification / closure
router.get(
  '/pending',
  authenticate,
  authorizeRoles(...VERIFIER_ROLES),
  getPendingVerifications
);

// POST /api/verifications/:complaintId
// Record verification result (isVerified: true / false)
router.post(
  '/:complaintId',
  authenticate,
  authorizeRoles(...VERIFIER_ROLES),
  verifyComplaint
);

// POST /api/verifications/:complaintId/close
// Close a verified complaint
router.post(
  '/:complaintId/close',
  authenticate,
  authorizeRoles(...VERIFIER_ROLES),
  closeComplaint
);

// POST /api/verifications/:complaintId/verify-and-close
// Verify and close complaint in single step
router.post(
  '/:complaintId/verify-and-close',
  authenticate,
  authorizeRoles(...VERIFIER_ROLES),
  verifyAndCloseComplaint
);

module.exports = router;

