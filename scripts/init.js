
import { Target } from './logic.js';
import { mixColors } from './helpers.js';

const accessibleColors = [
    { color: "#FF0000", number: 1 },  // Red
    { color: "#00FF00", number: 2 },  // Green
    { color: "#0000FF", number: 3 },  // Blue
    { color: "#FFFF00", number: 4 },  // Yellow
    { color: "#FF00FF", number: 5 },  // Magenta
    { color: "#00FFFF", number: 6 },  // Cyan
    { color: "#800000", number: 7 },  // Maroon
    { color: "#808000", number: 8 },  // Olive
    { color: "#008000", number: 9 },  // Dark Green
    { color: "#800080", number: 10 }, // Purple
    { color: "#008080", number: 11 }, // Teal
    { color: "#000080", number: 12 }, // Navy
    { color: "#FFA500", number: 13 }, // Orange
    { color: "#A52A2A", number: 14 }, // Brown
    { color: "#8A2BE2", number: 15 }, // Blue Violet
    { color: "#5F9EA0", number: 16 }  // Cadet Blue
];

const backgroundColors = ["#FFD700", "#00FF00", "#00FFFF", "#FF69B4", "#9370DB", "#1E90FF"]; // Background colors

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentBgIndex = 0;
        this.nextBgIndex = 1;
        this.bgTransitionProgress = 0; // Tracks interpolation progress
        this.scoreInitialized = false; // Track if score has been initialized
        this.gameOver = false; // Track if game is over
        this.setupStartButton();

        window.addEventListener('resize', () => this.resize()); // Dynamically adjust canvas size
    }

    setupStartButton() {
        const startButton = document.createElement('button');
        startButton.id = 'startButton';
        startButton.textContent = 'Start';
        startButton.style.position = 'absolute';
        startButton.style.top = '50%';
        startButton.style.left = '50%';
        startButton.style.transform = 'translate(-50%, -50%)';
        startButton.style.fontSize = '24px';
        document.body.appendChild(startButton);

        startButton.addEventListener('click', () => {
            document.body.removeChild(startButton);
            this.setup();
            this.gameLoop();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setup() {
        if (!this.scoreInitialized) {
            this.score = 0;
            this.scoreInitialized = true;
        }
    
        this.player = {
            x: 100,
            y: 100,
            size: 50,
            color: accessibleColors[0].color,
            number: accessibleColors[0].number,
        };
    
        // Expose player object globally for testing
        window.player = this.player;
    
        this.targets = [];
        this.spawnTargets();
        this.resize();
        this.setupInteractionEvents();
    
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('level').textContent = `Level: 1`;
    
        this.gameActive = true;
        this.gameOver = false;
    
        this.updateBackgroundColors(); // Set the initial background
        this.startBackgroundUpdate(); // Start the random background updates
    
        this.draw();
    
        this.canvas.style.backgroundColor = backgroundColors[this.currentBgIndex]; // Initial background
    }
    

    spawnTargets() {
        this.targets = [];
        window.targets = this.targets;
        const startNumber = 2;
        const maxTargets = 10;

        // Spawn regular targets
        for (let i = 0; i < maxTargets; i++) {
            const currentNumber = (startNumber + i - 1) % accessibleColors.length + 1;
            const targetColor = accessibleColors.find((c) => c.number === currentNumber);
            this.targets.push(new Target(this.canvas, 2 + Math.random() * 3, targetColor));
        }

        // Spawn hazard targets
        for (let i = 0; i < 2; i++) {
            this.targets.push(new Target(this.canvas, 3 + Math.random() * 2, { color: "#000000", number: null }, 'hazard'));
        }
    }

    setupInteractionEvents() {
        this.canvas.addEventListener('mousemove', (event) => {
            if (this.gameActive) {
                this.handleInteraction(event);
            }
        });

        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (this.gameActive) {
                this.handleInteraction(event.touches[0]);
            }
        }, { passive: false });
    }

    handleInteraction(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (event.clientX || event.pageX) - rect.left;
        const y = (event.clientY || event.pageY) - rect.top;

        this.player.x = x - this.player.size / 2;
        this.player.y = y - this.player.size / 2;

        this.checkCollisions();
    }

    checkCollisions() {
        this.targets = this.targets.filter((target) => {
            if (
                this.player.x < target.x + target.size &&
                this.player.x + this.player.size > target.x &&
                this.player.y < target.y + target.size &&
                this.player.y + this.player.size > target.y
            ) {
                if (target.type === 'hazard') {
                    this.endGame();
                    return false;
                }

                if (
                    target.number === this.player.number + 1 ||
                    target.number === this.player.number - 1
                ) {
                    this.score++;
                    this.player.color = mixColors(this.player.color, target.color); // Mix colors
                    this.player.number = target.number;
                    document.getElementById('score').textContent = `Score: ${this.score}`;
                    return false; // Remove the target
                } else {
                    target.reject(); // Temporarily increase speed on rejection
                }
            }
            return true; // Keep the target
        });

        if (this.targets.length === 0 && !this.gameOver) {
            this.stopBackgroundUpdate(); // Stop background updates
            this.setup(); // Directly start the next level
        }
    }

    endGame() {
        this.gameActive = false;
        this.gameOver = true;
        alert('Game Over!'); // Simple Game Over alert
    }

    updateBackgroundColors() {
        const root = document.documentElement;
        const currentColor = backgroundColors[this.currentBgIndex];
        const nextColor = backgroundColors[this.nextBgIndex];

        root.style.setProperty('--bg-color-start', currentColor);
        root.style.setProperty('--bg-color-end', nextColor);

        this.currentBgIndex = this.nextBgIndex;
        this.nextBgIndex = (this.nextBgIndex + 1) % backgroundColors.length;
    }

    startBackgroundUpdate() {
        const updateBackground = () => {
            this.updateBackgroundColors();

            // Schedule the next update at a random interval (5-10 seconds)
            const nextInterval = Math.random() * 5000 + 5000;
            this.bgTimeout = setTimeout(updateBackground, nextInterval);
        };

        updateBackground();
    }

    stopBackgroundUpdate() {
        clearTimeout(this.bgTimeout);
    }

    update() {
        if (!this.gameOver) {
            this.targets.forEach((target) => target.update(this.player)); // Pass player to target updates
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.targets.forEach((target) => target.draw(this.ctx));

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "bold 20px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.player.number, this.player.x + this.player.size / 2, this.player.y + this.player.size / 2);
    }

    gameLoop() {
        if (this.gameActive) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

window.onload = () => {
    new Game();
};
