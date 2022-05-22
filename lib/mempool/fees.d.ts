export = PolicyEstimator;
/**
 * Policy Estimator
 * Estimator for fees and priority.
 * @alias module:mempool.PolicyEstimator
 */
declare class PolicyEstimator {
    /**
     * Instantiate a policy estimator from serialized data.
     * @param {Buffer} data
     * @param {Logger?} logger
     * @returns {PolicyEstimator}
     */
    static fromRaw(data: Buffer, logger: Logger): PolicyEstimator;
    /**
     * Create an estimator.
     * @constructor
     * @param {Logger?} logger
     */
    constructor(logger: Logger);
    logger: any;
    minTrackedFee: number;
    minTrackedPri: number;
    feeStats: ConfirmStats;
    priStats: ConfirmStats;
    feeUnlikely: number;
    feeLikely: number;
    priUnlikely: number;
    priLikely: number;
    map: any;
    bestHeight: number;
    /**
     * Initialize the estimator.
     * @private
     */
    private init;
    /**
     * Reset the estimator.
     */
    reset(): void;
    /**
     * Stop tracking a tx. Remove from map.
     * @param {Hash} hash
     */
    removeTX(hash: Hash): void;
    /**
     * Test whether a fee should be used for calculation.
     * @param {Amount} fee
     * @param {Number} priority
     * @returns {Boolean}
     */
    isFeePoint(fee: Amount, priority: number): boolean;
    /**
     * Test whether a priority should be used for calculation.
     * @param {Amount} fee
     * @param {Number} priority
     * @returns {Boolean}
     */
    isPriPoint(fee: Amount, priority: number): boolean;
    /**
     * Process a mempool entry.
     * @param {MempoolEntry} entry
     * @param {Boolean} current - Whether the chain is synced.
     */
    processTX(entry: MempoolEntry, current: boolean): void;
    /**
     * Process an entry being removed from the mempool.
     * @param {Number} height - Block height.
     * @param {MempoolEntry} entry
     */
    processBlockTX(height: number, entry: MempoolEntry): void;
    /**
     * Process a block of transaction entries being removed from the mempool.
     * @param {Number} height - Block height.
     * @param {MempoolEntry[]} entries
     * @param {Boolean} current - Whether the chain is synced.
     */
    processBlock(height: number, entries: MempoolEntry[], current: boolean): void;
    /**
     * Estimate a fee rate.
     * @param {Number} [target=1] - Confirmation target.
     * @param {Boolean} [smart=true] - Smart estimation.
     * @returns {Rate}
     */
    estimateFee(target?: number, smart?: boolean): Rate;
    /**
     * Estimate a priority.
     * @param {Number} [target=1] - Confirmation target.
     * @param {Boolean} [smart=true] - Smart estimation.
     * @returns {Number}
     */
    estimatePriority(target?: number, smart?: boolean): number;
    /**
     * Get serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the estimator.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {PolicyEstimator}
     */
    private fromRaw;
    /**
     * Inject properties from estimator.
     * @param {PolicyEstimator} estimator
     * @returns {PolicyEstimator}
     */
    inject(estimator: PolicyEstimator): PolicyEstimator;
}
declare namespace PolicyEstimator {
    const VERSION: number;
}
/**
 * Confirmation stats.
 * @alias module:mempool.ConfirmStats
 */
declare class ConfirmStats {
    /**
     * Instantiate confirm stats from serialized data.
     * @param {Buffer} data
     * @param {String} type
     * @param {Logger?} logger
     * @returns {ConfirmStats}
     */
    static fromRaw(data: Buffer, type: string, logger: Logger): ConfirmStats;
    /**
     * Create confirmation stats.
     * @constructor
     * @param {String} type
     * @param {Logger?} logger
     */
    constructor(type: string, logger: Logger);
    logger: any;
    type: string;
    decay: number;
    maxConfirms: number;
    buckets: Float64Array;
    bucketMap: DoubleMap;
    confAvg: any[];
    curBlockConf: any[];
    unconfTX: any[];
    oldUnconfTX: Int32Array;
    curBlockTX: Int32Array;
    txAvg: Float64Array;
    curBlockVal: Float64Array;
    avg: Float64Array;
    /**
     * Initialize stats.
     * @param {Array} buckets
     * @param {Number} maxConfirms
     * @param {Number} decay
     * @private
     */
    private init;
    /**
     * Clear data for the current block.
     * @param {Number} height
     */
    clearCurrent(height: number): void;
    /**
     * Record a rate or priority based on number of blocks to confirm.
     * @param {Number} blocks - Blocks to confirm.
     * @param {Rate|Number} val - Rate or priority.
     */
    record(blocks: number, val: Rate | number): void;
    /**
     * Update moving averages.
     */
    updateAverages(): void;
    /**
     * Estimate the median value for rate or priority.
     * @param {Number} target - Confirmation target.
     * @param {Number} needed - Sufficient tx value.
     * @param {Number} breakpoint - Success break point.
     * @param {Boolean} greater - Whether to look for lowest value.
     * @param {Number} height - Block height.
     * @returns {Rate|Number} Returns -1 on error.
     */
    estimateMedian(target: number, needed: number, breakpoint: number, greater: boolean, height: number): Rate | number;
    /**
     * Add a transaction's rate/priority to be tracked.
     * @param {Number} height - Block height.
     * @param {Number} val
     * @returns {Number} Bucket index.
     */
    addTX(height: number, val: number): number;
    /**
     * Remove a transaction from tracking.
     * @param {Number} entryHeight
     * @param {Number} bestHeight
     * @param {Number} bucketIndex
     */
    removeTX(entryHeight: number, bestHeight: number, bucketIndex: number): void;
    /**
     * Get serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize confirm stats.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {ConfirmStats}
     */
    private fromRaw;
}
/**
 * Double Map
 * @alias module:mempool.DoubleMap
 * @ignore
 */
declare class DoubleMap {
    buckets: any[];
    insert(key: any, value: any): void;
    search(key: any): any;
}
//# sourceMappingURL=fees.d.ts.map