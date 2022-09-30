/**
 * Block Template
 * @alias module:mining.BlockTemplate
 */
export class BlockTemplate {
    /**
     * Instantiate block template from options.
     * @param {Object} options
     * @returns {BlockTemplate}
     */
    static fromOptions(options: any): BlockTemplate;
    /**
     * Create a block template.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    prevBlock: any;
    version: number;
    height: number;
    time: number;
    bits: number;
    target: any;
    locktime: number;
    mtp: number;
    flags: number;
    coinbaseFlags: any;
    witness: boolean;
    address: Address;
    sigops: number;
    weight: number;
    interval: number;
    fees: number;
    tree: MerkleTree;
    commitment: any;
    left: any;
    right: any;
    items: any[];
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     * @returns {BlockTemplate}
     */
    private fromOptions;
    /**
     * Create witness commitment hash.
     * @returns {Buffer}
     */
    getWitnessHash(): Buffer;
    /**
     * Create witness commitment script.
     * @returns {Script}
     */
    getWitnessScript(): Script;
    /**
     * Set the target (bits).
     * @param {Number} bits
     */
    setBits(bits: number): void;
    /**
     * Set the target (uint256le).
     * @param {Buffer} target
     */
    setTarget(target: Buffer): void;
    /**
     * Calculate the block reward.
     * @returns {SatoshiAmount}
     */
    getReward(): SatoshiAmount;
    /**
     * Initialize the default coinbase.
     * @param {Buffer} hash - Witness commitment hash.
     * @returns {TX}
     */
    createCoinbase(hash: Buffer): TX;
    /**
     * Refresh the coinbase and merkle tree.
     */
    refresh(): void;
    /**
     * Get raw coinbase with desired nonces.
     * @param {Number} nonce1
     * @param {Number} nonce2
     * @returns {Buffer}
     */
    getRawCoinbase(nonce1: number, nonce2: number): Buffer;
    /**
     * Calculate the merkle root with given nonces.
     * @param {Number} nonce1
     * @param {Number} nonce2
     * @returns {Buffer}
     */
    getRoot(nonce1: number, nonce2: number): Buffer;
    /**
     * Create raw block header with given parameters.
     * @param {Buffer} root
     * @param {Number} time
     * @param {Number} nonce
     * @returns {Buffer}
     */
    getHeader(root: Buffer, time: number, nonce: number): Buffer;
    /**
     * Calculate proof with given parameters.
     * @param {Number} nonce1
     * @param {Number} nonce2
     * @param {Number} time
     * @param {Number} nonce
     * @returns {BlockProof}
     */
    getProof(nonce1: number, nonce2: number, time: number, nonce: number): BlockProof;
    /**
     * Create coinbase from given parameters.
     * @param {Number} nonce1
     * @param {Number} nonce2
     * @returns {TX}
     */
    getCoinbase(nonce1: number, nonce2: number): TX;
    /**
     * Create block from calculated proof.
     * @param {BlockProof} proof
     * @returns {Block}
     */
    commit(proof: BlockProof): Block;
    /**
     * Quick and dirty way to
     * get a coinbase tx object.
     * @returns {TX}
     */
    toCoinbase(): TX;
    /**
     * Quick and dirty way to get a block
     * object (most likely to be an invalid one).
     * @returns {Block}
     */
    toBlock(): Block;
    /**
     * Calculate the target difficulty.
     * @returns {Number}
     */
    getDifficulty(): number;
    /**
     * Set the reward output
     * address and refresh.
     * @param {Address} address
     */
    setAddress(address: Address): void;
    /**
     * Add a transaction to the template.
     * @param {TX} tx
     * @param {CoinView} view
     */
    addTX(tx: TX, view: CoinView): boolean;
    /**
     * Add a transaction to the template
     * (less verification than addTX).
     * @param {TX} tx
     * @param {CoinView?} view
     */
    pushTX(tx: TX, view: CoinView | null): boolean;
}
/**
 * Block Entry
 * @alias module:mining.BlockEntry
 * @property {TX} tx
 * @property {Hash} hash
 * @property  {SatoshiAmount} fee
 * @property {Rate} rate
 * @property {Number} priority
 * @property {Boolean} free
 * @property {Number} sigops
 * @property {Number} depCount
 */
export class BlockEntry {
    /**
     * Instantiate block entry from transaction.
     * @param {TX} tx
     * @param {CoinView} view
     * @param {BlockTemplate} attempt
     * @returns {BlockEntry}
     */
    static fromTX(tx: TX, view: CoinView, attempt: BlockTemplate): BlockEntry;
    /**
     * Instantiate block entry from mempool entry.
     * @param {MempoolEntry} entry
     * @param {BlockTemplate} attempt
     * @returns {BlockEntry}
     */
    static fromEntry(entry: MempoolEntry, attempt: BlockTemplate): BlockEntry;
    /**
     * Create a block entry.
     * @constructor
     * @param {TX} tx
     */
    constructor(tx: TX);
    tx: TX;
    hash: any;
    fee: number;
    rate: number;
    priority: number;
    free: boolean;
    sigops: number;
    descRate: number;
    depCount: number;
}
import Address = require("../primitives/address");
/**
 * Merkle Tree
 * @property {Hash[]} steps
 */
declare class MerkleTree {
    static fromItems(items: any): MerkleTree;
    static fromBlock(txs: any): MerkleTree;
    static fromLeaves(leaves: any): MerkleTree;
    steps: any[];
    withFirst(hash: any): any;
    toJSON(): any[];
    fromItems(items: any): MerkleTree;
    fromBlock(txs: any): MerkleTree;
    fromLeaves(leaves: any): MerkleTree;
}
import Script = require("../script/script");
import TX = require("../primitives/tx");
/**
 * Block Proof
 */
declare class BlockProof {
    /**
     * Create a block proof.
     * @constructor
     * @param {Hash} hash
     * @param {Hash} root
     * @param {Number} nonce1
     * @param {Number} nonce2
     * @param {Number} time
     * @param {Number} nonce
     */
    constructor(hash: Hash, root: Hash, nonce1: number, nonce2: number, time: number, nonce: number);
    hash: any;
    root: any;
    nonce1: number;
    nonce2: number;
    time: number;
    nonce: number;
    rhash(): string;
    verify(target: any): boolean;
    getDifficulty(): number;
}
import Block = require("../primitives/block");
import CoinView = require("../coins/coinview");
export {};
//# sourceMappingURL=template.d.ts.map