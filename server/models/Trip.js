const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    tripNumber: { type: String, unique: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeight: { type: Number, required: true, min: 0 }, // in kg
    cargoDescription: { type: String },
    plannedDistance: { type: Number, required: true, min: 0 }, // in km
    actualDistance: { type: Number, min: 0 },
    plannedStartDate: { type: Date },
    actualStartDate: { type: Date },
    plannedEndDate: { type: Date },
    actualEndDate: { type: Date },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    revenue: { type: Number, default: 0 },
    notes: { type: String },
    cancelReason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-generate trip number
tripSchema.pre('save', async function (next) {
  if (!this.tripNumber) {
    const lastTrip = await mongoose.model('Trip').findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextNum = 1;
    if (lastTrip && lastTrip.tripNumber) {
      const match = lastTrip.tripNumber.match(/TRP-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    this.tripNumber = `TRP-${String(nextNum).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Trip', tripSchema);
