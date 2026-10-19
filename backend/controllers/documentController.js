const Document = require('../models/Document');
const asyncHandler = require('../utils/asyncHandler');
const paginate = require('../utils/paginate');

// NOTE: yeh sirf document ki info (title + URL) save karta hai.
// Asli file upload ke liye multer + Cloudinary/S3 alag se lagana padega.

// GET /api/documents?category=&employee=
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  if (req.user.role === 'hr') {
    if (req.query.employee) filter.employee = req.query.employee;
  } else {
    filter.employee = req.user._id;
  }
  if (req.query.category) filter.category = req.query.category;

  const [items, total] = await Promise.all([
    Document.find(filter).populate('employee', 'name').populate('uploadedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Document.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

// GET /api/documents/:id
exports.getOne = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id).populate('employee', 'name').populate('uploadedBy', 'name');
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  if (req.user.role !== 'hr' && String(doc.employee._id) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not allowed');
  }
  res.json({ success: true, data: doc });
});

// POST /api/documents  (HR)
exports.create = asyncHandler(async (req, res) => {
  const { employee, title, category, fileUrl } = req.body;
  if (!employee || !title || !fileUrl) {
    res.status(400);
    throw new Error('employee, title and fileUrl are required');
  }
  const doc = await Document.create({ employee, title, category, fileUrl, uploadedBy: req.user._id });
  res.status(201).json({ success: true, data: doc });
});

// PATCH /api/documents/:id  (HR)
exports.update = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  ['title', 'category', 'fileUrl'].forEach((f) => {
    if (req.body[f] !== undefined) doc[f] = req.body[f];
  });
  await doc.save();
  res.json({ success: true, data: doc });
});

// DELETE /api/documents/:id  (HR)
exports.remove = asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Document not found');
  }
  res.json({ success: true, message: 'Document deleted' });
});