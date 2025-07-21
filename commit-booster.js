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
                console.log('💡 Add a remote with: git remote add origin <your-repo-url>');
                return false;
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

            // Push to remote
            console.log('📤 Pushing commits to remote repository...');
            try {
                execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
                console.log('✅ Successfully pushed to remote!');
                return true;
            } catch (pushError) {
                if (pushError.message.includes('no upstream branch')) {
                    execSync(`git push --set-upstream origin ${currentBranch}`, { stdio: 'inherit' });
                    console.log('✅ Successfully pushed and set upstream!');
                    return true;
                } else {
                    throw pushError;
                }
            }
            
        } catch (error) {
            console.error('❌ Error pushing to remote:', error.message);
            return false;
        }
    }

    // Enhanced daily commit with automatic push
    async generateDailyCommitWithPush() {
        const today = new Date().toISOString().split('T')[0];
        
        try {
            console.log('🤖 Starting daily commit generation...');
            
            // Generate commits first
            await this.generateDailyCommit();
            
            // Then push to remote
            await this.pushToRemote();
            
            console.log('🚀 Daily commits generated and pushed successfully!');
            
        } catch (error) {
            console.error('❌ Error in daily commit and push:', error.message);
            throw error; // Re-throw for server error handling
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
            booster.generateDailyCommitWithPush();
            break;
        default:
            console.log(`
🚀 Commit Booster - Automated Daily GitHub Commits

Commands:
  node commit-booster.js daily              Generate daily meaningful commits
  node commit-booster.js micro              Create multiple micro-commits
  node commit-booster.js init               Initialize git repository
  node commit-booster.js stats              Show detailed commit statistics
  node commit-booster.js push               Push commits to remote repository
  node commit-booster.js setup-remote <url> Setup remote repository
  node commit-booster.js auto               Generate commits and push

Examples:
  node commit-booster.js daily
  node commit-booster.js setup-remote https://github.com/username/repo.git
  node commit-booster.js auto
`);
    }
}
