const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    }),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('user', 'admin').default('user'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const postSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  content: Joi.string().min(10).required(),
  excerpt: Joi.string().max(300).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  category: Joi.string().max(50).optional(),
  featured: Joi.boolean().default(false),
  published: Joi.boolean().default(false),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional(),
  content: Joi.string().min(10).optional(),
  excerpt: Joi.string().max(300).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
  category: Joi.string().max(50).optional(),
  featured: Joi.boolean().optional(),
  published: Joi.boolean().optional(),
});

const commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
  postId: Joi.string().hex().length(24).required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  bio: Joi.string().max(500).optional(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title', 'updatedAt', '-updatedAt').default('-createdAt'),
  search: Joi.string().max(100).optional(),
  category: Joi.string().max(50).optional(),
  tags: Joi.string().max(200).optional(),
  published: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  postSchema,
  updatePostSchema,
  commentSchema,
  updateProfileSchema,
  paginationSchema,
};