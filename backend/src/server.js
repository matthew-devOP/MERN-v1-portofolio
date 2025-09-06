const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');
const logger = require('./config/logger');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception! Shutting down...', {
    error: err.name,
    message: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Connect to database and Redis
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional - server will work without Redis)
    await connectRedis().catch((error) => {
      logger.warn('Redis connection failed, continuing without caching:', error.message);
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Start the server
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      logger.error('Unhandled Rejection! Shutting down...', {
        error: err.name,
        message: err.message,
        stack: err.stack,
      });
      
      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        try {
          // Close Redis connection
          await closeRedis();
          
          // Close MongoDB connection
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          
          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 10 seconds');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();