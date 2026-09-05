# Node.js + Express backend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies first (better build caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the app
COPY . .

# The port your app listens on (keep in sync with .env PORT)
EXPOSE 8000

# Health check helps AWS / container orchestrators know the container is alive
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Start command
CMD ["npm", "start"]
