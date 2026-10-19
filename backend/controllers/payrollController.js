const Payroll = require('../models/Payroll');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

const isMoney = (n) => typeof n === 'number' && isFinite(n) && n >= 0;

// GET /api/payroll?employee=&status=&payPeriod=
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.user.role === 'hr') {
    if (req.query.employee) filter.employee = req.query.employee;
  } else {
    filter.employee = req.user._id;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.payPeriod) filter.payPeriod = req.query.payPeriod;

  const [items, total] = await Promise.all([
    Payroll.find(filter).populate('employee', 'name department').sort({ payday: -1 }).skip(skip).limit(limit),
    Payroll.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// GET /api/payroll/:id
exports.getOne = asyncHandler(async (req, res) => {
  const record = await Payroll.findById(req.params.id).populate('employee', 'name department');
  if (!record) {
    res.status(404);
    throw new Error('Payroll record not found');
  }
  if (req.user.role !== 'hr' && String(record.employee._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed');
  }
  res.json({ success: true, data: record });
});

// POST /api/payroll  (HR)
exports.create = asyncHandler(async (req, res) => {
  const { employee, payPeriod, grossPay, deductions = 0, payday, status } = req.body;
  if (!employee || !payPeriod || !payday) {
    res.status(400);
    throw new Error('employee, payPeriod and payday are required');
  }
  if (!isMoney(grossPay) || !isMoney(deductions)) {
    res.status(400);
    throw new Error('grossPay and deductions must be non-negative numbers');
  }
  if (deductions > grossPay) {
    res.status(400);
    throw new Error('Deductions cannot be more than gross pay');
  }
  const record = await Payroll.create({
    employee, payPeriod, grossPay, deductions, payday, status,
    netPay: grossPay - deductions, // server pe calculate hota hai
  });
  res.status(201).json({ success: true, data: record });
});

// PATCH /api/payroll/:id  (HR)
exports.update = asyncHandler(async (req, res) => {
  const record = await Payroll.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Payroll record not found');
  }

  ['payPeriod', 'payday', 'status'].forEach((f) => {
    if (req.body[f] !== undefined) record[f] = req.body[f];
  });
  if (req.body.grossPay !== undefined) record.grossPay = req.body.grossPay;
  if (req.body.deductions !== undefined) record.deductions = req.body.deductions;

  if (!isMoney(record.grossPay) || !isMoney(record.deductions)) {
    res.status(400);
    throw new Error('grossPay and deductions must be non-negative numbers');
  }
  if (record.deductions > record.grossPay) {
    res.status(400);
    throw new Error('Deductions cannot be more than gross pay');
  }
  record.netPay = record.grossPay - record.deductions;

  await record.save();
  res.json({ success: true, data: record });
});