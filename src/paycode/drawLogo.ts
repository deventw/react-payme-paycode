import { DrawLogoOptions } from './types';
import { LOGO_STROKE } from './constants';

export function drawLogo({
    ctx,
    img,
    logoWidth,
    width,
    margin,
    consumer
}: DrawLogoOptions): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, width / 2, logoWidth / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
        img,
        (width - logoWidth) / 2,
        (width - logoWidth) / 2,
        logoWidth,
        logoWidth
    );

    if (!consumer) {
        // match PM4B app
        ctx.strokeStyle = LOGO_STROKE;
        ctx.lineWidth = width * 0.015;
        ctx.stroke();
    }

    ctx.restore();
} 