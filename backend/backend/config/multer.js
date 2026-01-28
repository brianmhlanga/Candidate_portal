const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../uploads/photos'),
    path.join(__dirname, '../uploads/audio'),
    path.join(__dirname, '../uploads/video')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Define storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    // Determine the appropriate upload folder based on the file type
    if (file.mimetype.startsWith('image')) {
      uploadPath = path.join(__dirname, '../uploads/photos');
    } else if (file.mimetype.startsWith('audio')) {
      uploadPath = path.join(__dirname, '../uploads/audio');
    } else if (file.mimetype.startsWith('video')) {
      uploadPath = path.join(__dirname, '../uploads/video');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed mime types for each upload type
  const allowedTypes = {
    photo: ['image/jpeg', 'image/png', 'image/jpg'],
    audio: ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/*'],
    video: ['video/mp4', 'video/webm', 'video/quicktime']
  };
  
  // Get upload type from request path
  const uploadType = req.path.split('/').pop();
  
  console.log('Upload request received:', {
    path: req.path,
    uploadType,
    detectedMimeType: file.mimetype,
    originalFilename: file.originalname
  });
  
  // Special case for audio - be more permissive
  if (uploadType === 'audio' && file.mimetype.startsWith('audio/')) {
    console.log('Audio file detected, accepting file');
    return cb(null, true);
  }
  
  // Check if the file type is allowed for this upload type
  if (allowedTypes[uploadType] && allowedTypes[uploadType].includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.error(`Invalid file type rejected: ${file.mimetype}. Allowed types for ${uploadType}: ${allowedTypes[uploadType].join(', ')}`);
    cb(new Error(`Invalid file type. Allowed types for ${uploadType}: ${allowedTypes[uploadType].join(', ')}`), false);
  }
};

// Configure file size limits (in bytes)
const limits = {
  photo: 5 * 1024 * 1024, // 5MB
  audio: 25 * 1024 * 1024, // 25MB (increased to handle larger audio files)
  video: 50 * 1024 * 1024 // 50MB
};

// Create multer instances for each upload type
const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: { fileSize: limits.photo }
});

const uploadAudio = multer({
  storage,
  fileFilter,
  limits: { fileSize: limits.audio }
});

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: { fileSize: limits.video }
});

module.exports = {
  uploadPhoto,
  uploadAudio,
  uploadVideo
};
