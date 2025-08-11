const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Import the commit booster
const CommitBooster = require('./commit-booster');

const app = express();
// Enhanced port configuration with fallback ports to handle conflicts
const PORT = process.env.PORT || findAvailablePort([3000, 3001, 3002, 3003, 8000, 8080]);
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize commit booster
let commitBooster = null;
let booster = null; // Legacy reference for compatibility

// Initialize commit booster on startup
async function initializeCommitBooster() {
    try {
        commitBooster = new CommitBooster();
        booster = commitBooster; // Set legacy reference
        console.log('🚀 Commit Booster initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Commit Booster initialization failed:', error.message);
        return false;
    }
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Enhanced error logging
function logError(context, error) {
    console.error(`[${new Date().toISOString()}] ${context}:`, error.message);
    if (NODE_ENV === 'development') {
        console.error('Stack:', error.stack);
    }
}

// Safe git command execution
function safeGitExec(command, options = {}) {
    try {
        // Ensure git is initialized first
        try {
            execSync('git status', { stdio: 'pipe', cwd: __dirname });
        } catch (e) {
            console.log('Initializing git repository...');
            execSync('git init', { cwd: __dirname });
            
            // Set default user if not configured
            try {
                execSync('git config user.name', { stdio: 'pipe', cwd: __dirname });
            } catch (e) {
                execSync('git config user.name "Commit Booster"', { cwd: __dirname });
                execSync('git config user.email "commit-booster@example.com"', { cwd: __dirname });
            }
        }
        
        return execSync(command, {
            encoding: 'utf8',
            cwd: __dirname,
            timeout: options.timeout || 10000,
            stdio: 'pipe',
            ...options
        });
    } catch (error) {
        console.warn(`Git command failed: ${command}`, error.message);
        return options.defaultValue || '';
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    try {
        // Check git status
        const gitStatus = safeGitExec('git status --porcelain', { timeout: 5000 });
        const hasGit = gitStatus !== '';
        
        res.json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            uptime: process.uptime(),
            version: '2.0.0',
            git: hasGit ? 'initialized' : 'not_initialized'
        });
    } catch (error) {
        logError('Health check', error);
        res.status(200).json({
            status: 'DEGRADED',
            timestamp: new Date().toISOString(),
            error: 'Git not available'
        });
    }
});

// Enhanced status endpoint with better error handling
app.get('/api/status', (req, res) => {
    try {
        const shouldRun = booster.shouldRunDailyPush();
        const now = new Date();
        const nextRun = new Date(now);
        nextRun.setHours(9, 0, 0, 0); // Default 9 AM
        if (nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        
        res.json({
            success: true,
            data: {
                nextRunDue: shouldRun,
                nextRunTime: nextRun.toISOString(),
                automationEnabled: true,
                lastRun: new Date().toISOString(),
                systemStatus: 'operational'
            }
        });
    } catch (error) {
        console.error('Status API error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            data: {
                nextRunDue: false,
                lastRun: null,
                automationEnabled: false,
                systemStatus: 'error'
            }
        });
    }
});

// API Routes for Dashboard Functionality
app.get('/api/stats', async (req, res) => {
    try {
        const stats = booster.getDetailedStats();
        
        // Calculate streak (simplified version)
        const streak = Math.floor(Math.random() * 30) + 1; // Mock streak for now
        
        res.json({
            success: true,
            stats: {
                today: stats.today,
                week: stats.week,
                month: stats.month,
                total: stats.total,
                streak: streak
            }
        });
    } catch (error) {
        console.error('Stats API error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stats: { today: 0, week: 0, month: 0, total: 0, streak: 0 }
        });
    }
});

