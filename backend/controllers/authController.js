const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  if (user.status !== 'active') {
    res.status(403);
    throw new Error('Your account is inactive');
  }

  res.json({ success: true, data: { token: generateToken(user._id), user } });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// POST /api/auth/users  (HR only)
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, jobTitle, phone } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const user = await User.create({ name, email, password, role, department, jobTitle, phone });
  res.status(201).json({ success: true, data: user });
});
// PATCH /api/auth/me  (user apni profile khud edit kare)
exports.updateMe = asyncHandler(async (req, res) => {
  // sirf ye fields edit ho sakti hain. email, role, password, department nahi.
  const allowed = ['name', 'phone', 'dob', 'gender', 'address', 'emergencyName', 'emergencyRelation', 'emergencyPhone'];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (updates.name !== undefined && !String(updates.name).trim()) {
    res.status(400);
    throw new Error('Name cannot be empty');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user });
});