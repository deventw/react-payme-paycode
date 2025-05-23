import { QRMode, QRErrorCorrectionLevel, QRMaskPattern, PATTERN_POSITION_TABLE } from '../constants';
import { QRMath } from './QRMath';
import { QRPolynomial } from './QRPolynomial';
import { QRCode } from '../QRCode';

export class QRUtil {
    private static G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    private static G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    private static G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    static getBCHTypeInfo(data: number): number {
        let d = data << 10;
        while (this.getBCHDigit(d) - this.getBCHDigit(this.G15) >= 0) {
            d ^= (this.G15 << (this.getBCHDigit(d) - this.getBCHDigit(this.G15)));
        }
        return ((data << 10) | d) ^ this.G15_MASK;
    }

    static getBCHTypeNumber(data: number): number {
        let d = data << 12;
        while (this.getBCHDigit(d) - this.getBCHDigit(this.G18) >= 0) {
            d ^= (this.G18 << (this.getBCHDigit(d) - this.getBCHDigit(this.G18)));
        }
        return (data << 12) | d;
    }

    static getBCHDigit(data: number): number {
        let digit = 0;
        while (data !== 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    }

    static getPatternPosition(typeNumber: number): readonly number[] {
        return PATTERN_POSITION_TABLE[typeNumber - 1];
    }

    static getMaskFunction(maskPattern: number): (i: number, j: number) => boolean {
        switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
                return (i, j) => (i + j) % 2 === 0;
            case QRMaskPattern.PATTERN001:
                return (i, j) => i % 2 === 0;
            case QRMaskPattern.PATTERN010:
                return (i, j) => j % 3 === 0;
            case QRMaskPattern.PATTERN011:
                return (i, j) => (i + j) % 3 === 0;
            case QRMaskPattern.PATTERN100:
                return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
            case QRMaskPattern.PATTERN101:
                return (i, j) => (i * j) % 2 + (i * j) % 3 === 0;
            case QRMaskPattern.PATTERN110:
                return (i, j) => ((i * j) % 2 + (i * j) % 3) % 2 === 0;
            case QRMaskPattern.PATTERN111:
                return (i, j) => ((i * j) % 3 + (i + j) % 2) % 2 === 0;
            default:
                throw new Error(`bad maskPattern:${maskPattern}`);
        }
    }

    static getErrorCorrectPolynomial(errorCorrectLength: number): QRPolynomial {
        let a = new QRPolynomial([1], 0);
        for (let i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    }

    static getLengthInBits(mode: number, type: number): number {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error(`mode:${mode}`);
            }
        } else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error(`mode:${mode}`);
            }
        } else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error(`mode:${mode}`);
            }
        } else {
            throw new Error(`type:${type}`);
        }
    }

    static getLostPoint(qrcode: QRCode): number {
        const moduleCount = qrcode.getModuleCount();
        let lostPoint = 0;

        // LEVEL1
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                let sameCount = 0;
                const dark = qrcode.isDark(row, col);

                for (let r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }

                    for (let c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }

                        if (r === 0 && c === 0) {
                            continue;
                        }

                        if (dark === qrcode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }

                if (sameCount > 5) {
                    lostPoint += (3 + sameCount - 5);
                }
            }
        }

        // LEVEL2
        for (let row = 0; row < moduleCount - 1; row++) {
            for (let col = 0; col < moduleCount - 1; col++) {
                let count = 0;
                if (qrcode.isDark(row, col)) count++;
                if (qrcode.isDark(row + 1, col)) count++;
                if (qrcode.isDark(row, col + 1)) count++;
                if (qrcode.isDark(row + 1, col + 1)) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }

        // LEVEL3
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount - 6; col++) {
                if (qrcode.isDark(row, col) &&
                    !qrcode.isDark(row, col + 1) &&
                    qrcode.isDark(row, col + 2) &&
                    qrcode.isDark(row, col + 3) &&
                    qrcode.isDark(row, col + 4) &&
                    !qrcode.isDark(row, col + 5) &&
                    qrcode.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }

        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount - 6; row++) {
                if (qrcode.isDark(row, col) &&
                    !qrcode.isDark(row + 1, col) &&
                    qrcode.isDark(row + 2, col) &&
                    qrcode.isDark(row + 3, col) &&
                    qrcode.isDark(row + 4, col) &&
                    !qrcode.isDark(row + 5, col) &&
                    qrcode.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }

        // LEVEL4
        let darkCount = 0;
        for (let col = 0; col < moduleCount; col++) {
            for (let row = 0; row < moduleCount; row++) {
                if (qrcode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }

        const ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;

        return lostPoint;
    }
} 