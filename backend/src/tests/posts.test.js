const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User');
const Post = require('../models/Post');

let mongoServer;
let authToken;
let userId;

describe('Posts API', () => {
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
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clean up posts before each test
    await Post.deleteMany({});
  });

  describe('POST /api/posts', () => {
    const validPostData = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content with enough characters to meet the minimum requirement.',
      excerpt: 'This is a test excerpt',
      category: 'technology',
      tags: ['javascript', 'testing'],
      published: true,
    };

    it('should create a new post successfully', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validPostData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.data.post.title).toBe(validPostData.title);
      expect(response.body.data.post.author).toBe(userId);
      expect(response.body.data.post.slug).toBeDefined();

      // Check if post was created in database
      const post = await Post.findOne({ title: validPostData.title });
      expect(post).toBeTruthy();
      expect(post.author.toString()).toBe(userId);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send(validPostData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid title', async () => {
      const invalidData = { ...validPostData, title: 'x' };
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing content', async () => {
      const invalidData = { ...validPostData };
      delete invalidData.content;
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should create post as draft when published is false', async () => {
      const draftData = { ...validPostData, published: false };
      
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(draftData)
        .expect(201);

      expect(response.body.data.post.published).toBe(false);
      expect(response.body.data.post.publishedAt).toBeNull();
    });
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      // Create test posts
      const posts = [
        {
          title: 'Published Post 1',
          content: 'Content for published post 1',
          author: userId,
          published: true,
          publishedAt: new Date(),
          createdAt: new Date(Date.now() - 2000),
        },
        {
          title: 'Published Post 2',
          content: 'Content for published post 2',
          author: userId,
          published: true,
          publishedAt: new Date(),
          createdAt: new Date(Date.now() - 1000),
        },
        {
          title: 'Draft Post',
          content: 'Content for draft post',
          author: userId,
          published: false,
          createdAt: new Date(),
        },
      ];

      await Post.insertMany(posts);
    });

    it('should return only published posts for unauthenticated users', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(2);
      expect(response.body.data.posts.every(post => post.published)).toBe(true);
    });

    it('should return posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toHaveLength(1);
      expect(response.body.data.pagination).toEqual({
        currentPage: 1,
        totalPages: 2,
        totalPosts: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return posts sorted by publication date (newest first)', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      const posts = response.body.data.posts;
      expect(new Date(posts[0].createdAt).getTime()).toBeGreaterThan(
        new Date(posts[1].createdAt).getTime()
      );
    });
  });

  describe('GET /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Test Post',
        content: 'Test content',
        author: userId,
        published: true,
        publishedAt: new Date(),
      });
    });

    it('should return specific post by ID', async () => {
      const response = await request(app)
        .get(`/api/posts/${testPost._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe('Test Post');
      expect(response.body.data.post.author.username).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/posts/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 404 for unpublished post when not authenticated', async () => {
      const draftPost = await Post.create({
        title: 'Draft Post',
        content: 'Draft content',
        author: userId,
        published: false,
      });

      const response = await request(app)
        .get(`/api/posts/${draftPost._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Original Title',
        content: 'Original content',
        author: userId,
        published: false,
      });
    });

    it('should update post successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content with enough characters',
        published: true,
      };

      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.title).toBe('Updated Title');
      expect(response.body.data.post.published).toBe(true);
      expect(response.body.data.post.publishedAt).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/posts/${testPost._id}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to update another user\'s post', async () => {
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
        .put(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    let testPost;

    beforeEach(async () => {
      testPost = await Post.create({
        title: 'Post to Delete',
        content: 'Content to delete',
        author: userId,
        published: true,
      });
    });

    it('should delete post successfully', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post deleted successfully');

      // Check if post was deleted from database
      const deletedPost = await Post.findById(testPost._id);
      expect(deletedPost).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/posts/${testPost._id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 when trying to delete another user\'s post', async () => {
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
        .delete(`/api/posts/${testPost._id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});