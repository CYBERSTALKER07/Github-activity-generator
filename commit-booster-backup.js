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

        console.log('📚 Documentation commits created successfully!');
    }

    // Create testing and quality commits
    createTestingCommits() {
        const testTasks = [
            { file: 'test.js', content: this.generateTestFile(), message: 'Add unit tests' },
            { file: '.eslintrc.json', content: this.generateEslintConfig(), message: 'Add ESLint configuration' },
            { file: '.gitignore', content: this.generateGitignore(), message: 'Update gitignore' },
            { file: 'package-lock.json', content: '{}', message: 'Update dependencies' }
        ];

        testTasks.forEach(({ file, content, message }) => {
            if (file.includes('/')) {
                this.ensureDirectoryExists(path.dirname(file));
            }
            this.createDocFile(file, content);
            this.commitFile(file, message);
        });

        console.log('🧪 Testing and quality commits created!');
    }

    // Create feature development commits
    createFeatureCommits(featureName = 'new-feature') {
        const timestamp = new Date().toISOString();
        const features = [
            { file: `src/${featureName}.js`, content: this.generateFeatureCode(featureName), message: `Implement ${featureName} feature` },
            { file: `src/${featureName}.test.js`, content: this.generateFeatureTest(featureName), message: `Add tests for ${featureName}` },
            { file: `docs/${featureName}.md`, content: this.generateFeatureDoc(featureName), message: `Document ${featureName} feature` }
        ];

        features.forEach(({ file, content, message }) => {
            this.ensureDirectoryExists(path.dirname(file));
            this.createDocFile(file, content);
            this.commitFile(file, message);
        });

        console.log(`🎯 Feature '${featureName}' commits created!`);
    }

    // Create refactoring commits
    createRefactoringCommits() {
        const refactorTasks = [
            { file: 'src/utils/helpers.js', task: 'Extract helper functions' },
            { file: 'src/config/settings.js', task: 'Centralize configuration' },
            { file: 'src/validators/input.js', task: 'Add input validation' },
            { file: 'src/formatters/output.js', task: 'Improve output formatting' }
        ];

        refactorTasks.forEach(({ file, task }) => {
            this.ensureDirectoryExists(path.dirname(file));
            this.createRefactorFile(file, task);
            this.commitFile(file, `Refactor: ${task}`);
        });

        console.log('♻️ Refactoring commits created!');
    }

    // Create bug fix commits
    createBugFixCommits() {
        const bugFixes = [
            'Fix memory leak in event handlers',
            'Resolve race condition in async operations',
            'Fix validation edge case',
            'Correct error handling in API calls'
        ];

        bugFixes.forEach((fix, index) => {
            const filename = `fixes/bug-fix-${index + 1}.md`;
            this.ensureDirectoryExists('fixes');
            this.createDocFile(filename, this.generateBugFixDoc(fix));
            this.commitFile(filename, `Fix: ${fix}`);
        });

        console.log('🐛 Bug fix commits created!');
    }

    // Weekly maintenance routine
    createWeeklyMaintenance() {
        const today = new Date().toISOString().split('T')[0];
        const maintenanceTasks = [
            () => this.updateDependencies(),
            () => this.cleanupTempFiles(),
            () => this.updateReadme(),
            () => this.archiveOldLogs(),
            () => this.generateWeeklyReport(today)
        ];

        maintenanceTasks.forEach((task, index) => {
            task();
            setTimeout(() => {}, 100 * index); // Small delay between commits
        });

        console.log('🔧 Weekly maintenance completed!');
    }

    // ENHANCED ACTIVITY GENERATION METHODS

    // Enhanced activity generation inspired by Python script
    generateActivityPattern(options = {}) {
        const {
            daysBack = 365,
            daysForward = 0,
            frequency = 80,
            maxCommitsPerDay = 10,
            noWeekends = false,
            customMessages = []
        } = options;

        console.log('🎯 Generating activity pattern...');
        console.log(`📅 Days back: ${daysBack}, Days forward: ${daysForward}`);
        console.log(`📊 Frequency: ${frequency}%, Max commits/day: ${maxCommitsPerDay}`);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        
        const commits = [];
        
        for (let i = 0; i < daysBack + daysForward; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            // Skip weekends if requested
            if (noWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
                continue;
            }
            
            // Random chance to commit on this day
            if (Math.random() * 100 < frequency) {
                const commitsToday = Math.floor(Math.random() * maxCommitsPerDay) + 1;
                
                for (let j = 0; j < commitsToday; j++) {
                    const commitTime = new Date(currentDate);
                    commitTime.setHours(9 + Math.floor(Math.random() * 12)); // 9 AM to 9 PM
                    commitTime.setMinutes(Math.floor(Math.random() * 60));
                    
                    commits.push({
                        date: commitTime,
                        message: this.generateCommitMessage(commitTime, customMessages)
                    });
                }
            }
        }
        
        return commits.sort((a, b) => a.date - b.date);
    }

    // Enhanced activity generation for high-volume commits
    generateActivityPattern(options = {}) {
        const {
            daysBack = 730, // 2 years by default
            daysForward = 0,
            frequency = 95, // High frequency for daily commits
            minCommitsPerDay = 25,
            maxCommitsPerDay = 50,
            noWeekends = false,
            customMessages = []
        } = options;

        console.log('🎯 Generating high-volume activity pattern...');
        console.log(`📅 Days back: ${daysBack}, Days forward: ${daysForward}`);
        console.log(`📊 Frequency: ${frequency}%, Commits per day: ${minCommitsPerDay}-${maxCommitsPerDay}`);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        
        const commits = [];
        
        for (let i = 0; i < daysBack + daysForward; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            // Skip weekends if requested
            if (noWeekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
                continue;
            }
            
            // High chance to commit on this day (95% frequency)
            if (Math.random() * 100 < frequency) {
                // Generate 25-50 commits per day
                const commitsToday = Math.floor(Math.random() * (maxCommitsPerDay - minCommitsPerDay + 1)) + minCommitsPerDay;
                
                for (let j = 0; j < commitsToday; j++) {
                    const commitTime = new Date(currentDate);
                    // Spread commits throughout the day (6 AM to 11 PM)
                    commitTime.setHours(6 + Math.floor(Math.random() * 17)); 
                    commitTime.setMinutes(Math.floor(Math.random() * 60));
                    commitTime.setSeconds(Math.floor(Math.random() * 60));
                    
                    commits.push({
                        date: commitTime,
                        message: this.generateVariedCommitMessage(commitTime, j, customMessages)
                    });
                }
            }
        }
        
        return commits.sort((a, b) => a.date - b.date);
    }

    // Generate more varied commit messages for high-volume commits
    generateVariedCommitMessage(date, commitIndex, customMessages = []) {
        const commitTypes = [
            'feat', 'fix', 'docs', 'style', 'refactor', 
            'perf', 'test', 'build', 'ci', 'chore'
        ];
        
        const features = [
            'add new utility function',
            'implement helper method',
            'create data validator',
            'add error handler',
            'improve function logic',
            'optimize algorithm',
            'enhance performance',
            'add type checking',
            'implement cache system',
            'create middleware'
        ];
        
        const fixes = [
            'resolve edge case',
            'fix validation logic',
            'correct error handling',
            'resolve memory leak',
            'fix async operation',
            'resolve race condition',
            'fix null pointer',
            'correct calculation',
            'resolve timeout issue',
            'fix compatibility issue'
        ];
        
        const docs = [
            'update API documentation',
            'improve code comments',
            'add usage examples',
            'update README',
            'add inline documentation',
            'improve method descriptions',
            'add troubleshooting guide',
            'update changelog',
            'add configuration docs',
            'improve setup instructions'
        ];
        
        const styles = [
            'improve code formatting',
            'update indentation',
            'standardize naming',
            'clean up whitespace',
            'organize imports',
            'improve code structure',
            'standardize quotes',
            'clean up comments',
            'improve readability',
            'format JSON files'
        ];
        
        const refactors = [
            'extract utility function',
            'simplify conditional logic',
            'improve code organization',
            'reduce code duplication',
            'enhance modularity',
            'improve error handling',
            'optimize data structures',
            'streamline workflow',
            'improve method signatures',
            'enhance code clarity'
        ];
        
        const messageGroups = {
            feat: features,
            fix: fixes,
            docs: docs,
            style: styles,
            refactor: refactors,
            perf: ['optimize performance', 'improve speed', 'reduce memory usage', 'enhance efficiency'],
            test: ['add unit tests', 'improve test coverage', 'add integration tests', 'enhance test suite'],
            build: ['update build config', 'improve build process', 'optimize bundling', 'update dependencies'],
            ci: ['improve CI pipeline', 'update workflows', 'enhance automation', 'optimize testing'],
            chore: ['update configuration', 'clean up files', 'organize project', 'maintenance tasks']
        };
        
        if (customMessages.length > 0) {
            const randomMessage = customMessages[Math.floor(Math.random() * customMessages.length)];
            return `${randomMessage} - ${date.toISOString().split('T')[0]}`;
        }
        
        // Select commit type based on index for variety
        const typeIndex = commitIndex % commitTypes.length;
        const commitType = commitTypes[typeIndex];
        const messages = messageGroups[commitType];
        const specificMessage = messages[Math.floor(Math.random() * messages.length)];
        
        return `${commitType}: ${specificMessage}`;
    }

    // Optimized meaningful change creation for high-volume commits
    createMeaningfulChange(date, index) {
        try {
            // Create changes in different categories based on index
            const changeCategory = index % 8;
            
            switch (changeCategory) {
                case 0:
                    this.updateProgressLog(date, index);
                    break;
                case 1:
                    this.createUtilityFunction(date, index);
                    break;
                case 2:
                    this.updateDocumentation(date, index);
                    break;
                case 3:
                    this.createConfigUpdate(date, index);
                    break;
                case 4:
                    this.addTestCase(date, index);
                    break;
                case 5:
                    this.createFeatureFile(date, index);
                    break;
                case 6:
                    this.updateBuildConfig(date, index);
                    break;
                case 7:
                    this.createMaintenanceLog(date, index);
                    break;
                default:
                    this.createFallbackChange(date, index);
            }
            
        } catch (error) {
            console.error(`Warning: Could not create change for commit ${index}:`, error.message);
            this.createFallbackChange(date, index);
        }
    }

    // Consolidated utility function creation
    createUtilityFunction(date, index) {
        const dateStr = date.toISOString().split('T')[0];
        const utilDir = 'src/utils';
        this.ensureDirectoryExists(utilDir);
        
        const functionNames = [
            'formatDate', 'validateInput', 'sanitizeData', 'parseConfig',
            'generateId', 'hashString', 'sortArray', 'filterResults',
            'debounce', 'throttle', 'deepClone', 'merge', 'pick', 'omit'
        ];
        
        const funcName = functionNames[index % functionNames.length];
        const utilFile = path.join(utilDir, 'helpers.js');
        
        const utilContent = `\n// ${funcName} utility - Added ${dateStr}\nfunction ${funcName}(input) {\n    // Implementation for ${funcName}\n    return input;\n}\n\nmodule.exports.${funcName} = ${funcName};\n`;
        
        if (!fs.existsSync(utilFile)) {
            fs.writeFileSync(utilFile, '// Utility Functions Collection\n');
        }
        
        fs.appendFileSync(utilFile, utilContent);
    }

    // Consolidated configuration updates
    createConfigUpdate(date, index) {
        const dateStr = date.toISOString().split('T')[0];
        const configDir = 'src/config';
        this.ensureDirectoryExists(configDir);
        
        const configTypes = ['database', 'api', 'cache', 'logging', 'security'];
        const configType = configTypes[index % configTypes.length];
        const configFile = path.join(configDir, `${configType}.js`);
        
        const configUpdate = `\n// ${configType} config update - ${dateStr}\nmodule.exports.${configType}_${index} = {\n    updated: '${dateStr}',\n    version: '1.${index}',\n    enabled: true\n};\n`;
        
        if (!fs.existsSync(configFile)) {
            fs.writeFileSync(configFile, `// ${configType.charAt(0).toUpperCase() + configType.slice(1)} Configuration\n`);
        }
        
        fs.appendFileSync(configFile, configUpdate);
    }

    // Consolidated test case creation
    addTestCase(date, index) {
        const testDir = 'src/tests';
        this.ensureDirectoryExists(testDir);
        
        const testTypes = ['unit', 'integration', 'e2e', 'performance'];
        const testType = testTypes[index % testTypes.length];
        const testFile = path.join(testDir, `${testType}-tests.js`);
        
        const testContent = `\n// Test case ${index} - ${date.toISOString().split('T')[0]}\ntest('should handle ${testType} test ${index}', () => {\n    expect(true).toBe(true);\n});\n`;
        
        if (!fs.existsSync(testFile)) {
            fs.writeFileSync(testFile, `// ${testType.charAt(0).toUpperCase() + testType.slice(1)} Test Suite\n`);
        }
        
        fs.appendFileSync(testFile, testContent);
    }

    // Create feature files
    createFeatureFile(date, index) {
        const featuresDir = 'src/features';
        this.ensureDirectoryExists(featuresDir);
        
        const features = ['auth', 'dashboard', 'api', 'utils', 'core', 'ui'];
        const feature = features[index % features.length];
        const featureFile = path.join(featuresDir, `${feature}.js`);
        
        const featureContent = `\n// ${feature} feature update - ${date.toISOString().split('T')[0]}\nclass ${feature.charAt(0).toUpperCase() + feature.slice(1)}Feature {\n    // Feature implementation ${index}\n}\n`;
        
        if (!fs.existsSync(featureFile)) {
            fs.writeFileSync(featureFile, `// ${feature.charAt(0).toUpperCase() + feature.slice(1)} Feature Module\n`);
        }
        
        fs.appendFileSync(featureFile, featureContent);
    }

    // Update build configuration
    updateBuildConfig(date, index) {
        const buildDir = 'build';
        this.ensureDirectoryExists(buildDir);
        
        const buildFiles = ['webpack.js', 'babel.js', 'eslint.js', 'jest.js'];
        const buildFile = buildFiles[index % buildFiles.length];
        const buildPath = path.join(buildDir, buildFile);
        
        const buildContent = `\n// Build config update ${index} - ${date.toISOString().split('T')[0]}\nmodule.exports.build_${index} = {\n    timestamp: '${date.toISOString().split('T')[0]}',\n    optimization: true\n};\n`;
        
        if (!fs.existsSync(buildPath)) {
            fs.writeFileSync(buildPath, `// ${buildFile.replace('.js', '')} Build Configuration\n`);
        }
        
        fs.appendFileSync(buildPath, buildContent);
    }

    // Create maintenance logs
    createMaintenanceLog(date, index) {
        const logsDir = 'logs';
        this.ensureDirectoryExists(logsDir);
        
        const logTypes = ['system', 'error', 'access', 'performance'];
        const logType = logTypes[index % logTypes.length];
        const logFile = path.join(logsDir, `${logType}.log`);
        
        const logContent = `${date.toISOString()}: Maintenance entry ${index} - ${logType} operations completed\n`;
        
        if (!fs.existsSync(logFile)) {
            fs.writeFileSync(logFile, `# ${logType.charAt(0).toUpperCase() + logType.slice(1)} Log\n\n`);
        }
        
        fs.appendFileSync(logFile, logContent);
    }

    // Enhanced batch generation for high-volume commits
    async generateHighVolumeActivity(options = {}) {
        console.log('🚀 Starting High-Volume Activity Generation (25-50 commits/day)');
        console.log('================================================================');
        
        const defaultOptions = {
            daysBack: 730, // 2 years
            daysForward: 0,
            frequency: 95,
            minCommitsPerDay: 25,
            maxCommitsPerDay: 50,
            noWeekends: false,
            maxFiles: 1000 // Allow more files for high-volume
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            // Generate activity pattern
            const commits = this.generateActivityPattern(finalOptions);
            
            if (commits.length === 0) {
                console.log('⚠️  No commits to generate based on current settings');
                return;
            }
            
            console.log(`📊 Generated ${commits.length} commits over ${finalOptions.daysBack} days`);
            console.log(`📈 Average commits per day: ${Math.round(commits.length / finalOptions.daysBack)}`);
            
            if (finalOptions.dryRun) {
                console.log('🔍 Dry run - showing what would be created:');
                this.showBatchStats(commits);
                return;
            }
            
            // Process commits in smaller batches to avoid overwhelming git
            const batchSize = 100;
            const batches = [];
            for (let i = 0; i < commits.length; i += batchSize) {
                batches.push(commits.slice(i, i + batchSize));
            }
            
            console.log(`📦 Processing ${batches.length} batches of ${batchSize} commits each...`);
            
            let totalSuccessful = 0;
            let totalSkipped = 0;
            
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                console.log(`\n📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} commits)...`);
                
                const results = await this.createBatchCommits(batch);
                totalSuccessful += results.successful || 0;
                totalSkipped += results.skipped || 0;
                
                // Small delay between batches to avoid overwhelming the system
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            
            // Show final statistics
            console.log('\n🎉 High-Volume Activity Generation Completed!');
            console.log(`✅ Total successful commits: ${totalSuccessful}`);
            console.log(`⏭️  Total skipped commits: ${totalSkipped}`);
            console.log(`📊 Success rate: ${Math.round((totalSuccessful / commits.length) * 100)}%`);
            
            this.showBatchStats(commits);
            
            console.log('\n💡 Next steps:');
            console.log('   - Run "git log --oneline" to see all commits');
            console.log('   - Run "npm run push" to push commits to remote');
            console.log('   - Check your GitHub contribution graph');
            
        } catch (error) {
            console.error('❌ Error in high-volume generation:', error.message);
        }
    }

    // Enhanced batch commit creation with better progress tracking
    async createBatchCommits(commits) {
        let successfulCommits = 0;
        let skippedCommits = 0;
        
        for (let i = 0; i < commits.length; i++) {
            const commit = commits[i];
            const progress = Math.floor((i / commits.length) * 100);
            
            try {
                // Create meaningful file changes
                this.createMeaningfulChange(commit.date, i);
                
                // Check for changes and stage them
                try {
                    const statusOutput = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
                    if (!statusOutput.trim()) {
                        skippedCommits++;
                        continue;
                    }
                    execSync('git add .', { stdio: 'pipe' });
                } catch (statusError) {
                    skippedCommits++;
                    continue;
                }
                
                // Commit with custom date
                const commitDate = commit.date.toISOString().replace('T', ' ').slice(0, 19);
                const commitMessage = this.sanitizeCommitMessage(commit.message);
                
                try {
                    execSync(`git commit -m "${commitMessage}" --date "${commitDate}"`, { 
                        stdio: 'pipe',
                        timeout: 10000
                    });
                    successfulCommits++;
                } catch (commitError) {
                    if (commitError.message.includes('nothing to commit')) {
                        skippedCommits++;
                        continue;
                    } else if (commitError.message.includes('please tell me who you are')) {
                        this.configureGitUser();
                        execSync(`git commit -m "${commitMessage}" --date "${commitDate}"`, { stdio: 'pipe' });
                        successfulCommits++;
                    } else {
                        throw commitError;
                    }
                }
                
                // Show progress every 10 commits
                if (i % 10 === 0 || i === commits.length - 1) {
                    process.stdout.write(`\r📝 Progress: ${progress}% (${successfulCommits}/${i + 1})`);
                }
                
            } catch (error) {
                skippedCommits++;
                if (i % 20 === 0) {
                    console.error(`\n⚠️  Warning: Skipped commit ${i + 1}: ${this.getReadableError(error)}`);
                }
                continue;
            }
        }
        
        console.log(`\n✅ Batch completed: ${successfulCommits} successful, ${skippedCommits} skipped`);
        return { successful: successfulCommits, skipped: skippedCommits };
    }
}

