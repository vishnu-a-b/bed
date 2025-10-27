#!/bin/bash

# Production Deployment Script
# Usage: ./deploy-production.sh

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT_GUIDE.md" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment Checklist${NC}"
echo ""

# Function to ask yes/no questions
ask_yes_no() {
    while true; do
        read -p "$1 (y/n): " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Pre-deployment checks
if ! ask_yes_no "Have you updated the production .env file on the server?"; then
    echo -e "${RED}❌ Deployment cancelled. Please update .env first.${NC}"
    echo "Refer to: server/.env.production"
    exit 1
fi

if ! ask_yes_no "Have you tested the changes locally?"; then
    echo -e "${YELLOW}⚠️  Warning: Deploying without local testing${NC}"
    if ! ask_yes_no "Continue anyway?"; then
        exit 1
    fi
fi

if ! ask_yes_no "Have you committed all changes to Git?"; then
    echo -e "${YELLOW}⚠️  Warning: Uncommitted changes detected${NC}"
    if ! ask_yes_no "Continue anyway?"; then
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"
echo ""

# Backend Deployment
echo -e "${YELLOW}🔧 Building Backend...${NC}"
cd server

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: server/package.json not found${NC}"
    exit 1
fi

echo "Installing dependencies..."
npm install

if [ -d "src" ]; then
    echo "Building TypeScript..."
    npm run build || {
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    }
fi

echo -e "${GREEN}✅ Backend built successfully${NC}"
echo ""

cd ..

# Frontend Deployment
echo -e "${YELLOW}🎨 Building Frontend (Static Export)...${NC}"
cd client

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: client/package.json not found${NC}"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building Next.js static export..."
npm run build || {
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
}

if [ ! -d "out" ]; then
    echo -e "${RED}❌ Error: Static export failed - 'out' directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

cd ..

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Build Completed Successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📦 Next Steps:${NC}"
echo ""
echo "1. Backend Deployment:"
echo "   - Copy server/ to production server"
echo "   - Update .env using server/.env.production as template"
echo "   - Run: pm2 restart all"
echo ""
echo "2. Frontend Deployment:"
echo "   - Deploy client/out/ to static hosting"
echo "   - Ensure it's served from: https://donate.shanthibhavan.in"
echo ""
echo "3. Testing:"
echo "   - Test payment callback: curl test in DEPLOYMENT_GUIDE.md"
echo "   - Complete end-to-end payment test"
echo "   - Verify logs: pm2 logs"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see:${NC}"
echo "   DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}🎉 Ready to deploy!${NC}"
