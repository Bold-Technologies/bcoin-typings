export = FilterIndexer;
/**
 * FilterIndexer
 * @alias module:indexer.FilterIndexer
 * @extends Indexer
 */
declare class FilterIndexer extends Indexer {
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    /**
     * Index compact filters.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    private indexBlock;
    /**
     * Prune compact filters.
     * @private
     * @param {BlockMeta} meta
     */
    private pruneBlock;
    /**
     * Retrieve compact filter by hash.
     * @param {Hash} hash
     * @param {Number} type
     * @returns {Promise} - Returns {@link Filter}.
     */
    getFilter(hash: Hash): Promise<any>;
    /**
     * Retrieve compact filter header by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Hash}.
     */
    getFilterHeader(hash: Hash): Promise<any>;
}
import Indexer = require("./indexer");
//# sourceMappingURL=filterindexer.d.ts.map