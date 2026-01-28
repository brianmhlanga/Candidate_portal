/**
 * EMERGENCY BYPASS ROUTES
 * These routes completely bypass authentication for debugging
 * WARNING: REMOVE IN PRODUCTION!
 */
const express = require('express');
const router = express.Router();

console.log('Loading EMERGENCY BYPASS routes - NO AUTHENTICATION REQUIRED');

/**
 * @route GET /bypass/admin/dashboard
 * @desc Get dummy admin dashboard data without authentication
 * @access Public (INSECURE - FOR DEBUGGING ONLY)
 */
router.get('/admin/dashboard', (req, res) => {
  console.log('BYPASS: Serving admin dashboard data without authentication');
  
  return res.status(200).json({
    success: true,
    data: {
      totalCandidates: 24,
      newCandidates: 5,
      onboardingProgress: {
        step1: 4,
        step2: 6,
        step3: 8,
        step4: 3,
        completed: 3
      },
      recentActivity: [
        { id: 1, action: 'Candidate Registered', date: new Date(), details: 'Jane Smith registered as a new candidate' },
        { id: 2, action: 'Onboarding Completed', date: new Date(), details: 'John Doe completed all onboarding steps' },
        { id: 3, action: 'Document Uploaded', date: new Date(), details: 'Mike Johnson uploaded resume' }
      ]
    }
  });
});

/**
 * @route GET /bypass/admin/candidates
 * @desc Get dummy candidate list without authentication
 * @access Public (INSECURE - FOR DEBUGGING ONLY)
 */
router.get('/admin/candidates', (req, res) => {
  console.log('BYPASS: Serving candidates list without authentication');
  
  return res.status(200).json({
    success: true,
    data: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        createdAt: new Date('2025-06-01'),
        onboardingStep: 3,
        status: 'pending'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date('2025-06-15'),
        onboardingStep: 5,
        status: 'approved'
      },
      {
        id: 3,
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        createdAt: new Date('2025-07-01'),
        onboardingStep: 2,
        status: 'pending'
      },
      {
        id: 4,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@example.com',
        createdAt: new Date('2025-07-05'),
        onboardingStep: 1,
        status: 'pending'
      },
      {
        id: 5,
        firstName: 'Robert',
        lastName: 'Brown',
        email: 'robert.brown@example.com',
        createdAt: new Date('2025-06-20'),
        onboardingStep: 4,
        status: 'pending'
      }
    ],
    pagination: {
      total: 24,
      page: 1,
      limit: 10,
      pages: 3
    }
  });
});

/**
 * @route GET /bypass/admin/candidates/:id
 * @desc Get dummy candidate details without authentication
 * @access Public (INSECURE - FOR DEBUGGING ONLY)
 */
router.get('/admin/candidates/:id', (req, res) => {
  console.log(`BYPASS: Serving candidate details for ID ${req.params.id} without authentication`);
  
  return res.status(200).json({
    success: true,
    data: {
      id: parseInt(req.params.id),
      firstName: 'Sample',
      lastName: 'Candidate',
      email: `candidate${req.params.id}@example.com`,
      phone: '555-123-4567',
      createdAt: new Date('2025-06-15'),
      updatedAt: new Date('2025-07-01'),
      onboardingStep: 3,
      status: 'pending',
      professionalSummary: 'Experienced professional with 5+ years in digital marketing and content strategy. Specialized in social media campaign management and analytics. Strong background in creative direction and brand development for startups and established companies.',
      documents: [
        { id: 1, name: 'Resume.pdf', type: 'document', uploadedAt: new Date('2025-06-16') },
        { id: 2, name: 'Portfolio.pdf', type: 'document', uploadedAt: new Date('2025-06-17') },
        { id: 3, name: 'profile-photo.jpg', type: 'image', uploadedAt: new Date('2025-06-18') }
      ],
      questionnaire: {
        completed: true,
        responses: [
          { question: 'Why do you want to join 3% Generation Agency?', answer: 'I believe my skills in digital marketing align perfectly with the agency\'s forward-thinking approach. I\'m particularly drawn to the focus on innovative campaigns and the opportunity to work with diverse clients.' },
          { question: 'Describe your most successful marketing campaign.', answer: 'I led a social media campaign for a fitness brand that increased engagement by 200% and generated 50,000 new leads over three months. The campaign combined influencer partnerships with targeted content strategy.' },
          { question: 'What are your salary expectations?', answer: '$75,000 - $85,000 annually, depending on benefits package and growth opportunities.' }
        ]
      }
    }
  });
});

/**
 * @route GET /bypass/admin/dashboard/stats
 * @desc Get dummy dashboard stats without authentication
 * @access Public (INSECURE - FOR DEBUGGING ONLY)
 */
router.get('/admin/dashboard/stats', (req, res) => {
  console.log('BYPASS: Serving dashboard stats without authentication');
  
  return res.status(200).json({
    success: true,
    data: {
      totalCandidates: 24,
      newCandidates: 5,
      onboardingProgress: {
        step1: 4,
        step2: 6,
        step3: 8,
        step4: 3,
        completed: 3
      }
    }
  });
});

module.exports = router;
