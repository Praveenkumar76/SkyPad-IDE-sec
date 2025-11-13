# Deploying to Render with Docker

## Prerequisites

1. Render account (sign up at https://render.com)
2. GitHub repository connected to Render
3. Environment variables configured

## Deployment Steps

### Option 1: Using Render Dashboard (Recommended)

1. **Create a New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**
   - **Name**: `skypad-backend`
   - **Environment**: `Docker`
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty, handled by Dockerfile)
   - **Start Command**: (leave empty, handled by Dockerfile)
   - **Plan**: `Standard` (required for Docker and sufficient resources)
   - **Instance Type**: `Standard` (2GB RAM, 1 vCPU minimum)

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=8080
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   CORS_ORIGINS=*
   FRONTEND_ORIGIN=https://your-frontend-domain.com
   ```

4. **Health Check**
   - **Health Check Path**: `/api/health`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build the Docker image and deploy

### Option 2: Using render-docker.yaml

1. **Update render-docker.yaml**
   - Update `FRONTEND_ORIGIN` with your frontend URL
   - Update `CORS_ORIGINS` if needed

2. **Deploy via CLI** (if using Render CLI)
   ```bash
   render-cli deploy -f backend/render-docker.yaml
   ```

3. **Or use the file in Render Dashboard**
   - When creating service, Render will detect `render-docker.yaml`
   - Most settings will be auto-configured

## Post-Deployment

1. **Get Service URL**
   - Render provides a URL like `https://skypad-backend.onrender.com`
   - Update your frontend to use this URL

2. **Test Deployment**
   ```bash
   curl https://skypad-backend.onrender.com/api/health
   ```

3. **Monitor Logs**
   - Use Render dashboard to view logs
   - Check for any errors during startup

## Troubleshooting

### Build Fails
- Ensure Dockerfile is at `backend/Dockerfile`
- Check that all dependencies are properly installed in Dockerfile
- Review build logs in Render dashboard

### Service Won't Start
- Check environment variables are set correctly
- Verify MongoDB connection string is valid
- Check logs for startup errors

### Code Execution Fails
- Verify compilers are installed (should be in Dockerfile)
- Check `/tmp` directory is writable
- Review execution logs for specific errors

### WebSocket Not Working
- Ensure WebSocket support is enabled (should work by default on Render)
- Check that frontend is using correct WebSocket URL
- Verify CORS settings allow your frontend domain

## Scaling

Render automatically scales based on traffic. For code execution services:

- **Recommended**: Keep at least 1 instance running
- **Auto-scaling**: Render will scale up during high traffic
- **Cost**: $7/month per standard instance

## Free Tier Limitations

The free tier on Render:
- ❌ Does not support Docker
- ❌ Has limited resources (512MB RAM)
- ❌ Spins down after inactivity (cold starts)

**Recommendation**: Use Standard plan ($7/month) for production deployment.

