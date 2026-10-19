const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    departments: { type: [String], default: [] },
    contact: {
      email: String,
      phone: String,
      address: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);