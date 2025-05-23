import { DrawEyeOptions } from './types';

export function drawEye({
    ctx,
    width,
    margin,
    cellRadius,
    xOffset,
    yOffset,
    offset
}: DrawEyeOptions): void {
    // outer edge
    ctx.beginPath();
    ctx.moveTo(
        xOffset + 11 * cellRadius + margin,
        yOffset + 0 * cellRadius + margin
    );
    ctx.arcTo(
        xOffset + 14 * cellRadius + margin,
        yOffset + 0 * cellRadius + margin,
        xOffset + 14 * cellRadius + margin,
        yOffset + 3 * cellRadius + margin,
        3 * cellRadius
    );

    ctx.arcTo(
        xOffset + 14 * cellRadius + margin,
        yOffset + 14 * cellRadius + margin,
        xOffset + 12 * cellRadius + margin,
        yOffset + 14 * cellRadius + margin,
        3 * cellRadius
    );

    ctx.arcTo(
        xOffset + 0 * cellRadius + margin,
        yOffset + 14 * cellRadius + margin,
        xOffset + 0 * cellRadius + margin,
        yOffset + 11 * cellRadius + margin,
        3 * cellRadius
    );

    ctx.arcTo(
        xOffset + 0 * cellRadius + margin,
        yOffset + 0 * cellRadius + margin,
        xOffset + 3 * cellRadius + margin,
        yOffset + 0 * cellRadius + margin,
        3 * cellRadius
    );
    ctx.lineTo(
        xOffset + 11 * cellRadius + margin,
        yOffset + 0 * cellRadius + margin
    );

    // inner edge
    ctx.moveTo(
        xOffset + 4 * cellRadius + margin,
        yOffset + 2 * cellRadius + margin
    );
    ctx.arcTo(
        xOffset + 2 * cellRadius + margin,
        yOffset + 2 * cellRadius + margin,
        xOffset + 2 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin,
        2 * cellRadius
    );

    ctx.arcTo(
        xOffset + 2 * cellRadius + margin,
        yOffset + 12 * cellRadius + margin,
        xOffset + 4 * cellRadius + margin,
        yOffset + 12 * cellRadius + margin,
        2 * cellRadius
    );

    ctx.arcTo(
        xOffset + 12 * cellRadius + margin,
        yOffset + 12 * cellRadius + margin,
        xOffset + 12 * cellRadius + margin,
        yOffset + 10 * cellRadius + margin,
        2 * cellRadius
    );

    ctx.arcTo(
        xOffset + 12 * cellRadius + margin,
        yOffset + 2 * cellRadius + margin,
        xOffset + 10 * cellRadius + margin,
        yOffset + 2 * cellRadius + margin,
        2 * cellRadius
    );
    ctx.lineTo(
        xOffset + 4 * cellRadius + margin,
        yOffset + 2 * cellRadius + margin
    );

    ctx.closePath();
    ctx.fill();

    // central rect
    ctx.beginPath();
    ctx.moveTo(
        xOffset + 8 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin
    );
    ctx.arcTo(
        xOffset + 10 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin,
        xOffset + 10 * cellRadius + margin,
        yOffset + 6 * cellRadius + margin,
        cellRadius
    );

    ctx.arcTo(
        xOffset + 10 * cellRadius + margin,
        yOffset + 10 * cellRadius + margin,
        xOffset + 8 * cellRadius + margin,
        yOffset + 10 * cellRadius + margin,
        cellRadius
    );

    ctx.arcTo(
        xOffset + 4 * cellRadius + margin,
        yOffset + 10 * cellRadius + margin,
        xOffset + 4 * cellRadius + margin,
        yOffset + 8 * cellRadius + margin,
        cellRadius
    );

    ctx.arcTo(
        xOffset + 4 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin,
        xOffset + 6 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin,
        cellRadius
    );
    ctx.lineTo(
        xOffset + 8 * cellRadius + margin,
        yOffset + 4 * cellRadius + margin
    );
    ctx.closePath();
    ctx.fill();
} 