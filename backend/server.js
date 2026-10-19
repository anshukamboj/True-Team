
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');


const app = express();
app.use(express.json({ limit: '1mb' }));
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API chal rahi hai',
  });
});

// Routes
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

// Error handling (must come after routes)
app.use(notFound);
app.use(errorHandler);

// Start server only after DB connects
const startServer = async () => {
  try {
    await connectDB();
    
require('./models/Organization');
require('./models/Employee');
require('./models/Job');
require('./models/Candidate');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