// Enhanced batch generation command with file limit protection
    async generateBatchActivity(options = {}) {
        console.log('🎯 Starting Enhanced Batch Activity Generation');
        console.log('===============================================');
        
        try {
            const {
                daysBack = 365,
                maxFiles = 50, // Limit files created to prevent directory bloat
                dryRun = false
            } = options;
            
            // Generate activity pattern
            const commits = this.generateActivityPattern(options);
            
            if (commits.length === 0) {
                console.log('⚠️  No commits to generate based on current settings');
                return;
            }
            
            console.log(`📊 Generated ${commits.length} commits over ${daysBack} days`);
            
            if (commits.length > maxFiles) {
                console.log(`⚠️  Limiting to ${maxFiles} files to prevent directory bloat`);
            }
            
            if (dryRun) {
                console.log('🔍 Dry run - showing what would be created:');
                this.showBatchStats(commits);
                return;
            }
            
            // Create batch commits with file limit
            await this.createBatchCommits(commits.slice(0, maxFiles));
            
            // Show statistics
            this.showBatchStats(commits);
            
            console.log('\n🎉 Enhanced batch activity generation completed!');
            console.log('💡 Run "git log --oneline" to see all commits');
            
        } catch (error) {
            console.error('❌ Error in batch generation:', error.message);
        }
    }

    showBatchStats(commits) {
        const stats = {
            total: commits.length,
            byMonth: {},
            byDay: {},
            avgPerDay: 0
        };
        
        commits.forEach(commit => {
            const month = commit.date.toISOString().substr(0, 7);
            const day = commit.date.toLocaleDateString('en-US', { weekday: 'long' });
            
            stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
            stats.byDay[day] = (stats.byDay[day] || 0) + 1;
        });
        
        const uniqueDays = new Set(commits.map(c => c.date.toISOString().split('T')[0])).size;
        stats.avgPerDay = (stats.total / uniqueDays).toFixed(1);
        
        console.log('\n📊 Batch Generation Statistics:');
        console.log(`   Total commits: ${stats.total}`);
        console.log(`   Active days: ${uniqueDays}`);
        console.log(`   Average per day: ${stats.avgPerDay}`);
        
        if (Object.keys(stats.byMonth).length > 0) {
            const mostActiveMonth = Object.keys(stats.byMonth).reduce((a, b) => 
                stats.byMonth[a] > stats.byMonth[b] ? a : b
            );
            console.log(`   Most active month: ${mostActiveMonth} (${stats.byMonth[mostActiveMonth]} commits)`);
        }
        
        if (Object.keys(stats.byDay).length > 0) {
            const mostActiveDay = Object.keys(stats.byDay).reduce((a, b) => 
                stats.byDay[a] > stats.byDay[b] ? a : b
            );
            console.log(`   Most active weekday: ${mostActiveDay} (${stats.byDay[mostActiveDay]} commits)`);
        }
    }

    // Helper method to ensure directory exists
    ensureDirectoryExists(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (error) {
            console.error(`Warning: Could not create directory ${dirPath}:`, error.message);
        }
    }

    // Enhanced file generators
    generateApiDoc() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# API Documentation

