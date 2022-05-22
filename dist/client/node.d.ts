export = NodeClient;
/**
 * Node Client
 * @extends {bcurl.Client}
 */
declare class NodeClient {
    /**
     * Creat a node client.
     * @param {Object?} options
     */
    constructor(options: any | null);
    /**
     * Auth with server.
     * @returns {Promise}
     */
    auth(): Promise<any>;
    /**
     * Make an RPC call.
     * @returns {Promise}
     */
    execute(name: any, params: any): Promise<any>;
    /**
     * Get a mempool snapshot.
     * @returns {Promise}
     */
    getMempool(): Promise<any>;
    /**
     * Get some info about the server (network and version).
     * @returns {Promise}
     */
    getInfo(): Promise<any>;
    /**
     * Get coins that pertain to an address from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {String} address
     * @returns {Promise}
     */
    getCoinsByAddress(address: string): Promise<any>;
    /**
     * Get coins that pertain to addresses from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {String[]} addresses
     * @returns {Promise}
     */
    getCoinsByAddresses(addresses: string[]): Promise<any>;
    /**
     * Retrieve a coin from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {String} address
     * @returns {Promise}
     */
    getTXByAddress(address: string): Promise<any>;
    /**
     * Retrieve transactions pertaining to
     * addresses from the mempool or chain database.
     * @param {String[]} addresses
     * @returns {Promise}
     */
    getTXByAddresses(addresses: string[]): Promise<any>;
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise}
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * Retrieve a block from the chain database.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    getBlock(block: Hash | number): Promise<any>;
    /**
     * Retrieve a block header.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    getBlockHeader(block: Hash | number): Promise<any>;
    /**
     * Retreive a filter from the filter indexer.
     * @param {Hash|Number} filter
     * @returns {Promise}
     */
    getFilter(filter: Hash | number): Promise<any>;
    /**
     * Add a transaction to the mempool and broadcast it.
     * @param {TX} tx
     * @returns {Promise}
     */
    broadcast(tx: TX): Promise<any>;
    /**
     * Reset the chain.
     * @param {Number} height
     * @returns {Promise}
     */
    reset(height: number): Promise<any>;
    /**
     * Watch the blockchain.
     * @private
     * @returns {Promise}
     */
    private watchChain;
    /**
     * Watch the blockchain.
     * @private
     * @returns {Promise}
     */
    private watchMempool;
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
    getEntry(block: any): Promise<any>;
    /**
     * Get hashes.
     * @param {Number} [start=-1]
     * @param {Number} [end=-1]
     * @returns {Promise}
     */
    getHashes(start?: number, end?: number): Promise<any>;
    /**
     * Send a transaction. Do not wait for promise.
     * @param {TX} tx
     * @returns {Promise}
     */
    send(tx: TX): Promise<any>;
    /**
     * Set bloom filter.
     * @param {Bloom} filter
     * @returns {Promise}
     */
    setFilter(filter: Bloom): Promise<any>;
    /**
     * Add data to filter.
     * @param {Buffer} data
     * @returns {Promise}
     */
    addFilter(chunks: any): Promise<any>;
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
     * Rescan for any missed transactions.
     * @param {Number|Hash} start - Start block.
     * @returns {Promise}
     */
    rescan(start: number | Hash): Promise<any>;
}
//# sourceMappingURL=node.d.ts.map