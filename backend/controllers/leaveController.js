const Leave = require('../models/Leave');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

// GET /api/leaves?status=pending&employee=<id>
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.user.role === 'hr') {
    if (req.query.employee) filter.employee = req.query.employee;
  } else {
    filter.employee = req.user._id;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Leave.find(filter)
     .populate('employee', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// POST /api/leaves
exports.create = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  if (!type || !startDate || !endDate || !reason) {
    res.status(400);
    throw new Error('type, startDate, endDate and reason are required');
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    res.status(400);
    throw new Error('Invalid dates');
  }
  if (end < start) {
    res.status(400);
    throw new Error('End date cannot be before start date');
  }

  const leave = await Leave.create({ employee: req.user._id, type, startDate: start, endDate: end, reason });
  res.status(201).json({ success: true, data: leave });
});

// GET /api/leaves/:id
exports.getOne = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id)
    .populate('employee', 'name department')
    .populate('reviewedBy', 'name');
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  const ownerId = leave.employee._id ? String(leave.employee._id) : String(leave.employee);
  if (req.user.role !== 'hr' && ownerId !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed');
  }
  res.json({ success: true, data: leave });
});

// PATCH /api/leaves/:id/review  (HR)
exports.review = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('status must be approved or rejected');
  }
  const leave = await Leave.findById(req.params.id);
  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }
  if (leave.status !== 'pending') {
    res.status(409);
    throw new Error(`This request is already ${leave.status}`);
  }
  if (String(leave.employee) === String(req.user._id)) {
    res.status(403);
    throw new Error('You cannot review your own leave');
  }

  leave.status = status;
  leave.reviewedBy = req.user._id;
  leave.reviewedAt = new Date();
  leave.reviewNote = reviewNote || '';
  await leave.save();
  await leave.populate([{ path: 'employee', select: 'name department' }, { path: 'reviewedBy', select: 'name' }]);

  res.json({ success: true, data: leave });
});