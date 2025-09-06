const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

let mongoServer;
let authToken;
let userId;
let testPost;

describe('Comments API', () => {
  beforeAll(async () => {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get auth token
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = registerResponse.body.data.tokens.accessToken;
    userId = registerResponse.body.data.user._id;

    // Create a test post
    testPost = await Post.create({
      title: 'Test Post for Comments',
      content: 'This is a test post for testing comments',
      author: userId,
      published: true,
      publishedAt: new Date(),
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up comments before each test
    await Comment.deleteMany({});
  });

  describe('POST /api/posts/:postId/comments', () => {
    const validCommentData = {
      content: 'This is a test comment with enough content to be valid.',
    };

    it('should create a new comment successfully', async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCommentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment created successfully');
      expect(response.body.data.comment.content).toBe(validCommentData.content);
      expect(response.body.data.comment.author).toBe(userId);
      expect(response.body.data.comment.post.toString()).toBe(testPost._id.toString());

      // Check if comment was created in database
      const comment = await Comment.findOne({ content: validCommentData.content });
      expect(comment).toBeTruthy();
      expect(comment.author.toString()).toBe(userId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .send(validCommentData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/posts/${nonExistentId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(validCommentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 400 for empty content', async () => {
      const invalidData = { content: '' };
      
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for content too long', async () => {
      const invalidData = { content: 'x'.repeat(1001) };
      
      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create nested comment (reply)', async () => {
      // Create parent comment first
      const parentComment = await Comment.create({
        content: 'Parent comment',
        author: userId,
        post: testPost._id,
        isApproved: true,
      });

      const replyData = {
        content: 'This is a reply to the parent comment.',
        parent: parentComment._id,
      };

      const response = await request(app)
        .post(`/api/posts/${testPost._id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(replyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.parent.toString()).toBe(parentComment._id.toString());
    });
  });

  describe('GET /api/posts/:postId/comments', () => {
    beforeEach(async () => {
      // Create test comments
      const comments = [
        {
          content: 'First comment',
          author: userId,
          post: testPost._id,
          isApproved: true,
          createdAt: new Date(Date.now() - 3000),
        },
        {
          content: 'Second comment',
          author: userId,
          post: testPost._id,
          isApproved: true,
          createdAt: new Date(Date.now() - 2000),
        },
        {
          content: 'Unapproved comment',
          author: userId,
          post: testPost._id,
          isApproved: false,
          createdAt: new Date(Date.now() - 1000),
        },
      ];

      await Comment.insertMany(comments);
    });

    it('should return only approved comments for unauthenticated users', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comments).toHaveLength(2);
      expect(response.body.data.comments.every(comment => comment.isApproved)).toBe(true);
    });

    it('should return comments with pagination', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}/comments?page=1&limit=1`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comments).toHaveLength(1);
      expect(response.body.data.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalComments: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return comments sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}/comments`)
        .expect(200);

      const comments = response.body.data.comments;
      expect(new Date(comments[0].createdAt).getTime()).toBeGreaterThan(
        new Date(comments[1].createdAt).getTime()
      );
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/posts/${nonExistentId}/comments`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('PUT /api/comments/:id', () => {
    let testComment;

    beforeEach(async () => {
      testComment = await Comment.create({
        content: 'Original comment content',
        author: userId,
        post: testPost._id,
        isApproved: true,
      });
    });

    it('should update comment successfully', async () => {
      const updateData = {
        content: 'Updated comment content with more text to meet requirements.',
      };

      const response = await request(app)
        .put(`/api/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.comment.content).toBe(updateData.content);
      expect(response.body.data.comment.isEdited).toBe(true);
      expect(response.body.data.comment.editedAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/comments/${testComment._id}`)
        .send({ content: 'Updated content' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to update another user\'s comment', async () => {
      // Create another user
      const otherUserData = {
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Test123!@#',
        firstName: 'Other',
        lastName: 'User',
      };

      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherAuthToken = otherUserResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .put(`/api/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ content: 'Hacked comment content' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });

    it('should return 404 for non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/comments/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Updated content' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Comment not found');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let testComment;

    beforeEach(async () => {
      testComment = await Comment.create({
        content: 'Comment to delete',
        author: userId,
        post: testPost._id,
        isApproved: true,
      });
    });

    it('should soft delete comment successfully', async () => {
      const response = await request(app)
        .delete(`/api/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment deleted successfully');

      // Check if comment was soft deleted (marked as deleted, not removed)
      const deletedComment = await Comment.findById(testComment._id);
      expect(deletedComment).toBeTruthy();
      expect(deletedComment.isDeleted).toBe(true);
      expect(deletedComment.deletedAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/comments/${testComment._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to delete another user\'s comment', async () => {
      // Create another user
      const otherUserData = {
        username: 'otheruser2',
        email: 'other2@example.com',
        password: 'Test123!@#',
        firstName: 'Other',
        lastName: 'User',
      };

      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);

      const otherAuthToken = otherUserResponse.body.data.tokens.accessToken;

      const response = await request(app)
        .delete(`/api/comments/${testComment._id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/comments/:id/approve', () => {
    let testComment;

    beforeEach(async () => {
      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'Admin123!@#',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });

      const adminLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'Admin123!@#',
        });

      this.adminToken = adminLoginResponse.body.data.accessToken;

      testComment = await Comment.create({
        content: 'Comment pending approval',
        author: userId,
        post: testPost._id,
        isApproved: false,
      });
    });

    it('should approve comment successfully as admin', async () => {
      const response = await request(app)
        .post(`/api/comments/${testComment._id}/approve`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment approved successfully');

      // Check if comment was approved in database
      const approvedComment = await Comment.findById(testComment._id);
      expect(approvedComment.isApproved).toBe(true);
      expect(approvedComment.approvedAt).toBeDefined();
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post(`/api/comments/${testComment._id}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin access required');
    });

    it('should return 404 for non-existent comment', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .post(`/api/comments/${nonExistentId}/approve`)
        .set('Authorization', `Bearer ${this.adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Comment not found');
    });
  });
});