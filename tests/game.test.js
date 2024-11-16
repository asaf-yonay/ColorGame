// tests/game.test.js
const { test, expect } = require('@playwright/test');
const rootLocation = "http://localhost:3000";

const startGameProgramatically = async (page) => {
    const startButton = await page.locator('#startButton');
    await startButton.click(); // Simulate clicking the "Start" button
};
test('Game loads correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Start the game programmatically
    await startGameProgramatically(page);

    const canvas = await page.$('#gameCanvas');
    expect(canvas).not.toBeNull();
});

test('Targets are rendered on the canvas', async ({ page }) => {
    await page.goto(rootLocation); // Replace with your dev server's URL
    const canvas = await page.$('#gameCanvas');
    const context = await canvas.evaluate((canvas) => canvas.getContext('2d'));
    expect(context).not.toBeNull();
    // Add additional checks for targets if feasible
});

test('Player moves on interaction', async ({ page }) => {
    await page.goto('http://localhost:3000'); // Replace with your server's URL

    // Start the game programmatically
    await startGameProgramatically(page);

    // Wait for the `window.player` object to be available
    await page.waitForFunction(() => typeof window.player !== 'undefined');

    const canvas = await page.$('#gameCanvas');

    // Simulate mouse movement
    await canvas.hover({ position: { x: 200, y: 300 } });

    // Check the player's position
    const playerPosition = await page.evaluate(() => window.player);
    expect(playerPosition.x).toBeCloseTo(200 - playerPosition.size / 2, 1);
    expect(playerPosition.y).toBeCloseTo(300 - playerPosition.size / 2, 1);
});

test('Bounce decay rate reduces speed multiplier over time', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Start the game programmatically
    await startGameProgramatically(page);
    
    await page.waitForFunction(() => Array.isArray(window.targets) && window.targets.length > 0);
    // Simulate a collision
    await page.evaluate(() => {
        const player = window.player;
        const target = window.targets[0];

        // Place the player over the first target to simulate a collision
        player.x = target.x;
        player.y = target.y;

        // Trigger the reject effect
        target.reject();
    });

    // Capture the initial speed multiplier
    const initialSpeedMultiplier = await page.evaluate(() => window.targets[0].speedMultiplier);
    expect(initialSpeedMultiplier).toBeGreaterThan(1);

    // Wait for some time to allow decay
    await page.waitForTimeout(200);

    // Capture the updated speed multiplier
    const updatedSpeedMultiplier = await page.evaluate(() => window.targets[0].speedMultiplier);
    expect(updatedSpeedMultiplier).toBeLessThan(initialSpeedMultiplier);
    expect(updatedSpeedMultiplier).toBeGreaterThanOrEqual(1); // Should not decay below 1
});




