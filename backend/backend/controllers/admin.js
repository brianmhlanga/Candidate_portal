const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Upload, Questionnaire } = require('../models');
const { Op } = require('sequelize');

// Admin login controller (keeping existing - it works)
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: {
        email,
        role: 'admin' // Only allow users with admin role to login
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Admin login failed',
        message: 'Invalid admin credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Admin login failed',
        message: 'Invalid admin credentials'
      });
    }

    // Generate admin JWT token with admin role claim
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return admin user data and token
    res.status(200).json({
      message: 'Admin login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Admin login failed',
      message: 'An error occurred during admin login'
    });
  }
};

// Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await User.findAll({
      where: {
        role: { [Op.ne]: 'admin' }
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'onboardingStep', 'onboardingCompleted', 'createdAt', 'approvalStatus', 'approvedAt', 'rejectionReason'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      candidates
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      error: 'Failed to retrieve candidates',
      message: 'An error occurred while retrieving candidates'
    });
  }
};

// Get candidate details by ID
const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await User.findOne({
      where: {
        id,
        role: { [Op.ne]: 'admin' }
      },
      include: [
        {
          model: Upload,
          as: 'uploads'
        },
        {
          model: Questionnaire,
          as: 'questionnaire'
        }
      ]
    });

    if (!candidate) {
      return res.status(404).json({
        error: 'Candidate not found',
        message: 'The requested candidate could not be found'
      });
    }

    res.status(200).json({
      candidate
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      error: 'Failed to retrieve candidate',
      message: 'An error occurred while retrieving candidate details'
    });
  }
};

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Total candidates (non-admin users)
    const totalCandidates = await User.count({
      where: {
        role: { [Op.ne]: 'admin' }
      }
    });

    // Pending approvals
    const pendingApprovals = await User.count({
      where: {
        role: { [Op.ne]: 'admin' },
        approvalStatus: 'pending',
        onboardingCompleted: true
      }
    });

    // Approved users
    const approvedUsers = await User.count({
      where: {
        approvalStatus: 'approved'
      }
    });

    // Recent candidates (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCandidates = await User.count({
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo
        },
        role: { [Op.ne]: 'admin' }
      }
    });

    // Onboarding steps distribution
    const welcomeStep = await User.count({ where: { onboardingStep: 'welcome', role: { [Op.ne]: 'admin' } } });
    const photoStep = await User.count({ where: { onboardingStep: 'photo-upload', role: { [Op.ne]: 'admin' } } });
    const audioStep = await User.count({ where: { onboardingStep: 'audio-recording', role: { [Op.ne]: 'admin' } } });
    const videoStep = await User.count({ where: { onboardingStep: 'video-recording', role: { [Op.ne]: 'admin' } } });
    const questionnaireStep = await User.count({ where: { onboardingStep: 'questionnaire', role: { [Op.ne]: 'admin' } } });
    const completionStep = await User.count({ where: { onboardingStep: 'completion', role: { [Op.ne]: 'admin' } } });

    // Calculate percentages for progress bars
    const totalForPercentage = totalCandidates || 1; // Avoid division by zero

    res.status(200).json({
      totalCandidates,
      pendingApprovals,
      approvedUsers,
      recentCandidates,
      onboardingSteps: {
        welcome: welcomeStep,
        photoUpload: photoStep,
        audioRecording: audioStep,
        videoRecording: videoStep,
        questionnaire: questionnaireStep,
        completion: completionStep
      },
      onboardingProgress: {
        welcome: Math.round((welcomeStep / totalForPercentage) * 100),
        photoUpload: Math.round((photoStep / totalForPercentage) * 100),
        audioRecording: Math.round((audioStep / totalForPercentage) * 100),
        videoRecording: Math.round((videoStep / totalForPercentage) * 100),
        questionnaire: Math.round((questionnaireStep / totalForPercentage) * 100),
        completion: Math.round((completionStep / totalForPercentage) * 100)
      },
      message: 'Dashboard stats loaded successfully'
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve dashboard statistics',
      message: 'An error occurred while retrieving dashboard statistics'
    });
  }
};

// APPROVAL WORKFLOW CONTROLLERS

// Approve Candidate
const approveCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const candidate = await User.findOne({
      where: { id, role: { [Op.ne]: 'admin' } }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update candidate status
    await candidate.update({
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null
    });

    // Also approve all their pending uploads and questionnaire
    await Upload.update(
      { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId },
      { where: { userId: id, status: 'pending' } }
    );

    await Questionnaire.update(
      { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId },
      { where: { userId: id, status: 'pending' } }
    );

    return res.status(200).json({
      success: true,
      message: 'Candidate and all submissions approved successfully',
      candidate
    });
  } catch (error) {
    console.error('Approve candidate error:', error);
    res.status(500).json({ error: 'Failed to approve candidate' });
  }
};

