export = FileBlockStore;
/**
 * File Block Store
 *
 * @alias module:blockstore:FileBlockStore
 * @abstract
 */
declare class FileBlockStore extends AbstractBlockStore {
    location: any;
    indexLocation: string;
    db: any;
    maxFileLength: any;
    network: Network;
    writing: any;
    /**
     * Compares the number of files in the directory
     * with the recorded number of files.
     * @param {Number} type - The type of block data
     * @private
     * @returns {Promise}
     */
    private check;
    /**
     * Creates indexes from files for a block type. Reads the hash of
     * the block data from the magic prefix, except for a block which
     * the hash is read from the block header.
     * @private
     * @param {Number} type - The type of block data
     * @returns {Promise}
     */
    private _index;
    /**
     * Compares the number of files in the directory
     * with the recorded number of files. If there are any
     * inconsistencies it will reindex all blocks.
     * @private
     * @returns {Promise}
     */
    private index;
    /**
     * This closes the file block store and underlying
     * indexing databases.
     */
    close(): Promise<void>;
    /**
     * This method will determine the file path based on the file number
     * and the current block data location.
     * @private
     * @param {Number} type - The type of block data
     * @param {Number} fileno - The number of the file.
     * @returns {Promise}
     */
    private filepath;
    /**
     * This method will select and potentially allocate a file to
     * write a block based on the size and type.
     * @private
     * @param {Number} type - The type of block data
     * @param {Number} length - The number of bytes
     * @returns {Promise}
     */
    private allocate;
    /**
     * This method stores merkle block data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    writeMerkle(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores block undo coin data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    writeUndo(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores block data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    write(hash: Buffer, data: Buffer): Promise<any>;
    /**
     * This method stores serialized block filter data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The serialized block filter data.
     * @param {Number} filterType - The filter type.
     * @returns {Promise}
     */
    writeFilter(hash: Buffer, data: Buffer, filterType: number): Promise<any>;
    /**
     * This method stores block data in files with by appending
     * data to the last written file and updating indexes to point
     * to the file and position.
     * @private
     * @param {Number} type - The type of block data
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    private _write;
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
     * This method will retrieve block data. Smaller portions of the
     * block (e.g. transactions) can be read by using the offset and
     * length arguments.
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    read(hash: Buffer, offset: number, length: number): Promise<any>;
    /**
     * This method will retrieve serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @param {Number} filterType - The filter type
     * @returns {Promise}
     */
    readFilter(hash: Buffer, filterType: number): Promise<any>;
    /**
     * This method will retrieve block filter header only.
     * @param {Buffer} hash - The block hash
     * @param {String} filterType - The filter name
     * @returns {Promise}
     */
    readFilterHeader(hash: Buffer, filterType: string): Promise<any>;
    /**
     * This methods reads data from disk by retrieving the index of
     * the data and reading from the corresponding file and location.
     * @private
     * @param {Number} type - The type of block data
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    private _read;
    /**
     * This will free resources for storing merkle block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    pruneMerkle(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the block undo coin data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    pruneUndo(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    prune(hash: Buffer): Promise<any>;
    /**
     * This will free resources for storing the serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @param {String} filterType - The filter type
     * @returns {Promise}
     */
    pruneFilter(hash: Buffer, filterType: string): Promise<any>;
    /**
     * This will free resources for storing the block data. The block
     * data may not be deleted from disk immediately, the index for the
     * block is removed and will not be able to be read. The underlying
     * file is unlinked when all blocks in a file have been pruned.
     * @private
     * @param {Number} type
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    private _prune;
    /**
     * This will check if merkle block data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    hasMerkle(hash: Buffer): Promise<any>;
    /**
     * This will check if a block undo coin has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    hasUndo(hash: Buffer): Promise<any>;
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @param {Number} filterType - The filter type
     * @returns {Promise}
     */
    hasFilter(hash: Buffer, filterType: number): Promise<any>;
    /**
     * This will check if a block has been stored and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    has(hash: Buffer): Promise<any>;
}
import AbstractBlockStore = require("./abstract");
import Network = require("../protocol/network");
//# sourceMappingURL=file.d.ts.map