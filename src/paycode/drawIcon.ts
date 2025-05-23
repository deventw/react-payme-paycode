import { DrawIconOptions } from './types';
import { CONSUMER_ICON, BUSINESS_ICON, BUSINESS_STROKE } from './constants';

export function drawIcon({
    ctx,
    iconWidth,
    width,
    margin,
    consumer
}: DrawIconOptions): void {
    const icon = new Image();

    const xOffset = width - margin - iconWidth;
    const yOffset = width - margin - iconWidth;

    // Apple design guidelines state that corner radius is 80px for a 512px icon
    const cornerRadius = (iconWidth * 80) / 512;
    const edgeLength = iconWidth - cornerRadius;

    icon.onload = function () {
        ctx.save();
        ctx.beginPath();

        ctx.moveTo(xOffset + edgeLength, yOffset);
        ctx.arcTo(
            xOffset + edgeLength + cornerRadius,
            yOffset,
            xOffset + edgeLength + cornerRadius,
            yOffset + cornerRadius,
            cornerRadius
        );

        ctx.arcTo(
            xOffset + edgeLength + cornerRadius,
            yOffset + edgeLength + cornerRadius,
            xOffset + edgeLength,
            yOffset + edgeLength + cornerRadius,
            cornerRadius
        );

        ctx.arcTo(
            xOffset,
            yOffset + edgeLength + cornerRadius,
            xOffset,
            yOffset + edgeLength,
            cornerRadius
        );

        ctx.arcTo(xOffset, yOffset, xOffset + cornerRadius, yOffset, cornerRadius);
        ctx.lineTo(xOffset + edgeLength, yOffset);
        ctx.closePath();

        ctx.clip();
        ctx.drawImage(icon, xOffset, yOffset, iconWidth, iconWidth);

        if (!consumer) {
            ctx.strokeStyle = BUSINESS_STROKE;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }

        ctx.restore();
    };

    icon.src = consumer ? CONSUMER_ICON : BUSINESS_ICON;
} 