#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CommitBooster {
    constructor() {
        this.projectRoot = process.cwd();
        this.logFile = path.join(this.projectRoot, 'daily-progress.md');
        this.todosFile = path.join(this.projectRoot, 'todos.md');
        this.changelogFile = path.join(this.projectRoot, 'CHANGELOG.md');
        this.testFile = path.join(this.projectRoot, 'test.js');
        this.scheduleFile = path.join(this.projectRoot, 'last-push.json');
    }

    // Generate meaningful daily commits
    async generateDailyCommit() {
        const today = new Date().toISOString().split('T')[0];
        const activities = [
            'Code refactoring',
            'Documentation updates',
            'Bug fixes',
            'Performance improvements',
            'Code cleanup',
            'Feature enhancements',
            'Test improvements',
            'Configuration updates'
        ];

        try {
            // Initialize git if needed
            this.initGit();
            
            // Update daily progress log
            this.updateDailyLog(today);
            
            // Add a random meaningful task
            const activity = activities[Math.floor(Math.random() * activities.length)];
            this.addTodoItem(activity);
            
            // Create commits for each file
            this.commitFile(this.logFile, `Update daily progress log - ${today}`);
            this.commitFile(this.todosFile, `Add task: ${activity}`);
            
            console.log('✅ Daily commits generated successfully!');
            this.showCommitStats();
            
        } catch (error) {
            console.error('❌ Error generating commits:', error.message);
        }
    }

    updateDailyLog(date) {
        const logEntry = `\n## ${date}\n- Project maintenance and improvements\n- Code quality enhancements\n- Documentation updates\n`;
        
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '# Daily Progress Log\n');
        }
        
        fs.appendFileSync(this.logFile, logEntry);
    }

    addTodoItem(task) {
        const todoEntry = `\n- [ ] ${task} - ${new Date().toLocaleDateString()}\n`;
        
        if (!fs.existsSync(this.todosFile)) {
            fs.writeFileSync(this.todosFile, '# Project TODOs\n');
        }
        
        fs.appendFileSync(this.todosFile, todoEntry);
    }

    commitFile(filePath, message) {
        try {
            execSync(`git add "${filePath}"`, { stdio: 'pipe' });
            execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
            console.log(`📝 Committed: ${message}`);
        } catch (error) {
            // If commit fails, it might be because there are no changes
            if (!error.message.includes('nothing to commit')) {
                console.log(`ℹ️  Note: ${error.message}`);
            }
        }
    }

    // Create multiple smaller commits throughout the day
    createMicroCommits() {
        const microTasks = [
            { file: 'utils.js', task: 'Add utility functions' },
            { file: 'config.js', task: 'Update configuration' },
            { file: 'helpers.js', task: 'Add helper methods' },
            { file: 'constants.js', task: 'Define project constants' }
        ];

        microTasks.forEach(({ file, task }) => {
            this.createMicroFile(file, task);
            this.commitFile(file, task);
        });
        
        console.log('✅ Micro commits created successfully!');
    }

    createMicroFile(filename, purpose) {
        const filePath = path.join(this.projectRoot, filename);
        const timestamp = new Date().toISOString();
        
        const content = `// ${purpose}
// Updated: ${timestamp}

module.exports = {
    // TODO: Implement ${purpose.toLowerCase()}
    created: '${timestamp}',
    updated: '${timestamp}'
};
`;
        
        fs.writeFileSync(filePath, content);
    }

    showCommitStats() {
        try {
            const stats = execSync('git log --oneline --since="1 day ago" | wc -l', { 
                encoding: 'utf8',
                stdio: 'pipe'
            });
            console.log(`📊 Commits today: ${stats.trim()}`);
        } catch (error) {
            console.log('💡 Initialize git repository to track commits');
        }
    }

    // Initialize git if not already done
    initGit() {
        try {
            execSync('git status', { stdio: 'pipe' });
            console.log('✅ Git repository already initialized');
        } catch (error) {
            console.log('🔄 Initializing git repository...');
            execSync('git init', { stdio: 'inherit' });
            
            // Configure git user if not set
            try {
                execSync('git config user.name', { stdio: 'pipe' });
            } catch (e) {
                execSync('git config user.name "Commit Booster"', { stdio: 'inherit' });
                execSync('git config user.email "commit-booster@example.com"', { stdio: 'inherit' });
                console.log('✅ Git user configured');
            }
        }
    }

    // Push commits to remote repository
    async pushToRemote() {
        try {
            // Check if we have a remote configured
            const remotes = execSync('git remote', { encoding: 'utf8', stdio: 'pipe' });
            
            if (!remotes.trim()) {
                console.log('⚠️  No remote repository configured. Skipping push.');
                console.log('💡 Configure with: node commit-booster.js setup-remote <repo-url>');
                return false;
            }

            // Check if there are commits to push
            try {
                const status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
                const unpushedCommits = execSync('git log @{u}..HEAD --oneline 2>/dev/null || echo ""', { 
                    encoding: 'utf8', stdio: 'pipe' 
                }).trim();
                
                if (!unpushedCommits && !status.trim()) {
                    console.log('ℹ️  No new commits to push');
                    return true;
                }
            } catch (e) {
                // Ignore check errors, attempt push anyway
            }

            // Get current branch
            let currentBranch;
            try {
                currentBranch = execSync('git branch --show-current', { encoding: 'utf8', stdio: 'pipe' }).trim();
            } catch (e) {
                currentBranch = 'main';
            }
            
            if (!currentBranch) {
                console.log('⚠️  Not on any branch. Creating main branch...');
                execSync('git checkout -b main', { stdio: 'inherit' });
                currentBranch = 'main';
            }

            // Push to remote with retry logic
            console.log(`📤 Pushing commits to remote (${currentBranch} branch)...`);
            
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit', timeout: 60000 });
                    console.log('✅ Successfully pushed to GitHub!');
                    return true;
                } catch (pushError) {
                    if (pushError.message.includes('no upstream branch')) {
                        try {
                            execSync(`git push --set-upstream origin ${currentBranch}`, { stdio: 'inherit', timeout: 60000 });
                            console.log('✅ Successfully pushed and set upstream!');
                            return true;
                        } catch (upstreamError) {
                            console.error(`❌ Attempt ${attempt} failed:`, upstreamError.message);
                        }
                    } else {
                        console.error(`❌ Push attempt ${attempt} failed:`, pushError.message);
                        if (attempt < maxRetries) {
                            console.log(`🔄 Retrying in 5 seconds... (${attempt}/${maxRetries})`);
                            await new Promise(resolve => setTimeout(resolve, 5000));
                        }
                    }
                }
            }
            
            console.error('❌ Failed to push after all retry attempts');
            return false;
            
        } catch (error) {
            console.error('❌ Error pushing to remote:', error.message);
            return false;
        }
    }

    // Enhanced daily commit with automatic push and scheduling
    async generateDailyCommitWithPush() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            console.log('🤖 Starting daily commit generation with auto-push...');
            
            // Generate commits first
            await this.generateDailyCommit();
            
            // Add variety with micro commits occasionally
            const random = Math.random();
            if (random < 0.4) {
                console.log('🔄 Adding bonus micro commits for variety...');
                this.createMicroCommits();
            }
            
            // Push to remote
            const pushSuccess = await this.pushToRemote();
            
            if (pushSuccess) {
                // Update push schedule tracking
                this.updateLastPushDate(today);
                console.log('🚀 Daily commits generated and pushed successfully!');
                this.showCommitStats();
                this.showNextPushTime();
            } else {
                console.log('⚠️  Commits generated but push failed. Will retry later.');
            }
            
        } catch (error) {
            console.error('❌ Error in daily commit and push:', error.message);
            throw error;
        }
    }

    // Check if daily push is needed (prevents duplicate pushes)
    shouldRunDailyPush() {
        try {
            if (!fs.existsSync(this.scheduleFile)) {
                return true; // First run
            }
            
            const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            const lastPush = new Date(data.lastPush);
            const now = new Date();
            const hoursSinceLastPush = (now - lastPush) / (1000 * 60 * 60);
            
            // Allow push if more than 23 hours have passed
            return hoursSinceLastPush >= 23;
        } catch (error) {
            console.log('⚠️  Schedule check failed, assuming push needed');
            return true;
        }
    }

    // Update last push date and increment run counter
    updateLastPushDate(date) {
        try {
            let scheduleData = {};
            if (fs.existsSync(this.scheduleFile)) {
                scheduleData = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            }
            
            scheduleData.lastPush = new Date().toISOString();
            scheduleData.lastPushDate = date;
            scheduleData.totalRuns = (scheduleData.totalRuns || 0) + 1;
            
            fs.writeFileSync(this.scheduleFile, JSON.stringify(scheduleData, null, 2));
            console.log(`📅 Push scheduled updated. Total automated runs: ${scheduleData.totalRuns}`);
        } catch (error) {
            console.error('❌ Failed to update schedule:', error.message);
        }
    }

    // Show when next push is scheduled
    showNextPushTime() {
        try {
            if (!fs.existsSync(this.scheduleFile)) {
                console.log('📅 No schedule data available');
                return;
            }
            
            const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            const lastPush = new Date(data.lastPush);
            const nextPush = new Date(lastPush.getTime() + (24 * 60 * 60 * 1000));
            
            console.log(`📅 Next auto-push scheduled for: ${nextPush.toLocaleString()}`);
            console.log(`🔢 Total automated runs: ${data.totalRuns || 0}`);
        } catch (error) {
            console.log('📅 Schedule information unavailable');
        }
    }

    // Smart daily automation (checks schedule before running)
    async runDailyAutomation() {
        console.log('🤖 Starting daily automation check...');
        
        if (this.shouldRunDailyPush()) {
            console.log('⏰ Time for daily push!');
            await this.generateDailyCommitWithPush();
        } else {
            console.log('✅ Already pushed today. Next push due in ~24 hours.');
            this.showNextPushTime();
        }
    }

    // Force push (useful for testing or manual override)
    async forcePushToday() {
        console.log('⚡ Force pushing today (ignoring schedule)...');
        try {
            await this.generateDailyCommitWithPush();
            console.log('✅ Force push completed successfully!');
        } catch (error) {
            console.error('❌ Force push failed:', error.message);
        }
    }

    // Get automation status
    getAutomationStatus() {
        try {
            console.log('📊 Automation Status Report');
            console.log('==========================');
            
            if (fs.existsSync(this.scheduleFile)) {
                const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
                const lastPush = new Date(data.lastPush);
                const nextPush = new Date(lastPush.getTime() + (24 * 60 * 60 * 1000));
                const now = new Date();
                
                console.log(`Last push: ${lastPush.toLocaleString()}`);
                console.log(`Next push: ${nextPush.toLocaleString()}`);
                console.log(`Total runs: ${data.totalRuns || 0}`);
                console.log(`Status: ${now < nextPush ? '✅ On schedule' : '⏰ Push due'}`);
            } else {
                console.log('Status: 🆕 Not configured yet');
                console.log('💡 Run "npm run auto" to start automation');
            }
            
            // Check remote configuration
            const remotes = execSync('git remote', { encoding: 'utf8', stdio: 'pipe' }).trim();
            console.log(`Remote: ${remotes ? '✅ Configured' : '❌ Not configured'}`);
            
            return true;
        } catch (error) {
            console.error('❌ Status check failed:', error.message);
            return false;
        }
    }

    // Setup remote repository
    setupRemote(repoUrl) {
        try {
            // Validate repository URL format
            if (!repoUrl || !repoUrl.includes('github.com')) {
                console.log('❌ Invalid repository URL. Please provide a valid GitHub repository URL.');
                console.log('Example: https://github.com/username/repository-name.git');
                return false;
            }

            // Remove existing origin if it exists
            try {
                execSync('git remote remove origin', { stdio: 'pipe' });
            } catch (e) {
                // Remote doesn't exist, that's fine
            }
            
            // Add new remote
            execSync(`git remote add origin ${repoUrl}`, { stdio: 'inherit' });
            console.log('✅ Remote repository configured successfully!');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error setting up remote:', error.message);
            console.log('💡 Make sure the repository exists and you have access to it.');
            return false;
        }
    }

    // Get detailed commit statistics
    getDetailedStats() {
        try {
            const today = execSync('git log --oneline --since="1 day ago" | wc -l', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            }).trim();
            const week = execSync('git log --oneline --since="1 week ago" | wc -l', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            }).trim();
            const month = execSync('git log --oneline --since="1 month ago" | wc -l', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            }).trim();
            const total = execSync('git rev-list --count HEAD 2>/dev/null || echo 0', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            }).trim();
            
            console.log('📊 Detailed Commit Statistics:');
            console.log(`   Today: ${today} commits`);
            console.log(`   This week: ${week} commits`);
            console.log(`   This month: ${month} commits`);
            console.log(`   Total: ${total} commits`);
            
            return { today: parseInt(today), week: parseInt(week), month: parseInt(month), total: parseInt(total) };
            
        } catch (error) {
            console.error('❌ Error getting statistics:', error.message);
            return { today: 0, week: 0, month: 0, total: 0 };
        }
    }
}

