/**
 * Placeholder Onboarding Controller
 * 
 * This is a temporary controller to prevent server crashes
 * while fixing the application structure.
 */

// Debug log to help diagnose issues
console.log('Loading onboarding controller placeholder');

/**
 * Get all onboarding steps
 */
const getOnboardingSteps = async (req, res) => {
  try {
    // Return placeholder data
    return res.status(200).json({
      success: true,
      data: [
        { id: 1, title: 'Personal Information', key: 'personal-info', completed: false },
        { id: 2, title: 'Professional Summary', key: 'prof-summary', completed: false },
        { id: 3, title: 'Upload Documents', key: 'documents', completed: false },
        { id: 4, title: 'Questionnaire', key: 'questionnaire', completed: false }
      ]
    });
  } catch (error) {
    console.error('Error in getOnboardingSteps:', error);
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch onboarding steps' });
  }
};

/**
 * Get current onboarding step for user
 */
const getCurrentStep = async (req, res) => {
  try {
    // Return placeholder data based on user ID
    const userId = req.user.id;
    
    return res.status(200).json({
      success: true,
      data: {
        currentStep: 1,
        completed: false,
        nextStep: 2
      }
    });
  } catch (error) {
    console.error('Error in getCurrentStep:', error);
    return res.status(500).json({ error: 'Server error', message: 'Failed to fetch current onboarding step' });
  }
};

/**
 * Complete current step and move to next
 */
const completeStep = async (req, res) => {
  try {
    const { stepId } = req.body;
    const userId = req.user.id;
    
    // Placeholder response
    return res.status(200).json({
      success: true,
      message: `Step ${stepId || 'unknown'} marked as completed`,
      data: {
        completedStep: stepId || 1,
        nextStep: (stepId || 1) + 1
      }
    });
  } catch (error) {
    console.error('Error in completeStep:', error);
    return res.status(500).json({ error: 'Server error', message: 'Failed to complete onboarding step' });
  }
};

module.exports = {
  getOnboardingSteps,
  getCurrentStep,
  completeStep
};
