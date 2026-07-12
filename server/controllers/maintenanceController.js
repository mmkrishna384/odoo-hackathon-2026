const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// @desc    Get all maintenance logs
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceLogs = async (req, res) => {
  try {
    const { status, vehicleId, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (vehicleId) query.vehicle = vehicleId;
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { maintenanceType: { $regex: search, $options: 'i' } },
        { serviceProvider: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await MaintenanceLog.countDocuments(query);
    const logs = await MaintenanceLog.find(query)
      .populate('vehicle', 'registrationNumber vehicleName')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single maintenance log
// @route   GET /api/maintenance/:id
// @access  Private
const getMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id)
      .populate('vehicle')
      .populate('createdBy', 'name email');
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create maintenance log
// @route   POST /api/maintenance
// @access  Private
const createMaintenanceLog = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.status === 'On Trip') {
      return res.status(400).json({ message: 'Cannot schedule maintenance for vehicle currently on trip' });
    }

    if (vehicle.status === 'Retired') {
      return res.status(400).json({ message: 'Cannot schedule maintenance for retired vehicle' });
    }

    const log = await MaintenanceLog.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Update vehicle status to In Shop
    await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'In Shop' });

    const populated = await MaintenanceLog.findById(log._id).populate('vehicle', 'registrationNumber vehicleName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update maintenance log
// @route   PUT /api/maintenance/:id
// @access  Private
const updateMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

    const wasCompleted = log.status === 'Completed';
    const isNowCompleted = req.body.status === 'Completed';
    const isNowCancelled = req.body.status === 'Cancelled';

    const updated = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('vehicle');

    // If maintenance completed or cancelled -> set vehicle back to Available
    if (!wasCompleted && (isNowCompleted || isNowCancelled)) {
      const vehicle = await Vehicle.findById(log.vehicle);
      if (vehicle && vehicle.status !== 'Retired') {
        await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete maintenance log
// @route   DELETE /api/maintenance/:id
// @access  Private
const deleteMaintenanceLog = async (req, res) => {
  try {
    const log = await MaintenanceLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

    // If log is active, restore vehicle
    if (log.status === 'In Progress' || log.status === 'Scheduled') {
      const vehicle = await Vehicle.findById(log.vehicle);
      if (vehicle && vehicle.status !== 'Retired') {
        await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'Available' });
      }
    }

    await MaintenanceLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Maintenance log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMaintenanceLogs,
  getMaintenanceLog,
  createMaintenanceLog,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};
