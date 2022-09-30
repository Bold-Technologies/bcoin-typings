/**
 * Coin Selector
 * @alias module:primitives.CoinSelector
 */
export class CoinSelector {
    /**
     * Create a coin selector.
     * @constructor
     * @param {MTX} tx
     * @param {Object?} options
     */
    constructor(tx: MTX, options: any | null);
    tx: any;
    coins: any[];
    coinPointers: any[];
    outputValue: number;
    chosen: any[];
    change: number;
    fee: number;
    selection: string;
    subtractFee: boolean;
    subtractIndex: number;
    height: number;
    depth: number;
    hardFee: number;
    rate: number;
    maxFee: number;
    round: boolean;
    changeAddress: any;
    inputs: any;
    useSelectEstimate: boolean;
    getAccount: any;
    /**
     * Initialize selector options.
     * @param {Object} options
     * @private
     */
    private fromOptions;
    /**
     * Attempt to inject existing inputs.
     * @private
     */
    private injectInputs;
    /**
     * Initialize the selector with coins to select from.
     * @param {Coin[]} coins
     */
    init(coins: Coin[]): Promise<void>;
    /**
     * Calculate total value required.
     * @returns {Number}
     */
    total(): number;
    /**
     * Test whether the selector has
     * completely funded the transaction.
     * @returns {Boolean}
     */
    isFull(): boolean;
    /**
     * Test whether a coin is spendable
     * with regards to the options.
     * @param {Coin} coin
     * @returns {Boolean}
     */
    isSpendable(coin: Coin): boolean;
    /**
     * Get the current fee based on a size.
     * @param {Number} size
     * @returns {Number} fee
     */
    getFee(size: number): number;
    /**
     * Fund the transaction with more
     * coins if the `output value + fee`
     * total was updated.
     * @param {Number} index
     * @returns {Number} index
     */
    fund(index: number): number;
    /**
     * Initiate selection from `coins`.
     * @param {Coin[]} coins
     * @returns {CoinSelector}
     */
    select(coins: Coin[]): CoinSelector;
    /**
     * Initialize selection based on size estimate.
     */
    selectEstimate(): Promise<void>;
    /**
     * Initiate selection based on a hard fee.
     */
    selectHard(): void;
    /**
     * Initiate multi algorithm coin selection.
     */
    attemptSelection(): Promise<void>;
    /**
     * Initiate selection using Single Random Draw selection.
     * @param {Number} target - Selection target
     * @returns {Number[]} selected - array of indicies of selected coins
     */
    selectSRD(target: number): number[];
    /**
     * Initiate selection using Branch and Bound selection.
     * @param {Number} target - Selection target
     * @param {Number} costOfChange - Cost of producing and spending change
     * @returns {Number[]} selected - array of indicies of selected coins
     */
    selectBnB(target: number, costOfChange: number): number[];
    /**
     * Initiate selection using Lowest Larger selection algorithm.
     * @param {Number} target - Selection target
     * @returns {Number[]} selected - array of indicies of selected coins
     */
    selectLowestLarger(target: number): number[];
    /**
     * Find smallest coin greater than
     * the target using binary search
     * @param {Number} target
     * @param {Number} index
     * @returns {Number} index
     */
    findLowestLarger(target: number, index: number): number;
    /**
     * Calculate waste for a selection
     * @param {Number[]} selected - indicies of selected coins
     * @param {Number} costOfChange - the cost of making change and spending it
     * @param {Number} target - selection target
     * @returns {Number} - waste
     */
    getWaste(selected: number[], costOfChange: number, target: number): number;
}
export namespace CoinSelector {
    const FEE_RATE: number;
    const MIN_FEE: number;
    const MAX_FEE: number;
    const LONG_TERM_FEERATE: number;
}
/**
 * CoinPointer
 */
export class CoinPointer {
    /**
     * Create a credit.
     * @constructor
     * @param {Number} spendingSize
     * @param {Number} effectiveValue
     * @param {number} index
     */
    constructor(spendingSize: number, effectiveValue: number, index: number);
    spendingSize: number;
    effectiveValue: number;
    index: number;
}
/**
 * Funding Error
 * An error thrown from the coin selector.
 * @ignore
 * @extends Error
 * @property {String} message - Error message.
 * @property {Number} availableFunds
 * @property {Number} requiredFunds
 */
export class FundingError extends Error {
    /**
     * Create a funding error.
     * @constructor
     * @param {String} msg
     * @param {Number} available
     * @param {Number} required
     */
    constructor(msg: string, available: number, required: number);
    type: string;
    availableFunds: number;
    requiredFunds: number;
}
import Coin = require("../primitives/coin");
//# sourceMappingURL=coinselector.d.ts.map