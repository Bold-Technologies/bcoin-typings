export = FullNode;
/**
 * Full Node
 * Respresents a fullnode complete with a
 * chain, mempool, miner, etc.
 * @alias module:node.FullNode
 * @extends Node
 */
declare class FullNode extends Node {
    /**
     * Create a full node.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    opened: boolean;
    chain: Chain;
    fees: Fees;
    mempool: Mempool;
    pool: Pool;
    miner: Miner;
    rpc: any;
    http: HTTP;
    /**
     * Initialize the node.
     * @private
     */
    private init;
    /**
     * Open the node and all its child objects,
     * wait for the database to load.
     * @alias FullNode#open
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the node, wait for the database to close.
     * @alias FullNode#close
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Rescan for any missed transactions.
     * @param {Number|Hash} start - Start block.
     * @param {BloomFilter} filter
     * @param {Function} iter - Iterator.
     * @returns {Promise}
     */
    scan(start: number | Hash, filter: BloomFilter, iter: Function): Promise<any>;
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX|Block} item
     * @returns {Promise}
     */
    broadcast(item: TX | Block): Promise<any>;
    /**
     * Add transaction to mempool, broadcast.
     * @param {TX} tx
     * @returns {Promise}
     */
    sendTX(tx: TX): Promise<any>;
    /**
     * Add transaction to mempool, broadcast. Silence errors.
     * @param {TX} tx
     * @returns {Promise}
     */
    relay(tx: TX): Promise<any>;
    /**
     * Connect to the network.
     * @returns {Promise}
     */
    connect(): Promise<any>;
    /**
     * Disconnect from the network.
     * @returns {Promise}
     */
    disconnect(): Promise<any>;
    /**
     * Start the blockchain sync.
     */
    startSync(): void;
    /**
     * Stop syncing the blockchain.
     */
    stopSync(): void;
    /**
     * Retrieve a block from the chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    getBlock(hash: Hash): Promise<any>;
    /**
     * Retrieve a coin from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {Promise} - Returns {@link TXMeta}[].
     */
    getMetaByAddress(addr: Address, options?: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): Promise<any>;
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXMeta}.
     */
    getMeta(hash: Hash): Promise<any>;
    /**
     * Retrieve a spent coin viewpoint from mempool or chain database.
     * @param {TXMeta} meta
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getMetaView(meta: TXMeta): Promise<any>;
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {Promise} - Returns {@link TX}[].
     */
    getTXByAddress(addr: Address, options?: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): Promise<any>;
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * Test whether the mempool or chain contains a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasTX(hash: Hash): Promise<any>;
    /**
     * Retrieve compact filter by hash.
     * @param {Hash | Number} hash
     * @param {Number} filterType
     * @returns {Promise} - Returns {@link Buffer}.
     */
    getBlockFilter(hash: Hash | number, filterType: number): Promise<any>;
}
import Node = require("./node");
import Chain = require("../blockchain/chain");
import Fees = require("../mempool/fees");
import Mempool = require("../mempool/mempool");
import Pool = require("../net/pool");
import Miner = require("../mining/miner");
import HTTP = require("./http");
//# sourceMappingURL=fullnode.d.ts.map