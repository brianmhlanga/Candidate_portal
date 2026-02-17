const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const questionRoutes = require('./routes/questions');
const questionnaireRoutes = require('./routes/questionnaire');
const onboardingRoutes = require('./routes/onboarding');
const minimalUploadRoutes = require('./routes/minimal-upload');
const bypassRoutes = require('./routes/bypass-routes');
const videoRoutes = require('./routes/video'); // NEW

// Database setup
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize passport BEFORE loading auth middleware
app.use(passport.initialize());
require('./middleware/auth'); // This loads and configures the JWT strategy

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/questionnaire', require('./routes/cv-parser')); // CV parsing
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/minimal-upload', minimalUploadRoutes);
app.use('/api/bypass', bypassRoutes);
app.use('/api/video', videoRoutes); // NEW: Video interview questions

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'public')));

// Root route (API specific info or health check could go to /api)
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to 3 Percent Project API' });
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('Backend is running, but the Frontend build was not found. Please check your build configuration.');
  }
});

// Sync database and start server
const startServer = async () => {
  console.log('=== SERVER STARTUP INITIATED ===');
  console.log(`Node Environment: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`Port: ${PORT}`);
  console.log(`Database Host: ${process.env.DB_HOST || 'not set'}`);

  try {
    console.log('Attempting database connection...');
    await db.sequelize.authenticate();
    console.log('✓ Database connection established successfully.');
    await db.sequelize.sync();
    console.log('✓ Database synced.');
  } catch (err) {
    console.error('✗ Unable to connect to the database:', err.message);
    console.error('Stack:', err.stack);
    console.error('The application will start without a database connection. API endpoints requiring DB will fail.');
  }

  try {
    console.log(`Starting server on 0.0.0.0:${PORT}...`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log('==============================================');
      console.log(`✓ SERVER IS RUNNING ON PORT ${PORT}`);
      console.log('==============================================');
    });
  } catch (err) {
    console.error('✗ FATAL: Failed to start server:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
};

console.log('Executing startServer()...');
startServer().catch(err => {
  console.error('✗ FATAL: Unhandled error in startServer:', err);
  process.exit(1);
});
