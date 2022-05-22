export = TXDB;
/**
 * TXDB
 * @alias module:wallet.TXDB
 */
declare class TXDB {
    /**
     * Create a TXDB.
     * @constructor
     * @param {WalletDB} wdb
     * @param {Number} wid
     */
    constructor(wdb: WalletDB, wid: number);
    wdb: WalletDB;
    db: any;
    logger: any;
    wid: number;
    bucket: any;
    wallet: any;
    locked: any;
    /**
     * Open TXDB.
     * @returns {Promise}
     */
    open(wallet: any): Promise<any>;
    /**
     * Emit transaction event.
     * @private
     * @param {String} event
     * @param {Object} data
     * @param {Details} details
     */
    private emit;
    /**
     * Get wallet path for output.
     * @param {Output} output
     * @returns {Promise} - Returns {@link Path}.
     */
    getPath(output: Output): Promise<any>;
    /**
     * Test whether path exists for output.
     * @param {Output} output
     * @returns {Promise} - Returns Boolean.
     */
    hasPath(output: Output): Promise<any>;
    /**
     * Save credit.
     * @param {Batch} b
     * @param {Credit} credit
     * @param {Path} path
     */
    saveCredit(b: Batch, credit: Credit, path: Path): Promise<any>;
    /**
     * Save unspent credit.
     * @param {Credit} credit
     * @param {Path} path
     */
    saveUnspentCredit(b: any, credit: Credit, path: Path): void;
    /**
     * Remove credit.
     * @param {Batch} b
     * @param {Credit} credit
     * @param {Path} path
     */
    removeCredit(b: Batch, credit: Credit, path: Path): Promise<any>;
    /**
     * Remove spent credit.
     * @param {Credit} credit
     * @param {Path} path
     */
    removeUnspentCredit(b: any, credit: Credit, path: Path): void;
    /**
     * Spend credit.
     * @param {Batch} b
     * @param {Credit} credit
     * @param {TX} tx
     * @param {Number} index
     */
    spendCredit(b: Batch, credit: Credit, tx: TX, index: number): void;
    /**
     * Unspend credit.
     * @param {Batch} b
     * @param {TX} tx
     * @param {Number} index
     */
    unspendCredit(b: Batch, tx: TX, index: number): void;
    /**
     * Write input record.
     * @param {Batch} b
     * @param {TX} tx
     * @param {Number} index
     */
    writeInput(b: Batch, tx: TX, index: number): Promise<any>;
    /**
     * Remove input record.
     * @param {Batch} b
     * @param {TX} tx
     * @param {Number} index
     */
    removeInput(b: Batch, tx: TX, index: number): Promise<any>;
    /**
     * Update wallet balance.
     * @param {Batch} b
     * @param {BalanceDelta} state
     */
    updateBalance(b: Batch, state: BalanceDelta): Promise<any>;
    /**
     * Update account balance.
     * @param {Batch} b
     * @param {Number} acct
     * @param {Balance} delta
     */
    updateAccountBalance(b: Batch, acct: number, delta: Balance): Promise<any>;
    /**
     * Test a whether a coin has been spent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns Boolean.
     */
    getSpent(hash: Hash, index: number): Promise<any>;
    /**
     * Test a whether a coin has been spent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns Boolean.
     */
    isSpent(hash: Hash, index: number): Promise<any>;
    /**
     * Append to global map.
     * @param {Batch} b
     * @param {Number} height
     * @returns {Promise}
     */
    addBlockMap(b: Batch, height: number): Promise<any>;
    /**
     * Remove from global map.
     * @param {Batch} b
     * @param {Number} height
     * @returns {Promise}
     */
    removeBlockMap(b: Batch, height: number): Promise<any>;
    /**
     * Append to global map.
     * @param {Batch} b
     * @param {Hash} hash
     * @returns {Promise}
     */
    addTXMap(b: Batch, hash: Hash): Promise<any>;
    /**
     * Remove from global map.
     * @param {Batch} b
     * @param {Hash} hash
     * @returns {Promise}
     */
    removeTXMap(b: Batch, hash: Hash): Promise<any>;
    /**
     * Append to global map.
     * @param {Batch} b
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    addOutpointMap(b: Batch, hash: Hash, index: number): Promise<any>;
    /**
     * Remove from global map.
     * @param {Batch} b
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    removeOutpointMap(b: Batch, hash: Hash, index: number): Promise<any>;
    /**
     * List block records.
     * @returns {Promise}
     */
    getBlocks(): Promise<any>;
    /**
     * Get block record.
     * @param {Number} height
     * @returns {Promise}
     */
    getBlock(height: number): Promise<any>;
    /**
     * Append to the global block record.
     * @param {Batch} b
     * @param {Hash} hash
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    addBlock(b: Batch, hash: Hash, block: BlockMeta): Promise<any>;
    /**
     * Remove from the global block record.
     * @param {Batch} b
     * @param {Hash} hash
     * @param {Number} height
     * @returns {Promise}
     */
    removeBlock(b: Batch, hash: Hash, height: number): Promise<any>;
    /**
     * Remove from the global block record.
     * @param {Batch} b
     * @param {Hash} hash
     * @param {Number} height
     * @returns {Promise}
     */
    spliceBlock(b: Batch, hash: Hash, height: number): Promise<any>;
    /**
     * Add transaction without a batch.
     * @private
     * @param {TX} tx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    private add;
    /**
     * Insert transaction.
     * @private
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    private insert;
    /**
     * Attempt to confirm a transaction.
     * @private
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    private confirm;
    /**
     * Recursively remove a transaction
     * from the database.
     * @param {Hash} hash
     * @returns {Promise}
     */
    remove(hash: Hash): Promise<any>;
    /**
     * Remove a transaction from the
     * database. Disconnect inputs.
     * @private
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    private erase;
    /**
     * Remove a transaction and recursively
     * remove all of its spenders.
     * @private
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    private removeRecursive;
    /**
     * Revert a block.
     * @param {Number} height
     * @returns {Promise}
     */
    revert(height: number): Promise<any>;
    /**
     * Unconfirm a transaction without a batch.
     * @private
     * @param {Hash} hash
     * @returns {Promise}
     */
    private unconfirm;
    /**
     * Unconfirm a transaction. Necessary after a reorg.
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    disconnect(wtx: typeof records.TXRecord, block: BlockMeta): Promise<any>;
    /**
     * Remove spenders that have not been confirmed. We do this in the
     * odd case of stuck transactions or when a coin is double-spent
     * by a newer transaction. All previously-spending transactions
     * of that coin that are _not_ confirmed will be removed from
     * the database.
     * @private
     * @param {TXRecord} wtx - Reference tx, the tx that double-spent.
     * @returns {Promise} - Returns Boolean.
     */
    private removeConflict;
    /**
     * Retrieve coins for own inputs, remove
     * double spenders, and verify inputs.
     * @private
     * @param {TX} tx
     * @param {Boolean} conf
     * @returns {Promise}
     */
    private removeConflicts;
    /**
     * Lock all coins in a transaction.
     * @param {TX} tx
     */
    lockTX(tx: TX): void;
    /**
     * Unlock all coins in a transaction.
     * @param {TX} tx
     */
    unlockTX(tx: TX): void;
    /**
     * Lock a single coin.
     * @param {Coin|Outpoint} coin
     */
    lockCoin(coin: Coin | Outpoint): void;
    /**
     * Unlock a single coin.
     * @param {Coin|Outpoint} coin
     */
    unlockCoin(coin: Coin | Outpoint): any;
    /**
     * Unlock all coins.
     */
    unlockCoins(): void;
    /**
     * Test locked status of a single coin.
     * @param {Coin|Outpoint} coin
     */
    isLocked(coin: Coin | Outpoint): any;
    /**
     * Filter array of coins or outpoints
     * for only unlocked ones.
     * @param {Coin[]|Outpoint[]} coins
     * @returns {Array}
     */
    filterLocked(coins: Coin[] | Outpoint[]): any[];
    /**
     * Return an array of all locked outpoints.
     * @returns {Outpoint[]}
     */
    getLocked(): Outpoint[];
    /**
     * Get hashes of all transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getAccountHistoryHashes(acct: number): Promise<any>;
    /**
     * Get hashes of all transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getHistoryHashes(acct: number): Promise<any>;
    /**
     * Get hashes of all unconfirmed transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getAccountPendingHashes(acct: number): Promise<any>;
    /**
     * Get hashes of all unconfirmed transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getPendingHashes(acct: number): Promise<any>;
    /**
     * Test whether the database has a pending transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasPending(hash: Hash): Promise<any>;
    /**
     * Get all coin hashes in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getAccountOutpoints(acct: number): Promise<any>;
    /**
     * Get all coin hashes in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getOutpoints(acct: number): Promise<any>;
    /**
     * Get TX hashes by height range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getAccountHeightRangeHashes(acct: number, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get TX hashes by height range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getHeightRangeHashes(acct: number, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get TX hashes by height.
     * @param {Number} height
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getHeightHashes(height: number): Promise<any>;
    /**
     * Get TX hashes by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getAccountRangeHashes(acct: number, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get TX hashes by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getRangeHashes(acct: number, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get transactions by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link TX}[].
     */
    getRange(acct: number, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get last N transactions.
     * @param {Number} acct
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise} - Returns {@link TX}[].
     */
    getLast(acct: number, limit: number): Promise<any>;
    /**
     * Get all transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    getHistory(acct: number): Promise<any>;
    /**
     * Get all acct transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    getAccountHistory(acct: number): Promise<any>;
    /**
     * Get unconfirmed transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    getPending(acct: number): Promise<any>;
    /**
     * Get coins.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getCredits(acct: number): Promise<any>;
    /**
     * Get coins by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getAccountCredits(acct: number): Promise<any>;
    /**
     * Fill a transaction with coins (all historical coins).
     * @param {TX} tx
     * @returns {Promise} - Returns {@link TX}.
     */
    getSpentCredits(tx: TX): Promise<any>;
    /**
     * Get coins.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getCoins(acct: number): Promise<any>;
    /**
     * Get coins by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getAccountCoins(acct: number): Promise<any>;
    /**
     * Get unspent coins.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getUnspentCoins(acct: number): Promise<any>;
    /**
     * Get unspent credits.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Credit}[].
     */
    getUnspentCredits(acct: number): Promise<any>;
    /**
     * Get unspent credits by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Credit}[].
     */
    getUnspentAccountCredits(acct: number): Promise<any>;
    /**
     * Get historical coins for a transaction.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link TX}.
     */
    getSpentCoins(tx: TX): Promise<any>;
    /**
     * Get a coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getCoinView(tx: TX): Promise<any>;
    /**
     * Get historical coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getSpentView(tx: TX): Promise<any>;
    /**
     * Get transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * Get transaction details.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXDetails}.
     */
    getDetails(hash: Hash): Promise<any>;
    /**
     * Convert transaction to transaction details.
     * @param {TXRecord[]} wtxs
     * @returns {Promise}
     */
    toDetails(wtxs: (typeof records.TXRecord)[]): Promise<any>;
    /**
     * Convert transaction to transaction details.
     * @private
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    private _toDetails;
    /**
     * Test whether the database has a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasTX(hash: Hash): Promise<any>;
    /**
     * Get coin.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Get coin.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    getCredit(hash: Hash, index: number): Promise<any>;
    /**
     * Get spender coin.
     * @param {Outpoint} spent
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link Coin}.
     */
    getSpentCoin(spent: Outpoint, prevout: Outpoint): Promise<any>;
    /**
     * Test whether the database has a spent coin.
     * @param {Outpoint} spent
     * @returns {Promise} - Returns {@link Coin}.
     */
    hasSpentCoin(spent: Outpoint): Promise<any>;
    /**
     * Update spent coin height in storage.
     * @param {Batch} b
     * @param {TX} tx - Sending transaction.
     * @param {Number} index
     * @param {Number} height
     * @returns {Promise}
     */
    updateSpentCoin(b: Batch, tx: TX, index: number, height: number): Promise<any>;
    /**
     * Test whether the database has a transaction.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns Boolean.
     */
    hasCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Calculate balance.
     * @param {Number?} acct
     * @returns {Promise} - Returns {@link Balance}.
     */
    getBalance(acct: number | null): Promise<any>;
    /**
     * Calculate balance.
     * @returns {Promise} - Returns {@link Balance}.
     */
    getWalletBalance(): Promise<any>;
    /**
     * Calculate balance by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Balance}.
     */
    getAccountBalance(acct: number): Promise<any>;
    /**
     * Zap pending transactions older than `age`.
     * @param {Number} acct
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    zap(acct: number, age: number): Promise<any>;
    /**
     * Abandon transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    abandon(hash: Hash): Promise<any>;
}
/**
 * Credit (wrapped coin)
 * @alias module:wallet.Credit
 * @property {Coin} coin
 * @property {Boolean} spent
 */
declare class Credit {
    /**
     * Instantiate credit from serialized data.
     * @param {Buffer} data
     * @returns {Credit}
     */
    static fromRaw(data: Buffer): Credit;
    /**
     * Instantiate credit from transaction.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {Credit}
     */
    static fromTX(tx: TX, index: number, height: number): Credit;
    /**
     * Create a credit.
     * @constructor
     * @param {Coin} coin
     * @param {Boolean?} spent
     */
    constructor(coin: Coin, spent: boolean | null);
    coin: Coin;
    spent: boolean;
    own: boolean;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Get serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize credit.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from tx object.
     * @private
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {Credit}
     */
    private fromTX;
}
/**
 * Balance Delta
 * @ignore
 */
declare class BalanceDelta {
    wallet: Balance;
    accounts: Map<any, any>;
    updated(): boolean;
    applyTo(balance: any): void;
    get(path: any): any;
    tx(path: any, value: any): void;
    coin(path: any, value: any): void;
    unconfirmed(path: any, value: any): void;
    confirmed(path: any, value: any): void;
}
/**
 * Balance
 * @alias module:wallet.Balance
 */
declare class Balance {
    /**
     * Instantiate balance from serialized data.
     * @param {Number} acct
     * @param {Buffer} data
     * @returns {Balance}
     */
    static fromRaw(acct: number, data: Buffer): Balance;
    /**
     * Create a balance.
     * @constructor
     * @param {Number} acct
     */
    constructor(acct?: number);
    account: number;
    tx: number;
    coin: number;
    unconfirmed: number;
    confirmed: number;
    /**
     * Apply delta.
     * @param {Balance} balance
     */
    applyTo(balance: Balance): void;
    /**
     * Serialize balance.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {Balance}
     */
    private fromRaw;
    /**
     * Convert balance to a more json-friendly object.
     * @param {Boolean?} minimal
     * @returns {Object}
     */
    toJSON(minimal: boolean | null): any;
}
import records = require("./records");
import Coin = require("../primitives/coin");
import Outpoint = require("../primitives/outpoint");
//# sourceMappingURL=txdb.d.ts.map