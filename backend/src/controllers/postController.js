const asyncHandler = require('express-async-handler');
const postService = require('../services/postService');

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post },
  });
});

const getAllPosts = asyncHandler(async (req, res) => {
  const result = await postService.getAllPosts(
    req.query, 
    req.user?._id, 
    req.user?.role || 'user'
  );

  res.json({
    success: true,
    data: result,
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user?._id);

  res.json({
    success: true,
    data: { post },
  });
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await postService.getPostBySlug(req.params.slug, req.user?._id);

  res.json({
    success: true,
    data: { post },
  });
});

const updatePost = asyncHandler(async (req, res) => {
  // Store post for ownership check
  const existingPost = await postService.getPostById(req.params.id, req.user._id);
  req.resource = existingPost;

  const post = await postService.updatePost(
    req.params.id, 
    req.body, 
    req.user._id, 
    req.user.role
  );

  res.json({
    success: true,
    message: 'Post updated successfully',
    data: { post },
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost(
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
  const post = await postService.toggleLike(req.params.id, req.user._id);

  res.json({
    success: true,
    message: 'Like toggled successfully',
    data: { post },
  });
});

const getFeaturedPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  const posts = await postService.getFeaturedPosts(limit);

  res.json({
    success: true,
    data: { posts },
  });
});

const getPopularPosts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const posts = await postService.getPopularPosts(limit);

  res.json({
    success: true,
    data: { posts },
  });
});

const getMyPosts = asyncHandler(async (req, res) => {
  const result = await postService.getMyPosts(req.user._id, req.query);

  res.json({
    success: true,
    data: result,
  });
});

const getPostStats = asyncHandler(async (req, res) => {
  const stats = await postService.getPostStats(
    req.params.id, 
    req.user._id, 
    req.user.role
  );

  res.json({
    success: true,
    data: { stats },
  });
});

module.exports = {
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
};