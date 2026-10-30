# Multi-stage Dockerfile for CampusX Full-Stack Application

# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy built frontend assets from stage 1 into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port (Render, Cloud Run, AWS, Railway use PORT env)
EXPOSE 5000

# Start unified production server
CMD ["node", "server/index.js"]
