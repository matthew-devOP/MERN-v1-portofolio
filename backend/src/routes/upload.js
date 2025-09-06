const express = require('express');
const {
  uploadAvatar,
  uploadPostImage,
  uploadGeneralImage,
  deleteImage,
  getImageInfo,
} = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateObjectId } = require('../middlewares/validation');
const { uploadSingle, requireFile } = require('../middlewares/upload');
const { uploadLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: The uploaded image URL
 *             publicId:
 *               type: string
 *               description: Cloudinary public ID
 *             width:
 *               type: number
 *               description: Image width in pixels
 *             height:
 *               type: number
 *               description: Image height in pixels
 *             bytes:
 *               type: number
 *               description: File size in bytes
 *             format:
 *               type: string
 *               description: Image format
 */

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (max 5MB, JPEG/PNG/WebP/GIF)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Upload limit exceeded
 */
router.post(
  '/avatar',
  authenticate,
  uploadLimiter,
  uploadSingle('image'),
  requireFile,
  uploadAvatar
);

/**
 * @swagger
 * /api/upload/post/{postId}:
 *   post:
 *     summary: Upload featured image for a post
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Post image file (max 5MB, JPEG/PNG/WebP/GIF)
 *     responses:
 *       200:
 *         description: Post image uploaded successfully
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not the post author
 *       404:
 *         description: Post not found
 *       429:
 *         description: Upload limit exceeded
 */
router.post(
  '/post/:postId',
  authenticate,
  uploadLimiter,
  validateObjectId('postId'),
  uploadSingle('image'),
  requireFile,
  uploadPostImage
);

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a general image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB, JPEG/PNG/WebP/GIF)
 *               folder:
 *                 type: string
 *                 description: Upload folder name (optional)
 *                 default: general
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: Invalid file or validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Upload limit exceeded
 */
router.post(
  '/image',
  authenticate,
  uploadLimiter,
  uploadSingle('image'),
  requireFile,
  uploadGeneralImage
);

/**
 * @swagger
 * /api/upload/delete:
 *   delete:
 *     summary: Delete an uploaded image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Full URL of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: Invalid image URL
 *       401:
 *         description: Unauthorized
 */
router.delete('/delete', authenticate, deleteImage);

/**
 * @swagger
 * /api/upload/info:
 *   post:
 *     summary: Get information about an uploaded file (without saving)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to analyze
 *     responses:
 *       200:
 *         description: File info retrieved successfully
 *       400:
 *         description: No file provided or invalid file
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/info',
  authenticate,
  uploadSingle('image'),
  getImageInfo
);

module.exports = router;