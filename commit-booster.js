#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CommitBooster {
    constructor() {
        this.projectRoot = process.cwd();
        this.logFile = path.join(this.projectRoot, 'daily-progress.md');
        this.todosFile = path.join(this.projectRoot, 'todos.md');
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
}

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
        default:
            console.log(`
🚀 Commit Booster - Increase Your GitHub Contributions

Usage:
  node commit-booster.js daily    Generate daily meaningful commits
  node commit-booster.js micro    Create multiple micro-commits
  node commit-booster.js init     Initialize git repository

Examples:
  node commit-booster.js daily    # Creates 2-3 commits with progress updates
  node commit-booster.js micro    # Creates 4-5 small commits with utilities
`);
    }
}

module.exports = CommitBooster;