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

    // Enhanced daily commit with automatic push
    async generateDailyCommitWithPush() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            // Generate commits first
            await this.generateDailyCommit();
            
            // Then push to remote
            await this.pushToRemote();
            
            // Update push schedule
            this.updateLastPushDate(today);
            
            console.log('🚀 Daily commits generated and pushed successfully!');
            this.showCommitStats();
            
        } catch (error) {
            console.error('❌ Error in daily commit and push:', error.message);
        }
    }

    // Push commits to remote repository
    async pushToRemote() {
        try {
            // Check if we have a remote configured
            const remotes = execSync('git remote', { encoding: 'utf8', stdio: 'pipe' });
            
            if (!remotes.trim()) {
                console.log('⚠️  No remote repository configured. Skipping push.');
                console.log('💡 Add a remote with: git remote add origin <your-repo-url>');
                return false;
            }

            // Check if we have commits to push
            try {
                execSync('git diff HEAD~1 --quiet', { stdio: 'pipe' });
                console.log('ℹ️  No new commits to push');
                return false;
            } catch (error) {
                // Error means there are differences, so we have commits to push
            }

            // Get current branch
            const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            
            if (!currentBranch) {
                console.log('⚠️  Not on any branch. Creating main branch...');
                execSync('git checkout -b main', { stdio: 'inherit' });
            }

            // Push to remote
            console.log('📤 Pushing commits to remote repository...');
            execSync(`git push origin ${currentBranch || 'main'}`, { stdio: 'inherit' });
            console.log('✅ Successfully pushed to remote!');
            
            return true;
            
        } catch (error) {
            if (error.message.includes('no upstream branch')) {
                try {
                    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim() || 'main';
                    execSync(`git push --set-upstream origin ${branch}`, { stdio: 'inherit' });
                    console.log('✅ Successfully pushed and set upstream!');
                    return true;
                } catch (upstreamError) {
                    console.error('❌ Error setting upstream:', upstreamError.message);
                }
            }
            console.error('❌ Error pushing to remote:', error.message);
            return false;
        }
    }

    // Check if daily push is needed
    shouldRunDailyPush() {
        try {
            if (!fs.existsSync(this.scheduleFile)) {
                return true; // First run
            }

            const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            const lastPush = new Date(data.lastPush);
            const today = new Date();
            
            // Check if it's been more than 23 hours since last push
            const hoursDiff = (today - lastPush) / (1000 * 60 * 60);
            return hoursDiff >= 23;
            
        } catch (error) {
            console.log('💡 Schedule file not found, running daily push...');
            return true;
        }
    }

    // Update last push date
    updateLastPushDate(date) {
        const data = {
            lastPush: date,
            totalRuns: this.getTotalRuns() + 1,
            lastRunTime: new Date().toISOString()
        };
        fs.writeFileSync(this.scheduleFile, JSON.stringify(data, null, 2));
    }

    // Get total runs count
    getTotalRuns() {
        try {
            if (!fs.existsSync(this.scheduleFile)) return 0;
            const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            return data.totalRuns || 0;
        } catch (error) {
            return 0;
        }
    }

    // Start daily automation (runs once then exits)
    async runDailyAutomation() {
        console.log('🤖 Starting daily automation check...');
        
        if (this.shouldRunDailyPush()) {
            console.log('⏰ Time for daily push!');
            await this.generateDailyCommitWithPush();
            
            // Occasionally run additional commit types for variety
            const random = Math.random();
            if (random < 0.3) {
                console.log('🔄 Adding bonus micro commits...');
                this.createMicroCommits();
                await this.pushToRemote();
            } else if (random < 0.5) {
                console.log('📚 Adding documentation commits...');
                this.createDocumentationCommits();
                await this.pushToRemote();
            } else if (random < 0.7) {
                console.log('🧪 Adding testing commits...');
                this.createTestingCommits();
                await this.pushToRemote();
            }
            
        } else {
            console.log('✅ Already pushed today. Next push due in ~24 hours.');
            this.showNextPushTime();
        }
    }

    // Show when next push is scheduled
    showNextPushTime() {
        try {
            const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
            const lastPush = new Date(data.lastPush);
            const nextPush = new Date(lastPush.getTime() + (24 * 60 * 60 * 1000));
            
            console.log(`📅 Next push scheduled for: ${nextPush.toLocaleString()}`);
            console.log(`🔢 Total automated runs: ${data.totalRuns || 0}`);
        } catch (error) {
            console.log('📅 Schedule information unavailable');
        }
    }

    // Setup remote repository helper
    setupRemote(repoUrl) {
        try {
            // Validate repository URL format
            if (!repoUrl || !repoUrl.includes('github.com')) {
                console.log('❌ Invalid repository URL. Please provide a valid GitHub repository URL.');
                console.log('Example: https://github.com/username/repository-name.git');
                return false;
            }

            // Check if URL is the placeholder
            if (repoUrl.includes('yourusername') || repoUrl.includes('yourrepo')) {
                console.log('❌ Please replace the placeholder URL with your actual GitHub repository.');
                console.log('Example: https://github.com/shakhzod/my-commit-booster.git');
                console.log('💡 Create a new repository on GitHub first, then use its URL.');
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
            
            // Try initial push
            console.log('🔄 Performing initial push...');
            return this.pushToRemote();
            
        } catch (error) {
            console.error('❌ Error setting up remote:', error.message);
            console.log('💡 Make sure the repository exists and you have access to it.');
            return false;
        }
    }

    // Force push (useful for first-time setup)
    async forcePushToday() {
        console.log('🔄 Forcing daily commit and push...');
        await this.generateDailyCommitWithPush();
    }

    // Create a cron-like scheduler status
    getSchedulerStatus() {
        const data = this.getScheduleData();
        const status = {
            isConfigured: fs.existsSync(this.scheduleFile),
            lastRun: data.lastPush || 'Never',
            totalRuns: data.totalRuns || 0,
            nextRunDue: this.shouldRunDailyPush(),
            remoteConfigured: this.hasRemoteConfigured()
        };
        
        console.log('🕒 Scheduler Status:');
        console.log(`   Configured: ${status.isConfigured ? '✅' : '❌'}`);
        console.log(`   Last run: ${status.lastRun}`);
        console.log(`   Total runs: ${status.totalRuns}`);
        console.log(`   Next run due: ${status.nextRunDue ? '✅ Ready' : '⏳ Waiting'}`);
        console.log(`   Remote configured: ${status.remoteConfigured ? '✅' : '❌'}`);
        
        return status;
    }

    // Helper to get schedule data
    getScheduleData() {
        try {
            if (!fs.existsSync(this.scheduleFile)) return {};
            return JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
        } catch (error) {
            return {};
        }
    }

    // Check if remote is configured
    hasRemoteConfigured() {
        try {
            const remotes = execSync('git remote', { encoding: 'utf8', stdio: 'pipe' });
            return remotes.trim().length > 0;
        } catch (error) {
            return false;
        }
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
            execSync(`git add "${filePath}"`, { stdio: 'inherit' });
            execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
            console.log(`📝 Committed: ${message}`);
        } catch (error) {
            console.log(`ℹ️  Note: ${error.message}`);
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
    }

    createMicroFile(filename, purpose) {
        const filePath = path.join(this.projectRoot, filename);
        const timestamp = new Date().toISOString();
        
        const content = `// ${purpose}
// Updated: ${timestamp}

module.exports = {
    // TODO: Implement ${purpose.toLowerCase()}
    created: '${timestamp}'
};
`;
        
        fs.writeFileSync(filePath, content);
    }

    showCommitStats() {
        try {
            const stats = execSync('git log --oneline --since="1 day ago" | wc -l', { encoding: 'utf8' });
            console.log(`📊 Commits today: ${stats.trim()}`);
        } catch (error) {
            console.log('💡 Initialize git repository to track commits');
        }
    }

    // Initialize git if not already done
    initGit() {
        try {
            execSync('git status', { stdio: 'ignore' });
            console.log('✅ Git repository already initialized');
        } catch (error) {
            console.log('🔄 Initializing git repository...');
            execSync('git init', { stdio: 'inherit' });
            execSync('git config user.name "GitHub Contributor"', { stdio: 'inherit' });
            console.log('✅ Git initialized! Remember to set your GitHub email:');
            console.log('   git config user.email "your-email@example.com"');
        }
   }

    // NEW METHODS BELOW

    // Create documentation commits
    createDocumentationCommits() {
        const docTasks = [
            { file: 'API.md', content: this.generateApiDoc(), message: 'Add API documentation' },
            { file: 'CONTRIBUTING.md', content: this.generateContributingDoc(), message: 'Add contributing guidelines' },
            { file: 'CHANGELOG.md', content: this.updateChangelog(), message: 'Update changelog' },
            { file: 'docs/setup.md', content: this.generateSetupDoc(), message: 'Add setup documentation' }
        ];

        docTasks.forEach(({ file, content, message }) => {
            if (file.includes('/')) {
                this.ensureDirectoryExists(path.dirname(file));
            }
            this.createDocFile(file, content);
            this.commitFile(file, message);
        });