Updated: ${timestamp}

## Overview
This API provides methods for automated commit generation.

## Methods

### generateDailyCommit()
Creates meaningful daily commits with project updates.

### createMicroCommits()
Generates multiple small commits for incremental changes.

### pushToRemote()
Pushes commits to the configured remote repository.

## Usage Examples
\`\`\`javascript
const booster = new CommitBooster();
await booster.generateDailyCommit();
\`\`\`
`;
    }

    generateContributingDoc() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# Contributing Guidelines

Updated: ${timestamp}

## Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Code Style
- Use ES6+ features
- Follow Node.js best practices  
- Add proper error handling
- Write descriptive commit messages

## Testing
Run tests before submitting changes:
\`\`\`bash
npm test
\`\`\`
`;
    }

    updateChangelog() {
        const timestamp = new Date().toISOString().split('T')[0];
        const version = `1.0.${Math.floor(Math.random() * 100)}`;
        
        return `# Changelog

## [${version}] - ${timestamp}

### Added
- Enhanced batch commit generation
- Improved error handling
- Better progress reporting

### Changed
- Optimized file creation process
- Updated documentation

### Fixed  
- Resolved commit message sanitization
- Fixed git user configuration issues
`;
    }

    generateSetupDoc() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# Setup Documentation

Updated: ${timestamp}

