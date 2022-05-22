export = Coin;
/**
 * Coin
 * Represents an unspent output.
 * @alias module:primitives.Coin
 * @extends Output
 * @property {Number} version
 * @property {Number} height
 * @property {Amount} value
 * @property {Script} script
 * @property {Boolean} coinbase
 * @property {Hash} hash
 * @property {Number} index
 */
declare class Coin extends Output {
    /**
     * Instantiate Coin from options object.
     * @private
     * @param {Object} options
     */
    private static fromOptions;
    /**
     * Instantiate coin from hash table key.
     * @param {String} key
     * @returns {Coin}
     */
    static fromKey(key: string): Coin;
    /**
     * Instantiate an Coin from a jsonified coin object.
     * @param {Object} json - The jsonified coin object.
     * @returns {Coin}
     */
    static fromJSON(json: any): Coin;
    /**
     * Instantiate a coin from a buffer reader.
     * @param {BufferReader} br
     * @returns {Coin}
     */
    static fromReader(br: BufferReader): Coin;
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Coin}
     */
    static fromRaw(data: Buffer, enc: string | null): Coin;
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @returns {Coin}
     */
    static fromTX(tx: TX, index: number, height: any): Coin;
    /**
     * Test an object to see if it is a Coin.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isCoin(obj: any): boolean;
    version: number;
    height: number;
    coinbase: boolean;
    hash: any;
    index: number;
    /**
     * Inject options into coin.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clone the coin.
     * @private
     * @returns {Coin}
     */
    private clone;
    /**
     * Calculate number of confirmations since coin was created.
     * @param {Number?} height - Current chain height. Network
     * height is used if not passed in.
     * @return {Number}
     */
    getDepth(height: number | null): number;
    /**
     * Serialize coin to a key
     * suitable for a hash table.
     * @returns {String}
     */
    toKey(): string;
    /**
     * Inject properties from hash table key.
     * @private
     * @param {String} key
     * @returns {Coin}
     */
    private fromKey;
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    rhash(): Hash;
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    txid(): Hash;
    /**
     * Convert the coin to an object suitable
     * for JSON serialization. Note that the hash
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {Boolean} minimal
     * @returns {Object}
     */
    getJSON(network: Network, minimal: boolean): any;
    /**
     * Inject JSON properties into coin.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Estimate spending size.
     * @param {Function?} getAccount - Returns account that can spend
     * from a given address.
     * @returns {Number}
     */
    estimateSpendingSize(getAccount: Function | null): number;
    /**
     * Inject properties from serialized buffer writer.
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
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     */
    fromTX(tx: TX, index: number, height: any): Coin;
}
import Output = require("./output");
import Network = require("../protocol/network");
//# sourceMappingURL=coin.d.ts.map