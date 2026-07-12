const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('fleet_manager', 'financial_analyst'), getReports);

module.exports = router;
