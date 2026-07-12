const express = require('express');
const router = express.Router();
const {
  getDrivers, getDriver, createDriver, updateDriver, deleteDriver, getAvailableDrivers,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', protect, authorize('driver', 'safety_officer'), getAvailableDrivers);
router.route('/')
  .get(protect, authorize('safety_officer'), getDrivers)
  .post(protect, authorize('safety_officer'), createDriver);
router.route('/:id')
  .get(protect, authorize('safety_officer'), getDriver)
  .put(protect, authorize('safety_officer'), updateDriver)
  .delete(protect, authorize('safety_officer'), deleteDriver);

module.exports = router;
