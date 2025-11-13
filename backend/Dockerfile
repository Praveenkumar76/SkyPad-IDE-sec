# Multi-stage Dockerfile for SkyPad-IDE backend
# This image includes Node.js and all required compilers/runtimes for code execution

FROM node:18-bullseye AS base

# Install system dependencies and compilers
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    g++ \
    gcc \
    default-jdk \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]

