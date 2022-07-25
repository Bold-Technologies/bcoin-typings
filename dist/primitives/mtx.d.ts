/**
 * MTX
 * A mutable transaction object.
 * @alias module:primitives.MTX
 * @extends TX
 * @property {Number} changeIndex
 * @property {CoinView} view
 */
export class MTX extends TX {
    /**
     * Instantiate MTX from options.
     * @param {Object} options
     * @returns {MTX}
     */
    static fromOptions(options: any): MTX;
    /**
     * Instantiate a transaction from a
     * jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {MTX}
     */
    static fromJSON(json: any): MTX;
    /**
     * Instantiate a transaction from a buffer reader.
     * @param {BufferReader} br
     * @returns {MTX}
     */
    static fromReader(br: BufferReader): MTX;
    /**
     * Instantiate a transaction from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MTX}
     */
    static fromRaw(data: Buffer, enc: string | null): MTX;
    /**
     * Instantiate MTX from TX.
     * @param {TX} tx
     * @returns {MTX}
     */
    static fromTX(tx: TX): MTX;
    /**
     * Test whether an object is an MTX.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isMTX(obj: any): boolean;
    changeIndex: number;
    view: CoinView;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clone the transaction. Note that
     * this will not carry over the view.
     * @returns {MTX}
     */
    clone(): MTX;
    /**
     * Add an input to the transaction.
     * @param {Input|Object} options
     * @returns {Input}
     *
     * @example
     * mtx.addInput({ prevout: { hash: ... }, script: ... });
     * mtx.addInput(new Input());
     */
    addInput(options: Input | any): Input;
    /**
     * Add an outpoint as an input.
     * @param {Outpoint|Object} outpoint
     * @returns {Input}
     *
     * @example
     * mtx.addOutpoint({ hash: ..., index: 0 });
     * mtx.addOutpoint(new Outpoint(hash, index));
     */
    addOutpoint(outpoint: Outpoint | any): Input;
    /**
     * Add a coin as an input. Note that this will
     * add the coin to the internal coin viewpoint.
     * @param {Coin} coin
     * @returns {Input}
     *
     * @example
     * mtx.addCoin(Coin.fromTX(tx, 0, -1));
     */
    addCoin(coin: Coin): Input;
    /**
     * Add a transaction as an input. Note that
     * this will add the coin to the internal
     * coin viewpoint.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number?} height
     * @returns {Input}
     *
     * @example
     * mtx.addTX(tx, 0);
     */
    addTX(tx: TX, index: number, height: number | null): Input;
    /**
     * Add an output.
     * @param {Address|Script|Output|Object} script - Script or output options.
     * @param  {SatoshiAmount?} value
     * @returns {Output}
     *
     * @example
     * mtx.addOutput(new Output());
     * mtx.addOutput({ address: ..., value: 100000 });
     * mtx.addOutput(address, 100000);
     * mtx.addOutput(script, 100000);
     */
    addOutput(script: Address | Script | Output | any, value: SatoshiAmount | null): Output;
    /**
     * Verify all transaction inputs.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     * @throws {ScriptError} on invalid inputs
     */
    check(flags?: VerifyFlags): boolean;
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    checkAsync(flags?: VerifyFlags | null, pool: WorkerPool): Promise<any>;
    /**
     * Verify all transaction inputs.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     */
    verify(flags?: VerifyFlags): boolean;
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    verifyAsync(flags?: VerifyFlags | null, pool: WorkerPool): Promise<any>;
    /**
     * Calculate the fee for the transaction.
     * @returns  {SatoshiAmount} fee (zero if not all coins are available).
     */
    getFee(): SatoshiAmount;
    /**
     * Calculate the total input value.
     * @returns  {SatoshiAmount} value
     */
    getInputValue(): SatoshiAmount;
    /**
     * Get all input addresses.
     * @returns {Address[]} addresses
     */
    getInputAddresses(): Address[];
    /**
     * Get all addresses.
     * @returns {Address[]} addresses
     */
    getAddresses(): Address[];
    /**
     * Get all input address hashes.
     * @returns {Hash[]} hashes
     */
    getInputHashes(enc: any): Hash[];
    /**
     * Get all address hashes.
     * @returns {Hash[]} hashes
     */
    getHashes(enc: any): Hash[];
    /**
     * Test whether the transaction has
     * all coins available/filled.
     * @returns {Boolean}
     */
    hasCoins(): boolean;
    /**
     * Calculate virtual sigop count.
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop count
     */
    getSigops(flags: VerifyFlags | null): number;
    /**
     * Calculate sigops weight, taking into account witness programs.
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop weight
     */
    getSigopsCost(flags: VerifyFlags | null): number;
    /**
     * Calculate the virtual size of the transaction
     * (weighted against bytes per sigop cost).
     * @returns {Number} vsize
     */
    getSigopsSize(): number;
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Boolean}
     */
    verifyInputs(height: number): boolean;
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Array} [fee, reason, score]
     */
    checkInputs(height: number): any[];
    /**
     * Build input script (or witness) templates (with
     * OP_0 in place of signatures).
     * @param {Number} index - Input index.
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @returns {Boolean} Whether the script was able to be built.
     */
    scriptInput(index: number, coin: Coin | Output, ring: KeyRing): boolean;
    /**
     * Build script for a single vector
     * based on a previous script.
     * @param {Script} prev
     * @param {Buffer} ring
     * @return {Stack}
     */
    scriptVector(prev: Script, ring: Buffer): Stack;
    /**
     * Sign a transaction input on the worker pool
     * (if workers are enabled).
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @param {SighashType?} type
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    signInputAsync(index: number, coin: Coin | Output, ring: KeyRing, type: SighashType | null, pool: WorkerPool): Promise<any>;
    /**
     * Sign an input.
     * @param {Number} index - Index of input being signed.
     * @param {Coin|Output} coin
     * @param {KeyRing} ring - Private key.
     * @param {SighashType} type
     * @returns {Boolean} Whether the input was able to be signed.
     */
    signInput(index: number, coin: Coin | Output, ring: KeyRing, type: SighashType): boolean;
    /**
     * Add a signature to a vector
     * based on a previous script.
     * @param {Script} prev
     * @param {Stack} vector
     * @param {Buffer} sig
     * @param {KeyRing} ring
     * @return {Boolean}
     */
    signVector(prev: Script, vector: Stack, sig: Buffer, ring: KeyRing): boolean;
    /**
     * Test whether the transaction is fully-signed.
     * @returns {Boolean}
     */
    isSigned(): boolean;
    /**
     * Test whether an input is fully-signed.
     * @param {Number} index
     * @param {Coin|Output} coin
     * @returns {Boolean}
     */
    isInputSigned(index: number, coin: Coin | Output): boolean;
    /**
     * Test whether a vector is fully-signed.
     * @param {Script} prev
     * @param {Stack} vector
     * @returns {Boolean}
     */
    isVectorSigned(prev: Script, vector: Stack): boolean;
    /**
     * Build input scripts (or witnesses).
     * @param {KeyRing} ring - Address used to sign. The address
     * must be able to redeem the coin.
     * @returns {Number} Number of inputs templated.
     */
    template(ring: KeyRing): number;
    /**
     * Build input scripts (or witnesses) and sign the inputs.
     * @param {KeyRing} ring - Address used to sign. The address
     * must be able to redeem the coin.
     * @param {SighashType} type
     * @returns {Number} Number of inputs signed.
     */
    sign(ring: KeyRing, type: SighashType): number;
    /**
     * Sign the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {KeyRing} ring
     * @param {SighashType?} type
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    signAsync(ring: KeyRing, type: SighashType | null, pool: WorkerPool): Promise<any>;
    /**
     * Estimate maximum possible size.
     * @param {Function?} getAccount - Returns account that can spend
     * from a given address.
     * @returns {Number}
     */
    estimateSize(getAccount: Function | null): number;
    /**
     * Select necessary coins based on total output value.
     * @param {Coin[]} coins
     * @param {Object?} options
     * @returns {CoinSelection}
     * @throws on not enough funds available.
     */
    selectCoins(coins: Coin[], options: any | null): CoinSelection;
    /**
     * Attempt to subtract a fee from a single output.
     * @param {Number} index
     * @param  {SatoshiAmount} fee
     */
    subtractIndex(index: number, fee: SatoshiAmount): void;
    /**
     * Attempt to subtract a fee from all outputs evenly.
     * @param  {SatoshiAmount} fee
     */
    subtractFee(fee: SatoshiAmount): void;
    /**
     * Select coins and fill the inputs.
     * @param {Coin[]} coins
     * @param {Object} options - See {@link MTX#selectCoins} options.
     * @returns {CoinSelector}
     */
    fund(coins: Coin[], options: any): CoinSelector;
    /**
     * Sort inputs and outputs according to BIP69.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki
     */
    sortMembers(): void;
    /**
     * Avoid fee sniping.
     * @param {Number} - Current chain height.
     * @see bitcoin/src/wallet/wallet.cpp
     */
    avoidFeeSniping(height: any): void;
    /**
     * Set locktime and sequences appropriately.
     * @param {Number} locktime
     */
    setLocktime(locktime: number): void;
    /**
     * Set sequence locktime.
     * @param {Number} index - Input index.
     * @param {Number} locktime
     * @param {Boolean?} seconds
     */
    setSequence(index: number, locktime: number, seconds: boolean | null): void;
    /**
     * Inspect the transaction.
     * @returns {Object}
     */
    format(): any;
    /**
     * Convert transaction to JSON.
     * @param {Network} network
     * @returns {Object}
     */
    getJSON(network: Network): any;
    /**
     * Inject properties from a json object
     * @param {Object} json
     */
    fromJSON(json: any): MTX;
    /**
     * Convert the MTX to a TX.
     * @returns {TX}
     */
    toTX(): TX;
    /**
     * Convert the MTX to a TX.
     * @returns {Array} [tx, view]
     */
    commit(): any[];
}
/**
 * Coin Selector
 * @alias module:primitives.CoinSelector
 */
