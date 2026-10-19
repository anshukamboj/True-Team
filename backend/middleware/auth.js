const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Please login first');
  }

  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Session expired, login again');
  }

  const user = await User.findById(decoded.id);
  if (!user || user.status !== 'active') {
    res.status(401);
    throw new Error('Account not found or inactive');
  }

  req.user = user;
  next();
});

const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('You are not allowed to do this'));
  }
  next();
};

module.exports = { protect, allowRoles };