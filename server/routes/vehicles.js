const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getAvailableVehicles,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/available', protect, authorize('fleet_manager', 'driver'), getAvailableVehicles);
router.route('/')
  .get(protect, authorize('fleet_manager', 'driver'), getVehicles)
  .post(protect, authorize('fleet_manager'), createVehicle);
router.route('/:id')
  .get(protect, authorize('fleet_manager', 'driver'), getVehicle)
  .put(protect, authorize('fleet_manager'), updateVehicle)
  .delete(protect, authorize('fleet_manager'), deleteVehicle);

module.exports = router;
