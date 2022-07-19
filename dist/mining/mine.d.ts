export = mine;
/**
 * Hash until the nonce overflows.
 * @alias module:mining.mine
 * @param {Buffer} data
 * @param {Buffer} target - Big endian.
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} Nonce or -1.
 */
declare function mine(data: Buffer, target: Buffer, min: number, max: number): number;
//# sourceMappingURL=mine.d.ts.map