export = WalletDB;
/**
 * WalletDB
 * @alias module:wallet.WalletDB
 * @extends EventEmitter
 */
declare class WalletDB extends EventEmitter {
    /**
     * Create a wallet db.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    options: WalletOptions;
    network: Network;
    logger: any;
    workers: any;
    client: any;
    feeRate: number;
    db: any;
    primary: any;
    state: records.ChainState;
    confirming: boolean;
    height: number;
    wallets: Map<any, any>;
    depth: number;
    rescanning: boolean;
    filterSent: boolean;
    readLock: any;
    writeLock: any;
    txLock: any;
    filter: any;
    /**
     * Initialize walletdb.
     * @private
     */
    private init;
    /**
     * Bind to node events.
     * @private
     */
    private _bind;
    /**
     * Open the walletdb, wait for the database to load.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Verify network.
     * @returns {Promise}
     */
    verifyNetwork(): Promise<any>;
    /**
     * Close the walletdb, wait for the database to close.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Watch addresses and outpoints.
     * @private
     * @returns {Promise}
     */
    private watch;
    /**
     * Connect to the node server (client required).
     * @returns {Promise}
     */
    connect(): Promise<any>;
    /**
     * Disconnect from node server (client required).
     * @returns {Promise}
     */
    disconnect(): Promise<any>;
    /**
     * Sync state with server on every connect.
     * @returns {Promise}
     */
    syncNode(): Promise<any>;
    /**
     * Initialize and write initial sync state.
     * @returns {Promise}
     */
    syncState(): Promise<any>;
    /**
     * Migrate sync state.
     * @private
     * @param {ChainState} state
     * @returns {Promise}
     */
    private migrateState;
    /**
     * Connect and sync with the chain server.
     * @private
     * @returns {Promise}
     */
    private syncChain;
    /**
     * Rescan blockchain from a given height.
     * @private
     * @param {Number?} height
     * @returns {Promise}
     */
    private scan;
    /**
     * Force a rescan.
     * @param {Number} height
     * @returns {Promise}
     */
    rescan(height: number): Promise<any>;
    /**
     * Force a rescan (without a lock).
     * @private
     * @param {Number} height
     * @returns {Promise}
     */
    private _rescan;
    /**
     * Abort Rescanning.
     */
    abortRescan(): any;
    /**
     * Broadcast a transaction via chain server.
     * @param {TX} tx
     * @returns {Promise}
     */
    send(tx: TX): Promise<any>;
    /**
     * Estimate smart fee from chain server.
     * @param {Number} blocks
     * @returns {Promise}
     */
    estimateFee(blocks: number): Promise<any>;
    /**
     * Send filter to the remote node.
     * @private
     * @returns {Promise}
     */
    private syncFilter;
    /**
     * Add data to remote filter.
     * @private
     * @param {Buffer} data
     * @returns {Promise}
     */
    private addFilter;
    /**
     * Reset remote filter.
     * @private
     * @returns {Promise}
     */
    private resetFilter;
    /**
     * Backup the wallet db.
     * @param {String} path
     * @returns {Promise}
     */
    backup(path: string): Promise<any>;
    /**
     * Wipe the txdb - NEVER USE.
     * @returns {Promise}
     */
    wipe(): Promise<any>;
    /**
     * Get current wallet wid depth.
     * @private
     * @returns {Promise}
     */
    private getDepth;
    /**
     * Test the bloom filter against a tx or address hash.
     * @private
     * @param {Hash} data
     * @returns {Boolean}
     */
    private testFilter;
    /**
     * Add hash to local and remote filters.
     * @private
     * @param {Hash} hash
     */
    private addHash;
    /**
     * Add outpoint to local filter.
     * @private
     * @param {Hash} hash
     * @param {Number} index
     */
    private addOutpoint;
    /**
     * Dump database (for debugging).
     * @returns {Promise} - Returns Object.
     */
    dump(): Promise<any>;
    /**
     * Register an object with the walletdb.
     * @param {Wallet} wallet
     */
    register(wallet: Wallet): void;
    /**
     * Unregister a object with the walletdb.
     * @param {Object} wallet
     * @returns {Boolean}
     */
    unregister(wallet: any): boolean;
    /**
     * Map wallet id to wid.
     * @param {String|Number} id
     * @returns {Promise} - Returns {Number}.
     */
    ensureWID(id: string | number): Promise<any>;
    /**
     * Map wallet id to wid.
     * @param {String} id
     * @returns {Promise} - Returns {Number}.
     */
    getWID(id: string): Promise<any>;
    /**
     * Map wallet wid to id.
     * @param {Number} wid
     * @returns {Promise} - Returns {String}.
     */
    getID(wid: number): Promise<any>;
    /**
     * Get a wallet from the database, setup watcher.
     * @param {Number|String} id
     * @returns {Promise} - Returns {@link Wallet}.
     */
    get(id: number | string): Promise<any>;
    /**
     * Get a wallet from the database without a lock.
     * @private
     * @param {Number} wid
     * @returns {Promise} - Returns {@link Wallet}.
     */
    private _get;
    /**
     * Save a wallet to the database.
     * @param {Batch} b
     * @param {Wallet} wallet
     */
    save(b: Batch, wallet: Wallet): void;
    /**
     * Increment the wid depth.
     * @param {Batch} b
     * @param {Number} wid
     */
    increment(b: Batch, wid: number): void;
    /**
     * Rename a wallet.
     * @param {Wallet} wallet
     * @param {String} id
     * @returns {Promise}
     */
    rename(wallet: Wallet, id: string): Promise<any>;
    /**
     * Rename a wallet without a lock.
     * @private
     * @param {Wallet} wallet
     * @param {String} id
     * @returns {Promise}
     */
    private _rename;
    /**
     * Rename an account.
     * @param {Batch} b
     * @param {Account} account
     * @param {String} name
     */
    renameAccount(b: Batch, account: Account, name: string): void;
    /**
     * Remove a wallet.
     * @param {Number|String} id
     * @returns {Promise}
     */
    remove(id: number | string): Promise<any>;
    /**
     * Remove a wallet (without a lock).
     * @private
     * @param {Number} wid
     * @returns {Promise}
     */
    private _remove;
    /**
     * Get a wallet with token auth first.
     * @param {Number|String} id
     * @param {Buffer} token
     * @returns {Promise} - Returns {@link Wallet}.
     */
    auth(id: number | string, token: Buffer): Promise<any>;
    /**
     * Create a new wallet, save to database, setup watcher.
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    create(options: any): Promise<any>;
    /**
     * Create a new wallet, save to database without a lock.
     * @private
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    private _create;
    /**
     * Test for the existence of a wallet.
     * @param {Number|String} id
     * @returns {Promise}
     */
    has(id: number | string): Promise<any>;
    /**
     * Attempt to create wallet, return wallet if already exists.
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise}
     */
    ensure(options: any): Promise<any>;
    /**
     * Get an account from the database by wid.
     * @private
     * @param {Number} wid
     * @param {Number} index - Account index.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    private getAccount;
    /**
     * List account names and indexes from the db.
     * @param {Number} wid
     * @returns {Promise} - Returns Array.
     */
    getAccounts(wid: number): Promise<any>;
    /**
     * Lookup the corresponding account name's index.
     * @param {Number} wid
     * @param {String} name - Account name/index.
     * @returns {Promise} - Returns Number.
     */
    getAccountIndex(wid: number, name: string): Promise<any>;
    /**
     * Lookup the corresponding account index's name.
     * @param {Number} wid
     * @param {Number} index
     * @returns {Promise} - Returns Number.
     */
    getAccountName(wid: number, index: number): Promise<any>;
    /**
     * Save an account to the database.
     * @param {Batch} b
     * @param {Account} account
     * @returns {Promise}
     */
    saveAccount(b: Batch, account: Account): Promise<any>;
    /**
     * Test for the existence of an account.
     * @param {Number} wid
     * @param {String|Number} index
     * @returns {Promise} - Returns Boolean.
     */
    hasAccount(wid: number, index: string | number): Promise<any>;
    /**
     * Save an address to the path map.
     * @param {Batch} b
     * @param {Number} wid
     * @param {WalletKey} ring
     * @returns {Promise}
     */
    saveKey(b: Batch, wid: number, ring: WalletKey): Promise<any>;
    /**
     * Save a path to the path map.
     *
     * The path map exists in the form of:
     *   - `p[address-hash] -> wid map`
     *   - `P[wid][address-hash] -> path data`
     *   - `r[wid][account-index][address-hash] -> dummy`
     *
     * @param {Batch} b
     * @param {Number} wid
     * @param {Path} path
     * @returns {Promise}
     */
    savePath(b: Batch, wid: number, path: Path): Promise<any>;
    /**
     * Retrieve path by hash.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    getPath(wid: number, hash: Hash): Promise<any>;
    /**
     * Retrieve path by hash.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    readPath(wid: number, hash: Hash): Promise<any>;
    /**
     * Test whether a wallet contains a path.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    hasPath(wid: number, hash: Hash): Promise<any>;
    /**
     * Get all address hashes.
     * @returns {Promise}
     */
    getHashes(): Promise<any>;
    /**
     * Get all outpoints.
     * @returns {Promise}
     */
    getOutpoints(): Promise<any>;
    /**
     * Get all address hashes.
     * @param {Number} wid
     * @returns {Promise}
     */
    getWalletHashes(wid: number): Promise<any>;
    /**
     * Get all account address hashes.
     * @param {Number} wid
     * @param {Number} account
     * @returns {Promise}
     */
    getAccountHashes(wid: number, account: number): Promise<any>;
    /**
     * Get all paths for a wallet.
     * @param {Number} wid
     * @returns {Promise}
     */
    getWalletPaths(wid: number): Promise<any>;
    /**
     * Get all wallet ids.
     * @returns {Promise}
     */
    getWallets(): Promise<any>;
    /**
     * Encrypt all imported keys for a wallet.
     * @param {Batch} b
     * @param {Number} wid
     * @param {Buffer} key
     * @returns {Promise}
     */
    encryptKeys(b: Batch, wid: number, key: Buffer): Promise<any>;
    /**
     * Decrypt all imported keys for a wallet.
     * @param {Batch} b
     * @param {Number} wid
     * @param {Buffer} key
     * @returns {Promise}
     */
    decryptKeys(b: Batch, wid: number, key: Buffer): Promise<any>;
    /**
     * Resend all pending transactions.
     * @returns {Promise}
     */
    resend(): Promise<any>;
    /**
     * Resend all pending transactions for a specific wallet.
     * @private
     * @param {Number} wid
     * @returns {Promise}
     */
    private resendPending;
    /**
     * Get all wallet ids by output addresses and outpoints.
     * @param {TX} tx
     * @returns {Promise}
     */
    getWalletsByTX(tx: TX): Promise<any>;
    /**
     * Get the best block hash.
     * @returns {Promise}
     */
    getState(): Promise<any>;
    /**
     * Sync the current chain state to tip.
     * @param {BlockMeta} tip
     * @returns {Promise}
     */
    setTip(tip: typeof records.BlockMeta): Promise<any>;
    /**
     * Will return the current height and will increment
     * to the current height of a block currently being
     * added to the wallet.
     * @returns {Number}
     */
    liveHeight(): number;
    /**
     * Mark current state.
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    markState(block: typeof records.BlockMeta): Promise<any>;
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    getMap(key: Buffer): Promise<any>;
    /**
     * Add wid to a wallet map.
     * @param {Batch} b
     * @param {Buffer} key
     * @param {Number} wid
     */
    addMap(b: Batch, key: Buffer, wid: number): Promise<void>;
    /**
     * Remove wid from a wallet map.
     * @param {Batch} b
     * @param {Buffer} key
     * @param {Number} wid
     */
    removeMap(b: Batch, key: Buffer, wid: number): Promise<void>;
    /**
     * Get a wallet map.
     * @param {Buffer} hash
     * @returns {Promise}
     */
    getPathMap(hash: Buffer): Promise<any>;
    /**
     * Add wid to a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} wid
     */
    addPathMap(b: Batch, hash: Buffer, wid: number): Promise<void>;
    /**
     * Remove wid from a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} wid
     */
    removePathMap(b: Batch, hash: Buffer, wid: number): Promise<void>;
    /**
     * Get a wallet map.
     * @param {Number} height
     * @returns {Promise}
     */
    getBlockMap(height: number): Promise<any>;
    /**
     * Add wid to a wallet map.
     * @param {Batch} b
     * @param {Number} height
     * @param {Number} wid
     */
    addBlockMap(b: Batch, height: number, wid: number): Promise<void>;
    /**
     * Remove wid from a wallet map.
     * @param {Batch} b
     * @param {Number} height
     * @param {Number} wid
     */
    removeBlockMap(b: Batch, height: number, wid: number): Promise<void>;
    /**
     * Get a wallet map.
     * @param {Buffer} hash
     * @returns {Promise}
     */
    getTXMap(hash: Buffer): Promise<any>;
    /**
     * Add wid to a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} wid
     */
    addTXMap(b: Batch, hash: Buffer, wid: number): Promise<void>;
    /**
     * Remove wid from a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} wid
     */
    removeTXMap(b: Batch, hash: Buffer, wid: number): Promise<void>;
    /**
     * Get a wallet map.
     * @param {Buffer} hash
     * @param {Number} index
     * @returns {Promise}
     */
    getOutpointMap(hash: Buffer, index: number): Promise<any>;
    /**
     * Add wid to a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} index
     * @param {Number} wid
     */
    addOutpointMap(b: Batch, hash: Buffer, index: number, wid: number): Promise<void>;
    /**
     * Remove wid from a wallet map.
     * @param {Batch} b
     * @param {Buffer} hash
     * @param {Number} index
     * @param {Number} wid
     */
    removeOutpointMap(b: Batch, hash: Buffer, index: number, wid: number): Promise<void>;
    /**
     * Get a wallet block meta.
     * @param {Hash|Number} height
     * @returns {Promise}
     */
    getBlock(height: Hash | number): Promise<any>;
    /**
     * Get wallet tip.
     * @returns {Promise}
     */
    getTip(): Promise<any>;
    /**
     * Sync with chain height.
     * @param {Number} height
     * @returns {Promise}
     */
    rollback(height: number): Promise<any>;
    /**
     * Revert TXDB to an older state.
     * @param {Number} target
     * @returns {Promise}
     */
    revert(target: number): Promise<any>;
    /**
     * Add a block's transactions and write the new best hash.
     * @param {ChainEntry} entry
     * @param {TX[]} txs
     * @returns {Promise}
     */
    addBlock(entry: ChainEntry, txs: TX[]): Promise<any>;
    /**
     * Add a block's transactions without a lock.
     * @private
     * @param {ChainEntry} entry
     * @param {TX[]} txs
     * @returns {Promise}
     */
    private _addBlock;
    /**
     * Unconfirm a block's transactions
     * and write the new best hash (SPV version).
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    removeBlock(entry: ChainEntry): Promise<any>;
    /**
     * Unconfirm a block's transactions.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    private _removeBlock;
    /**
     * Rescan a block.
     * @private
     * @param {ChainEntry} entry
     * @param {TX[]} txs
     * @returns {Promise}
     */
    private rescanBlock;
    /**
     * Add a transaction to the database, map addresses
     * to wallet IDs, potentially store orphans, resolve
     * orphans, or confirm a transaction.
     * @param {TX} tx
     * @param {BlockMeta?} block
     * @returns {Promise}
     */
    addTX(tx: TX, block: typeof records.BlockMeta | null): Promise<any>;
    /**
     * Add a transaction to the database without a lock.
     * @private
     * @param {TX} tx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    private _addTX;
    /**
     * Handle a chain reset.
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    resetChain(entry: ChainEntry): Promise<any>;
    /**
     * Handle a chain reset without a lock.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    private _resetChain;
}
import EventEmitter = require("events");
/**
 * Wallet Options
 * @alias module:wallet.WalletOptions
 */
declare class WalletOptions {
    /**
     * Instantiate chain options from object.
     * @param {Object} options
     * @returns {WalletOptions}
     */
    static fromOptions(options: any): WalletOptions;
    /**
     * Create wallet options.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    network: Network;
    logger: any;
    workers: any;
    client: any;
    feeRate: number;
    prefix: any;
    location: any;
    memory: boolean;
    maxFiles: number;
    cacheSize: number;
    compression: boolean;
    spv: boolean;
    witness: boolean;
    wipeNoReally: boolean;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {WalletOptions}
     */
    private fromOptions;
}
import Network = require("../protocol/network");
import records = require("./records");
import Wallet = require("./wallet");
import Account = require("./account");
import Path = require("./path");
//# sourceMappingURL=walletdb.d.ts.map