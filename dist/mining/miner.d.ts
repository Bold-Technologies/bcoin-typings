export = Miner;
/**
 * Miner
 * A bitcoin miner and block generator.
 * @alias module:mining.Miner
 * @extends EventEmitter
 */
declare class Miner {
    /**
     * Create a bitcoin miner.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    opened: boolean;
    options: MinerOptions;
    network: Network;
    logger: any;
    workers: any;
    chain: any;
    mempool: any;
    addresses: any[];
    locker: any;
    cpu: CPUMiner;
    /**
     * Initialize the miner.
     */
    init(): void;
    /**
     * Open the miner, wait for the chain and mempool to load.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the miner.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Create a block template.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link BlockTemplate}.
     */
    createBlock(tip: ChainEntry, address: Address | null): Promise<any>;
    /**
     * Create a block template (without a lock).
     * @method
     * @private
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link BlockTemplate}.
     */
    private _createBlock;
    /**
     * Update block timestamp.
     * @param {BlockTemplate} attempt
     */
    updateTime(attempt: typeof BlockTemplate): void;
    /**
     * Create a cpu miner job.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} Returns {@link CPUJob}.
     */
    createJob(tip: ChainEntry, address: Address | null): Promise<any>;
    /**
     * Mine a single block.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} Returns {@link Block}.
     */
    mineBlock(tip: ChainEntry, address: Address | null): Promise<any>;
    /**
     * Add an address to the address list.
     * @param {Address} address
     */
    addAddress(address: Address): void;
    /**
     * Get a random address from the address list.
     * @returns {Address}
     */
    getAddress(): Address;
    /**
     * Get mempool entries, sort by dependency order.
     * Prioritize by priority and fee rates.
     * @param {BlockTemplate} attempt
     * @returns {MempoolEntry[]}
     */
    assemble(attempt: typeof BlockTemplate): MempoolEntry[];
}
/**
 * Miner Options
 * @alias module:mining.MinerOptions
 */
declare class MinerOptions {
    /**
     * Instantiate miner options from object.
     * @param {Object} options
     * @returns {MinerOptions}
     */
    static fromOptions(options: any): MinerOptions;
    /**
     * Create miner options.
     * @constructor
     * @param {Object}
     */
    constructor(options: any);
    network: Network;
    logger: any;
    workers: any;
    chain: any;
    mempool: any;
    version: number;
    addresses: any[];
    coinbaseFlags: any;
    preverify: boolean;
    minWeight: number;
    maxWeight: number;
    priorityWeight: number;
    priorityThreshold: number;
    maxSigops: number;
    reservedWeight: number;
    reservedSigops: number;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {MinerOptions}
     */
    private fromOptions;
}
import Network = require("../protocol/network");
import CPUMiner = require("./cpuminer");
import Address = require("../primitives/address");
import BlockTemplate = require("./template");
//# sourceMappingURL=miner.d.ts.map