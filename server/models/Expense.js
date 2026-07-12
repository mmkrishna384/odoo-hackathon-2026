const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    expenseType: {
      type: String,
      required: true,
      enum: ['Toll', 'Maintenance', 'Miscellaneous', 'Salary', 'Insurance', 'Tax', 'Fuel'],
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Bank Transfer', 'UPI'], default: 'Cash' },
    receiptNumber: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
