const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate, isAdmin } = require('../middleware/auth');

// Combined middleware for admin routes (authenticate + isAdmin)
const authenticateAdmin = [authenticate, isAdmin];

const router = express.Router();
const adminController = require('../controllers/admin');

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Admin authentication routes (NO authentication required)
/**
 * @route POST /api/admin/login
 * @desc Admin login
 * @access Public
 */
router.post('/login', validate(loginValidation), (req, res) => {
  if (typeof adminController.adminLogin === 'function') {
    adminController.adminLogin(req, res);
  } else {
    res.status(500).json({ error: 'Admin login function not available' });
  }
});

/**
 * @route GET /api/admin/candidates
 * @desc Get all candidates with pagination and filtering
 * @access Admin only
 */
router.get('/candidates', authenticateAdmin, (req, res) => {
  if (typeof adminController.getAllCandidates === 'function') {
    adminController.getAllCandidates(req, res);
  } else {
    res.status(500).json({ error: 'Get all candidates function not available' });
  }
});

/**
 * @route GET /api/admin/candidates/:id
 * @desc Get a specific candidate by ID
 * @access Admin only
 */
router.get('/candidates/:id', authenticateAdmin, (req, res) => {
  if (typeof adminController.getCandidateById === 'function') {
    adminController.getCandidateById(req, res);
  } else {
    res.status(500).json({ error: 'Get candidate by ID function not available' });
  }
});

/**
 * @route GET /api/admin/dashboard/stats
 * @desc Get dashboard statistics
 * @access Admin only
 */
router.get('/dashboard/stats', authenticateAdmin, (req, res) => {
  if (typeof adminController.getDashboardStats === 'function') {
    adminController.getDashboardStats(req, res);
  } else {
    res.status(500).json({ error: 'Get dashboard stats function not available' });
  }
});

// Bulk Actions
router.post('/candidates/bulk-approve', authenticateAdmin, (req, res) => {
  if (typeof adminController.bulkApproveCandidates === 'function') {
    adminController.bulkApproveCandidates(req, res);
  } else {
    res.status(500).json({ error: 'Bulk approve candidates function not available' });
  }
});

router.post('/uploads/bulk-approve', authenticateAdmin, (req, res) => {
  if (typeof adminController.bulkApproveUploads === 'function') {
    adminController.bulkApproveUploads(req, res);
  } else {
    res.status(500).json({ error: 'Bulk approve uploads function not available' });
  }
});

// Candidate Actions
router.put('/candidates/:id/approve', authenticateAdmin, (req, res) => {
  if (typeof adminController.approveCandidate === 'function') {
    adminController.approveCandidate(req, res);
  } else {
    res.status(500).json({ error: 'Approve candidate function not available' });
  }
});

router.put('/candidates/:id/reject', authenticateAdmin, (req, res) => {
  if (typeof adminController.rejectCandidate === 'function') {
    adminController.rejectCandidate(req, res);
  } else {
    res.status(500).json({ error: 'Reject candidate function not available' });
  }
});

// Upload Actions (Photos, Audio, Video)
router.put('/uploads/:id/approve', authenticateAdmin, (req, res) => {
  if (typeof adminController.approveUpload === 'function') {
    adminController.approveUpload(req, res);
  } else {
    res.status(500).json({ error: 'Approve upload function not available' });
  }
});

router.put('/uploads/:id/reject', authenticateAdmin, (req, res) => {
  if (typeof adminController.rejectUpload === 'function') {
    adminController.rejectUpload(req, res);
  } else {
    res.status(500).json({ error: 'Reject upload function not available' });
  }
});

// Questionnaire Actions
router.put('/questionnaires/:id/approve', authenticateAdmin, (req, res) => {
  if (typeof adminController.approveQuestionnaire === 'function') {
    adminController.approveQuestionnaire(req, res);
  } else {
    res.status(500).json({ error: 'Approve questionnaire function not available' });
  }
});

router.put('/questionnaires/:id/reject', authenticateAdmin, (req, res) => {
  if (typeof adminController.rejectQuestionnaire === 'function') {
    adminController.rejectQuestionnaire(req, res);
  } else {
    res.status(500).json({ error: 'Reject questionnaire function not available' });
  }
});

module.exports = router;

/**
 * @route GET /api/admin/questionnaires
 * @desc Get all questionnaires
 * @access Admin only
 */
router.get('/questionnaires', authenticateAdmin, (req, res) => {
  if (typeof adminController.getAllQuestionnaires === 'function') {
    adminController.getAllQuestionnaires(req, res);
  } else {
    res.status(500).json({ error: 'Get all questionnaires function not available' });
  }
});

/**
 * @route GET /api/admin/videos
 * @desc Get all video recordings
 * @access Admin only
 */
router.get('/videos', authenticateAdmin, (req, res) => {
  if (typeof adminController.getAllVideos === 'function') {
    adminController.getAllVideos(req, res);
  } else {
    res.status(500).json({ error: 'Get all videos function not available' });
  }
});

/**
 * @route GET /api/admin/photos
 * @desc Get all photo uploads
 * @access Admin only
 */
router.get('/photos', authenticateAdmin, (req, res) => {
  if (typeof adminController.getAllPhotos === 'function') {
    adminController.getAllPhotos(req, res);
  } else {
    res.status(500).json({ error: 'Get all photos function not available' });
  }
});

/**
 * @route GET /api/admin/audio
 * @desc Get all audio recordings
 * @access Admin only
 */
router.get('/audio', authenticateAdmin, (req, res) => {
  if (typeof adminController.getAllAudioRecordings === 'function') {
    adminController.getAllAudioRecordings(req, res);
  } else {
    res.status(500).json({ error: 'Get all audio recordings function not available' });
  }
});
