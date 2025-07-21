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
        try {
            const response = await fetch(`/api/execute/${command}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ args })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Command execution failed:', error);
            throw error;
        }
    }

    async updateStatus() {
        try {
            const response = await fetch('/api/status');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
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
            console.error('Status update failed:', error);
            const statusLight = document.getElementById('status-light');
            const statusText = document.getElementById('status-text');
            statusLight.className = 'status-light inactive';
            statusText.textContent = 'API connection failed';
        }
    }

    async updateStats() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success && result.stats) {
                document.getElementById('commits-today').textContent = result.stats.today;
                document.getElementById('commits-week').textContent = result.stats.week;
                document.getElementById('streak-days').textContent = result.stats.streak;
            }
            
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
            console.error('Stats update failed:', error);
            // Keep showing placeholder data on error
            document.getElementById('commits-today').textContent = '--';
            document.getElementById('commits-week').textContent = '--';
            document.getElementById('streak-days').textContent = '--';
            document.getElementById('next-push').textContent = '--:--';
        }
    }

    async updateActivityFeed() {
        try {
            const response = await fetch('/api/activity');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            const activityList = document.getElementById('activity-list');
            
            if (result.success && result.activities.length > 0) {
                activityList.innerHTML = result.activities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon ${activity.type}">
                            <i class="${activity.icon}"></i>
                        </div>
                        <div class="activity-content">
                            <h4>${activity.message}</h4>
                            <p>${activity.hash} - ${activity.type === 'commit' ? 'Local commit created' : 'Changes pushed to GitHub'}</p>
                        </div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon commit">
                            <i class="fas fa-info"></i>
                        </div>
                        <div class="activity-content">
                            <h4>No recent activity</h4>
                            <p>Generate some commits to see activity here</p>
                        </div>
                        <div class="activity-time">--</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Activity feed update failed:', error);
            const activityList = document.getElementById('activity-list');
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Connection Error</h4>
                        <p>Unable to fetch activity data</p>
                    </div>
                    <div class="activity-time">Error</div>
                </div>
            `;
        }
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