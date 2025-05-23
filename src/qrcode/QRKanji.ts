import { QRMode } from './constants';

export class QRKanji {
    private data: string;
    private parsedData: number[];

    constructor(data: string) {
        this.data = data;
        this.parsedData = [];

        // Check if the data contains only valid Kanji characters
        for (let i = 0; i < this.data.length; i++) {
            const c = this.data.charCodeAt(i);
            if (!this.isValidKanji(c)) {
                throw new Error(`Invalid Kanji character: ${this.data.charAt(i)}`);
            }
        }

        // Parse the data into Kanji codes
        for (let i = 0; i < this.data.length; i++) {
            const c = this.data.charCodeAt(i);
            const code = this.getKanjiCode(c);
            this.parsedData.push(code);
        }
    }

    private isValidKanji(code: number): boolean {
        return (code >= 0x8140 && code <= 0x9ffc) || (code >= 0xe040 && code <= 0xebbf);
    }

    private getKanjiCode(code: number): number {
        if (code >= 0x8140 && code <= 0x9ffc) {
            code -= 0x8140;
        } else if (code >= 0xe040 && code <= 0xebbf) {
            code -= 0xc140;
        } else {
            throw new Error(`Invalid Kanji code: ${code}`);
        }

        const high = code >> 8;
        const low = code & 0xff;
        return high * 0xc0 + low;
    }

    getMode(): number {
        return QRMode.MODE_KANJI;
    }

    getLength(): number {
        return this.parsedData.length;
    }

    write(buffer: number[]): void {
        for (let i = 0; i < this.parsedData.length; i++) {
            buffer.push(this.parsedData[i]);
        }
    }
} 