## Quick Setup

1. **Initialize the project:**
   \`\`\`bash
   npm run init
   \`\`\`

2. **Configure remote repository:**
   \`\`\`bash
   node commit-booster.js setup-remote https://github.com/username/repo.git
   \`\`\`

3. **Start daily automation:**
   \`\`\`bash
   npm run auto
   \`\`\`

## Configuration
- Set up git credentials
- Configure automation schedule
- Customize commit types

## Troubleshooting
- Check git configuration
- Verify remote repository access
- Review automation logs
`;
    }

    generateTestFile() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `// Test Suite - Updated ${timestamp}

const CommitBooster = require('./commit-booster');

describe('CommitBooster', () => {
    let booster;
    
    beforeEach(() => {
        booster = new CommitBooster();
    });
    
    test('should initialize correctly', () => {
        expect(booster).toBeDefined();
        expect(typeof booster.generateDailyCommit).toBe('function');
    });
    
    test('should create meaningful commits', async () => {
        const result = await booster.generateDailyCommit();
        expect(result).toBeTruthy();
    });
    
    test('should handle git operations', () => {
        expect(() => booster.initGit()).not.toThrow();
    });
});
`;
    }

    generateEslintConfig() {
        return JSON.stringify({
            "env": {
                "node": true,
                "es2021": true
            },
            "extends": ["eslint:recommended"],
            "parserOptions": {
                "ecmaVersion": 12,
                "sourceType": "module"
            },
            "rules": {
                "indent": ["error", 4],
                "quotes": ["error", "single"],
                "semi": ["error", "always"]
            }
        }, null, 2);
    }

    generateGitignore() {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# Git Ignore - Updated ${timestamp}

# Dependencies
node_modules/
npm-debug.log*

# Environment
.env
.env.local

# Logs
*.log
logs/

# Temporary files
*.tmp
*.temp

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Project specific
test-suite-*.js
config-updates.js
utilities.js
`;
    }

    // Additional helper methods
    createDocFile(filename, content) {
        try {
            fs.writeFileSync(filename, content);
        } catch (error) {
            console.error(`Warning: Could not create file ${filename}:`, error.message);
        }
    }

    createRefactorFile(filename, task) {
        const timestamp = new Date().toISOString().split('T')[0];
        const content = `// ${task} - ${timestamp}

module.exports = {
    // TODO: Implement ${task.toLowerCase()}
    created: '${timestamp}',
    purpose: '${task}'
};
`;
        this.createDocFile(filename, content);
    }

    generateBugFixDoc(fix) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# Bug Fix Report

**Date:** ${timestamp}
**Issue:** ${fix}

## Problem Description
${fix} was causing issues in the application.

## Solution
Implemented proper error handling and validation.

## Testing
- Manual testing completed
- Edge cases verified
- No regressions found

## Status
✅ Fixed and verified
`;
    }

    generateFeatureCode(featureName) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `// ${featureName} Feature Implementation
// Created: ${timestamp}

class ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Feature {
    constructor() {
        this.name = '${featureName}';
        this.version = '1.0.0';
        this.created = '${timestamp}';
    }
    
    initialize() {
        console.log(\`Initializing \${this.name} feature...\`);
    }
    
    execute() {
        console.log(\`Executing \${this.name} feature...\`);
        return true;
    }
}

module.exports = ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Feature;
`;
    }

    generateFeatureTest(featureName) {
        const timestamp = new Date().toISOString().split('T')[0];
        const className = featureName.charAt(0).toUpperCase() + featureName.slice(1) + 'Feature';
        
        return `// ${featureName} Feature Tests
// Created: ${timestamp}

const ${className} = require('./${featureName}');

describe('${className}', () => {
    let feature;
    
    beforeEach(() => {
        feature = new ${className}();
    });
    
    test('should initialize correctly', () => {
        expect(feature.name).toBe('${featureName}');
        expect(feature.version).toBe('1.0.0');
    });
    
    test('should execute successfully', () => {
        const result = feature.execute();
        expect(result).toBe(true);
    });
});
`;
    }

    generateFeatureDoc(featureName) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `# ${featureName.charAt(0).toUpperCase() + featureName.slice(1)} Feature

**Created:** ${timestamp}

## Overview
This document describes the ${featureName} feature implementation.

## Purpose
The ${featureName} feature provides enhanced functionality to the application.

## Usage
\`\`\`javascript
const ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Feature = require('./${featureName}');
const feature = new ${featureName.charAt(0).toUpperCase() + featureName.slice(1)}Feature();
feature.initialize();
feature.execute();
\`\`\`

## API
- \`initialize()\` - Sets up the feature
- \`execute()\` - Runs the feature functionality

## Testing
Tests are available in \`./${featureName}.test.js\`
`;
    }

    // Weekly maintenance helpers
    updateDependencies() {
        const packageFile = 'package.json';
        try {
            if (fs.existsSync(packageFile)) {
                const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
                pkg._lastMaintenance = new Date().toISOString().split('T')[0];
                fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2));
                this.commitFile(packageFile, 'chore: update package maintenance timestamp');
            }
        } catch (error) {
            console.error('Warning: Could not update dependencies:', error.message);
        }
    }

    cleanupTempFiles() {
        const cleanupLog = 'cleanup.log';
        const timestamp = new Date().toISOString().split('T')[0];
        const content = `${timestamp}: Cleaned up temporary files and optimized storage\n`;
        
        fs.appendFileSync(cleanupLog, content);
        this.commitFile(cleanupLog, 'chore: cleanup temporary files');
    }

    updateReadme() {
        const readmeFile = 'README.md';
        const timestamp = new Date().toISOString().split('T')[0];
        
        if (!fs.existsSync(readmeFile)) {
            const content = `# Commit Booster

Automated GitHub commit generation tool.

Last updated: ${timestamp}

## Features
- Daily automated commits
- Batch generation
- Web dashboard
- Multiple commit types

## Quick Start
\`\`\`bash
npm run auto
\`\`\`
`;
            fs.writeFileSync(readmeFile, content);
        } else {
            const updateLine = `\nLast maintenance: ${timestamp}\n`;
            fs.appendFileSync(readmeFile, updateLine);
        }
        
        this.commitFile(readmeFile, 'docs: update README with maintenance info');
    }

    archiveOldLogs() {
        const archiveFile = 'logs/archive.md';
        this.ensureDirectoryExists('logs');
        
        const timestamp = new Date().toISOString().split('T')[0];
        const content = `\n## Archive ${timestamp}\n- Archived old log entries\n- Optimized log storage\n- Maintained system performance\n`;
        
        if (!fs.existsSync(archiveFile)) {
            fs.writeFileSync(archiveFile, '# Log Archive\n');
        }
        
        fs.appendFileSync(archiveFile, content);
        this.commitFile(archiveFile, 'chore: archive old log entries');
    }

    generateWeeklyReport(date) {
        const reportFile = `reports/weekly-${date}.md`;
        this.ensureDirectoryExists('reports');
        
        const content = `# Weekly Report - ${date}

## Summary
- System maintenance completed
- Dependencies updated
- Temporary files cleaned
- Documentation updated
- Logs archived

## Performance
- All systems operational
- No critical issues
- Automated processes running smoothly

## Next Week
- Continue automated operations
- Monitor system performance
- Plan feature enhancements
`;
        
        fs.writeFileSync(reportFile, content);
        this.commitFile(reportFile, `docs: add weekly report for ${date}`);
    }

    // Enhanced statistics
    getDetailedStats() {
        try {
            const today = execSync('git log --oneline --since="1 day ago" | wc -l', { encoding: 'utf8' }).trim();
            const week = execSync('git log --oneline --since="1 week ago" | wc -l', { encoding: 'utf8' }).trim();
            const month = execSync('git log --oneline --since="1 month ago" | wc -l', { encoding: 'utf8' }).trim();
            const total = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
            
            console.log('📊 Detailed Commit Statistics:');
            console.log(`   Today: ${today} commits`);
            console.log(`   This week: ${week} commits`);
            console.log(`   This month: ${month} commits`);
            console.log(`   Total: ${total} commits`);
            
            // Get recent commits
            const recent = execSync('git log --oneline -5', { encoding: 'utf8' });
            console.log('\n📝 Recent Commits:');
            console.log(recent);
            
        } catch (error) {
            console.error('❌ Error getting statistics:', error.message);
            console.log('💡 Make sure you have commits in your repository');
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
        case 'docs':
            booster.createDocumentationCommits();
            break;
        case 'tests':
            booster.createTestingCommits();
            break;
        case 'feature':
            booster.createFeatureCommits(process.argv[3]);
            break;
        case 'refactor':
            booster.createRefactoringCommits();
            break;
        case 'bugfix':
            booster.createBugFixCommits();
            break;
        case 'maintenance':
            booster.createWeeklyMaintenance();
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
        case 'force-push':
            booster.forcePushToday();
            break;
        case 'auto':
        case 'run-daily':
            booster.runDailyAutomation();
            break;
        case 'status':
        case 'schedule-status':
            booster.getSchedulerStatus();
            break;
        case 'batch':
            const options = {
                daysBack: parseInt(process.argv[3]) || 365,
                daysForward: parseInt(process.argv[4]) || 0,
                frequency: parseInt(process.argv[5]) || 80,
                maxCommitsPerDay: parseInt(process.argv[6]) || 10,
                noWeekends: process.argv[7] === 'true',
                customMessages: process.argv[8] ? process.argv[8].split(',') : []
            };
            booster.generateBatchActivity(options);
            break;
        case 'high-volume':
            const hvOptions = {
                daysBack: parseInt(process.argv[3]) || 730, // 2 years
                daysForward: parseInt(process.argv[4]) || 0,
                frequency: parseInt(process.argv[5]) || 95,
                minCommitsPerDay: parseInt(process.argv[6]) || 25,
                maxCommitsPerDay: parseInt(process.argv[7]) || 50,
                noWeekends: process.argv[8] === 'true',
                customMessages: process.argv[9] ? process.argv[9].split(',') : []
            };
            booster.generateHighVolumeActivity(hvOptions);
            break;
        default:
            console.log(`
🚀 Commit Booster - Automated Daily GitHub Commits

Basic Commands:
  node commit-booster.js daily       Generate daily meaningful commits
  node commit-booster.js micro       Create multiple micro-commits
  node commit-booster.js init        Initialize git repository
  node commit-booster.js docs        Create documentation commits
  node commit-booster.js tests       Create testing and quality commits
  node commit-booster.js feature     Create feature development commits
  node commit-booster.js refactor    Create refactoring commits
  node commit-booster.js bugfix      Create bug fix commits
  node commit-booster.js maintenance Perform weekly maintenance
  node commit-booster.js stats       Show detailed commit statistics

Automation Commands:
  node commit-booster.js auto        🤖 Run daily automation (commit + push)
  node commit-booster.js push        📤 Push commits to remote repository
  node commit-booster.js setup-remote <url>  🔗 Setup remote repository
  node commit-booster.js force-push  ⚡ Force push today's commits
  node commit-booster.js status      📊 Show automation status

Batch Commands:
  node commit-booster.js batch <daysBack> <daysForward> <frequency> <maxCommitsPerDay> <noWeekends>
  Example: node commit-booster.js batch 30 0 70 5 true

High-Volume Generation (25-50 commits/day):
  node commit-booster.js high-volume <daysBack> <daysForward> <frequency> <minCommits> <maxCommits> <noWeekends>
  Example: node commit-booster.js high-volume 730 0 95 25 50 false

Quick Setup:
  1. Initialize: npm run init
  2. Set remote: node commit-booster.js setup-remote https://github.com/username/repo.git
  3. Run high-volume generation: node commit-booster.js high-volume

Examples:
  node commit-booster.js high-volume                                 # 2 years, 25-50 commits/day
  node commit-booster.js high-volume 365 0 95 30 45 true            # 1 year, 30-45 commits/day, no weekends
  node commit-booster.js auto                                        # Daily automation
`);
    }
}