# Quick Start: Deploying SkyPad-IDE

## Summary of Changes

✅ **Code Fixes Applied:**
- Fixed all `tmpdir` usage to use `os.tmpdir()` instead of `__dirname` or `process.cwd()`
- Removed synchronous filesystem calls
- Added proper cleanup of temporary directories

✅ **Infrastructure Created:**
- Dockerfile with all required compilers and runtimes
- Deployment configurations for Google Cloud Run and Render
- Comprehensive deployment strategy document

## Why Vercel Won't Work

Vercel Serverless Functions **cannot support** this architecture because:

1. ❌ No compilers (g++, gcc, javac) or Python interpreter
2. ❌ File system restrictions (read-only outside `/tmp`)
3. ❌ No persistent WebSocket connections (Socket.IO requires persistent server)
4. ❌ Execution timeout limits (10-60 seconds max)

**Solution: Containerized deployment on a platform that supports persistent processes.**

## Fastest Path to Deployment

### Option 1: Render (Easiest) ⭐

1. Sign up at https://render.com
2. Connect your GitHub repository
3. Create new Web Service → Select "Docker"
4. Use `backend/Dockerfile`
5. Set environment variables
6. Deploy!

**See**: `backend/deploy-render.md` for detailed steps

---

### Option 2: Google Cloud Run (Recommended for Production)

1. Install Google Cloud SDK
2. Update `backend/cloud-run-deploy.sh` with your project ID
3. Run: `bash backend/cloud-run-deploy.sh`
4. Done!

**See**: `backend/cloud-run-deploy.sh` for automated deployment

---

### Option 3: AWS ECS / DigitalOcean / Any Docker Platform

Use the provided `backend/Dockerfile` with any Docker-compatible platform.

## Files Created

```
backend/
├── Dockerfile              # Container image with all compilers
├── .dockerignore           # Files to exclude from Docker build
├── render-docker.yaml      # Render deployment config
├── cloud-run-deploy.sh     # Automated Cloud Run deployment
├── cloudbuild.yaml         # Google Cloud Build config
└── deploy-render.md        # Detailed Render deployment guide

DEPLOYMENT_STRATEGY.md      # Comprehensive deployment strategy
QUICK_START_DEPLOYMENT.md   # This file
```

## Required Environment Variables

Set these in your deployment platform:

```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-frontend.com
FRONTEND_ORIGIN=https://your-frontend.com
```

## Testing After Deployment

1. **Health Check:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Test Code Execution:**
   - JavaScript: Should work
   - Python: Should spawn and execute
   - C++: Should compile with g++ and run
   - Java: Should compile with javac and run
   - C: Should compile with gcc and run

3. **Test WebSocket:**
   - Connect to Socket.IO endpoint
   - Verify real-time code sharing works

## Next Steps

1. ✅ Choose a deployment platform (Render or Cloud Run recommended)
2. ✅ Deploy using provided Dockerfile
3. ✅ Update frontend to use new backend URL
4. ✅ Test all features
5. ✅ Monitor logs and performance

## Need Help?

- **Full Documentation**: See `DEPLOYMENT_STRATEGY.md`
- **Render Guide**: See `backend/deploy-render.md`
- **Platform-Specific**: Check platform documentation

---

**Remember**: This project requires a containerized environment. Vercel Serverless Functions will not work for this use case.

