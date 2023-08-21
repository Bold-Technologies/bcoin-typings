export = Mempool;
/**
 * Mempool
 * Represents a mempool.
 * @extends EventEmitter
 * @alias module:mempool.Mempool
 */
declare class Mempool extends EventEmitter {
    /**
     * Create a mempool.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    opened: boolean;
    options: MempoolOptions;
    network: Network;
    logger: any;
    workers: any;
    chain: any;
    fees: any;
    locker: any;
    cache: MempoolCache;
    size: number;
    freeCount: number;
    lastTime: number;
    lastFlush: number;
    tip: any;
    waiting: any;
    orphans: any;
    map: any;
    spents: any;
    rejects: any;
    addrindex: AddrIndexer;
    /**
     * Open the chain, wait for the database to load.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the chain, wait for the database to close.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Notify the mempool that a new block has come
     * in (removes all transactions contained in the
     * block from the mempool).
     * @method
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    addBlock(block: ChainEntry, txs: TX[]): Promise<any>;
    /**
     * Notify the mempool that a new block
     * has come without a lock.
     * @private
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    private _addBlock;
    /**
     * Notify the mempool that a block has been disconnected
     * from the main chain (reinserts transactions into the mempool).
     * @method
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    removeBlock(block: ChainEntry, txs: TX[]): Promise<any>;
    /**
     * Notify the mempool that a block
     * has been disconnected without a lock.
     * @method
     * @private
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    private _removeBlock;
    /**
     * Sanitize the mempool after a reorg.
     * @private
     * @returns {Promise}
     */
    private _handleReorg;
    /**
     * Reset the mempool.
     * @method
     * @returns {Promise}
     */
    reset(): Promise<any>;
    /**
     * Reset the mempool without a lock.
     * @private
     */
    private _reset;
    /**
     * Ensure the size of the mempool stays below `maxSize`.
     * Evicts entries by timestamp and cumulative fee rate.
     * @param {MempoolEntry} added
     * @returns {Promise}
     */
    limitSize(added: MempoolEntry): Promise<any>;
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {TX}
     */
    getTX(hash: Hash): TX;
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {MempoolEntry}
     */
    getEntry(hash: Hash): MempoolEntry;
    /**
     * Retrieve a coin from the mempool (unspents only).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Coin}
     */
    getCoin(hash: Hash, index: number): Coin;
    /**
     * Check whether coin is still unspent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {boolean}
     */
    hasCoin(hash: Hash, index: number): boolean;
    /**
     * Check to see if a coin has been spent. This differs from
     * {@link ChainDB#isSpent} in that it actually maintains a
     * map of spent coins, whereas ChainDB may return `true`
     * for transaction outputs that never existed.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Boolean}
     */
    isSpent(hash: Hash, index: number): boolean;
    /**
     * Get an output's spender entry.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {MempoolEntry}
     */
    getSpent(hash: Hash, index: number): MempoolEntry;
    /**
     * Get an output's spender transaction.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {MempoolEntry}
     */
    getSpentTX(hash: Hash, index: number): MempoolEntry;
    /**
     * Find all transactions pertaining to a certain address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {TX[]}
     */
    getTXByAddress(addr: Address, options: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): TX[];
    /**
     * Find all transactions pertaining to a certain address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {TXMeta[]}
     */
    getMetaByAddress(addr: Address, options: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): TXMeta[];
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {TXMeta}
     */
    getMeta(hash: Hash): TXMeta;
    /**
     * Test the mempool to see if it contains a transaction.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasEntry(hash: Hash): boolean;
    /**
     * Test the mempool to see if it
     * contains a transaction or an orphan.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    has(hash: Hash): boolean;
    /**
     * Test the mempool to see if it
     * contains a transaction or an orphan.
     * @private
     * @param {Hash} hash
     * @returns {Boolean}
     */
    private exists;
    /**
     * Test the mempool to see if it
     * contains a recent reject.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasReject(hash: Hash): boolean;
    /**
     * Add a transaction to the mempool. Note that this
     * will lock the mempool until the transaction is
     * fully processed.
     * @method
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    addTX(tx: TX, id: number | null): Promise<any>;
    /**
     * Add a transaction to the mempool without a lock.
     * @method
     * @private
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    private _addTX;
    /**
     * Add a transaction to the mempool without a lock.
     * @method
     * @private
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    private insertTX;
    /**
     * Verify a transaction with mempool standards.
     * @method
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     * @returns {Promise}
     */
    verify(entry: MempoolEntry, view: CoinView): Promise<any>;
    /**
     * Verify inputs, return a boolean
     * instead of an error based on success.
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    verifyResult(tx: TX, view: CoinView, flags: VerifyFlags): Promise<any>;
    /**
     * Verify inputs for standard
     * _and_ mandatory flags on failure.
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    verifyInputs(tx: TX, view: CoinView, flags: VerifyFlags): Promise<any>;
    /**
     * Add a transaction to the mempool without performing any
     * validation. Note that this method does not lock the mempool
     * and may lend itself to race conditions if used unwisely.
     * This function will also resolve orphans if possible (the
     * resolved orphans _will_ be validated).
     * @method
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     * @returns {Promise}
     */
    addEntry(entry: MempoolEntry, view: CoinView): Promise<any>;
    /**
     * Remove a transaction from the mempool.
     * Generally only called when a new block
     * is added to the main chain.
     * @param {MempoolEntry} entry
     */
    removeEntry(entry: MempoolEntry): void;
    /**
     * Remove a transaction from the mempool.
     * Recursively remove its spenders.
     * @param {MempoolEntry} entry
     */
    evictEntry(entry: MempoolEntry): void;
    /**
     * Recursively remove spenders of a transaction.
     * @private
     * @param {MempoolEntry} entry
     */
    private removeSpenders;
    /**
     * Count the highest number of
     * ancestors a transaction may have.
     * @param {MempoolEntry} entry
     * @returns {Number}
     */
    countAncestors(entry: MempoolEntry): number;
    /**
     * Count the highest number of
     * ancestors a transaction may have.
     * Update descendant fees and size.
     * @param {MempoolEntry} entry
     * @param {Function} map
     * @returns {Number}
     */
    updateAncestors(entry: MempoolEntry, map: Function): number;
    /**
     * Traverse ancestors and count.
     * @private
     * @param {MempoolEntry} entry
     * @param {Object} set
     * @param {MempoolEntry} child
     * @param {Function} map
     * @returns {Number}
     */
    private _countAncestors;
    /**
     * Count the highest number of
     * descendants a transaction may have.
     * @param {MempoolEntry} entry
     * @returns {Number}
     */
    countDescendants(entry: MempoolEntry): number;
    /**
     * Count the highest number of
     * descendants a transaction may have.
     * @private
     * @param {MempoolEntry} entry
     * @param {Object} set
     * @returns {Number}
     */
    private _countDescendants;
    /**
     * Get all transaction ancestors.
     * @param {MempoolEntry} entry
     * @returns {MempoolEntry[]}
     */
    getAncestors(entry: MempoolEntry): MempoolEntry[];
    /**
     * Get all transaction ancestors.
     * @private
     * @param {MempoolEntry} entry
     * @param {MempoolEntry[]} entries
     * @param {Object} set
     * @returns {MempoolEntry[]}
     */
    private _getAncestors;
    /**
     * Get all a transaction descendants.
     * @param {MempoolEntry} entry
     * @returns {MempoolEntry[]}
     */
    getDescendants(entry: MempoolEntry): MempoolEntry[];
    /**
     * Get all a transaction descendants.
     * @param {MempoolEntry} entry
     * @param {MempoolEntry[]} entries
     * @param {Object} set
     * @returns {MempoolEntry[]}
     */
    _getDescendants(entry: MempoolEntry, entries: MempoolEntry[], set: any): MempoolEntry[];
    /**
     * Find a unconfirmed transactions that
     * this transaction depends on.
     * @param {TX} tx
     * @returns {Hash[]}
     */
    getDepends(tx: TX): Hash[];
    /**
     * Test whether a transaction has dependencies.
     * @param {TX} tx
     * @returns {Boolean}
     */
    hasDepends(tx: TX): boolean;
    /**
     * Return the full balance of all unspents in the mempool
     * (not very useful in practice, only used for testing).
     * @returns {SatoshiAmount}
     */
    getBalance(): SatoshiAmount;
    /**
     * Retrieve _all_ transactions from the mempool.
     * @returns {TX[]}
     */
    getHistory(): TX[];
    /**
     * Retrieve an orphan transaction.
     * @param {Hash} hash
     * @returns {TX}
     */
    getOrphan(hash: Hash): TX;
    /**
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasOrphan(hash: Hash): boolean;
    /**
     * Maybe store an orphaned transaction.
     * @param {TX} tx
     * @param {CoinView} view
     * @param {Number} id
     */
    maybeOrphan(tx: TX, view: CoinView, id: number): any[];
    /**
     * Resolve orphans and attempt to add to mempool.
     * @method
     * @param {TX} parent
     * @returns {Promise} - Returns {@link TX}[].
     */
    handleOrphans(parent: TX): Promise<any>;
    /**
     * Potentially resolve any transactions
     * that redeem the passed-in transaction.
     * Deletes all orphan entries and
     * returns orphan objects.
     * @param {TX} parent
     * @returns {Orphan[]}
     */
    resolveOrphans(parent: TX): Orphan[];
    /**
     * Remove a transaction from the mempool.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    removeOrphan(hash: Hash): boolean;
    /**
     * Remove a random orphan transaction from the mempool.
     * @returns {Boolean}
     */
    limitOrphans(): boolean;
    /**
     * Test all of a transactions outpoints to see if they are doublespends.
     * Note that this will only test against the mempool spents, not the
     * blockchain's. The blockchain spents are not checked against because
     * the blockchain does not maintain a spent list. The transaction will
     * be seen as an orphan rather than a double spend.
     * @param {TX} tx
     * @returns {Promise} - Returns Boolean.
     */
    isDoubleSpend(tx: TX): Promise<any>;
    /**
     * Get coin viewpoint (lock).
     * Note: this does not return
     * historical view of coins from the indexers.
     * @method
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getSpentView(tx: TX): Promise<any>;
    /**
     * Get coin viewpoint
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}
     */
    _getSpentView(tx: TX): Promise<any>;
    /**
     * Get coin viewpoint (no lock).
     * @method
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getCoinView(tx: TX): Promise<any>;
    /**
     * Get a snapshot of all transaction hashes in the mempool. Used
     * for generating INV packets in response to MEMPOOL packets.
     * @returns {Hash[]}
     */
    getSnapshot(): Hash[];
    /**
     * Check sequence locks on a transaction against the current tip.
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    verifyLocks(tx: TX, view: CoinView, flags: LockFlags): Promise<any>;
    /**
     * Check locktime on a transaction against the current tip.
     * @param {TX} tx
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    verifyFinal(tx: TX, flags: LockFlags): Promise<any>;
    /**
     * Map a transaction to the mempool.
     * @private
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     */
    private trackEntry;
    /**
     * Unmap a transaction from the mempool.
     * @private
     * @param {MempoolEntry} entry
     */
    private untrackEntry;
    /**
     * Index an entry by address.
     * @private
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     */
    private indexEntry;
    /**
     * Unindex an entry by address.
     * @private
     * @param {MempoolEntry} entry
     */
    private unindexEntry;
    /**
     * Recursively remove double spenders
     * of a mined transaction's outpoints.
     * @private
     * @param {TX} tx
     */
    private removeDoubleSpends;
    /**
     * Calculate the memory usage of the entire mempool.
     * @see DynamicMemoryUsage()
     * @returns {Number} Usage in bytes.
     */
    getSize(): number;
    /**
     * Prioritise transaction.
     * @param {MempoolEntry} entry
     * @param {Number} pri
     * @param {SatoshiAmount} fee
     */
    prioritise(entry: MempoolEntry, pri: number, fee: SatoshiAmount): void;
}
import EventEmitter = require("events");
/**
 * Mempool Options
 * @alias module:mempool.MempoolOptions
 */
