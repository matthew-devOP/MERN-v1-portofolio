const asyncHandler = require('express-async-handler');
const commentService = require('../services/commentService');

const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.createComment({
    ...req.body,
    postId: req.body.postId || req.params.postId,
  }, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: { comment },
  });
});

const getPostComments = asyncHandler(async (req, res) => {
  const result = await commentService.getPostComments(req.params.postId, req.query);

  res.json({
    success: true,
    data: result,
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(
    req.params.id, 
    req.body, 
    req.user._id, 
    req.user.role
  );

  res.json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment },
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const result = await commentService.deleteComment(
    req.params.id, 
    req.user._id, 
    req.user.role
  );

  res.json({
    success: true,
    message: result.message,
  });
});

const toggleLike = asyncHandler(async (req, res) => {
  const comment = await commentService.toggleLike(req.params.id, req.user._id);

  res.json({
    success: true,
    message: 'Like toggled successfully',
    data: { comment },
  });
});

const getMyComments = asyncHandler(async (req, res) => {
  const result = await commentService.getMyComments(req.user._id, req.query);

  res.json({
    success: true,
    data: result,
  });
});

const moderateComment = asyncHandler(async (req, res) => {
  const { action } = req.body;
  const comment = await commentService.moderateComment(
    req.params.id, 
    action, 
    req.user._id
  );

  res.json({
    success: true,
    message: `Comment ${action}d successfully`,
    data: { comment },
  });
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const result = await commentService.getCommentReplies(req.params.id, req.query);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  createComment,
  getPostComments,
  updateComment,
  deleteComment,
  toggleLike,
  getMyComments,
  moderateComment,
  getCommentReplies,
};