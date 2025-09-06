const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const logger = require('../config/logger');

class PostService {
  async createPost(postData, authorId) {
    const post = await Post.create({
      ...postData,
      author: authorId,
    });

    await post.populate('author', 'username firstName lastName avatar');
    
    logger.info(`New post created: ${post.title} by ${authorId}`);
    
    return post;
  }

  async getPostById(postId, userId = null) {
    const post = await Post.findById(postId)
      .populate('author', 'username firstName lastName avatar bio')
      .populate('commentsCount');

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user can view unpublished posts
    if (!post.published && (!userId || (post.author._id.toString() !== userId && !this.isAdmin(userId)))) {
      throw new NotFoundError('Post not found');
    }

    // Increment views for published posts
    if (post.published) {
      await post.incrementViews();
    }

    return post;
  }

  async getPostBySlug(slug, userId = null) {
    const post = await Post.findOne({ slug })
      .populate('author', 'username firstName lastName avatar bio')
      .populate('commentsCount');

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user can view unpublished posts
    if (!post.published && (!userId || (post.author._id.toString() !== userId && !this.isAdmin(userId)))) {
      throw new NotFoundError('Post not found');
    }

    // Increment views for published posts
    if (post.published) {
      await post.incrementViews();
    }

    return post;
  }

  async getAllPosts(queryParams, userId = null, userRole = 'user') {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      category,
      tags,
      published,
      featured,
      author,
    } = queryParams;

    // Build query
    const query = {};

    // Only show published posts to regular users
    if (userRole !== 'admin') {
      query.published = true;
    } else if (published !== undefined) {
      query.published = published;
    }

    // Filter by category
    if (category) {
      query.category = new RegExp(category, 'i');
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by featured
    if (featured !== undefined) {
      query.featured = featured;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts with pagination
    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('commentsCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    return {
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
        total,
      },
    };
  }

  async updatePost(postId, updateData, userId, userRole = 'user') {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership or admin privilege
    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new AuthorizationError('You can only update your own posts');
    }

    // Update post
    Object.assign(post, updateData);
    await post.save();

    await post.populate('author', 'username firstName lastName avatar');

    logger.info(`Post updated: ${post.title} by ${userId}`);

    return post;
  }

  async deletePost(postId, userId, userRole = 'user') {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership or admin privilege
    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new AuthorizationError('You can only delete your own posts');
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: postId });

    // Delete the post
    await Post.findByIdAndDelete(postId);

    logger.info(`Post deleted: ${post.title} by ${userId}`);

    return { message: 'Post deleted successfully' };
  }

  async toggleLike(postId, userId) {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (!post.published) {
      throw new NotFoundError('Post not found');
    }

    await post.toggleLike(userId);
    await post.populate('author', 'username firstName lastName avatar');

    return post;
  }

  async getFeaturedPosts(limit = 3) {
    return await Post.getFeatured(limit);
  }

  async getPopularPosts(limit = 5) {
    return await Post.getPopular(limit);
  }

  async getMyPosts(userId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      published,
    } = queryParams;

    const query = { author: userId };

    if (published !== undefined) {
      query.published = published;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('commentsCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    return {
      posts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
        total,
      },
    };
  }

  async getPostStats(postId, userId, userRole = 'user') {
    const post = await Post.findById(postId);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check ownership or admin privilege
    if (post.author.toString() !== userId && userRole !== 'admin') {
      throw new AuthorizationError('Access denied');
    }

    const stats = {
      views: post.views,
      likes: post.likesCount,
      comments: await Comment.getPostCommentCount(postId),
      published: post.published,
      featured: post.featured,
      createdAt: post.createdAt,
      publishedAt: post.publishedAt,
    };

    return stats;
  }

  isAdmin(userRole) {
    return userRole === 'admin';
  }
}

module.exports = new PostService();