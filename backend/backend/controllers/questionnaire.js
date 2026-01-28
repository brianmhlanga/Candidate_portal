const { Questionnaire, User } = require('../models');

/**
 * Submit questionnaire
 * @route POST /api/questionnaire
 */
const submitQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      personalInfo,
      contactInfo,
      workExperience,
      references,
      additionalInfo,
      consents
    } = req.body;

    // Validate required fields
    if (!personalInfo || !contactInfo || !workExperience || !references || !consents) {
      return res.status(400).json({
        error: 'Incomplete questionnaire',
        message: 'Please complete all required sections of the questionnaire'
      });
    }

    // Check if user has already submitted a questionnaire
    const existingQuestionnaire = await Questionnaire.findOne({
      where: { userId }
    });

    let questionnaire;
    
    if (existingQuestionnaire) {
      // Update existing questionnaire
      questionnaire = await existingQuestionnaire.update({
        personalInfo,
        contactInfo,
        workExperience,
        references,
        additionalInfo,
        consents,
        submittedAt: new Date()
      });
    } else {
      // Create new questionnaire
      questionnaire = await Questionnaire.create({
        userId,
        personalInfo,
        contactInfo,
        workExperience,
        references,
        additionalInfo,
        consents,
        submittedAt: new Date()
      });
    }

    // Mark onboarding as completed
    await User.update(
      {
        onboardingStep: 'completion',
        onboardingCompleted: true,
        onboardingCompletedAt: new Date()
      },
      { where: { id: userId } }
    );

    res.status(200).json({
      message: 'Questionnaire submitted successfully',
      questionnaire: {
        id: questionnaire.id,
        submittedAt: questionnaire.submittedAt,
        completed: questionnaire.completed
      }
    });
  } catch (error) {
    console.error('Submit questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to submit questionnaire',
      message: 'An error occurred while submitting questionnaire'
    });
  }
};

/**
 * Get user questionnaire
 * @route GET /api/questionnaire
 */
const getQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user questionnaire
    const questionnaire = await Questionnaire.findOne({
      where: { userId }
    });

    if (!questionnaire) {
      return res.status(404).json({
        error: 'Questionnaire not found',
        message: 'You have not submitted a questionnaire yet'
      });
    }

    res.status(200).json({
      questionnaire
    });
  } catch (error) {
    console.error('Get questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to retrieve questionnaire',
      message: 'An error occurred while retrieving questionnaire'
    });
  }
};

/**
 * Generate AI-based interview questions based on professional summary
 * @route POST /api/questionnaire/generate
 */
const { generateInterviewQuestions } = require('../services/aiService');

// Map of common profession keywords to pre-generated questions for faster responses
const preGeneratedQuestions = {
  'marketing': [
    "Over your career, the digital marketing landscape has transformed. Can you describe a specific campaign that failed due to an unexpected platform change, and how you pivoted your strategy?",
    "Imagine a new client has a high-value product but limited budget. What would be your 90-day plan to generate qualified leads?",
    "In your experience, what separates a marketing campaign that is merely 'good' from one that is truly 'great'?",
    "What specific area of marketing are you most passionate about mastering next, and how do you plan to develop that expertise?",
    "Tell us about a time when you had to convince skeptical stakeholders to try an innovative marketing approach. How did you build buy-in?"
  ],
  'sales': [
    "Describe your approach to understanding a prospect's needs and tailoring your pitch accordingly.",
    "Tell me about the most challenging sale you ever closed. What obstacles did you face and how did you overcome them?",
    "How do you maintain relationships with clients after the initial sale to ensure repeat business?",
    "What strategies do you use to recover when a promising lead goes cold?",
    "In your experience, what's the most effective way to handle price objections?"
  ],
  'developer': [
    "Describe a technically complex project you worked on and how you approached the architecture.",
    "Tell me about a time when you had to refactor legacy code. What was your approach?",
    "How do you stay updated with the latest technologies and decide which ones to adopt?",
    "Describe how you collaborate with non-technical team members to understand requirements.",
    "Tell me about a situation where you identified and fixed a critical performance issue."
  ]
};

// Helper function to find matching pre-generated questions
const findPreGeneratedQuestions = (summary) => {
  const lowerSummary = summary.toLowerCase();
  for (const [keyword, questions] of Object.entries(preGeneratedQuestions)) {
    if (lowerSummary.includes(keyword)) {
      return questions;
    }
  }
  return null;
};

// Generate fallback questions if AI generation fails
const generateFallbackQuestions = (summary) => {
  return [
    `Based on your professional background, what unique skills do you bring to the table?`,
    `Describe a challenging situation you've faced and how you overcame it.`,
    `What are your professional goals for the next two years?`,
    `Tell us about a project you're particularly proud of and why.`,
    `How do you approach learning new skills in your field?`
  ];
};

const generateQuestions = async (req, res) => {
  try {
    // Get summary from request (frontend is sending 'summary' not 'professionalSummary')
    const { summary, useAi = true } = req.body;
    const professionalSummary = summary; // For compatibility with existing code
    
    if (!summary || summary.trim() === '') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Professional summary is required'
      });
    }
    
    console.log('Generating questions from summary:', summary, 'Using AI:', useAi);
    
    // First try to find pre-generated questions for faster response
    const preGenQuestions = findPreGeneratedQuestions(professionalSummary);
    const fallbackQuestions = generateFallbackQuestions(professionalSummary);
    
    // If AI is disabled or we're in a development environment without API access, return pre-generated questions
    if (!useAi) {
      const initialQuestions = preGenQuestions || fallbackQuestions;
      
      return res.status(200).json({
        success: true,
        questions: initialQuestions,
        message: 'Questions generated from template',
        source: 'template'
      });
    }
    
    try {
      // Try to generate questions using Gemini AI
      const aiQuestions = await generateInterviewQuestions(professionalSummary);
      console.log('AI-generated questions:', aiQuestions);
      
      // If we have a user ID, store the questions in the database
      if (req.user && req.user.id) {
        await User.update({
          professionalSummary,
          aiGeneratedQuestions: JSON.stringify(aiQuestions)
        }, {
          where: { id: req.user.id }
        });
      }
      
      return res.status(200).json({
        success: true,
        questions: aiQuestions,
        message: 'Questions generated with AI',
        source: 'ai'
      });
    } catch (aiError) {
      console.error('Error generating AI questions:', aiError);
      
      // If AI generation fails, fall back to pre-generated questions
      const fallbackQuestions = preGenQuestions || generateFallbackQuestions(professionalSummary);
      
      return res.status(200).json({
        success: true,
        questions: fallbackQuestions,
        message: 'Questions generated from fallback template due to AI error',
        source: 'fallback',
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('Error in question generation:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Could not generate interview questions',
      details: error.message
    });
  }
};

module.exports = {
  submitQuestionnaire,
  getQuestionnaire,
  generateQuestions
};
