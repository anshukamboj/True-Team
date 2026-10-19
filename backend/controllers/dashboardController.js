const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const { todayStr } = require('../utils/date');

const isHR = (req) => req.user.role === 'hr';
const scope = (req, field = 'employee') => (isHR(req) ? {} : { [field]: req.user._id });

// GET /api/dashboard/summary
exports.summary = asyncHandler(async (req, res) => {
  const today = todayStr();

  const [totalEmployees, todayCounts, pendingLeaves, openTasks, completedTasks, recentLeaves, perf] =
    await Promise.all([
      isHR(req) ? User.countDocuments({
  role: 'employee',
  status: 'active'
}) : Promise.resolve(1),
      Attendance.aggregate([
        { $match: { date: today, ...scope(req) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Leave.countDocuments({ status: 'pending', ...scope(req) }),
      Task.countDocuments({ status: { $ne: 'completed' }, ...scope(req, 'assignedTo') }),
      Task.countDocuments({ status: 'completed', ...scope(req, 'assignedTo') }),
      Leave.find(scope(req)).populate('employee', 'name').sort({ createdAt: -1 }).limit(5),
      Performance.aggregate([
        { $match: scope(req) },
        { $group: { _id: null, average: { $avg: '$score' }, reviews: { $sum: 1 } } },
      ]),
    ]);

  const attendanceToday = { present: 0, absent: 0, late: 0, remote: 0 };
  todayCounts.forEach((c) => (attendanceToday[c._id] = c.count));

  // jinhone aaj clock-in nahi kiya unhe absent maan lete hain (sirf HR ke liye)
  if (isHR(req)) {
    const marked = Object.values(attendanceToday).reduce((a, b) => a + b, 0);
    attendanceToday.absent += Math.max(totalEmployees - marked, 0);
  }

  res.json({
    success: true,
    data: {
      totalEmployees,
      attendanceToday,
      pendingLeaves,
      tasks: { open: openTasks, completed: completedTasks },
      recentLeaves,
      performance: perf[0]
        ? { average: Math.round(perf[0].average * 10) / 10, reviews: perf[0].reviews }
        : { average: 0, reviews: 0 },
    },
  });
});

// GET /api/dashboard/attendance
exports.attendance = asyncHandler(async (req, res) => {
  const recent = await Attendance.find(scope(req))
    .populate('employee', 'name department')
    .sort({ date: -1, createdAt: -1 })
    .limit(10);

  // pichhle 7 din ka trend
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(todayStr(new Date(Date.now() - i * 86400000)));
  }
  const trend = await Attendance.aggregate([
    { $match: { date: { $in: days }, ...scope(req) } },
    { $group: { _id: { date: '$date', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const weekly = days.map((d) => {
    const row = { date: d, present: 0, absent: 0, late: 0, remote: 0 };
    trend.filter((t) => t._id.date === d).forEach((t) => (row[t._id.status] = t.count));
    return row;
  });

  res.json({ success: true, data: { recent, weekly } });
});

// GET /api/dashboard/tasks
exports.tasks = asyncHandler(async (req, res) => {
  const filter = scope(req, 'assignedTo');

  const [byStatus, byPriority, upcoming] = await Promise.all([
    Task.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $match: filter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.find({ ...filter, status: { $ne: 'completed' } })
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 })
      .limit(5),
  ]);

  const toObj = (arr) => arr.reduce((o, x) => ({ ...o, [x._id]: x.count }), {});
  res.json({ success: true, data: { byStatus: toObj(byStatus), byPriority: toObj(byPriority), upcoming } });
});