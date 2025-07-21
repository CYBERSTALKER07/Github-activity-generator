#!/bin/bash

# Quick Repository Setup Script
echo "🔗 GitHub Repository Setup Helper"
echo "=================================="
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: commit-booster (or your preferred name)"
echo "3. Description: Automated daily commit booster"
echo "4. Set to Public or Private (your choice)"
echo "5. DO NOT initialize with README, .gitignore, or license"
echo "6. Click 'Create repository'"
echo ""
echo "Then come back here and enter your repository URL:"
echo ""

read -p "Enter your GitHub repository URL: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    echo "❌ No URL provided. Please run this script again."
    exit 1
fi

echo ""
echo "🔄 Setting up repository..."

# Use the commit booster setup command
node commit-booster.js setup-remote "$REPO_URL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Repository setup complete!"
    echo "🎯 Next steps:"
    echo "   - Test: npm run auto"
    echo "   - Enable automation: npm run setup-automation"
    echo "   - Check status: npm run status"
else
    echo ""
    echo "❌ Setup failed. Please check:"
    echo "   - Repository URL is correct"
    echo "   - Repository exists and you have access"
    echo "   - You're logged into git with the right account"
fi