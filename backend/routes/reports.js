const express = require('express');
const router = express.Router();
const { getReports } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getReports);

module.exports = router;
