const express = require('express');
const {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  toggleLike,
  getFeaturedPosts,
  getPopularPosts,
  getMyPosts,
  getPostStats,
} = require('../controllers/postController');
const { authenticate, authorize, optionalAuth, requireOwnership } = require('../middlewares/auth');
const { validate, validateObjectId } = require('../middlewares/validation');
const { cachePostsList, cachePost, invalidatePostsCache } = require('../middlewares/cache');
const {
  postSchema,
  updatePostSchema,
  paginationSchema,
} = require('../utils/validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Blog post management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         slug:
 *           type: string
 *           description: URL-friendly version of the title
 *         content:
 *           type: string
 *           description: The main content of the post
 *         excerpt:
 *           type: string
 *           description: Brief description of the post
 *         author:
 *           type: string
 *           description: The id of the post author
 *         category:
 *           type: string
 *           description: Post category
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Post tags
 *         published:
 *           type: boolean
 *           description: Whether the post is published
 *         featured:
 *           type: boolean
 *           description: Whether the post is featured
 *         views:
 *           type: number
 *           description: Number of views
 *         likesCount:
 *           type: number
 *           description: Number of likes
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts with pagination and filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, -createdAt, title, -title, views, -views]
 *           default: -createdAt
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and excerpt
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter featured posts
 *     responses:
 *       200:
 *         description: List of posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 */
router.get('/', optionalAuth, validate(paginationSchema, 'query'), cachePostsList, getAllPosts);

/**
 * @swagger
 * /api/posts/featured:
 *   get:
 *     summary: Get featured posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *     responses:
 *       200:
 *         description: Featured posts retrieved successfully
 */
router.get('/featured', cachePost, getFeaturedPosts);

/**
 * @swagger
 * /api/posts/popular:
 *   get:
 *     summary: Get popular posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 5
 *     responses:
 *       200:
 *         description: Popular posts retrieved successfully
 */
router.get('/popular', cachePost, getPopularPosts);

/**
 * @swagger
 * /api/posts/my:
 *   get:
 *     summary: Get current user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, validate(paginationSchema, 'query'), getMyPosts);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 minLength: 10
 *               excerpt:
 *                 type: string
 *                 maxLength: 300
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               featured:
 *                 type: boolean
 *                 default: false
 *               published:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, validate(postSchema), invalidatePostsCache, createPost);

/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Get post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Post slug
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get('/slug/:slug', optionalAuth, cachePost, getPostBySlug);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get('/:id', optionalAuth, validateObjectId('id'), cachePost, getPostById);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured:
 *                 type: boolean
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Post not found
 */
router.put('/:id', authenticate, validateObjectId('id'), validate(updatePostSchema), invalidatePostsCache, updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the author
 *       404:
 *         description: Post not found
 */
router.delete('/:id', authenticate, validateObjectId('id'), invalidatePostsCache, deletePost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Toggle like on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 */
router.post('/:id/like', authenticate, validateObjectId('id'), toggleLike);

/**
 * @swagger
 * /api/posts/{id}/stats:
 *   get:
 *     summary: Get post statistics
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Post not found
 */
router.get('/:id/stats', authenticate, validateObjectId('id'), getPostStats);

module.exports = router;