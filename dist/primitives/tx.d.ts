export = TX;
/**
 * TX
 * A static transaction object.
 * @alias module:primitives.TX
 * @property {Number} version
 * @property {Input[]} inputs
 * @property {Output[]} outputs
 * @property {Number} locktime
 */
declare class TX {
    /**
     * Instantiate TX from options object.
     * @param {Object} options
     * @returns {TX}
     */
    static fromOptions(options: any): TX;
    /**
     * Instantiate a transaction from a
     * jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {TX}
     */
    static fromJSON(json: any): TX;
    /**
     * Instantiate a transaction from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {TX}
     */
    static fromRaw(data: Buffer, enc: string | null): TX;
    /**
     * Instantiate a transaction from a buffer reader.
     * @param {BufferReader} br
     * @param {Boolean} block
     * @returns {TX}
     */
    static fromReader(br: BufferReader, block: boolean): TX;
    /**
     * Test whether an object is a TX.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isTX(obj: any): boolean;
    /**
     * Create a transaction.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    version: number;
    inputs: any[];
    outputs: any[];
    locktime: number;
    mutable: boolean;
    _hash: any;
    _hhash: any;
    _whash: any;
    _raw: any;
    _offset: number;
    _block: boolean;
    _size: number;
    _witness: number;
    _sigops: number;
    _hashPrevouts: any;
    _hashSequence: any;
    _hashOutputs: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clone the transaction.
     * @returns {TX}
     */
    clone(): TX;
    /**
     * Inject properties from tx.
     * Used for cloning.
     * @private
     * @param {TX} tx
     * @returns {TX}
     */
    private inject;
    /**
     * Clear any cached values.
     */
    refresh(): void;
    /**
     * Hash the transaction with the non-witness serialization.
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    hash(enc: string | null): Hash | Buffer;
    /**
     * Hash the transaction with the witness
     * serialization, return the wtxid (normal
     * hash if no witness is present, all zeroes
     * if coinbase).
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    witnessHash(enc: string | null): Hash | Buffer;
    /**
     * Serialize the transaction. Note
     * that this is cached. This will use
     * the witness serialization if a
     * witness is present.
     * @returns {Buffer} Serialized transaction.
     */
    toRaw(): Buffer;
    /**
     * Serialize the transaction without the
     * witness vector, regardless of whether it
     * is a witness transaction or not.
     * @returns {Buffer} Serialized transaction.
     */
    toNormal(): Buffer;
    /**
     * Write the transaction to a buffer writer.
     * @param {BufferWriter} bw
     * @param {Boolean} block
     */
    toWriter(bw: BufferWriter, block: boolean): any;
    /**
     * Write the transaction to a buffer writer.
     * Uses non-witness serialization.
     * @param {BufferWriter} bw
     */
    toNormalWriter(bw: BufferWriter): any;
    /**
     * Serialize the transaction. Note
     * that this is cached. This will use
     * the witness serialization if a
     * witness is present.
     * @private
     * @returns {RawTX}
     */
    private frame;
    /**
     * Return the offset and size of the transaction. Useful
     * when the transaction is deserialized within a block.
     * @returns {Object} Contains `size` and `offset`.
     */
    getPosition(): any;
    /**
     * Calculate total size and size of the witness bytes.
     * @returns {Object} Contains `size` and `witness`.
     */
    getSizes(): any;
    /**
     * Calculate the virtual size of the transaction.
     * Note that this is cached.
     * @returns {Number} vsize
     */
    getVirtualSize(): number;
    /**
     * Calculate the virtual size of the transaction
     * (weighted against bytes per sigop cost).
     * @param {Number} sigops - Sigops cost.
     * @returns {Number} vsize
     */
    getSigopsSize(sigops: number): number;
    /**
     * Calculate the weight of the transaction.
     * Note that this is cached.
     * @returns {Number} weight
     */
    getWeight(): number;
    /**
     * Calculate the real size of the transaction
     * with the witness included.
     * @returns {Number} size
     */
    getSize(): number;
    /**
     * Calculate the size of the transaction
     * without the witness.
     * with the witness included.
     * @returns {Number} size
     */
    getBaseSize(): number;
    /**
     * Test whether the transaction has a non-empty witness.
     * @returns {Boolean}
     */
    hasWitness(): boolean;
    /**
     * Get the signature hash of the transaction for signing verifying.
     * @param {Number} index - Index of input being signed/verified.
     * @param {Script} prev - Previous output script or redeem script
     * (in the case of witnesspubkeyhash, this should be the generated
     * p2pkh script).
     * @param {Amount} value - Previous output value.
     * @param {SighashType} type - Sighash type.
     * @param {Number} version - Sighash version (0=legacy, 1=segwit).
     * @returns {Buffer} Signature hash.
     */
    signatureHash(index: number, prev: Script, value: Amount, type: SighashType, version: number): Buffer;
    /**
     * Legacy sighashing -- O(n^2).
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param {SighashType} type
     * @returns {Buffer}
     */
    private signatureHashV0;
    /**
     * Calculate sighash size.
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param {Number} type
     * @returns {Number}
     */
    private hashSize;
    /**
     * Witness sighashing -- O(n).
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param {Amount} value
     * @param {SighashType} type
     * @returns {Buffer}
     */
    private signatureHashV1;
    /**
     * Verify signature.
     * @param {Number} index
     * @param {Script} prev
     * @param {Amount} value
     * @param {Buffer} sig
     * @param {Buffer} key
     * @param {Number} version
     * @returns {Boolean}
     */
    checksig(index: number, prev: Script, value: Amount, sig: Buffer, key: Buffer, version: number): boolean;
    /**
     * Create a signature suitable for inserting into scriptSigs/witnesses.
     * @param {Number} index - Index of input being signed.
     * @param {Script} prev - Previous output script or redeem script
     * (in the case of witnesspubkeyhash, this should be the generated
     * p2pkh script).
     * @param {Amount} value - Previous output value.
     * @param {Buffer} key
     * @param {SighashType} type
     * @param {Number} version - Sighash version (0=legacy, 1=segwit).
     * @returns {Buffer} Signature in DER format.
     */
    signature(index: number, prev: Script, value: Amount, key: Buffer, type: SighashType, version: number): Buffer;
    /**
     * Verify all transaction inputs.
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @throws {ScriptError} on invalid inputs
     */
    check(view: CoinView, flags?: VerifyFlags | null): void;
    /**
     * Verify a transaction input.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @throws {ScriptError} on invalid input
     */
    checkInput(index: number, coin: Coin | Output, flags?: VerifyFlags): void;
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    checkAsync(view: CoinView, flags?: VerifyFlags | null, pool: WorkerPool): Promise<any>;
    /**
     * Verify a transaction input asynchronously.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    checkInputAsync(index: number, coin: Coin | Output, flags?: VerifyFlags, pool: WorkerPool): Promise<any>;
    /**
     * Verify all transaction inputs.
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     */
    verify(view: CoinView, flags?: VerifyFlags | null): boolean;
    /**
     * Verify a transaction input.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the input is valid.
     */
    verifyInput(index: number, coin: Coin | Output, flags?: VerifyFlags): boolean;
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    verifyAsync(view: CoinView, flags?: VerifyFlags | null, pool: WorkerPool): Promise<any>;
    /**
     * Verify a transaction input asynchronously.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    verifyInputAsync(index: number, coin: Coin | Output, flags?: VerifyFlags, pool: WorkerPool): Promise<any>;
    /**
     * Test whether the transaction is a coinbase
     * by examining the inputs.
     * @returns {Boolean}
     */
    isCoinbase(): boolean;
    /**
     * Test whether the transaction is replaceable.
     * @returns {Boolean}
     */
    isRBF(): boolean;
    /**
     * Calculate the fee for the transaction.
     * @param {CoinView} view
     * @returns {Amount} fee (zero if not all coins are available).
     */
    getFee(view: CoinView): Amount;
    /**
     * Calculate the total input value.
     * @param {CoinView} view
     * @returns {Amount} value
     */
    getInputValue(view: CoinView): Amount;
    /**
     * Calculate the total output value.
     * @returns {Amount} value
     */
    getOutputValue(): Amount;
    /**
     * Get all input addresses.
     * @private
     * @param {CoinView} view
     * @returns {Array} [addrs, table]
     */
    private _getInputAddresses;
    /**
     * Get all output addresses.
     * @private
     * @returns {Array} [addrs, table]
     */
    private _getOutputAddresses;
    /**
     * Get all addresses.
     * @private
     * @param {CoinView} view
     * @returns {Array} [addrs, table]
     */
    private _getAddresses;
    /**
     * Get all input addresses.
     * @param {CoinView|null} view
     * @returns {Address[]} addresses
     */
    getInputAddresses(view: CoinView | null): Address[];
    /**
     * Get all output addresses.
     * @returns {Address[]} addresses
     */
    getOutputAddresses(): Address[];
    /**
     * Get all addresses.
     * @param {CoinView|null} view
     * @returns {Address[]} addresses
     */
    getAddresses(view: CoinView | null): Address[];
    /**
     * Get all input address hashes.
     * @param {CoinView|null} view
     * @returns {Hash[]} hashes
     */
    getInputHashes(view: CoinView | null, enc: any): Hash[];
    /**
     * Get all output address hashes.
     * @returns {Hash[]} hashes
     */
    getOutputHashes(enc: any): Hash[];
    /**
     * Get all address hashes.
     * @param {CoinView|null} view
     * @returns {Hash[]} hashes
     */
    getHashes(view: CoinView | null, enc: any): Hash[];
    /**
     * Test whether the transaction has
     * all coins available.
     * @param {CoinView} view
     * @returns {Boolean}
     */
    hasCoins(view: CoinView): boolean;
    /**
     * Check finality of transaction by examining
     * nLocktime and nSequence values.
     * @example
     * tx.isFinal(chain.height + 1, network.now());
     * @param {Number} height - Height at which to test. This
     * is usually the chain height, or the chain height + 1
     * when the transaction entered the mempool.
     * @param {Number} time - Time at which to test. This is
     * usually the chain tip's parent's median time, or the
     * time at which the transaction entered the mempool. If
     * MEDIAN_TIME_PAST is enabled this will be the median
     * time of the chain tip's previous entry's median time.
     * @returns {Boolean}
     */
    isFinal(height: number, time: number): boolean;
    /**
     * Verify the absolute locktime of a transaction.
     * Called by OP_CHECKLOCKTIMEVERIFY.
     * @param {Number} index - Index of input being verified.
     * @param {Number} predicate - Locktime to verify against.
     * @returns {Boolean}
     */
    verifyLocktime(index: number, predicate: number): boolean;
    /**
     * Verify the relative locktime of an input.
     * Called by OP_CHECKSEQUENCEVERIFY.
     * @param {Number} index - Index of input being verified.
     * @param {Number} predicate - Relative locktime to verify against.
     * @returns {Boolean}
     */
    verifySequence(index: number, predicate: number): boolean;
    /**
     * Calculate legacy (inaccurate) sigop count.
     * @returns {Number} sigop count
     */
    getLegacySigops(): number;
    /**
     * Calculate accurate sigop count, taking into account redeem scripts.
     * @param {CoinView} view
     * @returns {Number} sigop count
     */
    getScripthashSigops(view: CoinView): number;
    /**
     * Calculate accurate sigop count, taking into account redeem scripts.
     * @param {CoinView} view
     * @returns {Number} sigop count
     */
    getWitnessSigops(view: CoinView): number;
    /**
     * Calculate sigops cost, taking into account witness programs.
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop weight
     */
    getSigopsCost(view: CoinView, flags: VerifyFlags | null): number;
    /**
     * Calculate virtual sigop count.
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop count
     */
    getSigops(view: CoinView, flags: VerifyFlags | null): number;
    /**
     * Non-contextual sanity checks for the transaction.
     * Will mostly verify coin and output values.
     * @see CheckTransaction()
     * @returns {Array} [result, reason, score]
     */
    isSane(): any[];
    /**
     * Non-contextual sanity checks for the transaction.
     * Will mostly verify coin and output values.
     * @see CheckTransaction()
     * @returns {Array} [valid, reason, score]
     */
    checkSanity(): any[];
    /**
     * Non-contextual checks to determine whether the
     * transaction has all standard output script
     * types and standard input script size with only
     * pushdatas in the code.
     * Will mostly verify coin and output values.
     * @see IsStandardTx()
     * @returns {Array} [valid, reason, score]
     */
    isStandard(): any[];
    /**
     * Non-contextual checks to determine whether the
     * transaction has all standard output script
     * types and standard input script size with only
     * pushdatas in the code.
     * Will mostly verify coin and output values.
     * @see IsStandardTx()
     * @returns {Array} [valid, reason, score]
     */
    checkStandard(): any[];
    /**
     * Perform contextual checks to verify coin and input
     * script standardness (including the redeem script).
     * @see AreInputsStandard()
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Boolean}
     */
    hasStandardInputs(view: CoinView): boolean;
    /**
     * Perform contextual checks to verify coin and witness standardness.
     * @see IsBadWitness()
     * @param {CoinView} view
     * @returns {Boolean}
     */
    hasStandardWitness(view: CoinView): boolean;
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {CoinView} view
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Boolean}
     */
    verifyInputs(view: CoinView, height: number): boolean;
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {CoinView} view
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Array} [fee, reason, score]
     */
    checkInputs(view: CoinView, height: number): any[];
    /**
     * Calculate the modified size of the transaction. This
     * is used in the mempool for calculating priority.
     * @param {Number?} size - The size to modify. If not present,
     * virtual size will be used.
     * @returns {Number} Modified size.
     */
    getModifiedSize(size: number | null): number;
    /**
     * Calculate the transaction priority.
     * @param {CoinView} view
     * @param {Number} height
     * @param {Number?} size - Size to calculate priority
     * based on. If not present, virtual size will be used.
     * @returns {Number}
     */
    getPriority(view: CoinView, height: number, size: number | null): number;
    /**
     * Calculate the transaction's on-chain value.
     * @param {CoinView} view
     * @returns {Number}
     */
    getChainValue(view: CoinView): number;
    /**
     * Determine whether the transaction is above the
     * free threshold in priority. A transaction which
     * passed this test is most likely relayable
     * without a fee.
     * @param {CoinView} view
     * @param {Number?} height - If not present, tx
     * height or network height will be used.
     * @param {Number?} size - If not present, modified
     * size will be calculated and used.
     * @returns {Boolean}
     */
    isFree(view: CoinView, height: number | null, size: number | null): boolean;
    /**
     * Calculate minimum fee in order for the transaction
     * to be relayable (not the constant min relay fee).
     * @param {Number?} size - If not present, max size
     * estimation will be calculated and used.
     * @param {Rate?} rate - Rate of satoshi per kB.
     * @returns {Amount} fee
     */
    getMinFee(size: number | null, rate: Rate | null): Amount;
    /**
     * Calculate the minimum fee in order for the transaction
     * to be relayable, but _round to the nearest kilobyte
     * when taking into account size.
     * @param {Number?} size - If not present, max size
     * estimation will be calculated and used.
     * @param {Rate?} rate - Rate of satoshi per kB.
     * @returns {Amount} fee
     */
    getRoundFee(size: number | null, rate: Rate | null): Amount;
    /**
     * Calculate the transaction's rate based on size
     * and fees. Size will be calculated if not present.
     * @param {CoinView} view
     * @param {Number?} size
     * @returns {Rate}
     */
    getRate(view: CoinView, size: number | null): Rate;
    /**
     * Get all unique outpoint hashes.
     * @returns {Hash[]} Outpoint hashes.
     */
    getPrevout(): Hash[];
    /**
     * Test a transaction against a bloom filter using
     * the BIP37 matching algorithm. Note that this may
     * update the filter depending on what the `update`
     * value is.
     * @see "Filter matching algorithm":
     * @see https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki
     * @param {BloomFilter} filter
     * @returns {Boolean} True if the transaction matched.
     */
    isWatched(filter: BloomFilter): boolean;
    /**
     * Get little-endian tx hash.
     * @returns {Hash}
     */
    rhash(): Hash;
    /**
     * Get little-endian wtx hash.
     * @returns {Hash}
     */
    rwhash(): Hash;
    /**
     * Get little-endian tx hash.
     * @returns {Hash}
     */
    txid(): Hash;
    /**
     * Get little-endian wtx hash.
     * @returns {Hash}
     */
    wtxid(): Hash;
    /**
     * Convert the tx to an inv item.
     * @returns {InvItem}
     */
    toInv(): InvItem;
    /**
     * Inspect the transaction and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {ChainEntry} entry
     * @param {Number} index
     * @returns {Object}
     */
    format(view: CoinView, entry: ChainEntry, index: number): any;
    /**
     * Convert the transaction to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Convert the transaction to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {ChainEntry} entry
     * @param {Number} index
     * @returns {Object}
     */
    getJSON(network: Network, view: CoinView, entry: ChainEntry, index: number): any;
    /**
     * Inject properties from a json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @param {Boolean} block
     */
    private fromReader;
    /**
     * Inject properties from serialized
     * buffer reader (witness serialization).
     * @private
     * @param {BufferReader} br
     * @param {Boolean} block
     */
    private fromWitnessReader;
    /**
     * Serialize transaction without witness.
     * @private
     * @returns {RawTX}
     */
    private frameNormal;
    /**
     * Serialize transaction with witness. Calculates the witness
     * size as it is framing (exposed on return value as `witness`).
     * @private
     * @returns {RawTX}
     */
    private frameWitness;
    /**
     * Serialize transaction without witness.
     * @private
     * @param {BufferWriter} bw
     * @returns {RawTX}
     */
    private writeNormal;
    /**
     * Serialize transaction with witness. Calculates the witness
     * size as it is framing (exposed on return value as `witness`).
     * @private
     * @param {BufferWriter} bw
     * @returns {RawTX}
     */
    private writeWitness;
    /**
     * Calculate the real size of the transaction
     * without the witness vector.
     * @returns {RawTX}
     */
    getNormalSizes(): RawTX;
    /**
     * Calculate the real size of the transaction
     * with the witness included.
     * @returns {RawTX}
     */
    getWitnessSizes(): RawTX;
}
import Script = require("../script/script");
import Amount = require("../btc/amount");
import Output = require("./output");
import InvItem = require("./invitem");
import Network = require("../protocol/network");
declare class RawTX {
    constructor(size: any, witness: any);
    data: any;
    size: any;
    witness: any;
}
//# sourceMappingURL=tx.d.ts.map