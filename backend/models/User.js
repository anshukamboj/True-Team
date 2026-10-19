const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
     match: [
  /^\S+@\S+\.\S+$/,
  'Please enter a valid email address'
]
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['hr', 'employee'], default: 'employee' },
    department: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    emergencyName: { type: String, trim: true, default: '' },
    emergencyRelation: { type: String, trim: true, default: '' },
    emergencyPhone: { type: String, trim: true, default: '' },
    profileImage: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      theme: { type: String, default: 'light' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);