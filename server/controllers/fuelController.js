const mongoose = require('mongoose');
const FuelLog = require('../models/FuelLog');

// @desc    Get all fuel logs
// @route   GET /api/fuel
// @access  Private
const getFuelLogs = async (req, res) => {
  try {
    const { vehicleId, search, page = 1, limit = 10, startDate, endDate } = req.query;
    const query = {};

    if (vehicleId) query.vehicle = new mongoose.Types.ObjectId(vehicleId);
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await FuelLog.countDocuments(query);
    const logs = await FuelLog.find(query)
      .populate('vehicle', 'registrationNumber vehicleName')
      .populate('trip', 'tripNumber source destination')
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Total stats
    const stats = await FuelLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$liters' },
          totalCost: { $sum: '$totalCost' },
        },
      },
    ]);

    res.json({
      logs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      stats: stats[0] || { totalLiters: 0, totalCost: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single fuel log
// @route   GET /api/fuel/:id
// @access  Private
const getFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id)
      .populate('vehicle')
      .populate('trip', 'tripNumber');
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create fuel log
// @route   POST /api/fuel
// @access  Private
const createFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.create({ ...req.body, createdBy: req.user._id });
    const populated = await FuelLog.findById(log._id)
      .populate('vehicle', 'registrationNumber vehicleName')
      .populate('trip', 'tripNumber');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fuel log
// @route   PUT /api/fuel/:id
// @access  Private
const updateFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });

    const updated = await FuelLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle', 'registrationNumber vehicleName');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete fuel log
// @route   DELETE /api/fuel/:id
// @access  Private
const deleteFuelLog = async (req, res) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Fuel log not found' });

    await FuelLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fuel log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFuelLogs, getFuelLog, createFuelLog, updateFuelLog, deleteFuelLog };
