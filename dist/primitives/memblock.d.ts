export = MemBlock;
/**
 * Mem Block
 * A block object which is essentially a "placeholder"
 * for a full {@link Block} object. The v8 garbage
 * collector's head will explode if there is too much
 * data on the javascript heap. Blocks can currently
 * be up to 1mb in size. In the future, they may be
 * 2mb, 8mb, or maybe 20mb, who knows? A MemBlock
 * is an optimization in Bcoin which defers parsing of
 * the serialized transactions (the block Buffer) until
 * the block has passed through the chain queue and
 * is about to enter the chain. This keeps a lot data
 * off of the javascript heap for most of the time a
 * block even exists in memory, and manages to keep a
 * lot of strain off of the garbage collector. Having
 * 500mb of blocks on the js heap would not be a good
 * thing.
 * @alias module:primitives.MemBlock
 * @extends AbstractBlock
 */
declare class MemBlock extends AbstractBlock {
    /**
     * Insantiate a memblock from serialized data.
     * @param {Buffer} data
     * @returns {MemBlock}
     */
    static fromRaw(data: Buffer): MemBlock;
    /**
     * Test whether an object is a MemBlock.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isMemBlock(obj: any): boolean;
    _raw: Buffer;
    /**
     * Get the full block size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Retrieve the coinbase height
     * from the coinbase input script.
     * @returns {Number} height (-1 if not present).
     */
    getCoinbaseHeight(): number;
    /**
     * Parse the coinbase height
     * from the coinbase input script.
     * @private
     * @returns {Number} height (-1 if not present).
     */
    private parseCoinbaseHeight;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Return serialized block data.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Return serialized block data.
     * @returns {Buffer}
     */
    toNormal(): Buffer;
    /**
     * Parse the serialized block data
     * and create an actual {@link Block}.
     * @returns {Block}
     * @throws Parse error
     */
    toBlock(): Block;
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    toHeaders(): Headers;
}
import AbstractBlock = require("./abstractblock");
import Block = require("./block");
import Headers = require("./headers");
//# sourceMappingURL=memblock.d.ts.map