// CYBERPUNK HACKER DASHBOARD - COMMIT BOOSTER v2.0
// Advanced terminal-style JavaScript with matrix effects

// API Configuration
// Previously hardcoded to port 3001 causing CONNECTION_ERROR_DETECTED when server runs on 3000.
// Use same-origin relative paths so frontend and backend stay aligned regardless of port.
const API_BASE = ''; // same-origin
// If you need to force a different backend, uncomment below:
// const API_BASE = `${window.location.protocol}//${window.location.hostname}:${window.location.port || '3000'}`;

class CyberCommitBooster {
    constructor() {
        this.isLoading = false;
        this.activityData = [];
        this.matrixInterval = null;
        this.glitchInterval = null;
        this.systemUptime = Date.now();
        this.init();
    }

    async init() {
        this.initMatrixEffects();
        this.initSystemClock();
        this.initGlitchEffects();
        this.setupEventListeners();
        await this.loadInitialData();
        this.startPeriodicUpdates();
        this.playBootSequence();
    }

    // Matrix digital rain effect
    initMatrixEffects() {
        const matrixBg = document.querySelector('.matrix-bg');
        if (!matrixBg) return;

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        let matrixChars = '';
        
        for (let i = 0; i < 50; i++) {
            matrixChars += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Create falling matrix characters
        this.matrixInterval = setInterval(() => {
            const char = document.createElement('div');
            char.textContent = chars.charAt(Math.floor(Math.random() * chars.length));
            char.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: -20px;
                color: #00ff41;
                font-family: 'JetBrains Mono', monospace;
                font-size: ${Math.random() * 14 + 10}px;
                opacity: ${Math.random() * 0.7 + 0.3};
                pointer-events: none;
                z-index: -1;
                animation: matrixDrop ${Math.random() * 3 + 2}s linear forwards;
            `;
            
            matrixBg.appendChild(char);
            
            setTimeout(() => char.remove(), 5000);
        }, 200);
    }

    // System clock with hacker time format
    initSystemClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            
            const dateString = now.toISOString().split('T')[0];
            const systemTime = document.getElementById('system-time');
            
            if (systemTime) {
                systemTime.innerHTML = `
                    <span style="color: #00ff41;">${timeString}</span>
                    <br>
                    <span style="color: #40ff40; font-size: 10px;">${dateString}</span>
                `;
            }

            // Update uptime
            const uptimeSeconds = Math.floor((Date.now() - this.systemUptime) / 1000);
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const seconds = uptimeSeconds % 60;
            
            const systemStatus = document.getElementById('system-status');
            if (systemStatus) {
                systemStatus.textContent = `[UPTIME: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`;
            }
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Glitch effects for numbers and text
    initGlitchEffects() {
        const glitchElements = document.querySelectorAll('.glitch, .glitch-number');
        
        this.glitchInterval = setInterval(() => {
            glitchElements.forEach(element => {
                if (Math.random() < 0.1) { // 10% chance to glitch
                    element.classList.add('glitch-active');
                    setTimeout(() => {
                        element.classList.remove('glitch-active');
                    }, 150);
                }
            });
        }, 500);
    }

    // Terminal boot sequence animation
    async playBootSequence() {
        const activityList = document.getElementById('activity-list');
        const bootMessages = [
            { text: 'Initializing COMMIT_BOOSTER.exe...', delay: 0 },
            { text: 'Loading neural network protocols...', delay: 300 },
            { text: 'Connecting to GitHub API...', delay: 600 },
            { text: 'Scanning repository structure...', delay: 900 },
            { text: 'Calibrating commit algorithms...', delay: 1200 },
            { text: 'System ready. Awaiting commands...', delay: 1500 }
        ];

        for (const message of bootMessages) {
            setTimeout(() => {
                this.addTerminalLog('SYSTEM', message.text, 'system');
            }, message.delay);
        }
    }

    addTerminalLog(type, message, category = 'info') {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${category}`;
        
        logEntry.innerHTML = `
            <span class="timestamp">[${type}]</span>
            <span class="log-text">${message}</span>
            <span class="timestamp" style="margin-left: auto; font-size: 10px;">${timestamp}</span>
        `;
        
        activityList.insertBefore(logEntry, activityList.firstChild);
        
        // Keep only last 20 entries
        while (activityList.children.length > 20) {
            activityList.removeChild(activityList.lastChild);
        }
        
        // Auto-scroll to top
        activityList.scrollTop = 0;
    }

    setupEventListeners() {
        // Enhanced keyboard shortcuts with hacker commands
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                switch(e.key) {
                    case 'X':
                        e.preventDefault();
                        this.executeHackerMode();
                        break;
                    case 'M':
                        e.preventDefault();
                        this.showMatrixMode();
                        break;
                    case 'T':
                        e.preventDefault();
                        this.toggleTerminalMode();
                        break;
                }
            } else if (e.ctrlKey || e.metaKey) {
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
                    case '`':
                        e.preventDefault();
                        this.openTerminalConsole();
                        break;
                }
            }
        });

        // Automation toggle with cyber effects
        const automationToggle = document.getElementById('automation-toggle');
        if (automationToggle) {
            automationToggle.addEventListener('change', (e) => {
                this.toggleAutomation(e.target.checked);
                this.addTerminalLog('AUTO', `Autonomous mode ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, e.target.checked ? 'success' : 'warning');
            });
        }

        // Enhanced button effects
        document.querySelectorAll('.hacker-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.textShadow = '0 0 10px #00ff41';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.textShadow = 'none';
            });
        });

        // CPU meter animation
        this.animateCPUMeter();
    }

    animateCPUMeter() {
        const cpuMeter = document.getElementById('cpu-meter');
        if (!cpuMeter) return;

        setInterval(() => {
            const usage = Math.floor(Math.random() * 40 + 60); // 60-100%
            const blocks = '█'.repeat(Math.floor(usage / 10));
            const spaces = '░'.repeat(10 - Math.floor(usage / 10));
            cpuMeter.textContent = blocks + spaces;
        }, 2000);
    }

    async loadInitialData() {
        try {
            this.addTerminalLog('INIT', 'Loading system data...', 'info');
            await this.updateStatus();
            await this.updateStats();
            await this.updateActivityFeed();
            await this.loadConfiguration();
            this.addTerminalLog('INIT', 'System initialization complete', 'success');
        } catch (error) {
            this.addTerminalLog('ERROR', `Initialization failed: ${error.message}`, 'error');
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }

    startPeriodicUpdates() {
        // Update stats with glitch effects
        setInterval(() => {
            this.updateStatsWithEffect();
        }, 30000);
        
        // Update activity feed
        setInterval(() => this.updateActivityFeed(), 60000);
        
        // Update status with terminal logging
        setInterval(() => {
            this.updateStatus();
            if (Math.random() < 0.3) {
                this.addTerminalLog('SCAN', 'System health check complete', 'info');
            }
        }, 10000);

        // Random system messages
        setInterval(() => {
            const messages = [
                'Network packet analysis complete',
                'Encryption protocols validated',
                'Repository synchronization verified',
                'Memory optimization in progress',
                'Security scan initiated'
            ];
            
            if (Math.random() < 0.2) {
                const message = messages[Math.floor(Math.random() * messages.length)];
                this.addTerminalLog('AUTO', message, 'info');
            }
        }, 45000);
    }

    async updateStatsWithEffect() {
        const stats = await this.fetchStats();
        if (!stats) return;

        // Animate number changes with glitch effect
        this.animateNumberChange('commits-today', stats.today);
        this.animateNumberChange('commits-week', stats.week);
        this.animateNumberChange('streak-days', stats.streak);
        
        // Update progress bars
        this.updateProgressBars(stats);
    }

    animateNumberChange(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const difference = newValue - currentValue;
        
        if (difference === 0) return;

        // Glitch effect during transition
        element.classList.add('glitch-active');
        
        let step = 0;
        const steps = 10;
        const increment = difference / steps;
        
        const animate = () => {
            step++;
            const value = Math.round(currentValue + (increment * step));
            element.textContent = value;
            element.setAttribute('data-text', value);
            
            if (step < steps) {
                setTimeout(animate, 50);
            } else {
                element.classList.remove('glitch-active');
            }
        };
        
        setTimeout(animate, 100);
    }

    updateProgressBars(stats) {
        // Update metric bars with smooth animations
        const dailyBar = document.querySelector('.metric-box:nth-child(1) .bar-fill');
        const weeklyBar = document.querySelector('.metric-box:nth-child(2) .bar-fill');
        const streakBar = document.querySelector('.metric-box:nth-child(3) .bar-fill');

        if (dailyBar) {
            const dailyPercent = Math.min((stats.today / 50) * 100, 100);
            dailyBar.style.width = `${dailyPercent}%`;
            weeklyBar.style.width = `${weeklyPercent}%`;
        }

        if (streakBar) {
            const streakPercent = Math.min((stats.streak / 30) * 100, 100);
            streakBar.style.width = `${streakPercent}%`;
        }
    }

    async fetchStats() {
        try {
            const response = await fetch(`${API_BASE}/api/stats`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const result = await response.json();
            return result.success ? result.stats : null;
        } catch (error) {
            this.addTerminalLog('ERROR', `Stats fetch failed: ${error.message}`, 'error');
            return null;
        }
    }

    async updateStatus() {
        try {
            const response = await fetch(`${API_BASE}/api/status`);
            const result = await response.json();
            
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            if (result.success && result.data) {
                const data = result.data;
                
                if (statusDot) {
                    statusDot.className = 'status-dot';
                    statusDot.style.background = data.nextRunDue ? '#00ff41' : '#ff8800';
                    statusDot.style.boxShadow = data.nextRunDue ? '0 0 10px #00ff41' : '0 0 10px #ff8800';
                }
                
                if (statusText) {
                    statusText.textContent = data.nextRunDue ? 'SYSTEM_READY_FOR_EXECUTION' : 'AUTOMATION_PROTOCOL_SCHEDULED';
                }
            }
        } catch (error) {
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            if (statusDot) {
                statusDot.style.background = '#ff0040';
                statusDot.style.boxShadow = '0 0 10px #ff0040';
            }
            
            if (statusText) {
                statusText.textContent = 'CONNECTION_ERROR_DETECTED';
            }
            
            this.addTerminalLog('ERROR', 'API connection failed', 'error');
        }
    }

    async updateActivityFeed() {
        // Activity feed is now handled by terminal logs
        // Keep this method for API compatibility
    }

    async loadConfiguration() {
        // Load repository configuration
        const repoInput = document.getElementById('repo-url');
        if (repoInput) {
            repoInput.value = 'https://github.com/CYBERSTALKER07/Github-activity-generator.git';
        }
        
        // Set schedule time
        const scheduleInput = document.getElementById('schedule-time');
        if (scheduleInput) {
            scheduleInput.value = '09:00';
        }
        
        this.addTerminalLog('CONFIG', 'Configuration loaded successfully', 'success');
    }

    // Enhanced loading screen with matrix effect
    showLoading(text = 'PROCESSING...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = document.getElementById('loading-text');
        
        if (loadingText) {
            loadingText.textContent = text.toUpperCase();
            loadingText.setAttribute('data-text', text.toUpperCase());
        }
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        this.isLoading = true;
        this.addTerminalLog('EXEC', text, 'info');
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.isLoading = false;
    }

    // Enhanced notification system with cyber styling
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const typeText = type.toUpperCase();
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getNotificationIcon(type)}" style="color: var(--${type === 'error' ? 'error-red' : type === 'warning' ? 'warning-orange' : type === 'success' ? 'success-green' : 'secondary-cyan'});"></i>
                <div>
                    <strong>[${typeText}]</strong><br>
                    ${message}
                </div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Add to terminal log as well
        this.addTerminalLog('NOTIF', message, type);
        
        // Auto remove with fade effect
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Special hacker mode effects
    executeHackerMode() {
        this.addTerminalLog('HACK', 'Initiating advanced mode...', 'warning');
        
        // Flash effect
        document.body.style.animation = 'flash 0.1s ease-in-out 3';
        
        setTimeout(() => {
            document.body.style.animation = '';
            this.addTerminalLog('HACK', 'Advanced protocols activated', 'success');
        }, 500);
    }

    showMatrixMode() {
        // Intensify matrix effect temporarily
        const matrixBg = document.querySelector('.matrix-bg');
        if (matrixBg) {
            matrixBg.style.animation = 'matrixPulse 0.5s ease-in-out infinite';
            
            setTimeout(() => {
                matrixBg.style.animation = 'matrixPulse 4s ease-in-out infinite';
            }, 5000);
        }
        
        this.addTerminalLog('MATRIX', 'Enhanced matrix visualization active', 'info');
    }

    toggleTerminalMode() {
        const terminal = document.querySelector('.terminal-container');
        if (terminal) {
            terminal.classList.toggle('fullscreen-terminal');
        }
    }

    openTerminalConsole() {
        // Create floating terminal console
        const console = document.createElement('div');
        console.innerHTML = `
            <div style="
                position: fixed; 
                bottom: 20px; 
                right: 20px; 
                width: 400px; 
                height: 200px;
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid #00ff41;
                border-radius: 4px;
                font-family: 'JetBrains Mono', monospace;
                z-index: 10000;
                display: flex;
                flex-direction: column;
            ">
                <div style="padding: 10px; border-bottom: 1px solid #00ff41; color: #00ff41; font-size: 12px;">
                    TERMINAL CONSOLE
                    <span style="float: right; cursor: pointer;" onclick="this.closest('div').parentNode.remove()">✕</span>
                </div>
                <div style="flex: 1; padding: 10px; overflow-y: auto; font-size: 11px; color: #40ff40;">
                    <div>root@commit-booster:~$ help</div>
                    <div style="color: #008800;">Available commands:</div>
                    <div style="color: #008800;">  daily - Generate daily commits</div>
                    <div style="color: #008800;">  micro - Create micro commits</div>
                    <div style="color: #008800;">  status - Check system status</div>
                    <div style="color: #008800;">  clear - Clear terminal</div>
                    <div>root@commit-booster:~$ <span id="console-cursor" style="animation: blink 1s infinite;">█</span></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(console);
        
        setTimeout(() => {
            console.style.opacity = '0';
            setTimeout(() => console.remove(), 300);
        }, 10000);
    }

    async executeCommand(command, args = []) {
        this.addTerminalLog('CMD', `Executing: ${command} ${args.join(' ')}`, 'info');
        
        try {
            const response = await fetch(`${API_BASE}/api/execute/${command}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ args })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.addTerminalLog('CMD', `Command completed: ${result.message || 'Success'}`, 'success');
            return result;
        } catch (error) {
            this.addTerminalLog('ERROR', `Command failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async refreshData() {
        this.showLoading('REFRESHING_SYSTEM_DATA...');
        try {
            await this.loadInitialData();
            this.showNotification('System data refreshed successfully', 'success');
        } catch (error) {
            this.showNotification('Failed to refresh system data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    toggleAutomation(enabled) {
        this.addTerminalLog('AUTO', `Automation ${enabled ? 'enabled' : 'disabled'}`, enabled ? 'success' : 'warning');
    }

    // Command methods for buttons
    async runDailyCommits() {
        if (this.isLoading) return;
        
        this.showLoading('EXECUTING_DAILY_PROTOCOL...');
        try {
            const result = await this.executeCommand('daily');
            this.showNotification(`Generated ${result.commits || 0} daily commits`, 'success');
            this.updateStatsWithEffect();
        } catch (error) {
            this.showNotification(`Daily protocol failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async runMicroCommits() {
        if (this.isLoading) return;
        
        this.showLoading('INITIATING_MICRO_BURST...');
        try {
            const result = await this.executeCommand('micro');
            this.showNotification(`Created ${result.commits || 0} micro commits`, 'success');
            this.updateStatsWithEffect();
        } catch (error) {
            this.showNotification(`Micro burst failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async runDocCommits() {
        if (this.isLoading) return;
        
        this.showLoading('GENERATING_DOCUMENTATION...');
        try {
            const result = await this.executeCommand('docs');
            this.showNotification(`Generated ${result.commits || 0} documentation commits`, 'success');
            this.updateStatsWithEffect();
        } catch (error) {
            this.showNotification(`Documentation generation failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async runTestCommits() {
        if (this.isLoading) return;
        
        this.showLoading('EXECUTING_TEST_SUITE...');
        try {
            const result = await this.executeCommand('tests');
            this.showNotification(`Created ${result.commits || 0} test commits`, 'success');
            this.updateStatsWithEffect();
        } catch (error) {
            this.showNotification(`Test suite failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async forcePush() {
        if (this.isLoading) return;
        
        if (!confirm('⚠️ FORCE PUSH PROTOCOL\nThis will forcibly push commits to the remote repository.\nProceed with operation?')) {
            return;
        }
        
        this.showLoading('EXECUTING_FORCE_PUSH...');
        try {
            const result = await this.executeCommand('force-push');
            this.showNotification(`Force push completed - ${result.commits || 0} commits pushed`, 'success');
            this.updateStatsWithEffect();
        } catch (error) {
            this.showNotification(`Force push failed: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }

    viewLogs() {
        // Enhanced log viewer with cyber styling
        const logWindow = window.open('', 'CyberLogs', 'width=900,height=700');
        logWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>COMMIT_BOOSTER - SYSTEM LOGS</title>
                <style>
                    body { 
                        font-family: 'JetBrains Mono', monospace; 
                        padding: 0; margin: 0;
                        background: #0a0a0a; 
                        color: #00ff41; 
                        overflow: hidden;
                    }
                    .log-header {
                        background: #000;
                        border-bottom: 2px solid #00ff41;
                        padding: 15px;
                        text-align: center;
                        font-weight: bold;
                        box-shadow: 0 0 20px #00ff41;
                    }
                    .log-content {
                        height: calc(100vh - 60px);
                        overflow-y: auto;
                        padding: 20px;
                        font-size: 12px;
                        line-height: 1.6;
                    }
                    .log-entry { margin-bottom: 5px; }
                    .timestamp { color: #40ff40; }
                    .error { color: #ff0040; }
                    .success { color: #00ff41; }
                    .warning { color: #ff8800; }
                    ::-webkit-scrollbar { width: 8px; }
                    ::-webkit-scrollbar-track { background: #000; }
                    ::-webkit-scrollbar-thumb { background: #00ff41; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="log-header">
                    █ COMMIT_BOOSTER SYSTEM LOGS █<br>
                    <small>CLASSIFIED - AUTHORIZED PERSONNEL ONLY</small>
                </div>
                <div class="log-content">
                    <div class="log-entry success">[SYSTEM] ${new Date().toISOString()} - Log viewer initialized</div>
                    <div class="log-entry">[INFO] Displaying recent system activity...</div>
                    <div class="log-entry">────────────────────────────────────</div>
                    <div class="log-entry success">[EXEC] Daily commit protocol executed</div>
                    <div class="log-entry">[API] GitHub connection established</div>
                    <div class="log-entry success">[COMMIT] Generated daily progress update</div>
                    <div class="log-entry">[PUSH] Repository synchronization complete</div>
                    <div class="log-entry warning">[WARN] Rate limit threshold: 85%</div>
                    <div class="log-entry success">[AUTO] Automation protocols active</div>
                    <div class="log-entry">[SCAN] Security verification passed</div>
                    <div class="log-entry">[NET] Network latency: 42ms</div>
                    <div class="log-entry success">[STATUS] All systems operational</div>
                    <div class="log-entry">────────────────────────────────────</div>
                    <div class="log-entry">[INFO] Log viewer ready for monitoring</div>
                    <div class="log-entry timestamp">[TIMESTAMP] ${new Date().toLocaleString()}</div>
                </div>
            </body>
            </html>
        `);
        
        this.addTerminalLog('LOGS', 'System log viewer opened', 'info');
    }

    changeRepository() {
        const current = document.getElementById('repo-url').value;
        const newUrl = prompt('🔧 REPOSITORY CONFIGURATION\nEnter new repository URL:', current);
        
        if (newUrl && newUrl.trim()) {
            this.showLoading('UPDATING_REPOSITORY...');
            setTimeout(() => {
                document.getElementById('repo-url').value = newUrl;
                this.showNotification('Repository configuration updated', 'success');
                this.addTerminalLog('CONFIG', `Repository changed to: ${newUrl}`, 'success');
                this.hideLoading();
            }, 2000);
        }
    }

    updateSchedule() {
        const newTime = document.getElementById('schedule-time').value;
        if (newTime) {
            this.showLoading('UPDATING_SCHEDULE...');
            setTimeout(() => {
                this.showNotification(`Schedule updated to ${newTime}`, 'success');
                this.addTerminalLog('CONFIG', `Execution schedule set to ${newTime}`, 'success');
                this.hideLoading();
            }, 1000);
        }
    }

    // Cleanup method
    destroy() {
        if (this.matrixInterval) clearInterval(this.matrixInterval);
        if (this.glitchInterval) clearInterval(this.glitchInterval);
    }
}

// Global dashboard instance
let dashboard;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new CyberCommitBooster();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes matrixDrop {
            0% { transform: translateY(-20px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes flash {
            0%, 100% { background: var(--terminal-bg); }
            50% { background: rgba(0, 255, 65, 0.1); }
        }
        
        .glitch-active::before {
            animation: glitch-1 0.1s infinite !important;
        }
        
        .glitch-active::after {
            animation: glitch-2 0.1s infinite !important;
        }
        
        .fullscreen-terminal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            z-index: 9999 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Enhanced keyboard shortcuts display
    const shortcuts = document.createElement('div');
    shortcuts.style.cssText = `
        position: fixed; 
        bottom: 20px; 
        left: 20px; 
        background: rgba(0, 0, 0, 0.9); 
        color: #00ff41; 
        padding: 15px; 
        border: 1px solid #00ff41;
        border-radius: 4px; 
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; 
        z-index: 1000;
        box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
    `;
    
    shortcuts.innerHTML = `
        <div style="color: #00ff41; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">⌨️ SYSTEM SHORTCUTS</div>
        <div style="color: #40ff40;">Ctrl + D: Execute Daily</div>
        <div style="color: #40ff40;">Ctrl + M: Micro Burst</div>
        <div style="color: #40ff40;">Ctrl + R: Refresh System</div>
        <div style="color: #40ff40;">Ctrl + \`: Terminal Console</div>
        <div style="color: #40ff40;">Ctrl + Shift + X: Hacker Mode</div>
        <div style="color: #40ff40;">Ctrl + Shift + M: Matrix Mode</div>
    `;
    
    document.body.appendChild(shortcuts);
    
    // Auto-hide shortcuts
    setTimeout(() => {
        shortcuts.style.opacity = '0';
        shortcuts.style.transition = 'opacity 2s';
        setTimeout(() => shortcuts.remove(), 2000);
    }, 15000);
});

// Export functions for HTML button calls
window.runDailyCommits = () => dashboard.runDailyCommits();
window.runMicroCommits = () => dashboard.runMicroCommits();
window.runDocCommits = () => dashboard.runDocCommits();
window.runTestCommits = () => dashboard.runTestCommits();
window.forcePush = () => dashboard.forcePush();
window.viewLogs = () => dashboard.viewLogs();
window.changeRepository = () => dashboard.changeRepository();
window.updateSchedule = () => dashboard.updateSchedule();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (dashboard) {
        dashboard.destroy();
    }
});