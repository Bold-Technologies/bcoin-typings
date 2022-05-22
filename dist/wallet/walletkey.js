/*!
 * walletkey.js - walletkey object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Address = require('../primitives/address');
var KeyRing = require('../primitives/keyring');
var Path = require('./path');
/**
 * Wallet Key
 * Represents a key ring which amounts to an address.
 * @alias module:wallet.WalletKey
 * @extends KeyRing
 */
var WalletKey = /** @class */ (function (_super) {
    __extends(WalletKey, _super);
    /**
     * Create a wallet key.
     * @constructor
     * @param {Object?} options
     */
    function WalletKey(options) {
        var _this = _super.call(this, options) || this;
        _this.keyType = Path.types.HD;
        _this.name = null;
        _this.account = -1;
        _this.branch = -1;
        _this.index = -1;
        return _this;
    }
    /**
     * Convert an WalletKey to a more json-friendly object.
     * @returns {Object}
     */
    WalletKey.prototype.toJSON = function (network) {
        return {
            name: this.name,
            account: this.account,
            branch: this.branch,
            index: this.index,
            witness: this.witness,
            nested: this.nested,
            publicKey: this.publicKey.toString('hex'),
            script: this.script ? this.script.toRaw().toString('hex') : null,
            program: this.witness ? this.getProgram().toRaw().toString('hex') : null,
            type: Address.typesByVal[this.getType()].toLowerCase(),
            address: this.getAddress('string', network)
        };
    };
    /**
     * Inject properties from hd key.
     * @private
     * @param {Account} account
     * @param {HDPrivateKey|HDPublicKey} key
     * @param {Number} branch
     * @param {Number} index
     * @returns {WalletKey}
     */
    WalletKey.prototype.fromHD = function (account, key, branch, index) {
        this.keyType = Path.types.HD;
        this.name = account.name;
        this.account = account.accountIndex;
        this.branch = branch;
        this.index = index;
        this.witness = account.witness;
        this.nested = branch === 2;
        if (key.privateKey)
            return this.fromPrivate(key.privateKey);
        return this.fromPublic(key.publicKey);
    };
    /**
     * Instantiate a wallet key from hd key.
     * @param {Account} account
     * @param {HDPrivateKey|HDPublicKey} key
     * @param {Number} branch
     * @param {Number} index
     * @returns {WalletKey}
     */
    WalletKey.fromHD = function (account, key, branch, index) {
        return new this().fromHD(account, key, branch, index);
    };
    /**
     * Inject properties from imported data.
     * @private
     * @param {Account} account
     * @param {Buffer} data
     * @returns {WalletKey}
     */
    WalletKey.prototype.fromImport = function (account, data) {
        this.keyType = Path.types.KEY;
        this.name = account.name;
        this.account = account.accountIndex;
        this.witness = account.witness;
        return this.fromRaw(data);
    };
    /**
     * Instantiate a wallet key from imported data.
     * @param {Account} account
     * @param {Buffer} data
     * @returns {WalletKey}
     */
    WalletKey.fromImport = function (account, data) {
        return new this().fromImport(account, data);
    };
    /**
     * Inject properties from key.
     * @private
     * @param {Account} account
     * @param {KeyRing} ring
     * @returns {WalletKey}
     */
    WalletKey.prototype.fromRing = function (account, ring) {
        this.keyType = Path.types.KEY;
        this.name = account.name;
        this.account = account.accountIndex;
        this.witness = account.witness;
        return this.fromOptions(ring);
    };
    /**
     * Instantiate a wallet key from regular key.
     * @param {Account} account
     * @param {KeyRing} ring
     * @returns {WalletKey}
     */
    WalletKey.fromRing = function (account, ring) {
        return new this().fromRing(account, ring);
    };
    /**
     * Convert wallet key to a path.
     * @returns {Path}
     */
    WalletKey.prototype.toPath = function () {
        var path = new Path();
        path.name = this.name;
        path.account = this.account;
        switch (this.keyType) {
            case Path.types.HD:
                path.branch = this.branch;
                path.index = this.index;
                break;
            case Path.types.KEY:
                path.data = this.toRaw();
                break;
        }
        path.keyType = this.keyType;
        path.version = this.getVersion();
        path.type = this.getType();
        path.hash = this.getHash();
        return path;
    };
    /**
     * Test whether an object is a WalletKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    WalletKey.isWalletKey = function (obj) {
        return obj instanceof WalletKey;
    };
    return WalletKey;
}(KeyRing));
/*
 * Expose
 */
module.exports = WalletKey;
