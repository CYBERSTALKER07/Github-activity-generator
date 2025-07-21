const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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
app.get('/api/status', async (req, res) => {
    try {
        const scheduleFile = path.join(__dirname, 'last-push.json');
        let scheduleData = {};
        
        // Safely read schedule file
        try {
            if (fs.existsSync(scheduleFile)) {
                const fileContent = fs.readFileSync(scheduleFile, 'utf8');
                scheduleData = JSON.parse(fileContent);
            }
        } catch (parseError) {
            console.warn('Schedule file parsing failed:', parseError.message);
            scheduleData = {};
        }
        
        // Check remote configuration
        const hasRemote = hasRemoteConfigured();
        
        res.json({
            success: true,
            data: {
                isConfigured: fs.existsSync(scheduleFile),
                lastRun: scheduleData.lastPush || null,
                totalRuns: scheduleData.totalRuns || 0,
                nextRunDue: shouldRunDailyPush(scheduleData),
                remoteConfigured: hasRemote,
                gitInitialized: isGitInitialized()
            }
        });
    } catch (error) {
        logError('Status API', error);
        res.json({
            success: false,
            error: 'Status check failed',
            data: {
                isConfigured: false,
                lastRun: null,
                totalRuns: 0,
                nextRunDue: true,
                remoteConfigured: false,
                gitInitialized: false
            }
        });
    }
});

// Enhanced stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        // Get git statistics with safe execution
        const today = parseInt(safeGitExec('git log --oneline --since="1 day ago" | wc -l', { 
            defaultValue: '0' 
        }).trim()) || 0;
        
        const week = parseInt(safeGitExec('git log --oneline --since="1 week ago" | wc -l', { 
            defaultValue: '0' 
        }).trim()) || 0;
        
        const month = parseInt(safeGitExec('git log --oneline --since="1 month ago" | wc -l', { 
            defaultValue: '0' 
        }).trim()) || 0;
        
        const total = parseInt(safeGitExec('git rev-list --count HEAD 2>/dev/null', { 
            defaultValue: '0' 
        }).trim()) || 0;
        
        res.json({
            success: true,
            stats: {
                today,
                week,
                month,
                total,
                streak: calculateStreak()
            }
        });
    } catch (error) {
        logError('Stats API', error);
        res.json({
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

// Start server only if not in serverless environment
if (NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Commit Booster Dashboard running on port ${PORT}`);
        console.log(`🌍 Environment: ${NODE_ENV}`);
        if (NODE_ENV === 'development') {
            console.log(`📊 Local Dashboard: http://localhost:${PORT}`);
        }
        console.log(`🔌 API Base: /api`);
        console.log(`❤️  Health Check: /health`);
    });
}