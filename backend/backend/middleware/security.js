/**
 * Security middleware configuration
 * EMERGENCY VERSION - COMPLETELY DISABLES SECURITY
 * Version: 2025-07-13
 */
const cors = require('cors');
const helmet = require('helmet');

// Debug log
console.log('Loading EMERGENCY security configuration - ALL SECURITY DISABLED');

/**
 * Configure security middleware
 * @param {Express} app - Express app instance
 */
const configureSecurity = (app) => {
  console.log('[Security] EMERGENCY MODE: ALL SECURITY DISABLED');
  
  // COMPLETELY SKIP HELMET - don't use any security at all
  // This is the nuclear option to fix any CSP issues
  
  // Configure CORS to allow all origins - completely permissive
  app.use(cors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    exposedHeaders: '*',
    credentials: true
  }));

  // Add EMERGENCY MODE headers - no security restrictions whatsoever
  app.use((req, res, next) => {
    // Allow ALL cross-origin requests
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    
    // COMPLETELY DISABLE CSP - allow everything
    res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';");
    
    // Explicitly remove any other security headers
    res.removeHeader('X-Content-Security-Policy');
    res.removeHeader('X-WebKit-CSP');
    res.removeHeader('X-Frame-Options');
    res.removeHeader('X-XSS-Protection');
    res.removeHeader('X-Content-Type-Options');
    res.removeHeader('Strict-Transport-Security');
    
    next();
  });
};

module.exports = configureSecurity;
