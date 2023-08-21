export = Account;
/**
 * Account
 * Represents a BIP44 Account belonging to a {@link Wallet}.
 * Note that this object does not enforce locks. Any method
 * that does a write is internal API only and will lead
 * to race conditions if used elsewhere.
 * @alias module:wallet.Account
 */
declare class Account {
    /**
     * Instantiate account from options.
     * @param {WalletDB} wdb
     * @param {Object} options
     * @returns {Account}
     */
    static fromOptions(wdb: WalletDB, options: any): Account;
    /**
     * Instantiate a account from serialized data.
     * @param {WalletDB} wdb
     * @param {Buffer} data
     * @returns {Account}
     */
    static fromRaw(wdb: WalletDB, data: Buffer): Account;
    /**
     * Test an object to see if it is a Account.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isAccount(obj: any): boolean;
    /**
     * Create an account.
     * @constructor
     * @param {WalletDB} wdb
     * @param {Object} options
     */
    constructor(wdb: WalletDB, options: any);
    wdb: WalletDB;
    network: any;
    wid: number;
    id: any;
    accountIndex: number;
    name: any;
    initialized: boolean;
    witness: boolean;
    watchOnly: boolean;
    type: number;
    m: number;
    n: number;
    receiveDepth: number;
    changeDepth: number;
    nestedDepth: number;
    lookahead: number;
    accountKey: any;
    keys: any[];
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Attempt to intialize the account (generating
     * the first addresses along with the lookahead
     * addresses). Called automatically from the
     * walletdb.
     * @returns {Promise}
     */
    init(b: any): Promise<any>;
    /**
     * Add a public account key to the account (multisig).
     * Does not update the database.
     * @param {HDPublicKey} key - Account (bip44)
     * key (can be in base58 form).
     * @throws Error on non-hdkey/non-accountkey.
     */
    pushKey(key: typeof import("../hd/public")): boolean;
    /**
     * Remove a public account key to the account (multisig).
     * Does not update the database.
     * @param {HDPublicKey} key - Account (bip44)
     * key (can be in base58 form).
     * @throws Error on non-hdkey/non-accountkey.
     */
    spliceKey(key: typeof import("../hd/public")): boolean;
    /**
     * Add a public account key to the account (multisig).
     * Saves the key in the wallet database.
     * @param {Batch} b
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    addSharedKey(b: Batch, key: typeof import("../hd/public")): Promise<any>;
    /**
     * Ensure accounts are not sharing keys.
     * @private
     * @returns {Promise}
     */
    private hasDuplicate;
    /**
     * Remove a public account key from the account (multisig).
     * Remove the key from the wallet database.
     * @param {Batch} b
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    removeSharedKey(b: Batch, key: typeof import("../hd/public")): Promise<any>;
    /**
     * Create a new receiving address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    createReceive(b: any): Promise<any>;
    /**
     * Create a new change address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    createChange(b: any): Promise<any>;
    /**
     * Create a new change address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    createNested(b: any): Promise<any>;
    /**
     * Create a new address (increments depth).
     * @param {Batch} b
     * @param {Number} branch
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createKey(b: Batch, branch: number): Promise<any>;
    receive: WalletKey;
    change: WalletKey;
    nested: WalletKey;
    /**
     * Derive a receiving address at `index`. Do not increment depth.
     * @param {Number} index
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    deriveReceive(index: number, master: MasterKey): WalletKey;
    /**
     * Derive a change address at `index`. Do not increment depth.
     * @param {Number} index
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    deriveChange(index: number, master: MasterKey): WalletKey;
    /**
     * Derive a nested address at `index`. Do not increment depth.
     * @param {Number} index
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    deriveNested(index: number, master: MasterKey): WalletKey;
    /**
     * Derive an address from `path` object.
     * @param {Path} path
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    derivePath(path: Path, master: MasterKey): WalletKey;
    /**
     * Derive an address at `index`. Do not increment depth.
     * @param {Number} branch
     * @param {Number} index
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    deriveKey(branch: number, index: number, master: MasterKey): WalletKey;
    /**
     * Save the account to the database. Necessary
     * when address depth and keys change.
     * @returns {Promise}
     */
    save(b: any): Promise<any>;
    /**
     * Save addresses to path map.
     * @param {Batch} b
     * @param {WalletKey} ring
     * @returns {Promise}
     */
    saveKey(b: Batch, ring: WalletKey): Promise<any>;
    /**
     * Save paths to path map.
     * @param {Batch} b
     * @param {Path} path
     * @returns {Promise}
     */
    savePath(b: Batch, path: Path): Promise<any>;
    /**
     * Initialize address depths (including lookahead).
     * @returns {Promise}
     */
    initDepth(b: any): Promise<any>;
    /**
     * Allocate new lookahead addresses if necessary.
     * @param {Batch} b
     * @param {Number} receive
     * @param {Number} change
     * @param {Number} nested
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    syncDepth(b: Batch, receive: number, change: number, nested: number): Promise<any>;
    /**
     * Allocate new lookahead addresses.
     * @param {Batch} b
     * @param {Number} lookahead
     * @returns {Promise}
     */
    setLookahead(b: Batch, lookahead: number): Promise<any>;
    /**
     * Get current receive key.
     * @returns {WalletKey}
     */
    receiveKey(): WalletKey;
    /**
     * Get current change key.
     * @returns {WalletKey}
     */
    changeKey(): WalletKey;
    /**
     * Get current nested key.
     * @returns {WalletKey}
     */
    nestedKey(): WalletKey;
    /**
     * Get current receive address.
     * @returns {Address}
     */
    receiveAddress(): Address;
    /**
     * Get current change address.
     * @returns {Address}
     */
    changeAddress(): Address;
    /**
     * Get current nested address.
     * @returns {Address}
     */
    nestedAddress(): Address;
    /**
     * Convert the account to an object suitable for
     * serialization.
     * @returns {Object}
     */
    toJSON(balance: any): any;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the account.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {Object}
     */
    private fromRaw;
}
declare namespace Account {
    namespace types {
        const PUBKEYHASH: number;
        const MULTISIG: number;
    }
    /**
     * *
     */
    type types = number;
    const typesByVal: string[];
    const MAX_LOOKAHEAD: number;
}
import WalletKey = require("./walletkey");
import Path = require("./path");
//# sourceMappingURL=account.d.ts.map