export = AbstractBlock;
/**
 * Abstract Block
 * The class which all block-like objects inherit from.
 * @alias module:primitives.AbstractBlock
 * @abstract
 * @property {Number} version
 * @property {Hash} prevBlock
 * @property {Hash} merkleRoot
 * @property {Number} time
 * @property {Number} bits
 * @property {Number} nonce
 */
declare class AbstractBlock {
    version: number;
    prevBlock: any;
    merkleRoot: any;
    time: number;
    bits: number;
    nonce: number;
    mutable: boolean;
    _hash: any;
    _hhash: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private parseOptions;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private parseJSON;
    /**
     * Test whether the block is a memblock.
     * @returns {Boolean}
     */
    isMemory(): boolean;
    /**
     * Clear any cached values (abstract).
     */
    _refresh(): void;
    /**
     * Clear any cached values.
     */
    refresh(): void;
    /**
     * Hash the block headers.
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    hash(enc: string | null): Hash | Buffer;
    /**
     * Serialize the block headers.
     * @returns {Buffer}
     */
    toHead(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromHead;
    /**
     * Serialize the block headers.
     * @param {BufferWriter} bw
     */
    writeHead(bw: BufferWriter): BufferWriter;
    /**
     * Parse the block headers.
     * @param {BufferReader} br
     */
    readHead(br: BufferReader): AbstractBlock;
    /**
     * Verify the block.
     * @returns {Boolean}
     */
    verify(): boolean;
    /**
     * Verify proof-of-work.
     * @returns {Boolean}
     */
    verifyPOW(): boolean;
    /**
     * Verify the block.
     * @returns {Boolean}
     */
    verifyBody(): boolean;
    /**
     * Get little-endian block hash.
     * @returns {Hash}
     */
    rhash(): Hash;
    /**
     * Convert the block to an inv item.
     * @returns {InvItem}
     */
    toInv(): InvItem;
}
import InvItem = require("./invitem");
//# sourceMappingURL=abstractblock.d.ts.map