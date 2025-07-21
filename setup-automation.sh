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

# Unload existing agent if it exists
if [ -f "$LAUNCH_AGENTS_DIR/$PLIST_FILE" ]; then
    echo "🔄 Unloading existing LaunchAgent..."
    launchctl unload "$LAUNCH_AGENTS_DIR/$PLIST_FILE" 2>/dev/null || true
fi

cp "$PLIST_FILE" "$LAUNCH_AGENTS_DIR/"

echo "📋 LaunchAgent installed to: $LAUNCH_AGENTS_DIR/$PLIST_FILE"

# Load the LaunchAgent with better error handling
echo "⏳ Loading LaunchAgent..."
if launchctl load "$LAUNCH_AGENTS_DIR/$PLIST_FILE" 2>/dev/null; then
    echo "✅ LaunchAgent loaded successfully!"
else
    echo "⚠️  LaunchAgent load had issues, trying bootstrap method..."
    # Try with bootstrap for newer macOS versions
    if launchctl bootstrap gui/$(id -u) "$LAUNCH_AGENTS_DIR/$PLIST_FILE" 2>/dev/null; then
        echo "✅ LaunchAgent bootstrapped successfully!"
    else
        echo "⚠️  LaunchAgent may have loading issues, but configuration is complete."
        echo "💡 You can manually test with: launchctl start com.user.commit-booster.daily"
    fi
fi

echo ""
echo "✅ Daily automation setup complete!"
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
echo "   Manual:  launchctl start com.user.commit-booster.daily"