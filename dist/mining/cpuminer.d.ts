export = CPUMiner;
/**
 * CPU miner.
 * @alias module:mining.CPUMiner
 */
declare class CPUMiner {
    /**
     * Create a CPU miner.
     * @constructor
     * @param {Miner} miner
     */
    constructor(miner: Miner);
    opened: boolean;
    miner: Miner;
    network: any;
    logger: any;
    workers: any;
    chain: any;
    locker: any;
    running: boolean;
    stopping: boolean;
    job: any;
    stopJob: {
        resolve: any;
        reject: any;
    };
    /**
     * Initialize the miner.
     * @private
     */
    private init;
    /**
     * Open the miner.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the miner.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Start mining.
     * @method
     */
    start(): void;
    /**
     * Start mining.
     * @method
     * @private
     * @returns {Promise}
     */
    private _start;
    /**
     * Stop mining.
     * @method
     * @returns {Promise}
     */
    stop(): Promise<any>;
    /**
     * Stop mining (without a lock).
     * @method
     * @returns {Promise}
     */
    _stop(): Promise<any>;
    /**
     * Wait for `done` event.
     * @private
     * @returns {Promise}
     */
    private wait;
    /**
     * Create a mining job.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link Job}.
     */
    createJob(tip: ChainEntry, address: Address): Promise<any>;
    /**
     * Mine a single block.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns [{@link Block}].
     */
    mineBlock(tip: ChainEntry, address: Address): Promise<any>;
    /**
     * Notify the miner that a new
     * tx has entered the mempool.
     */
    notifyEntry(): void;
    /**
     * Hash until the nonce overflows.
     * @param {CPUJob} job
     * @returns {Number} nonce
     */
    findNonce(job: CPUJob): number;
    /**
     * Hash until the nonce overflows.
     * @method
     * @param {CPUJob} job
     * @returns {Promise} Returns Number.
     */
    findNonceAsync(job: CPUJob): Promise<any>;
    /**
     * Mine synchronously until the block is found.
     * @param {CPUJob} job
     * @returns {Block}
     */
    mine(job: CPUJob): Block;
    /**
     * Mine asynchronously until the block is found.
     * @method
     * @param {CPUJob} job
     * @returns {Promise} - Returns {@link Block}.
     */
    mineAsync(job: CPUJob): Promise<any>;
    /**
     * Send a progress report (emits `status`).
     * @param {CPUJob} job
     * @param {Number} nonce
     */
    sendStatus(job: CPUJob, nonce: number): void;
}
declare namespace CPUMiner {
    const INTERVAL: number;
}
/**
 * Mining Job
 * @ignore
 */
declare class CPUJob {
    /**
     * Create a mining job.
     * @constructor
     * @param {CPUMiner} miner
     * @param {BlockTemplate} attempt
     */
    constructor(miner: CPUMiner, attempt: BlockTemplate);
    miner: CPUMiner;
    attempt: BlockTemplate;
    destroyed: boolean;
    committed: boolean;
    start: number;
    nonce1: number;
    nonce2: number;
    /**
     * Get the raw block header.
     * @param {Number} nonce
     * @returns {Buffer}
     */
    getHeader(): Buffer;
    /**
     * Commit job and return a block.
     * @param {Number} nonce
     * @returns {Block}
     */
    commit(nonce: number): Block;
    /**
     * Mine block synchronously.
     * @returns {Block}
     */
    mine(): Block;
    /**
     * Mine block asynchronously.
     * @returns {Promise}
     */
    mineAsync(): Promise<any>;
    /**
     * Refresh the block template.
     */
    refresh(): any;
    /**
     * Increment the extraNonce.
     */
    updateNonce(): void;
    /**
     * Destroy the job.
     */
    destroy(): void;
    /**
     * Calculate number of hashes computed.
     * @param {Number} nonce
     * @returns {Number}
     */
    getHashes(nonce: number): number;
    /**
     * Calculate hashrate.
     * @param {Number} nonce
     * @returns {Number}
     */
    getRate(nonce: number): number;
    /**
     * Add a transaction to the block.
     * @param {TX} tx
     * @param {CoinView} view
     */
    addTX(tx: TX, view: CoinView): any;
    /**
     * Add a transaction to the block
     * (less verification than addTX).
     * @param {TX} tx
     * @param {CoinView?} view
     */
    pushTX(tx: TX, view: CoinView): any;
}
//# sourceMappingURL=cpuminer.d.ts.map