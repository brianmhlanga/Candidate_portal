const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data
 * Takes validation rules as arguments and returns a middleware function
 * @param {Array} validations - Array of express-validator validation rules
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    return next();
  };
};

/**
 * Middleware to validate upload attempts
 * Checks if user has exceeded the maximum number of allowed upload attempts
 * @param {Object} models - Sequelize models
 */
const validateUploadAttempts = (models) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const uploadType = req.path.split('/').pop();
      const maxAttempts = process.env.MAX_UPLOAD_ATTEMPTS || 5;

      // Count existing uploads of this type
      const uploadCount = await models.Upload.count({
        where: {
          userId,
          type: uploadType
        }
      });

      if (uploadCount >= maxAttempts) {
        return res.status(403).json({
          error: 'Maximum upload attempts exceeded',
          message: `You have reached the maximum number of ${uploadType} upload attempts (${maxAttempts})`
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  validate,
  validateUploadAttempts
};
