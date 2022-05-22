/**
 * Swap 32 bit endianness of uint256.
 * @param {Buffer} data
 * @returns {Buffer}
 */
export function swap32(data: Buffer): Buffer;
/**
 * Compare two uint256le's.
 * @param {Buffer} a
 * @param {Buffer} b
 * @returns {Number}
 */
export function rcmp(a: Buffer, b: Buffer): number;
/**
 * Convert a uint256le to a double.
 * @param {Buffer} target
 * @returns {Number}
 */
export function double256(target: Buffer): number;
/**
 * Calculate mining difficulty
 * from little-endian target.
 * @param {Buffer} target
 * @returns {Number}
 */
export function getDifficulty(target: Buffer): number;
/**
 * Get target from bits as a uint256le.
 * @param {Number} bits
 * @returns {Buffer}
 */
export function getTarget(bits: number): Buffer;
/**
 * Get bits from target.
 * @param {Buffer} data
 * @returns {Buffer}
 */
export function getBits(data: Buffer): Buffer;
//# sourceMappingURL=common.d.ts.map