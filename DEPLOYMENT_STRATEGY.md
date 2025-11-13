# SkyPad-IDE Deployment Strategy

## Executive Summary

This document outlines the deployment strategy for SkyPad-IDE, a multi-language code execution service. **The project is fundamentally incompatible with Vercel Serverless Functions** due to architectural requirements that cannot be met in a serverless environment.

---

## Problem Analysis

### Current Architecture Requirements

SkyPad-IDE requires:

1. **External Compilers & Runtimes**: The service executes code using external tools:
   - `g++` (C++ compiler)
   - `gcc` (C compiler)
   - `javac` / `java` (Java compiler and runtime)
   - `python3` (Python interpreter)
   - `node` (JavaScript runtime)

2. **Long-Running Processes**: Socket.IO connections require persistent WebSocket connections that cannot be maintained in a serverless function context.

3. **File System Operations**: Temporary file creation, compilation, and execution require a writable filesystem (`/tmp` only in serverless).

4. **Process Management**: Child processes (`child_process.exec`, `child_process.spawn`) must be spawned and managed, which has limitations in serverless environments.

### Why Vercel Serverless Functions Fail

#### ❌ Issue 1: Missing Compilers/Runtimes
- Vercel Serverless Functions only include Node.js runtime
- No `g++`, `gcc`, `javac`, or `python3` available
- Error: `ENOENT` when trying to execute these commands

#### ❌ Issue 2: File System Limitations
- Serverless functions have a read-only filesystem except `/tmp`
- `__dirname` or `process.cwd()` operations fail when trying to write outside `/tmp`
- Error: `ENOENT` when creating directories outside writable area

#### ❌ Issue 3: Socket.IO Incompatibility
- Serverless functions are stateless and short-lived
- WebSocket connections cannot persist across function invocations
- Socket.IO requires a persistent server process

#### ❌ Issue 4: Process Timeout Limits
- Vercel functions have strict execution time limits (10s on Hobby, 60s on Pro)
- Code compilation and execution can exceed these limits

---

## Code Fixes Applied

### ✅ Fixed Issues

All temporary file operations now use `os.tmpdir()` instead of `__dirname` or `process.cwd()`:

1. **`backend/src/codeEditorServer.js`**:
   - ✅ Replaced `path.join(__dirname, ...)` with `path.join(os.tmpdir(), ...)`
   - ✅ Added `os` import
   - ✅ Updated Java temp directory to use unique timestamped paths

2. **`backend/src/routes/problem.js`**:
   - ✅ Removed synchronous `fs.mkdirSync()` call
   - ✅ Changed from `process.cwd()` to `os.tmpdir()`
   - ✅ Using `fs.mkdtempSync()` to create unique temp directories per execution
   - ✅ Added proper cleanup of temp directories

3. **`backend/src/server.js`**:
   - ✅ Already correctly using `os.tmpdir()` in most places

These fixes ensure compatibility with containerized deployments, but **do not resolve the fundamental incompatibility with Vercel**.

---

## Recommended Deployment Solution

### Minimum Viable Architecture Shift

**Use containerization (Docker) and deploy to a platform that supports:**
- Custom runtime environments
- Persistent processes
- Arbitrary code execution
- WebSocket support

### Recommended Platforms

#### 1. **Google Cloud Run** ⭐ (Recommended)

**Why:**
- Serverless containers with WebSocket support
- Scales to zero, pay-per-use pricing
- Supports long-running processes
- Built-in health checks and auto-scaling

**Requirements:**
- Dockerfile (provided)
- Google Cloud SDK installed locally
- Google Cloud Project

