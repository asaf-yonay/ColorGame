import { accessibleColors, backgroundColors } from './constants.js';
import { Target } from './target.js';
import { Particle } from './particle.js';
import { mixColors } from './helpers.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startTime = null; // Track when the game starts
        this.score = 0;
        this.level = 1;
        this.player = {};
        window.player = this.player;
        this.targets = [];
        this.particles = [];
        this.gameActive = false;
        this.currentBgIndex = 0; // Start with the first color
        this.nextBgIndex = 1; // Keep track of the next color for transitions    
        this.setupStartButton();
        window.addEventListener('resize', () => this.resize());
    }
    
    setupPlayer(player){   
        player = { x: 0, y: 0, size: 40, color: '#0000FF', number: 1 }; 
        return player;
    }


    setupStartButton() {
        const startButton = document.getElementById('startButton');
        startButton.addEventListener('click', () => {
            this.initializeGame();
        });
    }

    setup() {
        this.startTime = Date.now(); // Record start time
        this.resize();
        this.targets = [];
        this.particles = [];
        this.spawnTargets();        
        this.player = this.setupPlayer(this.player);
        this.setupInteractionEvents();
        this.gameActive = true;
        this.startBackgroundUpdate();
    }

    initializeGame() {
        console.log('Initializing game...');
        document.getElementById('startButton').style.display = 'none'; // Hide the start button
        this.level = 1; // Reset level
        this.score = 0; // Reset score               
        this.setup(); // Reinitialize the game
        this.gameLoop();
    }
    

    endGame() {
        console.log('Game over!');
    
        // Stop the game loop
        this.gameActive = false;
    
        // Calculate the duration
        const duration = Math.floor((Date.now() - this.startTime) / 1000); // Convert to seconds
    
        // Display the game-over overlay
        const gameOverOverlay = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const finalLevelElement = document.getElementById('finalLevel');
        const finalTimeElement = document.getElementById('finalTime');
    
        finalScoreElement.textContent = this.score;
        finalLevelElement.textContent = this.level;
        finalTimeElement.textContent = `${duration} seconds`;
    
        gameOverOverlay.style.display = 'block';
    
        // Add event listener for Play Again button
        const restartButton = document.getElementById('restartButton');
        restartButton.onclick = () => {
            gameOverOverlay.style.display = 'none'; // Hide the overlay
            this.initializeGame(); // Reuse game initialization logic
        };
    }
    
    


    resize() {
        console.log('Resizing canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    spawnTargets() {
        console.log('Spawning targets');
        this.targets = []; // Clear existing targets
    
        const maxRegularTargets = 10;
        const margin = 50; // Avoid spawning too close to canvas edges
    
        for (let i = 0; i < maxRegularTargets; i++) {
            const currentNumber = (2 + i - 1) % accessibleColors.length + 1;
            const targetColor = accessibleColors.find((c) => c.number === currentNumber);
    
            const randomX = margin + Math.random() * (this.canvas.width - 2 * margin);
            const randomY = margin + Math.random() * (this.canvas.height - 2 * margin);
    
            this.targets.push(new Target(this.canvas, 2 + Math.random() * 3, targetColor, 'regular', randomX, randomY));
            console.log(`Spawned target with number: ${targetColor.number}`);
        }
    
        const hazardCount = Math.min(this.level, 5);
        for (let i = 0; i < hazardCount; i++) {
            const randomX = margin + Math.random() * (this.canvas.width - 2 * margin);
            const randomY = margin + Math.random() * (this.canvas.height - 2 * margin);
    
            this.targets.push(new Target(this.canvas, 3 + Math.random() * 2, { color: "#000000", number: -1 }, 'hazard', randomX, randomY));
            console.log('Spawned hazard target');
        }
    }
    

    setupInteractionEvents() {
        console.log('Setting up interaction events');
    
        // Mouse events
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = event.clientX - rect.left - this.player.size / 2;
            this.player.y = event.clientY - rect.top - this.player.size / 2;
        });
    
        // Touch events
        this.canvas.addEventListener('touchmove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = event.touches[0]; // Get the first touch point
            this.player.x = touch.clientX - rect.left - this.player.size / 2;
            this.player.y = touch.clientY - rect.top - this.player.size / 2;
    
            event.preventDefault(); // Prevent scrolling during gameplay
        });
    
        this.canvas.addEventListener('touchstart', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = event.touches[0];
            this.player.x = touch.clientX - rect.left - this.player.size / 2;
            this.player.y = touch.clientY - rect.top - this.player.size / 2;
    
            event.preventDefault(); // Prevent scrolling during gameplay
        });
    
        this.canvas.addEventListener('touchend', () => {
            console.log('Touch ended');
        });
    
        // Interval for collision checking
        setInterval(() => {
            this.checkCollisions();
        }, 50); // Check collisions every 50ms
    
        console.log('Interaction events and collision checking interval set up');
    }
    

    startBackgroundUpdate() {
        console.log('Starting background color update');
        setInterval(() => {
            // Use CSS transitions for smoother updates
            const canvas = this.canvas;
            const currentColor = backgroundColors[this.currentBgIndex];
            const nextColor = backgroundColors[this.nextBgIndex];
    
            // Apply transition effect using CSS
            canvas.style.transition = 'background-color 2s ease-in-out';
            canvas.style.backgroundColor = currentColor;
    
            // Cycle through colors
            this.currentBgIndex = this.nextBgIndex;
            this.nextBgIndex = (this.nextBgIndex + 1) % backgroundColors.length;
    
            console.log(`Background color updated to: ${currentColor}`);
        }, 5000); // Change background every 5 seconds
    }
    

    updateParticles() {
        this.particles.forEach((particle) => particle.update());
        this.particles = this.particles.filter((particle) => particle.life > 0);
    }

    drawParticles() {
        this.particles.forEach((particle) => particle.draw(this.ctx));
    }

    drawHintLine() {
        const validTarget = this.targets.find(target => target.number !== -1 && Math.abs(target.number - this.player.number) === 1);
        if (validTarget) {
            const dx = validTarget.x - this.player.x;
            const dy = validTarget.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const lineThickness = Math.max(1, 10 - (distance / 50)); // Thicker line when closer

            this.ctx.lineWidth = lineThickness;
            this.ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
            this.ctx.beginPath();
            this.ctx.moveTo(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2);
            this.ctx.lineTo(validTarget.x + validTarget.size / 2, validTarget.y + validTarget.size / 2);
            this.ctx.stroke();
        }
    }

    drawPlayer() {
        // Draw the player rectangle        
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);
    
        // Draw the player's number
        this.ctx.fillStyle = "#FFFFFF"; // Text color
        this.ctx.font = "bold 20px Arial";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(
            this.player.number,
            this.player.x + this.player.size / 2,
            this.player.y + this.player.size / 2
        );
    }

    updatePlayerState(target) {
        // Update player's color by blending with the target's color
        this.player.color = mixColors(this.player.color, target.color);
        // Update player's number to the target's number
        this.player.number = target.number;
    }
    

    checkCollisions() {
        // Filter targets and process collisions
        this.targets = this.targets.filter(target => {
            if (this.isColliding(this.player, target)) {
                return this.handleCollision(target); // Handle the collision and decide if the target should be removed
            }
            return true; // Keep targets that were not collided with
        });
    
        // Check if all regular targets are collected
        if (this.targets.every(target => target.type === 'hazard')) {
            console.log('All regular targets collected, starting next level');
            this.setup(); // Start the next level
        }
    }
    
    // Check if the player is colliding with a target
    isColliding(player, target) {
        return (
            player.x < target.x + target.size &&
            player.x + player.size > target.x &&
            player.y < target.y + target.size &&
            player.y + player.size > target.y
        );
    }
    
    // Handle what happens when a collision occurs
    handleCollision(target) {
        if (target.type === 'hazard') {
            console.log('Collision with hazard detected');
            this.endGame();
            return false; // Remove the hazard after collision
        }
    
        if (this.isValidTarget(target)) {
            this.processValidCollision(target);
            return false; // Remove the target after collision
        } else {
            console.log(`Invalid collision with target number: ${target.number}`);
            target.reject(); // Apply rejection logic
        }
    
        return true; // Keep the target if not removed
    }
    
    // Determine if a target is valid for the player
    isValidTarget(target) {
        return (
            target.number === this.player.number + 1 ||
            target.number === this.player.number - 1
        );
    }

    updateScoreLabel() {
        const scoreLabel = document.getElementById('score');
        if (scoreLabel) {
            scoreLabel.textContent = `Score: ${this.score}`;
        }
    }
    
    // Handle the effects of a valid collision
    processValidCollision(target) {
        console.log(`Valid collision with target number: ${target.number}`);
        this.score++;
        this.updateScoreLabel();
        this.updatePlayerState(target);
    
        // Add particle effects
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(target.x + target.size / 2, target.y + target.size / 2, target.color));
        }
    }
    

    gameLoop() {
        if (!this.gameActive) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear previous frame
    
        this.targets.forEach((target) => {
            target.update(this.player);
            target.draw(this.ctx);
        });
    
        this.updateParticles();
        this.drawParticles();
        this.drawHintLine();
        this.drawPlayer();
    
        requestAnimationFrame(() => this.gameLoop());
    }
    
}

