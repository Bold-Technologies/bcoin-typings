export = SigCache;
/**
 * Signature cache.
 * @alias module:script.SigCache
 * @property {Number} size
 * @property {Hash[]} keys
 * @property {Object} valid
 */
declare class SigCache {
    /**
     * Create a signature cache.
     * @constructor
     * @param {Number} [size=10000]
     */
    constructor(size?: number);
    size: number;
    keys: any[];
    valid: any;
    /**
     * Resize the sigcache.
     * @param {Number} size
     */
    resize(size: number): void;
    /**
     * Add item to the sigcache.
     * Potentially evict a random member.
     * @param {Hash} msg - Sig hash.
     * @param {Buffer} sig
     * @param {Buffer} key
     */
    add(msg: Hash, sig: Buffer, key: Buffer): void;
    /**
     * Test whether the sig exists.
     * @param {Hash} msg - Sig hash.
     * @param {Buffer} sig
     * @param {Buffer} key
     * @returns {Boolean}
     */
    has(msg: Hash, sig: Buffer, key: Buffer): boolean;
    /**
     * Verify a signature, testing
     * it against the cache first.
     * @param {Buffer} msg
     * @param {Buffer} sig
     * @param {Buffer} key
     * @returns {Boolean}
     */
    verify(msg: Buffer, sig: Buffer, key: Buffer): boolean;
}
//# sourceMappingURL=sigcache.d.ts.map