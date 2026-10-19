const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

// GET /api/employees?search=&department=&status=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
 const filter = { role: 'employee'};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) {
    const rx = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { jobTitle: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// GET /api/employees/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

// GET /api/employees/:id
exports.getOne = asyncHandler(async (req, res) => {
  if (req.user.role !== 'hr' && String(req.user._id) !== req.params.id) {
    res.status(403);
    throw new Error('You can only view your own profile');
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found');
  }
  res.json({ success: true, data: user });
});

// POST /api/employees  (HR)
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, jobTitle, phone, profileImage } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  const user = await User.create({ name, email, password, role, department, jobTitle, phone, profileImage });
  res.status(201).json({ success: true, data: user });
});

// PATCH /api/employees/:id
exports.update = asyncHandler(async (req, res) => {
  const isHR = req.user.role === 'hr';
  const isSelf = String(req.user._id) === req.params.id;

  if (!isHR && !isSelf) {
    res.status(403);
    throw new Error('You can only edit your own profile');
  }

  // employee sirf yeh fields badal sakta hai
  const employeeFields = ['name', 'phone', 'profileImage'];
  const hrFields = [...employeeFields, 'email', 'role', 'department', 'jobTitle', 'status'];
  const allowed = isHR ? hrFields : employeeFields;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('Employee not found');
  }

  allowed.forEach((f) => {
    if (req.body[f] !== undefined) user[f] = req.body[f];
  });

  // HR apne aap ko inactive ya employee nahi bana sakta (lock-out se bachne ke liye)
  if (isSelf && isHR && (user.status !== 'active' || user.role !== 'hr')) {
    res.status(400);
    throw new Error('You cannot deactivate or demote yourself');
  }

  await user.save();
  res.json({ success: true, data: user });
});