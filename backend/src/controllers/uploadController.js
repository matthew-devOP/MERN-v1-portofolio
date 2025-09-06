const asyncHandler = require('express-async-handler');
const uploadService = require('../services/uploadService');

const uploadAvatar = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadAvatar(req.file, req.user._id);

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      url: result.url,
      user: result.user,
    },
  });
});

const uploadPostImage = asyncHandler(async (req, res) => {
  const result = await uploadService.uploadPostImage(
    req.file, 
    req.params.postId, 
    req.user._id
  );

  res.json({
    success: true,
    message: 'Post image uploaded successfully',
    data: {
      url: result.url,
      post: result.post,
    },
  });
});

const uploadGeneralImage = asyncHandler(async (req, res) => {
  const { folder = 'general' } = req.body;
  
  const result = await uploadService.uploadGeneralImage(
    req.file, 
    req.user._id,
    folder
  );

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: result,
  });
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;
  
  const result = await uploadService.deleteImageByUrl(imageUrl, req.user._id);

  res.json({
    success: true,
    message: 'Image deleted successfully',
    data: result,
  });
});

const getImageInfo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file provided',
    });
  }

  const info = uploadService.getImageInfo(req.file);

  res.json({
    success: true,
    message: 'Image info retrieved successfully',
    data: info,
  });
});

module.exports = {
  uploadAvatar,
  uploadPostImage,
  uploadGeneralImage,
  deleteImage,
  getImageInfo,
};