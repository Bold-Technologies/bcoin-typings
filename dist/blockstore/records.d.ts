/**
 * @module blockstore/records
 */
/**
 * Block Record
 */
export class BlockRecord {
    /**
     * Instantiate block record from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {BlockRecord}
     */
    static fromRaw(data: Buffer): BlockRecord;
    /**
     * Create a block record.
     * @constructor
     */
    constructor(options?: {});
    file: any;
    position: any;
    length: any;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize the block record.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
}
/**
 * File Record
 */
export class FileRecord {
    /**
     * Instantiate file record from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {ChainState}
     */
    static fromRaw(data: Buffer): ChainState;
    /**
     * Create a file record.
     * @constructor
     */
    constructor(options?: {});
    blocks: any;
    used: any;
    length: any;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Serialize the file record.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
}
//# sourceMappingURL=records.d.ts.map