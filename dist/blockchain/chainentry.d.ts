export = ChainEntry;
/**
 * Chain Entry
 * Represents an entry in the chain. Unlike
 * other bitcoin fullnodes, we store the
 * chainwork _with_ the entry in order to
 * avoid reading the entire chain index on
 * boot and recalculating the chainworks.
 * @alias module:blockchain.ChainEntry
 * @property {Hash} hash
 * @property {Number} version
 * @property {Hash} prevBlock
 * @property {Hash} merkleRoot
 * @property {Number} time
 * @property {Number} bits
 * @property {Number} nonce
 * @property {Number} height
 * @property {BN} chainwork
 * @property {Hash} rhash
 */
declare class ChainEntry {
    /**
     * Instantiate chainentry from options.
     * @param {Object} options
     * @param {ChainEntry} prev - Previous entry.
     * @returns {ChainEntry}
     */
    static fromOptions(options: any, prev: ChainEntry): ChainEntry;
    /**
     * Instantiate chainentry from block.
     * @param {Block|MerkleBlock} block
     * @param {ChainEntry} prev - Previous entry.
     * @returns {ChainEntry}
     */
    static fromBlock(block: Block | MerkleBlock, prev: ChainEntry): ChainEntry;
    /**
     * Deserialize the entry.
     * @param {Buffer} data
     * @returns {ChainEntry}
     */
    static fromRaw(data: Buffer): ChainEntry;
    /**
     * Instantiate block from jsonified object.
     * @param {Object} json
     * @returns {ChainEntry}
     */
    static fromJSON(json: any): ChainEntry;
    /**
     * Test whether an object is a {@link ChainEntry}.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isChainEntry(obj: any): boolean;
    /**
     * Create a chain entry.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    hash: any;
    version: number;
    prevBlock: any;
    merkleRoot: any;
    time: number;
    bits: number;
    nonce: number;
    height: number;
    chainwork: any;
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Calculate the proof: (1 << 256) / (target + 1)
     * @returns {BN} proof
     */
    getProof(): BN;
    /**
     * Calculate the chainwork by
     * adding proof to previous chainwork.
     * @returns {BN} chainwork
     */
    getChainwork(prev: any): BN;
    /**
     * Test against the genesis block.
     * @returns {Boolean}
     */
    isGenesis(): boolean;
    /**
     * Test whether the entry contains a version bit.
     * @param {Number} bit
     * @returns {Boolean}
     */
    hasBit(bit: number): boolean;
    /**
     * Get little-endian block hash.
     * @returns {Hash}
     */
    rhash(): Hash;
    /**
     * Inject properties from block.
     * @private
     * @param {Block|MerkleBlock} block
     * @param {ChainEntry} prev - Previous entry.
     */
    private fromBlock;
    /**
     * Serialize the entry to internal database format.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize the entry to an object more
     * suitable for JSON serialization.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Convert the entry to a headers object.
     * @returns {Headers}
     */
    toHeaders(): Headers;
    /**
     * Convert the entry to an inv item.
     * @returns {InvItem}
     */
    toInv(): InvItem;
}
declare namespace ChainEntry {
    const MAX_CHAINWORK: any;
}
import Headers = require("../primitives/headers");
import InvItem = require("../primitives/invitem");
//# sourceMappingURL=chainentry.d.ts.map