const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const { vehicleType, status, region } = req.query;

    const vehicleFilter = {};
    if (vehicleType) vehicleFilter.vehicleType = vehicleType;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    // Vehicle stats
    const totalVehicles = await Vehicle.countDocuments(vehicleFilter);
    const availableVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'Available' });
    const onTripVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' });
    const inShopVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' });
    const retiredVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'Retired' });

    // Driver stats
    const totalDrivers = await Driver.countDocuments();
    const availableDrivers = await Driver.countDocuments({ status: 'Available' });
    const driversOnDuty = await Driver.countDocuments({ status: 'On Trip' });
    const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended' });

    // Trip stats
    const tripFilter = {};
    if (vehicleType || status || region) {
      const matchingVehicles = await Vehicle.find(vehicleFilter).select('_id');
      const matchingVehicleIds = matchingVehicles.map(v => v._id);
      tripFilter.vehicle = { $in: matchingVehicleIds };
    }

    const totalTrips = await Trip.countDocuments(tripFilter);
    const activeTrips = await Trip.countDocuments({ ...tripFilter, status: 'Dispatched' });
    const pendingTrips = await Trip.countDocuments({ ...tripFilter, status: 'Draft' });
    const completedTrips = await Trip.countDocuments({ ...tripFilter, status: 'Completed' });
    const cancelledTrips = await Trip.countDocuments({ ...tripFilter, status: 'Cancelled' });

    // Fleet utilization
    const fleetUtilization = totalVehicles > 0
      ? Math.round(((onTripVehicles) / totalVehicles) * 100)
      : 0;

    // Financial stats
    const fuelLogs = await FuelLog.find();
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

    const maintenanceLogs = await MaintenanceLog.find({ status: 'Completed' });
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    const expenses = await Expense.find();
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const totalRevenue = (await Trip.find({ status: 'Completed' }))
      .reduce((sum, t) => sum + (t.revenue || 0), 0);

    // Recent trips
    const recentTrips = await Trip.find()
      .populate('vehicle', 'registrationNumber vehicleName')
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly trip counts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrips = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Vehicle type distribution
    const vehicleTypes = await Vehicle.aggregate([
      { $group: { _id: '$vehicleType', count: { $sum: 1 } } },
    ]);

    // Fuel cost per vehicle (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fuelByVehicle = await FuelLog.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$vehicle',
          totalFuel: { $sum: '$liters' },
          totalCost: { $sum: '$totalCost' },
        },
      },
      { $sort: { totalCost: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        onTrip: onTripVehicles,
        inShop: inShopVehicles,
        retired: retiredVehicles,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        onDuty: driversOnDuty,
        suspended: suspendedDrivers,
      },
      trips: {
        total: totalTrips,
        active: activeTrips,
        pending: pendingTrips,
        completed: completedTrips,
        cancelled: cancelledTrips,
      },
      fleetUtilization,
      financials: {
        totalFuelCost,
        totalMaintenanceCost,
        totalExpenses,
        totalRevenue,
        totalOperationalCost: totalFuelCost + totalMaintenanceCost,
      },
      recentTrips,
      charts: {
        monthlyTrips,
        vehicleTypes,
        fuelByVehicle,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };
