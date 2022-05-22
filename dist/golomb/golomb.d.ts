export = Golomb;
/**
 * Golomb - BIP 158 block filters
 * @alias module:golomb.Golomb
 * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki
 * @property {Number} m
 * @property {Number} n
 * @property {Number} p
 * @property {Buffer} data
 */
declare class Golomb {
    /**
     * Create a block filter.
     * @constructor
     */
    constructor(P: any, M: any);
    n: number;
    P: any;
    m: any;
    M: any;
    _hash: any;
    _hhash: any;
    data: any;
    /**
     * Hash the block filter.
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    hash(enc: string | null): Hash | Buffer;
    /**
     * Get the block filter header.
     * hash of block filter concatenated with previous block filter header.
     * @param {Hash} prev - previous filter header.
     * @returns {Hash|Buffer} hash
     */
    header(prev: Hash): Hash | Buffer;
    /**
     * Get the membership of given item in the block filter.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer} data - item.
     * @returns {Boolean} match
     */
    match(key: Buffer, data: Buffer): boolean;
    /**
     * Get the membership of any item of given items in the block filter.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer[]} items.
     * @returns {Boolean} match
     */
    matchAny(key: Buffer, items: any): boolean;
    /**
     * Read uint64 from a bit reader.
     * @param {BufferReader} br {@link BitReader}
     */
    readU64(br: BufferReader): any;
    /**
     * Read uint64 from a bit reader.
     * @param {BufferReader} br {@link BitReader}
     * @throws on EOF
     */
    _readU64(br: BufferReader): any;
    /**
     * Serialize the block filter as raw filter bytes.
     * @returns {Buffer} filter
     */
    toBytes(): Buffer;
    /**
     * Serialize the block filter as n and raw filter bytes
     * @returns {Buffer} filter
     */
    toNBytes(): Buffer;
    /**
     * Serialize the block filter as default filter bytes.
     * @returns {Buffer} filter
     */
    toRaw(): Buffer;
    /**
     * Instantiate a block filter from a 128-bit key and items.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer[]} items
     * @returns {Golomb}
     */
    fromItems(key: Buffer, items: Buffer[]): Golomb;
    /**
     * Instantiate a block filter from an n, and raw data.
     * @param {Number} n
     * @param {Buffer} data
     * @returns {Golomb}
     */
    fromBytes(n: number, data: Buffer): Golomb;
    /**
     * Instantiate a block filter from raw data.
     * @param {Buffer} data
     * @returns {Golomb}
     */
    fromNBytes(data: Buffer): Golomb;
    /**
     * Instantiate a block filter from raw data.
     * @param {Buffer} data
     * @returns {Golomb}
     */
    fromRaw(data: Buffer): Golomb;
}
//# sourceMappingURL=golomb.d.ts.map