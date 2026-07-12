const express = require('express');
const router = express.Router();
const {
  getMaintenanceLogs, getMaintenanceLog, createMaintenanceLog,
  updateMaintenanceLog, deleteMaintenanceLog,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getMaintenanceLogs).post(protect, createMaintenanceLog);
router.route('/:id')
  .get(protect, getMaintenanceLog)
  .put(protect, updateMaintenanceLog)
  .delete(protect, deleteMaintenanceLog);

module.exports = router;