**Deployment Steps:**
```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/skypad-ide

# Deploy to Cloud Run
gcloud run deploy skypad-ide \
  --image gcr.io/PROJECT_ID/skypad-ide \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

**Cost:** ~$0.40 per million requests, free tier includes 2 million requests/month

---

#### 2. **Render** ⭐ (Easiest)

**Why:**
- Simple deployment from GitHub
- Docker support out of the box
- Free tier available (with limitations)
- Automatic SSL and health checks

**Deployment Steps:**
1. Connect GitHub repository to Render
2. Select "Web Service"
3. Use Dockerfile at `backend/Dockerfile`
4. Set build command: `docker build -t skypad-ide .`
5. Set start command: (handled by Dockerfile)

**Configuration:**
- Instance Type: Standard (2GB RAM, 1 vCPU)
- Health Check Path: `/api/health`

**Cost:** Free tier available, $7/month for Standard tier

---

#### 3. **AWS ECS with Fargate**

**Why:**
- Production-grade container orchestration
- Full control over infrastructure
- Excellent for high-scale deployments

**Requirements:**
- AWS CLI configured
- ECR (Elastic Container Registry) for images
- ECS cluster and service configuration

**Deployment Steps:**
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker build -t skypad-ide .
docker tag skypad-ide:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skypad-ide:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/skypad-ide:latest

# Create ECS service (use AWS Console or Terraform)
```

**Cost:** ~$15-30/month for minimal setup

---

#### 4. **DigitalOcean App Platform**

**Why:**
- Simple deployment
- Good developer experience
- Predictable pricing

**Deployment:**
- Connect GitHub repository
- Select Dockerfile option
- Configure environment variables

**Cost:** ~$12/month for Basic plan

---

## Dockerfile Overview

The provided `backend/Dockerfile` includes:

- **Base Image**: Node.js 18 on Debian Bullseye
- **Compilers & Runtimes**:
  - `python3` and `python3-pip`
  - `g++` and `gcc` (C/C++ compilers)
  - `default-jdk` (Java Development Kit)
  - `build-essential` (additional build tools)

- **Optimizations**:
  - Multi-stage build support
  - Production dependencies only
  - Health check endpoint
  - Proper port exposure

---

## Environment Variables Required

Ensure these environment variables are set in your deployment platform:

```bash
# Database
MONGODB_URI=mongodb://...

# Server
PORT=8080
NODE_ENV=production

# CORS
CORS_ORIGINS=https://your-frontend-domain.com
FRONTEND_ORIGIN=https://your-frontend-domain.com

# JWT
JWT_SECRET=your-secret-key

# OAuth (if using)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Migration Checklist

- [x] Fix all `tmpdir` usage to use `os.tmpdir()`
- [x] Remove synchronous filesystem calls
- [x] Create Dockerfile with all dependencies
- [ ] Choose deployment platform
- [ ] Set up container registry (if needed)
- [ ] Configure environment variables
- [ ] Update frontend API endpoints
- [ ] Test WebSocket connections
- [ ] Set up monitoring and logging
- [ ] Configure domain and SSL

---

## Testing Deployment

After deployment, verify:

1. **Health Check**: `GET /api/health` returns `200 OK`
2. **Code Execution**: Test each language:
   - JavaScript: Should execute inline
   - Python: Should spawn process and execute
   - C++: Should compile with `g++` and execute
   - Java: Should compile with `javac` and execute
   - C: Should compile with `gcc` and execute
3. **WebSocket**: Connect to Socket.IO endpoint and verify real-time features
4. **File System**: Verify temp files are created in `/tmp` and cleaned up

---

## Security Considerations

⚠️ **Important**: Code execution services are high-risk. Consider:

1. **Sandboxing**: Use Docker containers or additional sandboxing for user code execution
2. **Resource Limits**: Set CPU and memory limits per execution
3. **Timeout Enforcement**: Ensure all processes are killed after timeout
4. **Network Isolation**: Prevent executed code from accessing internal network
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Input Validation**: Validate and sanitize all code inputs

---

## Conclusion

**Vercel Serverless Functions cannot support this architecture.** The minimum viable solution requires:

1. ✅ **Containerization** (Dockerfile provided)
2. ✅ **Platform with persistent processes** (Cloud Run, Render, ECS, etc.)
3. ✅ **File system fixes** (completed)

**Recommended Path Forward:**
1. Deploy to **Google Cloud Run** or **Render** for easiest migration
2. Use the provided Dockerfile
3. Update frontend to point to new backend URL
4. Monitor and scale as needed

---

## Support & Resources

- Dockerfile: `backend/Dockerfile`
- Docker ignore: `backend/.dockerignore`
- Deployment examples: See platform-specific documentation in this repo

For questions or issues, refer to platform-specific documentation or the project maintainers.

