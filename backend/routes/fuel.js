const express = require('express');
const router = express.Router();
const { getFuelLogs, getFuelLog, createFuelLog, updateFuelLog, deleteFuelLog } = require('../controllers/fuelController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getFuelLogs).post(protect, createFuelLog);
router.route('/:id').get(protect, getFuelLog).put(protect, updateFuelLog).delete(protect, deleteFuelLog);

module.exports = router;
