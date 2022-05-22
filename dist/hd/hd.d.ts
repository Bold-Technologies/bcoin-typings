/**
 * Instantiate an HD key (public or private) from an base58 string.
 * @param {Base58String} xkey
 * @param {Network?} network
 * @returns {HDPrivateKey|HDPublicKey}
 */
export function fromBase58(xkey: Base58String, network: Network): HDPrivateKey | HDPublicKey;
/**
 * Generate an {@link HDPrivateKey}.
 * @param {Object} options
 * @param {Buffer?} options.privateKey
 * @param {Buffer?} options.entropy
 * @returns {HDPrivateKey}
 */
export function generate(): HDPrivateKey;
/**
 * Generate an {@link HDPrivateKey} from a seed.
 * @param {Object|Mnemonic|Buffer} options - seed,
 * mnemonic, mnemonic options.
 * @returns {HDPrivateKey}
 */
export function fromSeed(options: any | Mnemonic | Buffer): HDPrivateKey;
/**
 * Instantiate an hd private key from a mnemonic.
 * @param {Mnemonic|Object} mnemonic
 * @returns {HDPrivateKey}
 */
export function fromMnemonic(options: any): HDPrivateKey;
/**
 * Instantiate an HD key from a jsonified key object.
 * @param {Object} json - The jsonified transaction object.
 * @param {Network?} network
 * @returns {HDPrivateKey|HDPublicKey}
 */
export function fromJSON(json: any, network: Network): HDPrivateKey | HDPublicKey;
/**
 * Instantiate an HD key from serialized data.
 * @param {Buffer} data
 * @param {Network?} network
 * @returns {HDPrivateKey|HDPublicKey}
 */
export function fromRaw(data: Buffer, network: Network): HDPrivateKey | HDPublicKey;
/**
 * Generate an hdkey from any number of options.
 * @param {Object|Mnemonic|Buffer} options - mnemonic, mnemonic
 * options, seed, or base58 key.
 * @param {(Network|NetworkType)?} network
 * @returns {HDPrivateKey|HDPublicKey}
 */
export function from(options: any | Mnemonic | Buffer, network: (Network | NetworkType) | null): HDPrivateKey | HDPublicKey;
/**
 * Test whether an object is in the form of a base58 hd key.
 * @param {String} data
 * @param {Network?} network
 * @returns {Boolean}
 */
export function isBase58(data: string, network: Network): boolean;
/**
 * Test whether an object is in the form of a serialized hd key.
 * @param {Buffer} data
 * @param {Network?} network
 * @returns {NetworkType}
 */
export function isRaw(data: Buffer, network: Network): NetworkType;
/**
 * Test whether an object is an HD key.
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isHD(obj: any): boolean;
/**
 * Test whether an object is an HD private key.
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isPrivate(obj: any): boolean;
/**
 * Test whether an object is an HD public key.
 * @param {Object} obj
 * @returns {Boolean}
 */
export function isPublic(obj: any): boolean;
export { common };
export namespace HD {
    export { Mnemonic };
    export { HDPrivateKey as PrivateKey };
    export { HDPublicKey as PublicKey };
    export { HDPrivateKey };
    export { HDPublicKey };
    export { wordlist };
}
import HDPrivateKey = require("./private");
import HDPublicKey = require("./public");
import Mnemonic = require("./mnemonic");
import common = require("./common");
import wordlist = require("./wordlist");
//# sourceMappingURL=hd.d.ts.map