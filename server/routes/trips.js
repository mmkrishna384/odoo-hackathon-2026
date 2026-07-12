const express = require('express');
const router = express.Router();
const {
  getTrips, getTrip, createTrip, updateTrip, deleteTrip,
  dispatchTrip, completeTrip, cancelTrip,
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getTrips).post(protect, createTrip);
router.route('/:id').get(protect, getTrip).put(protect, updateTrip).delete(protect, deleteTrip);
router.patch('/:id/dispatch', protect, dispatchTrip);
router.patch('/:id/complete', protect, completeTrip);
router.patch('/:id/cancel', protect, cancelTrip);

module.exports = router;