declare class CoinSelector {
    /**
     * Create a coin selector.
     * @constructor
     * @param {MTX} tx
     * @param {Object?} options
     */
    constructor(tx: MTX, options: any | null);
    tx: MTX;
    coins: any[];
    outputValue: number;
    index: number;
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
    init(coins: Coin[]): void;
    /**
     * Calculate total value required.
     * @returns  {SatoshiAmount}
     */
    total(): SatoshiAmount;
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
     * @returns  {SatoshiAmount}
     */
    getFee(size: number): SatoshiAmount;
    /**
     * Fund the transaction with more
     * coins if the `output value + fee`
     * total was updated.
     */
    fund(): void;
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
}
declare namespace CoinSelector {
    const FEE_RATE: number;
    const MIN_FEE: number;
    const MAX_FEE: number;
}
/**
 * Funding Error
 * An error thrown from the coin selector.
 * @ignore
 * @extends Error
 * @property {String} message - Error message.
 * @property  {SatoshiAmount} availableFunds
 * @property  {SatoshiAmount} requiredFunds
 */
export class FundingError extends Error {
    /**
     * Create a funding error.
     * @constructor
     * @param {String} msg
     * @param  {SatoshiAmount} available
     * @param  {SatoshiAmount} required
     */
    constructor(msg: string, available: SatoshiAmount, required: SatoshiAmount);
    type: string;
    availableFunds: number;
    requiredFunds: number;
}
import TX = require("./tx");
import CoinView = require("../coins/coinview");
import Input = require("./input");
import Outpoint = require("./outpoint");
import Coin = require("./coin");
import Address = require("./address");
import Script = require("../script/script");
import Output = require("./output");
import Stack = require("../script/stack");
export { CoinSelector as Selector };
//# sourceMappingURL=mtx.d.ts.map