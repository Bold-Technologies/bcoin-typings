export = BitReader;
/**
 * Bit Reader - as specified by BIP 158 for Golomb Rice Coding
 * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki#golomb-rice-coding
 */
declare class BitReader {
    /**
     * Create a bit reader.
     * @constructor
     * @ignore
     */
    constructor(data: any);
    stream: any;
    pos: number;
    remain: number;
    /**
     * Read bit.
     * @returns {Buffer} bit
     */
    readBit(): Buffer;
    /**
     * Read byte.
     * @returns {Buffer} data
     */
    readByte(): Buffer;
    /**
     * Read bits.
     * @returns {Buffer} data
     */
    readBits(count: any): Buffer;
    /**
     * Read bits. 64-bit.
     * @returns {Buffer} data
     */
    readBits64(count: any): Buffer;
}
//# sourceMappingURL=reader.d.ts.map