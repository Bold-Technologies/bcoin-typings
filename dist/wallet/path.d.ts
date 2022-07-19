export = Path;
/**
 * Path
 * @alias module:wallet.Path
 * @property {String} name - Account name.
 * @property {Number} account - Account index.
 * @property {Number} branch - Branch index.
 * @property {Number} index - Address index.
 */
declare class Path {
    /**
     * Instantiate path from options object.
     * @param {Object} options
     * @returns {Path}
     */
    static fromOptions(options: any): Path;
    /**
     * Instantiate path from serialized data.
     * @param {Buffer} data
     * @returns {Path}
     */
    static fromRaw(data: Buffer): Path;
    /**
     * Instantiate path from address.
     * @param {Account} account
     * @param {Address} address
     * @returns {Path}
     */
    static fromAddress(account: Account, address: Address): Path;
    /**
     * Create a path.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    keyType: number;
    name: any;
    account: number;
    type: number;
    version: number;
    branch: number;
    index: number;
    encrypted: boolean;
    data: any;
    hash: any;
    /**
     * Instantiate path from options object.
     * @private
     * @param {Object} options
     * @returns {Path}
     */
    private fromOptions;
    /**
     * Clone the path object.
     * @returns {Path}
     */
    clone(): Path;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize path.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from address.
     * @private
     * @param {Account} account
     * @param {Address} address
     */
    private fromAddress;
    /**
     * Convert path object to string derivation path.
     * @returns {String}
     */
    toPath(): string;
    /**
     * Convert path object to an address (currently unused).
     * @returns {Address}
     */
    toAddress(): Address;
    /**
     * Convert path to a json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
}
declare namespace Path {
    namespace types {
        const HD: number;
        const KEY: number;
        const ADDRESS: number;
    }
    /**
     * *
     */
    type types = number;
    /**
     * *
     */
    type typesByVal = number;
    const typesByVal: string[];
}
import Address = require("../primitives/address");
//# sourceMappingURL=path.d.ts.map