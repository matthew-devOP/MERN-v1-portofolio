# Multi-stage build for Node.js backend
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and set permissions
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Switch to non-root user
USER node

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./

# Install dependencies
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci && npm cache clean --force
COPY --chown=node:node . .
EXPOSE 5000
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage for production
FROM dependencies AS build
COPY --chown=node:node . .

# Production stage
FROM base AS production

# Copy production dependencies
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules

# Copy application files
COPY --chown=node:node . .

# Create logs directory
RUN mkdir -p logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { \
    if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } \
  }).on('error', () => { process.exit(1); });"

# Expose port
EXPOSE 5000

# Start the application
CMD ["dumb-init", "npm", "start"]