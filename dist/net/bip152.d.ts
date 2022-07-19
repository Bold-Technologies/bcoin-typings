/**
 * Compact Block
 * Represents a compact block (bip152): `cmpctblock` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @extends AbstractBlock
 * @property {Buffer|null} keyNonce - Nonce for siphash key.
 * @property {Number[]} ids - Short IDs.
 * @property {Object[]} ptx - Prefilled transactions.
 * @property {TX[]} available - Available transaction vector.
 * @property {Object} idMap - Map of short ids to indexes.
 * @property {Number} count - Transactions resolved.
 * @property {Buffer|null} sipKey - Siphash key.
 */
export class CompactBlock extends AbstractBlock {
    /**
     * Instantiate compact block from options.
     * @param {Object} options
     * @returns {CompactBlock}
     */
    static fromOptions(options: any): CompactBlock;
    /**
     * Instantiate a block from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {CompactBlock}
     */
    static fromRaw(data: Buffer, enc: string | null): CompactBlock;
    /**
     * Instantiate compact block from a block.
     * @param {Block} block
     * @param {Boolean} witness
     * @param {Buffer?} nonce
     * @returns {CompactBlock}
     */
    static fromBlock(block: Block, witness: boolean, nonce: Buffer): CompactBlock;
    /**
     * Create a compact block.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    keyNonce: any;
    ids: any[];
    ptx: any[];
    available: any[];
    idMap: any;
    count: number;
    sipKey: any;
    totalTX: number;
    now: number;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize compact block with witness data.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Serialize compact block without witness data.
     * @returns {Buffer}
     */
    toNormal(): Buffer;
    /**
     * Write serialized block to a buffer
     * writer (includes witness data).
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Write serialized block to a buffer
     * writer (excludes witness data).
     * @param {BufferWriter} bw
     */
    toNormalWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize compact block.
     * @private
     * @param {Boolean} witness
     * @returns {Buffer}
     */
    private frameRaw;
    /**
     * Calculate block serialization size.
     * @param {Boolean} witness
     * @returns {Number}
     */
    getSize(witness: boolean): number;
    /**
     * Serialize block to buffer writer.
     * @private
     * @param {BufferWriter} bw
     * @param {Boolean} witness
     */
    private writeRaw;
    /**
     * Convert block to a TXRequest
     * containing missing indexes.
     * @returns {TXRequest}
     */
    toRequest(): TXRequest;
    /**
     * Attempt to fill missing transactions from mempool.
     * @param {Boolean} witness
     * @param {Mempool} mempool
     * @returns {Boolean}
     */
    fillMempool(witness: boolean, mempool: Mempool): boolean;
    /**
     * Attempt to fill missing transactions from TXResponse.
     * @param {TXResponse} res
     * @returns {Boolean}
     */
    fillMissing(res: TXResponse): boolean;
    /**
     * Calculate a transaction short ID.
     * @param {Hash} hash
     * @returns {Number}
     */
    sid(hash: Hash): number;
    /**
     * Test whether an index is available.
     * @param {Number} index
     * @returns {Boolean}
     */
    hasIndex(index: number): boolean;
    /**
     * Initialize the siphash key.
     * @private
     * @returns {Buffer}
     */
    private getKey;
    /**
     * Initialize compact block and short id map.
     * @private
     */
    private init;
    /**
     * Convert completely filled compact
     * block to a regular block.
     * @returns {Block}
     */
    toBlock(): Block;
    /**
     * Inject properties from block.
     * @private
     * @param {Block} block
     * @param {Boolean} witness
     * @param {Buffer?} nonce
     * @returns {CompactBlock}
     */
    private fromBlock;
    /**
     * Convert block to headers.
     * @returns {Headers}
     */
    toHeaders(): Headers;
}
/**
 * TX Request
 * Represents a BlockTransactionsRequest (bip152): `getblocktxn` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @property {Hash} hash
 * @property {Number[]} indexes
 */
export class TXRequest {
    /**
     * Instantiate request from options.
     * @param {Object} options
     * @returns {TXRequest}
     */
    static fromOptions(options: any): TXRequest;
    /**
     * Instantiate request from compact block.
     * @param {CompactBlock} block
     * @returns {TXRequest}
     */
    static fromCompact(block: CompactBlock): TXRequest;
    /**
     * Instantiate request from buffer reader.
     * @param {BufferReader} br
     * @returns {TXRequest}
     */
    static fromReader(br: BufferReader): TXRequest;
    /**
     * Instantiate request from serialized data.
     * @param {Buffer} data
     * @returns {TXRequest}
     */
    static fromRaw(data: Buffer): TXRequest;
    /**
     * TX Request
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    hash: any;
    indexes: any[];
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     * @returns {TXRequest}
     */
    private fromOptions;
    /**
     * Inject properties from compact block.
     * @private
     * @param {CompactBlock} block
     * @returns {TXRequest}
     */
    private fromCompact;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {TXRequest}
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {TXRequest}
     */
    private fromRaw;
    /**
     * Calculate request serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Write serialized request to buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize request.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
}
/**
 * TX Response
 * Represents BlockTransactions (bip152): `blocktxn` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @property {Hash} hash
 * @property {TX[]} txs
 */
export class TXResponse {
    /**
     * Instantiate response from options.
     * @param {Object} options
     * @returns {TXResponse}
     */
    static fromOptions(options: any): TXResponse;
    /**
     * Instantiate response from buffer reader.
     * @param {BufferReader} br
     * @returns {TXResponse}
     */
    static fromReader(br: BufferReader): TXResponse;
    /**
     * Instantiate response from serialized data.
     * @param {Buffer} data
     * @returns {TXResponse}
     */
    static fromRaw(data: Buffer): TXResponse;
    /**
     * Instantiate response from block.
     * @param {Block} block
     * @returns {TXResponse}
     */
    static fromBlock(block: Block, req: any): TXResponse;
    /**
     * Create a tx response.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    hash: any;
    txs: any[];
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     * @returns {TXResponse}
     */
    private fromOptions;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {TXResponse}
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {TXResponse}
     */
    private fromRaw;
    /**
     * Inject properties from block.
     * @private
     * @param {Block} block
     * @returns {TXResponse}
     */
    private fromBlock;
    /**
     * Serialize response with witness data.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Serialize response without witness data.
     * @returns {Buffer}
     */
    toNormal(): Buffer;
    /**
     * Write serialized response to a buffer
     * writer (includes witness data).
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Write serialized response to a buffer
     * writer (excludes witness data).
     * @param {BufferWriter} bw
     */
    toNormalWriter(bw: BufferWriter): BufferWriter;
    /**
     * Calculate request serialization size.
     * @returns {Number}
     */
    getSize(witness: any): number;
    /**
     * Write serialized response to buffer writer.
     * @private
     * @param {BufferWriter} bw
     * @param {Boolean} witness
     */
    private writeRaw;
    /**
     * Serialize response with witness data.
     * @private
     * @param {Boolean} witness
     * @returns {Buffer}
     */
    private frameRaw;
}
import AbstractBlock = require("../primitives/abstractblock");
import Block = require("../primitives/block");
import Headers = require("../primitives/headers");
//# sourceMappingURL=bip152.d.ts.map