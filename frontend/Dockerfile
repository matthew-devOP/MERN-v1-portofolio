# Multi-stage build for React frontend
FROM node:18-alpine AS base

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create app directory and set permissions
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app

# Switch to non-root user
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Development stage
FROM base AS development
RUN npm ci && npm cache clean --force
COPY --chown=node:node . .
EXPOSE 3000
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS build

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY --chown=node:node . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a script to substitute environment variables
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["dumb-init", "nginx", "-g", "daemon off;"]