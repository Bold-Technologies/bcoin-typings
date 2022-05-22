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
     * @param {WalletDB} data
     * @param {Buffer} data
     * @returns {Account}
     */
    static fromRaw(wdb: any, data: WalletDB): Account;
    /**
     * Test an object to see if it is a Account.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isAccount(obj: any): boolean;
    /**
     * Create an account.
     * @constructor
     * @param {Object} options
     */
    constructor(wdb: any, options: any);
    wdb: any;
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
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    addSharedKey(b: any, key: typeof import("../hd/public")): Promise<any>;
    /**
     * Ensure accounts are not sharing keys.
     * @private
     * @returns {Promise}
     */
    private hasDuplicate;
    /**
     * Remove a public account key from the account (multisig).
     * Remove the key from the wallet database.
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    removeSharedKey(b: any, key: typeof import("../hd/public")): Promise<any>;
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
     * @param {Boolean} change
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createKey(b: any, branch: any): Promise<any>;
    receive: WalletKey;
    change: WalletKey;
    nested: WalletKey;
    /**
     * Derive a receiving address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    deriveReceive(index: number, master: any): WalletKey;
    /**
     * Derive a change address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    deriveChange(index: number, master: any): WalletKey;
    /**
     * Derive a nested address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    deriveNested(index: number, master: any): WalletKey;
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
     * @returns {WalletKey}
     */
    deriveKey(branch: number, index: number, master: any): WalletKey;
    /**
     * Save the account to the database. Necessary
     * when address depth and keys change.
     * @returns {Promise}
     */
    save(b: any): Promise<any>;
    /**
     * Save addresses to path map.
     * @param {WalletKey[]} rings
     * @returns {Promise}
     */
    saveKey(b: any, ring: any): Promise<any>;
    /**
     * Save paths to path map.
     * @param {Path[]} rings
     * @returns {Promise}
     */
    savePath(b: any, path: any): Promise<any>;
    /**
     * Initialize address depths (including lookahead).
     * @returns {Promise}
     */
    initDepth(b: any): Promise<any>;
    /**
     * Allocate new lookahead addresses if necessary.
     * @param {Number} receiveDepth
     * @param {Number} changeDepth
     * @param {Number} nestedDepth
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    syncDepth(b: any, receive: any, change: any, nested: any): Promise<any>;
    /**
     * Allocate new lookahead addresses.
     * @param {Number} lookahead
     * @returns {Promise}
     */
    setLookahead(b: any, lookahead: number): Promise<any>;
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