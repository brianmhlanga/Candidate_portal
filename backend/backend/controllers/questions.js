/**
 * IQ Assessment Feature Removed
 * 
 * This controller previously contained logic for the IQ assessment feature
 * which has been completely removed from the application.
 * 
 * These placeholders are kept for API compatibility.
 */

/**
 * Placeholder for the removed getQuestions endpoint
 * @route GET /api/questions
 */
const placeholderHandler = (req, res) => {
  console.log('IQ Assessment feature has been removed');
  res.status(200).json({
    success: true,
    message: 'IQ Assessment feature has been removed from this application.'
  });
};

// Export the placeholder function for all routes
module.exports = {
  getQuestions: placeholderHandler,
  submitAssessment: placeholderHandler
};
