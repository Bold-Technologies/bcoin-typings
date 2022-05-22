export = AbstractBlockStore;
/**
 * Abstract Block Store
 *
 * @alias module:blockstore.AbstractBlockStore
 * @abstract
 */
declare class AbstractBlockStore {
    /**
     * Create an abstract blockstore.
     * @constructor
     */
    constructor(options: any);
    options: any;
    logger: any;
    /**
     * This method ensures that resources are available
     * before opening.
     * @returns {Promise}
     */
    ensure(): Promise<any>;
    /**
     * This method opens any necessary resources and
     * initializes the store to be ready to be queried.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * This method closes resources and prepares
     * the store to be closed.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * This method stores merkle blocks including
     * all the relevant transactions.
     * @returns {Promise}
     */
    writeMerkle(hash: any, data: any): Promise<any>;
    /**
     * This method stores block undo coin data.
     * @returns {Promise}
     */
    writeUndo(hash: any, data: any): Promise<any>;
    /**
     * This method stores serialized block filter data in files.
     * @returns {Promise}
     */
    writeFilter(hash: any, data: any): Promise<any>;
    /**
     * This method stores block data.
     * @returns {Promise}
     */
    write(hash: any, data: any): Promise<any>;
    /**
     * This method reads merkle block data.
     * @returns {Promise}
     */
    readMerkle(hash: any): Promise<any>;
    /**
     * This method will retrieve serialized block filter data.
     * @returns {Promise}
     */
    readFilter(hash: any): Promise<any>;
    /**
     * This method will retrieve block filter header only.
     * @returns {Promise}
     */
    readFilterHeader(hash: any): Promise<any>;
    /**
     * This method will retrieve block undo coin data.
     * @returns {Promise}
     */
    readUndo(hash: any): Promise<any>;
    /**
     * This method will retrieve block data. Smaller portions of
     * the block can be read by using the offset and size arguments.
     * @returns {Promise}
     */
    read(hash: any, offset: any, size: any): Promise<any>;
    /**
     * This will free resources for storing the merkle block data.
     * @returns {Promise}
     */
    pruneMerkle(hash: any): Promise<any>;
    /**
     * This will free resources for storing the block undo coin data.
     * @returns {Promise}
     */
    pruneUndo(hash: any): Promise<any>;
    /**
     * This will free resources for storing the serialized block filter data.
     * @returns {Promise}
     */
    pruneFilter(hash: any): Promise<any>;
    /**
     * This will free resources for storing the block data.
     * @returns {Promise}
     */
    prune(hash: any): Promise<any>;
    /**
     * This will check if merkle block data has been stored
     * and is available.
     * @returns {Promise}
     */
    hasMerkle(hash: any): Promise<any>;
    /**
     * This will check if a block undo coin data has been stored
     * and is available.
     * @returns {Promise}
     */
    hasUndo(hash: any): Promise<any>;
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @returns {Promise}
     */
    hasFilter(hash: any): Promise<any>;
    /**
     * This will check if a block has been stored and is available.
     * @returns {Promise}
     */
    has(hash: any): Promise<any>;
}
//# sourceMappingURL=abstract.d.ts.map