# ==============================================================================
# Multi-stage Dockerfile for Node.js + Express Backend
# Optimized for security (non-root), minimal size, layer caching, and AWS App Runner
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Install production dependencies
# ------------------------------------------------------------------------------
FROM node:22-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies and clean npm cache to keep layer small
RUN npm ci --omit=dev && npm cache clean --force

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

# Set production environment variables
ENV NODE_ENV=production \
    PORT=8000

WORKDIR /app

# Copy production node_modules from dependencies stage with correct ownership
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules

# Copy application source files with non-root ownership
COPY --chown=node:node . .

# Run as non-root user for container security (UID 1000 provided by node:alpine)
USER node

# Expose the API port (keep aligned with PORT env var)
EXPOSE 8000

# Health check to allow container orchestrators (AWS App Runner / ECS / Docker Compose)
# to verify service availability. --start-period gives the node process time to bind.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Launch Node directly (bypassing npm wrapper so POSIX signals are handled directly)
CMD ["node", "index.js"]
