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
        const header = `## ${date}`;
        let needsHeader = true;
        if (fs.existsSync(this.logFile)) {
            const content = fs.readFileSync(this.logFile, 'utf8');
            needsHeader = !content.includes(header + '\n');
        } else {
            fs.writeFileSync(this.logFile, '# Daily Progress Log\n');
        }
        if (!needsHeader) {
            // Avoid duplicating the same day section
            return false; // indicate unchanged
        }
        const logEntry = `\n${header}\n- Project maintenance and improvements\n- Code quality enhancements\n- Documentation updates\n`;
        fs.appendFileSync(this.logFile, logEntry);
        return true; // changed
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
            // Skip commit if no diff for this file
            const diffExit = (() => {
                try {
                    execSync(`git diff --cached --quiet -- "${filePath}"`);
                    return 0; // no changes
                } catch (e) {
                    return 1; // has changes
                }
            })();
            if (diffExit === 0) {
                console.log(`⏭️  Skipped commit (no changes): ${path.basename(filePath)}`);
                return;
            }
            execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
            console.log(`📝 Committed: ${message}`);
        } catch (error) {
            // Handle stale index.lock scenario
            if (error.message && error.message.includes('index.lock')) {
                const lockPath = path.join(this.projectRoot, '.git', 'index.lock');
                try {
                    const stat = fs.statSync(lockPath);
                    const ageMs = Date.now() - stat.mtimeMs;
                    if (ageMs > 60000) {
                        fs.unlinkSync(lockPath);
                        console.log('🧹 Removed stale git index.lock (age ' + Math.round(ageMs/1000) + 's)');
                        try {
                            execSync(`git add "${filePath}"`, { stdio: 'pipe' });
                            execSync(`git diff --cached --quiet -- "${filePath}"`) || execSync(`git commit -m "${message}"`, { stdio: 'pipe' });
                            console.log(`📝 Committed after lock recovery: ${message}`);
                            return;
                        } catch (retryErr) {
                            console.log('⚠️  Retry after lock removal failed:', retryErr.message);
                        }
                    } else {
                        console.log('⏳ Active git operation detected (index.lock fresh). Skipping commit for now.');
                    }
                } catch (lockErr) {
                    console.log('⚠️  Could not inspect/remove index.lock:', lockErr.message);
                }
            }
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

    // === Newly added helper for ensuring git repo before batch runs ===
    ensureGit() {
        try {
            execSync('git status', { stdio: 'pipe' });
        } catch (e) {
            this.initGit();
        }
    }

    // === New command: documentation update ===
    generateDocsUpdate() {
        try {
            this.ensureGit();
            const readme = path.join(this.projectRoot, 'README.md');
            const stamp = `\n<!-- docs update ${new Date().toISOString()} -->\n`;
            if (!fs.existsSync(readme)) fs.writeFileSync(readme, '# Project README\n');
            fs.appendFileSync(readme, stamp + 'Minor documentation touch-up.\n');
            this.commitFile(readme, 'docs: update documentation timestamp');
            console.log('✅ Docs update committed');
        } catch (e) {
            console.error('❌ Docs update failed:', e.message);
        }
    }

    // === New command: tests improvement ===
    improveTests() {
        try {
            this.ensureGit();
            const testFile = path.join(this.projectRoot, 'test-improvements.spec.js');
            const content = `// Auto-generated test improvements\n// ${new Date().toISOString()}\n\nfunction dummyTest() { return true; }\nmodule.exports = { dummyTest };\n`;
            fs.writeFileSync(testFile, content);
            this.commitFile(testFile, 'test: add/improve dummy tests');
            console.log('✅ Test improvements committed');
        } catch (e) {
            console.error('❌ Test update failed:', e.message);
        }
    }

    // === New command: refactor placeholder ===
    performRefactor() {
        try {
            this.ensureGit();
            const refactorFile = path.join(this.projectRoot, 'refactor-notes.md');
            fs.appendFileSync(refactorFile, `\n${new Date().toISOString()} - Minor internal refactor notes.\n`);
            this.commitFile(refactorFile, 'refactor: minor internal improvements');
            console.log('✅ Refactor notes committed');
        } catch (e) {
            console.error('❌ Refactor failed:', e.message);
        }
    }

    // === New command: bugfix placeholder ===
    applyBugFix() {
        try {
            this.ensureGit();
            const fixFile = path.join(this.projectRoot, 'BUGFIX_LOG.md');
            fs.appendFileSync(fixFile, `\n${new Date().toISOString()} - Patched minor issue placeholder.\n`);
            this.commitFile(fixFile, 'fix: patch minor placeholder issue');
            console.log('✅ Bug fix committed');
        } catch (e) {
            console.error('❌ Bugfix failed:', e.message);
        }
    }

    // === New command: maintenance placeholder ===
    performMaintenance() {
        try {
            this.ensureGit();
            const maintenanceFile = path.join(this.projectRoot, 'MAINTENANCE.md');
            fs.appendFileSync(maintenanceFile, `\n${new Date().toISOString()} - Routine maintenance entry.\n`);
            this.commitFile(maintenanceFile, 'chore: routine maintenance');
            console.log('✅ Maintenance committed');
        } catch (e) {
            console.error('❌ Maintenance failed:', e.message);
        }
    }

    // === New command: feature stub ===
    addFeatureStub() {
        try {
            this.ensureGit();
            const featureFile = path.join(this.projectRoot, `feature-${Date.now()}.js`);
            const content = `// Feature stub generated ${new Date().toISOString()}\nmodule.exports = () => 'feature stub';\n`;
            fs.writeFileSync(featureFile, content);
            this.commitFile(featureFile, 'feat: add feature stub');
            console.log('✅ Feature stub committed');
        } catch (e) {
            console.error('❌ Feature stub failed:', e.message);
        }
    }

    // === New batch scheduler (simplified) ===
    async runBatch(days = 7, min = 1, max = 3, microChance = 30, includePush = false) {
        this.ensureGit();
        days = parseInt(days); min = parseInt(min); max = parseInt(max); microChance = parseInt(microChance);
        console.log(`🗓️  Running batch for ${days} days (min ${min}, max ${max}, microChance ${microChance}%)`);
        for (let d = 0; d < days; d++) {
            const commitCount = Math.max(min, Math.min(max, Math.floor(Math.random() * (max - min + 1)) + min));
            for (let c = 0; c < commitCount; c++) {
                await this.generateDailyCommit();
                if (Math.random() * 100 < microChance) this.createMicroCommits();
            }
        }
        if (includePush) await this.pushToRemote();
        console.log('✅ Batch run complete');
    }

    // === High volume variant with burst logic ===
    async runHighVolume(days = 30, min = 1, max = 5, microChance = 40, burstChance = 20, includePush = false) {
        this.ensureGit();
        console.log(`🚀 High-volume run: days=${days} min=${min} max=${max} micro=${microChance}% burst=${burstChance}%`);
        for (let d = 0; d < days; d++) {
            let commitCount = Math.floor(Math.random() * (max - min + 1)) + min;
            if (Math.random() * 100 < burstChance) commitCount += Math.floor(Math.random() * 5) + 3; // burst
            for (let c = 0; c < commitCount; c++) {
                await this.generateDailyCommit();
                if (Math.random() * 100 < microChance) this.createMicroCommits();
            }
        }
        if (includePush) await this.pushToRemote();
        console.log('✅ High-volume run complete');
    }
}

