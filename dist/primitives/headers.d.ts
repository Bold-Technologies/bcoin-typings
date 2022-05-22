export = Headers;
/**
 * Headers
 * Represents block headers obtained
 * from the network via `headers`.
 * @alias module:primitives.Headers
 * @extends AbstractBlock
 */
declare class Headers extends AbstractBlock {
    /**
     * Instantiate headers from buffer reader.
     * @param {BufferReader} br
     * @returns {Headers}
     */
    static fromReader(br: BufferReader): Headers;
    /**
     * Instantiate headers from serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Headers}
     */
    static fromRaw(data: Buffer, enc: string | null): Headers;
    /**
     * Instantiate headers from serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Headers}
     */
    static fromHead(data: Buffer, enc: string | null): Headers;
    /**
     * Instantiate headers from a chain entry.
     * @param {ChainEntry} entry
     * @returns {Headers}
     */
    static fromEntry(entry: ChainEntry): Headers;
    /**
     * Convert the block to a headers object.
     * @param {Block|MerkleBlock} block
     * @returns {Headers}
     */
    static fromBlock(block: Block | MerkleBlock): Headers;
    /**
     * Instantiate a merkle block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {Headers}
     */
    static fromJSON(json: any): Headers;
    /**
     * Test an object to see if it is a Headers object.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isHeaders(obj: any): boolean;
    /**
     * Create headers.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    /**
     * Get size of the headers.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the headers to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize the headers.
     * @returns {Buffer|String}
     */
    toRaw(): Buffer | string;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    toHeaders(): Headers;
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
     * Inspect the headers and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    format(view: CoinView, height: number): any;
}
import AbstractBlock = require("./abstractblock");
//# sourceMappingURL=headers.d.ts.map