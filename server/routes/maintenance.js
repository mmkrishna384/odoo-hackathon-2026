const express = require('express');
const router = express.Router();
const {
  getMaintenanceLogs, getMaintenanceLog, createMaintenanceLog,
  updateMaintenanceLog, deleteMaintenanceLog,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('fleet_manager'), getMaintenanceLogs)
  .post(protect, authorize('fleet_manager'), createMaintenanceLog);
router.route('/:id')
  .get(protect, authorize('fleet_manager'), getMaintenanceLog)
  .put(protect, authorize('fleet_manager'), updateMaintenanceLog)
  .delete(protect, authorize('fleet_manager'), deleteMaintenanceLog);

module.exports = router;
