const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must be at least 1 character'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required'],
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: [true, 'Post is required'],
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isApproved: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isApproved: 1 });
commentSchema.index({ isDeleted: 1 });

// Virtual for likes count
commentSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual for replies (child comments)
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

// Pre-save middleware
commentSchema.pre('save', function(next) {
  // Set editedAt when content is modified (except for first save)
  if (this.isModified('content') && !this.isNew) {
    this.edited = true;
    this.editedAt = new Date();
  }
  
  next();
});

// Method to toggle like
commentSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  } else {
    this.likes.push({ user: userId });
  }
  
  return this.save({ validateBeforeSave: false });
};

// Method to soft delete
commentSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

// Static method to get comments for a post
commentSchema.statics.getPostComments = function(postId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = '-createdAt',
    includeReplies = true,
  } = options;

  const query = {
    post: postId,
    isDeleted: false,
    isApproved: true,
    parent: null, // Only top-level comments
  };

  let commentsQuery = this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .sort(sort)
    .limit(limit)
    .skip((page - 1) * limit);

  if (includeReplies) {
    commentsQuery = commentsQuery.populate({
      path: 'replies',
      match: { isDeleted: false, isApproved: true },
      populate: {
        path: 'author',
        select: 'username firstName lastName avatar',
      },
      options: { sort: { createdAt: 1 } },
    });
  }

  return commentsQuery;
};

// Static method to get comment count for a post
commentSchema.statics.getPostCommentCount = function(postId) {
  return this.countDocuments({
    post: postId,
    isDeleted: false,
    isApproved: true,
  });
};

module.exports = mongoose.model('Comment', commentSchema);