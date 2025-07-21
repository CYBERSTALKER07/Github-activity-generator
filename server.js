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

// CORS middleware for development
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

// Health check endpoint for production
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// API Routes
app.get('/api/status', async (req, res) => {
    try {
        // Execute the actual commit booster status command
        const output = execSync('node commit-booster.js status', { 
            encoding: 'utf8',
            cwd: __dirname,
            timeout: 10000
        });
        
        // Parse the status output (simplified)
        const scheduleFile = path.join(__dirname, 'last-push.json');
        let scheduleData = {};
        
        if (fs.existsSync(scheduleFile)) {
            scheduleData = JSON.parse(fs.readFileSync(scheduleFile, 'utf8'));
        }
        
        res.json({
            success: true,
            data: {
                isConfigured: fs.existsSync(scheduleFile),
                lastRun: scheduleData.lastPush || null,
                totalRuns: scheduleData.totalRuns || 0,
                nextRunDue: shouldRunDailyPush(scheduleData),
                remoteConfigured: hasRemoteConfigured()
            }
        });
    } catch (error) {
        console.error('Status check failed:', error.message);
        res.status(200).json({
            success: false,
            error: error.message,
            data: {
                isConfigured: false,
                lastRun: null,
                totalRuns: 0,
                nextRunDue: true,
                remoteConfigured: false
            }
        });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        // Get actual git statistics
        const today = execSync('git log --oneline --since="1 day ago" | wc -l', { 
            encoding: 'utf8',
            cwd: __dirname
        }).trim();
        
        const week = execSync('git log --oneline --since="1 week ago" | wc -l', { 
            encoding: 'utf8',
            cwd: __dirname
        }).trim();
        
        const month = execSync('git log --oneline --since="1 month ago" | wc -l', { 
            encoding: 'utf8',
            cwd: __dirname
        }).trim();
        
        res.json({
            success: true,
            stats: {
                today: parseInt(today) || 0,
                week: parseInt(week) || 0,
                month: parseInt(month) || 0,
                streak: calculateStreak()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stats: { today: 0, week: 0, month: 0, streak: 0 }
        });
    }
});

app.post('/api/execute/:command', async (req, res) => {
    const { command } = req.params;
    const { args = [] } = req.body;
    
    // Whitelist allowed commands for security
    const allowedCommands = [
        'daily', 'micro', 'docs', 'tests', 'refactor', 
        'bugfix', 'force-push', 'auto', 'push'
    ];
    
    if (!allowedCommands.includes(command)) {
        return res.status(400).json({
            success: false,
            error: 'Command not allowed'
        });
    }
    
    try {
        const commandStr = `node commit-booster.js ${command} ${args.join(' ')}`.trim();
        const output = execSync(commandStr, { 
            encoding: 'utf8',
            cwd: __dirname,
            timeout: 60000 // 60 second timeout
        });
        
        // Count commits made (simplified parsing)
        const commitCount = (output.match(/📝 Committed:/g) || []).length;
        
        res.json({
            success: true,
            message: `Command '${command}' executed successfully`,
            output: output,
            commits: commitCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/activity', async (req, res) => {
    try {
        // Get recent git log
        const gitLog = execSync('git log --oneline -10 --pretty=format:"%h|%s|%ar"', { 
            encoding: 'utf8',
            cwd: __dirname
        });
        
        const activities = gitLog.split('\n').map(line => {
            const [hash, message, time] = line.split('|');
            return {
                hash,
                message,
                time,
                type: message.toLowerCase().includes('push') ? 'push' : 'commit',
                icon: message.toLowerCase().includes('push') ? 'fas fa-upload' : 'fas fa-code-branch'
            };
        });
        
        res.json({
            success: true,
            activities
        });
    } catch (error) {
        res.json({
            success: true,
            activities: [] // Return empty array if git log fails
        });
    }
});

app.get('/api/logs', async (req, res) => {
    try {
        const logFile = '/tmp/commit-booster.log';
        if (fs.existsSync(logFile)) {
            const logs = fs.readFileSync(logFile, 'utf8');
            res.json({
                success: true,
                logs: logs.split('\n').slice(-100) // Last 100 lines
            });
        } else {
            res.json({
                success: true,
                logs: ['No logs available yet']
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
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
    try {
        const remotes = execSync('git remote', { 
            encoding: 'utf8',
            cwd: __dirname
        });
        return remotes.trim().length > 0;
    } catch (error) {
        return false;
    }
}

function calculateStreak() {
    try {
        // Simple streak calculation based on commit frequency
        const commits = execSync('git log --oneline --since="30 days ago" --pretty=format:"%ad" --date=short', { 
            encoding: 'utf8',
            cwd: __dirname
        });
        
        const dates = [...new Set(commits.split('\n').filter(Boolean))];
        return Math.min(dates.length, 30); // Max 30 day streak
    } catch (error) {
        return 0;
    }
}

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server with improved logging
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Commit Booster Dashboard running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    if (NODE_ENV === 'development') {
        console.log(`📊 Local Dashboard: http://localhost:${PORT}`);
    }
    console.log(`🔌 API Base: /api`);
    console.log(`❤️  Health Check: /health`);
});

module.exports = app;