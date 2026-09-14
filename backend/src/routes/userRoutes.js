const express = require('express');

const {
  getElectricians,
} = require('../controllers/userController');

const {
  authenticate,
  authorizeRoles,
} = require('../middleware/authMiddleware');

const router = express.Router();

const ALLOWED_ROLES = [
  'SUPERVISOR',
  'HOD',
  'ELECTRICIAN_INCHARGE',
  'ELECTRICIAN_HEAD',
  'MANAGER',
  'DEAN_IQAC',
];

router.get(
  '/electricians',
  authenticate,
  authorizeRoles(...ALLOWED_ROLES),
  getElectricians
);

module.exports = router;