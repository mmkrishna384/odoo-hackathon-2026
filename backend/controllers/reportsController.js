const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const MaintenanceLog = require('../models/MaintenanceLog');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

// @desc    Get reports data
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.query;
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {};
    if (Object.keys(dateFilter).length) matchStage.date = dateFilter;
    if (vehicleId) matchStage.vehicle = new mongoose.Types.ObjectId(vehicleId);

    // Fuel efficiency per vehicle (km/L)
    const completedTrips = await Trip.find({
      status: 'Completed',
      ...(vehicleId && { vehicle: vehicleId }),
      ...(Object.keys(dateFilter).length && { actualEndDate: dateFilter }),
    }).populate('vehicle', 'registrationNumber vehicleName acquisitionCost');

    const fuelLogs = await FuelLog.find({
      ...(vehicleId && { vehicle: vehicleId }),
      ...(Object.keys(dateFilter).length && { date: dateFilter }),
    });

    const maintenanceLogs = await MaintenanceLog.find({
      status: 'Completed',
      ...(vehicleId && { vehicle: vehicleId }),
    });

    // Group fuel by vehicle
    const fuelByVehicle = {};
    fuelLogs.forEach((f) => {
      const vid = f.vehicle.toString();
      if (!fuelByVehicle[vid]) fuelByVehicle[vid] = { liters: 0, cost: 0 };
      fuelByVehicle[vid].liters += f.liters;
      fuelByVehicle[vid].cost += f.totalCost;
    });

    // Group maintenance by vehicle
    const maintByVehicle = {};
    maintenanceLogs.forEach((m) => {
      const vid = m.vehicle.toString();
      if (!maintByVehicle[vid]) maintByVehicle[vid] = 0;
      maintByVehicle[vid] += m.cost;
    });

    // Group revenue by vehicle
    const revenueByVehicle = {};
    const distanceByVehicle = {};
    completedTrips.forEach((t) => {
      const vid = t.vehicle?._id?.toString();
      if (!vid) return;
      if (!revenueByVehicle[vid]) revenueByVehicle[vid] = 0;
      if (!distanceByVehicle[vid]) distanceByVehicle[vid] = 0;
      revenueByVehicle[vid] += t.revenue || 0;
      distanceByVehicle[vid] += t.actualDistance || t.plannedDistance || 0;
    });

    // All vehicles
    const vehicles = await Vehicle.find(vehicleId ? { _id: vehicleId } : {});

    const vehicleReports = vehicles.map((v) => {
      const vid = v._id.toString();
      const fuel = fuelByVehicle[vid] || { liters: 0, cost: 0 };
      const maintCost = maintByVehicle[vid] || 0;
      const revenue = revenueByVehicle[vid] || 0;
      const distance = distanceByVehicle[vid] || 0;
      const fuelEfficiency = fuel.liters > 0 ? (distance / fuel.liters).toFixed(2) : 0;
      const operationalCost = fuel.cost + maintCost;
      const roi = v.acquisitionCost > 0
        ? (((revenue - operationalCost) / v.acquisitionCost) * 100).toFixed(2)
        : 0;

      return {
        vehicle: {
          _id: v._id,
          registrationNumber: v.registrationNumber,
          vehicleName: v.vehicleName,
          vehicleType: v.vehicleType,
          acquisitionCost: v.acquisitionCost,
          status: v.status,
        },
        fuel: { liters: fuel.liters, cost: fuel.cost },
        maintenanceCost: maintCost,
        revenue,
        distance,
        fuelEfficiency: Number(fuelEfficiency),
        operationalCost,
        roi: Number(roi),
      };
    });

    // Fleet utilization
    const totalVehicles = await Vehicle.countDocuments();
    const onTripVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
    const fleetUtilization = totalVehicles > 0
      ? Math.round((onTripVehicles / totalVehicles) * 100)
      : 0;

    // Monthly expense breakdown
    const monthlyExpenses = await Expense.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$expenseType',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Monthly fuel costs
    const monthlyFuel = await FuelLog.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          liters: { $sum: '$liters' },
          cost: { $sum: '$totalCost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      vehicleReports,
      fleetUtilization,
      monthlyExpenses,
      monthlyFuel,
      summary: {
        totalRevenue: Object.values(revenueByVehicle).reduce((a, b) => a + b, 0),
        totalFuelCost: fuelLogs.reduce((a, b) => a + b.totalCost, 0),
        totalMaintenanceCost: maintenanceLogs.reduce((a, b) => a + b.cost, 0),
        totalTrips: completedTrips.length,
        totalDistance: Object.values(distanceByVehicle).reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReports };
