const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true }, // jaise EMP-2401
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    joiningDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);