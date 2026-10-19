const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payPeriod: { type: String, required: [true, 'Pay period is required'], trim: true }, // e.g. 2026-10
    grossPay: { type: Number, required: true, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netPay: { type: Number, required: true },
    payday: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'processed', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, payPeriod: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);