// Reject Candidate
const rejectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const candidate = await User.findOne({
      where: { id, role: { [Op.ne]: 'admin' } }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await candidate.update({
      approvalStatus: 'rejected',
      approvedAt: null,
      approvedBy: adminId,
      rejectionReason: reason || 'No reason provided'
    });

    return res.status(200).json({
      success: true,
      message: 'Candidate rejected',
      candidate
    });
  } catch (error) {
    console.error('Reject candidate error:', error);
    res.status(500).json({ error: 'Failed to reject candidate' });
  }
};

// Approve Upload
const approveUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const upload = await Upload.findByPk(id);

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    await upload.update({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: null
    });

    return res.status(200).json({
      success: true,
      message: 'Upload approved successfully',
      upload
    });
  } catch (error) {
    console.error('Approve upload error:', error);
    res.status(500).json({ error: 'Failed to approve upload' });
  }
};

// Reject Upload
const rejectUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const upload = await Upload.findByPk(id);

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    await upload.update({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: reason || 'No reason provided'
    });

    return res.status(200).json({
      success: true,
      message: 'Upload rejected',
      upload
    });
  } catch (error) {
    console.error('Reject upload error:', error);
    res.status(500).json({ error: 'Failed to reject upload' });
  }
};

// Approve Questionnaire
const approveQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const questionnaire = await Questionnaire.findByPk(id);

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    await questionnaire.update({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: null
    });

    return res.status(200).json({
      success: true,
      message: 'Questionnaire approved successfully',
      questionnaire
    });
  } catch (error) {
    console.error('Approve questionnaire error:', error);
    res.status(500).json({ error: 'Failed to approve questionnaire' });
  }
};

// Reject Questionnaire
const rejectQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const questionnaire = await Questionnaire.findByPk(id);

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    await questionnaire.update({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: reason || 'No reason provided'
    });

    return res.status(200).json({
      success: true,
      message: 'Questionnaire rejected',
      questionnaire
    });
  } catch (error) {
    console.error('Reject questionnaire error:', error);
    res.status(500).json({ error: 'Failed to reject questionnaire' });
  }
};

// Bulk Approve Candidates
const bulkApproveCandidates = async (req, res) => {
  try {
    const { ids } = req.body;
    const adminId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No candidate IDs provided' });
    }

    // Approve users
    await User.update(
      {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: adminId,
        rejectionReason: null
      },
      {
        where: {
          id: ids,
          role: { [Op.ne]: 'admin' }
        }
      }
    );

    // Also approve their submissions
    await Upload.update(
      { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId },
      { where: { userId: ids, status: 'pending' } }
    );

    await Questionnaire.update(
      { status: 'approved', reviewedAt: new Date(), reviewedBy: adminId },
      { where: { userId: ids, status: 'pending' } }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} candidates approved successfully`
    });
  } catch (error) {
    console.error('Bulk approve candidates error:', error);
    res.status(500).json({ error: 'Failed to bulk approve candidates' });
  }
};

// Bulk Approve Uploads
const bulkApproveUploads = async (req, res) => {
  try {
    const { ids } = req.body;
    const adminId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No upload IDs provided' });
    }

    await Upload.update(
      {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectionReason: null
      },
      {
        where: { id: ids }
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} uploads approved successfully`
    });
  } catch (error) {
    console.error('Bulk approve uploads error:', error);
    res.status(500).json({ error: 'Failed to bulk approve uploads' });
  }
};

