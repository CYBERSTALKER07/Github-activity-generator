#!/bin/bash

# Commit Booster Deployment Script
# This script handles the complete deployment and setup of the commit booster

set -e  # Exit on any error

echo "🚀 Deploying Commit Booster..."
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check Git
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git found: $(git --version)"

# Initialize git repository if needed
echo ""
echo "🔧 Setting up Git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "📝 Initializing git repository..."
    git init
    
    # Set default user if not configured
    if ! git config user.name > /dev/null 2>&1; then
        echo "⚙️  Setting default git user..."
        git config user.name "Commit Booster"
        echo "💡 Remember to set your email: git config user.email \"your-email@example.com\""
    fi
else
    echo "✅ Git repository already initialized"
fi

# Check if remote is configured
echo ""
echo "🌐 Checking remote repository..."
if git remote | grep -q "origin"; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ Remote already configured: $REMOTE_URL"
else
    echo "⚠️  No remote repository configured"
    echo "💡 You can add one later with: node commit-booster.js setup-remote <url>"
fi

# Set executable permissions
echo ""
echo "🔒 Setting permissions..."
chmod +x commit-booster.js
chmod +x setup-automation.sh

# Test the basic functionality
echo ""
echo "🧪 Testing functionality..."
echo "Running initial test..."

if node commit-booster.js status; then
    echo "✅ Basic functionality test passed"
else
    echo "⚠️  Status check had issues, but continuing deployment"
fi

# Offer automation setup
echo ""
echo "🤖 Automation Setup Options:"
echo "1. Set up macOS LaunchAgent (recommended)"
echo "2. Manual cron job setup"
echo "3. Skip automation (run manually)"
echo ""

read -p "Choose option (1-3): " AUTOMATION_CHOICE

case $AUTOMATION_CHOICE in
    1)
        echo "Setting up LaunchAgent automation..."
        if ./setup-automation.sh; then
            echo "✅ LaunchAgent automation configured successfully!"
        else
            echo "❌ LaunchAgent setup failed. You can try manual setup later."
        fi
        ;;
    2)
        echo "📋 Manual cron job setup:"
        echo "Run: crontab -e"
        echo "Add this line:"
        echo "0 9 * * * cd \"$(pwd)\" && $(which node) commit-booster.js auto >> /tmp/commit-booster.log 2>&1"
        ;;
    3)
        echo "⏩ Skipping automation setup"
        ;;
    *)
        echo "Invalid choice. Skipping automation setup."
        ;;
esac

# Create initial commit
echo ""
echo "📝 Creating deployment commit..."
if git add . && git commit -m "Deploy: Set up commit booster automation system

- Initialize commit automation framework
- Add daily scheduling capabilities
- Configure push automation
- Set up comprehensive logging
- Deploy complete automation suite"; then
    echo "✅ Deployment commit created"
else
    echo "ℹ️  No changes to commit or already committed"
fi

# Display final status and instructions
echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""
echo "📊 System Status:"
node commit-booster.js status
echo ""
echo "🎯 Next Steps:"
echo "1. Configure remote repository (if not done):"
echo "   node commit-booster.js setup-remote https://github.com/username/repo.git"
echo ""
echo "2. Test automation:"
echo "   npm run auto"
echo ""
echo "3. Check logs:"
echo "   tail -f /tmp/commit-booster.log"
echo ""
echo "4. View available commands:"
echo "   node commit-booster.js"
echo ""
echo "🔄 Daily automation will run at 9:00 AM if configured"
echo "📈 Your GitHub contribution graph will start showing activity!"
echo ""
echo "💡 Pro tip: Run 'npm run force-push' to test immediately"