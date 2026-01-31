/**
 * Security middleware configuration
 * Production-ready version with Helmet and CORS
 */
const cors = require('cors');
const helmet = require('helmet');

// Debug log
console.log('Loading PRODUCTION security configuration');

/**
 * Configure security middleware
 * @param {Express} app - Express app instance
 */
const configureSecurity = (app) => {
  console.log('[Security] Enabling Helmet and Restricted CORS');

  // 1. Enable Helmet for secure HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for some dev tools/maps if used
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000"], // Allow images from backend
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5173", "ws://localhost:5174"], // Allow websocket for vite HMR
        mediaSrc: ["'self'", "blob:", "http://localhost:5000"],
        frameSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resources to be loaded by other origins (needed for images/videos)
  }));

  // 2. Configure CORS
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174', // Vite alternate port
      'http://localhost:3000'  // Typical React port
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
};

module.exports = configureSecurity;
