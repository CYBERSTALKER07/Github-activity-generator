// Utility functions for project automation
// Last updated: 2025-07-21

const fs = require('fs');
const path = require('path');

/**
 * Enhanced utility functions for better code maintainability
 * Updated: 2025-07-21T22:57:06.727Z
 */
module.exports = {
    // Generate timestamp with timezone
    getCurrentTimestamp: () => {
        return new Date().toISOString();
    },

    // Validate file existence with error handling
    fileExists: (filePath) => {
        try {
            return fs.existsSync(filePath);
        } catch (error) {
            console.error('File validation error:', error.message);
            return false;
        }
    },

    // Safe JSON parsing with fallback
    safeJsonParse: (jsonString, fallback = {}) => {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON parse error, using fallback:', error.message);
            return fallback;
        }
    },

    // Enhanced logging with levels
    log: {
        info: (message) => console.log('ℹ️', message),
        warn: (message) => console.warn('⚠️', message),
        error: (message) => console.error('❌', message),
        success: (message) => console.log('✅', message)
    },

    // Version information
    version: '1.0.0',
    lastUpdated: '2025-07-21'
};
