const express = require('express');
const authenticate = require('../middleware/auth');

const router = express.Router();

// IQ Assessment has been removed, this is just a placeholder route
const placeholderHandler = (req, res) => {
  console.log('IQ Assessment has been removed');
  res.status(200).json({
    success: true,
    message: 'IQ Assessment feature has been removed from this application.'
  });
};

// Return success for all routes
router.get('/', placeholderHandler);
router.post('/submit', placeholderHandler);
router.get('/test', placeholderHandler);

console.log('Exporting placeholder questions router (IQ Assessment removed)');
module.exports = router;
