import { ErrorCorrectionLevel, Mode, QRCode as IQRCode } from './types';
import { QRMode, QRErrorCorrectionLevel, QRMaskPattern, PATTERN_POSITION_TABLE } from './constants';
import { QRMath } from './utils/QRMath';
import { QRPolynomial } from './utils/QRPolynomial';
import { QRRSBlock } from './utils/QRRSBlock';
import { QRUtil } from './utils/QRUtil';
import { QR8bitByte } from './QR8bitByte';
import { QRAlphanumeric } from './QRAlphanumeric';
import { QRNumber } from './QRNumber';
import { QRKanji } from './QRKanji';

export class QRBitBuffer {
    private _buffer: number[] = [];
    private _length: number = 0;

    getBuffer(): number[] {
        return this._buffer;
    }

    getAt(index: number): boolean {
        const bufIndex = Math.floor(index / 8);
        return ((this._buffer[bufIndex] >>> (7 - index % 8)) & 1) === 1;
    }

    put(num: number, length: number): void {
        for (let i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) === 1);
        }
    }

    getLengthInBits(): number {
        return this._length;
    }

    putBit(bit: boolean): void {
        const bufIndex = Math.floor(this._length / 8);
        if (this._buffer.length <= bufIndex) {
            this._buffer.push(0);
        }

        if (bit) {
            this._buffer[bufIndex] |= (0x80 >>> (this._length % 8));
        }

        this._length++;
    }
}

export class QRCode implements IQRCode {
    private _typeNumber: number;
    private _errorCorrectionLevel: number;
    private _modules: boolean[][] | null = null;
    private _moduleCount = 0;
    private _dataCache: number[] | null = null;
    private _dataList: any[] = [];

    constructor(typeNumber: number, errorCorrectionLevel: ErrorCorrectionLevel) {
        this._typeNumber = typeNumber;
        this._errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    }

    addData(data: string, mode: Mode = 'Byte'): void {
        let newData: any;

        switch (mode) {
            case 'Numeric':
                newData = new QRNumber(data);
                break;
            case 'Alphanumeric':
                newData = new QRAlphanumeric(data);
                break;
            case 'Byte':
                newData = new QR8bitByte(data);
                break;
            case 'Kanji':
                newData = new QRKanji(data);
                break;
            default:
                throw new Error(`Invalid mode: ${mode}`);
        }

        this._dataList.push(newData);
        this._dataCache = null;
    }

    make(): void {
        if (this._typeNumber < 1) {
            let typeNumber = 1;
            for (; typeNumber < 40; typeNumber++) {
                const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this._errorCorrectionLevel);
                const buffer = new QRBitBuffer();

                for (let i = 0; i < this._dataList.length; i++) {
                    const data = this._dataList[i];
                    buffer.put(data.getMode(), 4);
                    buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
                    data.write(buffer);
                }

                let totalDataCount = 0;
                for (let i = 0; i < rsBlocks.length; i++) {
                    totalDataCount += rsBlocks[i].dataCount;
                }

                if (buffer.getLengthInBits() <= totalDataCount * 8) {
                    break;
                }
            }

            this._typeNumber = typeNumber;
        }

