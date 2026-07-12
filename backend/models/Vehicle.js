const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleName: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    vehicleType: {
      type: String,
      required: true,
      enum: ['Truck', 'Van', 'Pickup', 'Tanker', 'Trailer', 'Bus', 'Car', 'Motorcycle'],
    },
    maxLoadCapacity: { type: Number, required: true, min: 0 }, // in kg
    odometer: { type: Number, default: 0, min: 0 }, // in km
    acquisitionCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available',
    },
    region: { type: String, trim: true },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'CNG', 'Electric'], default: 'Diesel' },
    yearOfManufacture: { type: Number },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
