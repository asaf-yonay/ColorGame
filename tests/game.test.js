const { test, expect } = require('@playwright/test');
const rootLocation = "http://localhost:3000?test=true";

const startGameProgramatically = async (page) => {
    const startButton = await page.locator('#startButton');
    await startButton.click(); // Simulate clicking the "Start" button
};

// Helper function to ensure required objects are loaded
const ensureGameObjectExists = async (page, objectName) => {
    const exists = await page.evaluate((name) => typeof window[name] !== 'undefined', objectName);
    if (!exists) {
        throw new Error(`${objectName} is not loaded. Ensure the game is properly initialized.`);
    }
};

// Tests
test('Game loads correctly', async ({ page }) => {
    await page.goto(rootLocation);
    await startGameProgramatically(page);

    const canvas = await page.$('#gameCanvas');
    expect(canvas).not.toBeNull();
});

test('Targets are rendered on the canvas', async ({ page }) => {
    await page.goto(rootLocation);
    await ensureGameObjectExists(page, 'game'); // Check if the game object exists

    const canvas = await page.$('#gameCanvas');
    const context = await canvas.evaluate((canvas) => canvas.getContext('2d'));
    expect(context).not.toBeNull();
});

test('Player moves on interaction', async ({ page }) => {
    await page.goto(rootLocation);
    await startGameProgramatically(page);
    await ensureGameObjectExists(page, 'player'); // Check if the player object exists

    const canvas = await page.$('#gameCanvas');

    // Simulate mouse movement
    await canvas.hover({ position: { x: 200, y: 300 } });

    // Check the player's position
    const playerPosition = await page.evaluate(() => window.player);
    expect(playerPosition.x).toBeCloseTo(200);
    expect(playerPosition.y).toBeCloseTo(300);
});

test('isColliding detects overlaps correctly', async ({ page }) => {
    await page.goto(rootLocation);
    await ensureGameObjectExists(page, 'testFunctions'); // Check if test functions are loaded

    const result = await page.evaluate(() => {
        const player = { x: 50, y: 50, size: 40 };
        const target = { x: 70, y: 70, size: 40 };
        return window.testFunctions.isColliding(player, target);
    });

    expect(result).toBe(true);
});

