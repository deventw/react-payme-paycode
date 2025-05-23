import { DrawPayCodeOptions } from './types';
import { drawEye } from './drawEye';
import { drawIcon } from './drawIcon';
import { drawLogo } from './drawLogo';
import {
    CONSUMER_RED,
    BUSINESS_RED,
    ICON_PERCENT,
    ICON_CLIP_PERCENT,
    LOGO_PERCENT,
    LOGO_CLIP_PERCENT
} from './constants';

export function drawPayCode({
    qr,
    canvas,
    size,
    logo,
    consumer = false
}: DrawPayCodeOptions): void {
    const ctx = canvas.getContext('2d')!;
    const width = ctx.canvas.width;
    const margin = (width - size) / 2;

    const cellCount = qr.getModuleCount();
    const cellRadius = (width - margin * 2) / cellCount / 2;
    const offset = cellRadius + margin;

    const iconPercent = ICON_PERCENT;
    const iconClipPercent = ICON_CLIP_PERCENT;

    const logoPercent = LOGO_PERCENT;
    const logoClipPercent = LOGO_CLIP_PERCENT;

    // white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, width);

    if (consumer) {
        // PayMe red
        ctx.fillStyle = CONSUMER_RED;
    } else {
        // PM4B red
        ctx.fillStyle = BUSINESS_RED;
    }

    // top left eye
    drawEye({
        ctx,
        width,
        margin,
        cellRadius,
        xOffset: 0,
        yOffset: 0,
        offset
    });

    // top right eye
    drawEye({
        ctx,
        width,
        margin,
        cellRadius,
        xOffset: 2 * (cellCount - 7) * cellRadius,
        yOffset: 0,
        offset
    });

    // bottom left eye
    drawEye({
        ctx,
        width,
        margin,
        cellRadius,
        xOffset: 0,
        yOffset: 2 * (cellCount - 7) * cellRadius,
        offset
    });

    const iconWidth = (width - 2 * margin) * iconPercent;
    const logoWidth = (width - 2 * margin) * logoPercent;

    const iconClip = width - cellRadius - margin - (width - 2 * margin) * iconClipPercent;
    const logoLeftClip = width / 2 - ((width - 2 * margin) * logoClipPercent) / 2;
    const logoRightClip = width / 2 + ((width - 2 * margin) * logoClipPercent) / 2;

    // PayMe icon in bottom right
    drawIcon({
        ctx,
        iconWidth,
        width,
        margin,
        consumer
    });

    // business logo in the middle
    drawLogo({
        ctx,
        img: logo,
        logoWidth,
        width,
        margin,
        consumer
    });

    for (let r = 0; r < cellCount; r += 1) {
        for (let c = 0; c < cellCount; c += 1) {
            const x = c * cellRadius * 2 + offset;
            const y = r * cellRadius * 2 + offset;

            if (
                (r < 7 && (c < 7 || c > cellCount - 8)) ||
                (r > cellCount - 8 && c < 7)
            ) {
                // don't draw cells over the "eyes"
                continue;
            } else if (x >= iconClip && y >= iconClip) {
                // don't draw cells over the PM4B icon
                continue;
            } else if (
                x >= logoLeftClip &&
                x < logoRightClip &&
                y >= logoLeftClip &&
                y < logoRightClip
            ) {
                // don't draw cells over the logo
                continue;
            }

            if (qr.isDark(r, c)) {
                ctx.beginPath();
                ctx.arc(x, y, cellRadius, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
} 