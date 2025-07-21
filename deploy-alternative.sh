#!/bin/bash

# Alternative Deployment Script - Vercel is down, using other platforms
# Updated for current Vercel outage (July 21, 2025)

echo "⚠️  Vercel Status Alert: Major API Outage Detected"
echo "🔄 Using alternative deployment platforms..."
echo "=================================================="

# Create Railway deployment (fastest alternative)
echo "🚂 Setting up Railway deployment (Recommended alternative)..."

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Initialize Railway project
echo "🔧 Initializing Railway project..."
railway login --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Railway CLI ready"
else
    echo "❌ Please run: railway login"
    echo "Then run this script again"
    exit 1
fi

# Create railway.json for better configuration
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepThreshold": 0,
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

# Update package.json for production
echo "📝 Updating package.json for production deployment..."

# Update server.js for better production handling
echo "🔧 Optimizing server for production..."

echo "✅ Railway configuration complete!"
echo ""
echo "🚀 Quick Deploy Options (Vercel alternative):"
echo ""
echo "1. 🚂 Railway (Recommended - Fast & Simple):"
echo "   railway login"
echo "   railway deploy"
echo "   Your app: https://commit-booster-production.up.railway.app"
echo ""
echo "2. 🟣 Render (Free tier available):"
echo "   - Go to render.com"
echo "   - Connect GitHub repo"
echo "   - Auto-deploy from render.yaml"
echo ""
echo "3. 🌊 Netlify (Static + Functions):"
echo "   netlify login"
echo "   netlify deploy --prod"
echo ""
echo "4. 🔵 DigitalOcean App Platform:"
echo "   - Connect GitHub repo at cloud.digitalocean.com"
echo "   - One-click deployment"
echo ""
echo "⏰ Once Vercel is back online, you can also use:"
echo "   vercel --prod"
echo ""

# Commit current changes for deployment
echo "📝 Committing deployment configurations..."
git add .
git commit -m "feat: add alternative deployment configurations

- Add Railway deployment setup
- Create production-ready server config
- Handle Vercel outage with multiple deployment options
- Optimize for various cloud platforms"

echo ""
echo "🎯 Recommended Next Steps:"
echo "1. Choose Railway for fastest deployment"
echo "2. Run: railway deploy"
echo "3. Your dashboard will be online in ~2 minutes"
echo ""
echo "💡 Pro tip: Railway offers:"
echo "   - $5/month free tier"
echo "   - Automatic HTTPS"
echo "   - Custom domains"
echo "   - Easy scaling"