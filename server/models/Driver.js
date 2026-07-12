const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    licenseCategory: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D', 'E', 'CE', 'BE'],
    },
    licenseExpiry: { type: Date, required: true },
    contactNumber: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
    dateOfJoining: { type: Date, default: Date.now },
    emergencyContact: { type: String },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual: check if license is expired
driverSchema.virtual('isLicenseExpired').get(function () {
  return new Date() > this.licenseExpiry;
});

driverSchema.set('toJSON', { virtuals: true });
driverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', driverSchema);
