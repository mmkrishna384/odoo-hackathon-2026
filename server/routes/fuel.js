const express = require('express');
const router = express.Router();
const { getFuelLogs, getFuelLog, createFuelLog, updateFuelLog, deleteFuelLog } = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('financial_analyst'), getFuelLogs)
  .post(protect, authorize('financial_analyst'), createFuelLog);
router.route('/:id')
  .get(protect, authorize('financial_analyst'), getFuelLog)
  .put(protect, authorize('financial_analyst'), updateFuelLog)
  .delete(protect, authorize('financial_analyst'), deleteFuelLog);

module.exports = router;
