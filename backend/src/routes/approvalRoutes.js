const express = require('express');
const router = express.Router();

const {
  getPendingApprovals,
  getApprovalHistory,
  updateApproval,
  getPendingActionReportApprovals,
  updateActionReportApproval,
} = require('../controllers/approvalController');

const {
  authenticate,
  authorizeRoles,
} = require('../middleware/authMiddleware');

// GET /api/approvals/pending
// Initial complaint approvals (Only HOD can access)
router.get(
  '/pending',
  authenticate,
  authorizeRoles('HOD'),
  getPendingApprovals
);

// GET /api/approvals/history
// Approved / processed history & department tracking (Only HOD can access)
router.get(
  '/history',
  authenticate,
  authorizeRoles('HOD'),
  getApprovalHistory
);

// PATCH /api/approvals/:id
// Initial complaint approvals (Only HOD can access)
router.patch(
  '/:id',
  authenticate,
  authorizeRoles('HOD'),
  updateApproval
);

// GET /api/approvals/action-reports/pending
// Action-taken report approvals (Only HOD can access)
router.get(
  '/action-reports/pending',
  authenticate,
  authorizeRoles('HOD'),
  getPendingActionReportApprovals
);

// GET /api/approvals/reports/pending (alias)
router.get(
  '/reports/pending',
  authenticate,
  authorizeRoles('HOD'),
  getPendingActionReportApprovals
);

// PATCH /api/approvals/action-reports/:id
// Action-taken report approvals (Only HOD can access)
router.patch(
  '/action-reports/:id',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

// Additional aliases for robust ATR endorsement
router.post(
  '/action-reports/:id',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.patch(
  '/:id/action-report',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.post(
  '/:id/action-report',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.patch(
  '/:id/endorse-atr',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.post(
  '/:id/endorse-atr',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.patch(
  '/action-reports/:id/endorse',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

router.post(
  '/action-reports/:id/endorse',
  authenticate,
  authorizeRoles('HOD'),
  updateActionReportApproval
);

module.exports = router;
