import { QRCode } from '../qrcode/QRCode';

export interface DrawPayCodeOptions {
    qr: QRCode;
    canvas: HTMLCanvasElement;
    size: number;
    logo: HTMLImageElement;
    consumer: boolean;
}

export interface DrawEyeOptions {
    ctx: CanvasRenderingContext2D;
    width: number;
    margin: number;
    cellRadius: number;
    xOffset: number;
    yOffset: number;
    offset: number;
}

export interface DrawIconOptions {
    ctx: CanvasRenderingContext2D;
    iconWidth: number;
    width: number;
    margin: number;
    consumer: boolean;
}

export interface DrawLogoOptions {
    ctx: CanvasRenderingContext2D;
    img: HTMLImageElement;
    logoWidth: number;
    width: number;
    margin: number;
    consumer: boolean;
} 