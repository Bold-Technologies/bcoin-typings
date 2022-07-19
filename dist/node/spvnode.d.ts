export = SPVNode;
/**
 * SPV Node
 * Create an spv node which only maintains
 * a chain, a pool, and an http server.
 * @alias module:node.SPVNode
 * @extends Node
 */
declare class SPVNode extends Node {
    /**
     * Create SPV node.
     * @constructor
     * @param {Object?} options
     * @param {Buffer?} options.sslKey
     * @param {Buffer?} options.sslCert
     * @param {Number?} options.httpPort
     * @param {String?} options.httpHost
     */
    constructor(options: any | null);
    opened: boolean;
    chain: Chain;
    pool: Pool;
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
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the node, wait for the database to close.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Scan for any missed transactions.
     * Note that this will replay the blockchain sync.
     * @param {Number|Hash} start - Start block.
     * @returns {Promise}
     */
    scan(start: number | Hash): Promise<any>;
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX|Block} item
     * @returns {Promise}
     */
    broadcast(item: TX | Block): Promise<any>;
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX} tx
     * @returns {Promise}
     */
    sendTX(tx: TX): Promise<any>;
    /**
     * Broadcast a transaction. Silence errors.
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
}
import Node = require("./node");
import Chain = require("../blockchain/chain");
import Pool = require("../net/pool");
import HTTP = require("./http");
//# sourceMappingURL=spvnode.d.ts.map