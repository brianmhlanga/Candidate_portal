const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { User } = require('../models');

const router = express.Router();

// Get user's onboarding data
router.get('/data', authenticate, async (req, res) => {
  try {
    console.log('[ONBOARDING] Getting onboarding data for user:', req.user.id);
    
    // Find user with their onboarding data
    // Get all user attributes since we don't know exact column names
    const user = await User.findOne({
      where: {
        id: req.user.id
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Look for uploads in the database
    let uploads = [];
    try {
      // Note: This is a placeholder, replace with actual uploads query if needed
      // using the actual table and column names in your database
      const [uploadResults] = await User.sequelize.query(
        "SELECT * FROM uploads WHERE user_id = :userId",
        { 
          replacements: { userId: req.user.id },
          type: User.sequelize.QueryTypes.SELECT 
        }
      );
      
      if (uploadResults && Array.isArray(uploadResults)) {
        uploads = uploadResults;
      }
    } catch (uploadsError) {
      console.log('[ONBOARDING] No uploads table or error fetching uploads:', uploadsError.message);
      // Continue without uploads data
    }
    
    console.log('[ONBOARDING] User data found:', user.id);
    
    // Log the actual user object to see available fields
    console.log('[ONBOARDING] User object fields:', Object.keys(user.dataValues));
    
    // Format the response with flexible field names
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || user.first_name,
      lastName: user.lastName || user.last_name,
      // Use all possible field name variations for photo URL
      photoUrl: user.photoUrl || user.photo_url || user.profileImage || user.photoPath,
      // Use all possible field name variations for audio URL
      audioRecordingUrl: user.audioRecordingUrl || user.audioUrl || user.audio_url,
      // Use all possible field name variations for video URL
      videoPresentationUrl: user.videoPresentationUrl || user.videoUrl || user.video_url,
      // Use all possible field name variations for professional summary
      professionalSummary: user.professionalSummary || user.professional_summary,
      // Parse AI generated questions if they exist
      aiGeneratedQuestions: (() => {
        // Try different field names and formats for AI questions
        const questionsField = user.aiGeneratedQuestions || user.ai_generated_questions;
        
        if (!questionsField) {
          return [];
        }
        
        if (typeof questionsField === 'string') {
          try {
            return JSON.parse(questionsField);
          } catch (e) {
            console.error('[ONBOARDING] Failed to parse AI questions JSON:', e);
            return [];
          }
        }
        
        return questionsField;
      })(),
      // Use all possible field name variations for onboarding step
      currentOnboardingStep: user.currentOnboardingStep || user.onboardingStep || user.onboarding_step,
      onboardingCompleted: user.onboardingCompleted || user.onboarding_completed,
      // Add a structured uploads array to make it easier for frontend
      uploads: [
        // Add photo upload if it exists
        ...(user.photoUrl || user.photo_url || user.profileImage || user.photoPath ? [{
          type: 'photo',
          url: user.photoUrl || user.photo_url || user.profileImage || user.photoPath,
          status: 'completed'
        }] : []),
        // Add audio upload if it exists
        ...(user.audioRecordingUrl || user.audioUrl || user.audio_url ? [{
          type: 'audio',
          url: user.audioRecordingUrl || user.audioUrl || user.audio_url,
          status: 'completed'
        }] : []),
        // Add video upload if it exists
        ...(user.videoPresentationUrl || user.videoUrl || user.video_url ? [{
          type: 'video',
          url: user.videoPresentationUrl || user.videoUrl || user.video_url,
          status: 'completed'
        }] : [])
      ],
      // Add any uploads found from the uploads table
      ...uploads && uploads.length > 0 ? { additionalUploads: uploads } : {}
    };
    
    // Log available fields for debugging
    console.log('[ONBOARDING] Available user fields:', Object.keys(user.toJSON()));
    
    return res.status(200).json(userData);
  } catch (error) {
    console.error('[ONBOARDING] Error getting onboarding data:', error);
    return res.status(500).json({ error: 'Failed to retrieve onboarding data' });
  }
});

// Update professional summary and AI questions
router.post('/summary-questions', authenticate, validate([
  body('professionalSummary').isString().notEmpty().withMessage('Professional summary is required')
]), async (req, res) => {
  try {
    const { professionalSummary, aiGeneratedQuestions } = req.body;
    console.log(`[ONBOARDING] Updating summary for user ${req.user.id}`);
    
    // Convert aiGeneratedQuestions to JSON string since the database expects a string, not an array
    const questionsString = Array.isArray(aiGeneratedQuestions) 
      ? JSON.stringify(aiGeneratedQuestions) 
      : JSON.stringify([]);
    
    // Update the user's professional summary and questions
    await User.update(
      { 
        professionalSummary,
        aiGeneratedQuestions: questionsString
      },
      { 
        where: { id: req.user.id } 
      }
    );
    
    return res.status(200).json({ 
      success: true,
      message: 'Professional summary updated successfully'
    });
  } catch (error) {
    console.error('[ONBOARDING] Error updating professional summary:', error);
    return res.status(500).json({ error: 'Failed to update professional summary' });
  }
});

// Update user onboarding data (used for updating video URLs and other data)
router.put('/user-data', authenticate, async (req, res) => {
  try {
    // Get update data from request body
    const { videoPresentationUrl, videoRecordingAttempts } = req.body;
    
    console.log('[ONBOARDING] Updating user data for user:', req.user.id);
    
    // Find the user to update
    const user = await User.findOne({
      where: { id: req.user.id }
    });
    
    if (!user) {
      console.error('[ONBOARDING] User not found for update');
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create update object with only the provided fields
    const updateData = {};
    
    // Only add fields that are actually provided
    if (videoPresentationUrl) {
      updateData.videoUrl = videoPresentationUrl; // Use database field name
    }
    
    if (videoRecordingAttempts) {
      updateData.videoAttempts = videoRecordingAttempts; // Use database field name
    }
    
    // Add any other fields that might be in the request
    // This allows for flexible updates without hardcoding every possible field
    const otherFields = ['photoUrl', 'audioRecordingUrl', 'currentStep', 'completed'];
    otherFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Map frontend field names to database field names if needed
        const dbField = field === 'photoUrl' ? 'photoPath' : 
                      field === 'audioRecordingUrl' ? 'audioUrl' :
                      field === 'currentStep' ? 'onboardingStep' : field;
        
        updateData[dbField] = req.body[field];
      }
    });
    
    console.log('[ONBOARDING] Update data:', updateData);
    
    // Perform the update
    await User.update(updateData, { 
      where: { id: req.user.id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'User data updated successfully'
    });
  } catch (error) {
    console.error('[ONBOARDING] Error updating user data:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to update user data'
    });
  }
});

module.exports = router;
