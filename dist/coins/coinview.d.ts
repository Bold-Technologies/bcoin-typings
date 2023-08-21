export = CoinView;
/**
 * Coin View
 * Represents a coin viewpoint:
 * a snapshot of {@link Coins} objects.
 * @alias module:coins.CoinView
 * @property {Object} map
 * @property {UndoCoins} undo
 */
declare class CoinView {
    /**
     * Read serialized view data from a buffer
     * reader as it pertains to a transaction.
     * @param {BufferReader} br
     * @param {TX} tx
     * @returns {CoinView}
     */
    static fromReader(br: BufferReader, tx: TX): CoinView;
    map: any;
    undo: UndoCoins;
    /**
     * Get coins.
     * @param {Hash} hash
     * @returns {Coins} coins
     */
    get(hash: Hash): Coins;
    /**
     * Test whether the view has an entry.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    has(hash: Hash): boolean;
    /**
     * Add coins to the collection.
     * @param {Hash} hash
     * @param {Coins} coins
     * @returns {Coins}
     */
    add(hash: Hash, coins: Coins): Coins;
    /**
     * Ensure existence of coins object in the collection.
     * @param {Hash} hash
     * @returns {Coins}
     */
    ensure(hash: Hash): Coins;
    /**
     * Remove coins from the collection.
     * @param {Hash} hash
     * @returns {Coins|null}
     */
    remove(hash: Hash): Coins | null;
    /**
     * Add a tx to the collection.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    addTX(tx: TX, height: number): Coins;
    /**
     * Remove a tx from the collection.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    removeTX(tx: TX, height: number): Coins;
    /**
     * Add an entry to the collection.
     * @param {Outpoint} prevout
     * @param {CoinEntry} coin
     * @returns {CoinEntry|null}
     */
    addEntry(prevout: Outpoint, coin: CoinEntry): CoinEntry | null;
    /**
     * Add a coin to the collection.
     * @param {Coin} coin
     * @returns {CoinEntry|null}
     */
    addCoin(coin: Coin): CoinEntry | null;
    /**
     * Add an output to the collection.
     * @param {Outpoint} prevout
     * @param {Output} output
     * @returns {CoinEntry|null}
     */
    addOutput(prevout: Outpoint, output: Output): CoinEntry | null;
    /**
     * Add an output to the collection by output index.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {CoinEntry|null}
     */
    addIndex(tx: TX, index: number, height: number): CoinEntry | null;
    /**
     * Spend an output.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    spendEntry(prevout: Outpoint): CoinEntry | null;
    /**
     * Remove an output.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    removeEntry(prevout: Outpoint): CoinEntry | null;
    /**
     * Test whether the view has an entry by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    hasEntry(prevout: Outpoint): boolean;
    /**
     * Get a single entry by prevout.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    getEntry(prevout: Outpoint): CoinEntry | null;
    /**
     * Test whether an entry has been spent by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    isUnspent(prevout: Outpoint): boolean;
    /**
     * Get a single coin by prevout.
     * @param {Outpoint} prevout
     * @returns {Coin|null}
     */
    getCoin(prevout: Outpoint): Coin | null;
    /**
     * Get a single output by prevout.
     * @param {Outpoint} prevout
     * @returns {Output|null}
     */
    getOutput(prevout: Outpoint): Output | null;
    /**
     * Get coins height by prevout.
     * @param {Outpoint} prevout
     * @returns {Number}
     */
    getHeight(prevout: Outpoint): number;
    /**
     * Get coins coinbase flag by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    isCoinbase(prevout: Outpoint): boolean;
    /**
     * Test whether the view has an entry by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    hasEntryFor(input: Input): boolean;
    /**
     * Get a single entry by input.
     * @param {Input} input
     * @returns {CoinEntry|null}
     */
    getEntryFor(input: Input): CoinEntry | null;
    /**
     * Test whether an entry has been spent by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    isUnspentFor(input: Input): boolean;
    /**
     * Get a single coin by input.
     * @param {Input} input
     * @returns {Coin|null}
     */
    getCoinFor(input: Input): Coin | null;
    /**
     * Get a single output by input.
     * @param {Input} input
     * @returns {Output|null}
     */
    getOutputFor(input: Input): Output | null;
    /**
     * Get coins height by input.
     * @param {Input} input
     * @returns {Number}
     */
    getHeightFor(input: Input): number;
    /**
     * Get coins coinbase flag by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    isCoinbaseFor(input: Input): boolean;
    /**
     * Retrieve coins from database.
     * @method
     * @param {ChainDB} db
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link CoinEntry}.
     */
    readCoin(db: ChainDB, prevout: Outpoint): Promise<any>;
    /**
     * Read all input coins into unspent map.
     * @method
     * @param {ChainDB} db
     * @param {TX} tx
     * @returns {Promise} - Returns {Boolean}.
     */
    readInputs(db: ChainDB, tx: TX): Promise<any>;
    /**
     * Spend coins for transaction.
     * @method
     * @param {ChainDB} db
     * @param {TX} tx
     * @returns {Promise} - Returns {Boolean}.
     */
    spendInputs(db: ChainDB, tx: TX): Promise<any>;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(tx: any): number;
    /**
     * Write coin data to buffer writer
     * as it pertains to a transaction.
     * @param {BufferWriter} bw
     * @param {TX} tx
     */
    toWriter(bw: BufferWriter, tx: TX): BufferWriter;
    /**
     * Read serialized view data from a buffer
     * reader as it pertains to a transaction.
     * @private
     * @param {BufferReader} br
     * @param {TX} tx
     */
    private fromReader;
}
import UndoCoins = require("./undocoins");
import Coins = require("./coins");
import CoinEntry = require("./coinentry");
//# sourceMappingURL=coinview.d.ts.map