        this.makeImpl(false, this.getBestMaskPattern());
    }

    private makeImpl(test: boolean, maskPattern: number): void {
        this._moduleCount = this._typeNumber * 4 + 17;
        this._modules = Array(this._moduleCount).fill(null).map(() => Array(this._moduleCount).fill(null));

        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this._moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this._moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);

        if (this._typeNumber >= 7) {
            this.setupTypeNumber(test);
        }

        if (this._dataCache == null) {
            this._dataCache = this.createData(this._typeNumber, this._errorCorrectionLevel, this._dataList);
        }

        this.mapData(this._dataCache, maskPattern);
    }

    private setupPositionProbePattern(row: number, col: number): void {
        for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || this._moduleCount <= row + r) continue;

            for (let c = -1; c <= 7; c++) {
                if (col + c <= -1 || this._moduleCount <= col + c) continue;

                if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
                    (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
                    (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this._modules![row + r][col + c] = true;
                } else {
                    this._modules![row + r][col + c] = false;
                }
            }
        }
    }

    private setupPositionAdjustPattern(): void {
        const pos = QRUtil.getPatternPosition(this._typeNumber);

        for (let i = 0; i < pos.length; i++) {
            for (let j = 0; j < pos.length; j++) {
                const row = pos[i];
                const col = pos[j];

                if (this._modules![row][col] != null) {
                    continue;
                }

                for (let r = -2; r <= 2; r++) {
                    for (let c = -2; c <= 2; c++) {
                        if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                            this._modules![row + r][col + c] = true;
                        } else {
                            this._modules![row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }

    private setupTimingPattern(): void {
        for (let r = 8; r < this._moduleCount - 8; r++) {
            if (this._modules![r][6] != null) {
                continue;
            }
            this._modules![r][6] = (r % 2 === 0);
        }

        for (let c = 8; c < this._moduleCount - 8; c++) {
            if (this._modules![6][c] != null) {
                continue;
            }
            this._modules![6][c] = (c % 2 === 0);
        }
    }

    private setupTypeInfo(test: boolean, maskPattern: number): void {
        const data = (this._errorCorrectionLevel << 3) | maskPattern;
        const bits = QRUtil.getBCHTypeInfo(data);

        // vertical
        for (let i = 0; i < 15; i++) {
            const mod = (!test && ((bits >> i) & 1) === 1);

            if (i < 6) {
                this._modules![i][8] = mod;
            } else if (i < 8) {
                this._modules![i + 1][8] = mod;
            } else {
                this._modules![this._moduleCount - 15 + i][8] = mod;
            }
        }

        // horizontal
        for (let i = 0; i < 15; i++) {
            const mod = (!test && ((bits >> i) & 1) === 1);

            if (i < 8) {
                this._modules![8][this._moduleCount - i - 1] = mod;
            } else if (i < 9) {
                this._modules![8][15 - i - 1 + 1] = mod;
            } else {
                this._modules![8][15 - i - 1] = mod;
            }
        }

        // fixed module
        this._modules![this._moduleCount - 8][8] = (!test);
    }

    private setupTypeNumber(test: boolean): void {
        const bits = QRUtil.getBCHTypeNumber(this._typeNumber);

        for (let i = 0; i < 18; i++) {
            const mod = (!test && ((bits >> i) & 1) === 1);
            this._modules![Math.floor(i / 3)][i % 3 + this._moduleCount - 8 - 3] = mod;
        }

        for (let i = 0; i < 18; i++) {
            const mod = (!test && ((bits >> i) & 1) === 1);
            this._modules![i % 3 + this._moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    }

    private getBestMaskPattern(): number {
        let minLostPoint = 0;
        let pattern = 0;

        for (let i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            const lostPoint = QRUtil.getLostPoint(this);

            if (i === 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }

        return pattern;
    }

    private createData(typeNumber: number, errorCorrectionLevel: number, dataList: any[]): number[] {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);
        const buffer = new QRBitBuffer();

        for (let i = 0; i < dataList.length; i++) {
            const data = dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
            data.write(buffer);
        }

        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }

        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error(`Code length overflow. (${buffer.getLengthInBits()}>${totalDataCount * 8})`);
        }

        // end code
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
        }

        // padding
        while (buffer.getLengthInBits() % 8 !== 0) {
            buffer.putBit(false);
        }

        // padding
        while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(0xEC, 8);

            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(0x11, 8);
        }

        return this.createBytes(buffer, rsBlocks);
    }

    private createBytes(buffer: QRBitBuffer, rsBlocks: any[]): number[] {
        let offset = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;

        const dcdata: number[][] = new Array(rsBlocks.length);
        const ecdata: number[][] = new Array(rsBlocks.length);

        for (let r = 0; r < rsBlocks.length; r++) {
            const dcCount = rsBlocks[r].dataCount;
            const ecCount = rsBlocks[r].totalCount - dcCount;

            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);

            dcdata[r] = new Array(dcCount);
            for (let i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
            }
            offset += dcCount;

            const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            const rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

            const modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (let i = 0; i < ecdata[r].length; i++) {
                const modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
            }
        }

        let totalCodeCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }

        const data = new Array(totalCodeCount);
        let index = 0;

        for (let i = 0; i < maxDcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index] = dcdata[r][i];
                    index++;
                }
            }
        }

        for (let i = 0; i < maxEcCount; i++) {
            for (let r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index] = ecdata[r][i];
                    index++;
                }
            }
        }

        return data;
    }

    private mapData(data: number[], maskPattern: number): void {
        let inc = -1;
        let row = this._moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        const maskFunc = QRUtil.getMaskFunction(maskPattern);

        for (let col = this._moduleCount - 1; col > 0; col -= 2) {
            if (col === 6) col--;

            while (true) {
                for (let c = 0; c < 2; c++) {
                    if (this._modules![row][col - c] === null) {
                        let dark = false;

                        if (byteIndex < data.length) {
                            dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
                        }

                        const mask = maskFunc(row, col - c);

                        if (mask) {
                            dark = !dark;
                        }

                        this._modules![row][col - c] = dark;
                        bitIndex--;

                        if (bitIndex === -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }

                row += inc;

                if (row < 0 || this._moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }

    isDark(row: number, col: number): boolean {
        if (row < 0 || this._moduleCount <= row || col < 0 || this._moduleCount <= col) {
            throw new Error(`${row},${col}`);
        }
        return this._modules![row][col];
    }

    getModuleCount(): number {
        return this._moduleCount;
    }

    renderTo2dContext(context: CanvasRenderingContext2D, cellSize: number = 2): void {
        const length = this.getModuleCount();
        for (let row = 0; row < length; row++) {
            for (let col = 0; col < length; col++) {
                context.fillStyle = this.isDark(row, col) ? 'black' : 'white';
                context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
        }
    }

    createTableTag(cellSize: number = 2, margin: number = cellSize * 4): string {
        let qrHtml = '';
        qrHtml += '<table style="';
        qrHtml += ' border-width: 0px; border-style: none;';
        qrHtml += ' border-collapse: collapse;';
        qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
        qrHtml += '">';
        qrHtml += '<tbody>';

        for (let r = 0; r < this.getModuleCount(); r++) {
            qrHtml += '<tr>';

            for (let c = 0; c < this.getModuleCount(); c++) {
                qrHtml += '<td style="';
                qrHtml += ' border-width: 0px; border-style: none;';
                qrHtml += ' border-collapse: collapse;';
                qrHtml += ' padding: 0px; margin: 0px;';
                qrHtml += ' width: ' + cellSize + 'px;';
                qrHtml += ' height: ' + cellSize + 'px;';
                qrHtml += ' background-color: ';
                qrHtml += this.isDark(r, c) ? '#000000' : '#ffffff';
                qrHtml += ';';
                qrHtml += '"/>';
            }

            qrHtml += '</tr>';
        }

        qrHtml += '</tbody>';
        qrHtml += '</table>';

        return qrHtml;
    }

    createSvgTag(cellSize: number = 2, margin: number = cellSize * 4): string {
        const size = this.getModuleCount() * cellSize + margin * 2;
        let qrSvg = '';

        qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
        qrSvg += ' width="' + size + 'px"';
        qrSvg += ' height="' + size + 'px"';
        qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
        qrSvg += ' preserveAspectRatio="xMinYMin meet">';
        qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
        qrSvg += '<path d="';

        for (let r = 0; r < this.getModuleCount(); r++) {
            const mr = r * cellSize + margin;
            for (let c = 0; c < this.getModuleCount(); c++) {
                if (this.isDark(r, c)) {
                    const mc = c * cellSize + margin;
                    qrSvg += 'M' + mc + ',' + mr + 'l' + cellSize + ',0 0,' + cellSize +
                        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';
                }
            }
        }

        qrSvg += '" stroke="transparent" fill="black"/>';
        qrSvg += '</svg>';

        return qrSvg;
    }

    createDataURL(cellSize: number = 2, margin: number = cellSize * 4): string {
        const size = this.getModuleCount() * cellSize + margin * 2;
        const min = margin;
        const max = size - margin;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d')!;

        context.fillStyle = 'white';
        context.fillRect(0, 0, size, size);

        for (let row = 0; row < this.getModuleCount(); row++) {
            for (let col = 0; col < this.getModuleCount(); col++) {
                const w = (Math.ceil((col + 1) * cellSize) - Math.floor(col * cellSize));
                const h = (Math.ceil((row + 1) * cellSize) - Math.floor(row * cellSize));

                context.fillStyle = this.isDark(row, col) ? 'black' : 'white';
                context.fillRect(Math.round(col * cellSize) + min, Math.round(row * cellSize) + min, w, h);
            }
        }

        return canvas.toDataURL('image/png');
    }

    createImgTag(cellSize: number = 2, margin: number = cellSize * 4, alt?: string): string {
        const size = this.getModuleCount() * cellSize + margin * 2;

        let img = '';
        img += '<img';
        img += '\u0020src="';
        img += this.createDataURL(cellSize, margin);
        img += '"';
        img += '\u0020width="';
        img += size;
        img += '"';
        img += '\u0020height="';
        img += size;
        img += '"';
        if (alt) {
            img += '\u0020alt="';
            img += alt;
            img += '"';
        }
        img += '/>';

        return img;
    }

    createASCII(cellSize: number = 1, margin: number = cellSize * 2): string {
        if (cellSize < 2) {
            return this._createHalfASCII(margin);
        }

        cellSize -= 1;
        margin = (typeof margin === 'undefined') ? cellSize * 2 : margin;

        const size = this.getModuleCount() * cellSize + margin * 2;
        const min = margin;
        const max = size - margin;

        let ascii = '';
        let line = '';
        for (let y = 0; y < size; y++) {
            const r = Math.floor((y - min) / cellSize);
            line = '';
            for (let x = 0; x < size; x++) {
                let p = 1;

                if (min <= x && x < max && min <= y && y < max && this.isDark(r, Math.floor((x - min) / cellSize))) {
                    p = 0;
                }

                line += p ? '██' : '  ';
            }

            for (let r = 0; r < cellSize; r++) {
                ascii += line + '\n';
            }
        }

        return ascii.substring(0, ascii.length - 1);
    }

    private _createHalfASCII(margin: number): string {
        const cellSize = 1;
        margin = (typeof margin === 'undefined') ? cellSize * 2 : margin;

        const size = this.getModuleCount() * cellSize + margin * 2;
        const min = margin;
        const max = size - margin;

        const blocks = {
            '██': '█',
            '█ ': '▀',
            ' █': '▄',
            '  ': ' '
        };

        let ascii = '';
        for (let y = 0; y < size; y += 2) {
            const r1 = Math.floor((y - min) / cellSize);
            const r2 = Math.floor((y + 1 - min) / cellSize);
            for (let x = 0; x < size; x++) {
                let p = '█';

                if (min <= x && x < max && min <= y && y < max && this.isDark(r1, Math.floor((x - min) / cellSize))) {
                    p = ' ';
                }

                if (min <= x && x < max && min <= y + 1 && y + 1 < max && this.isDark(r2, Math.floor((x - min) / cellSize))) {
                    p += ' ';
                } else {
                    p += '█';
                }

                ascii += blocks[p as keyof typeof blocks];
            }

            ascii += '\n';
        }

        if (size % 2) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join('▀');
        }

        return ascii.substring(0, ascii.length - 1);
    }
} 