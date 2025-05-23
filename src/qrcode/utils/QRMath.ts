export class QRMath {
    private static EXP_TABLE: number[] = new Array(256);
    private static LOG_TABLE: number[] = new Array(256);

    static {
        // Initialize tables
        for (let i = 0; i < 8; i++) {
            this.EXP_TABLE[i] = 1 << i;
        }
        for (let i = 8; i < 256; i++) {
            this.EXP_TABLE[i] = this.EXP_TABLE[i - 4] ^
                this.EXP_TABLE[i - 5] ^
                this.EXP_TABLE[i - 6] ^
                this.EXP_TABLE[i - 8];
        }
        for (let i = 0; i < 255; i++) {
            this.LOG_TABLE[this.EXP_TABLE[i]] = i;
        }
    }

    static glog(n: number): number {
        if (n < 1) {
            throw new Error(`glog(${n})`);
        }
        return this.LOG_TABLE[n];
    }

    static gexp(n: number): number {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return this.EXP_TABLE[n];
    }
} 