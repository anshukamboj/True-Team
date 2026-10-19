const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');
const { todayStr, isLate } = require('../utils/date');

// GET /api/attendance?month=2026-10&employee=<id>
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.user.role === 'hr') {
    if (req.query.employee) filter.employee = new mongoose.Types.ObjectId(req.query.employee);
  } else {
    filter.employee = req.user._id;
  }

  if (req.query.month) {
    if (!/^\d{4}-\d{2}$/.test(req.query.month)) {
      res.status(400);
      throw new Error('month must look like 2026-10');
    }
    filter.date = { $regex: `^${req.query.month}` };
  }
  if (req.query.date) filter.date = req.query.date;
  if (req.query.status) filter.status = req.query.status;

  const [items, total, counts] = await Promise.all([
    Attendance.find(filter).populate('employee', 'name department jobTitle').sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
    Attendance.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const summary = { present: 0, absent: 0, late: 0, remote: 0 };
  counts.forEach((c) => (summary[c._id] = c.count));

  res.json({ success: true, data: items, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// POST /api/attendance/clock-in
exports.clockIn = asyncHandler(async (req, res) => {
  const date = todayStr();
  const exists = await Attendance.findOne({ employee: req.user._id, date });
  if (exists) {
    res.status(409);
    throw new Error('You already clocked in today');
  }

  const now = new Date();
  const status = req.body.remote ? 'remote' : isLate(now) ? 'late' : 'present';

  const record = await Attendance.create({ employee: req.user._id, date, clockIn: now, status });
  res.status(201).json({ success: true, data: record });
});

// PATCH /api/attendance/clock-out
exports.clockOut = asyncHandler(async (req, res) => {
  const record = await Attendance.findOne({ employee: req.user._id, date: todayStr() });
  if (!record || !record.clockIn) {
    res.status(400);
    throw new Error('Clock in first');
  }
  if (record.clockOut) {
    res.status(409);
    throw new Error('You already clocked out today');
  }
  record.clockOut = new Date();
  await record.save();
  res.json({ success: true, data: record });
});

// POST /api/attendance  (HR manual entry)
exports.create = asyncHandler(async (req, res) => {
  const { employee, date, clockIn, clockOut, status, notes } = req.body;
  if (!employee || !date) {
    res.status(400);
    throw new Error('employee and date are required');
  }
  if (clockIn && clockOut && new Date(clockOut) < new Date(clockIn)) {
    res.status(400);
    throw new Error('Clock-out cannot be before clock-in');
  }
  const record = await Attendance.create({ employee, date, clockIn, clockOut, status, notes });
  res.status(201).json({ success: true, data: record });
});

// PATCH /api/attendance/:id  (HR)
exports.update = asyncHandler(async (req, res) => {
  const record = await Attendance.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Record not found');
  }
  ['clockIn', 'clockOut', 'status', 'notes'].forEach((f) => {
    if (req.body[f] !== undefined) record[f] = req.body[f];
  });
  if (record.clockIn && record.clockOut && record.clockOut < record.clockIn) {
    res.status(400);
    throw new Error('Clock-out cannot be before clock-in');
  }
  await record.save();
  res.json({ success: true, data: record });
});

// GET /api/attendance/stats?month=2026-10  (NEW: trend + heatmap ke liye)
exports.getStats = asyncHandler(async (req, res) => {
  const month = req.query.month || todayStr().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month)) {
    res.status(400);
    throw new Error('month must look like 2026-10');
  }

  const match = { date: { $regex: `^${month}` } };
  if (req.user.role !== 'hr') match.employee = req.user._id;

  const rows = await Attendance.aggregate([
    { $match: match },
    { $group: { _id: { date: '$date', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const byDate = {};
  rows.forEach(({ _id, count }) => {
    if (!byDate[_id.date]) {
      byDate[_id.date] = { date: _id.date, present: 0, late: 0, remote: 0, absent: 0 };
    }
    byDate[_id.date][_id.status] = count;
  });

  const data = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  res.json({ success: true, data });
});