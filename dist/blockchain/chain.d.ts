export = Chain;
/**
 * Blockchain
 * @alias module:blockchain.Chain
 * @property {ChainDB} db
 * @property {ChainEntry?} tip
 * @property {Number} height
 * @property {DeploymentState} state
 */
declare class Chain {
    /**
     * Create a blockchain.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    opened: boolean;
    options: ChainOptions;
    network: Network;
    logger: any;
    blocks: any;
    workers: any;
    db: ChainDB;
    locker: any;
    invalid: any;
    state: DeploymentState;
    tip: ChainEntry;
    height: number;
    synced: boolean;
    orphanMap: any;
    orphanPrev: any;
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
     * Perform all necessary contextual verification on a block.
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise} - Returns {@link ContextResult}.
     */
    private verifyContext;
    /**
     * Perform all necessary contextual verification
     * on a block, without POW check.
     * @param {Block} block
     * @returns {Promise}
     */
    verifyBlock(block: Block): Promise<any>;
    /**
     * Perform all necessary contextual verification
     * on a block, without POW check (no lock).
     * @private
     * @param {Block} block
     * @returns {Promise}
     */
    private _verifyBlock;
    /**
     * Test whether the hash is in the main chain.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    isMainHash(hash: Hash): Promise<any>;
    /**
     * Test whether the entry is in the main chain.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns Boolean.
     */
    isMainChain(entry: ChainEntry): Promise<any>;
    /**
     * Get ancestor by `height`.
     * @param {ChainEntry} entry
     * @param {Number} height
     * @returns {Promise} - Returns ChainEntry.
     */
    getAncestor(entry: ChainEntry, height: number): Promise<any>;
    /**
     * Get previous entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    getPrevious(entry: ChainEntry): Promise<any>;
    /**
     * Get previous cached entry.
     * @param {ChainEntry} entry
     * @returns {ChainEntry|null}
     */
    getPrevCache(entry: ChainEntry): ChainEntry | null;
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    getNext(entry: ChainEntry): Promise<any>;
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    getNextEntry(entry: ChainEntry): Promise<any>;
    /**
     * Calculate median time past.
     * @param {ChainEntry} prev
     * @param {Number?} time
     * @returns {Promise} - Returns Number.
     */
    getMedianTime(prev: ChainEntry, time: number | null): Promise<any>;
    /**
     * Test whether the entry is potentially
     * an ancestor of a checkpoint.
     * @param {ChainEntry} prev
     * @returns {Boolean}
     */
    isHistorical(prev: ChainEntry): boolean;
    /**
     * Contextual verification for a block, including
     * version deployments (IsSuperMajority), versionbits,
     * coinbase height, finality checks.
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    private verify;
    /**
     * Check all deployments on a chain, ranging from p2sh to segwit.
     * @param {Number} time
     * @param {ChainEntry} prev
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    getDeployments(time: number, prev: ChainEntry): Promise<any>;
    /**
     * Set a new deployment state.
     * @param {DeploymentState} state
     */
    setDeploymentState(state: DeploymentState): void;
    /**
     * Determine whether to check block for duplicate txids in blockchain
     * history (BIP30). If we're on a chain that has bip34 activated, we
     * can skip this.
     * @private
     * @see https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki
     * @param {Block} block
     * @param {ChainEntry} prev
     * @returns {Promise}
     */
    private verifyDuplicates;
    /**
     * Spend and update inputs (checkpoints only).
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @returns {Promise} - Returns {@link CoinView}.
     */
    private updateInputs;
    /**
     * Check block transactions for all things pertaining
     * to inputs. This function is important because it is
     * what actually fills the coins into the block. This
     * function will check the block reward, the sigops,
     * the tx values, and execute and verify the scripts (it
     * will attempt to do this on the worker pool). If
     * `checkpoints` is enabled, it will skip verification
     * for historical data.
     * @private
     * @see TX#verifyInputs
     * @see TX#verify
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {DeploymentState} state
     * @returns {Promise} - Returns {@link CoinView}.
     */
    private verifyInputs;
    /**
     * Find the block at which a fork occurred.
     * @private
     * @param {ChainEntry} fork - The current chain.
     * @param {ChainEntry} longer - The competing chain.
     * @returns {Promise}
     */
    private findFork;
    /**
     * Reorganize the blockchain (connect and disconnect inputs).
     * Called when a competing chain with a higher chainwork
     * is received.
     * @private
     * @param {ChainEntry} competitor - The competing chain's tip.
     * @returns {Promise}
     */
    private reorganize;
    /**
     * Reorganize the blockchain for SPV. This
     * will reset the chain to the fork block.
     * @private
     * @param {ChainEntry} competitor - The competing chain's tip.
     * @returns {Promise}
     */
    private reorganizeSPV;
    /**
     * Disconnect an entry from the chain (updates the tip).
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    disconnect(entry: ChainEntry): Promise<any>;
    /**
     * Reconnect an entry to the chain (updates the tip).
     * This will do contextual-verification on the block
     * (necessary because we cannot validate the inputs
     * in alternate chains when they come in).
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    reconnect(entry: ChainEntry): Promise<any>;
    /**
     * Set the best chain. This is called on every valid block
     * that comes in. It may add and connect the block (main chain),
     * save the block without connection (alternate chain), or
     * reorganize the chain (a higher fork).
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise}
     */
    private setBestChain;
    /**
     * Save block on an alternate chain.
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise}
     */
    private saveAlternate;
    /**
     * Reset the chain to the desired block. This
     * is useful for replaying the blockchain download
     * for SPV.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    reset(block: Hash | number): Promise<any>;
    /**
     * Reset the chain to the desired block without a lock.
     * @private
     * @param {Hash|Number} block
     * @param {Boolean} silent
     * @returns {Promise}
     */
    private _reset;
    /**
     * Reset the chain to a height or hash. Useful for replaying
     * the blockchain download for SPV.
     * @param {Hash|Number} block - hash/height
     * @returns {Promise}
     */
    replay(block: Hash | number): Promise<any>;
    /**
     * Reset the chain without a lock.
     * @private
     * @param {Hash|Number} block - hash/height
     * @param {Boolean?} silent
     * @returns {Promise}
     */
    private _replay;
    /**
     * Invalidate block.
     * @param {Hash} hash
     * @returns {Promise}
     */
    invalidate(hash: Hash): Promise<any>;
    /**
     * Invalidate block (no lock).
     * @param {Hash} hash
     * @returns {Promise}
     */
    _invalidate(hash: Hash): Promise<any>;
    /**
     * Retroactively prune the database.
     * @returns {Promise}
     */
    prune(): Promise<any>;
    /**
     * Scan the blockchain for transactions containing specified address hashes.
     * @param {Hash} start - Block hash to start at.
     * @param {BloomFilter} filter - Bloom filter containing tx
     * and address hashes.
     * @param {Function} iter - Iterator.
     * @returns {Promise}
     */
    scan(start: Hash, filter: BloomFilter, iter: Function): Promise<any>;
    /**
     * Stop rescanning Blockchain if the rescanning already triggered.
     */
    abortRescan(): Promise<void>;
    /**
     * Add a block to the chain, perform all necessary verification.
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     * @returns {Promise}
     */
    add(block: Block, flags: number | null, id: number | null): Promise<any>;
    /**
     * Add a block to the chain without a lock.
     * @private
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     * @returns {Promise}
     */
    private _add;
    /**
     * Connect block to chain.
     * @private
     * @param {ChainEntry} prev
     * @param {Block} block
     * @param {Number} flags
     * @returns {Promise}
     */
    private connect;
    /**
     * Handle orphans.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    private handleOrphans;
    /**
     * Test whether the chain has reached its slow height.
     * @private
     * @returns {Boolean}
     */
    private isSlow;
    /**
     * Calculate the time difference from
     * start time and log block.
     * @private
     * @param {Array} start
     * @param {Block} block
     * @param {ChainEntry} entry
     */
    private logStatus;
    /**
     * Verify a block hash and height against the checkpoints.
     * @private
     * @param {ChainEntry} prev
     * @param {Hash} hash
     * @returns {Boolean}
     */
    private verifyCheckpoint;
    /**
     * Store an orphan.
     * @private
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     */
    private storeOrphan;
    /**
     * Add an orphan.
     * @private
     * @param {Orphan} orphan
     * @returns {Orphan}
     */
    private addOrphan;
    /**
     * Remove an orphan.
     * @private
     * @param {Orphan} orphan
     * @returns {Orphan}
     */
    private removeOrphan;
    /**
     * Test whether a hash would resolve the next orphan.
     * @private
     * @param {Hash} hash - Previous block hash.
     * @returns {Boolean}
     */
    private hasNextOrphan;
    /**
     * Resolve an orphan.
     * @private
     * @param {Hash} hash - Previous block hash.
     * @returns {Orphan}
     */
    private resolveOrphan;
    /**
     * Purge any waiting orphans.
     */
    purgeOrphans(): void;
    /**
     * Prune orphans, only keep the orphan with the highest
     * coinbase height (likely to be the peer's tip).
     */
    limitOrphans(): void;
    /**
     * Test whether an invalid block hash has been seen.
     * @private
     * @param {Block} block
     * @returns {Boolean}
     */
    private hasInvalid;
    /**
     * Mark a block as invalid.
     * @private
     * @param {Hash} hash
     */
    private setInvalid;
    /**
     * Forget an invalid block hash.
     * @private
     * @param {Hash} hash
     */
    private removeInvalid;
    /**
     * Test the chain to see if it contains
     * a block, or has recently seen a block.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    has(hash: Hash): Promise<any>;
    /**
     * Find the corresponding block entry by hash or height.
     * @param {Hash|Number} hash/height
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    getEntry(hash: Hash | number): Promise<any>;
    /**
     * Retrieve a chain entry by height.
     * @param {Number} height
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    getEntryByHeight(height: number): Promise<any>;
    /**
     * Retrieve a chain entry by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    getEntryByHash(hash: Hash): Promise<any>;
    /**
     * Get the hash of a block by height. Note that this
     * will only return hashes in the main chain.
     * @param {Number} height
     * @returns {Promise} - Returns {@link Hash}.
     */
    getHash(height: number): Promise<any>;
    /**
     * Get the height of a block by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns Number.
     */
    getHeight(hash: Hash): Promise<any>;
    /**
     * Test the chain to see if it contains a block.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasEntry(hash: Hash): Promise<any>;
    /**
     * Get the _next_ block hash (does not work by height).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Hash}.
     */
    getNextHash(hash: Hash): Promise<any>;
    /**
     * Check whether coins are still unspent. Necessary for bip30.
     * @see https://bitcointalk.org/index.php?topic=67738.0
     * @param {TX} tx
     * @returns {Promise} - Returns Boolean.
     */
    hasCoins(tx: TX): Promise<any>;
    /**
     * Get all tip hashes.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getTips(): Promise<any>;
    /**
     * Get range of hashes.
     * @param {Number} [start=-1]
     * @param {Number} [end=-1]
     * @returns {Promise}
     */
    getHashes(start?: number, end?: number): Promise<any>;
    /**
     * Get a coin (unspents only).
     * @private
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link CoinEntry}.
     */
    private readCoin;
    /**
     * Get a coin (unspents only).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    getBlock(hash: Hash): Promise<any>;
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} block
     * @returns {Promise} - Returns {@link Block}.
     */
    getRawBlock(block: Hash): Promise<any>;
    /**
     * Get a historical block coin viewpoint.
     * @param {Block} block
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getBlockView(block: Block): Promise<any>;
    /**
     * Get an orphan block.
     * @param {Hash} hash
     * @returns {Block}
     */
    getOrphan(hash: Hash): Block;
    /**
     * Test the chain to see if it contains an orphan.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasOrphan(hash: Hash): Promise<any>;
    /**
     * Test the chain to see if it contains a pending block in its queue.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasPending(hash: Hash): Promise<any>;
    /**
     * Get coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getCoinView(tx: TX): Promise<any>;
    /**
     * Test the chain to see if it is synced.
     * @returns {Boolean}
     */
    isFull(): boolean;
    /**
     * Potentially emit a `full` event.
     * @private
     */
    private maybeSync;
    /**
     * Test the chain to see if it has the
     * minimum required chainwork for the
     * network.
     * @returns {Boolean}
     */
    hasChainwork(): boolean;
    /**
     * Get the fill percentage.
     * @returns {Number} percent - Ranges from 0.0 to 1.0.
     */
    getProgress(): number;
    /**
     * Calculate chain locator (an array of hashes).
     * @param {Hash?} start - Height or hash to treat as the tip.
     * The current tip will be used if not present. Note that this can be a
     * non-existent hash, which is useful for headers-first locators.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getLocator(start: Hash | null): Promise<any>;
    /**
     * Calculate chain locator without a lock.
     * @private
     * @param {Hash?} start
     * @returns {Promise}
     */
    private _getLocator;
    /**
     * Calculate the orphan root of the hash (if it is an orphan).
     * @param {Hash} hash
     * @returns {Hash}
     */
    getOrphanRoot(hash: Hash): Hash;
    /**
     * Calculate the time difference (in seconds)
     * between two blocks by examining chainworks.
     * @param {ChainEntry} to
     * @param {ChainEntry} from
     * @returns {Number}
     */
    getProofTime(to: ChainEntry, from: ChainEntry): number;
    /**
     * Calculate the next target based on the chain tip.
     * @returns {Promise} - returns Number
     * (target is in compact/mantissa form).
     */
    getCurrentTarget(): Promise<any>;
    /**
     * Calculate the next target.
     * @param {Number} time - Next block timestamp.
     * @param {ChainEntry} prev - Previous entry.
     * @returns {Promise} - returns Number
     * (target is in compact/mantissa form).
     */
    getTarget(time: number, prev: ChainEntry): Promise<any>;
    /**
     * Retarget. This is called when the chain height
     * hits a retarget diff interval.
     * @param {ChainEntry} prev - Previous entry.
     * @param {ChainEntry} first - Chain entry from 2 weeks prior.
     * @returns {Number} target - Target in compact/mantissa form.
     */
    retarget(prev: ChainEntry, first: ChainEntry): number;
    /**
     * Find a locator. Analagous to bitcoind's `FindForkInGlobalIndex()`.
     * @param {Hash[]} locator - Hashes.
     * @returns {Promise} - Returns {@link Hash} (the
     * hash of the latest known block).
     */
    findLocator(locator: Hash[]): Promise<any>;
    /**
     * Check whether a versionbits deployment is active (BIP9: versionbits).
     * @example
     * await chain.isActive(tip, deployments.segwit);
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {String} deployment - Deployment id.
     * @returns {Promise} - Returns Number.
     */
    isActive(prev: ChainEntry, deployment: string): Promise<any>;
    /**
     * Get chain entry state for a deployment (BIP9: versionbits).
     * @example
     * await chain.getState(tip, deployments.segwit);
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {String} deployment - Deployment id.
     * @returns {Promise} - Returns Number.
     */
    getState(prev: ChainEntry, deployment: string): Promise<any>;
    /**
     * Compute the version for a new block (BIP9: versionbits).
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry (usually the tip).
     * @returns {Promise} - Returns Number.
     */
    computeBlockVersion(prev: ChainEntry): Promise<any>;
    /**
     * Get the current deployment state of the chain. Called on load.
     * @private
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    private getDeploymentState;
    /**
     * Check transaction finality, taking into account MEDIAN_TIME_PAST
     * if it is present in the lock flags.
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {TX} tx
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    verifyFinal(prev: ChainEntry, tx: TX, flags: LockFlags): Promise<any>;
    /**
     * Get the necessary minimum time and height sequence locks for a transaction.
     * @param {ChainEntry} prev
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise}
     */
    getLocks(prev: ChainEntry, tx: TX, view: CoinView, flags: LockFlags): Promise<any>;
    /**
     * Verify sequence locks.
     * @param {ChainEntry} prev
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    verifyLocks(prev: ChainEntry, tx: TX, view: CoinView, flags: LockFlags): Promise<any>;
}
/**
 * ChainOptions
 * @alias module:blockchain.ChainOptions
 */
declare class ChainOptions {
    /**
     * Instantiate chain options from object.
     * @param {Object} options
     * @returns {ChainOptions}
     */
    static fromOptions(options: any): ChainOptions;
    /**
     * Create chain options.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    network: Network;
    logger: any;
    blocks: any;
    workers: any;
    prefix: any;
    location: any;
    memory: boolean;
    maxFiles: number;
    cacheSize: number;
    compression: boolean;
    spv: boolean;
    bip91: boolean;
    bip148: boolean;
    prune: boolean;
    forceFlags: boolean;
    entryCache: number;
    maxOrphans: number;
    checkpoints: boolean;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {ChainOptions}
     */
    private fromOptions;
}
import Network = require("../protocol/network");
import ChainDB = require("./chaindb");
/**
 * Deployment State
 * @alias module:blockchain.DeploymentState
 * @property {VerifyFlags} flags
 * @property {LockFlags} lockFlags
 * @property {Boolean} bip34
 */
declare class DeploymentState {
    flags: any;
    lockFlags: any;
    bip34: boolean;
    bip91: boolean;
    bip148: boolean;
    /**
     * Test whether p2sh is active.
     * @returns {Boolean}
     */
    hasP2SH(): boolean;
    /**
     * Test whether bip34 (coinbase height) is active.
     * @returns {Boolean}
     */
    hasBIP34(): boolean;
    /**
     * Test whether bip66 (VERIFY_DERSIG) is active.
     * @returns {Boolean}
     */
    hasBIP66(): boolean;
    /**
     * Test whether cltv is active.
     * @returns {Boolean}
     */
    hasCLTV(): boolean;
    /**
     * Test whether median time past locktime is active.
     * @returns {Boolean}
     */
    hasMTP(): boolean;
    /**
     * Test whether csv is active.
     * @returns {Boolean}
     */
    hasCSV(): boolean;
    /**
     * Test whether segwit is active.
     * @returns {Boolean}
     */
    hasWitness(): boolean;
    /**
     * Test whether bip91 is active.
     * @returns {Boolean}
     */
    hasBIP91(): boolean;
    /**
     * Test whether bip148 is active.
     * @returns {Boolean}
     */
    hasBIP148(): boolean;
}
import ChainEntry = require("./chainentry");
import CoinView = require("../coins/coinview");
//# sourceMappingURL=chain.d.ts.map