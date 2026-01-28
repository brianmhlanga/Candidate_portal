const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const authController = require('../controllers/auth');

// Debug log to help diagnose issues
console.log('--- DEBUG: Imported authController in routes/auth.js:');
console.log(authController);
console.log('--- END DEBUG ---');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address')
];

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validate(registerValidation), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post('/login', validate(loginValidation), authController.login);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route PUT /api/auth/onboarding-step
 * @desc Update user's current onboarding step
 * @access Private
 */
router.put('/onboarding-step', authenticate, authController.updateOnboardingStep);

/**
 * @route GET /api/auth/onboarding-data/:userId
 * @desc Get user's onboarding data
 * @access Private
 */
router.get('/onboarding-data/:userId', authenticate, authController.getUserOnboardingData);

/**
 * @route PUT /api/auth/professional-summary
 * @desc Update user's professional summary
 * @access Private
 */
router.put('/professional-summary', authenticate, 
  validate([body('professionalSummary').isString().notEmpty().withMessage('Professional summary is required')]),
  authController.updateProfessionalSummary
);

/**
 * @route PUT /api/auth/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', authenticate, validate(updateProfileValidation), authController.updateProfile);

/**
 * @route PUT /api/auth/user/:userId/onboarding-data
 * @desc Update user onboarding data
 * @access Private
 */
router.put('/user/:userId/onboarding-data', authenticate, authController.updateUserOnboardingData);

module.exports = router;
