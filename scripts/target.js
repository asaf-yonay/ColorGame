import { drawCloud, drawTriangle } from "./helpers";

export class Target {
    constructor(canvas, speed, colorObj, type = 'regular', x = null, y = null) {
        this.canvas = canvas;
        this.size = 40;
        this.baseSpeed = speed;
        this.speedMultiplier = 1;
        this.rejectDecayRate = 0.05;
        this.color = colorObj.color;
        this.number = colorObj.number;
        this.type = type;
        this.shape = type === 'regular' ? ['circle', 'rectangle', 'triangle', 'cloud'][Math.floor(Math.random() * 4)] : 'rectangle';
        this.scale = 1;
        this.isGlowing = false;
    
        if (x !== null && y !== null) {
            this.x = x;
            this.y = y;
        } else {
            this.spawn();
        }
    
        this.dx = (Math.random() - 0.5) * this.baseSpeed;
        this.dy = (Math.random() - 0.5) * this.baseSpeed;
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
    
        ctx.fillStyle = this.color;
    
        let textX = this.x + this.size / 2;
        let textY = this.y + this.size / 2;
    
        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
    
            case 'rectangle':
                ctx.fillRect(this.x, this.y, this.size, this.size);
                break;
    
            case 'triangle':
                const centroid = drawTriangle(ctx, this.x + this.size / 2, this.y + this.size / 2, this.size);
                textX = centroid.centroidX;
                textY = centroid.centroidY;
                break;    
    
            case 'cloud':
                drawCloud(ctx, this.x + this.size / 2, this.y + this.size / 2, this.size / 2);
                break;
        }
    
        // Draw number if regular target
        if (this.type === 'regular') {
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.number, textX, textY);
        }
    
        ctx.restore();
    }
    
    
}
