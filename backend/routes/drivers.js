const express = require('express');
const router = express.Router();
const {
  getDrivers, getDriver, createDriver, updateDriver, deleteDriver, getAvailableDrivers,
} = require('../controllers/driverController');
const { protect } = require('../middleware/auth');

router.get('/available', protect, getAvailableDrivers);
router.route('/').get(protect, getDrivers).post(protect, createDriver);
router.route('/:id').get(protect, getDriver).put(protect, updateDriver).delete(protect, deleteDriver);

module.exports = router;
