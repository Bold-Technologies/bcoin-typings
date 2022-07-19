export = AddrIndexer;
/**
 * AddrIndexer
 * @alias module:indexer.AddrIndexer
 * @extends Indexer
 */
declare class AddrIndexer extends Indexer {
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    maxTxs: any;
    /**
     * Index transactions by address.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    private indexBlock;
    /**
     * Remove addresses from index.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    private unindexBlock;
    /**
     * Get transaction hashes to an address in ascending or descending
     * order. If the `after` argument is supplied, results will be given
     * _after_ that transaction hash. The default order is ascending from
     * oldest to latest.
     * @param {Address} addr
     * @param {Object} options
     * @param {Buffer} options.after - A transaction hash
     * @param {Number} options.limit
     * @param {Boolean} options.reverse
     * @returns {Promise} - Returns {@link Hash}[].
     */
    getHashesByAddress(addr: Address, options?: {
        after: Buffer;
        limit: number;
        reverse: boolean;
    }): Promise<any>;
}
import Indexer = require("./indexer");
import Address = require("../primitives/address");
//# sourceMappingURL=addrindexer.d.ts.map