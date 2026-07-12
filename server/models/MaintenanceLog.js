const mongoose = require('mongoose');

const maintenanceLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    maintenanceType: {
      type: String,
      required: true,
      enum: ['Preventive', 'Corrective', 'Predictive', 'Emergency', 'Inspection'],
    },
    description: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'In Progress',
    },
    serviceProvider: { type: String },
    partsReplaced: [{ type: String }],
    nextMaintenanceDue: { type: Date },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceLog', maintenanceLogSchema);
