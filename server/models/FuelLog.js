const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    liters: { type: Number, required: true, min: 0 },
    costPerLiter: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    odometerReading: { type: Number, min: 0 },
    fuelStation: { type: String, trim: true },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'Electric'], default: 'Diesel' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-calculate total cost
fuelLogSchema.pre('save', function (next) {
  if (this.liters && this.costPerLiter) {
    this.totalCost = this.liters * this.costPerLiter;
  }
  next();
});

module.exports = mongoose.model('FuelLog', fuelLogSchema);
