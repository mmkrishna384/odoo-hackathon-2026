const express = require('express');
const router = express.Router();
const {
  getTrips, getTrip, createTrip, updateTrip, deleteTrip,
  dispatchTrip, completeTrip, cancelTrip,
} = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('fleet_manager', 'driver'), getTrips)
  .post(protect, authorize('fleet_manager'), createTrip);
router.route('/:id')
  .get(protect, authorize('fleet_manager', 'driver'), getTrip)
  .put(protect, authorize('fleet_manager'), updateTrip)
  .delete(protect, authorize('fleet_manager'), deleteTrip);
router.patch('/:id/dispatch', protect, authorize('fleet_manager'), dispatchTrip);
router.patch('/:id/complete', protect, authorize('fleet_manager'), completeTrip);
router.patch('/:id/cancel', protect, authorize('fleet_manager'), cancelTrip);

module.exports = router;
