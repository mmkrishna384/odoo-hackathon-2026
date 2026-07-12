const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
const getVehicles = async (req, res) => {
  try {
    const { status, vehicleType, region, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicleType) query.vehicleType = vehicleType;
    if (region) query.region = region;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { vehicleName: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      vehicles,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create vehicle
// @route   POST /api/vehicles
// @access  Private
const createVehicle = async (req, res) => {
  try {
    const existing = await Vehicle.findOne({
      registrationNumber: req.body.registrationNumber?.toUpperCase(),
    });
    if (existing) {
      return res.status(400).json({ message: 'Vehicle with this registration number already exists' });
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      registrationNumber: req.body.registrationNumber?.toUpperCase(),
      createdBy: req.user._id,
    });
    res.status(201).json(vehicle);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Registration number must be unique' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    // Check unique reg number if changed
    if (req.body.registrationNumber &&
        req.body.registrationNumber.toUpperCase() !== vehicle.registrationNumber) {
      const existing = await Vehicle.findOne({
        registrationNumber: req.body.registrationNumber.toUpperCase(),
      });
      if (existing) {
        return res.status(400).json({ message: 'Registration number already in use' });
      }
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available vehicles for dispatch
// @route   GET /api/vehicles/available
// @access  Private
const getAvailableVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({
      status: 'Available',
    }).select('registrationNumber vehicleName model vehicleType maxLoadCapacity');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, getAvailableVehicles };
