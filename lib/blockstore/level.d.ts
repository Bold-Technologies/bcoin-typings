export = LevelBlockStore;
/**
 * LevelDB Block Store
 *
 * @alias module:blockstore:LevelBlockStore
 * @abstract
 */
declare class LevelBlockStore extends AbstractBlockStore {
    location: any;
    db: any;
    /**
     * Closes the block storage.
     */
    close(): Promise<void>;
    /**
     * This method stores merkle block data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    writeMerkle(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores block undo coin data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    writeUndo(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores block data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    write(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores serialized block filter data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The serialized block filter data.
     * @returns {Promise}
     */
    writeFilter(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method will retrieve merkle block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    readMerkle(hash: Buffer): Promise<any>;
    /**
     * This method will retrieve block undo coin data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    readUndo(hash: Buffer): Promise<any>;
    /**
     * This method will retrieve serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    readFilter(hash: Buffer): Promise<any>;
    /**
     * This method will retrieve block filter header only.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    readFilterHeader(hash: Buffer): Promise<any>;
    /**
     * This method will retrieve block data. Smaller portions of the
     * block (e.g. transactions) can be returned using the offset and
     * length arguments. However, the entire block will be read as the
     * data is stored in a key/value database.
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    read(hash: Buffer, offset: number, length: number): Promise<any>;
    /**
     * This will free resources for storing merkle block data.
     * The block data may not be immediately removed from disk, and will
     * be reclaimed during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    pruneMerkle(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the block undo coin data.
     * The block data may not be immediately removed from disk, and will
     * be reclaimed during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    pruneUndo(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    pruneFilter(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the block data. The block
     * data may not be immediately removed from disk, and will be reclaimed
     * during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    prune(hash: Buffer): Promise<any>;
    /**
     * This will check if a merkle block data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    hasMerkle(hash: Buffer): Promise<any>;
    /**
     * This will check if a block undo coin data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    hasUndo(hash: Buffer): Promise<any>;
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    hasFilter(hash: Buffer): Promise<any>;
    /**
     * This will check if a block has been stored and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    has(hash: Buffer): Promise<any>;
}
import AbstractBlockStore = require("./abstract");
//# sourceMappingURL=level.d.ts.map