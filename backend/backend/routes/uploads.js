const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate, validateUploadAttempts } = require('../middleware/validation');
const { uploadPhoto, uploadAudio, uploadVideo } = require('../config/multer');
const uploadsController = require('../controllers/uploads');
const db = require('../models');
const fs = require('fs');
const path = require('path');

// Debug logs to help diagnose the issue
console.log('Loading uploads.js routes file');

const router = express.Router();

// Log all incoming requests to debug routing issues
router.use((req, res, next) => {
  console.log(`[UPLOADS ROUTER] ${req.method} ${req.path} Content-Type: ${req.headers['content-type']}`);
  next();
});

// Audio upload validation rules
const audioValidation = [
  body('duration').isInt({ min: 30, max: 45 }).withMessage('Audio duration must be between 30 and 45 seconds')
];

// Video upload validation rules
const videoValidation = [
  body('duration').isInt({ min: 60, max: 90 }).withMessage('Video duration must be between 60 and 90 seconds')
];

// Get all user uploads
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /api/upload route handler called');
    // Temporary implementation until proper controller method is fixed
    const userId = req.user.id;
    console.log(`Fetching uploads for user ID: ${userId}`);
    
    const uploads = await db.Upload.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${uploads.length} uploads for user ${userId}`);
    res.status(200).json({ uploads });
  } catch (error) {
    console.error('Error in getUserUploads route:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload photo
router.post('/photo', 
  authenticate, 
  validateUploadAttempts(db), 
  uploadPhoto.single('file'), 
  uploadsController.uploadPhoto
);

// Direct photo upload endpoint that bypasses multer completely
// Using express.raw middleware to handle the binary photo data
router.post('/direct-photo', 
  authenticate,
  express.raw({ type: '*/*', limit: '30mb' }), // Add raw middleware to handle binary data
  (req, res) => {
    try {
      // Get user id from authenticated token
      const userId = req.user.id;
      console.log(`[DIRECT-PHOTO] Upload attempt from user ${userId}`);
      console.log(`[DIRECT-PHOTO] Request body type:`, typeof req.body);
      console.log(`[DIRECT-PHOTO] Request body length:`, req.body ? req.body.length : 0);
      
      // Create a unique filename
      const filename = `photo-${Date.now()}-${userId}-${Math.floor(Math.random() * 10000)}.jpg`;
      const filePath = path.join(__dirname, '../uploads/photos', filename);
      const fileUrl = `/uploads/photos/${filename}`;
      
      console.log(`[DIRECT-PHOTO] Created file path: ${filePath}`);
      console.log(`[DIRECT-PHOTO] File URL will be: ${fileUrl}`);
      
      // Ensure directory exists
      const uploadDir = path.join(__dirname, '../uploads/photos');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Respond immediately to avoid timeout
      res.status(201).json({
        message: 'Photo upload successful',
        fileUrl: fileUrl
      });
      
      // Write file after response is sent
      fs.writeFile(filePath, req.body, async (err) => {
        if (err) {
          console.error('[DIRECT-PHOTO] Error writing photo file:', err);
          return;
        }
        
        console.log('[DIRECT-PHOTO] Photo file saved successfully:', filename);
        
        try {
          // Count previous attempts
          const attemptCount = await db.Upload.count({
            where: { userId, type: 'photo' }
          });
          
          // Create upload record
          await db.Upload.create({
            userId,
            type: 'photo',
            filename,
            url: fileUrl,
            attempts: attemptCount + 1,
            completed: true,
            uploadedAt: new Date()
          });
          
          // Update user's onboarding step
          await db.User.update(
            { onboardingStep: 'audio-recording' },
            { where: { id: userId } }
          );
          
          console.log('[DIRECT-PHOTO] Database updated successfully for user', userId);
        } catch (dbError) {
          console.error('[DIRECT-PHOTO] Database error after photo upload:', dbError);
        }
      });
    } catch (error) {
      console.error('[DIRECT-PHOTO] Unexpected error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Upload failed',
          message: error.message
        });
      }
    }
  }
);

// Upload audio
router.post('/audio', 
  authenticate, 
  validateUploadAttempts(db), 
  validate(audioValidation),
  uploadAudio.single('file'), 
  uploadsController.uploadAudio
);

// Direct audio upload endpoint with optimized processing
// Bypasses validation and responds immediately to prevent timeouts
router.post('/direct-audio', 
  authenticate,
  express.raw({ 
    type: ['audio/*'], 
    limit: '10mb' 
  }),
  (req, res) => {
    try {
      const userId = req.user.id;
      const fs = require('fs');
      const path = require('path');
      
      // Create filename with correct extension based on content type
      const contentType = req.get('Content-Type') || 'audio/webm';
      const ext = contentType.includes('mp3') ? '.mp3' : '.webm';
      const filename = `direct-${Date.now()}${ext}`;
      const fileUrl = `/uploads/audio/${filename}`;
      
      // Ensure upload directory exists
      const uploadDir = path.join(__dirname, '../uploads/audio');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Prepare filepath for writing
      const filePath = path.join(uploadDir, filename);
      
      // OPTIMIZED: Respond immediately before any disk or DB operations
      res.status(200).json({
        success: true,
        message: 'Audio received successfully',
        fileUrl: fileUrl
      });
      
      // OPTIMIZED: Use setTimeout to ensure response is sent before heavy operations
      setTimeout(async () => {
        try {
          // Write file asynchronously with minimal blocking
          fs.writeFile(filePath, req.body, async (err) => {
            if (err) {
              console.error('Error writing audio file:', err);
              return;
            }
            
            console.log('Audio file saved successfully:', filename);
            
            try {
              // Record in database with all required fields
              await db.Upload.create({
                userId,
                type: 'audio',
                filename,
                url: fileUrl, // Required field
                path: fileUrl, // For compatibility
                duration: parseInt(req.query.duration || 0),
                completed: true,
                uploadedAt: new Date(),
                attempts: 1 // Add attempts to prevent validation issues
              });
              
              // Update user progress
              await db.User.update(
                { onboardingStep: 'video-recording' },
                { where: { id: userId } }
              );
            } catch (dbErr) {
              console.error('Database error after audio upload:', dbErr);
            }
          });
        } catch (asyncError) {
          console.error('Async audio processing error:', asyncError);
        }
      }, 10); // minimal delay to ensure response is sent
    } catch (error) {
      console.error('Direct audio upload error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  }
);

// Upload video
router.post('/video', 
  authenticate, 
  validateUploadAttempts(db), 
  validate(videoValidation),
  uploadVideo.single('file'), 
  uploadsController.uploadVideo
);

// Direct video upload endpoint with optimized processing for large files
// Uses express.raw middleware with higher size limit to prevent 502 errors
router.post('/direct-video', 
  authenticate,
  express.raw({ 
    type: ['video/*', 'application/octet-stream'], 
    limit: '50mb' // Increased size limit for videos
  }),
  (req, res) => {
  try {
    // Get user id from authenticated token
    const userId = req.user.id;
    console.log(`[DIRECT-VIDEO] Upload attempt from user ${userId}, body size: ${req.body.length} bytes`);
    
    // Extract duration from header (frontend sends as X-Video-Duration)
    const duration = req.headers['x-video-duration'] || req.query.duration;
    console.log(`[DIRECT-VIDEO] Video duration from header: ${duration} seconds`);
    
    // Basic validation
    if (!duration || isNaN(parseInt(duration))) {
      return res.status(400).json({
        error: 'Missing duration parameter'
      });
    }
    
    // Ensure upload directory exists
    const uploadDir = path.join(__dirname, '../uploads/video');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create a unique filename with timestamp
    const filename = `video-${Date.now()}-${userId}.webm`;
    const filePath = path.join(uploadDir, filename);
    const fileUrl = `/uploads/video/${filename}`;
    
    // IMPORTANT: Respond immediately with 201 to prevent timeout
    res.status(201).json({
      success: true,
      message: 'Video received successfully',
      fileUrl: fileUrl
    });
    
    // ASYNC: Process the file after response is sent
    setTimeout(async () => {
      try {
        // Write video file to disk
        fs.writeFile(filePath, req.body, async (err) => {
          if (err) {
            console.error('[DIRECT-VIDEO] Error writing video file:', err);
            return;
          }
          
          console.log('[DIRECT-VIDEO] Video file saved successfully:', filename);
          
          try {
            // Count previous attempts
            const attemptCount = await db.Upload.count({
              where: { userId, type: 'video' }
            });
            
            // Record in database with all required fields
            await db.Upload.create({
              userId,
              type: 'video',
              filename,
              url: fileUrl, // Required field that caused validation errors
              path: fileUrl, // Keep path for compatibility
              duration: parseInt(duration),
              attempts: attemptCount + 1,
              completed: true,
              uploadedAt: new Date()
            });
            
            // Update user's onboarding step
            await db.User.update(
              { onboardingStep: 'questionnaire' },
              { where: { id: userId } }
            );
            
            console.log('[DIRECT-VIDEO] Database updated successfully for user', userId);
          } catch (dbError) {
            console.error('[DIRECT-VIDEO] Database error after video upload:', dbError);
          }
        });
      } catch (asyncError) {
        console.error('[DIRECT-VIDEO] Async processing error:', asyncError);
      }
    }, 10); // minimal delay to ensure response is sent
  } catch (error) {
    console.error('[DIRECT-VIDEO] Unexpected error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Upload failed',
        message: error.message
      });
    }
  }
});

module.exports = router;
