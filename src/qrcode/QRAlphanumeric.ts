import { QRMode } from './constants';

export class QRAlphanumeric {
    private data: string;
    private parsedData: number[];

    constructor(data: string) {
        this.data = data;
        this.parsedData = [];

        // Check if the data contains only valid alphanumeric characters
        for (let i = 0; i < this.data.length; i++) {
            const c = this.data.charAt(i);
            if (!this.isValidChar(c)) {
                throw new Error(`Invalid alphanumeric character: ${c}`);
            }
        }

        // Parse the data into pairs of characters
        for (let i = 0; i < this.data.length; i += 2) {
            if (i + 1 < this.data.length) {
                this.parsedData.push(this.getCode(this.data.charAt(i)) * 45 + this.getCode(this.data.charAt(i + 1)));
            } else {
                this.parsedData.push(this.getCode(this.data.charAt(i)));
            }
        }
    }

    private isValidChar(c: string): boolean {
        return /^[0-9A-Z $%*+\-./:]*$/.test(c);
    }

    private getCode(c: string): number {
        if (c >= '0' && c <= '9') {
            return c.charCodeAt(0) - '0'.charCodeAt(0);
        } else if (c >= 'A' && c <= 'Z') {
            return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
        } else {
            switch (c) {
                case ' ': return 36;
                case '$': return 37;
                case '%': return 38;
                case '*': return 39;
                case '+': return 40;
                case '-': return 41;
                case '.': return 42;
                case '/': return 43;
                case ':': return 44;
                default: throw new Error(`Invalid alphanumeric character: ${c}`);
            }
        }
    }

    getMode(): number {
        return QRMode.MODE_ALPHA_NUM;
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