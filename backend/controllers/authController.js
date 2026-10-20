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

  const cleanEmail = String(email).trim().toLowerCase();

  // Find user and explicitly include password
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  // Diagnostic Logs (Watch your terminal when submitting login)
  console.log('--- LOGIN DEBUG ---');
  console.log('Lookup Email:', cleanEmail);
  console.log('User Found:', Boolean(user));

  if (!user) {
    console.log('❌ Failure: No user found with this email in the database');
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  console.log('Password Match Result:', isMatch);

  if (!isMatch) {
    console.log('❌ Failure: Password does not match stored hash');
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check account status (defaults to active if field is missing)
  if (user.status && user.status !== 'active') {
    res.status(403);
    throw new Error('Your account is inactive');
  }

  // Remove password from returned response object
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json({
    success: true,
    data: {
      token: generateToken(user._id),
      user: userResponse
    }
  });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// POST /api/auth/users (HR only)
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, jobTitle, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const cleanEmail = String(email).trim().toLowerCase();

  const user = await User.create({
    name,
    email: cleanEmail,
    password,
    role,
    department,
    jobTitle,
    phone
  });

  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(201).json({ success: true, data: userResponse });
});

// PATCH /api/auth/me (Self profile update)
exports.updateMe = asyncHandler(async (req, res) => {
  const allowed = [
    'name',
    'phone',
    'dob',
    'gender',
    'address',
    'emergencyName',
    'emergencyRelation',
    'emergencyPhone'
  ];
  const updates = {};

  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  if (updates.name !== undefined && !String(updates.name).trim()) {
    res.status(400);
    throw new Error('Name cannot be empty');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  res.json({ success: true, data: user });
});