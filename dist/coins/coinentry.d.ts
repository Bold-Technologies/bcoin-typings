export = CoinEntry;
/**
 * Coin Entry
 * Represents an unspent output.
 * @alias module:coins.CoinEntry
 * @property {Number} version - Transaction version.
 * @property {Number} height - Transaction height (-1 if unconfirmed).
 * @property {Boolean} coinbase - Whether the containing
 * transaction is a coinbase.
 * @property {Output} output
 * @property {Boolean} spent
 * @property {Buffer} raw
 */
declare class CoinEntry {
    /**
     * Instantiate a coin from a TX
     * @param {Output} output
     * @returns {CoinEntry}
     */
    static fromOutput(output: Output): CoinEntry;
    /**
     * Instantiate a coin from a TX
     * @param {Coin} coin
     * @returns {CoinEntry}
     */
    static fromCoin(coin: Coin): CoinEntry;
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @param {Number} height
     * @returns {CoinEntry}
     */
    static fromTX(tx: TX, index: number, height: number): CoinEntry;
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @returns {CoinEntry}
     */
    static fromReader(data: Buffer): CoinEntry;
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @returns {CoinEntry}
     */
    static fromRaw(data: Buffer): CoinEntry;
    version: number;
    height: number;
    coinbase: boolean;
    output: Output;
    spent: boolean;
    raw: any;
    /**
     * Convert coin entry to an output.
     * @returns {Output}
     */
    toOutput(): Output;
    /**
     * Convert coin entry to a coin.
     * @param {Outpoint} prevout
     * @returns {Coin}
     */
    toCoin(prevout: Outpoint): Coin;
    /**
     * Inject properties from TX.
     * @param {Output} output
     */
    fromOutput(output: Output): CoinEntry;
    /**
     * Inject properties from TX.
     * @param {Coin} coin
     */
    fromCoin(coin: Coin): CoinEntry;
    /**
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     */
    fromTX(tx: TX, index: number, height: number): CoinEntry;
    /**
     * Calculate size of coin.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Write the coin to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize the coin.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
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
}
import Output = require("../primitives/output");
import Coin = require("../primitives/coin");
//# sourceMappingURL=coinentry.d.ts.map