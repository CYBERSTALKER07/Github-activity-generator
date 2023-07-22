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

    // Initialize git if not already done
    initGit() {
        try {
            execSync('git status', { stdio: 'ignore' });
            console.log('✅ Git repository already initialized');
        } catch (error) {
            console.log('🔄 Initializing git repository...');
            execSync('git init', { stdio: 'inherit' });
            this.configureGitUser();
            console.log('✅ Git initialized!');
        }
    }

    // Configure git user if not set
    configureGitUser() {
        try {
            console.log('⚙️  Configuring git user...');
            
            // Check if user.name is set
            try {
                execSync('git config user.name', { stdio: 'pipe' });
            } catch (error) {
                execSync('git config user.name "GitHub Contributor"', { stdio: 'pipe' });
                console.log('✅ Set git user.name to "GitHub Contributor"');
            }
            
            // Check if user.email is set
            try {
                execSync('git config user.email', { stdio: 'pipe' });
            } catch (error) {
                execSync('git config user.email "contributor@example.com"', { stdio: 'pipe' });
                console.log('✅ Set git user.email to "contributor@example.com"');
                console.log('💡 You can change this later with: git config user.email "your-email@example.com"');
            }
        } catch (configError) {
            console.error('❌ Failed to configure git user:', configError.message);
            throw new Error('Git user configuration required. Please set git config user.name and user.email');
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

    // Sanitize commit messages to prevent shell injection
    sanitizeCommitMessage(message) {
        return message
            .replace(/"/g, '\\"')  // Escape double quotes
            .replace(/'/g, "\\'")  // Escape single quotes
            .replace(/`/g, '\\`')  // Escape backticks
            .replace(/\$/g, '\\$') // Escape dollar signs
            .trim();
    }

    // Generate varied commit messages for high-volume commits
    generateVariedCommitMessage(date, commitIndex, customMessages = []) {
        const commitTypes = [
            'feat', 'fix', 'docs', 'style', 'refactor', 
            'perf', 'test', 'build', 'ci', 'chore'
        ];
        
        const messageGroups = {
            feat: [
                'add new utility function', 'implement helper method', 'create data validator',
                'add error handler', 'improve function logic', 'optimize algorithm',
                'enhance performance', 'add type checking', 'implement cache system',
                'create middleware'
            ],
            fix: [
                'resolve edge case', 'fix validation logic', 'correct error handling',
                'resolve memory leak', 'fix async operation', 'resolve race condition',
                'fix null pointer', 'correct calculation', 'resolve timeout issue',
                'fix compatibility issue'
            ],
            docs: [
                'update API documentation', 'improve code comments', 'add usage examples',
                'update README', 'add inline documentation', 'improve method descriptions',
                'add troubleshooting guide', 'update changelog', 'add configuration docs',
                'improve setup instructions'
            ],
            style: [
                'improve code formatting', 'update indentation', 'standardize naming',
                'clean up whitespace', 'organize imports', 'improve code structure',
                'standardize quotes', 'clean up comments', 'improve readability',
                'format JSON files'
            ],
            refactor: [
                'extract utility function', 'simplify conditional logic', 'improve code organization',
                'reduce code duplication', 'enhance modularity', 'improve error handling',
                'optimize data structures', 'streamline workflow', 'improve method signatures',
                'enhance code clarity'
            ],
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

    // Create meaningful changes for high-volume commits
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

    updateProgressLog(date, index) {
        const dateStr = date.toISOString().split('T')[0];
        const logEntry = `\n## ${dateStr}\n- Commit #${index + 1}: Enhanced project functionality\n- Improved code structure and maintainability\n- Updated documentation and comments\n`;
        
        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '# Project Progress Log\n\nThis log tracks daily improvements and changes.\n');
        }
        
        fs.appendFileSync(this.logFile, logEntry);
    }

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

    updateDocumentation(date, index) {
        const dateStr = date.toISOString().split('T')[0];
        const docTypes = ['API.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'README.md'];
        const selectedDoc = docTypes[index % docTypes.length];
        
        const updateContent = `\n### Update ${dateStr} - Entry ${index}\n- Improved documentation clarity\n- Added examples and usage notes\n- Enhanced readability\n`;
        
        if (!fs.existsSync(selectedDoc)) {
            const headers = {
                'API.md': '# API Documentation\n',
                'CONTRIBUTING.md': '# Contributing Guidelines\n',
                'CHANGELOG.md': '# Changelog\n',
                'README.md': '# Project README\n'
            };
            fs.writeFileSync(selectedDoc, headers[selectedDoc] || '# Documentation\n');
        }
        
        fs.appendFileSync(selectedDoc, updateContent);
    }

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

    createFallbackChange(date, index) {
        const dateStr = date.toISOString().split('T')[0];
        const fallbackContent = `${dateStr}: Commit ${index + 1} - System maintenance and improvements\n`;
        
        const fallbackFile = 'maintenance.log';
        if (!fs.existsSync(fallbackFile)) {
            fs.writeFileSync(fallbackFile, 'System Maintenance Log\n========================\n\n');
        }
        
        fs.appendFileSync(fallbackFile, fallbackContent);
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
                
                // Show progress every 25 commits
                if (i % 25 === 0 || i === commits.length - 1) {
                    process.stdout.write(`\r📝 Progress: ${progress}% (${successfulCommits}/${i + 1})`);
                }
                
            } catch (error) {
                skippedCommits++;
                continue;
            }
        }
        
        console.log(`\n✅ Batch completed: ${successfulCommits} successful, ${skippedCommits} skipped`);
        return { successful: successfulCommits, skipped: skippedCommits };
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
            noWeekends: false
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
            console.log('   - Run "git log --oneline | head -20" to see recent commits');
            console.log('   - Run "git log --graph --pretty=format:\'%h %s\' | head -10" for a visual log');
            console.log('   - Push to GitHub to see your contribution graph fill up!');
            
        } catch (error) {
            console.error('❌ Error in high-volume generation:', error.message);
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
    }
}

module.exports = CommitBooster;

// CLI Interface
if (require.main === module) {
    const booster = new CommitBooster();
    const command = process.argv[2];

    switch (command) {
        case 'init':
            booster.initGit();
            break;
        case 'high-volume':
            const hvOptions = {
                daysBack: parseInt(process.argv[3]) || 730, // 2 years
                daysForward: parseInt(process.argv[4]) || 0,
                frequency: parseInt(process.argv[5]) || 95,
                minCommitsPerDay: parseInt(process.argv[6]) || 25,
                maxCommitsPerDay: parseInt(process.argv[7]) || 50,
                noWeekends: process.argv[8] === 'true'
            };
            booster.generateHighVolumeActivity(hvOptions);
            break;
        default:
            console.log(`
🚀 Commit Booster - High Volume GitHub Commits

Commands:
  node commit-booster-fixed.js init         Initialize git repository
  node commit-booster-fixed.js high-volume  Generate high-volume commits (25-50/day for 2 years)

High-Volume Generation:
  node commit-booster-fixed.js high-volume <daysBack> <daysForward> <frequency> <minCommits> <maxCommits> <noWeekends>

Examples:
  node commit-booster-fixed.js high-volume                      # 2 years, 25-50 commits/day
  node commit-booster-fixed.js high-volume 365 0 95 30 45 false # 1 year, 30-45 commits/day
  node commit-booster-fixed.js high-volume 730 0 95 25 50 true  # 2 years, no weekends

Quick Setup:
  1. node commit-booster-fixed.js init
  2. node commit-booster-fixed.js high-volume
  3. git remote add origin https://github.com/username/repo.git
  4. git push -u origin main
`);
    }
}
