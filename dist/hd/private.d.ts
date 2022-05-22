export = HDPrivateKey;
/**
 * HDPrivateKey
 * @alias module:hd.PrivateKey
 * @property {Number} depth
 * @property {Number} parentFingerPrint
 * @property {Number} childIndex
 * @property {Buffer} chainCode
 * @property {Buffer} privateKey
 */
declare class HDPrivateKey {
    /**
     * Instantiate HD private key from options object.
     * @param {Object} options
     * @returns {HDPrivateKey}
     */
    static fromOptions(options: any): HDPrivateKey;
    /**
     * Test whether an object is in the form of a base58 xprivkey.
     * @param {String} data
     * @param {Network?} network
     * @returns {Boolean}
     */
    static isBase58(data: string, network: Network | null): boolean;
    /**
     * Test whether a buffer has a valid network prefix.
     * @param {Buffer} data
     * @param {Network?} network
     * @returns {Boolean}
     */
    static isRaw(data: Buffer, network: Network | null): boolean;
    /**
     * Test whether a string is a valid path.
     * @param {String} path
     * @returns {Boolean}
     */
    static isValidPath(path: string): boolean;
    /**
     * Instantiate an hd private key from a 512 bit seed.
     * @param {Buffer} seed
     * @returns {HDPrivateKey}
     */
    static fromSeed(seed: Buffer): HDPrivateKey;
    /**
     * Instantiate an hd private key from a mnemonic.
     * @param {Mnemonic} mnemonic
     * @param {String?} passphrase
     * @returns {HDPrivateKey}
     */
    static fromMnemonic(mnemonic: Mnemonic, passphrase: string | null): HDPrivateKey;
    /**
     * Instantiate an hd private key from a phrase.
     * @param {String} phrase
     * @returns {HDPrivateKey}
     */
    static fromPhrase(phrase: string): HDPrivateKey;
    /**
     * Create an hd private key from a key and entropy bytes.
     * @param {Buffer} key
     * @param {Buffer} entropy
     * @returns {HDPrivateKey}
     */
    static fromKey(key: Buffer, entropy: Buffer): HDPrivateKey;
    /**
     * Generate an hd private key.
     * @returns {HDPrivateKey}
     */
    static generate(): HDPrivateKey;
    /**
     * Instantiate an HD private key from a base58 string.
     * @param {Base58String} xkey
     * @param {Network?} network
     * @returns {HDPrivateKey}
     */
    static fromBase58(xkey: Base58String, network: Network | null): HDPrivateKey;
    /**
     * Instantiate key from buffer reader.
     * @param {BufferReader} br
     * @param {(Network|NetworkType)?} network
     * @returns {HDPrivateKey}
     */
    static fromReader(br: BufferReader, network: (Network | NetworkType) | null): HDPrivateKey;
    /**
     * Instantiate key from serialized data.
     * @param {Buffer} data
     * @param {(Network|NetworkType)?} network
     * @returns {HDPrivateKey}
     */
    static fromRaw(data: Buffer, network: (Network | NetworkType) | null): HDPrivateKey;
    /**
     * Instantiate an HDPrivateKey from a jsonified key object.
     * @param {Object} json - The jsonified key object.
     * @param {Network?} network
     * @returns {HDPrivateKey}
     */
    static fromJSON(json: any, network: Network | null): HDPrivateKey;
    /**
     * Test whether an object is an HDPrivateKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isHDPrivateKey(obj: any): boolean;
    /**
     * Create an hd private key.
     * @constructor
     * @param {Object|String} options
     * @param {Number?} options.depth
     * @param {Number?} options.parentFingerPrint
     * @param {Number?} options.childIndex
     * @param {Buffer?} options.chainCode
     * @param {Buffer?} options.privateKey
     */
    constructor(options: any | string);
    depth: number;
    parentFingerPrint: number;
    childIndex: number;
    chainCode: any;
    privateKey: any;
    publicKey: any;
    fingerPrint: number;
    _hdPublicKey: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Get HD public key.
     * @returns {HDPublicKey}
     */
    toPublic(): HDPublicKey;
    /**
     * Get cached base58 xprivkey.
     * @returns {Base58String}
     */
    xprivkey(network: any): Base58String;
    /**
     * Get cached base58 xpubkey.
     * @returns {Base58String}
     */
    xpubkey(network: any): Base58String;
    /**
     * Destroy the key (zeroes chain code, privkey, and pubkey).
     * @param {Boolean} pub - Destroy hd public key as well.
     */
    destroy(pub: boolean): void;
    /**
     * Derive a child key.
     * @param {Number} index - Derivation index.
     * @param {Boolean?} hardened - Whether the derivation should be hardened.
     * @returns {HDPrivateKey}
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
     * Derive a BIP44 account key.
     * @param {Number} purpose
     * @param {Number} type
     * @param {Number} account
     * @returns {HDPrivateKey}
     * @throws Error if key is not a master key.
     */
    deriveAccount(purpose: number, type: number, account: number): HDPrivateKey;
    /**
     * Test whether the key is a master key.
     * @returns {Boolean}
     */
    isMaster(): boolean;
    /**
     * Test whether the key is (most likely) a BIP44 account key.
     * @param {Number?} account
     * @returns {Boolean}
     */
    isAccount(account: number | null): boolean;
    /**
     * Derive a key from a derivation path.
     * @param {String} path
     * @returns {HDPrivateKey}
     * @throws Error if `path` is not a valid path.
     */
    derivePath(path: string): HDPrivateKey;
    /**
     * Compare a key against an object.
     * @param {Object} obj
     * @returns {Boolean}
     */
    equals(obj: any): boolean;
    /**
     * Compare a key against an object.
     * @param {Object} key
     * @returns {Boolean}
     */
    compare(key: any): boolean;
    /**
     * Inject properties from seed.
     * @private
     * @param {Buffer} seed
     */
    private fromSeed;
    /**
     * Inject properties from a mnemonic.
     * @private
     * @param {Mnemonic} mnemonic
     * @param {String?} passphrase
     */
    private fromMnemonic;
    /**
     * Inject properties from a mnemonic.
     * @private
     * @param {String} phrase
     */
    private fromPhrase;
    /**
     * Inject properties from privateKey and entropy.
     * @private
     * @param {Buffer} key
     * @param {Buffer} entropy
     */
    private fromKey;
    /**
     * Inject properties from base58 key.
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
     * Serialize key to a base58 string.
     * @param {(Network|NetworkType)?} network
     * @returns {Base58String}
     */
    toBase58(network: (Network | NetworkType) | null): Base58String;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Write the key to a buffer writer.
     * @param {BufferWriter} bw
     * @param {(Network|NetworkType)?} network
     */
    toWriter(bw: BufferWriter, network: (Network | NetworkType) | null): BufferWriter;
    /**
     * Serialize the key.
     * @param {(Network|NetworkType)?} network
     * @returns {Buffer}
     */
    toRaw(network: (Network | NetworkType) | null): Buffer;
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
}
import HDPublicKey = require("./public");
import Network = require("../protocol/network");
import Mnemonic = require("./mnemonic");
//# sourceMappingURL=private.d.ts.map