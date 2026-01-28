const path = require('path');
const fs = require('fs');
const { Upload, User } = require('../models');

/**
 * Handle photo upload
 * @route POST /api/upload/photo
 */
const uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a photo to upload'
      });
    }

    // Get file URL
    const fileUrl = `/uploads/photos/${file.filename}`;

    // Count previous attempts
    const attemptCount = await Upload.count({
      where: { userId, type: 'photo' }
    });

    // Create upload record
    const upload = await Upload.create({
      userId,
      type: 'photo',
      url: fileUrl,
      attempts: attemptCount + 1
    });

    // Update user's onboarding step
    await User.update(
      { onboardingStep: 'audio-recording' },
      { where: { id: userId } }
    );

    res.status(201).json({
      message: 'Photo uploaded successfully',
      upload,
      fileUrl
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    // Delete file if upload failed
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: 'Failed to upload photo',
      message: 'An error occurred while uploading photo'
    });
  }
};

/**
 * Handle audio upload
 * @route POST /api/upload/audio
 */
const uploadAudio = async (req, res) => {
  try {
    console.log('Audio upload request received');
    
    // Check for file
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select an audio file to upload'
      });
    }

    // Basic validation
    const file = req.file;
    const userId = req.user.id;
    const duration = parseInt(req.body.duration || '0');

    // IMPORTANT: Send response IMMEDIATELY - don't do any processing
    // This is critical to avoid 502 errors from the Apache proxy
    const fileUrl = `/uploads/audio/${file.filename}`;
    
    // Respond as fast as possible
    res.status(201).json({
      message: 'Audio received successfully',
      fileUrl
    });

    // Use setTimeout to ensure response is sent before any further processing
    setTimeout(async () => {
      try {
        // Create minimal upload record
        const upload = await Upload.create({
          userId,
          type: 'audio',
          url: fileUrl,
          duration: duration || 30
        });
        
        console.log('Upload record created:', upload.id);

        // Update user step
        await User.update(
          { onboardingStep: 'video-recording' },
          { where: { id: userId } }
        );
        
        console.log('User step updated successfully');
      } catch (dbError) {
        // Log DB errors but don't affect response
        console.error('Database operation failed after response sent:', dbError);
      }
    }, 100); // Small delay to ensure response is sent first
  } catch (error) {
    // Error handling
    console.error('Audio upload error:', error);
    
    // Try to delete the file
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }
    
    res.status(500).json({
      error: 'Failed to process audio',
      message: 'An error occurred while processing your audio'
    });
  }
};

/**
 * Handle video upload
 * @route POST /api/upload/video
 */
const uploadVideo = async (req, res) => {
  try {
    console.log('Video upload request received');
    
    // Check for file first
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a video file to upload'
      });
    }

    const userId = req.user.id;
    const file = req.file;
    const { duration } = req.body;

    // Basic duration validation
    const videoDuration = parseInt(duration);
    if (isNaN(videoDuration) || videoDuration < 60 || videoDuration > 90) {
      // Delete file if duration is invalid
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Invalid duration',
        message: 'Video duration must be between 60 and 90 seconds'
      });
    }

    // IMPORTANT: Get the file URL and send response IMMEDIATELY
    // This is critical to avoid 502 errors from the Apache proxy
    const fileUrl = `/uploads/video/${file.filename}`;
    
    // Respond as fast as possible with the URL
    res.status(201).json({
      message: 'Video received successfully',
      fileUrl
    });

    // Use setTimeout to ensure response is sent before any further processing
    setTimeout(async () => {
      try {
        // Count previous attempts
        const attemptCount = await Upload.count({
          where: { userId, type: 'video' }
        });

        // Create upload record
        const upload = await Upload.create({
          userId,
          type: 'video',
          url: fileUrl,
          duration: videoDuration,
          attempts: attemptCount + 1
        });

        // Update user's onboarding step
        await User.update(
          { onboardingStep: 'questionnaire' },
          { where: { id: userId } }
        );
        
        console.log('Video upload completed, database updated');
      } catch (dbError) {
        // Log DB errors but don't affect response
        console.error('Database operation failed after response sent:', dbError);
      }
    }, 100); // Small delay to ensure response is sent first
  } catch (error) {
    console.error('Video upload error:', error);
    // Delete file if upload failed
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: 'Failed to upload video',
      message: 'An error occurred while uploading video'
    });
  }
};

/**
 * Get user uploads
 * @route GET /api/upload
 */
const getUserUploads = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user uploads
    const uploads = await Upload.findAll({
      where: { userId },
      order: [['uploadedAt', 'DESC']]
    });

    res.status(200).json({
      uploads
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({
      error: 'Failed to retrieve uploads',
      message: 'An error occurred while retrieving uploads'
    });
  }
};

module.exports = {
  uploadPhoto,
  uploadAudio,
  uploadVideo,
  getUserUploads
};
