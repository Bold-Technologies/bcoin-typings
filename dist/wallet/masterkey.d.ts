export = MasterKey;
/**
 * Master Key
 * Master BIP32 key which can exist
 * in a timed out encrypted state.
 * @alias module:wallet.MasterKey
 */
declare class MasterKey {
    /**
     * Instantiate master key from options.
     * @returns {MasterKey}
     */
    static fromOptions(options: any): MasterKey;
    /**
     * Instantiate master key from serialized data.
     * @returns {MasterKey}
     */
    static fromReader(br: any): MasterKey;
    /**
     * Instantiate master key from serialized data.
     * @returns {MasterKey}
     */
    static fromRaw(raw: any): MasterKey;
    /**
     * Instantiate master key from an HDPrivateKey.
     * @param {HDPrivateKey} key
     * @param {Mnemonic?} mnemonic
     * @returns {MasterKey}
     */
    static fromKey(key: HDPrivateKey, mnemonic: Mnemonic | null): MasterKey;
    /**
     * Test whether an object is a MasterKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isMasterKey(obj: any): boolean;
    /**
     * Create a master key.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    encrypted: boolean;
    iv: any;
    ciphertext: any;
    key: any;
    mnemonic: any;
    alg: number;
    n: number;
    r: number;
    p: number;
    aesKey: any;
    timer: number;
    until: number;
    locker: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    rounds: any;
    /**
     * Decrypt the key and set a timeout to destroy decrypted data.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Number} [timeout=60000] timeout in ms.
     * @returns {Promise} - Returns {@link HDPrivateKey}.
     */
    unlock(passphrase: Buffer | string, timeout?: number): Promise<any>;
    /**
     * Decrypt the key without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Number} [timeout=60000] timeout in ms.
     * @returns {Promise} - Returns {@link HDPrivateKey}.
     */
    private _unlock;
    /**
     * Start the destroy timer.
     * @private
     * @param {Number} [timeout=60] timeout in seconds.
     */
    private start;
    /**
     * Stop the destroy timer.
     * @private
     */
    private stop;
    /**
     * Derive an aes key based on params.
     * @param {String|Buffer} passwd
     * @returns {Promise}
     */
    derive(passwd: string | Buffer): Promise<any>;
    /**
     * Encrypt data with in-memory aes key.
     * @param {Buffer} data
     * @param {Buffer} iv
     * @returns {Buffer}
     */
    encipher(data: Buffer, iv: Buffer): Buffer;
    /**
     * Decrypt data with in-memory aes key.
     * @param {Buffer} data
     * @param {Buffer} iv
     * @returns {Buffer}
     */
    decipher(data: Buffer, iv: Buffer): Buffer;
    /**
     * Destroy the key by zeroing the
     * privateKey and chainCode. Stop
     * the timer if there is one.
     * @returns {Promise}
     */
    lock(): Promise<any>;
    /**
     * Destroy the key by zeroing the
     * privateKey and chainCode. Stop
     * the timer if there is one.
     */
    _lock(): void;
    /**
     * Destroy the key permanently.
     */
    destroy(): Promise<void>;
    /**
     * Decrypt the key permanently.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Boolean?} clean
     * @returns {Promise}
     */
    decrypt(passphrase: Buffer | string, clean: boolean | null): Promise<any>;
    /**
     * Decrypt the key permanently without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Boolean?} clean
     * @returns {Promise}
     */
    private _decrypt;
    /**
     * Encrypt the key permanently.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Boolean?} clean
     * @returns {Promise}
     */
    encrypt(passphrase: Buffer | string, clean: boolean | null): Promise<any>;
    /**
     * Encrypt the key permanently without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Boolean?} clean
     * @returns {Promise}
     */
    private _encrypt;
    /**
     * Calculate key serialization size.
     * @returns {Number}
     */
    keySize(): number;
    /**
     * Serialize key and menmonic to a single buffer.
     * @returns {Buffer}
     */
    writeKey(): Buffer;
    /**
     * Inject properties from serialized key.
     * @param {Buffer} data
     */
    readKey(data: Buffer): MasterKey;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the key in the form of:
     * `[enc-flag][iv?][ciphertext?][extended-key?]`
     * @returns {Buffer}
     */
    toWriter(bw: any): Buffer;
    /**
     * Serialize the key in the form of:
     * `[enc-flag][iv?][ciphertext?][extended-key?]`
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} raw
     */
    private fromRaw;
    /**
     * Inject properties from an HDPrivateKey.
     * @private
     * @param {HDPrivateKey} key
     * @param {Mnemonic?} mnemonic
     */
    private fromKey;
    /**
     * Convert master key to a jsonifiable object.
     * @param {Network?} network
     * @param {Boolean?} unsafe - Whether to include
     * the key data in the JSON.
     * @returns {Object}
     */
    toJSON(network: Network, unsafe: boolean | null): any;
}
declare namespace MasterKey {
    const SALT: any;
    namespace alg {
        const PBKDF2: number;
        const SCRYPT: number;
    }
    /**
     * *
     */
    type alg = number;
    /**
     * *
     */
    type algByVal = string;
    const algByVal: string[];
}
import HDPrivateKey = require("../hd/private");
import Mnemonic = require("../hd/mnemonic");
//# sourceMappingURL=masterkey.d.ts.map