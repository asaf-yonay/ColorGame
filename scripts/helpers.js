
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
