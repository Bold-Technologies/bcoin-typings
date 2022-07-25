export = AddrIndexer;
/**
 * Address Indexer
 * @ignore
 */
declare class AddrIndexer {
    /**
     * Create TX address index.
     * @constructor
     * @param {Network} network
     */
    constructor(network: Network);
    network: Network;
    index: any;
    map: any;
    reset(): void;
    getKey(addr: any): any;
    /**
     * Get transactions by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    get(addr: Address, options?: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): any[];
    /**
     * Get transaction meta by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    getMeta(addr: Address, options?: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): TXMeta[];
    /**
     * Get entries by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    getEntries(addr: Address, options?: {
        limit: number;
        reverse: number;
        after: Buffer;
    }): any[];
    insert(entry: any, view: any): void;
    remove(hash: any): void;
}
import TXMeta = require("../primitives/txmeta");
//# sourceMappingURL=addrindexer.d.ts.map