// Export class for external usage
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
    case 'docs':
        booster.generateDocsUpdate();
        break;
    case 'tests':
        booster.improveTests();
        break;
    case 'refactor':
        booster.performRefactor();
        break;
    case 'bugfix':
        booster.applyBugFix();
        break;
    case 'maintenance':
        booster.performMaintenance();
        break;
    case 'feature':
        booster.addFeatureStub();
        break;
    case 'batch': {
        const [days, min, max, microChance, includePush] = process.argv.slice(3);
        booster.runBatch(days, min, max, microChance, includePush === 'true');
        break; }
    case 'high-volume': {
        const [days, min, max, microChance, burstChance, includePush] = process.argv.slice(3);
        booster.runHighVolume(days, min, max, microChance, burstChance, includePush === 'true');
        break; }
    default:
        console.log(`\n🚀 Commit Booster - Automated Daily GitHub Commits\n\nBasic Commands:\n  node commit-booster.js daily              Generate daily meaningful commits\n  node commit-booster.js micro              Create multiple micro-commits\n  node commit-booster.js docs               Documentation update commit\n  node commit-booster.js tests              Test improvement commit\n  node commit-booster.js refactor           Refactor placeholder commit\n  node commit-booster.js bugfix             Bug fix placeholder commit\n  node commit-booster.js feature            Feature stub commit\n  node commit-booster.js maintenance        Maintenance (chore) commit\n  node commit-booster.js stats              Show detailed commit statistics\n  node commit-booster.js push               Push commits to remote repository\n  node commit-booster.js setup-remote <url> Setup remote repository\n\nAutomation Commands:\n  node commit-booster.js auto               🤖 Smart daily automation (respects schedule)\n  node commit-booster.js force-push         ⚡ Force push today (ignores schedule)  \n  node commit-booster.js status             📊 Show automation status and schedule\n  node commit-booster.js batch <d> <min> <max> <micro%> <push?>  Batch generate\n  node commit-booster.js high-volume <d> <min> <max> <micro%> <burst%> <push?> High volume\n`);
    }
}
