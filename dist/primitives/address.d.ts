export = Address;
/**
 * Address
 * Represents an address.
 * @alias module:primitives.Address
 * @property {Buffer} hash
 * @property {AddressPrefix} type
 * @property {Number} version
 */
declare class Address {
    /**
     * Insantiate address from options.
     * @param {Object} options
     * @returns {Address}
     */
    static fromOptions(options: any, network: any): Address;
    /**
     * Instantiate address from string.
     * @param {String} addr
     * @param {(Network|NetworkType)?} network
     * @returns {Address}
     */
    static fromString(addr: string, network: (Network | NetworkType) | null): Address;
    /**
     * Create an address object from a serialized address.
     * @param {Buffer} data
     * @returns {Address}
     * @throws Parse error.
     */
    static fromRaw(data: Buffer, network: any): Address;
    /**
     * Create an address object from a base58 address.
     * @param {AddressString} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    static fromBase58(data: AddressString, network: Network | null): Address;
    /**
     * Create an address object from a bech32 address.
     * @param {String} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    static fromBech32(data: string, network: Network | null): Address;
    /**
     * Create an address object from a bech32m address.
     * @param {String} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    static fromBech32m(data: string, network: Network | null): Address;
    /**
     * Create an Address from a witness.
     * Attempt to extract address
     * properties from a witness.
     * @param {Witness}
     * @returns {Address|null}
     */
    static fromWitness(witness: any): Address | null;
    /**
     * Create an Address from an input script.
     * Attempt to extract address
     * properties from an input script.
     * @param {Script}
     * @returns {Address|null}
     */
    static fromInputScript(script: any): Address | null;
    /**
     * Create an Address from an output script.
     * Parse an output script and extract address
     * properties. Converts pubkey and multisig
     * scripts to pubkeyhash and scripthash addresses.
     * @param {Script}
     * @returns {Address|null}
     */
    static fromScript(script: any): Address | null;
    /**
     * Create a naked address from hash/type/version.
     * @param {Hash} hash
     * @param {AddressPrefix} type
     * @param {Number} [version=-1]
     * @returns {Address}
     * @throws on bad hash size
     */
    static fromHash(hash: Hash, type: AddressPrefix, version?: number): Address;
    /**
     * Instantiate address from pubkeyhash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    static fromPubkeyhash(hash: Buffer): Address;
    /**
     * Instantiate address from scripthash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    static fromScripthash(hash: Buffer): Address;
    /**
     * Instantiate address from witness pubkeyhash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    static fromWitnessPubkeyhash(hash: Buffer): Address;
    /**
     * Instantiate address from witness scripthash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    static fromWitnessScripthash(hash: Buffer): Address;
    /**
     * Instantiate address from witness program.
     * @param {Number} version
     * @param {Buffer} hash
     * @returns {Address}
     */
    static fromProgram(version: number, hash: Buffer): Address;
    /**
     * Get the hash of a base58 address or address-related object.
     * @param {String|Address|Hash} data
     * @param {String?} enc - Can be `"hex"` or `null`.
     * @returns {Hash}
     */
    static getHash(data: string | Address | Hash, enc: string | null): Hash;
    /**
     * Get an address type for a specified network address prefix.
     * @param {Number} prefix
     * @param {Network} network
     * @returns {AddressType}
     */
    static getType(prefix: number, network: Network): AddressType;
    /**
     * Create an address.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null, network: any);
    type: number;
    version: number;
    hash: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Get the address hash.
     * @param {String?} enc - Can be `"hex"` or `null`.
     * @returns {Hash|Buffer}
     */
    getHash(enc: string | null): Hash | Buffer;
    /**
     * Test whether the address is null.
     * @returns {Boolean}
     */
    isNull(): boolean;
    /**
     * Test equality against another address.
     * @param {Address} addr
     * @returns {Boolean}
     */
    equals(addr: Address): boolean;
    /**
     * Get the address type as a string.
     * @returns {String}
     */
    getType(): string;
    /**
     * Get prefix for indexers
     * It's a single byte encoded as follows:
     *  1 bit whether it's legacy or witness.
     *  7 bits used for the data.
     * @param {Network|String} network
     * @returns {Number}
     */
    getPrefix(network: Network | string): number;
    /**
     * Get a network address prefix for the address.
     * @param {Network?} network
     * @returns {Number}
     */
    getBase58Prefix(network: Network | null): number;
    /**
     * Calculate size of serialized address.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Compile the address object to its raw serialization.
     * @param {{NetworkType|Network)?} network
     * @returns {Buffer}
     * @throws Error on bad hash/prefix.
     */
    toRaw(network: any): Buffer;
    /**
     * Compile the address object to a base58 address.
     * @param {{NetworkType|Network)?} network
     * @returns {AddressString}
     * @throws Error on bad hash/prefix.
     */
    toBase58(network: any): AddressString;
    /**
     * Compile the address object to a bech32 address.
     * @param {{NetworkType|Network)?} network
     * @returns {String}
     * @throws Error on bad hash/prefix.
     */
    toBech32(network: any): string;
    /**
     * Compile the address object to a bech32m address.
     * @param {{NetworkType|Network)?} network
     * @returns {String}
     * @throws Error on bad hash/prefix.
     */
    toBech32m(network: any): string;
    /**
     * Inject properties from string.
     * @private
     * @param {String} addr
     * @param {(Network|NetworkType)?} network
     * @returns {Address}
     */
    private fromString;
    /**
     * Convert the Address to a string.
     * @param {(Network|NetworkType)?} network
     * @returns {AddressString}
     */
    toString(network: (Network | NetworkType) | null): AddressString;
    /**
     * Decode base58.
     * @private
     * @param {Buffer} data
     * @throws Parse error
     */
    private fromRaw;
    /**
     * Inject properties from base58 address.
     * @private
     * @param {AddressString} data
     * @param {Network?} network
     * @throws Parse error
     */
    private fromBase58;
    /**
     * Inject properties from bech32 address.
     * @private
     * @param {String} data
     * @param {Network?} network
     * @throws Parse error
     */
    private fromBech32;
    /**
     * Inject properties from bech32m address.
     * @private
     * @param {String} data
     * @param {Network?} network
     * @throws Parse error
     */
    private fromBech32m;
    /**
     * Inject properties from output script.
     * @private
     * @param {Script} script
     */
    private fromScript;
    /**
     * Inject properties from witness.
     * @private
     * @param {Witness} witness
     */
    private fromWitness;
    /**
     * Inject properties from input script.
     * @private
     * @param {Script} script
     */
    private fromInputScript;
    /**
     * Inject properties from a hash.
     * @private
     * @param {Buffer|Hash} hash
     * @param {AddressPrefix} type
     * @param {Number} [version=-1]
     * @throws on bad hash size
     */
    private fromHash;
    /**
     * Inject properties from pubkeyhash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    private fromPubkeyhash;
    /**
     * Inject properties from scripthash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    private fromScripthash;
    /**
     * Inject properties from witness pubkeyhash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    private fromWitnessPubkeyhash;
    /**
     * Inject properties from witness scripthash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    private fromWitnessScripthash;
    /**
     * Inject properties from witness program.
     * @private
     * @param {Number} version
     * @param {Buffer} hash
     * @returns {Address}
     */
    private fromProgram;
    /**
     * Test whether the address is pubkeyhash.
     * @returns {Boolean}
     */
    isPubkeyhash(): boolean;
    /**
     * Test whether the address is scripthash.
     * @returns {Boolean}
     */
    isScripthash(): boolean;
    /**
     * Test whether the address is witness pubkeyhash.
     * @returns {Boolean}
     */
    isWitnessPubkeyhash(): boolean;
    /**
     * Test whether the address is witness scripthash.
     * @returns {Boolean}
     */
    isWitnessScripthash(): boolean;
    /**
     * Test whether the address is a witness program.
     * @returns {Boolean}
     */
    isProgram(): boolean;
}
declare namespace Address {
    namespace types {
        const PUBKEYHASH: number;
        const SCRIPTHASH: number;
        const WITNESS: number;
    }
    /**
     * Address types.
     */
    type types = number;
    const typesByVal: string[];
}
import Network = require("../protocol/network");
//# sourceMappingURL=address.d.ts.map