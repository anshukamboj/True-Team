require('dotenv').config();
const path = require('path');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

// Register models once early
require('./models/Organization');
require('./models/Employee');
require('./models/Job');
require('./models/Candidate');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendDistPath = path.join(__dirname, '../frontend/trueteam/dist');

// Global Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Serve frontend static assets
app.use(express.static(frontendDistPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API chal rahi hai',
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/public', require('./routes/public'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));

// SPA Fallback: Send index.html for non-API GET requests
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Error handling middleware (catches unhandled /api routes and internal errors)
app.use(notFound);
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();