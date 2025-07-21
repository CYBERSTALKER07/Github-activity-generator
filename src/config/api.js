// API Configuration for Commit Booster
// Clean and optimized configuration

const API_CONFIG = {
    version: '2.0.0',
    updated: '2025-01-22',
    endpoints: {
        github: {
            base: 'https://api.github.com',
            timeout: 30000,
            retries: 3
        },
        commits: {
            batchSize: 100,
            maxDaily: 50,
            rateLimitDelay: 1000
        }
    },
    features: {
        autoCommit: true,
        batchProcessing: true,
        errorRecovery: true,
        progressTracking: true
    },
    limits: {
        maxBatchSize: 100,
        dailyCommitLimit: 50,
        apiCallsPerMinute: 60
    }
};

module.exports = API_CONFIG;
