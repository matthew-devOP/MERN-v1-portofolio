const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { NotFoundError, AuthorizationError } = require('../utils/errors');
const logger = require('../config/logger');

class CommentService {
  async createComment(commentData, authorId) {
    const { content, postId, parentId = null } = commentData;

    // Check if post exists and is published
    const post = await Post.findOne({ _id: postId, published: true });
    if (!post) {
      throw new NotFoundError('Post not found or not published');
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findOne({ 
        _id: parentId, 
        post: postId, 
        isDeleted: false 
      });
      if (!parentComment) {
        throw new NotFoundError('Parent comment not found');
      }
    }

    const comment = await Comment.create({
      content,
      author: authorId,
      post: postId,
      parent: parentId,
    });

    await comment.populate('author', 'username firstName lastName avatar');

    logger.info(`New comment created on post ${postId} by ${authorId}`);

    return comment;
  }

  async getPostComments(postId, queryParams) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = queryParams;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const comments = await Comment.getPostComments(postId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      includeReplies: true,
    });

    const total = await Comment.getPostCommentCount(postId);

    return {
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
        total,
      },
    };
  }

  async updateComment(commentId, updateData, userId, userRole = 'user') {
    const comment = await Comment.findOne({ 
      _id: commentId, 
      isDeleted: false 
    }).populate('author', 'username');

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check ownership or admin privilege
    if (comment.author._id.toString() !== userId && userRole !== 'admin') {
      throw new AuthorizationError('You can only update your own comments');
    }

    // Update comment content
    comment.content = updateData.content;
    await comment.save();

    await comment.populate('author', 'username firstName lastName avatar');

    logger.info(`Comment updated: ${commentId} by ${userId}`);

    return comment;
  }

  async deleteComment(commentId, userId, userRole = 'user') {
    const comment = await Comment.findOne({ 
      _id: commentId, 
      isDeleted: false 
    }).populate('author', 'username');

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check ownership or admin privilege
    if (comment.author._id.toString() !== userId && userRole !== 'admin') {
      throw new AuthorizationError('You can only delete your own comments');
    }

    // Soft delete the comment
    await comment.softDelete();

    // Also soft delete all replies to this comment
    await Comment.updateMany(
      { parent: commentId, isDeleted: false },
      { isDeleted: true }
    );

    logger.info(`Comment deleted: ${commentId} by ${userId}`);

    return { message: 'Comment deleted successfully' };
  }

  async toggleLike(commentId, userId) {
    const comment = await Comment.findOne({ 
      _id: commentId, 
      isDeleted: false,
      isApproved: true 
    });

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    await comment.toggleLike(userId);
    await comment.populate('author', 'username firstName lastName avatar');

    return comment;
  }

  async getMyComments(userId, queryParams) {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = queryParams;

    const query = { 
      author: userId, 
      isDeleted: false 
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('post', 'title slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    return {
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
        total,
      },
    };
  }

  async moderateComment(commentId, action, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    switch (action) {
      case 'approve':
        comment.isApproved = true;
        break;
      case 'reject':
        comment.isApproved = false;
        break;
      case 'delete':
        await comment.softDelete();
        break;
      default:
        throw new ValidationError('Invalid moderation action');
    }

    if (action !== 'delete') {
      await comment.save();
    }

    logger.info(`Comment moderated: ${commentId} - ${action} by ${userId}`);

    return comment;
  }

  async getCommentReplies(commentId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
    } = queryParams;

    // Check if parent comment exists
    const parentComment = await Comment.findOne({ 
      _id: commentId, 
      isDeleted: false 
    });
    
    if (!parentComment) {
      throw new NotFoundError('Comment not found');
    }

    const query = {
      parent: commentId,
      isDeleted: false,
      isApproved: true,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const replies = await Comment.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    return {
      replies,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
        total,
      },
    };
  }
}

module.exports = new CommentService();