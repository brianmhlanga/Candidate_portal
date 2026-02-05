const express = require('express');
const { authenticate } = require('../middleware/auth'); // CORRECT: Destructure the authenticate function

const router = express.Router();
const questionnaireController = require('../controllers/questionnaire'); // Import controller


// Submit completion questionnaire (ApplicationQuestionnaire.js)
router.post('/', authenticate, async (req, res) => {
  try {
    const { Questionnaire } = require('../models');
    const userId = req.user.id;
    const {
      personalInfo,
      contactInfo,
      workExperience,
      references,
      additionalInfo,
      consents
    } = req.body;

    console.log('Questionnaire submission for user:', userId);
    console.log('Request body keys:', Object.keys(req.body));

    // Relaxed validation - only check for critical mandatory fields
    // The frontend sends formData directly, not in sections
    const hasBasicInfo = req.body.firstName && req.body.lastName && req.body.emailAddress;

    if (!hasBasicInfo) {
      console.log('Validation failed. Missing mandatory fields (firstName, lastName, emailAddress)');
      return res.status(400).json({
        error: 'Incomplete questionnaire',
        message: 'Please fill in all mandatory fields marked with *'
      });
    }

    console.log('Validation passed. Proceeding with questionnaire submission...');

    // Restructure flat formData into sections for database
    const structuredData = {
      personalInfo: {
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        jobTitle: req.body.jobTitle || '',
        dateOfBirth: req.body.dateOfBirth || '',
        currently: req.body.currently || 'employed',
        driversLicense: req.body.driversLicense || 'yes',
        maritalStatus: req.body.maritalStatus || 'single'
      },
      contactInfo: {
        emailAddress: req.body.emailAddress || '',
        contactNumber: req.body.contactNumber || '',
        city: req.body.city || ''
      },
      workExperience: req.body.workExperience || '',
      references: {
        previousEmployers: req.body.previousEmployers || [],
        referrals: req.body.referrals || []
      },
      additionalInfo: {
        whereToBe5Years: req.body.whereToBe5Years || '',
        reasonsForEmployment: req.body.reasonsForEmployment || '',
        expectedSalary: req.body.expectedSalary || '',
        availability: req.body.availability || ''
      },
      consents: {
        socialMediaConsent: req.body.socialMediaConsent || false,
        radioAdvertConsent: req.body.radioAdvertConsent || false,
        displayPictureConsent: req.body.displayPictureConsent || false
      }
    };

    // Check if questionnaire already exists
    const existingQuestionnaire = await Questionnaire.findOne({
      where: { userId }
    });

    if (existingQuestionnaire) {
      // Update existing questionnaire
      await existingQuestionnaire.update({
        personalInfo: structuredData.personalInfo,
        contactInfo: structuredData.contactInfo,
        workExperience: structuredData.workExperience,
        references: structuredData.references,
        additionalInfo: structuredData.additionalInfo,
        consents: structuredData.consents,
        submittedAt: new Date(),
        completed: true
      });

      console.log('Questionnaire updated successfully for user:', userId);
      return res.status(200).json({
        message: 'Questionnaire updated successfully',
        questionnaire: existingQuestionnaire
      });
    } else {
      // Create new questionnaire
      const questionnaire = await Questionnaire.create({
        userId,
        personalInfo: structuredData.personalInfo,
        contactInfo: structuredData.contactInfo,
        workExperience: structuredData.workExperience,
        references: structuredData.references,
        additionalInfo: structuredData.additionalInfo,
        consents: structuredData.consents,
        submittedAt: new Date(),
        completed: true
      });

      console.log('Questionnaire created successfully for user:', userId);
      return res.status(201).json({
        message: 'Questionnaire submitted successfully',
        questionnaire
      });
    }
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit questionnaire: ' + error.message
    });
  }
});

// Get user questionnaire (ApplicationQuestionnaire.js)
router.get('/', authenticate, async (req, res) => {
  try {
    const { Questionnaire } = require('../models');
    const userId = req.user.id;

    console.log('Getting questionnaire for user:', userId);

    const questionnaire = await Questionnaire.findOne({
      where: { userId }
    });

    if (!questionnaire) {
      console.log('No questionnaire found for user:', userId);
      return res.status(404).json({
        error: 'Questionnaire not found',
        message: 'No questionnaire found for this user'
      });
    }

    console.log('Questionnaire found for user:', userId);
    return res.status(200).json({
      questionnaire
    });
  } catch (error) {
    console.error('Error retrieving questionnaire:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve questionnaire: ' + error.message
    });
  }
});

// Generate interview questions for video recording (VideoRecording.js)
router.post('/generate-questions', authenticate, async (req, res) => {
  try {
    const { summary } = req.body;
    console.log('Generating questions from summary:', summary);

    // Generate tailored questions based on the professional summary
    const fallbackQuestions = [
      "Tell me about your professional background and experience in your field.",
      "What are your key strengths and how do they apply to this role?",
      "Describe a challenging project you've worked on and how you overcame obstacles.",
      "Where do you see yourself professionally in the next 5 years?",
      "What motivates you most in your work and career development?"
    ];

    // If we have a summary, try to generate more specific questions
    let questions = fallbackQuestions;
    if (summary && summary.length > 10) {
      // Add summary-specific questions
      questions = [
        `Based on your background in ${summary.substring(0, 50)}..., tell me about your most significant achievement.`,
        "What specific skills from your experience make you a strong candidate for this position?",
        "Describe a situation where you had to learn something new quickly. How did you approach it?",
        "What challenges have you faced in your career and how did you overcome them?",
        "How do you stay current with developments in your field?"
      ];
    }

    console.log('Generated questions successfully');
    return res.status(200).json({
      questions: questions,
      message: 'Interview questions generated successfully',
      source: 'generated'
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate questions: ' + error.message
    });
  }
});

// Get questionnaire status
router.get('/status', authenticate, async (req, res) => {
  try {
    const { Questionnaire } = require('../models');
    const userId = req.user.id;

    const questionnaire = await Questionnaire.findOne({
      where: { userId }
    });

    res.json({
      completed: questionnaire ? !!questionnaire.completed : false,
      submittedAt: questionnaire ? questionnaire.submittedAt : null
    });
  } catch (error) {
    console.error('Error fetching questionnaire status:', error);
    res.status(500).json({ error: 'Failed to fetch questionnaire status' });
  }
});


/**
 * @route POST /api/questionnaire/id-assessment
 * @desc Submit ID Assessment (Step 1)
 * @access Private
 */
router.post('/id-assessment', authenticate, questionnaireController.submitIdAssessment);

module.exports = router;
