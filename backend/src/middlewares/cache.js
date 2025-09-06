const { getRedisClient } = require('../config/redis');
const logger = require('../config/logger');

const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    try {
      // Create cache key from URL and user ID (if authenticated)
      const userId = req.user ? req.user._id.toString() : 'anonymous';
      const cacheKey = `cache:${userId}:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await redisClient.get(cacheKey);

      if (cachedResponse) {
        logger.debug(`Cache hit for key: ${cacheKey}`);
        const parsedResponse = JSON.parse(cachedResponse);
        return res.status(parsedResponse.status).json(parsedResponse.data);
      }

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const responseData = {
            status: res.statusCode,
            data: data,
          };

          // Cache the response
          redisClient.setEx(cacheKey, duration, JSON.stringify(responseData))
            .then(() => {
              logger.debug(`Cached response for key: ${cacheKey}`);
            })
            .catch((error) => {
              logger.error('Cache set error:', error);
            });
        }

        // Call original json method
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    const redisClient = getRedisClient();
    if (!redisClient) {
      return next();
    }

    try {
      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to invalidate cache after successful response
      res.json = function(data) {
        // Only invalidate cache for successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Invalidate cache pattern
          redisClient.keys(pattern)
            .then((keys) => {
              if (keys.length > 0) {
                return redisClient.del(keys);
              }
            })
            .then(() => {
              logger.debug(`Invalidated cache for pattern: ${pattern}`);
            })
            .catch((error) => {
              logger.error('Cache invalidation error:', error);
            });
        }

        // Call original json method
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache invalidation middleware error:', error);
      next();
    }
  };
};

// Cache middleware for posts
const cachePostsList = cache(300); // 5 minutes
const cachePost = cache(600); // 10 minutes

// Invalidate cache patterns
const invalidatePostsCache = invalidateCache('cache:*:/api/posts*');
const invalidatePostCache = (req) => invalidateCache(`cache:*:/api/posts/${req.params.id}*`);

module.exports = {
  cache,
  invalidateCache,
  cachePostsList,
  cachePost,
  invalidatePostsCache,
  invalidatePostCache,
};