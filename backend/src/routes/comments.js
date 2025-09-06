const express = require('express');
const {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  toggleLike,
  getMyComments,
  moderateComment,
  getCommentReplies,
} = require('../controllers/commentController');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');
const { validate, validateObjectId } = require('../middlewares/validation');
const { commentSchema, paginationSchema } = require('../utils/validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management for blog posts
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - author
 *         - post
 *       properties:
 *         id:
 *           type: string
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 1000
 *         author:
 *           $ref: '#/components/schemas/User'
 *         post:
 *           type: string
 *         parent:
 *           type: string
 *           description: Parent comment ID for replies
 *         likes:
 *           type: array
 *           items:
 *             type: object
 *         likesCount:
 *           type: number
 *         isApproved:
 *           type: boolean
 *         edited:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/comments/my:
 *   get:
 *     summary: Get current user's comments
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: User comments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, validate(paginationSchema, 'query'), getMyComments);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - postId
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *               postId:
 *                 type: string
 *                 description: ID of the post to comment on
 *               parentId:
 *                 type: string
 *                 description: ID of parent comment for replies
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/', authenticate, validate(commentSchema), createComment);

/**
 * @swagger
 * /api/comments/post/{postId}:
 *   get:
 *     summary: Get comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: Post comments retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get('/post/:postId', validateObjectId('postId'), validate(paginationSchema, 'query'), getPostComments);

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies for a specific comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *     responses:
 *       200:
 *         description: Comment replies retrieved successfully
 *       404:
 *         description: Comment not found
 */
router.get('/:id/replies', validateObjectId('id'), validate(paginationSchema, 'query'), getCommentReplies);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Comment not found
 */
router.put('/:id', authenticate, validateObjectId('id'), validate(commentSchema), updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', authenticate, validateObjectId('id'), deleteComment);

/**
 * @swagger
 * /api/comments/{id}/like:
 *   post:
 *     summary: Toggle like on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.post('/:id/like', authenticate, validateObjectId('id'), toggleLike);

/**
 * @swagger
 * /api/comments/{id}/moderate:
 *   post:
 *     summary: Moderate a comment (Admin only)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, delete]
 *     responses:
 *       200:
 *         description: Comment moderated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Comment not found
 */
router.post('/:id/moderate', authenticate, authorize('admin'), validateObjectId('id'), moderateComment);

module.exports = router;