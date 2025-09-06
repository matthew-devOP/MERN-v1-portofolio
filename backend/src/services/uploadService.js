const { uploadImage, deleteImage } = require('../config/cloudinary');
const User = require('../models/User');
const Post = require('../models/Post');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../config/logger');

class UploadService {
  async uploadAvatar(file, userId) {
    try {
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Delete old avatar if exists
      if (user.avatar) {
        const oldPublicId = this.extractPublicIdFromUrl(user.avatar);
        if (oldPublicId) {
          await deleteImage(oldPublicId).catch(err => 
            logger.warn(`Failed to delete old avatar: ${err.message}`)
          );
        }
      }

      // Upload new avatar
      const result = await uploadImage(file.buffer, {
        folder: 'blog-platform/avatars',
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
        ],
      });

      // Update user avatar
      user.avatar = result.secure_url;
      await user.save();

      logger.info(`Avatar uploaded for user: ${userId}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        user: user,
      };
    } catch (error) {
      logger.error('Avatar upload error:', error);
      throw error;
    }
  }

  async uploadPostImage(file, postId, userId) {
    try {
      // Find post and check ownership
      const post = await Post.findById(postId);
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      // Check if user owns the post or is admin
      if (post.author.toString() !== userId) {
        const user = await User.findById(userId);
        if (!user || user.role !== 'admin') {
          throw new AuthorizationError('You can only upload images for your own posts');
        }
      }

      // Delete old featured image if exists
      if (post.featuredImage) {
        const oldPublicId = this.extractPublicIdFromUrl(post.featuredImage);
        if (oldPublicId) {
          await deleteImage(oldPublicId).catch(err => 
            logger.warn(`Failed to delete old post image: ${err.message}`)
          );
        }
      }

      // Upload new image
      const result = await uploadImage(file.buffer, {
        folder: 'blog-platform/posts',
        transformation: [
          { width: 1200, height: 800, crop: 'fill' },
          { quality: 'auto:good' },
        ],
      });

      // Update post featured image
      post.featuredImage = result.secure_url;
      await post.save();

      logger.info(`Post image uploaded for post: ${postId}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        post: post,
      };
    } catch (error) {
      logger.error('Post image upload error:', error);
      throw error;
    }
  }

  async uploadGeneralImage(file, userId, folder = 'general') {
    try {
      // Upload image
      const result = await uploadImage(file.buffer, {
        folder: `blog-platform/${folder}`,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      });

      logger.info(`General image uploaded by user: ${userId}`);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (error) {
      logger.error('General image upload error:', error);
      throw error;
    }
  }

  async deleteImageByUrl(imageUrl, userId) {
    try {
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      if (!publicId) {
        throw new ValidationError('Invalid image URL');
      }

      const result = await deleteImage(publicId);
      
      logger.info(`Image deleted by user: ${userId}`);
      
      return result;
    } catch (error) {
      logger.error('Image delete error:', error);
      throw error;
    }
  }

  extractPublicIdFromUrl(url) {
    try {
      // Extract public ID from Cloudinary URL
      const matches = url.match(/\/v\d+\/(.+)\./);
      return matches ? matches[1] : null;
    } catch (error) {
      logger.warn('Failed to extract public ID from URL:', url);
      return null;
    }
  }

  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
    }

    if (file.size > maxSize) {
      throw new ValidationError('File too large. Maximum size is 5MB.');
    }

    return true;
  }

  getImageInfo(file) {
    return {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2),
    };
  }
}

module.exports = new UploadService();