module.exports = CommitBooster;

// CLI Interface
if (require.main === module) {
    const booster = new CommitBooster();
    const command = process.argv[2];

    switch (command) {
        case 'daily':
            booster.generateDailyCommit();
            break;
        case 'micro':
            booster.createMicroCommits();
            break;
        case 'init':
            booster.initGit();
            break;
        case 'stats':
            booster.getDetailedStats();
            break;
        case 'push':
            booster.pushToRemote();
            break;
        case 'setup-remote':
            if (!process.argv[3]) {
                console.log('❌ Please provide a repository URL');
                console.log('Example: node commit-booster.js setup-remote https://github.com/username/repo.git');
                break;
            }
            booster.setupRemote(process.argv[3]);
            break;
        case 'auto':
            booster.runDailyAutomation();
            break;
        case 'force-push':
            booster.forcePushToday();
            break;
        case 'status':
            booster.getAutomationStatus();
            break;
        default:
            console.log(`
🚀 Commit Booster - Automated Daily GitHub Commits

Basic Commands:
  node commit-booster.js daily              Generate daily meaningful commits
  node commit-booster.js micro              Create multiple micro-commits
  node commit-booster.js init               Initialize git repository
  node commit-booster.js stats              Show detailed commit statistics
  node commit-booster.js push               Push commits to remote repository
  node commit-booster.js setup-remote <url> Setup remote repository

Automation Commands:
  node commit-booster.js auto               🤖 Smart daily automation (respects schedule)
  node commit-booster.js force-push         ⚡ Force push today (ignores schedule)  
  node commit-booster.js status             📊 Show automation status and schedule

Examples:
  node commit-booster.js setup-remote https://github.com/username/repo.git
  node commit-booster.js auto               # Run smart daily automation
  node commit-booster.js status             # Check when next push is due
`);
    }
}