declare class MempoolOptions {
    /**
     * Instantiate mempool options from object.
     * @param {Object} options
     * @returns {MempoolOptions}
     */
    static fromOptions(options: any): MempoolOptions;
    /**
     * Create mempool options.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    network: Network;
    chain: any;
    logger: any;
    workers: any;
    fees: any;
    limitFree: boolean;
    limitFreeRelay: number;
    relayPriority: boolean;
    requireStandard: any;
    rejectAbsurdFees: boolean;
    prematureWitness: boolean;
    paranoidChecks: boolean;
    replaceByFee: boolean;
    maxSize: number;
    maxOrphans: 100;
    maxAncestors: 25;
    expiryTime: number;
    minRelay: any;
    prefix: any;
    location: any;
    memory: boolean;
    maxFiles: number;
    cacheSize: number;
    compression: boolean;
    persistent: boolean;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {MempoolOptions}
     */
    private fromOptions;
    indexAddress: any;
}
import Network = require("../protocol/network");
/**
 * Mempool Cache
 * @ignore
 */
declare class MempoolCache {
    /**
     * Create a mempool cache.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    logger: any;
    chain: any;
    network: any;
    db: any;
    batch: any;
    getVersion(): Promise<any>;
    getTip(): Promise<any>;
    getFees(): Promise<Fees>;
    getEntries(): any;
    getKeys(): any;
    open(): Promise<void>;
    close(): Promise<void>;
    save(entry: any): void;
    remove(hash: any): void;
    sync(tip: any): void;
    writeFees(fees: any): void;
    clear(): void;
    flush(): Promise<void>;
    init(hash: any): Promise<void>;
    verify(): Promise<boolean>;
    wipe(): Promise<void>;
}
declare namespace MempoolCache {
    const VERSION: number;
}
import AddrIndexer = require("./addrindexer");
import TX = require("../primitives/tx");
import MempoolEntry = require("./mempoolentry");
import Coin = require("../primitives/coin");
import TXMeta = require("../primitives/txmeta");
import CoinView = require("../coins/coinview");
/**
 * Orphan
 * @ignore
 */
declare class Orphan {
    /**
     * Create an orphan.
     * @constructor
     * @param {TX} tx
     * @param {Hash[]} missing
     * @param {Number} id
     */
    constructor(tx: TX, missing: Hash[], id: number);
    raw: Buffer;
    missing: Hash[];
    id: number;
    toTX(): TX;
}
import Fees = require("./fees");
//# sourceMappingURL=mempool.d.ts.map