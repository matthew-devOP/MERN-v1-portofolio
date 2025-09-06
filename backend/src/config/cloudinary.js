const { v2: cloudinary } = require('cloudinary');
const logger = require('./logger');

const initCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    logger.info('Cloudinary configured successfully');
  } catch (error) {
    logger.error('Cloudinary configuration failed:', error);
  }
};

const uploadImage = async (buffer, options = {}) => {
  const defaultOptions = {
    folder: 'blog-platform',
    resource_type: 'image',
    format: 'webp',
    quality: 'auto:good',
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  };

  const uploadOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

const generateImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto',
  };

  const finalTransformations = { ...defaultTransformations, ...transformations };

  return cloudinary.url(publicId, finalTransformations);
};

module.exports = {
  initCloudinary,
  uploadImage,
  deleteImage,
  generateImageUrl,
  cloudinary,
};