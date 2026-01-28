/**
 * Minimal upload routes - specialized for handling problematic audio uploads
 */
const express = require('express');
const router = express.Router();
const { minimalAudioUpload } = require('../controllers/minimal-upload');
const { authenticate: verifyToken } = require('../middleware/auth');

// Dedicated route for audio uploads with minimal processing
router.post('/audio', verifyToken, minimalAudioUpload);

module.exports = router;
