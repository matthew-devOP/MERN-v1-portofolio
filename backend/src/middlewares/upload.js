const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errors');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Single file upload
  },
});

// Middleware for single file upload
const uploadSingle = (fieldName = 'image') => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError('File too large. Maximum size is 5MB.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ValidationError('Too many files. Only one file is allowed.'));
        }
        return next(new ValidationError(`Upload error: ${err.message}`));
      }
      
      if (err) {
        return next(err);
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ValidationError('File too large. Maximum size is 5MB per file.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new ValidationError(`Too many files. Maximum ${maxCount} files allowed.`));
        }
        return next(new ValidationError(`Upload error: ${err.message}`));
      }
      
      if (err) {
        return next(err);
      }
      
      next();
    });
  };
};

// Validation middleware to check if file exists
const requireFile = (req, res, next) => {
  if (!req.file) {
    return next(new ValidationError('No file uploaded. Please select a file.'));
  }
  next();
};

// Validation middleware to check if files exist
const requireFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ValidationError('No files uploaded. Please select at least one file.'));
  }
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  requireFile,
  requireFiles,
};