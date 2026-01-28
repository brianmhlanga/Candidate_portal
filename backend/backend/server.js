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

// Database setup
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/questionnaire', questionnaireRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/minimal-upload', minimalUploadRoutes);
app.use('/api/bypass', bypassRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to 3 Percent Project API' });
});

// Sync database and start server
db.sequelize.sync().then(() => {
  console.log('Database connected and synced');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err.message);
  // Optional: Start server anyway if you want it to handle requests even without DB
  // app.listen(PORT, () => console.log(`Server running on port ${PORT} (DB disconnected)`));
});