// At the end of the init.js file, after the Game class definition
if (process.env.NODE_ENV === 'test' || window.location.search.includes('test=true')) {
    console.log("Exposing test functions for Playwright...");
    window.testFunctions = {
        isColliding: (player, target) => {
            return (
                player.x < target.x + target.size &&
                player.x + player.size > target.x &&
                player.y < target.y + target.size &&
                player.y + player.size > target.y
            );
        },
        isValidTarget: (player, target) => {
            return target.number === player.number + 1 || target.number === player.number - 1;
        },
        handleCollision: function (target) {
            const game = this; // Use the current game context
            if (target.type === 'hazard') {
                console.log('Collision with hazard detected');
                game.endGame();
                return false;
            }

            if (game.isValidTarget(game.player, target)) {
                console.log(`Valid collision with target: ${JSON.stringify(target)}`);
                game.updatePlayerState(target);
                game.score++;
                for (let i = 0; i < 10; i++) {
                    game.particles.push(new Particle(target.x, target.y, target.color));
                }
                return false; // Remove the target
            } else {
                console.log(`Invalid collision with target: ${JSON.stringify(target)}`);
                target.reject();
                return true; // Keep the target
            }
        },
        checkCollisions: function () {
            const game = this; // Use the current game context
            game.targets = game.targets.filter(target => {
                if (game.isColliding(game.player, target)) {
                    return game.handleCollision(target);
                }
                return true;
            });

            if (game.targets.every(target => target.type === 'hazard')) {
                console.log('All regular targets collected, starting next level');
                game.setup();
            }
        },
    };
}

window.onload = () => {
    console.log('Window loaded, initializing game');
    const gameInstance = new Game();
    if (window.location.search.includes('test=true')) {
        console.log('Test mode detected. Exposing game instance.');
        window.game = gameInstance; // Expose the game instance for tests
    }
};
