const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Login failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      onboardingStep: user.onboardingStep,
      onboardingCompleted: user.onboardingCompleted
    };

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

/**
 * Get current user information
 * @route GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the authenticate middleware
    const user = req.user;

    // Get user data without problematic associations
    const userData = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!userData) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found'
      });
    }

    res.status(200).json({
      user: userData
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user data',
      message: 'An error occurred while retrieving user data'
    });
  }
};

/**
 * Update user onboarding step
 * @route PUT /api/auth/onboarding-step
 */
const updateOnboardingStep = async (req, res) => {
  try {
    const { onboardingStep, completed } = req.body;
    const userId = req.user.id;

    // Validate onboarding step
    const validSteps = ['welcome', 'photo-upload', 'audio-recording', 'video-recording', 'questionnaire', 'completion'];
    if (onboardingStep && !validSteps.includes(onboardingStep)) {
      return res.status(400).json({
        error: 'Invalid onboarding step',
        message: `Onboarding step must be one of: ${validSteps.join(', ')}`
      });
    }

    // Update user
    const updateData = {};
    if (onboardingStep) updateData.onboardingStep = onboardingStep;
    if (completed !== undefined) {
      updateData.onboardingCompleted = completed;
      if (completed) updateData.onboardingCompletedAt = new Date();
    }

    await User.update(updateData, {
      where: { id: userId }
    });

    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      message: 'Onboarding step updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    res.status(500).json({
      error: 'Failed to update onboarding step',
      message: 'An error occurred while updating onboarding step'
    });
  }
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'user' // Include role in token payload
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};




/**
 * Get user onboarding data including professional summary and AI questions
 * @route GET /api/auth/onboarding-data/:userId
 */
const getUserOnboardingData = async (req, res) => {
  try {
    // Get authenticated user ID - ignore URL parameter completely
    const userId = req.user.id;
    
    console.log('Getting onboarding data for authenticated user:', userId);
    
    // Find the user data
    const userData = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'firstName', 'lastName', 'email', 'professionalSummary', 'aiGeneratedQuestions']
    });
    
    if (!userData) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The authenticated user could not be found in the database'
      });
    }
    
    // Parse the AI generated questions if they exist
    let aiGeneratedQuestions = [];
    if (userData.aiGeneratedQuestions) {
      try {
        // Check if it's already an array or needs parsing
        if (Array.isArray(userData.aiGeneratedQuestions)) {
          aiGeneratedQuestions = userData.aiGeneratedQuestions;
        } else {
          aiGeneratedQuestions = JSON.parse(userData.aiGeneratedQuestions);
        }
      } catch (e) {
        console.error('Error parsing AI questions:', e);
        // Provide fallback questions if parsing fails
        aiGeneratedQuestions = [
          "Based on your professional background, what unique skill do you bring to the table?",
          "Describe a challenging situation you've faced and how you overcame it.",
          "How do you see yourself contributing to our team's success?",
          "What motivated you to pursue this career path?",
          "Where do you see yourself professionally in the next 3-5 years?"
        ];
      }
    }
    
    // Get user uploads
    const uploads = await userData.getUploads();
    const photoUpload = uploads.find(upload => upload.type === 'photo');
    const audioUpload = uploads.find(upload => upload.type === 'audio');
    const videoUpload = uploads.find(upload => upload.type === 'video');
    
    // Return user data with simplified structure
    res.json({
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      photoUrl: photoUpload ? photoUpload.url : null,
      audioPresentationUrl: audioUpload ? audioUpload.url : null,
      videoPresentationUrl: videoUpload ? videoUpload.url : null,
      professionalSummary: userData.professionalSummary || '',
      aiGeneratedQuestions
    });
  } catch (error) {
    console.error('Error fetching user onboarding data:', error);
    res.status(500).json({ error: 'Failed to fetch user onboarding data' });
  }
};

/**
 * Update user's professional summary
 * @route PUT /api/auth/professional-summary
 */
const updateProfessionalSummary = async (req, res) => {
  try {
    const { professionalSummary } = req.body;
    const userId = req.user.id;
    
    if (!professionalSummary || professionalSummary.trim() === '') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Professional summary is required'
      });
    }
    
    // Generate questions based on the summary
    // In a real implementation, this would call an AI service
    const questions = [
      `Based on your experience in "${professionalSummary.slice(0, 30).trim()}...", what unique skill sets you apart from other candidates?`,
      `Can you describe a challenging situation related to your background and how you overcame it?`,
      `How do you see your expertise contributing to our company's growth and innovation?`,
      `What motivated you to pursue a career in this field?`,
      `Where do you see yourself professionally in the next 3-5 years?`
    ];
    
    // Update user with summary and questions
    await User.update(
      {
        professionalSummary,
        aiGeneratedQuestions: JSON.stringify(questions)
      },
      { where: { id: userId } }
    );
    
    res.status(200).json({
      message: 'Professional summary updated successfully',
      questions,
      summary: professionalSummary
    });
  } catch (error) {
    console.error('Update professional summary error:', error);
    res.status(500).json({
      error: 'Failed to update professional summary',
      message: 'An error occurred while updating professional summary'
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, email } = req.body;
    
    // Build update object with only provided fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    
    // Update user
    await User.update(
      updateData,
      { where: { id: userId } }
    );
    
    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'An error occurred while updating profile'
    });
  }
};

/**
 * Update user onboarding data with video URL and other information
 * @route PUT /api/auth/user/:userId/onboarding-data
 */
const updateUserOnboardingData = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    
    // Security check - users can only update their own data unless they are admins
    if (userId !== requestingUserId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only update your own onboarding data'
      });
    }
    
    console.log(`Updating onboarding data for user ${userId}:`, req.body);
    
    // Build update object from the request body
    const updateData = {};
    
    // Handle possible fields that might be sent
    if (req.body.videoPresentationUrl) {
      updateData.videoPresentationUrl = req.body.videoPresentationUrl;
    }
    if (req.body.videoRecordingAttempts) {
      updateData.videoRecordingAttempts = req.body.videoRecordingAttempts;
    }
    if (req.body.professionalSummary) {
      updateData.professionalSummary = req.body.professionalSummary;
    }
    
    // Update the user in the database
    await User.update(
      updateData,
      { where: { id: userId } }
    );
    
    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).json({
      success: true,
      message: 'Onboarding data updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update onboarding data error:', error);
    res.status(500).json({
      error: 'Failed to update onboarding data',
      message: 'An error occurred while updating onboarding data'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateOnboardingStep,
  getUserOnboardingData,
  updateProfessionalSummary,
  updateProfile,
  updateUserOnboardingData
};
