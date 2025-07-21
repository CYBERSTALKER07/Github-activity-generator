// Helper functions for project operations
// Enhanced for better performance and maintainability

const { execSync } = require('child_process');

/**
 * Project helper functions
 * Last updated: 2025-07-21
 */
module.exports = {
    // Execute git commands safely
    safeGitCommand: (command, options = {}) => {
        try {
            return execSync(command, {
                encoding: 'utf8',
                stdio: 'pipe',
                ...options
            }).trim();
        } catch (error) {
            console.error('Git command failed:', command, error.message);
            return null;
        }
    },

    // Format commit messages following conventional commits
    formatCommitMessage: (type, description, scope = '') => {
        const scopeText = scope ? `(${scope})` : '';
        return `${type}${scopeText}: ${description}`;
    },

    // Get project statistics
    getProjectStats: () => {
        try {
            const stats = {
                totalCommits: execSync('git rev-list --count HEAD 2>/dev/null || echo 0', { encoding: 'utf8' }).trim(),
                currentBranch: execSync('git branch --show-current 2>/dev/null || echo "main"', { encoding: 'utf8' }).trim(),
                lastCommit: execSync('git log -1 --pretty=format:"%h - %s" 2>/dev/null || echo "No commits"', { encoding: 'utf8' }).trim(),
                timestamp: new Date().toISOString()
            };
            return stats;
        } catch (error) {
            return { error: error.message };
        }
    },

    lastUpdated: '2025-07-21'
};
