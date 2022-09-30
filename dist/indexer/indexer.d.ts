export = Indexer;
/**
 * Indexer
 * The class which indexers inherit from and implement the
 * `indexBlock` and `unindexBlock` methods and database
 * and storage initialization for indexing blocks.
 * @alias module:indexer.Indexer
 * @extends EventEmitter
 * @abstract
 */
declare class Indexer {
    /**
     * Create an indexer.
     * @constructor
     * @param {String} module
     * @param {Object} options
     */
    constructor(module: string, options: any);
    options: IndexOptions;
    network: Network;
    logger: any;
    blocks: any;
    chain: any;
    closing: boolean;
    db: any;
    batch: any;
    bound: any[];
    syncing: boolean;
    height: number;
    /**
     * Start a new batch write.
     * @returns {Batch}
     */
    start(): Batch;
    /**
     * Put key and value to the current batch.
     * @param {String} key
     * @param {Buffer} value
     */
    put(key: string, value: Buffer): void;
    /**
     * Delete key from the current batch.
     * @param {String} key
     */
    del(key: string): void;
    /**
     * Commit the current batch.
     * @returns {Promise}
     */
    commit(): Promise<any>;
    /**
     * Open the indexer, open the database,
     * initialize height, and bind to events.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the indexer, wait for the database to close,
     * unbind all events.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Ensure prefix directory (prefix/index).
     * @returns {Promise}
     */
    ensure(): Promise<any>;
    /**
     * Verify network of index.
     * @returns {Promise}
     */
    verifyNetwork(): Promise<any>;
    /**
     * A special case for indexing the genesis block. The genesis
     * block coins are not spendable, however indexers can still index
     * the block for historical and informational purposes.
     * @private
     * @returns {Promise}
     */
    private saveGenesis;
    /**
     * Bind to chain events and save listeners for removal on close
     * @private
     */
    private bind;
    /**
     * Get a chain entry for the main chain only.
     * @private
     * @returns {Promise}
     */
    private getEntry;
    /**
     * Get a index block meta.
     * @param {Number} height
     * @returns {Promise}
     */
    getBlockMeta(height: number): Promise<any>;
    /**
     * Sync with the chain.
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    sync(meta: BlockMeta, block: Block, view: CoinView): Promise<any>;
    /**
     * Sync with the chain with a block.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    private _syncBlock;
    /**
     * Sync with the chain.
     * @private
     * @returns {Promise}
     */
    private _syncChain;
    /**
     * Scan blockchain to the best chain height.
     * @private
     * @returns {Promise}
     */
    private _rollforward;
    /**
     * Rollback to a given chain height.
     * @param {Number} height
     * @returns {Promise}
     */
    _rollback(height: number): Promise<any>;
    /**
     * Add a block's transactions without a lock.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    private _addBlock;
    /**
     * Process block indexing
     * Indexers will implement this method to process the block for indexing
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    indexBlock(meta: BlockMeta, block: Block, view: CoinView): Promise<any>;
    /**
     * Undo block indexing
     * Indexers will implement this method to undo indexing for the block
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    unindexBlock(meta: BlockMeta, block: Block, view: CoinView): Promise<any>;
    /**
     * Prune block indexing
     * Indexers will implement this method to prune indexing for the block
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    pruneBlock(meta: BlockMeta, block: Block, view: CoinView): Promise<any>;
    /**
     * Unconfirm a block's transactions.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    private _removeBlock;
    /**
     * Update the current height to tip.
     * @param {BlockMeta} meta
     * @returns {Promise}
     */
    _setTip(meta: BlockMeta): Promise<any>;
    /**
     * Test whether the indexer has reached its slow height.
     * @private
     * @returns {Boolean}
     */
    private isSlow;
    /**
     * Log the current indexer status.
     * @private
     * @param {Array} start
     * @param {Block} block
     * @param {BlockMeta} meta
     * @param {Boolean} reverse
     */
    private logStatus;
}
/**
 * Index Options
 */
declare class IndexOptions {
    /**
     * Instantiate indexer options from object.
     * @param {Object} options
     * @returns {IndexOptions}
     */
    static fromOptions(options: any): IndexOptions;
    /**
     * Create index options.
     * @constructor
     * @param {String} module
     * @param {Object} options
     */
    constructor(module: string, options: any);
    module: string;
    network: Network;
    logger: any;
    blocks: any;
    chain: any;
    prefix: any;
    location: any;
    memory: boolean;
    maxFiles: number;
    cacheSize: number;
    compression: boolean;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {IndexOptions}
     */
    private fromOptions;
}
import Network = require("../protocol/network");
/**
 * Block Meta
 */
declare class BlockMeta {
    constructor(hash: any, height: any);
    hash: any;
    height: any;
}
import Block = require("../primitives/block");
import CoinView = require("../coins/coinview");
//# sourceMappingURL=indexer.d.ts.map