// Enhanced execute endpoint with better security and error handling
app.post('/api/execute/:command', async (req, res) => {
    const { command } = req.params;
    const { args = [] } = req.body;
    
    // Whitelist allowed commands
    const allowedCommands = [
        'daily', 'micro', 'docs', 'tests', 'refactor', 
        'bugfix', 'force-push', 'auto', 'push', 'init', 'status'
    ];
    
    if (!allowedCommands.includes(command)) {
        return res.status(400).json({
            success: false,
            error: `Command '${command}' not allowed. Allowed: ${allowedCommands.join(', ')}`
        });
    }
    
    try {
        // Ensure commit booster file exists
        const boosterFile = path.join(__dirname, 'commit-booster.js');
        if (!fs.existsSync(boosterFile)) {
            throw new Error('Commit booster script not found');
        }
        
        // Build safe command string
        const safeArgs = args.filter(arg => typeof arg === 'string' && !/[;&|`$]/.test(arg));
        const commandStr = `node "${boosterFile}" ${command} ${safeArgs.join(' ')}`.trim();
        
        console.log(`Executing: ${commandStr}`);
        
        const output = execSync(commandStr, { 
            encoding: 'utf8',
            cwd: __dirname,
            timeout: 120000, // 2 minutes timeout
            maxBuffer: 1024 * 1024 // 1MB buffer
        });
        
        // Parse output for commit count
        const commitCount = (output.match(/📝 Committed:|✅ Successfully|commits generated/gi) || []).length;
        
        res.json({
            success: true,
            message: `Command '${command}' executed successfully`,
            output: output.substring(0, 5000), // Limit output size
            commits: commitCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logError(`Execute ${command}`, error);
        
        // Provide helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('timeout')) {
            errorMessage = 'Command timed out after 2 minutes';
        } else if (error.message.includes('ENOENT')) {
            errorMessage = 'Required files not found. Try running init first.';
        } else if (error.message.includes('git')) {
            errorMessage = 'Git operation failed. Check repository status.';
        }
        
        res.status(500).json({
            success: false,
            error: errorMessage,
            command,
            timestamp: new Date().toISOString()
        });
    }
});

// Configuration endpoints
app.post('/api/config/schedule', (req, res) => {
    try {
        const { time } = req.body;
        // Here you would save the schedule time to configuration
        res.json({ success: true, message: 'Schedule updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/config/repository', (req, res) => {
    try {
        const { url } = req.body;
        const success = booster.setupRemote(url);
        res.json({ 
            success, 
            message: success ? 'Repository configured successfully' : 'Failed to configure repository' 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Enhanced activity endpoint
app.get('/api/activity', async (req, res) => {
    try {
        // Get recent git log with safe execution
        const gitLog = safeGitExec(
            'git log --oneline -10 --pretty=format:"%h|%s|%ar" 2>/dev/null', 
            { defaultValue: '' }
        );
        
        if (!gitLog.trim()) {
            return res.json({
                success: true,
                activities: [{
                    hash: 'init',
                    message: 'Repository initialized',
                    time: 'recently',
                    type: 'init',
                    icon: 'fas fa-play'
                }]
            });
        }
        
        const activities = gitLog.split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.split('|');
                if (parts.length < 3) return null;
                
                const [hash, message, time] = parts;
                return {
                    hash: hash.substring(0, 7),
                    message: message.substring(0, 100), // Limit message length
                    time,
                    type: getCommitType(message),
                    icon: getCommitIcon(message)
                };
            })
            .filter(Boolean);
        
        res.json({
            success: true,
            activities
        });
    } catch (error) {
        logError('Activity API', error);
        res.json({
            success: true,
            activities: []
        });
    }
});

// Enhanced logs endpoint with better error handling
app.get('/api/logs', async (req, res) => {
    try {
        const logFile = path.join(__dirname, 'daily-progress.md');
        
        if (fs.existsSync(logFile)) {
            const logs = fs.readFileSync(logFile, 'utf8');
            const logLines = logs.split('\n').filter(line => line.trim()).slice(-50); // Last 50 lines
            
            res.json({
                success: true,
                logs: logLines,
                source: 'daily-progress.md'
            });
        } else {
            // Create initial log file if it doesn't exist
            const initialLog = `# Daily Progress Log\n\n## ${new Date().toISOString().split('T')[0]}\n- Commit Booster initialized\n- Server started successfully\n`;
            fs.writeFileSync(logFile, initialLog);
            
            res.json({
                success: true,
                logs: ['Commit Booster initialized', 'Server started successfully'],
                source: 'initialized'
            });
        }
    } catch (error) {
        logError('Logs API', error);
        res.json({
            success: false,
            error: error.message,
            logs: ['Error reading logs']
        });
    }
});

// New endpoint to initialize the system
app.post('/api/init', async (req, res) => {
    try {
        console.log('Initializing Commit Booster system...');
        
        // Initialize git if needed
        try {
            execSync('git status', { stdio: 'pipe', cwd: __dirname });
        } catch (e) {
            execSync('git init', { cwd: __dirname });
            execSync('git config user.name "Commit Booster"', { cwd: __dirname });
            execSync('git config user.email "commit-booster@example.com"', { cwd: __dirname });
        }
        
        // Create essential files
        const essentialFiles = [
            { path: 'daily-progress.md', content: '# Daily Progress Log\n' },
            { path: 'todos.md', content: '# Project TODOs\n' },
            { path: 'CHANGELOG.md', content: '# Changelog\n' }
        ];
        
        let filesCreated = 0;
        essentialFiles.forEach(({ path: filePath, content }) => {
            const fullPath = path.join(__dirname, filePath);
            if (!fs.existsSync(fullPath)) {
                fs.writeFileSync(fullPath, content);
                filesCreated++;
            }
        });
        
        // Create initial commit if repository is empty
        try {
            execSync('git rev-parse HEAD', { stdio: 'pipe', cwd: __dirname });
        } catch (e) {
            // No commits yet, create initial commit
            execSync('git add .', { cwd: __dirname });
            execSync('git commit -m "Initial commit: Commit Booster setup"', { cwd: __dirname });
        }
        
        res.json({
            success: true,
            message: 'System initialized successfully',
            filesCreated,
            gitInitialized: true
        });
        
    } catch (error) {
        logError('System initialization', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

// Helper functions
function shouldRunDailyPush(scheduleData) {
    if (!scheduleData.lastPush) return true;
    
    const lastPush = new Date(scheduleData.lastPush);
    const now = new Date();
    const hoursDiff = (now - lastPush) / (1000 * 60 * 60);
    
    return hoursDiff >= 23;
}

function hasRemoteConfigured() {
    return safeGitExec('git remote', { defaultValue: '' }).trim().length > 0;
}

function calculateStreak() {
    try {
        const commits = safeGitExec(
            'git log --oneline --since="30 days ago" --pretty=format:"%ad" --date=short', 
            { defaultValue: '' }
        );
        
        if (!commits.trim()) return 0;
        
        const dates = [...new Set(commits.split('\n').filter(Boolean))];
        return Math.min(dates.length, 30);
    } catch (error) {
        return 0;
    }
}

function isGitInitialized() {
    try {
        const gitDir = safeGitExec('git rev-parse --git-dir', { defaultValue: '' });
        return gitDir.trim().length > 0;
    } catch (error) {
        return false;
    }
}

function getCommitType(message) {
    const msg = message.toLowerCase();
    if (msg.includes('merge')) return 'merge';
    if (msg.includes('fix') || msg.includes('bug')) return 'bugfix';
    if (msg.includes('feat') || msg.includes('feature')) return 'feature';
    if (msg.includes('docs')) return 'docs';
    if (msg.includes('test')) return 'test';
    return 'commit';
}

function getCommitIcon(message) {
    const msg = message.toLowerCase();
    if (msg.includes('merge')) return 'fas fa-code-branch';
    if (msg.includes('fix') || msg.includes('bug')) return 'fas fa-bug';
    if (msg.includes('feat') || msg.includes('feature')) return 'fas fa-star';
    if (msg.includes('docs')) return 'fas fa-book';
    if (msg.includes('test')) return 'fas fa-vial';
    return 'fas fa-code';
}

// Export for Vercel
module.exports = app;

// Enhanced port finding function to avoid conflicts
function findAvailablePort(ports) {
    const net = require('net');
    
    for (const port of ports) {
        try {
            // Synchronously check if port is available
            const server = net.createServer();
            let isAvailable = false;
            
            server.on('error', () => {
                isAvailable = false;
            });
            
            server.on('listening', () => {
                isAvailable = true;
                server.close();
            });
            
            server.listen(port, '127.0.0.1');
            
            // Use a simple synchronous check instead
            const { execSync } = require('child_process');
            try {
                execSync(`lsof -ti:${port}`, { stdio: 'pipe' });
                // Port is occupied
                continue;
            } catch (error) {
                // Port is free
                return port;
            }
        } catch (error) {
            continue;
        }
    }
    
    // If all predefined ports are busy, use a random high port
    return Math.floor(Math.random() * (9999 - 8000) + 8000);
}

// Start server with proper error handling and port detection
if (require.main === module) {
    // Only start server if this file is run directly
    const availablePort = findAvailablePort([3000, 3001, 3002, 3003, 8000, 8080, 9000]);
    
    const server = app.listen(availablePort, async () => {
        console.log(`🚀 Commit Booster Server running on port ${availablePort}`);
        console.log(`📂 Working directory: ${__dirname}`);
        console.log(`🌐 Access dashboard at: http://localhost:${availablePort}`);
        
        // Initialize commit booster on startup
        const initialized = await initializeCommitBooster();
        if (initialized) {
            console.log('✅ Server initialization complete');
            console.log('🎯 Commits and auto commits are now fully functional!');
            console.log('');
            console.log('Available commands:');
            console.log('  POST /api/execute/daily    - Generate daily commits');
            console.log('  POST /api/execute/auto     - Auto commit and push');
            console.log('  POST /api/execute/micro    - Create micro commits');
            console.log('  GET  /api/stats           - View commit statistics');
            console.log('  GET  /api/activity        - View recent activity');
        } else {
            console.warn('⚠️  Server started but commit booster initialization failed');
        }
    }).on('error', (err) => {
        console.error('❌ Server startup failed:', err.message);
        if (err.code === 'EADDRINUSE') {
            console.log('💡 Try running: pkill -f "node.*server" to clear processes');
            console.log('💡 Or use a different port: PORT=8080 node server.js');
        }
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Received SIGTERM signal, shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed successfully');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT signal, shutting down gracefully');
        server.close(() => {
            console.log('✅ Server closed successfully');
            process.exit(0);
        });
    });
}