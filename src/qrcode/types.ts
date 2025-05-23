export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type Mode = 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji';

export interface QRCode {
    addData: (text: string, mode: Mode) => void;
    make: () => void;
    isDark: (row: number, col: number) => boolean;
    getModuleCount: () => number;
    createTableTag: (cellSize?: number, margin?: number) => string;
    createSvgTag: (cellSize?: number, margin?: number) => string;
    createDataURL: (cellSize?: number, margin?: number) => string;
    createImgTag: (cellSize?: number, margin?: number, alt?: string) => string;
    createASCII: (cellSize?: number, margin?: number) => string;
    renderTo2dContext: (context: CanvasRenderingContext2D, cellSize?: number) => void;
}

export interface QRCodeModule {
    (typeNumber: number, errorCorrectionLevel: ErrorCorrectionLevel): QRCode;
    stringToBytesFuncs: { [key: string]: (s: string) => number[] };
    stringToBytes: (s: string) => number[];
} 