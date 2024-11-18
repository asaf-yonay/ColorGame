
// Helper function to blend two colors
export function mixColors(color1, color2) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 1, 1);
    const c1 = ctx.getImageData(0, 0, 1, 1).data;

    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, 1, 1);
    const c2 = ctx.getImageData(0, 0, 1, 1).data;

    const mixed = {
        r: Math.round((c1[0] + c2[0]) / 2),
        g: Math.round((c1[1] + c2[1]) / 2),
        b: Math.round((c1[2] + c2[2]) / 2)
    };

    return `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
}

export function drawCloud(ctx, x, y, baseRadius) {
    const scaleFactor = 1.5; // Scale factor to make clouds bigger
    const radius = baseRadius * scaleFactor;

    ctx.beginPath();
    ctx.arc(x - radius / 2, y, radius / 2, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x, y - radius / 2, radius / 2, Math.PI, Math.PI * 2);
    ctx.arc(x + radius / 2, y, radius / 2, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();
}


export function drawTriangle(ctx, x, y, size) {
    const scaleFactor = 1.3; // Scale factor for enlarging triangles
    const adjustedSize = size * scaleFactor;
    const height = (Math.sqrt(3) / 2) * adjustedSize; // Calculate the height of the scaled triangle

    // Draw the triangle
    ctx.beginPath();
    ctx.moveTo(x, y - height / 2); // Top vertex
    ctx.lineTo(x - adjustedSize / 2, y + height / 2); // Bottom-left vertex
    ctx.lineTo(x + adjustedSize / 2, y + height / 2); // Bottom-right vertex
    ctx.closePath();
    ctx.fill();

    // Calculate the centroid for text alignment
    const centroidX = x;
    const centroidY = y + height / 6; // Adjust vertically for better centering

    return { centroidX, centroidY }; // Return centroid for text placement
}


