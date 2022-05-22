export = HDPublicKey;
/**
 * HDPublicKey
 * @alias module:hd.PublicKey
 * @property {Number} depth
 * @property {Number} parentFingerPrint
 * @property {Number} childIndex
 * @property {Buffer} chainCode
 * @property {Buffer} publicKey
 */
declare class HDPublicKey {
    /**
     * Instantiate HD public key from options object.
     * @param {Object} options
     * @returns {HDPublicKey}
     */
    static fromOptions(options: any): HDPublicKey;
    /**
     * Test whether a string is a valid path.
     * @param {String} path
     * @param {Boolean?} hardened
     * @returns {Boolean}
     */
    static isValidPath(path: string): boolean;
    /**
     * Instantiate an HDPublicKey from a jsonified key object.
     * @param {Object} json - The jsonified transaction object.
     * @param {Network?} network
     * @returns {HDPrivateKey}
     */
    static fromJSON(json: any, network: Network | null): HDPrivateKey;
    /**
     * Test whether an object is in the form of a base58 xpubkey.
     * @param {String} data
     * @param {(Network|NetworkType)?} network
     * @returns {Boolean}
     */
    static isBase58(data: string, network: (Network | NetworkType) | null): boolean;
    /**
     * Test whether a buffer has a valid network prefix.
     * @param {Buffer} data
     * @param {(Network|NetworkType)?} network
     * @returns {NetworkType}
     */
    static isRaw(data: Buffer, network: (Network | NetworkType) | null): NetworkType;
    /**
     * Instantiate an HD public key from a base58 string.
     * @param {Base58String} xkey
     * @param {Network?} network
     * @returns {HDPublicKey}
     */
    static fromBase58(xkey: Base58String, network: Network | null): HDPublicKey;
    /**
     * Instantiate key from serialized data.
     * @param {BufferReader} br
     * @param {(Network|NetworkType)?} network
     * @returns {HDPublicKey}
     */
    static fromReader(br: BufferReader, network: (Network | NetworkType) | null): HDPublicKey;
    /**
     * Instantiate key from serialized data.
     * @param {Buffer} data
     * @param {(Network|NetworkType)?} network
     * @returns {HDPublicKey}
     */
    static fromRaw(data: Buffer, network: (Network | NetworkType) | null): HDPublicKey;
    /**
     * Test whether an object is a HDPublicKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isHDPublicKey(obj: any): boolean;
    /**
     * Create an HD public key.
     * @constructor
     * @param {Object|Base58String} options
     * @param {Base58String?} options.xkey - Serialized base58 key.
     * @param {Number?} options.depth
     * @param {Number?} options.parentFingerPrint
     * @param {Number?} options.childIndex
     * @param {Buffer?} options.chainCode
     * @param {Buffer?} options.publicKey
     */
    constructor(options: any | Base58String);
    depth: number;
    parentFingerPrint: number;
    childIndex: number;
    chainCode: any;
    publicKey: any;
    fingerPrint: number;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Get HD public key (self).
     * @returns {HDPublicKey}
     */
    toPublic(): HDPublicKey;
    /**
     * Get cached base58 xprivkey (always null here).
     * @returns {null}
     */
    xprivkey(network: any): null;
    /**
     * Get cached base58 xpubkey.
     * @returns {Base58String}
     */
    xpubkey(network: any): Base58String;
    /**
     * Destroy the key (zeroes chain code and pubkey).
     */
    destroy(): void;
    /**
     * Derive a child key.
     * @param {Number} index - Derivation index.
     * @param {Boolean?} hardened - Whether the derivation
     * should be hardened (throws if true).
     * @returns {HDPrivateKey}
     * @throws on `hardened`
     */
    derive(index: number, hardened: boolean | null): HDPrivateKey;
    /**
     * Unique HD key ID.
     * @private
     * @param {Number} index
     * @returns {String}
     */
    private getID;
    /**
     * Derive a BIP44 account key (does not derive, only ensures account key).
     * @method
     * @param {Number} purpose
     * @param {Number} type
     * @param {Number} account
     * @returns {HDPublicKey}
     * @throws Error if key is not already an account key.
     */
    deriveAccount(purpose: number, type: number, account: number): HDPublicKey;
    /**
     * Test whether the key is a master key.
     * @method
     * @returns {Boolean}
     */
    isMaster(): boolean;
    /**
     * Test whether the key is (most likely) a BIP44 account key.
     * @method
     * @param {Number?} account
     * @returns {Boolean}
     */
    isAccount(account: number | null): boolean;
    /**
     * Derive a key from a derivation path.
     * @param {String} path
     * @returns {HDPublicKey}
     * @throws Error if `path` is not a valid path.
     * @throws Error if hardened.
     */
    derivePath(path: string): HDPublicKey;
    /**
     * Compare a key against an object.
     * @param {Object} obj
     * @returns {Boolean}
     */
    equals(obj: any): boolean;
    /**
     * Compare a key against an object.
     * @param {Object} obj
     * @returns {Boolean}
     */
    compare(key: any): boolean;
    /**
     * Convert key to a more json-friendly object.
     * @returns {Object}
     */
    toJSON(network: any): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @param {Network?} network
     */
    private fromJSON;
    /**
     * Inject properties from a base58 key.
     * @private
     * @param {Base58String} xkey
     * @param {Network?} network
     */
    private fromBase58;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {BufferReader} br
     * @param {(Network|NetworkType)?} network
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @param {(Network|NetworkType)?} network
     */
    private fromRaw;
    /**
     * Serialize key data to base58 extended key.
     * @param {(Network|NetworkType)?} network
     * @returns {Base58String}
     */
    toBase58(network: (Network | NetworkType) | null): Base58String;
    /**
     * Write the key to a buffer writer.
     * @param {BufferWriter} bw
     * @param {(Network|NetworkType)?} network
     */
    toWriter(bw: BufferWriter, network: (Network | NetworkType) | null): BufferWriter;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the key.
     * @param {(Network|NetworkType)?} network
     * @returns {Buffer}
     */
    toRaw(network: (Network | NetworkType) | null): Buffer;
}
import Network = require("../protocol/network");
//# sourceMappingURL=public.d.ts.map