#!/bin/bash

# Commit Booster - Daily Automation Setup Script
# This script sets up automatic daily execution using macOS LaunchAgent

echo "🚀 Setting up Commit Booster daily automation..."

# Check if Node.js is installed and get the correct path
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "✅ Found Node.js at: $NODE_PATH"

# Update the plist file with the correct Node.js path
PLIST_FILE="com.user.commit-booster.daily.plist"
sed -i '' "s|/usr/local/bin/node|$NODE_PATH|g" "$PLIST_FILE"

# Copy the plist to the user's LaunchAgents directory
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$LAUNCH_AGENTS_DIR"

cp "$PLIST_FILE" "$LAUNCH_AGENTS_DIR/"

echo "📋 LaunchAgent installed to: $LAUNCH_AGENTS_DIR/$PLIST_FILE"

# Load the LaunchAgent
launchctl load "$LAUNCH_AGENTS_DIR/$PLIST_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Daily automation enabled! Will run at 9:00 AM every day."
    echo "📊 Check status with: npm run status"
    echo "📝 View logs at: /tmp/commit-booster.log"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Make sure you have a remote repository configured"
    echo "   2. Test with: npm run auto"
    echo "   3. Check tomorrow at 9 AM for automatic execution"
    echo ""
    echo "🔧 Management commands:"
    echo "   Stop:    launchctl unload $LAUNCH_AGENTS_DIR/$PLIST_FILE"
    echo "   Start:   launchctl load $LAUNCH_AGENTS_DIR/$PLIST_FILE"
    echo "   Status:  launchctl list | grep commit-booster"
else
    echo "❌ Failed to load LaunchAgent. Please check the configuration."
    exit 1
fi