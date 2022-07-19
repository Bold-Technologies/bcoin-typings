export = Wallet;
/**
 * Wallet
 * @alias module:wallet.Wallet
 * @extends EventEmitter
 */
declare class Wallet {
    /**
     * Instantiate wallet from options.
     * @param {WalletDB} wdb
     * @param {Object} options
     * @returns {Wallet}
     */
    static fromOptions(wdb: WalletDB, options: any): Wallet;
    /**
     * Instantiate a wallet from serialized data.
     * @param {Buffer} data
     * @returns {Wallet}
     */
    static fromRaw(wdb: any, data: Buffer): Wallet;
    /**
     * Test an object to see if it is a Wallet.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isWallet(obj: any): boolean;
    /**
     * Create a wallet.
     * @constructor
     * @param {Object} options
     */
    constructor(wdb: any, options: any);
    wdb: any;
    db: any;
    network: any;
    logger: any;
    writeLock: any;
    fundLock: any;
    wid: number;
    id: any;
    watchOnly: boolean;
    accountDepth: number;
    token: any;
    tokenDepth: number;
    master: MasterKey;
    txdb: TXDB;
    maxAncestors: number;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Attempt to intialize the wallet (generating
     * the first addresses along with the lookahead
     * addresses). Called automatically from the
     * walletdb.
     * @returns {Promise}
     */
    init(options: any, passphrase: any): Promise<any>;
    /**
     * Open wallet (done after retrieval).
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the wallet, unregister with the database.
     * @returns {Promise}
     */
    destroy(): Promise<any>;
    /**
     * Add a public account key to the wallet (multisig).
     * Saves the key in the wallet database.
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    addSharedKey(acct: (number | string), key: HDPublicKey): Promise<any>;
    /**
     * Add a public account key to the wallet without a lock.
     * @private
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    private _addSharedKey;
    /**
     * Remove a public account key from the wallet (multisig).
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    removeSharedKey(acct: (number | string), key: HDPublicKey): Promise<any>;
    /**
     * Remove a public account key from the wallet (multisig).
     * @private
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    private _removeSharedKey;
    /**
     * Change or set master key's passphrase.
     * @param {String|Buffer} passphrase
     * @param {String|Buffer} old
     * @returns {Promise}
     */
    setPassphrase(passphrase: string | Buffer, old: string | Buffer): Promise<any>;
    /**
     * Encrypt the wallet permanently.
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    encrypt(passphrase: string | Buffer): Promise<any>;
    /**
     * Encrypt the wallet permanently, without a lock.
     * @private
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    private _encrypt;
    /**
     * Decrypt the wallet permanently.
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    decrypt(passphrase: string | Buffer): Promise<any>;
    /**
     * Decrypt the wallet permanently, without a lock.
     * @private
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    private _decrypt;
    /**
     * Generate a new token.
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    retoken(passphrase: (string | Buffer) | null): Promise<any>;
    /**
     * Generate a new token without a lock.
     * @private
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    private _retoken;
    /**
     * Rename the wallet.
     * @param {String} id
     * @returns {Promise}
     */
    rename(id: string): Promise<any>;
    /**
     * Rename account.
     * @param {(String|Number)?} acct
     * @param {String} name
     * @returns {Promise}
     */
    renameAccount(acct: (string | number) | null, name: string): Promise<any>;
    /**
     * Rename account without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {String} name
     * @returns {Promise}
     */
    private _renameAccount;
    /**
     * Lock the wallet, destroy decrypted key.
     */
    lock(): Promise<void>;
    /**
     * Unlock the key for `timeout` seconds.
     * @param {Buffer|String} passphrase
     * @param {Number?} [timeout=60]
     */
    unlock(passphrase: Buffer | string, timeout?: number | null): Promise<any>;
    /**
     * Generate the wallet ID if none was passed in.
     * It is represented as HASH160(m/44->public|magic)
     * converted to an "address" with a prefix
     * of `0x03be04` (`WLT` in base58).
     * @private
     * @returns {Base58String}
     */
    private getID;
    /**
     * Generate the wallet api key if none was passed in.
     * It is represented as HASH256(m/44'->private|nonce).
     * @private
     * @param {HDPrivateKey} master
     * @param {Number} nonce
     * @returns {Buffer}
     */
    private getToken;
    /**
     * Create an account. Requires passphrase if master key is encrypted.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    createAccount(options: any, passphrase: any): Promise<any>;
    /**
     * Create an account without a lock.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    _createAccount(options: any, passphrase: any): Promise<any>;
    /**
     * Ensure an account. Requires passphrase if master key is encrypted.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    ensureAccount(options: any, passphrase: any): Promise<any>;
    /**
     * List account names and indexes from the db.
     * @returns {Promise} - Returns Array.
     */
    getAccounts(): Promise<any>;
    /**
     * Get all wallet address hashes.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns Array.
     */
    getAddressHashes(acct: (string | number) | null): Promise<any>;
    /**
     * Get all account address hashes.
     * @param {String|Number} acct
     * @returns {Promise} - Returns Array.
     */
    getAccountHashes(acct: string | number): Promise<any>;
    /**
     * Retrieve an account from the database.
     * @param {Number|String} acct
     * @returns {Promise} - Returns {@link Account}.
     */
    getAccount(acct: number | string): Promise<any>;
    /**
     * Lookup the corresponding account name's index.
     * @param {String|Number} acct - Account name/index.
     * @returns {Promise} - Returns Number.
     */
    getAccountIndex(acct: string | number): Promise<any>;
    /**
     * Lookup the corresponding account name's index.
     * @param {String|Number} acct - Account name/index.
     * @returns {Promise} - Returns Number.
     * @throws on non-existent account
     */
    ensureIndex(acct: string | number): Promise<any>;
    /**
     * Lookup the corresponding account index's name.
     * @param {Number} index - Account index.
     * @returns {Promise} - Returns String.
     */
    getAccountName(index: number): Promise<any>;
    /**
     * Test whether an account exists.
     * @param {Number|String} acct
     * @returns {Promise} - Returns {@link Boolean}.
     */
    hasAccount(acct: number | string): Promise<any>;
    /**
     * Create a new receiving address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createReceive(acct?: (number | string) | null): Promise<any>;
    /**
     * Create a new change address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createChange(acct?: (number | string) | null): Promise<any>;
    /**
     * Create a new nested address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createNested(acct?: (number | string) | null): Promise<any>;
    /**
     * Create a new address (increments depth).
     * @param {(Number|String)?} acct
     * @param {Number} branch
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    createKey(acct: (number | string) | null, branch: number): Promise<any>;
    /**
     * Create a new address (increments depth) without a lock.
     * @private
     * @param {(Number|String)?} acct
     * @param {Number} branch
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    private _createKey;
    /**
     * Save the wallet to the database. Necessary
     * when address depth and keys change.
     * @returns {Promise}
     */
    save(b: any): Promise<any>;
    /**
     * Increment the wid depth.
     * @returns {Promise}
     */
    increment(b: any): Promise<any>;
    /**
     * Test whether the wallet possesses an address.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns Boolean.
     */
    hasAddress(address: Address | Hash): Promise<any>;
    /**
     * Get path by address hash.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {@link Path}.
     */
    getPath(address: Address | Hash): Promise<any>;
    /**
     * Get path by address hash (without account name).
     * @private
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {@link Path}.
     */
    private readPath;
    /**
     * Test whether the wallet contains a path.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {Boolean}.
     */
    hasPath(address: Address | Hash): Promise<any>;
    /**
     * Get all wallet paths.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link Path}.
     */
    getPaths(acct: (string | number) | null): Promise<any>;
    /**
     * Get all account paths.
     * @param {String|Number} acct
     * @returns {Promise} - Returns {@link Path}.
     */
    getAccountPaths(acct: string | number): Promise<any>;
    /**
     * Import a keyring (will not exist on derivation chain).
     * Rescanning must be invoked manually.
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    importKey(acct: (string | number) | null, ring: WalletKey, passphrase: (string | Buffer) | null): Promise<any>;
    /**
     * Import a keyring (will not exist on derivation chain) without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    private _importKey;
    /**
     * Import a keyring (will not exist on derivation chain).
     * Rescanning must be invoked manually.
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    importAddress(acct: (string | number) | null, address: any): Promise<any>;
    /**
     * Import a keyring (will not exist on derivation chain) without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    private _importAddress;
    /**
     * Fill a transaction with inputs, estimate
     * transaction size, calculate fee, and add a change output.
     * @see MTX#selectCoins
     * @see MTX#fill
     * @param {MTX} mtx - _Must_ be a mutable transaction.
     * @param {Object?} options
     * @param {(String|Number)?} options.account - If no account is
     * specified, coins from the entire wallet will be filled.
     * @param {String?} options.selection - Coin selection priority. Can
     * be `age`, `random`, or `all`. (default=age).
     * @param {Boolean} options.round - Whether to round to the nearest
     * kilobyte for fee calculation.
     * See {@link TX#getMinFee} vs. {@link TX#getRoundFee}.
     * @param {Rate} options.rate - Rate used for fee calculation.
     * @param {Boolean} options.confirmed - Select only confirmed coins.
     * @param {Boolean} options.free - Do not apply a fee if the
     * transaction priority is high enough to be considered free.
     * @param {Amount?} options.hardFee - Use a hard fee rather than
     * calculating one.
     * @param {Number|Boolean} options.subtractFee - Whether to subtract the
     * fee from existing outputs rather than adding more inputs.
     */
    fund(mtx: typeof MTX, options: any | null, force: any): Promise<void>;
    /**
     * Fill a transaction with inputs without a lock.
     * @private
     * @see MTX#selectCoins
     * @see MTX#fill
     */
    private _fund;
    /**
     * Get account by address.
     * @param {Address} address
     * @returns {Account}
     */
    getAccountByAddress(address: Address): Account;
    /**
     * Build a transaction, fill it with outputs and inputs,
     * sort the members according to BIP69 (set options.sort=false
     * to avoid sorting), set locktime, and template it.
     * @param {Object} options - See {@link Wallet#fund options}.
     * @param {Object[]} options.outputs - See {@link MTX#addOutput}.
     * @param {Boolean} options.sort - Sort inputs and outputs (BIP69).
     * @param {Boolean} options.template - Build scripts for inputs.
     * @param {Number} options.locktime - TX locktime
     * @returns {Promise} - Returns {@link MTX}.
     */
    createTX(options: {
        outputs: any[];
        sort: boolean;
        template: boolean;
        locktime: number;
    }, force: any): Promise<any>;
    /**
     * Build a transaction, fill it with outputs and inputs,
     * sort the members according to BIP69, set locktime,
     * sign and broadcast. Doing this all in one go prevents
     * coins from being double spent.
     * @param {Object} options - See {@link Wallet#fund options}.
     * @param {Object[]} options.outputs - See {@link MTX#addOutput}.
     * @returns {Promise} - Returns {@link TX}.
     */
    send(options: {
        outputs: any[];
    }, passphrase: any): Promise<any>;
    /**
     * Build and send a transaction without a lock.
     * @private
     * @param {Object} options - See {@link Wallet#fund options}.
     * @param {Object[]} options.outputs - See {@link MTX#addOutput}.
     * @returns {Promise} - Returns {@link TX}.
     */
    private _send;
    /**
     * Intentionally double-spend outputs by
     * increasing fee for an existing transaction.
     * @param {Hash} hash
     * @param {Rate} rate
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise} - Returns {@link TX}.
     */
    increaseFee(hash: Hash, rate: Rate, passphrase: (string | Buffer) | null): Promise<any>;
    /**
     * Resend pending wallet transactions.
     * @returns {Promise}
     */
    resend(): Promise<any>;
    /**
     * Derive necessary addresses for signing a transaction.
     * @param {MTX} mtx
     * @param {Number?} index - Input index.
     * @returns {Promise} - Returns {@link WalletKey}[].
     */
    deriveInputs(mtx: typeof MTX): Promise<any>;
    /**
     * Retrieve a single keyring by address.
     * @param {Address|Hash} hash
     * @returns {Promise}
     */
    getKey(address: any): Promise<any>;
    /**
     * Retrieve a single keyring by address
     * (with the private key reference).
     * @param {Address|Hash} hash
     * @param {(Buffer|String)?} passphrase
     * @returns {Promise}
     */
    getPrivateKey(address: any, passphrase: (Buffer | string) | null): Promise<any>;
    /**
     * Map input addresses to paths.
     * @param {MTX} mtx
     * @returns {Promise} - Returns {@link Path}[].
     */
    getInputPaths(mtx: typeof MTX): Promise<any>;
    /**
     * Map output addresses to paths.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link Path}[].
     */
    getOutputPaths(tx: TX): Promise<any>;
    /**
     * Increase lookahead for account.
     * @param {(Number|String)?} account
     * @param {Number} lookahead
     * @returns {Promise}
     */
    setLookahead(acct: any, lookahead: number): Promise<any>;
    /**
     * Increase lookahead for account (without a lock).
     * @private
     * @param {(Number|String)?} account
     * @param {Number} lookahead
     * @returns {Promise}
     */
    private _setLookahead;
    /**
     * Sync address depths based on a transaction's outputs.
     * This is used for deriving new addresses when
     * a confirmed transaction is seen.
     * @param {TX} tx
     * @returns {Promise}
     */
    syncOutputDepth(tx: TX): Promise<any>;
    /**
     * Build input scripts templates for a transaction (does not
     * sign, only creates signature slots). Only builds scripts
     * for inputs that are redeemable by this wallet.
     * @param {MTX} mtx
     * @returns {Promise} - Returns Number
     * (total number of scripts built).
     */
    template(mtx: typeof MTX): Promise<any>;
    /**
     * Build input scripts and sign inputs for a transaction. Only attempts
     * to build/sign inputs that are redeemable by this wallet.
     * @param {MTX} tx
     * @param {Object|String|Buffer} options - Options or passphrase.
     * @returns {Promise} - Returns Number (total number
     * of inputs scripts built and signed).
     */
    sign(mtx: any, passphrase: any): Promise<any>;
    /**
     * Get pending ancestors up to the policy limit
     * @param {TX} tx
     * @returns {Promise} - Returns {BufferSet} with Hash
     */
    getPendingAncestors(tx: TX): Promise<any>;
    /**
     * Get pending ancestors up to the policy limit.
     * @param {TX} tx
     * @param {Object} set
     * @returns {Promise} - Returns {BufferSet} with Hash
     */
    _getPendingAncestors(tx: TX, set: any): Promise<any>;
    /**
     * Test whether the database has a pending transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasPending(hash: Hash): Promise<any>;
    /**
     * Get a coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getCoinView(tx: TX): Promise<any>;
    /**
     * Get a historical coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    getSpentView(tx: TX): Promise<any>;
    /**
     * Convert transaction to transaction details.
     * @param {TXRecord} wtx
     * @returns {Promise} - Returns {@link Details}.
     */
    toDetails(wtx: TXRecord): Promise<any>;
    /**
     * Get transaction details.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Details}.
     */
    getDetails(hash: Hash): Promise<any>;
    /**
     * Get a coin from the wallet.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * Get a transaction from the wallet.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * List blocks for the wallet.
     * @returns {Promise} - Returns {@link BlockRecord}.
     */
    getBlocks(): Promise<any>;
    /**
     * Get a block from the wallet.
     * @param {Number} height
     * @returns {Promise} - Returns {@link BlockRecord}.
     */
    getBlock(height: number): Promise<any>;
    /**
     * Add a transaction to the wallets TX history.
     * @param {TX} tx
     * @returns {Promise}
     */
    add(tx: TX, block: any): Promise<any>;
    /**
     * Add a transaction to the wallet without a lock.
     * Potentially resolves orphans.
     * @private
     * @param {TX} tx
     * @returns {Promise}
     */
    private _add;
    /**
     * Revert a block.
     * @param {Number} height
     * @returns {Promise}
     */
    revert(height: number): Promise<any>;
    /**
     * Remove a wallet transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    remove(hash: Hash): Promise<any>;
    /**
     * Zap stale TXs from wallet.
     * @param {(Number|String)?} acct
     * @param {Number} age - Age threshold (unix time).
     * @returns {Promise}
     */
    zap(acct: (number | string) | null, age: number): Promise<any>;
    /**
     * Zap stale TXs from wallet without a lock.
     * @private
     * @param {(Number|String)?} acct
     * @param {Number} age
     * @returns {Promise}
     */
    private _zap;
    /**
     * Abandon transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    abandon(hash: Hash): Promise<any>;
    /**
     * Abandon transaction without a lock.
     * @private
     * @param {Hash} hash
     * @returns {Promise}
     */
    private _abandon;
    /**
     * Lock a single coin.
     * @param {Coin|Outpoint} coin
     */
    lockCoin(coin: Coin | Outpoint): void;
    /**
     * Unlock a single coin.
     * @param {Coin|Outpoint} coin
     */
    unlockCoin(coin: Coin | Outpoint): any;
    /**
     * Unlock all locked coins.
     */
    unlockCoins(): void;
    /**
     * Test locked status of a single coin.
     * @param {Coin|Outpoint} coin
     */
    isLocked(coin: Coin | Outpoint): any;
    /**
     * Return an array of all locked outpoints.
     * @returns {Outpoint[]}
     */
    getLocked(): Outpoint[];
    /**
     * Get all transactions in transaction history.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    getHistory(acct: (string | number) | null): Promise<any>;
    /**
     * Get all available coins.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getCoins(acct: any): Promise<any>;
    /**
     * Get all available credits.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Credit}[].
     */
    getCredits(acct: any): Promise<any>;
    /**
     * Get "smart" coins.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Coin}[].
     */
    getSmartCoins(acct: any): Promise<any>;
    /**
     * Get all pending/unconfirmed transactions.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    getPending(acct: (string | number) | null): Promise<any>;
    /**
     * Get wallet balance.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link Balance}.
     */
    getBalance(acct: (string | number) | null): Promise<any>;
    /**
     * Get a range of transactions between two timestamps.
     * @param {(String|Number)?} acct
     * @param {Object} options
     * @param {Number} options.start
     * @param {Number} options.end
     * @returns {Promise} - Returns {@link TX}[].
     */
    getRange(acct: (string | number) | null, options: {
        start: number;
        end: number;
    }): Promise<any>;
    /**
     * Get the last N transactions.
     * @param {(String|Number)?} acct
     * @param {Number} limit
     * @returns {Promise} - Returns {@link TX}[].
     */
    getLast(acct: (string | number) | null, limit: number): Promise<any>;
    /**
     * Get account key.
     * @param {Number} [acct=0]
     * @returns {HDPublicKey}
     */
    accountKey(acct?: number): HDPublicKey;
    /**
     * Get current receive depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    receiveDepth(acct?: number): number;
    /**
     * Get current change depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    changeDepth(acct?: number): number;
    /**
     * Get current nested depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    nestedDepth(acct?: number): number;
    /**
     * Get current receive address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    receiveAddress(acct?: number): Address;
    /**
     * Get current change address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    changeAddress(acct?: number): Address;
    /**
     * Get current nested address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    nestedAddress(acct?: number): Address;
    /**
     * Get current receive key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    receiveKey(acct?: number): WalletKey;
    /**
     * Get current change key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    changeKey(acct?: number): WalletKey;
    /**
     * Get current nested key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    nestedKey(acct?: number): WalletKey;
    /**
     * Convert the wallet to an object suitable for
     * serialization.
     * @param {Boolean?} unsafe - Whether to include
     * the master key in the JSON.
     * @returns {Object}
     */
    toJSON(unsafe: boolean | null, balance: any): any;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the wallet.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
import MasterKey = require("./masterkey");
import TXDB = require("./txdb");
import Address = require("../primitives/address");
import WalletKey = require("./walletkey");
import MTX = require("../primitives/mtx");
import Account = require("./account");
//# sourceMappingURL=wallet.d.ts.map