export = WalletKey;
/**
 * Wallet Key
 * Represents a key ring which amounts to an address.
 * @alias module:wallet.WalletKey
 * @extends KeyRing
 */
declare class WalletKey extends KeyRing {
    /**
     * Instantiate a wallet key from hd key.
     * @param {Account} account
     * @param {HDPrivateKey|HDPublicKey} key
     * @param {Number} branch
     * @param {Number} index
     * @returns {WalletKey}
     */
    static fromHD(account: Account, key: HDPrivateKey | HDPublicKey, branch: number, index: number): WalletKey;
    /**
     * Instantiate a wallet key from imported data.
     * @param {Account} account
     * @param {Buffer} data
     * @returns {WalletKey}
     */
    static fromImport(account: Account, data: Buffer): WalletKey;
    /**
     * Instantiate a wallet key from regular key.
     * @param {Account} account
     * @param {KeyRing} ring
     * @returns {WalletKey}
     */
    static fromRing(account: Account, ring: KeyRing): WalletKey;
    /**
     * Test whether an object is a WalletKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isWalletKey(obj: any): boolean;
    keyType: number;
    name: any;
    account: number;
    branch: number;
    index: number;
    /**
     * Inject properties from hd key.
     * @private
     * @param {Account} account
     * @param {HDPrivateKey|HDPublicKey} key
     * @param {Number} branch
     * @param {Number} index
     * @returns {WalletKey}
     */
    private fromHD;
    /**
     * Inject properties from imported data.
     * @private
     * @param {Account} account
     * @param {Buffer} data
     * @returns {WalletKey}
     */
    private fromImport;
    /**
     * Inject properties from key.
     * @private
     * @param {Account} account
     * @param {KeyRing} ring
     * @returns {WalletKey}
     */
    private fromRing;
    /**
     * Convert wallet key to a path.
     * @returns {Path}
     */
    toPath(): Path;
}
import KeyRing = require("../primitives/keyring");
import Path = require("./path");
//# sourceMappingURL=walletkey.d.ts.map