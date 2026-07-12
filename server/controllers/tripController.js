const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
const getTrips = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { tripNumber: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Trip.countDocuments(query);
    const trips = await Trip.find(query)
      .populate('vehicle', 'registrationNumber vehicleName vehicleType')
      .populate('driver', 'name licenseNumber contactNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ trips, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver')
      .populate('createdBy', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, createdBy: req.user._id });
    const populated = await trip.populate(['vehicle', 'driver']);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (['Dispatched', 'Completed', 'Cancelled'].includes(trip.status)) {
      return res.status(400).json({ message: `Cannot edit a trip in '${trip.status}' status` });
    }

    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(['vehicle', 'driver']);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.status === 'Dispatched') {
      return res.status(400).json({ message: 'Cannot delete an active trip' });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Dispatch trip
// @route   PATCH /api/trips/:id/dispatch
// @access  Private
const dispatchTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicle = trip.vehicle;
    const driver = trip.driver;

    // Business Rule Validations
    if (!vehicle) return res.status(400).json({ message: 'Vehicle not found' });
    if (!driver) return res.status(400).json({ message: 'Driver not found' });

    if (vehicle.status === 'Retired') {
      return res.status(400).json({ message: 'Retired vehicles cannot be dispatched' });
    }

    if (vehicle.status === 'In Shop') {
      return res.status(400).json({ message: 'Vehicle is currently in maintenance' });
    }

    if (vehicle.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is not available (current status: ${vehicle.status})` });
    }

    if (driver.status === 'Suspended') {
      return res.status(400).json({ message: 'Suspended driver cannot be assigned' });
    }

    if (driver.status !== 'Available') {
      return res.status(400).json({ message: `Driver is not available (current status: ${driver.status})` });
    }

    // Check license expiry
    if (new Date() > new Date(driver.licenseExpiry)) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }

    // Check cargo weight
    if (trip.cargoWeight > vehicle.maxLoadCapacity) {
      return res.status(400).json({
        message: `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`,
      });
    }

    // All validations passed - dispatch
    await Vehicle.findByIdAndUpdate(vehicle._id, { status: 'On Trip' });
    await Driver.findByIdAndUpdate(driver._id, { status: 'On Trip' });
    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: 'Dispatched', actualStartDate: new Date() },
      { new: true }
    ).populate(['vehicle', 'driver']);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete trip
// @route   PATCH /api/trips/:id/complete
// @access  Private
const completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only dispatched trips can be completed' });
    }

    const { actualDistance, revenue } = req.body;

    // Update vehicle and driver back to Available
    await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
    await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });

    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Completed',
        actualEndDate: new Date(),
        actualDistance: actualDistance || trip.plannedDistance,
        revenue: revenue || trip.revenue,
      },
      { new: true }
    ).populate(['vehicle', 'driver']);

    // Update vehicle odometer if actualDistance provided
    if (actualDistance && trip.vehicle) {
      const vehicle = await Vehicle.findById(trip.vehicle);
      if (vehicle) {
        await Vehicle.findByIdAndUpdate(trip.vehicle, {
          odometer: vehicle.odometer + Number(actualDistance),
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel trip
// @route   PATCH /api/trips/:id/cancel
// @access  Private
const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    if (!['Draft', 'Dispatched'].includes(trip.status)) {
      return res.status(400).json({ message: 'Only Draft or Dispatched trips can be cancelled' });
    }

    // Restore vehicle and driver to Available if was dispatched
    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
    }

    const updated = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled', cancelReason: req.body.cancelReason || 'Cancelled by user' },
      { new: true }
    ).populate(['vehicle', 'driver']);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
};
