import { QRMath } from './QRMath';

export class QRPolynomial {
    private _num: number[];

    constructor(num: number[], shift: number) {
        if (typeof num.length === 'undefined') {
            throw new Error(`${num.length}/${shift}`);
        }

        let offset = 0;
        while (offset < num.length && num[offset] === 0) {
            offset++;
        }

        this._num = new Array(num.length - offset + shift);
        for (let i = 0; i < num.length - offset; i++) {
            this._num[i] = num[i + offset];
        }
    }

    getAt(index: number): number {
        return this._num[index];
    }

    getLength(): number {
        return this._num.length;
    }

    multiply(e: QRPolynomial): QRPolynomial {
        const num = new Array(this.getLength() + e.getLength() - 1);

        for (let i = 0; i < this.getLength(); i++) {
            for (let j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
            }
        }

        return new QRPolynomial(num, 0);
    }

    mod(e: QRPolynomial): QRPolynomial {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }

        const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));
        const num = new Array(this.getLength());

        for (let i = 0; i < this.getLength(); i++) {
            num[i] = this.getAt(i);
        }

        for (let i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
        }

        return new QRPolynomial(num, 0).mod(e);
    }
} 