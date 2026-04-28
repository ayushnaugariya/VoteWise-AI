# ============================================
# VoteWise AI - Cloud Run Dockerfile
# Multi-stage production build
# ============================================

# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Environment
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run listens on 8080
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start server
CMD ["node", "server/index.js"]
