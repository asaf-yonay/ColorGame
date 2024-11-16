// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 2, // Retry tests on failure
    use: {
        headless: true, // Run tests in headless mode
        viewport: { width: 1280, height: 720 },
        video: 'on-first-retry', // Record video on first retry
        screenshot: 'only-on-failure', // Take screenshots on failure
    },
});
