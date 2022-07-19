export = Block;
/**
 * Block
 * Represents a full block.
 * @alias module:primitives.Block
 * @extends AbstractBlock
 */
declare class Block extends AbstractBlock {
    /**
     * Instantiate block from options.
     * @param {Object} options
     * @returns {Block}
     */
    static fromOptions(options: any): Block;
    /**
     * Instantiate a block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {Block}
     */
    static fromJSON(json: any): Block;
    /**
     * Instantiate a block from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Block}
     */
    static fromReader(data: Buffer): Block;
    /**
     * Instantiate a block from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Block}
     */
    static fromRaw(data: Buffer, enc: string | null): Block;
    /**
     * Test whether an object is a Block.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isBlock(obj: any): boolean;
    /**
     * Create a block.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    txs: any[];
    _raw: any;
    _size: number;
    _witness: number;
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
    refresh(all: boolean | null): Block;
    /**
     * Serialize the block. Include witnesses if present.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Check if block has been serialized.
     * @returns {Buffer}
     */
    hasRaw(): Buffer;
    /**
     * Serialize the block, do not include witnesses.
     * @returns {Buffer}
     */
    toNormal(): Buffer;
    /**
     * Serialize the block. Include witnesses if present.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): any;
    /**
     * Serialize the block, do not include witnesses.
     * @param {BufferWriter} bw
     */
    toNormalWriter(bw: BufferWriter): any;
    /**
     * Get the raw block serialization.
     * Include witnesses if present.
     * @private
     * @returns {RawBlock}
     */
    private frame;
    /**
     * Calculate real size and size of the witness bytes.
     * @returns {Object} Contains `size` and `witness`.
     */
    getSizes(): any;
    /**
     * Calculate virtual block size.
     * @returns {Number} Virtual size.
     */
    getVirtualSize(): number;
    /**
     * Calculate block weight.
     * @returns {Number} weight
     */
    getWeight(): number;
    /**
     * Get real block size.
     * @returns {Number} size
     */
    getSize(): number;
    /**
     * Get base block size (without witness).
     * @returns {Number} size
     */
    getBaseSize(): number;
    /**
     * Test whether the block contains a
     * transaction with a non-empty witness.
     * @returns {Boolean}
     */
    hasWitness(): boolean;
    /**
     * Test the block's transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasTX(hash: Hash): boolean;
    /**
     * Find the index of a transaction in the block.
     * @param {Hash} hash
     * @returns {Number} index (-1 if not present).
     */
    indexOf(hash: Hash): number;
    /**
     * Calculate merkle root. Returns null
     * if merkle tree has been malleated.
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Hash|null}
     */
    createMerkleRoot(enc: string | null): Hash | null;
    /**
     * Create a witness nonce (for mining).
     * @returns {Buffer}
     */
    createWitnessNonce(): Buffer;
    /**
     * Calculate commitment hash (the root of the
     * witness merkle tree hashed with the witnessNonce).
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Hash}
     */
    createCommitmentHash(enc: string | null): Hash;
    /**
     * Retrieve the merkle root from the block header.
     * @param {String?} enc
     * @returns {Hash}
     */
    getMerkleRoot(enc: string | null): Hash;
    /**
     * Retrieve the witness nonce from the
     * coinbase's witness vector (if present).
     * @returns {Buffer|null}
     */
    getWitnessNonce(): Buffer | null;
    /**
     * Retrieve the commitment hash
     * from the coinbase's outputs.
     * @param {String?} enc
     * @returns {Hash|null}
     */
    getCommitmentHash(enc: string | null): Hash | null;
    /**
     * Do non-contextual verification on the block. Including checking the block
     * size, the coinbase and the merkle root. This is consensus-critical.
     * @returns {Array} [valid, reason, score]
     */
    checkBody(): any[];
    /**
     * Retrieve the coinbase height from the coinbase input script.
     * @returns {Number} height (-1 if not present).
     */
    getCoinbaseHeight(): number;
    /**
     * Get the "claimed" reward by the coinbase.
     * @returns {SatoshiAmount} claimed
     */
    getClaimed(): SatoshiAmount;
    /**
     * Get all unique outpoint hashes in the
     * block. Coinbases are ignored.
     * @returns {Hash[]} Outpoint hashes.
     */
    getPrevout(): Hash[];
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    format(view: CoinView, height: number): any;
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
     * @param {Number} depth
     * @returns {Object}
     */
    getJSON(network: Network, view: CoinView, height: number, depth: number): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Convert the Block to a MerkleBlock.
     * @param {Bloom} filter - Bloom filter for transactions
     * to match. The merkle block will contain only the
     * matched transactions.
     * @returns {MerkleBlock}
     */
    toMerkle(filter: Bloom): MerkleBlock;
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    private writeNormal;
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    private writeWitness;
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    private frameNormal;
    /**
     * Serialze block without witness data.
     * @private
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    private frameWitness;
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    toHeaders(): Headers;
    /**
     * Get real block size without witness.
     * @returns {RawBlock}
     */
    getNormalSizes(): RawBlock;
    /**
     * Get real block size with witness.
     * @returns {RawBlock}
     */
    getWitnessSizes(): RawBlock;
    toFilter(view: any): import("../golomb/golomb");
}
import AbstractBlock = require("./abstractblock");
import Network = require("../protocol/network");
import MerkleBlock = require("./merkleblock");
import Headers = require("./headers");
declare class RawBlock {
    constructor(size: any, witness: any);
    data: any;
    size: any;
    witness: any;
}
//# sourceMappingURL=block.d.ts.map