export class Target {
    constructor(canvas, speed, colorObj, type = 'regular') {
        this.canvas = canvas;
        this.size = 40;
        this.baseSpeed = speed;
        this.speedMultiplier = 1; // Starts at normal speed
        this.rejectDecayRate = 0.05; // Refined decay rate
        this.color = colorObj.color;
        this.number = colorObj.number;
        this.type = type; // Can be 'regular' or 'hazard'
        this.shape = ['circle', 'rectangle'][Math.floor(Math.random() * 2)]; // Random shape
        this.scale = 1; // For bounce animation
        this.isGlowing = false; // Glow effect for valid targets
        this.skullImage = new Image();
        this.isImageLoaded = false;
    
        // Load the skull image
        this.skullImage.onload = () => {
            this.isImageLoaded = true;
        };
        this.skullImage.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Skull_and_crossbones.svg/1024px-Skull_and_crossbones.svg.png';
    
        this.spawn();
    }
    

    spawn() {
        const margin = 50;
        this.x = margin + Math.random() * (this.canvas.width - this.size - margin * 2);
        this.y = margin + Math.random() * (this.canvas.height - this.size - margin * 2);
        this.dx = (Math.random() - 0.5) * this.baseSpeed;
        this.dy = (Math.random() - 0.5) * this.baseSpeed;
    }

    reject() {
        this.speedMultiplier = Math.min(this.speedMultiplier + 1.2, 3); // Increment and cap speedMultiplier at 3
        this.scale = 1.3; // Slightly enlarge for bounce effect
    }

    update(player) {
        // Gradually restore the speed multiplier and scale
        this.speedMultiplier = Math.max(1, this.speedMultiplier - this.rejectDecayRate);
        this.scale = Math.max(1, this.scale - 0.05);

        // Check if the target should glow (proximity to player number)
        if (this.type === 'regular') {
            this.isGlowing = Math.abs(this.number - player.number) === 1;
        }

        // Apply velocity with multiplier
        this.x += this.dx * this.speedMultiplier;
        this.y += this.dy * this.speedMultiplier;

        // Bounce off walls
        if (this.x <= 0 || this.x + this.size >= this.canvas.width) {
            this.dx *= -1;
            this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.size));
        }
        if (this.y <= 0 || this.y + this.size >= this.canvas.height) {
            this.dy *= -1;
            this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.size));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.scale(this.scale, this.scale);
        ctx.translate(-(this.x + this.size / 2), -(this.y + this.size / 2));

        if (this.type === 'hazard') {
            ctx.fillStyle = "#000000";
            ctx.fillRect(this.x, this.y, this.size, this.size);
            if (this.isImageLoaded) {
                ctx.drawImage(this.skullImage, this.x, this.y, this.size, this.size);
            }            
        } else {
            // Draw glow effect if applicable
            if (this.isGlowing) {
                ctx.shadowColor = "rgba(255, 255, 0, 0.8)";
                ctx.shadowBlur = 10;
            } else {
                ctx.shadowBlur = 0;
            }

            // Draw the shape
            ctx.fillStyle = this.color;
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'rectangle') {
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }

            // Draw number if regular target
            if (this.type === 'regular') {
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "bold 20px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.number, this.x + this.size / 2, this.y + this.size / 2);
            }
        }

        ctx.restore();
    }
}
