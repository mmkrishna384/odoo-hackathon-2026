const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
const getDrivers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Driver.countDocuments(query);
    const drivers = await Driver.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ drivers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
const getDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create driver
// @route   POST /api/drivers
// @access  Private
const createDriver = async (req, res) => {
  try {
    const existing = await Driver.findOne({
      licenseNumber: req.body.licenseNumber?.toUpperCase(),
    });
    if (existing) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driver = await Driver.create({
      ...req.body,
      licenseNumber: req.body.licenseNumber?.toUpperCase(),
      createdBy: req.user._id,
    });
    res.status(201).json(driver);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'License number must be unique' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available drivers
// @route   GET /api/drivers/available
// @access  Private
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({
      status: 'Available',
      licenseExpiry: { $gt: new Date() },
    }).select('name licenseNumber licenseCategory licenseExpiry safetyScore contactNumber');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, getAvailableDrivers };
