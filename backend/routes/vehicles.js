const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getAvailableVehicles,
} = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.get('/available', protect, getAvailableVehicles);
router.route('/').get(protect, getVehicles).post(protect, createVehicle);
router.route('/:id').get(protect, getVehicle).put(protect, updateVehicle).delete(protect, deleteVehicle);

module.exports = router;
