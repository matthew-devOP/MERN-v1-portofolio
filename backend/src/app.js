require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Import configurations
const logger = require('./config/logger');
const { initCloudinary } = require('./config/cloudinary');

// Import middleware
const { globalErrorHandler, notFound } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

// Import Swagger
const { specs, swaggerUi, swaggerUiOptions } = require('./config/swagger');

// Initialize Express app
const app = express();

// Initialize Cloudinary
initCloudinary();

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting (apply to all routes)
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blog Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
  });
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Redirect root to API documentation
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Blog Platform API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      upload: '/api/upload',
    },
    features: [
      'JWT Authentication with Refresh Tokens',
      'Role-based Access Control (RBAC)',
      'File Upload with Cloudinary',
      'Redis Caching',
      'Rate Limiting',
      'Input Validation',
      'API Documentation with Swagger',
      'Comprehensive Error Handling',
      'Request Logging',
    ],
  });
});

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(globalErrorHandler);

module.exports = app;