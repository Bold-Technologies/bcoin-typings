/**
 * Chain State
 */
export class ChainState {
    /**
     * Instantiate chain state from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {ChainState}
     */
    static fromRaw(data: Buffer): ChainState;
    startHeight: number;
    startHash: any;
    height: number;
    marked: boolean;
    /**
     * Clone the state.
     * @returns {ChainState}
     */
    clone(): ChainState;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize the chain state.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
}
/**
 * Block Meta
 */
export class BlockMeta {
    /**
     * Instantiate block meta from chain entry.
     * @param {ChainEntry} entry
     * @returns {BlockMeta}
     */
    static fromEntry(entry: ChainEntry): BlockMeta;
    /**
     * Instantiate block meta from json object.
     * @param {Object} json
     * @returns {BlockMeta}
     */
    static fromJSON(json: any): BlockMeta;
    /**
     * Instantiate block meta from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {BlockMeta}
     */
    static fromRaw(data: Buffer): BlockMeta;
    /**
     * Create block meta.
     * @constructor
     * @param {Hash} hash
     * @param {Number} height
     * @param {Number} time
     */
    constructor(hash: Hash, height: number, time: number);
    hash: any;
    height: number;
    time: number;
    /**
     * Clone the block.
     * @returns {BlockMeta}
     */
    clone(): BlockMeta;
    /**
     * Get block meta hash as a buffer.
     * @returns {Buffer}
     */
    toHash(): Buffer;
    /**
     * Instantiate block meta from chain entry.
     * @private
     * @param {ChainEntry} entry
     */
    private fromEntry;
    /**
     * Instantiate block meta from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Instantiate block meta from serialized tip data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize the block meta.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Convert the block meta to a more json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
}
/**
 * TX Record
 */
export class TXRecord {
    /**
     * Instantiate tx record from tx and block.
     * @param {TX} tx
     * @param {Block?} block
     * @returns {TXRecord}
     */
    static fromTX(tx: TX, block: Block): TXRecord;
    /**
     * Instantiate a transaction from a buffer
     * in "extended" serialization format.
     * @param {Buffer} data
     * @returns {TX}
     */
    static fromRaw(data: Buffer): TX;
    /**
     * Create tx record.
     * @constructor
     * @param {TX} tx
     * @param {BlockMeta?} block
     */
    constructor(tx: TX, block: BlockMeta | null);
    tx: TX;
    hash: any;
    mtime: number;
    height: number;
    block: any;
    index: number;
    time: number;
    /**
     * Inject properties from tx and block.
     * @private
     * @param {TX} tx
     * @param {Block?} block
     * @returns {TXRecord}
     */
    private fromTX;
    /**
     * Set block data (confirm).
     * @param {BlockMeta} block
     */
    setBlock(block: BlockMeta): void;
    /**
     * Unset block (unconfirm).
     */
    unsetBlock(): void;
    /**
     * Convert tx record to a block meta.
     * @returns {BlockMeta}
     */
    getBlock(): BlockMeta;
    /**
     * Calculate current number of transaction confirmations.
     * @param {Number} height - Current chain height.
     * @returns {Number} confirmations
     */
    getDepth(height: number): number;
    /**
     * Get serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize a transaction to "extended format".
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from "extended" format.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * Map Record
 */
export class MapRecord {
    static fromReader(br: any): MapRecord;
    static fromRaw(data: any): MapRecord;
    wids: any;
    add(wid: any): boolean;
    remove(wid: any): any;
    toWriter(bw: any): any;
    getSize(): number;
    toRaw(): any;
    fromReader(br: any): MapRecord;
    fromRaw(data: any): MapRecord;
}
import TX = require("../primitives/tx");
//# sourceMappingURL=records.d.ts.map