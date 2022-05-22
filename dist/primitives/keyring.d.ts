export = KeyRing;
/**
 * Key Ring
 * Represents a key ring which amounts to an address.
 * @alias module:primitives.KeyRing
 */
declare class KeyRing {
    /**
     * Instantiate key ring from options.
     * @param {Object} options
     * @returns {KeyRing}
     */
    static fromOptions(options: any): KeyRing;
    /**
     * Instantiate keyring from a private key.
     * @param {Buffer} key
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    static fromPrivate(key: Buffer, compress: boolean | null): KeyRing;
    /**
     * Generate a keyring.
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    static generate(compress: boolean | null): KeyRing;
    /**
     * Instantiate keyring from a public key.
     * @param {Buffer} key
     * @returns {KeyRing}
     */
    static fromPublic(key: Buffer): KeyRing;
    /**
     * Instantiate keyring from a public key.
     * @param {Buffer} key
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    static fromKey(key: Buffer, compress: boolean | null): KeyRing;
    /**
     * Instantiate keyring from script.
     * @param {Buffer} key
     * @param {Script} script
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    static fromScript(key: Buffer, script: Script, compress: boolean | null): KeyRing;
    /**
     * Instantiate keyring from ith key in multisig script.
     * @param {Script} script
     * @param {Number} i
     * @returns {KeyRing}
     */
    static fromMultisigScript(script: Script, i: number): KeyRing;
    /**
     * Instantiate a keyring from a serialized CBitcoinSecret.
     * @param {Base58String} data
     * @param {(Network|NetworkType)?} network
     * @returns {KeyRing}
     */
    static fromSecret(data: Base58String, network: (Network | NetworkType) | null): KeyRing;
    /**
     * Instantiate an KeyRing from a jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {KeyRing}
     */
    static fromJSON(json: any): KeyRing;
    /**
     * Instantiate a keyring from buffer reader.
     * @param {BufferReader} br
     * @returns {KeyRing}
     */
    static fromReader(br: BufferReader): KeyRing;
    /**
     * Instantiate a keyring from serialized data.
     * @param {Buffer} data
     * @returns {KeyRing}
     */
    static fromRaw(data: Buffer): KeyRing;
    /**
     * Test whether an object is a KeyRing.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isKeyRing(obj: any): boolean;
    /**
     * Create a key ring.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    witness: boolean;
    nested: boolean;
    publicKey: any;
    privateKey: any;
    script: any;
    _keyHash: any;
    _keyAddress: Address;
    _program: Script;
    _nestedHash: any;
    _nestedAddress: Address;
    _scriptHash160: any;
    _scriptHash256: any;
    _scriptAddress: Address;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clear cached key/script hashes.
     */
    refresh(): void;
    /**
     * Inject data from private key.
     * @private
     * @param {Buffer} key
     * @param {Boolean?} compress
     */
    private fromPrivate;
    /**
     * Inject data from public key.
     * @private
     * @param {Buffer} key
     */
    private fromPublic;
    /**
     * Generate a keyring.
     * @private
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    private generate;
    /**
     * Inject data from public key.
     * @private
     * @param {Buffer} key
     * @param {Boolean?} compress
     */
    private fromKey;
    /**
     * Inject data from script.
     * @private
     * @param {Buffer} key
     * @param {Script} script
     * @param {Boolean?} compress
     */
    private fromScript;
    /**
     * Get ith public key from multisig script.
     * @private
     * @param {Script} script
     * @param {Number} i
     * @returns {KeyRing}
     */
    private fromMultisigScript;
    /**
     * Calculate WIF serialization size.
     * @returns {Number}
     */
    getSecretSize(): number;
    /**
     * Convert key to a CBitcoinSecret.
     * @param {(Network|NetworkType)?} network
     * @returns {Base58String}
     */
    toSecret(network: (Network | NetworkType) | null): Base58String;
    /**
     * Inject properties from serialized CBitcoinSecret.
     * @private
     * @param {Base58String} data
     * @param {(Network|NetworkType)?} network
     */
    private fromSecret;
    /**
     * Get private key.
     * @param {String?} enc - Can be `"hex"`, `"base58"`, or `null`.
     * @param {(Network|NetworkType)?} network
     * @returns {Buffer} Private key.
     */
    getPrivateKey(enc: string | null, network: (Network | NetworkType) | null): Buffer;
    /**
     * Get public key.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getPublicKey(enc: string | null): Buffer;
    /**
     * Get redeem script.
     * @returns {Script}
     */
    getScript(): Script;
    /**
     * Get witness program.
     * @returns {Buffer}
     */
    getProgram(): Buffer;
    /**
     * Get address' ripemd160 program scripthash
     * (for witness programs behind a scripthash).
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getNestedHash(enc: string | null): Buffer;
    /**
     * Get address' scripthash address for witness program.
     * @param {String?} enc - `"base58"` or `null`.
     * @param {(Network|NetworkType)?} network
     * @returns {Address|AddressString}
     */
    getNestedAddress(enc: string | null, network: (Network | NetworkType) | null): Address | AddressString;
    /**
     * Get scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getScriptHash(enc: string | null): Buffer;
    /**
     * Get ripemd160 scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getScriptHash160(enc: string | null): Buffer;
    /**
     * Get sha256 scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getScriptHash256(enc: string | null): Buffer;
    /**
     * Get scripthash address.
     * @param {String?} enc - `"base58"` or `null`.
     * @param {(Network|NetworkType)?} network
     * @returns {Address|AddressString}
     */
    getScriptAddress(enc: string | null, network: (Network | NetworkType) | null): Address | AddressString;
    /**
     * Get public key hash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getKeyHash(enc: string | null): Buffer;
    /**
     * Get pubkeyhash address.
     * @param {String?} enc - `"base58"` or `null`.
     * @param {(Network|NetworkType)?} network
     * @returns {Address|AddressString}
     */
    getKeyAddress(enc: string | null, network: (Network | NetworkType) | null): Address | AddressString;
    /**
     * Get hash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    getHash(enc: string | null): Buffer;
    /**
     * Get base58 address.
     * @param {String?} enc - `"base58"` or `null`.
     * @param {(Network|NetworkType)?} network
     * @returns {Address|AddressString}
     */
    getAddress(enc: string | null, network: (Network | NetworkType) | null): Address | AddressString;
    /**
     * Test an address hash against hash and program hash.
     * @param {Buffer} hash
     * @returns {Boolean}
     */
    ownHash(hash: Buffer): boolean;
    /**
     * Check whether transaction output belongs to this address.
     * @param {TX|Output} tx - Transaction or Output.
     * @param {Number?} index - Output index.
     * @returns {Boolean}
     */
    ownOutput(tx: TX | Output, index: number | null): boolean;
    /**
     * Test a hash against script hashes to
     * find the correct redeem script, if any.
     * @param {Buffer} hash
     * @returns {Script|null}
     */
    getRedeem(hash: Buffer): Script | null;
    /**
     * Sign a message.
     * @param {Buffer} msg
     * @returns {Buffer} Signature in DER format.
     */
    sign(msg: Buffer): Buffer;
    /**
     * Verify a message.
     * @param {Buffer} msg
     * @param {Buffer} sig - Signature in DER format.
     * @returns {Boolean}
     */
    verify(msg: Buffer, sig: Buffer): boolean;
    /**
     * Get witness program version.
     * @returns {Number}
     */
    getVersion(): number;
    /**
     * Get address type.
     * @returns {ScriptType}
     */
    getType(): ScriptType;
    /**
     * Convert an KeyRing to a more json-friendly object.
     * @returns {Object}
     */
    toJSON(network: any): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Write the keyring to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize the keyring.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
import Address = require("./address");
import Script = require("../script/script");
import Network = require("../protocol/network");
import Output = require("./output");
//# sourceMappingURL=keyring.d.ts.map