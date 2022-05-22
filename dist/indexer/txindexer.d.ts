export = TXIndexer;
/**
 * TXIndexer
 * @alias module:indexer.TXIndexer
 * @extends Indexer
 */
declare class TXIndexer extends Indexer {
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    /**
     * Index transactions by txid.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    private indexBlock;
    /**
     * Remove transactions from index.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    private unindexBlock;
    /**
     * Get a transaction with metadata.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXMeta}.
     */
    getMeta(hash: Hash): Promise<any>;
    /**
     * Retrieve a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasTX(hash: Hash): Promise<any>;
    /**
     * Get coin viewpoint (historical).
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getSpentView(tx: TX): Promise<any>;
}
import Indexer = require("./indexer");
import TX = require("../primitives/tx");
//# sourceMappingURL=txindexer.d.ts.map