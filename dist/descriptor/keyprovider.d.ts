export = KeyProvider;
/**
 * KeyProvider
 * Base class for key object in a descriptor.
 * @alias module:descriptor.KeyProvider
 * @property {KeyRing} ring
 * @property {Network} network
 * @property {KeyOriginInfo} originInfo - key origin information
 * @property {String} hardenedMarker - hardened marker for derivation path
 * default is `h`
 */
declare class KeyProvider {
    /**
     * Instantiate KeyProvider from string.
     * @param {String} keyExpr
     * @param {Network} network
     * @param {String?} context script context
     * @returns {ConstKeyProvider|HDKeyProvider}
     */
    static fromString(keyExpr: string, network: Network, context?: string | null): ConstKeyProvider | HDKeyProvider;
    ring: any;
    network: Network;
    originInfo: any;
    hardenedMarker: string;
    parseOptions(options: any): void;
    /**
     * Get the key object.
     * @param {String} keyString
     * @param {String?} context - script context
     * @returns {ConstKeyProvider|HDKeyProvider}
     */
    _parseKey(keyString: string, context: string | null): ConstKeyProvider | HDKeyProvider;
    /**
     * Get the parsed key object including the key origin info
     * (if available)
     * @param {String} keyExpr
     * @param {String?} context script context
     * @returns {ConstKeyProvider|HDKeyProvider}
     * @throws parse error
     */
    parseKey(keyExpr: string, context: string | null): ConstKeyProvider | HDKeyProvider;
    /**
     * Inject properties from string
     * @param {String} keyExpr
     * @param {Network} network
     * @param {String?} context script context
     * @returns {ConstKeyProvider|HDKeyProvider}
     */
    fromString(keyExpr: string, network: Network, context: string | null): ConstKeyProvider | HDKeyProvider;
    /**
     * Get the string form of the origin info path (if available)
     * @returns {String}
     */
    getOriginString(): string;
    /**
     * Test whether this represent multiple keys at different positions
     * @returns {Boolean}
     */
    isRange(): boolean;
    /**
     * Get the size of the generated public key(s) in bytes
     * @returns {Number} 33 or 65
     */
    getSize(): number;
    /**
     * Get the string form of the public key
     * @returns {String}
     */
    toString(): string;
    /**
     * Get the string form of the private key (if available)
     * @returns {String}
     */
    toPrivateString(): string;
    /**
     * Test whether this key provider has private key
     * @returns {Boolean}
     */
    hasPrivateKey(): boolean;
    /**
     * Get the public key
     * @returns {Buffer}
     */
    getPublicKey(): Buffer;
    /**
     * Get the private key (if available)
     * @returns {Buffer}
     */
    getPrivateKey(): Buffer;
}
import Network = require("../protocol/network");
/**
 * ConstKeyProvider
 * Represents a non-hd key object with origin info (if any) in a descriptor
 * @extends KeyProvider
 */
declare class ConstKeyProvider extends KeyProvider {
    /**
     * Instantiate ConstKeyProvider from options object.
     * @param {Object} options
     * @returns {ConstKeyProvider}
     */
    static fromOptions(options: any): ConstKeyProvider;
    constructor(options: any);
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {ConstKeyProvider}
     */
    fromOptions(options: any): ConstKeyProvider;
    getSize(): any;
}
/**
 * HDKeyProvider
 * Represents an hd key object with origin info (if any) in a descriptor
 * @property {HDPublicKey|HDPrivateKey} hdkey
 * @property {Number[]} path - array of derivation indices
 * @property {String} type - derivation type - Normal, Hardened, or Unhardened
 * @extends KeyProvider
 */
declare class HDKeyProvider extends KeyProvider {
    /**
     * Instantiate HDKeyProvider from options object
     * @param {Object} options
     * @returns {HDKeyProvider}
     */
    static fromOptions(options: any): HDKeyProvider;
    constructor(options: any);
    /**
     * Inject properties from options object
     * @param {Object} options
     * @returns {HDKeyProvider}
     */
    fromOptions(options: any): HDKeyProvider;
    hdkey: any;
    path: any;
    type: any;
    /**
     * Test whether the derivation path is normal, hardened, unhardened
     * @returns {Boolean}
     */
    isHardened(): boolean;
    _toString(key: any): string;
    /**
     * Derive private key at a given position..
     * @returns {HDPrivateKey}
     */
    getHDPrivateKey(pos: any): HDPrivateKey;
    /**
     * Derive public key at a given position
     * @param {Number} pos
     * @returns {HDPublicKey}
     */
    getHDPublicKey(pos: number): HDPublicKey;
    /**
     * Get public key at a given position
     * @param {Number} pos
     * @returns {Buffer} public key
     */
    getPublicKey(pos: number): Buffer;
    /**
     * Get private key at a given position
     * @param {Number} pos
     * @returns {Buffer} private key
     */
    getPrivateKey(pos: number): Buffer;
}
//# sourceMappingURL=keyprovider.d.ts.map