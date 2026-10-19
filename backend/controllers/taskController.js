const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

const populateTask = (q) => q.populate('assignedTo', 'name department').populate('assignedBy', 'name');

// GET /api/tasks?status=&priority=&search=&assignedTo=&overdue=true
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};

  if (req.user.role === 'hr') {
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  } else {
    filter.assignedTo = req.user._id;
  }
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search) {
    filter.title = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  }
  if (req.query.overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: 'completed' };
  }

  const [items, total] = await Promise.all([
    populateTask(Task.find(filter).sort({ dueDate: 1, createdAt: -1 }).skip(skip).limit(limit)),
    Task.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// POST /api/tasks  (HR)
exports.create = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, dueDate, priority, status } = req.body;
  if (!title || !assignedTo) {
    res.status(400);
    throw new Error('title and assignedTo are required');
  }
  const task = await Task.create({
    title, description, assignedTo, dueDate, priority, status, assignedBy: req.user._id,
  });
  res.status(201).json({ success: true, data: await populateTask(Task.findById(task._id)) });
});

// GET /api/tasks/:id
exports.getOne = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id));
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (req.user.role !== 'hr' && String(task.assignedTo._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed');
  }
  res.json({ success: true, data: task });
});

// PATCH /api/tasks/:id
exports.update = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (req.user.role === 'hr') {
    ['title', 'description', 'assignedTo', 'dueDate', 'priority', 'status'].forEach((f) => {
      if (req.body[f] !== undefined) task[f] = req.body[f];
    });
  } else {
    if (String(task.assignedTo) !== String(req.user._id)) {
      res.status(403);
      throw new Error('This task is not assigned to you');
    }
    // employee sirf status badal sakta hai
    if (req.body.status === undefined) {
      res.status(400);
      throw new Error('You can only update the status');
    }
    task.status = req.body.status;
  }

  await task.save();
  res.json({ success: true, data: await populateTask(Task.findById(task._id)) });
});

// DELETE /api/tasks/:id  (HR)
exports.remove = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  res.json({ success: true, message: 'Task deleted' });
});