export class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 5 + 2;
        this.dx = (Math.random() - 0.5) * 5;
        this.dy = (Math.random() - 0.5) * 5;
        this.life = 1; // Lifetime of the particle
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
        this.life -= 0.02; // Fades over time
    }

    draw(ctx) {
        if (this.life > 0) {
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0; // Reset alpha
        }
    }
}
