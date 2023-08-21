export const MAGIC_STRING: string;
/**
 * Hash message with magic string.
 * @param {String} message
 * @param {String} [prefix = message.MAGIC_STRING]
 * @returns {Hash}
 */
export function magicHash(msg: any, prefix?: string): Hash;
/**
 * Sign message with key.
 * @param {String} msg
 * @param {KeyRing} ring
 * @param {String} [prefix = message.MAGIC_STRING]
 * @returns {Buffer}
 */
export function sign(msg: string, ring: KeyRing, prefix?: string): Buffer;
/**
 * Recover raw public key from message and signature.
 * @param {String} msg
 * @param {Buffer} signature
 * @param {String} [prefix = MAGIC_STRING]
 */
export function recover(msg: string, signature: Buffer, prefix?: string): any;
//# sourceMappingURL=message.d.ts.map