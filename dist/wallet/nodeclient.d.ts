export = NodeClient;
/**
 * Node Client
 * @alias module:node.NodeClient
 */
declare class NodeClient {
    /**
     * Create a node client.
     * @constructor
     */
    constructor(node: any);
    node: any;
    network: any;
    filter: any;
    opened: boolean;
    /**
     * Initialize the client.
     */
    init(): void;
    /**
     * Open the client.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the client.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Add a listener.
     * @param {String} type
     * @param {Function} handler
     */
    bind(type: string, handler: Function): any;
    /**
     * Add a listener.
     * @param {String} type
     * @param {Function} handler
     */
    hook(type: string, handler: Function): any;
    /**
     * Get chain tip.
     * @returns {Promise}
     */
    getTip(): Promise<any>;
    /**
     * Get chain entry.
     * @param {Hash} hash
     * @returns {Promise}
     */
    getEntry(hash: Hash): Promise<any>;
    /**
     * Send a transaction. Do not wait for promise.
     * @param {TX} tx
     * @returns {Promise}
     */
    send(tx: TX): Promise<any>;
    /**
     * Set bloom filter.
     * @param {BloomFilter} filter
     * @returns {Promise}
     */
    setFilter(filter: BloomFilter): Promise<any>;
    /**
     * Add data to filter.
     * @param {Buffer} data
     * @returns {Promise}
     */
    addFilter(data: Buffer): Promise<any>;
    /**
     * Reset filter.
     * @returns {Promise}
     */
    resetFilter(): Promise<any>;
    /**
     * Estimate smart fee.
     * @param {Number?} blocks
     * @returns {Promise}
     */
    estimateFee(blocks: number | null): Promise<any>;
    /**
     * Get hash range.
     * @param {Number} start
     * @param {Number} end
     * @returns {Promise}
     */
    getHashes(start?: number, end?: number): Promise<any>;
    /**
     * Rescan for any missed transactions.
     * @param {Number|Hash} start - Start block.
     * @returns {Promise}
     */
    rescan(start: number | Hash): Promise<any>;
    /**
     * stop rescanning the blockchain
     * @returns {Promise}
     */
    abortRescan(): Promise<any>;
}
//# sourceMappingURL=nodeclient.d.ts.map