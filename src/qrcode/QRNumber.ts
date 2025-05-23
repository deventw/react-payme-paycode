import { QRMode } from './constants';

export class QRNumber {
    private data: string;
    private parsedData: number[];

    constructor(data: string) {
        this.data = data;
        this.parsedData = [];

        // Check if the data contains only valid numeric characters
        if (!/^\d*$/.test(this.data)) {
            throw new Error('Invalid numeric data');
        }

        // Parse the data into groups of 3 digits
        for (let i = 0; i < this.data.length; i += 3) {
            const group = this.data.substring(i, i + 3);
            this.parsedData.push(parseInt(group, 10));
        }
    }

    getMode(): number {
        return QRMode.MODE_NUMBER;
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