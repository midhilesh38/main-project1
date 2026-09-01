const express = require('express');
const { getHealth } = require('../controllers/healthController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/healthz', getHealth);
router.get('/livez', getHealth);

module.exports = router;