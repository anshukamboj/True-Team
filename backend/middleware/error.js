const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Already exists: ' + Object.keys(err.keyValue || {}).join(', ');
  }

  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Server error';
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };