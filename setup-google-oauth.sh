#!/bin/bash

# SkyPad-IDE Google OAuth Setup Script
# This script helps set up the environment files for Google OAuth

echo "🚀 SkyPad-IDE Google OAuth Setup"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 This script will help you set up Google OAuth for SkyPad-IDE"
echo ""

# Backend setup
echo "🔧 Setting up backend environment..."
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/env.example" ]; then
        cp backend/env.example backend/.env
        echo "✅ Created backend/.env from template"
    else
        echo "❌ Error: backend/env.example not found"
        exit 1
    fi
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend setup
echo "🔧 Setting up frontend environment..."
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/env.example" ]; then
        cp frontend/env.example frontend/.env
        echo "✅ Created frontend/.env from template"
    else
        echo "❌ Error: frontend/env.example not found"
        exit 1
    fi
else
    echo "⚠️  frontend/.env already exists, skipping..."
fi

echo ""
echo "📝 Next steps:"
echo "1. Go to Google Cloud Console: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google+ API"
echo "4. Create OAuth 2.0 credentials"
echo "5. Add these URLs to your OAuth client:"
echo "   - Authorized JavaScript origins: http://localhost:5173"
echo "   - Authorized redirect URIs: http://localhost:5000/api/auth/google/callback"
echo "6. Copy your Client ID and Client Secret"
echo "7. Update backend/.env with your Google OAuth credentials"
echo "8. Update frontend/.env with your Google Client ID"
echo ""
echo "📖 For detailed instructions, see: GOOGLE_OAUTH_SETUP_GUIDE.md"
echo ""
echo "🎉 Setup complete! Don't forget to configure your Google OAuth credentials."
