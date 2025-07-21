// Commit Booster Dashboard JavaScript

class CommitBoosterDashboard {
    constructor() {
        this.isLoading = false;
        this.activityData = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.startPeriodicUpdates();
    }

    setupEventListeners() {
        // Automation toggle
        const automationToggle = document.getElementById('automation-toggle');
        automationToggle.addEventListener('change', (e) => {
            this.toggleAutomation(e.target.checked);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'd':
                        e.preventDefault();
                        this.runDailyCommits();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.runMicroCommits();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshData();
                        break;
                }
            }
        });
    }

    async loadInitialData() {
        try {
            await this.updateStatus();
            await this.updateStats();
            await this.updateActivityFeed();
            await this.loadConfiguration();
        } catch (error) {
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    startPeriodicUpdates() {
        // Update stats every 30 seconds
        setInterval(() => this.updateStats(), 30000);
        
        // Update activity feed every 60 seconds
        setInterval(() => this.updateActivityFeed(), 60000);
        
        // Update status every 10 seconds
        setInterval(() => this.updateStatus(), 10000);
    }

    async executeCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            // Simulate API call to backend
            // In real implementation, this would be an HTTP request to Express server
            const commandString = `node commit-booster.js ${command} ${args.join(' ')}`.trim();
            
            // For demo purposes, simulate different responses
            setTimeout(() => {
                const responses = {
                    'status': {
                        success: true,
                        data: {
                            isConfigured: true,
                            lastRun: new Date().toISOString().split('T')[0],
                            totalRuns: Math.floor(Math.random() * 50) + 1,
                            nextRunDue: Math.random() > 0.5,
                            remoteConfigured: true
                        }
                    },
                    'daily': {
                        success: true,
                        message: 'Daily commits generated successfully',
                        commits: Math.floor(Math.random() * 3) + 2
                    },
                    'micro': {
                        success: true,
                        message: 'Micro commits created successfully',
                        commits: 4
                    },
                    'docs': {
                        success: true,
                        message: 'Documentation commits generated',
                        commits: Math.floor(Math.random() * 4) + 1
                    },
                    'tests': {
                        success: true,
                        message: 'Testing commits created',
                        commits: Math.floor(Math.random() * 3) + 1
                    },
                    'force-push': {
                        success: true,
                        message: 'Force push completed successfully',
                        commits: Math.floor(Math.random() * 5) + 1
                    }
                };

                const response = responses[command] || { success: false, error: 'Command not found' };
                
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.error || 'Command failed'));
                }
            }, Math.random() * 2000 + 500);
        });
    }

    async updateStatus() {
        try {
            const result = await this.executeCommand('status');
            const statusLight = document.getElementById('status-light');
            const statusText = document.getElementById('status-text');
            
            if (result.success) {
                const data = result.data;
                statusLight.className = 'status-light ' + (data.nextRunDue ? 'active' : 'pending');
                statusText.textContent = data.nextRunDue ? 'Ready for next push' : 'Automation scheduled';
                
                // Update automation toggle
                const toggle = document.getElementById('automation-toggle');
                toggle.checked = data.isConfigured;
            }
        } catch (error) {
            const statusLight = document.getElementById('status-light');
            const statusText = document.getElementById('status-text');
            statusLight.className = 'status-light inactive';
            statusText.textContent = 'Status check failed';
        }
    }

    async updateStats() {
        try {
            // Simulate getting git stats
            const today = Math.floor(Math.random() * 10) + 1;
            const week = today + Math.floor(Math.random() * 20) + 5;
            const streak = Math.floor(Math.random() * 30) + 1;
            
            document.getElementById('commits-today').textContent = today;
            document.getElementById('commits-week').textContent = week;
            document.getElementById('streak-days').textContent = streak;
            
            // Calculate next push time
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            
            const timeUntil = tomorrow - now;
            const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
            const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
            
            document.getElementById('next-push').textContent = 
                hoursUntil > 0 ? `${hoursUntil}h ${minutesUntil}m` : `${minutesUntil}m`;
                
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    async updateActivityFeed() {
        const activityList = document.getElementById('activity-list');
        
        // Generate sample activity data
        const activities = [
            { type: 'commit', title: 'Daily progress update', time: '2 minutes ago', icon: 'fas fa-code-branch' },
            { type: 'push', title: 'Pushed 3 commits to main', time: '5 minutes ago', icon: 'fas fa-upload' },
            { type: 'commit', title: 'Add utility functions', time: '1 hour ago', icon: 'fas fa-plus' },
            { type: 'commit', title: 'Update documentation', time: '2 hours ago', icon: 'fas fa-file-alt' },
            { type: 'push', title: 'Automated daily push', time: '1 day ago', icon: 'fas fa-robot' }
        ];
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.type === 'commit' ? 'Local commit created' : 'Changes pushed to GitHub'}</p>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    async loadConfiguration() {
        // Load current repository URL
        document.getElementById('repo-url').value = 'https://github.com/CYBERSTALKER07/Github-activity-generator.git';
        
        // Set current schedule time
        document.getElementById('schedule-time').value = '09:00';
    }

    showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        loadingText.textContent = text;
        overlay.style.display = 'flex';
        this.isLoading = true;
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'none';
        this.isLoading = false;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${message}
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async refreshData() {
        this.showLoading('Refreshing dashboard...');
        try {
            await this.loadInitialData();
            this.showNotification('Dashboard refreshed successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to refresh dashboard', 'error');
        } finally {
            this.hideLoading();
        }
    }
}

// Dashboard action functions (called by HTML buttons)
let dashboard;

async function runDailyCommits() {
    if (dashboard.isLoading) return;
    
    dashboard.showLoading('Generating daily commits...');
    try {
        const result = await dashboard.executeCommand('daily');
        dashboard.showNotification(`Generated ${result.commits} daily commits`, 'success');
        dashboard.updateActivityFeed();
        dashboard.updateStats();
    } catch (error) {
        dashboard.showNotification(`Failed to generate daily commits: ${error.message}`, 'error');
    } finally {
        dashboard.hideLoading();
    }
}

async function runMicroCommits() {
    if (dashboard.isLoading) return;
    
    dashboard.showLoading('Creating micro commits...');
    try {
        const result = await dashboard.executeCommand('micro');
        dashboard.showNotification(`Created ${result.commits} micro commits`, 'success');
        dashboard.updateActivityFeed();
        dashboard.updateStats();
    } catch (error) {
        dashboard.showNotification(`Failed to create micro commits: ${error.message}`, 'error');
    } finally {
        dashboard.hideLoading();
    }
}

async function runDocCommits() {
    if (dashboard.isLoading) return;
    
    dashboard.showLoading('Generating documentation commits...');
    try {
        const result = await dashboard.executeCommand('docs');
        dashboard.showNotification(`Generated ${result.commits} documentation commits`, 'success');
        dashboard.updateActivityFeed();
        dashboard.updateStats();
    } catch (error) {
        dashboard.showNotification(`Failed to generate documentation commits: ${error.message}`, 'error');
    } finally {
        dashboard.hideLoading();
    }
}

async function runTestCommits() {
    if (dashboard.isLoading) return;
    
    dashboard.showLoading('Creating test commits...');
    try {
        const result = await dashboard.executeCommand('tests');
        dashboard.showNotification(`Created ${result.commits} test commits`, 'success');
        dashboard.updateActivityFeed();
        dashboard.updateStats();
    } catch (error) {
        dashboard.showNotification(`Failed to create test commits: ${error.message}`, 'error');
    } finally {
        dashboard.hideLoading();
    }
}

async function forcePush() {
    if (dashboard.isLoading) return;
    
    if (!confirm('This will force push commits to your repository. Continue?')) {
        return;
    }
    
    dashboard.showLoading('Force pushing commits...');
    try {
        const result = await dashboard.executeCommand('force-push');
        dashboard.showNotification(`Force push completed - ${result.commits} commits pushed`, 'success');
        dashboard.updateActivityFeed();
        dashboard.updateStats();
    } catch (error) {
        dashboard.showNotification(`Force push failed: ${error.message}`, 'error');
    } finally {
        dashboard.hideLoading();
    }
}

async function viewLogs() {
    // Open logs in a new window/modal
    const logWindow = window.open('', 'CommitBoosterLogs', 'width=800,height=600');
    logWindow.document.write(`
        <html>
            <head><title>Commit Booster Logs</title></head>
            <body style="font-family: monospace; padding: 20px; background: #1e1e1e; color: #ffffff;">
                <h2>Commit Booster Activity Log</h2>
                <pre style="white-space: pre-wrap;">
Loading logs from /tmp/commit-booster.log...

[2025-07-21 09:00:01] 🤖 Daily automation started
[2025-07-21 09:00:02] ✅ Generated daily progress commit
[2025-07-21 09:00:03] ✅ Created todo item: Performance improvements
[2025-07-21 09:00:04] 📤 Pushing commits to remote repository
[2025-07-21 09:00:06] ✅ Successfully pushed to remote!
[2025-07-21 09:00:07] 📊 Commits today: 3

[2025-07-20 09:00:01] 🤖 Daily automation started
[2025-07-20 09:00:02] ✅ Generated daily progress commit
[2025-07-20 09:00:03] 🔄 Adding bonus micro commits
[2025-07-20 09:00:04] ✅ Created micro commit: Add utility functions
[2025-07-20 09:00:05] 📤 Pushing commits to remote repository
[2025-07-20 09:00:07] ✅ Successfully pushed to remote!
                </pre>
            </body>
        </html>
    `);
}

function changeRepository() {
    const newUrl = prompt('Enter new repository URL:', document.getElementById('repo-url').value);
    if (newUrl && newUrl.trim()) {
        dashboard.showLoading('Updating repository...');
        // Simulate repository change
        setTimeout(() => {
            document.getElementById('repo-url').value = newUrl;
            dashboard.showNotification('Repository updated successfully', 'success');
            dashboard.hideLoading();
        }, 2000);
    }
}

function updateSchedule() {
    const newTime = document.getElementById('schedule-time').value;
    if (newTime) {
        dashboard.showLoading('Updating schedule...');
        setTimeout(() => {
            dashboard.showNotification(`Schedule updated to ${newTime}`, 'success');
            dashboard.hideLoading();
        }, 1000);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new CommitBoosterDashboard();
});

// Add some keyboard shortcut hints
document.addEventListener('DOMContentLoaded', () => {
    const shortcuts = document.createElement('div');
    shortcuts.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 8px; font-size: 0.8rem; z-index: 1000;">
            <strong>Keyboard Shortcuts:</strong><br>
            Ctrl/⌘ + D: Daily Commits<br>
            Ctrl/⌘ + M: Micro Commits<br>
            Ctrl/⌘ + R: Refresh Dashboard
        </div>
    `;
    document.body.appendChild(shortcuts);
    
    // Hide after 10 seconds
    setTimeout(() => {
        shortcuts.style.opacity = '0';
        shortcuts.style.transition = 'opacity 1s';
    }, 10000);
});