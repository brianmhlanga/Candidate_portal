/**
 * Minimal audio upload controller
 * Fallback version with minimal dependencies
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Fallback for audio uploads that doesn't use external dependencies
const { Upload, User } = require('../models');

// Create upload directory if it doesn't exist
const audioUploadDir = path.join(__dirname, '../uploads/audio');
if (!fs.existsSync(audioUploadDir)) {
  try {
    fs.mkdirSync(audioUploadDir, { recursive: true });
    console.log('Audio upload directory created');
  } catch (err) {
    console.error('Failed to create audio upload directory:', err);
    // Continue execution - don't block server startup
  }
}

// Configure minimal storage - no validation, just save the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/audio');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `audio-${uuidv4()}.wav`;
    cb(null, uniqueName);
  }
});

// Create basic upload middleware with minimal processing
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB after compression
}).single('file');

/**
 * Minimal audio upload handler
 * Very simple implementation to reduce chance of 502 errors
 */
const minimalAudioUpload = (req, res) => {
  // Use the upload middleware directly in the controller
  upload(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'Upload error', message: err.message });
      }

      // Check for file
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Basic file information
      const file = req.file;
      const userId = req.user.id;
      const fileUrl = `/uploads/audio/${file.filename}`;

      // Respond immediately to prevent timeout
      res.status(200).json({
        message: 'Audio received',
        fileUrl
      });

      // Process database operations after response
      try {
        // Create record
        const upload = await Upload.create({
          userId,
          type: 'audio',
          url: fileUrl,
          duration: req.body.duration || 30
        });

        // Update user step
        await User.update(
          { onboardingStep: 'video-recording' },
          { where: { id: userId } }
        );

        console.log('Audio upload processed successfully:', file.filename);
      } catch (dbErr) {
        console.error('Failed to record upload in database:', dbErr);
      }
    } catch (error) {
      // Only send error response if one hasn't been sent yet
      if (!res.headersSent) {
        console.error('Audio upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
      }
    }
  });
};

module.exports = {
  minimalAudioUpload
};
