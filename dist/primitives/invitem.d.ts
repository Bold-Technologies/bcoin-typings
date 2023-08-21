export = InvItem;
/**
 * Inv Item
 * @alias module:primitives.InvItem
 * @constructor
 * @property {InvType} type
 * @property {Hash} hash
 */
declare class InvItem {
    /**
     * Instantiate inv item from buffer reader.
     * @param {BufferReader} br
     * @returns {InvItem}
     */
    static fromReader(br: BufferReader): InvItem;
    /**
     * Instantiate inv item from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {InvItem}
     */
    static fromRaw(data: Buffer, enc: string | null): InvItem;
    /**
     * Create an inv item.
     * @constructor
     * @param {Number} type
     * @param {Hash} hash
     */
    constructor(type: number, hash: Hash);
    type: number;
    hash: Hash;
    /**
     * get size of inv item
     * @return {Number}
     */
    getSize(): number;
    /**
     * Write inv item to buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize inv item.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     */
    fromRaw(data: Buffer): InvItem;
    /**
     * Test whether the inv item is a block.
     * @returns {Boolean}
     */
    isBlock(): boolean;
    /**
     * Test whether the inv item is a tx.
     * @returns {Boolean}
     */
    isTX(): boolean;
    /**
     * Test whether the inv item has the witness bit set.
     * @returns {Boolean}
     */
    hasWitness(): boolean;
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    rhash(): Hash;
}
declare namespace InvItem {
    namespace types {
        const TX: number;
        const BLOCK: number;
        const FILTERED_BLOCK: number;
        const CMPCT_BLOCK: number;
        const WITNESS_TX: number;
        const WITNESS_BLOCK: number;
        const WITNESS_FILTERED_BLOCK: number;
    }
    /**
     * *
     */
    type types = number;
    const typesByVal: {
        [x: number]: string;
        1: string;
        2: string;
        3: string;
        4: string;
    };
    const WITNESS_FLAG: number;
}
//# sourceMappingURL=invitem.d.ts.map