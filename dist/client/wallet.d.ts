export = WalletClient;
/**
 * Wallet Client
 * @extends {bcurl.Client}
 */
declare class WalletClient {
    /**
     * Create a wallet client.
     * @param {Object?} options
     */
    constructor(options: any | null);
    wallets: any;
    /**
     * Open the client.
     * @private
     * @returns {Promise}
     */
    private init;
    /**
     * Dispatch event.
     * @param {Number} id
     * @param {String} event
     * @private
     */
    private dispatch;
    /**
     * Open the client.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the client.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Auth with server.
     * @returns {Promise}
     */
    auth(): Promise<any>;
    /**
     * Make an RPC call.
     * @returns {Promise}
     */
    execute(name: any, params: any): Promise<any>;
    /**
     * Create a wallet object.
     * @param {Number} id
     * @param {String} token
     */
    wallet(id: number, token: string): Wallet;
    /**
     * Join a wallet.
     * @param {String} token
     */
    all(token: string): any;
    /**
     * Leave a wallet.
     */
    none(): any;
    /**
     * Join a wallet.
     * @param {Number} id
     * @param {String} token
     */
    join(id: number, token: string): any;
    /**
     * Leave a wallet.
     * @param {Number} id
     */
    leave(id: number): any;
    /**
     * Rescan the chain.
     * @param {Number} height
     * @returns {Promise}
     */
    rescan(height: number): Promise<any>;
    /**
     * Resend pending transactions.
     * @returns {Promise}
     */
    resend(): Promise<any>;
    /**
     * Backup the walletdb.
     * @param {String} path
     * @returns {Promise}
     */
    backup(path: string): Promise<any>;
    /**
     * Get list of all wallet IDs.
     * @returns {Promise}
     */
    getWallets(): Promise<any>;
    /**
     * Create a wallet.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    createWallet(id: number, options: any): Promise<any>;
    /**
     * Get wallet transaction history.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    getHistory(id: number, account: string): Promise<any>;
    /**
     * Get wallet coins.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    getCoins(id: number, account: string): Promise<any>;
    /**
     * Get all unconfirmed transactions.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    getPending(id: number, account: string): Promise<any>;
    /**
     * Calculate wallet balance.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    getBalance(id: number, account: string): Promise<any>;
    /**
     * Get last N wallet transactions.
     * @param {Number} id
     * @param {String} account
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise}
     */
    getLast(id: number, account: string, limit: number): Promise<any>;
    /**
     * Get wallet transactions by timestamp range.
     * @param {Number} id
     * @param {String} account
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise}
     */
    getRange(id: number, account: string, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get transaction (only possible if the transaction
     * is available in the wallet history).
     * @param {Number} id
     * @param {Hash} hash
     * @returns {Promise}
     */
    getTX(id: number, hash: Hash): Promise<any>;
    /**
     * Get wallet blocks.
     * @param {Number} id
     * @returns {Promise}
     */
    getBlocks(id: number): Promise<any>;
    /**
     * Get wallet block.
     * @param {Number} id
     * @param {Number} height
     * @returns {Promise}
     */
    getBlock(id: number, height: number): Promise<any>;
    /**
     * Get unspent coin (only possible if the transaction
     * is available in the wallet history).
     * @param {Number} id
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    getCoin(id: number, hash: Hash, index: number): Promise<any>;
    /**
     * @param {Number} id
     * @param {String} account
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    zap(id: number, account: string, age: number): Promise<any>;
    /**
     * @param {Number} id
     * @param {Hash} hash
     * @returns {Promise}
     */
    abandon(id: number, hash: Hash): Promise<any>;
    /**
     * Create a transaction, fill.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    createTX(id: number, options: any): Promise<any>;
    /**
     * Create a transaction, fill, sign, and broadcast.
     * @param {Number} id
     * @param {Object} options
     * @param {String} options.address
     * @param {Amount} options.value
     * @returns {Promise}
     */
    send(id: number, options: {
        address: string;
        value: Amount;
    }): Promise<any>;
    /**
     * Sign a transaction.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    sign(id: number, options: any): Promise<any>;
    /**
     * Get the raw wallet JSON.
     * @param {Number} id
     * @returns {Promise}
     */
    getInfo(id: number): Promise<any>;
    /**
     * Get wallet accounts.
     * @param {Number} id
     * @returns {Promise} - Returns Array.
     */
    getAccounts(id: number): Promise<any>;
    /**
     * Get wallet master key.
     * @param {Number} id
     * @returns {Promise}
     */
    getMaster(id: number): Promise<any>;
    /**
     * Get wallet account.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    getAccount(id: number, account: string): Promise<any>;
    /**
     * Create account.
     * @param {Number} id
     * @param {String} name
     * @param {Object} options
     * @returns {Promise}
     */
    createAccount(id: number, name: string, options: any): Promise<any>;
    /**
     * Create address.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    createAddress(id: number, account: any): Promise<any>;
    /**
     * Create change address.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    createChange(id: number, account: any): Promise<any>;
    /**
     * Create nested address.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    createNested(id: number, account: string): Promise<any>;
    /**
     * Change or set master key`s passphrase.
     * @param {Number} id
     * @param {String|Buffer} passphrase
     * @param {(String|Buffer)?} old
     * @returns {Promise}
     */
    setPassphrase(id: number, passphrase: string | Buffer, old: (string | Buffer) | null): Promise<any>;
    /**
     * Generate a new token.
     * @param {Number} id
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    retoken(id: number, passphrase: (string | Buffer) | null): Promise<any>;
    /**
     * Import private key.
     * @param {Number} id
     * @param {String} account
     * @param {String} key
     * @returns {Promise}
     */
    importPrivate(id: number, account: string, privateKey: any, passphrase: any): Promise<any>;
    /**
     * Import public key.
     * @param {Number} id
     * @param {Number|String} account
     * @param {String} publicKey
     * @returns {Promise}
     */
    importPublic(id: number, account: number | string, publicKey: string): Promise<any>;
    /**
     * Import address.
     * @param {Number} id
     * @param {String} account
     * @param {String} address
     * @returns {Promise}
     */
    importAddress(id: number, account: string, address: string): Promise<any>;
    /**
     * Lock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    lockCoin(id: any, hash: string, index: number): Promise<any>;
    /**
     * Unlock a coin.
     * @param {Number} id
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    unlockCoin(id: number, hash: string, index: number): Promise<any>;
    /**
     * Get locked coins.
     * @param {Number} id
     * @returns {Promise}
     */
    getLocked(id: number): Promise<any>;
    /**
     * Lock wallet.
     * @param {Number} id
     * @returns {Promise}
     */
    lock(id: number): Promise<any>;
    /**
     * Unlock wallet.
     * @param {Number} id
     * @param {String} passphrase
     * @param {Number} timeout
     * @returns {Promise}
     */
    unlock(id: number, passphrase: string, timeout: number): Promise<any>;
    /**
     * Get wallet key.
     * @param {Number} id
     * @param {String} address
     * @returns {Promise}
     */
    getKey(id: number, address: string): Promise<any>;
    /**
     * Get wallet key WIF dump.
     * @param {Number} id
     * @param {String} address
     * @param {String?} passphrase
     * @returns {Promise}
     */
    getWIF(id: number, address: string, passphrase: string | null): Promise<any>;
    /**
     * Add a public account key to the wallet for multisig.
     * @param {Number} id
     * @param {String} account
     * @param {String} key - Account (bip44) key (base58).
     * @returns {Promise}
     */
    addSharedKey(id: number, account: string, accountKey: any): Promise<any>;
    /**
     * Remove a public account key to the wallet for multisig.
     * @param {Number} id
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    removeSharedKey(id: number, account: string, accountKey: string): Promise<any>;
    /**
     * Resend wallet transactions.
     * @param {Number} id
     * @returns {Promise}
     */
    resendWallet(id: number): Promise<any>;
}
/**
 * Wallet Instance
 * @extends {EventEmitter}
 */
declare class Wallet {
    /**
     * Create a wallet client.
     * @param {Object?} options
     */
    constructor(parent: any, id: any, token: any);
    parent: any;
    client: any;
    id: any;
    token: any;
    /**
     * Open wallet.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close wallet.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Get wallet transaction history.
     * @param {String} account
     * @returns {Promise}
     */
    getHistory(account: string): Promise<any>;
    /**
     * Get wallet coins.
     * @param {String} account
     * @returns {Promise}
     */
    getCoins(account: string): Promise<any>;
    /**
     * Get all unconfirmed transactions.
     * @param {String} account
     * @returns {Promise}
     */
    getPending(account: string): Promise<any>;
    /**
     * Calculate wallet balance.
     * @param {String} account
     * @returns {Promise}
     */
    getBalance(account: string): Promise<any>;
    /**
     * Get last N wallet transactions.
     * @param {String} account
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise}
     */
    getLast(account: string, limit: number): Promise<any>;
    /**
     * Get wallet transactions by timestamp range.
     * @param {String} account
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise}
     */
    getRange(account: string, options: {
        start: number;
        end: number;
        limit: number | null;
        reverse: boolean | null;
    }): Promise<any>;
    /**
     * Get transaction (only possible if the transaction
     * is available in the wallet history).
     * @param {Hash} hash
     * @returns {Promise}
     */
    getTX(hash: Hash): Promise<any>;
    /**
     * Get wallet blocks.
     * @param {Number} height
     * @returns {Promise}
     */
    getBlocks(): Promise<any>;
    /**
     * Get wallet block.
     * @param {Number} height
     * @returns {Promise}
     */
    getBlock(height: number): Promise<any>;
    /**
     * Get unspent coin (only possible if the transaction
     * is available in the wallet history).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    getCoin(hash: Hash, index: number): Promise<any>;
    /**
     * @param {String} account
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    zap(account: string, age: number): Promise<any>;
    /**
     * Used to remove a pending transaction from the wallet.
     * That is likely the case if it has a policy or low fee
     * that prevents it from proper network propagation.
     * @param {Hash} hash
     * @returns {Promise}
     */
    abandon(hash: Hash): Promise<any>;
    /**
     * Create a transaction, fill.
     * @param {Object} options
     * @returns {Promise}
     */
    createTX(options: any): Promise<any>;
    /**
     * Create a transaction, fill, sign, and broadcast.
     * @param {Object} options
     * @param {String} options.address
     * @param {Amount} options.value
     * @returns {Promise}
     */
    send(options: {
        address: string;
        value: Amount;
    }): Promise<any>;
    /**
     * Sign a transaction.
     * @param {Object} options
     * @returns {Promise}
     */
    sign(options: any): Promise<any>;
    /**
     * Get the raw wallet JSON.
     * @returns {Promise}
     */
    getInfo(): Promise<any>;
    /**
     * Get wallet accounts.
     * @returns {Promise} - Returns Array.
     */
    getAccounts(): Promise<any>;
    /**
     * Get wallet master key.
     * @returns {Promise}
     */
    getMaster(): Promise<any>;
    /**
     * Get wallet account.
     * @param {String} account
     * @returns {Promise}
     */
    getAccount(account: string): Promise<any>;
    /**
     * Create account.
     * @param {String} name
     * @param {Object} options
     * @returns {Promise}
     */
    createAccount(name: string, options: any): Promise<any>;
    /**
     * Create address.
     * @param {String} account
     * @returns {Promise}
     */
    createAddress(account: string): Promise<any>;
    /**
     * Create change address.
     * @param {String} account
     * @returns {Promise}
     */
    createChange(account: string): Promise<any>;
    /**
     * Create nested address.
     * @param {String} account
     * @returns {Promise}
     */
    createNested(account: string): Promise<any>;
    /**
     * Change or set master key`s passphrase.
     * @param {String|Buffer} passphrase
     * @param {(String|Buffer)?} old
     * @returns {Promise}
     */
    setPassphrase(passphrase: string | Buffer, old: (string | Buffer) | null): Promise<any>;
    /**
     * Generate a new token.
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    retoken(passphrase: (string | Buffer) | null): Promise<any>;
    /**
     * Import private key.
     * @param {Number|String} account
     * @param {String} privateKey
     * @param {String} passphrase
     * @returns {Promise}
     */
    importPrivate(account: number | string, privateKey: string, passphrase: string): Promise<any>;
    /**
     * Import public key.
     * @param {Number|String} account
     * @param {String} publicKey
     * @returns {Promise}
     */
    importPublic(account: number | string, publicKey: string): Promise<any>;
    /**
     * Import address.
     * @param {Number|String} account
     * @param {String} address
     * @returns {Promise}
     */
    importAddress(account: number | string, address: string): Promise<any>;
    /**
     * Lock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    lockCoin(hash: string, index: number): Promise<any>;
    /**
     * Unlock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    unlockCoin(hash: string, index: number): Promise<any>;
    /**
     * Get locked coins.
     * @returns {Promise}
     */
    getLocked(): Promise<any>;
    /**
     * Lock wallet.
     * @returns {Promise}
     */
    lock(): Promise<any>;
    /**
     * Unlock wallet.
     * @param {String} passphrase
     * @param {Number} timeout
     * @returns {Promise}
     */
    unlock(passphrase: string, timeout: number): Promise<any>;
    /**
     * Get wallet key.
     * @param {String} address
     * @returns {Promise}
     */
    getKey(address: string): Promise<any>;
    /**
     * Get wallet key WIF dump.
     * @param {String} address
     * @param {String?} passphrase
     * @returns {Promise}
     */
    getWIF(address: string, passphrase: string | null): Promise<any>;
    /**
     * Add a public account key to the wallet for multisig.
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    addSharedKey(account: string, accountKey: string): Promise<any>;
    /**
     * Remove a public account key to the wallet for multisig.
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    removeSharedKey(account: string, accountKey: string): Promise<any>;
    /**
     * Resend wallet transactions.
     * @returns {Promise}
     */
    resend(): Promise<any>;
}
//# sourceMappingURL=wallet.d.ts.map