// Get all videos
const getAllVideos = async (req, res) => {
  try {
    const videoRecordings = await Upload.findAll({
      where: {
        type: 'video'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedVideos = videoRecordings.map(v => ({
      id: v.id,
      title: `Video Recording #${v.id.substring(0, 8)}...`,
      description: 'Video recording from candidate onboarding',
      file_url: v.url,
      duration: v.duration,
      file_size: v.metadata?.size,
      status: v.status || 'pending', // Normalize to pending for admin review
      created_at: v.createdAt,
      reviewedAt: v.reviewedAt,
      rejectionReason: v.rejectionReason,
      candidateName: v.user ? `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() : 'Unknown User',
      candidate_name: v.user ? `${v.user.firstName || ''} ${v.user.lastName || ''}`.trim() : 'Unknown User'
    }));

    res.status(200).json({
      videos: formattedVideos
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({
      error: 'Failed to retrieve videos',
      message: 'An error occurred while retrieving videos'
    });
  }
};

// Get all photos
const getAllPhotos = async (req, res) => {
  try {
    const photoUploads = await Upload.findAll({
      where: {
        type: 'photo'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedPhotos = photoUploads.map(p => ({
      id: p.id,
      title: `Photo Upload #${p.id.substring(0, 8)}...`,
      description: 'Photo upload from candidate onboarding',
      file_url: p.url,
      file_size: p.metadata?.size,
      file_url: p.url,
      file_size: p.metadata?.size,
      status: p.status || 'pending', // Normalize to pending for admin review
      created_at: p.createdAt,
      reviewedAt: p.reviewedAt,
      rejectionReason: p.rejectionReason,
      candidateName: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'Unknown User',
      candidate_name: p.user ? `${p.user.firstName || ''} ${p.user.lastName || ''}`.trim() : 'Unknown User'
    }));

    res.status(200).json({
      photos: formattedPhotos
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      error: 'Failed to retrieve photos',
      message: 'An error occurred while retrieving photos'
    });
  }
};

// Get all audio recordings
const getAllAudioRecordings = async (req, res) => {
  try {
    const audioRecordings = await Upload.findAll({
      where: {
        type: 'audio'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedAudio = audioRecordings.map(a => ({
      id: a.id,
      title: `Audio Recording #${a.id.substring(0, 8)}...`,
      description: 'Audio recording from candidate onboarding',
      file_url: a.url,
      duration: a.duration,
      file_size: a.metadata?.size,
      file_url: a.url,
      duration: a.duration,
      file_size: a.metadata?.size,
      status: a.status || 'pending', // Normalize to pending for admin review
      created_at: a.createdAt,
      reviewedAt: a.reviewedAt,
      rejectionReason: a.rejectionReason,
      candidateName: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : 'Unknown User',
      candidate_name: a.user ? `${a.user.firstName || ''} ${a.user.lastName || ''}`.trim() : 'Unknown User'
    }));

    res.status(200).json({
      audio: formattedAudio,
      recordings: formattedAudio
    });
  } catch (error) {
    console.error('Get audio recordings error:', error);
    res.status(500).json({
      error: 'Failed to retrieve audio recordings',
      message: 'An error occurred while retrieving audio recordings'
    });
  }
};

// Get all questionnaires
const getAllQuestionnaires = async (req, res) => {
  try {
    const questionnaires = await Questionnaire.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedQuestionnaires = questionnaires.map(q => {
      const candidateName = q.user ?
        `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() :
        'Unknown User';

      return {
        id: q.id,
        title: `Questionnaire #${q.id.substring(0, 8)}...`,
        candidateName,
        candidate_name: candidateName,
        status: q.status || (q.submittedAt ? 'completed' : 'pending'), // Use new status field
        created_at: q.createdAt,
        createdAt: q.createdAt,
        submittedAt: q.submittedAt,
        reviewedAt: q.reviewedAt,
        rejectionReason: q.rejectionReason,
        userId: q.userId,
        personalInfo: q.personalInfo,
        contactInfo: q.contactInfo,
        workExperience: q.workExperience,
        references: q.references,
        additionalInfo: q.additionalInfo,
        consents: q.consents
      };
    });

    res.status(200).json({
      questionnaires: formattedQuestionnaires
    });
  } catch (error) {
    console.error('Get all questionnaires error:', error);
    res.status(500).json({
      error: 'Failed to retrieve questionnaires',
      message: 'An error occurred while retrieving questionnaires'
    });
  }
};

// Get questionnaire by ID
const getQuestionnaireById = async (req, res) => {
  try {
    const { id } = req.params;

    const questionnaire = await Questionnaire.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        }
      ]
    });

    if (!questionnaire) {
      return res.status(404).json({ error: 'Questionnaire not found' });
    }

    const candidateName = questionnaire.user ?
      `${questionnaire.user.firstName || ''} ${questionnaire.user.lastName || ''}`.trim() :
      'Unknown User';

    const formattedQuestionnaire = {
      id: questionnaire.id,
      title: `Questionnaire #${questionnaire.id.substring(0, 8)}...`,
      candidateName,
      candidate_name: candidateName,
      status: questionnaire.status || (questionnaire.submittedAt ? 'completed' : 'pending'),
      created_at: questionnaire.createdAt,
      createdAt: questionnaire.createdAt,
      submittedAt: questionnaire.submittedAt,
      reviewedAt: questionnaire.reviewedAt,
      rejectionReason: questionnaire.rejectionReason,
      userId: questionnaire.userId,
      personalInfo: questionnaire.personalInfo,
      contactInfo: questionnaire.contactInfo,
      workExperience: questionnaire.workExperience,
      references: questionnaire.references,
      additionalInfo: questionnaire.additionalInfo,
      consents: questionnaire.consents
    };

    return res.status(200).json({
      questionnaire: formattedQuestionnaire
    });
  } catch (error) {
    console.error('Get questionnaire error:', error);
    res.status(500).json({ error: 'Failed to retrieve questionnaire' });
  }
};

// Placeholder functions for other CRUD operations
const createQuestionnaire = async (req, res) => {
  res.status(501).json({ message: 'Create questionnaire not implemented' });
};

const updateQuestionnaire = async (req, res) => {
  res.status(501).json({ message: 'Update questionnaire not implemented' });
};

const deleteQuestionnaire = async (req, res) => {
  res.status(501).json({ message: 'Delete questionnaire not implemented' });
};

module.exports = {
  adminLogin,
  getAllCandidates,
  getCandidateById,
  getDashboardStats,
  approveCandidate,
  rejectCandidate,
  approveUpload,
  rejectUpload,
  approveQuestionnaire,
  rejectQuestionnaire,
  bulkApproveCandidates,
  bulkApproveUploads,
  getAllQuestionnaires,
  getQuestionnaireById,
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
  getAllVideos,
  getAllPhotos,
  getAllAudioRecordings
};
