export = MerkleBlock;
/**
 * Merkle Block
 * Represents a merkle (filtered) block.
 * @alias module:primitives.MerkleBlock
 * @extends AbstractBlock
 */
declare class MerkleBlock extends AbstractBlock {
    /**
     * Instantiate merkle block from options object.
     * @param {Object} data
     * @returns {MerkleBlock}
     */
    static fromOptions(data: any): MerkleBlock;
    /**
     * Instantiate a merkleblock from a buffer reader.
     * @param {BufferReader} br
     * @returns {MerkleBlock}
     */
    static fromReader(br: BufferReader): MerkleBlock;
    /**
     * Instantiate a merkleblock with transactions from a buffer reader.
     * @param {BufferReader} br
     * @returns {MerkleBlock}
     */
    static fromExtendedReader(br: BufferReader): MerkleBlock;
    /**
     * Instantiate a merkleblock from a serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MerkleBlock}
     */
    static fromRaw(data: Buffer, enc: string | null): MerkleBlock;
    /**
     * Instantiate a merkleblock with transactions from a serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MerkleBlock}
     */
    static fromExtendedRaw(data: Buffer, enc: string | null): MerkleBlock;
    /**
     * Instantiate a merkle block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {MerkleBlock}
     */
    static fromJSON(json: any): MerkleBlock;
    /**
     * Create a merkleblock from a {@link Block} object, passing
     * it through a filter first. This will build the partial
     * merkle tree.
     * @param {Block} block
     * @param {BloomFilter} filter
     * @returns {MerkleBlock}
     */
    static fromBlock(block: Block, filter: BloomFilter): MerkleBlock;
    /**
     * Create a merkleblock from an array of txids.
     * This will build the partial merkle tree.
     * @param {Block} block
     * @param {Hash[]} hashes
     * @returns {MerkleBlock}
     */
    static fromHashes(block: Block, hashes: Hash[]): MerkleBlock;
    /**
     * Create a merkleblock from an array of matches.
     * This will build the partial merkle tree.
     * @param {Block} block
     * @param {Number[]} matches
     * @returns {MerkleBlock}
     */
    static fromMatches(block: Block, matches: number[]): MerkleBlock;
    /**
     * Test whether an object is a MerkleBlock.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isMerkleBlock(obj: any): boolean;
    /**
     * Create a merkle block.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    txs: any[];
    hashes: any[];
    flags: any;
    totalTX: number;
    _tree: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clear any cached values.
     * @param {Boolean?} all - Clear transactions.
     */
    refresh(all: boolean | null): void;
    /**
     * Test the block's _matched_ transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasTX(hash: Hash): boolean;
    /**
     * Test the block's _matched_ transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Number} Index.
     */
    indexOf(hash: Hash): number;
    /**
     * Verify the partial merkletree.
     * @private
     * @returns {Array} [valid, reason, score]
     */
    private checkBody;
    /**
     * Extract the matches from partial merkle
     * tree and calculate merkle root.
     * @returns {Object}
     */
    getTree(): any;
    /**
     * Extract the matches from partial merkle
     * tree and calculate merkle root.
     * @private
     * @returns {Object}
     */
    private extractTree;
    /**
     * Extract the coinbase height (always -1).
     * @returns {Number}
     */
    getCoinbaseHeight(): number;
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    format(view: CoinView, height: number): any;
    /**
     * Get merkleblock size.
     * @returns {Number} Size.
     */
    getSize(): number;
    /**
     * Get merkleblock size with transactions.
     * @returns {Number} Size.
     */
    getExtendedSize(): number;
    /**
     * Write the merkleblock to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Write the merkleblock to a buffer writer with transactions.
     * @param {BufferWriter} bw
     */
    toExtendedWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize the merkleblock.
     * @returns {Buffer|String}
     */
    toRaw(): Buffer | string;
    /**
     * Serialize the merkleblock with transactions.
     * @returns {Buffer}
     */
    toExtendedRaw(): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties with transactions from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromExtendedReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Inject properties with transactions from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromExtendedRaw;
    /**
     * Convert the block to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Convert the block to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    getJSON(network: Network, view: CoinView, height: number): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    toHeaders(): Headers;
}
import AbstractBlock = require("./abstractblock");
import Headers = require("./headers");
//# sourceMappingURL=merkleblock.d.ts.map