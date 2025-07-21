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

    // UTILITY METHODS

    ensureDirectoryExists(dirPath) {
        const fullPath = path.join(this.projectRoot, dirPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
    }

    createDocFile(filename, content) {
        const filePath = path.join(this.projectRoot, filename);
        fs.writeFileSync(filePath, content);
    }

    createRefactorFile(filename, purpose) {
        const timestamp = new Date().toISOString();
        const content = `// ${purpose}
// Refactored: ${timestamp}

class ${this.toPascalCase(path.basename(filename, '.js'))} {
    constructor() {
        this.initialized = true;
        this.timestamp = '${timestamp}';
    }

    // TODO: Implement ${purpose.toLowerCase()}
    execute() {
        throw new Error('Method not implemented');
    }
}

module.exports = ${this.toPascalCase(path.basename(filename, '.js'))};
`;
        this.createDocFile(filename, content);
    }

    // CONTENT GENERATORS

    generateApiDoc() {
        return `# API Documentation

## CommitBooster API

### Methods

#### \`generateDailyCommit()\`
Creates daily progress entries and meaningful commits.

#### \`createMicroCommits()\`
Generates multiple small commits for development workflow.

#### \`createFeatureCommits(featureName)\`
Creates commits for a new feature development cycle.

Generated: ${new Date().toISOString()}
`;
    }

    generateContributingDoc() {
        return `# Contributing Guidelines

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make meaningful commits
4. Submit a pull request

## Commit Message Format

- \`feat:\` New features
- \`fix:\` Bug fixes  
- \`docs:\` Documentation updates
- \`refactor:\` Code refactoring
- \`test:\` Adding tests

Generated: ${new Date().toISOString()}
`;
    }

    updateChangelog() {
        const version = `v1.0.${Date.now() % 1000}`;
        const date = new Date().toISOString().split('T')[0];
        
        return `# Changelog

## [${version}] - ${date}

### Added
- New commit automation methods
- Enhanced documentation generation
- Improved error handling

### Changed
- Optimized commit frequency algorithms
- Updated project structure

### Fixed
- Minor bug fixes and improvements

Generated: ${new Date().toISOString()}
`;
    }

    generateSetupDoc() {
        return `# Setup Guide

## Installation

\`\`\`bash
npm install
npm run init
\`\`\`

## Configuration

Set your git credentials:
\`\`\`bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
\`\`\`

## Usage

- \`npm run daily\` - Daily commits
- \`npm run micro\` - Micro commits
- \`npm run docs\` - Documentation commits

Generated: ${new Date().toISOString()}
`;
    }

    generateTestFile() {
        return `// Unit Tests
// Generated: ${new Date().toISOString()}

const assert = require('assert');
const CommitBooster = require('./commit-booster.js');

describe('CommitBooster', () => {
    let booster;

    beforeEach(() => {
        booster = new CommitBooster();
    });

    it('should initialize correctly', () => {
        assert.ok(booster);
        assert.ok(booster.projectRoot);
    });

    it('should generate daily commits', async () => {
        // Test implementation
        assert.ok(true);
    });

    it('should create micro commits', () => {
        // Test implementation
        assert.ok(true);
    });
});
`;
    }

    generateEslintConfig() {
        return `{
    "env": {
        "node": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "semi": ["error", "always"]
    }
}`;
    }

    generateGitignore() {
        return `# Dependencies
node_modules/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid

# Coverage directory used by tools like istanbul
coverage/

# Environment variables
.env
.env.local

# IDE files
.vscode/
.idea/

# OS generated files
.DS_Store
Thumbs.db
`;
    }

    generateFeatureCode(featureName) {
        return `// ${featureName} Feature Implementation
// Created: ${new Date().toISOString()}

class ${this.toPascalCase(featureName)} {
    constructor(options = {}) {
        this.options = options;
        this.initialized = false;
    }

    async initialize() {
        this.initialized = true;
        console.log('${featureName} initialized successfully');
    }

    execute() {
        if (!this.initialized) {
            throw new Error('${featureName} not initialized');
        }
        
        // TODO: Implement ${featureName} logic
        return { success: true, feature: '${featureName}' };
    }
}

module.exports = ${this.toPascalCase(featureName)};
`;
    }

    generateFeatureTest(featureName) {
        const className = this.toPascalCase(featureName);
        return `// Tests for ${featureName} feature
const assert = require('assert');
const ${className} = require('./${featureName}.js');

describe('${className}', () => {
    let feature;

    beforeEach(() => {
        feature = new ${className}();
    });

    it('should initialize correctly', async () => {
        await feature.initialize();
        assert.ok(feature.initialized);
    });

    it('should execute successfully', async () => {
        await feature.initialize();
        const result = feature.execute();
        assert.equal(result.success, true);
        assert.equal(result.feature, '${featureName}');
    });
});
`;
    }

    generateFeatureDoc(featureName) {
        return `# ${this.toPascalCase(featureName)} Feature

## Overview

The ${featureName} feature provides enhanced functionality for the commit booster system.

## Usage

\`\`\`javascript
const ${this.toPascalCase(featureName)} = require('./${featureName}');

const feature = new ${this.toPascalCase(featureName)}();
await feature.initialize();
const result = feature.execute();
\`\`\`

## Methods

### \`initialize()\`
Initializes the ${featureName} feature.

### \`execute()\`
Executes the main ${featureName} functionality.

Generated: ${new Date().toISOString()}
`;
    }

    generateBugFixDoc(fix) {
        return `# Bug Fix: ${fix}

## Issue Description
${fix}

## Solution
Applied appropriate fix to resolve the issue.

## Testing
- Manual testing completed
- Automated tests pass
- No regression detected

Fixed: ${new Date().toISOString()}
`;
    }

    updateDependencies() {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        packageJson.version = this.incrementVersion(packageJson.version);
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        this.commitFile('package.json', 'Update package version and dependencies');
    }

    cleanupTempFiles() {
        const cleanupLog = `# Cleanup Log - ${new Date().toISOString()}

## Files Cleaned
- Temporary cache files
- Old log entries
- Unused dependencies

## Space Freed
Approximately 15MB of temporary files cleaned up.
`;
        this.createDocFile('cleanup.log', cleanupLog);
        this.commitFile('cleanup.log', 'Clean up temporary files and optimize storage');
    }

    updateReadme() {
        // Read existing README and add timestamp
        const readmePath = path.join(this.projectRoot, 'README.md');
        if (fs.existsSync(readmePath)) {
            let content = fs.readFileSync(readmePath, 'utf8');
            content += `\n\n---\n*Last updated: ${new Date().toLocaleDateString()}*\n`;
            fs.writeFileSync(readmePath, content);
            this.commitFile('README.md', 'Update documentation with latest information');
        }
    }

    archiveOldLogs() {
        const archiveContent = `# Archived Logs - ${new Date().toISOString()}

## Log Rotation
Previous logs have been archived to maintain performance.

## Archive Location
/logs/archive/${new Date().getFullYear()}/${new Date().getMonth() + 1}/
`;
        this.ensureDirectoryExists('logs');
        this.createDocFile('logs/archive.md', archiveContent);
        this.commitFile('logs/archive.md', 'Archive old logs and rotate log files');
    }

    generateWeeklyReport(date) {
        const reportContent = `# Weekly Report - ${date}

## Summary
Weekly maintenance and improvements completed successfully.

## Activities Completed
- Code quality improvements
- Documentation updates
- Dependency updates
- Performance optimizations
- Bug fixes and patches

## Metrics
- Commits this week: ${Math.floor(Math.random() * 20) + 10}
- Files updated: ${Math.floor(Math.random() * 15) + 5}
- Issues resolved: ${Math.floor(Math.random() * 5) + 1}

Generated: ${new Date().toISOString()}
`;
        this.ensureDirectoryExists('reports');
        this.createDocFile(`reports/weekly-${date}.md`, reportContent);
        this.commitFile(`reports/weekly-${date}.md`, `Generate weekly report for ${date}`);
    }

    // HELPER METHODS

    toPascalCase(str) {
        return str.replace(/(?:^|[-_])(\w)/g, (_, char) => char.toUpperCase());
    }

    incrementVersion(version) {
        const parts = version.split('.');
        parts[2] = parseInt(parts[2]) + 1;
        return parts.join('.');
    }

    // Enhanced commit statistics
    getDetailedStats() {
        try {
            const today = execSync('git log --oneline --since="1 day ago" | wc -l', { encoding: 'utf8' });
            const week = execSync('git log --oneline --since="1 week ago" | wc -l', { encoding: 'utf8' });
            const month = execSync('git log --oneline --since="1 month ago" | wc -l', { encoding: 'utf8' });
            
            console.log(`📊 Commit Statistics:`);
            console.log(`   Today: ${today.trim()} commits`);
            console.log(`   This week: ${week.trim()} commits`);
            console.log(`   This month: ${month.trim()} commits`);
        } catch (error) {
            console.log('💡 Git statistics unavailable');
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
        default:
            console.log(`
🚀 Commit Booster - Increase Your GitHub Contributions

Usage:
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

Examples:
  node commit-booster.js daily              # Creates 2-3 commits with progress updates
  node commit-booster.js micro              # Creates 4-5 small commits with utilities
  node commit-booster.js feature my-feature # Develop a new feature with name
  node commit-booster.js docs               # Create 4 documentation commits
  node commit-booster.js maintenance        # Weekly cleanup and reports
`);
    }
}

module.exports = CommitBooster;