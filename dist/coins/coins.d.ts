export = Coins;
/**
 * Coins
 * Represents the outputs for a single transaction.
 * @alias module:coins.Coins
 * @property {Map[]} outputs - Coins.
 */
declare class Coins {
    /**
     * Instantiate a coins object from a transaction.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    static fromTX(tx: TX, height: number): Coins;
    outputs: any;
    /**
     * Add a single entry to the collection.
     * @param {Number} index
     * @param {CoinEntry} coin
     * @returns {CoinEntry}
     */
    add(index: number, coin: CoinEntry): CoinEntry;
    /**
     * Add a single output to the collection.
     * @param {Number} index
     * @param {Output} output
     * @returns {CoinEntry}
     */
    addOutput(index: number, output: Output): CoinEntry;
    /**
     * Add an output to the collection by output index.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {CoinEntry}
     */
    addIndex(tx: TX, index: number, height: number): CoinEntry;
    /**
     * Add a single coin to the collection.
     * @param {Coin} coin
     * @returns {CoinEntry}
     */
    addCoin(coin: Coin): CoinEntry;
    /**
     * Test whether the collection has a coin.
     * @param {Number} index
     * @returns {Boolean}
     */
    has(index: number): boolean;
    /**
     * Test whether the collection has an unspent coin.
     * @param {Number} index
     * @returns {Boolean}
     */
    isUnspent(index: number): boolean;
    /**
     * Get a coin entry.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    get(index: number): CoinEntry | null;
    /**
     * Get an output.
     * @param {Number} index
     * @returns {Output|null}
     */
    getOutput(index: number): Output | null;
    /**
     * Get a coin.
     * @param {Outpoint} prevout
     * @returns {Coin|null}
     */
    getCoin(prevout: Outpoint): Coin | null;
    /**
     * Spend a coin entry and return it.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    spend(index: number): CoinEntry | null;
    /**
     * Remove a coin entry and return it.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    remove(index: number): CoinEntry | null;
    /**
     * Test whether the coins are fully spent.
     * @returns {Boolean}
     */
    isEmpty(): boolean;
    /**
     * Inject properties from tx.
     * @private
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    private fromTX;
}
import CoinEntry = require("./coinentry");
//# sourceMappingURL=coins.d.ts.map