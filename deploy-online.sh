#!/bin/bash

# Online Deployment Script for Commit Booster Dashboard
# This script helps deploy the dashboard to various cloud platforms

echo "🌐 Commit Booster - Online Deployment Setup"
echo "==========================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes. Committing them first..."
    git add .
    git commit -m "Prepare for online deployment

- Add deployment configurations
- Update server for production
- Prepare for cloud hosting"
fi

echo "✅ Repository is clean"

# Create deployment configurations
echo ""
echo "🔧 Creating deployment configurations..."

# Create Vercel configuration
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "commit-booster-dashboard",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

# Create Netlify configuration
cat > netlify.toml << 'EOF'
[build]
  publish = "frontend"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
EOF

# Create Railway configuration
cat > railway.toml << 'EOF'
[build]
  builder = "NIXPACKS"

[deploy]
  numReplicas = 1
  sleepThreshold = 0
  restartPolicyType = "ON_FAILURE"

[[services]]
  name = "commit-booster-dashboard"
  source = "."
  
[services.variables]
  NODE_ENV = "production"
  PORT = "3000"
EOF

# Create Render configuration
cat > render.yaml << 'EOF'
services:
  - type: web
    name: commit-booster-dashboard
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
EOF

# Create Heroku Procfile
cat > Procfile << 'EOF'
web: node server.js
EOF

echo "✅ Deployment configurations created"

# Show deployment options
echo ""
echo "🚀 Choose your deployment platform:"
echo ""
echo "1. 🔷 Vercel (Recommended - Free tier available)"
echo "   - Best for: Frontend + API"
echo "   - Deploy: npx vercel --prod"
echo "   - URL: https://your-project.vercel.app"
echo ""
echo "2. 🟢 Netlify (Good for static + functions)"
echo "   - Best for: JAMstack apps"
echo "   - Deploy: npx netlify deploy --prod"
echo "   - URL: https://your-project.netlify.app"
echo ""
echo "3. 🚂 Railway (Simple Node.js hosting)"
echo "   - Best for: Full-stack apps"
echo "   - Deploy: railway login && railway deploy"
echo "   - URL: https://your-project.railway.app"
echo ""
echo "4. 🟣 Render (Free tier for small apps)"
echo "   - Best for: Simple Node.js apps"
echo "   - Deploy: Connect GitHub repo"
echo "   - URL: https://your-project.onrender.com"
echo ""
echo "5. 🟪 Heroku (Classic PaaS)"
echo "   - Best for: Traditional deployment"
echo "   - Deploy: git push heroku main"
echo "   - URL: https://your-app.herokuapp.com"
echo ""

read -p "Enter your choice (1-5): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
    1)
        echo "🔷 Setting up Vercel deployment..."
        echo ""
        echo "📋 Next steps for Vercel:"
        echo "1. Install Vercel CLI: npm i -g vercel"
        echo "2. Login: vercel login"
        echo "3. Deploy: vercel --prod"
        echo "4. Your dashboard will be live at: https://commit-booster-dashboard.vercel.app"
        echo ""
        echo "🎯 Auto-deployment setup:"
        echo "- Connect your GitHub repo to Vercel"
        echo "- Every push to main branch will auto-deploy"
        ;;
    2)
        echo "🟢 Setting up Netlify deployment..."
        echo ""
        echo "📋 Next steps for Netlify:"
        echo "1. Install Netlify CLI: npm i -g netlify-cli"
        echo "2. Login: netlify login"
        echo "3. Deploy: netlify deploy --prod --dir=frontend"
        echo "4. Your dashboard will be live at: https://commit-booster.netlify.app"
        ;;
    3)
        echo "🚂 Setting up Railway deployment..."
        echo ""
        echo "📋 Next steps for Railway:"
        echo "1. Install Railway CLI: npm i -g @railway/cli"
        echo "2. Login: railway login"
        echo "3. Deploy: railway deploy"
        echo "4. Your dashboard will be live at: https://commit-booster.railway.app"
        ;;
    4)
        echo "🟣 Setting up Render deployment..."
        echo ""
        echo "📋 Next steps for Render:"
        echo "1. Push code to GitHub"
        echo "2. Go to render.com and connect your repo"
        echo "3. Render will auto-deploy using render.yaml"
        echo "4. Your dashboard will be live at: https://commit-booster.onrender.com"
        ;;
    5)
        echo "🟪 Setting up Heroku deployment..."
        echo ""
        echo "📋 Next steps for Heroku:"
        echo "1. Install Heroku CLI: brew tap heroku/brew && brew install heroku"
        echo "2. Login: heroku login"
        echo "3. Create app: heroku create commit-booster-dashboard"
        echo "4. Deploy: git push heroku main"
        echo "5. Your dashboard will be live at: https://commit-booster-dashboard.herokuapp.com"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📝 Don't forget to:"
echo "- Update your repository URL in the dashboard"
echo "- Set environment variables if needed"
echo "- Test the online deployment"
echo ""
echo "🎉 Deployment configuration complete!"