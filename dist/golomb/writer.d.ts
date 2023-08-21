export = BitWriter;
/**
 * Bit Writer - as specified by BIP 158 for Golomb Rice Coding
 * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki#golomb-rice-coding
 */
declare class BitWriter {
    stream: any[];
    remain: number;
    /**
     * Write bit.
     * @param {Buffer} bit
     */
    writeBit(bit: Buffer): void;
    /**
     * Write byte.
     * @param {Buffer} ch
     */
    writeByte(ch: Buffer): void;
    /**
     * Write bits.
     * @param {Number} num
     * @param {Number} count
     */
    writeBits(num: number, count: number): void;
    /**
     * Write bits. 64-bit.
     * @param {Number} num
     * @param {Number} count
     */
    writeBits64(num: number, count: number): void;
    /**
     * Allocate and render the final buffer.
     * @returns {Buffer} Rendered buffer.
     */
    render(): Buffer;
}
//# sourceMappingURL=writer.d.ts.map