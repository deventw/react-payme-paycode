import { QRMode } from './constants';
import { QRBitBuffer } from './QRCode';

export class QR8bitByte {
    private data: string;
    private parsedData: number[];

    constructor(data: string) {
        this.data = data;
        this.parsedData = [];

        // Add UTF-8 BOM
        this.parsedData.push(0xef, 0xbb, 0xbf);

        for (let i = 0; i < this.data.length; i++) {
            const byteArray = this.getUTF8Bytes(this.data.charAt(i));
            for (let j = 0; j < byteArray.length; j++) {
                this.parsedData.push(byteArray[j]);
            }
        }
    }

    private getUTF8Bytes(char: string): number[] {
        const code = char.charCodeAt(0);
        if (code <= 0x7f) {
            return [code];
        } else if (code <= 0x7ff) {
            return [
                0xc0 | ((code >> 6) & 0x1f),
                0x80 | (code & 0x3f)
            ];
        } else if (code <= 0xffff) {
            return [
                0xe0 | ((code >> 12) & 0x0f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
            ];
        } else if (code <= 0x1fffff) {
            return [
                0xf0 | ((code >> 18) & 0x07),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
            ];
        } else if (code <= 0x3ffffff) {
            return [
                0xf8 | ((code >> 24) & 0x03),
                0x80 | ((code >> 18) & 0x3f),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
            ];
        } else {
            return [
                0xfc | ((code >> 30) & 0x01),
                0x80 | ((code >> 24) & 0x3f),
                0x80 | ((code >> 18) & 0x3f),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f)
            ];
        }
    }

    getMode(): number {
        return QRMode.MODE_8BIT_BYTE;
    }

    getLength(): number {
        return this.parsedData.length;
    }

    write(buffer: QRBitBuffer): void {
        for (let i = 0; i < this.parsedData.length; i++) {
            buffer.put(this.parsedData[i], 8);
        }
    }
} 