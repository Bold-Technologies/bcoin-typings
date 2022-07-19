/*!
 * wallet.js - wallet object for bcoin
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var assert = require('bsert');
var EventEmitter = require('events');
var Lock = require('bmutex').Lock;
var base58 = require('bcrypto/lib/encoding/base58');
var bio = require('bufio');
var hash160 = require('bcrypto/lib/hash160');
var hash256 = require('bcrypto/lib/hash256');
var cleanse = require('bcrypto/lib/cleanse');
var TXDB = require('./txdb');
var Path = require('./path');
var common = require('./common');
var Address = require('../primitives/address');
var MTX = require('../primitives/mtx');
var Script = require('../script/script');
var WalletKey = require('./walletkey');
var HD = require('../hd/hd');
var Output = require('../primitives/output');
var Account = require('./account');
var MasterKey = require('./masterkey');
var policy = require('../protocol/policy');
var consensus = require('../protocol/consensus');
var Mnemonic = HD.Mnemonic;
var inspectSymbol = require('../utils').inspectSymbol;
var BufferSet = require('buffer-map').BufferSet;
/**
 * Wallet
 * @alias module:wallet.Wallet
 * @extends EventEmitter
 */
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    /**
     * Create a wallet.
     * @constructor
     * @param {Object} options
     */
    function Wallet(wdb, options) {
        var _this = _super.call(this) || this;
        assert(wdb, 'WDB required.');
        _this.wdb = wdb;
        _this.db = wdb.db;
        _this.network = wdb.network;
        _this.logger = wdb.logger;
        _this.writeLock = new Lock();
        _this.fundLock = new Lock();
        _this.wid = 0;
        _this.id = null;
        _this.watchOnly = false;
        _this.accountDepth = 0;
        _this.token = consensus.ZERO_HASH;
        _this.tokenDepth = 0;
        _this.master = new MasterKey();
        _this.txdb = new TXDB(_this.wdb);
        _this.maxAncestors = policy.MEMPOOL_MAX_ANCESTORS;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Wallet.prototype.fromOptions = function (options) {
        if (!options)
            return this;
        var key = options.master;
        var id, token, mnemonic;
        if (key) {
            if (typeof key === 'string')
                key = HD.PrivateKey.fromBase58(key, this.network);
            assert(HD.isPrivate(key), 'Must create wallet with hd private key.');
        }
        else {
            mnemonic = new Mnemonic(options.mnemonic);
            key = HD.fromMnemonic(mnemonic, options.password);
        }
        this.master.fromKey(key, mnemonic);
        if (options.wid != null) {
            assert((options.wid >>> 0) === options.wid);
            this.wid = options.wid;
        }
        if (options.id) {
            assert(common.isName(options.id), 'Bad wallet ID.');
            id = options.id;
        }
        if (options.watchOnly != null) {
            assert(typeof options.watchOnly === 'boolean');
            this.watchOnly = options.watchOnly;
        }
        if (options.accountDepth != null) {
            assert((options.accountDepth >>> 0) === options.accountDepth);
            this.accountDepth = options.accountDepth;
        }
        if (options.token) {
            assert(Buffer.isBuffer(options.token));
            assert(options.token.length === 32);
            token = options.token;
        }
        if (options.tokenDepth != null) {
            assert((options.tokenDepth >>> 0) === options.tokenDepth);
            this.tokenDepth = options.tokenDepth;
        }
        if (options.maxAncestors != null) {
            assert((options.maxAncestors >>> 0) === options.maxAncestors);
            this.maxAncestors = options.maxAncestors;
        }
        if (!id)
            id = this.getID();
        if (!token)
            token = this.getToken(this.tokenDepth);
        this.id = id;
        this.token = token;
        return this;
    };
    /**
     * Instantiate wallet from options.
     * @param {WalletDB} wdb
     * @param {Object} options
     * @returns {Wallet}
     */
    Wallet.fromOptions = function (wdb, options) {
        return new this(wdb).fromOptions(options);
    };
    /**
     * Attempt to intialize the wallet (generating
     * the first addresses along with the lookahead
     * addresses). Called automatically from the
     * walletdb.
     * @returns {Promise}
     */
    Wallet.prototype.init = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!passphrase) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.master.encrypt(passphrase)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this._createAccount(options, passphrase)];
                    case 3:
                        account = _a.sent();
                        assert(account);
                        this.logger.info('Wallet initialized (%s).', this.id);
                        return [2 /*return*/, this.txdb.open(this)];
                }
            });
        });
    };
    /**
     * Open wallet (done after retrieval).
     * @returns {Promise}
     */
    Wallet.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(0)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Default account not found.');
                        this.logger.info('Wallet opened (%s).', this.id);
                        return [2 /*return*/, this.txdb.open(this)];
                }
            });
        });
    };
    /**
     * Close the wallet, unregister with the database.
     * @returns {Promise}
     */
    Wallet.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unlock1, unlock2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock1 = _a.sent();
                        return [4 /*yield*/, this.fundLock.lock()];
                    case 2:
                        unlock2 = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, this.master.destroy()];
                    case 4:
                        _a.sent();
                        this.writeLock.destroy();
                        this.fundLock.destroy();
                        return [3 /*break*/, 6];
                    case 5:
                        unlock2();
                        unlock1();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a public account key to the wallet (multisig).
     * Saves the key in the wallet database.
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Wallet.prototype.addSharedKey = function (acct, key) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._addSharedKey(acct, key)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a public account key to the wallet without a lock.
     * @private
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Wallet.prototype._addSharedKey = function (acct, key) {
        return __awaiter(this, void 0, void 0, function () {
            var account, b, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        b = this.db.batch();
                        return [4 /*yield*/, account.addSharedKey(b, key)];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Remove a public account key from the wallet (multisig).
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Wallet.prototype.removeSharedKey = function (acct, key) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._removeSharedKey(acct, key)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a public account key from the wallet (multisig).
     * @private
     * @param {(Number|String)} acct
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Wallet.prototype._removeSharedKey = function (acct, key) {
        return __awaiter(this, void 0, void 0, function () {
            var account, b, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        b = this.db.batch();
                        return [4 /*yield*/, account.removeSharedKey(b, key)];
                    case 2:
                        result = _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Change or set master key's passphrase.
     * @param {String|Buffer} passphrase
     * @param {String|Buffer} old
     * @returns {Promise}
     */
    Wallet.prototype.setPassphrase = function (passphrase, old) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(old != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.decrypt(old)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.encrypt(passphrase)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encrypt the wallet permanently.
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.encrypt = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._encrypt(passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encrypt the wallet permanently, without a lock.
     * @private
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    Wallet.prototype._encrypt = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var key, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.master.encrypt(passphrase, true)];
                    case 1:
                        key = _a.sent();
                        b = this.db.batch();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this.wdb.encryptKeys(b, this.wid, key)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        cleanse(key);
                        return [7 /*endfinally*/];
                    case 5:
                        this.save(b);
                        return [4 /*yield*/, b.write()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt the wallet permanently.
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.decrypt = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._decrypt(passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt the wallet permanently, without a lock.
     * @private
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    Wallet.prototype._decrypt = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var key, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.master.decrypt(passphrase, true)];
                    case 1:
                        key = _a.sent();
                        b = this.db.batch();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this.wdb.decryptKeys(b, this.wid, key)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        cleanse(key);
                        return [7 /*endfinally*/];
                    case 5:
                        this.save(b);
                        return [4 /*yield*/, b.write()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a new token.
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.retoken = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._retoken(passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a new token without a lock.
     * @private
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype._retoken = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!passphrase) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.unlock(passphrase)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.tokenDepth += 1;
                        this.token = this.getToken(this.tokenDepth);
                        b = this.db.batch();
                        this.save(b);
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.token];
                }
            });
        });
    };
    /**
     * Rename the wallet.
     * @param {String} id
     * @returns {Promise}
     */
    Wallet.prototype.rename = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this.wdb.rename(this, id)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rename account.
     * @param {(String|Number)?} acct
     * @param {String} name
     * @returns {Promise}
     */
    Wallet.prototype.renameAccount = function (acct, name) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._renameAccount(acct, name)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rename account without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {String} name
     * @returns {Promise}
     */
    Wallet.prototype._renameAccount = function (acct, name) {
        return __awaiter(this, void 0, void 0, function () {
            var account, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!common.isName(name))
                            throw new Error('Bad account name.');
                        return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        if (account.accountIndex === 0)
                            throw new Error('Cannot rename default account.');
                        return [4 /*yield*/, this.hasAccount(name)];
                    case 2:
                        if (_a.sent())
                            throw new Error('Account name not available.');
                        b = this.db.batch();
                        this.wdb.renameAccount(b, account, name);
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lock the wallet, destroy decrypted key.
     */
    Wallet.prototype.lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unlock1, unlock2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock1 = _a.sent();
                        return [4 /*yield*/, this.fundLock.lock()];
                    case 2:
                        unlock2 = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, this.master.lock()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        unlock2();
                        unlock1();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Unlock the key for `timeout` seconds.
     * @param {Buffer|String} passphrase
     * @param {Number?} [timeout=60]
     */
    Wallet.prototype.unlock = function (passphrase, timeout) {
        return this.master.unlock(passphrase, timeout);
    };
    /**
     * Generate the wallet ID if none was passed in.
     * It is represented as HASH160(m/44->public|magic)
     * converted to an "address" with a prefix
     * of `0x03be04` (`WLT` in base58).
     * @private
     * @returns {Base58String}
     */
    Wallet.prototype.getID = function () {
        assert(this.master.key, 'Cannot derive id.');
        var key = this.master.key.derive(44);
        var bw = bio.write(37);
        bw.writeBytes(key.publicKey);
        bw.writeU32(this.network.magic);
        var hash = hash160.digest(bw.render());
        var b58 = bio.write(27);
        b58.writeU8(0x03);
        b58.writeU8(0xbe);
        b58.writeU8(0x04);
        b58.writeBytes(hash);
        b58.writeChecksum(hash256.digest);
        return base58.encode(b58.render());
    };
    /**
     * Generate the wallet api key if none was passed in.
     * It is represented as HASH256(m/44'->private|nonce).
     * @private
     * @param {HDPrivateKey} master
     * @param {Number} nonce
     * @returns {Buffer}
     */
    Wallet.prototype.getToken = function (nonce) {
        if (!this.master.key)
            throw new Error('Cannot derive token.');
        var key = this.master.key.derive(44, true);
        var bw = bio.write(36);
        bw.writeBytes(key.privateKey);
        bw.writeU32(nonce);
        return hash256.digest(bw.render());
    };
    /**
     * Create an account. Requires passphrase if master key is encrypted.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    Wallet.prototype.createAccount = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._createAccount(options, passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create an account without a lock.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    Wallet.prototype._createAccount = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var name, key, type, opt, b, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = options.name;
                        if (!name)
                            name = this.accountDepth.toString(10);
                        return [4 /*yield*/, this.hasAccount(name)];
                    case 1:
                        if (_a.sent())
                            throw new Error('Account already exists.');
                        return [4 /*yield*/, this.unlock(passphrase)];
                    case 2:
                        _a.sent();
                        if (this.watchOnly) {
                            key = options.accountKey;
                            if (typeof key === 'string')
                                key = HD.PublicKey.fromBase58(key, this.network);
                            if (!HD.isPublic(key))
                                throw new Error('Must add HD public keys to watch only wallet.');
                        }
                        else {
                            assert(this.master.key);
                            type = this.network.keyPrefix.coinType;
                            key = this.master.key.deriveAccount(44, type, this.accountDepth);
                            key = key.toPublic();
                        }
                        opt = {
                            wid: this.wid,
                            id: this.id,
                            name: this.accountDepth === 0 ? 'default' : name,
                            witness: options.witness,
                            watchOnly: this.watchOnly,
                            accountKey: key,
                            accountIndex: this.accountDepth,
                            type: options.type,
                            m: options.m,
                            n: options.n,
                            keys: options.keys
                        };
                        b = this.db.batch();
                        account = Account.fromOptions(this.wdb, opt);
                        return [4 /*yield*/, account.init(b)];
                    case 3:
                        _a.sent();
                        this.logger.info('Created account %s/%s/%d.', account.id, account.name, account.accountIndex);
                        this.accountDepth += 1;
                        this.save(b);
                        if (this.accountDepth === 1)
                            this.increment(b);
                        return [4 /*yield*/, b.write()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, account];
                }
            });
        });
    };
    /**
     * Ensure an account. Requires passphrase if master key is encrypted.
     * @param {Object} options - See {@link Account} options.
     * @returns {Promise} - Returns {@link Account}.
     */
    Wallet.prototype.ensureAccount = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var name, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = options.name;
                        return [4 /*yield*/, this.getAccount(name)];
                    case 1:
                        account = _a.sent();
                        if (account)
                            return [2 /*return*/, account];
                        return [2 /*return*/, this.createAccount(options, passphrase)];
                }
            });
        });
    };
    /**
     * List account names and indexes from the db.
     * @returns {Promise} - Returns Array.
     */
    Wallet.prototype.getAccounts = function () {
        return this.wdb.getAccounts(this.wid);
    };
    /**
     * Get all wallet address hashes.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns Array.
     */
    Wallet.prototype.getAddressHashes = function (acct) {
        if (acct != null)
            return this.getAccountHashes(acct);
        return this.wdb.getWalletHashes(this.wid);
    };
    /**
     * Get all account address hashes.
     * @param {String|Number} acct
     * @returns {Promise} - Returns Array.
     */
    Wallet.prototype.getAccountHashes = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountIndex(acct)];
                    case 1:
                        index = _a.sent();
                        if (index === -1)
                            throw new Error('Account not found.');
                        return [2 /*return*/, this.wdb.getAccountHashes(this.wid, index)];
                }
            });
        });
    };
    /**
     * Retrieve an account from the database.
     * @param {Number|String} acct
     * @returns {Promise} - Returns {@link Account}.
     */
    Wallet.prototype.getAccount = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var index, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountIndex(acct)];
                    case 1:
                        index = _a.sent();
                        if (index === -1)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.wdb.getAccount(this.wid, index)];
                    case 2:
                        account = _a.sent();
                        if (!account)
                            return [2 /*return*/, null];
                        account.wid = this.wid;
                        account.id = this.id;
                        account.watchOnly = this.watchOnly;
                        return [2 /*return*/, account];
                }
            });
        });
    };
    /**
     * Lookup the corresponding account name's index.
     * @param {String|Number} acct - Account name/index.
     * @returns {Promise} - Returns Number.
     */
    Wallet.prototype.getAccountIndex = function (acct) {
        if (acct == null)
            return -1;
        if (typeof acct === 'number')
            return acct;
        return this.wdb.getAccountIndex(this.wid, acct);
    };
    /**
     * Lookup the corresponding account name's index.
     * @param {String|Number} acct - Account name/index.
     * @returns {Promise} - Returns Number.
     * @throws on non-existent account
     */
    Wallet.prototype.ensureIndex = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (acct == null || acct === -1)
                            return [2 /*return*/, -1];
                        return [4 /*yield*/, this.getAccountIndex(acct)];
                    case 1:
                        index = _a.sent();
                        if (index === -1)
                            throw new Error('Account not found.');
                        return [2 /*return*/, index];
                }
            });
        });
    };
    /**
     * Lookup the corresponding account index's name.
     * @param {Number} index - Account index.
     * @returns {Promise} - Returns String.
     */
    Wallet.prototype.getAccountName = function (index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof index === 'string')
                    return [2 /*return*/, index];
                return [2 /*return*/, this.wdb.getAccountName(this.wid, index)];
            });
        });
    };
    /**
     * Test whether an account exists.
     * @param {Number|String} acct
     * @returns {Promise} - Returns {@link Boolean}.
     */
    Wallet.prototype.hasAccount = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountIndex(acct)];
                    case 1:
                        index = _a.sent();
                        if (index === -1)
                            return [2 /*return*/, false];
                        return [2 /*return*/, this.wdb.hasAccount(this.wid, index)];
                }
            });
        });
    };
    /**
     * Create a new receiving address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Wallet.prototype.createReceive = function (acct) {
        if (acct === void 0) { acct = 0; }
        return this.createKey(acct, 0);
    };
    /**
     * Create a new change address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Wallet.prototype.createChange = function (acct) {
        if (acct === void 0) { acct = 0; }
        return this.createKey(acct, 1);
    };
    /**
     * Create a new nested address (increments receiveDepth).
     * @param {(Number|String)?} acct
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Wallet.prototype.createNested = function (acct) {
        if (acct === void 0) { acct = 0; }
        return this.createKey(acct, 2);
    };
    /**
     * Create a new address (increments depth).
     * @param {(Number|String)?} acct
     * @param {Number} branch
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Wallet.prototype.createKey = function (acct, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._createKey(acct, branch)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new address (increments depth) without a lock.
     * @private
     * @param {(Number|String)?} acct
     * @param {Number} branch
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Wallet.prototype._createKey = function (acct, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var account, b, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        b = this.db.batch();
                        return [4 /*yield*/, account.createKey(b, branch)];
                    case 2:
                        key = _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, key];
                }
            });
        });
    };
    /**
     * Save the wallet to the database. Necessary
     * when address depth and keys change.
     * @returns {Promise}
     */
    Wallet.prototype.save = function (b) {
        return this.wdb.save(b, this);
    };
    /**
     * Increment the wid depth.
     * @returns {Promise}
     */
    Wallet.prototype.increment = function (b) {
        return this.wdb.increment(b, this.wid);
    };
    /**
     * Test whether the wallet possesses an address.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns Boolean.
     */
    Wallet.prototype.hasAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = Address.getHash(address);
                        return [4 /*yield*/, this.getPath(hash)];
                    case 1:
                        path = _a.sent();
                        return [2 /*return*/, path != null];
                }
            });
        });
    };
    /**
     * Get path by address hash.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {@link Path}.
     */
    Wallet.prototype.getPath = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = Address.getHash(address);
                return [2 /*return*/, this.wdb.getPath(this.wid, hash)];
            });
        });
    };
    /**
     * Get path by address hash (without account name).
     * @private
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {@link Path}.
     */
    Wallet.prototype.readPath = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = Address.getHash(address);
                return [2 /*return*/, this.wdb.readPath(this.wid, hash)];
            });
        });
    };
    /**
     * Test whether the wallet contains a path.
     * @param {Address|Hash} address
     * @returns {Promise} - Returns {Boolean}.
     */
    Wallet.prototype.hasPath = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                hash = Address.getHash(address);
                return [2 /*return*/, this.wdb.hasPath(this.wid, hash)];
            });
        });
    };
    /**
     * Get all wallet paths.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link Path}.
     */
    Wallet.prototype.getPaths = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (acct != null)
                    return [2 /*return*/, this.getAccountPaths(acct)];
                return [2 /*return*/, this.wdb.getWalletPaths(this.wid)];
            });
        });
    };
    /**
     * Get all account paths.
     * @param {String|Number} acct
     * @returns {Promise} - Returns {@link Path}.
     */
    Wallet.prototype.getAccountPaths = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var index, hashes, name, result, _i, hashes_1, hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountIndex(acct)];
                    case 1:
                        index = _a.sent();
                        if (index === -1)
                            throw new Error('Account not found.');
                        return [4 /*yield*/, this.getAccountHashes(index)];
                    case 2:
                        hashes = _a.sent();
                        return [4 /*yield*/, this.getAccountName(acct)];
                    case 3:
                        name = _a.sent();
                        assert(name);
                        result = [];
                        _i = 0, hashes_1 = hashes;
                        _a.label = 4;
                    case 4:
                        if (!(_i < hashes_1.length)) return [3 /*break*/, 7];
                        hash = hashes_1[_i];
                        return [4 /*yield*/, this.readPath(hash)];
                    case 5:
                        path = _a.sent();
                        assert(path);
                        assert(path.account === index);
                        path.name = name;
                        result.push(path);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Import a keyring (will not exist on derivation chain).
     * Rescanning must be invoked manually.
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.importKey = function (acct, ring, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._importKey(acct, ring, passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import a keyring (will not exist on derivation chain) without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype._importKey = function (acct, ring, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, account, key, path, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.watchOnly) {
                            if (!ring.privateKey)
                                throw new Error('Cannot import pubkey into non watch-only wallet.');
                        }
                        else {
                            if (ring.privateKey)
                                throw new Error('Cannot import privkey into watch-only wallet.');
                        }
                        hash = ring.getHash();
                        return [4 /*yield*/, this.getPath(hash)];
                    case 1:
                        if (_a.sent())
                            throw new Error('Key already exists.');
                        return [4 /*yield*/, this.getAccount(acct)];
                    case 2:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        if (account.type !== Account.types.PUBKEYHASH)
                            throw new Error('Cannot import into non-pkh account.');
                        return [4 /*yield*/, this.unlock(passphrase)];
                    case 3:
                        _a.sent();
                        key = WalletKey.fromRing(account, ring);
                        path = key.toPath();
                        if (this.master.encrypted) {
                            path.data = this.master.encipher(path.data, path.hash);
                            assert(path.data);
                            path.encrypted = true;
                        }
                        b = this.db.batch();
                        return [4 /*yield*/, account.savePath(b, path)];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import a keyring (will not exist on derivation chain).
     * Rescanning must be invoked manually.
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.importAddress = function (acct, address) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._importAddress(acct, address)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Import a keyring (will not exist on derivation chain) without a lock.
     * @private
     * @param {(String|Number)?} acct
     * @param {WalletKey} ring
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype._importAddress = function (acct, address) {
        return __awaiter(this, void 0, void 0, function () {
            var account, path, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.watchOnly)
                            throw new Error('Cannot import address into non watch-only wallet.');
                        return [4 /*yield*/, this.getPath(address)];
                    case 1:
                        if (_a.sent())
                            throw new Error('Address already exists.');
                        return [4 /*yield*/, this.getAccount(acct)];
                    case 2:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        if (account.type !== Account.types.PUBKEYHASH)
                            throw new Error('Cannot import into non-pkh account.');
                        path = Path.fromAddress(account, address);
                        b = this.db.batch();
                        return [4 /*yield*/, account.savePath(b, path)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
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
     * @param {SatoshiAmount?} options.hardFee - Use a hard fee rather than
     * calculating one.
     * @param {Number|Boolean} options.subtractFee - Whether to subtract the
     * fee from existing outputs rather than adding more inputs.
     */
    Wallet.prototype.fund = function (mtx, options, force) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fundLock.lock(force)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._fund(mtx, options)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fill a transaction with inputs without a lock.
     * @private
     * @see MTX#selectCoins
     * @see MTX#fill
     */
    Wallet.prototype._fund = function (mtx, options) {
        return __awaiter(this, void 0, void 0, function () {
            var acct, change, rate, coins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options)
                            options = {};
                        acct = options.account || 0;
                        return [4 /*yield*/, this.changeAddress(acct)];
                    case 1:
                        change = _a.sent();
                        if (!change)
                            throw new Error('Account not found.');
                        rate = options.rate;
                        if (!(rate == null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.wdb.estimateFee(options.blocks)];
                    case 2:
                        rate = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!options.smart) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getSmartCoins(options.account)];
                    case 4:
                        coins = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.getCoins(options.account)];
                    case 6:
                        coins = _a.sent();
                        coins = this.txdb.filterLocked(coins);
                        _a.label = 7;
                    case 7: return [4 /*yield*/, mtx.fund(coins, {
                            selection: options.selection,
                            round: options.round,
                            depth: options.depth,
                            hardFee: options.hardFee,
                            subtractFee: options.subtractFee,
                            subtractIndex: options.subtractIndex,
                            changeAddress: change,
                            height: this.wdb.state.height,
                            rate: rate,
                            maxFee: options.maxFee,
                            getAccount: this.getAccountByAddress.bind(this)
                        })];
                    case 8:
                        _a.sent();
                        assert(mtx.getFee() <= MTX.Selector.MAX_FEE, 'TX exceeds MAX_FEE.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get account by address.
     * @param {Address} address
     * @returns {Account}
     */
    Wallet.prototype.getAccountByAddress = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = Address.getHash(address);
                        return [4 /*yield*/, this.getPath(hash)];
                    case 1:
                        path = _a.sent();
                        if (!path)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.getAccount(path.account)];
                }
            });
        });
    };
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
    Wallet.prototype.createTX = function (options, force) {
        return __awaiter(this, void 0, void 0, function () {
            var outputs, mtx, _i, outputs_1, obj, output, addr, total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        outputs = options.outputs;
                        mtx = new MTX();
                        assert(Array.isArray(outputs), 'Outputs must be an array.');
                        assert(outputs.length > 0, 'At least one output required.');
                        // Add the outputs
                        for (_i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
                            obj = outputs_1[_i];
                            output = new Output(obj);
                            addr = output.getAddress();
                            if (output.isDust())
                                throw new Error('Output is dust.');
                            if (output.value > 0) {
                                if (!addr)
                                    throw new Error('Cannot send to unknown address.');
                                if (addr.isNull())
                                    throw new Error('Cannot send to null address.');
                            }
                            mtx.outputs.push(output);
                        }
                        // Fill the inputs with unspents
                        return [4 /*yield*/, this.fund(mtx, options, force)];
                    case 1:
                        // Fill the inputs with unspents
                        _a.sent();
                        // Sort members a la BIP69
                        if (options.sort !== false)
                            mtx.sortMembers();
                        // Set the locktime to target value.
                        if (options.locktime != null)
                            mtx.setLocktime(options.locktime);
                        // Consensus sanity checks.
                        assert(mtx.isSane(), 'TX failed sanity check.');
                        assert(mtx.verifyInputs(this.wdb.state.height + 1), 'TX failed context check.');
                        if (options.template === false)
                            return [2 /*return*/, mtx];
                        return [4 /*yield*/, this.template(mtx)];
                    case 2:
                        total = _a.sent();
                        if (total === 0)
                            throw new Error('Templating failed.');
                        return [2 /*return*/, mtx];
                }
            });
        });
    };
    /**
     * Build a transaction, fill it with outputs and inputs,
     * sort the members according to BIP69, set locktime,
     * sign and broadcast. Doing this all in one go prevents
     * coins from being double spent.
     * @param {Object} options - See {@link Wallet#fund options}.
     * @param {Object[]} options.outputs - See {@link MTX#addOutput}.
     * @returns {Promise} - Returns {@link TX}.
     */
    Wallet.prototype.send = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fundLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._send(options, passphrase)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build and send a transaction without a lock.
     * @private
     * @param {Object} options - See {@link Wallet#fund options}.
     * @param {Object[]} options.outputs - See {@link MTX#addOutput}.
     * @returns {Promise} - Returns {@link TX}.
     */
    Wallet.prototype._send = function (options, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var mtx, tx, ancestors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createTX(options, true)];
                    case 1:
                        mtx = _a.sent();
                        return [4 /*yield*/, this.sign(mtx, passphrase)];
                    case 2:
                        _a.sent();
                        if (!mtx.isSigned())
                            throw new Error('TX could not be fully signed.');
                        tx = mtx.toTX();
                        // Policy sanity checks.
                        if (tx.getSigopsCost(mtx.view) > policy.MAX_TX_SIGOPS_COST)
                            throw new Error('TX exceeds policy sigops.');
                        if (tx.getWeight() > policy.MAX_TX_WEIGHT)
                            throw new Error('TX exceeds policy weight.');
                        return [4 /*yield*/, this.getPendingAncestors(tx)];
                    case 3:
                        ancestors = _a.sent();
                        if (ancestors.size + 1 > this.maxAncestors)
                            throw new Error('TX exceeds maximum unconfirmed ancestors.');
                        return [4 /*yield*/, this.wdb.addTX(tx)];
                    case 4:
                        _a.sent();
                        this.logger.debug('Sending wallet tx (%s): %h', this.id, tx.hash());
                        return [4 /*yield*/, this.wdb.send(tx)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, tx];
                }
            });
        });
    };
    /**
     * Intentionally double-spend outputs by
     * increasing fee for an existing transaction.
     * @param {Hash} hash
     * @param {Rate} rate
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise} - Returns {@link TX}.
     */
    Wallet.prototype.increaseFee = function (hash, rate, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var wtx, tx, view, oldFee, fee, mtx, _i, _a, input, change, i, output, addr, path, ntx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assert((rate >>> 0) === rate, 'Rate must be a number.');
                        return [4 /*yield*/, this.getTX(hash)];
                    case 1:
                        wtx = _b.sent();
                        if (!wtx)
                            throw new Error('Transaction not found.');
                        if (wtx.height !== -1)
                            throw new Error('Transaction is confirmed.');
                        tx = wtx.tx;
                        if (tx.isCoinbase())
                            throw new Error('Transaction is a coinbase.');
                        return [4 /*yield*/, this.getSpentView(tx)];
                    case 2:
                        view = _b.sent();
                        if (!tx.hasCoins(view))
                            throw new Error('Not all coins available.');
                        oldFee = tx.getFee(view);
                        fee = tx.getMinFee(null, rate);
                        if (fee > MTX.Selector.MAX_FEE)
                            fee = MTX.Selector.MAX_FEE;
                        if (oldFee >= fee)
                            throw new Error('Fee is not increasing.');
                        mtx = MTX.fromTX(tx);
                        mtx.view = view;
                        for (_i = 0, _a = mtx.inputs; _i < _a.length; _i++) {
                            input = _a[_i];
                            input.script.clear();
                            input.witness.clear();
                        }
                        i = 0;
                        _b.label = 3;
                    case 3:
                        if (!(i < mtx.outputs.length)) return [3 /*break*/, 6];
                        output = mtx.outputs[i];
                        addr = output.getAddress();
                        if (!addr)
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getPath(addr)];
                    case 4:
                        path = _b.sent();
                        if (!path)
                            return [3 /*break*/, 5];
                        if (path.branch === 1) {
                            change = output;
                            mtx.changeIndex = i;
                            return [3 /*break*/, 6];
                        }
                        _b.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (!change)
                            throw new Error('No change output.');
                        change.value += oldFee;
                        if (mtx.getFee() !== 0)
                            throw new Error('Arithmetic error for change.');
                        change.value -= fee;
                        if (change.value < 0)
                            throw new Error('Fee is too high.');
                        if (change.isDust()) {
                            mtx.outputs.splice(mtx.changeIndex, 1);
                            mtx.changeIndex = -1;
                        }
                        return [4 /*yield*/, this.sign(mtx, passphrase)];
                    case 7:
                        _b.sent();
                        if (!mtx.isSigned())
                            throw new Error('TX could not be fully signed.');
                        ntx = mtx.toTX();
                        this.logger.debug('Increasing fee for wallet tx (%s): %h', this.id, ntx.hash());
                        return [4 /*yield*/, this.wdb.addTX(ntx)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.wdb.send(ntx)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, ntx];
                }
            });
        });
    };
    /**
     * Resend pending wallet transactions.
     * @returns {Promise}
     */
    Wallet.prototype.resend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wtxs, txs, _i, wtxs_1, wtx, sorted, _a, sorted_1, tx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getPending()];
                    case 1:
                        wtxs = _b.sent();
                        if (wtxs.length > 0)
                            this.logger.info('Rebroadcasting %d transactions.', wtxs.length);
                        txs = [];
                        for (_i = 0, wtxs_1 = wtxs; _i < wtxs_1.length; _i++) {
                            wtx = wtxs_1[_i];
                            txs.push(wtx.tx);
                        }
                        sorted = common.sortDeps(txs);
                        _a = 0, sorted_1 = sorted;
                        _b.label = 2;
                    case 2:
                        if (!(_a < sorted_1.length)) return [3 /*break*/, 5];
                        tx = sorted_1[_a];
                        return [4 /*yield*/, this.wdb.send(tx)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _a++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, txs];
                }
            });
        });
    };
    /**
     * Derive necessary addresses for signing a transaction.
     * @param {MTX} mtx
     * @param {Number?} index - Input index.
     * @returns {Promise} - Returns {@link WalletKey}[].
     */
    Wallet.prototype.deriveInputs = function (mtx) {
        return __awaiter(this, void 0, void 0, function () {
            var paths, rings, _i, paths_1, path, account, ring;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(mtx.mutable);
                        return [4 /*yield*/, this.getInputPaths(mtx)];
                    case 1:
                        paths = _a.sent();
                        rings = [];
                        _i = 0, paths_1 = paths;
                        _a.label = 2;
                    case 2:
                        if (!(_i < paths_1.length)) return [3 /*break*/, 5];
                        path = paths_1[_i];
                        return [4 /*yield*/, this.getAccount(path.account)];
                    case 3:
                        account = _a.sent();
                        if (!account)
                            return [3 /*break*/, 4];
                        ring = account.derivePath(path, this.master);
                        if (ring)
                            rings.push(ring);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, rings];
                }
            });
        });
    };
    /**
     * Retrieve a single keyring by address.
     * @param {Address|Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype.getKey = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, path, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = Address.getHash(address);
                        return [4 /*yield*/, this.getPath(hash)];
                    case 1:
                        path = _a.sent();
                        if (!path)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.getAccount(path.account)];
                    case 2:
                        account = _a.sent();
                        if (!account)
                            return [2 /*return*/, null];
                        return [2 /*return*/, account.derivePath(path, this.master)];
                }
            });
        });
    };
    /**
     * Retrieve a single keyring by address
     * (with the private key reference).
     * @param {Address|Hash} hash
     * @param {(Buffer|String)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.getPrivateKey = function (address, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, path, account, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = Address.getHash(address);
                        return [4 /*yield*/, this.getPath(hash)];
                    case 1:
                        path = _a.sent();
                        if (!path)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.getAccount(path.account)];
                    case 2:
                        account = _a.sent();
                        if (!account)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.unlock(passphrase)];
                    case 3:
                        _a.sent();
                        key = account.derivePath(path, this.master);
                        if (!key.privateKey)
                            return [2 /*return*/, null];
                        return [2 /*return*/, key];
                }
            });
        });
    };
    /**
     * Map input addresses to paths.
     * @param {MTX} mtx
     * @returns {Promise} - Returns {@link Path}[].
     */
    Wallet.prototype.getInputPaths = function (mtx) {
        return __awaiter(this, void 0, void 0, function () {
            var hashes, paths, _i, hashes_2, hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(mtx.mutable);
                        if (!mtx.hasCoins())
                            throw new Error('Not all coins available.');
                        hashes = mtx.getInputHashes();
                        paths = [];
                        _i = 0, hashes_2 = hashes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < hashes_2.length)) return [3 /*break*/, 4];
                        hash = hashes_2[_i];
                        return [4 /*yield*/, this.getPath(hash)];
                    case 2:
                        path = _a.sent();
                        if (path)
                            paths.push(path);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, paths];
                }
            });
        });
    };
    /**
     * Map output addresses to paths.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link Path}[].
     */
    Wallet.prototype.getOutputPaths = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var paths, hashes, _i, hashes_3, hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        paths = [];
                        hashes = tx.getOutputHashes();
                        _i = 0, hashes_3 = hashes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < hashes_3.length)) return [3 /*break*/, 4];
                        hash = hashes_3[_i];
                        return [4 /*yield*/, this.getPath(hash)];
                    case 2:
                        path = _a.sent();
                        if (path)
                            paths.push(path);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, paths];
                }
            });
        });
    };
    /**
     * Increase lookahead for account.
     * @param {(Number|String)?} account
     * @param {Number} lookahead
     * @returns {Promise}
     */
    Wallet.prototype.setLookahead = function (acct, lookahead) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        try {
                            return [2 /*return*/, this._setLookahead(acct, lookahead)];
                        }
                        finally {
                            unlock();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Increase lookahead for account (without a lock).
     * @private
     * @param {(Number|String)?} account
     * @param {Number} lookahead
     * @returns {Promise}
     */
    Wallet.prototype._setLookahead = function (acct, lookahead) {
        return __awaiter(this, void 0, void 0, function () {
            var account, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        b = this.db.batch();
                        return [4 /*yield*/, account.setLookahead(b, lookahead)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync address depths based on a transaction's outputs.
     * This is used for deriving new addresses when
     * a confirmed transaction is seen.
     * @param {TX} tx
     * @returns {Promise}
     */
    Wallet.prototype.syncOutputDepth = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var map, _i, _a, hash, path, derived, b, _b, map_1, _c, acct, paths, receive, change, nested, _d, paths_2, path, account, ring;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        map = new Map();
                        _i = 0, _a = tx.getOutputHashes();
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        hash = _a[_i];
                        return [4 /*yield*/, this.readPath(hash)];
                    case 2:
                        path = _e.sent();
                        if (!path)
                            return [3 /*break*/, 3];
                        if (path.index === -1)
                            return [3 /*break*/, 3];
                        if (!map.has(path.account))
                            map.set(path.account, []);
                        map.get(path.account).push(path);
                        _e.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        derived = [];
                        b = this.db.batch();
                        _b = 0, map_1 = map;
                        _e.label = 5;
                    case 5:
                        if (!(_b < map_1.length)) return [3 /*break*/, 9];
                        _c = map_1[_b], acct = _c[0], paths = _c[1];
                        receive = -1;
                        change = -1;
                        nested = -1;
                        for (_d = 0, paths_2 = paths; _d < paths_2.length; _d++) {
                            path = paths_2[_d];
                            switch (path.branch) {
                                case 0:
                                    if (path.index > receive)
                                        receive = path.index;
                                    break;
                                case 1:
                                    if (path.index > change)
                                        change = path.index;
                                    break;
                                case 2:
                                    if (path.index > nested)
                                        nested = path.index;
                                    break;
                            }
                        }
                        receive += 2;
                        change += 2;
                        nested += 2;
                        return [4 /*yield*/, this.getAccount(acct)];
                    case 6:
                        account = _e.sent();
                        assert(account);
                        return [4 /*yield*/, account.syncDepth(b, receive, change, nested)];
                    case 7:
                        ring = _e.sent();
                        if (ring)
                            derived.push(ring);
                        _e.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 5];
                    case 9: return [4 /*yield*/, b.write()];
                    case 10:
                        _e.sent();
                        return [2 /*return*/, derived];
                }
            });
        });
    };
    /**
     * Build input scripts templates for a transaction (does not
     * sign, only creates signature slots). Only builds scripts
     * for inputs that are redeemable by this wallet.
     * @param {MTX} mtx
     * @returns {Promise} - Returns Number
     * (total number of scripts built).
     */
    Wallet.prototype.template = function (mtx) {
        return __awaiter(this, void 0, void 0, function () {
            var rings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deriveInputs(mtx)];
                    case 1:
                        rings = _a.sent();
                        return [2 /*return*/, mtx.template(rings)];
                }
            });
        });
    };
    /**
     * Build input scripts and sign inputs for a transaction. Only attempts
     * to build/sign inputs that are redeemable by this wallet.
     * @param {MTX} tx
     * @param {Object|String|Buffer} options - Options or passphrase.
     * @returns {Promise} - Returns Number (total number
     * of inputs scripts built and signed).
     */
    Wallet.prototype.sign = function (mtx, passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var rings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.watchOnly)
                            throw new Error('Cannot sign from a watch-only wallet.');
                        return [4 /*yield*/, this.unlock(passphrase)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.deriveInputs(mtx)];
                    case 2:
                        rings = _a.sent();
                        return [2 /*return*/, mtx.signAsync(rings, Script.hashType.ALL, this.wdb.workers)];
                }
            });
        });
    };
    /**
     * Get pending ancestors up to the policy limit
     * @param {TX} tx
     * @returns {Promise} - Returns {BufferSet} with Hash
     */
    Wallet.prototype.getPendingAncestors = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._getPendingAncestors(tx, new BufferSet())];
            });
        });
    };
    /**
     * Get pending ancestors up to the policy limit.
     * @param {TX} tx
     * @param {Object} set
     * @returns {Promise} - Returns {BufferSet} with Hash
     */
    Wallet.prototype._getPendingAncestors = function (tx, set) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, prevout, hash, parent_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash;
                        if (set.has(hash))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, this.hasPending(hash)];
                    case 2:
                        if (!(_b.sent()))
                            return [3 /*break*/, 5];
                        set.add(hash);
                        if (set.size > this.maxAncestors)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getTX(hash)];
                    case 3:
                        parent_1 = _b.sent();
                        return [4 /*yield*/, this._getPendingAncestors(parent_1.tx, set)];
                    case 4:
                        _b.sent();
                        if (set.size > this.maxAncestors)
                            return [3 /*break*/, 6];
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, set];
                }
            });
        });
    };
    /**
     * Test whether the database has a pending transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Wallet.prototype.hasPending = function (hash) {
        return this.txdb.hasPending(hash);
    };
    /**
     * Get a coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Wallet.prototype.getCoinView = function (tx) {
        return this.txdb.getCoinView(tx);
    };
    /**
     * Get a historical coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Wallet.prototype.getSpentView = function (tx) {
        return this.txdb.getSpentView(tx);
    };
    /**
     * Convert transaction to transaction details.
     * @param {TXRecord} wtx
     * @returns {Promise} - Returns {@link Details}.
     */
    Wallet.prototype.toDetails = function (wtx) {
        return this.txdb.toDetails(wtx);
    };
    /**
     * Get transaction details.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Details}.
     */
    Wallet.prototype.getDetails = function (hash) {
        return this.txdb.getDetails(hash);
    };
    /**
     * Get a coin from the wallet.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    Wallet.prototype.getCoin = function (hash, index) {
        return this.txdb.getCoin(hash, index);
    };
    /**
     * Get a transaction from the wallet.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    Wallet.prototype.getTX = function (hash) {
        return this.txdb.getTX(hash);
    };
    /**
     * List blocks for the wallet.
     * @returns {Promise} - Returns {@link BlockRecord}.
     */
    Wallet.prototype.getBlocks = function () {
        return this.txdb.getBlocks();
    };
    /**
     * Get a block from the wallet.
     * @param {Number} height
     * @returns {Promise} - Returns {@link BlockRecord}.
     */
    Wallet.prototype.getBlock = function (height) {
        return this.txdb.getBlock(height);
    };
    /**
     * Add a transaction to the wallets TX history.
     * @param {TX} tx
     * @returns {Promise}
     */
    Wallet.prototype.add = function (tx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._add(tx, block)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a transaction to the wallet without a lock.
     * Potentially resolves orphans.
     * @private
     * @param {TX} tx
     * @returns {Promise}
     */
    Wallet.prototype._add = function (tx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var details, derived;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txdb.add(tx, block)];
                    case 1:
                        details = _a.sent();
                        if (!details) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.syncOutputDepth(tx)];
                    case 2:
                        derived = _a.sent();
                        if (derived.length > 0) {
                            this.wdb.emit('address', this, derived);
                            this.emit('address', derived);
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Revert a block.
     * @param {Number} height
     * @returns {Promise}
     */
    Wallet.prototype.revert = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this.txdb.revert(height)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a wallet transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype.remove = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this.txdb.remove(hash)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Zap stale TXs from wallet.
     * @param {(Number|String)?} acct
     * @param {Number} age - Age threshold (unix time).
     * @returns {Promise}
     */
    Wallet.prototype.zap = function (acct, age) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._zap(acct, age)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Zap stale TXs from wallet without a lock.
     * @private
     * @param {(Number|String)?} acct
     * @param {Number} age
     * @returns {Promise}
     */
    Wallet.prototype._zap = function (acct, age) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.zap(account, age)];
                }
            });
        });
    };
    /**
     * Abandon transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype.abandon = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._abandon(hash)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Abandon transaction without a lock.
     * @private
     * @param {Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype._abandon = function (hash) {
        return this.txdb.abandon(hash);
    };
    /**
     * Lock a single coin.
     * @param {Coin|Outpoint} coin
     */
    Wallet.prototype.lockCoin = function (coin) {
        return this.txdb.lockCoin(coin);
    };
    /**
     * Unlock a single coin.
     * @param {Coin|Outpoint} coin
     */
    Wallet.prototype.unlockCoin = function (coin) {
        return this.txdb.unlockCoin(coin);
    };
    /**
     * Unlock all locked coins.
     */
    Wallet.prototype.unlockCoins = function () {
        return this.txdb.unlockCoins();
    };
    /**
     * Test locked status of a single coin.
     * @param {Coin|Outpoint} coin
     */
    Wallet.prototype.isLocked = function (coin) {
        return this.txdb.isLocked(coin);
    };
    /**
     * Return an array of all locked outpoints.
     * @returns {Outpoint[]}
     */
    Wallet.prototype.getLocked = function () {
        return this.txdb.getLocked();
    };
    /**
     * Get all transactions in transaction history.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    Wallet.prototype.getHistory = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getHistory(account)];
                }
            });
        });
    };
    /**
     * Get all available coins.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Coin}[].
     */
    Wallet.prototype.getCoins = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getCoins(account)];
                }
            });
        });
    };
    /**
     * Get all available credits.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Credit}[].
     */
    Wallet.prototype.getCredits = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getCredits(account)];
                }
            });
        });
    };
    /**
     * Get "smart" coins.
     * @param {(String|Number)?} account
     * @returns {Promise} - Returns {@link Coin}[].
     */
    Wallet.prototype.getSmartCoins = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var credits, coins, _i, credits_1, credit, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCredits(acct)];
                    case 1:
                        credits = _a.sent();
                        coins = [];
                        for (_i = 0, credits_1 = credits; _i < credits_1.length; _i++) {
                            credit = credits_1[_i];
                            coin = credit.coin;
                            if (credit.spent)
                                continue;
                            if (this.txdb.isLocked(coin))
                                continue;
                            // Always use confirmed coins.
                            if (coin.height !== -1) {
                                coins.push(coin);
                                continue;
                            }
                            // Use unconfirmed only if they were
                            // created as a result of one of our
                            // _own_ transactions. i.e. they're
                            // not low-fee and not in danger of
                            // being double-spent by a bad actor.
                            if (!credit.own)
                                continue;
                            coins.push(coin);
                        }
                        return [2 /*return*/, coins];
                }
            });
        });
    };
    /**
     * Get all pending/unconfirmed transactions.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    Wallet.prototype.getPending = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getPending(account)];
                }
            });
        });
    };
    /**
     * Get wallet balance.
     * @param {(String|Number)?} acct
     * @returns {Promise} - Returns {@link Balance}.
     */
    Wallet.prototype.getBalance = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getBalance(account)];
                }
            });
        });
    };
    /**
     * Get a range of transactions between two timestamps.
     * @param {(String|Number)?} acct
     * @param {Object} options
     * @param {Number} options.start
     * @param {Number} options.end
     * @returns {Promise} - Returns {@link TX}[].
     */
    Wallet.prototype.getRange = function (acct, options) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getRange(account, options)];
                }
            });
        });
    };
    /**
     * Get the last N transactions.
     * @param {(String|Number)?} acct
     * @param {Number} limit
     * @returns {Promise} - Returns {@link TX}[].
     */
    Wallet.prototype.getLast = function (acct, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureIndex(acct)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, this.txdb.getLast(account, limit)];
                }
            });
        });
    };
    /**
     * Get account key.
     * @param {Number} [acct=0]
     * @returns {HDPublicKey}
     */
    Wallet.prototype.accountKey = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.accountKey];
                }
            });
        });
    };
    /**
     * Get current receive depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    Wallet.prototype.receiveDepth = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.receiveDepth];
                }
            });
        });
    };
    /**
     * Get current change depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    Wallet.prototype.changeDepth = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.changeDepth];
                }
            });
        });
    };
    /**
     * Get current nested depth.
     * @param {Number} [acct=0]
     * @returns {Number}
     */
    Wallet.prototype.nestedDepth = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.nestedDepth];
                }
            });
        });
    };
    /**
     * Get current receive address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    Wallet.prototype.receiveAddress = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.receiveAddress()];
                }
            });
        });
    };
    /**
     * Get current change address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    Wallet.prototype.changeAddress = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.changeAddress()];
                }
            });
        });
    };
    /**
     * Get current nested address.
     * @param {Number} [acct=0]
     * @returns {Address}
     */
    Wallet.prototype.nestedAddress = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.nestedAddress()];
                }
            });
        });
    };
    /**
     * Get current receive key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    Wallet.prototype.receiveKey = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.receiveKey()];
                }
            });
        });
    };
    /**
     * Get current change key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    Wallet.prototype.changeKey = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.changeKey()];
                }
            });
        });
    };
    /**
     * Get current nested key.
     * @param {Number} [acct=0]
     * @returns {WalletKey}
     */
    Wallet.prototype.nestedKey = function (acct) {
        if (acct === void 0) { acct = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account)
                            throw new Error('Account not found.');
                        return [2 /*return*/, account.nestedKey()];
                }
            });
        });
    };
    /**
     * Convert the wallet to a more inspection-friendly object.
     * @returns {Object}
     */
    Wallet.prototype[inspectSymbol] = function () {
        return {
            wid: this.wid,
            id: this.id,
            network: this.network.type,
            accountDepth: this.accountDepth,
            token: this.token.toString('hex'),
            tokenDepth: this.tokenDepth,
            master: this.master
        };
    };
    /**
     * Convert the wallet to an object suitable for
     * serialization.
     * @param {Boolean?} unsafe - Whether to include
     * the master key in the JSON.
     * @returns {Object}
     */
    Wallet.prototype.toJSON = function (unsafe, balance) {
        return {
            network: this.network.type,
            wid: this.wid,
            id: this.id,
            watchOnly: this.watchOnly,
            accountDepth: this.accountDepth,
            token: this.token.toString('hex'),
            tokenDepth: this.tokenDepth,
            master: this.master.toJSON(this.network, unsafe),
            balance: balance ? balance.toJSON(true) : null
        };
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    Wallet.prototype.getSize = function () {
        var size = 0;
        size += 41;
        size += this.master.getSize();
        return size;
    };
    /**
     * Serialize the wallet.
     * @returns {Buffer}
     */
    Wallet.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        var flags = 0;
        if (this.watchOnly)
            flags |= 1;
        bw.writeU8(flags);
        bw.writeU32(this.accountDepth);
        bw.writeBytes(this.token);
        bw.writeU32(this.tokenDepth);
        this.master.toWriter(bw);
        return bw.render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Wallet.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        var flags = br.readU8();
        this.watchOnly = (flags & 1) !== 0;
        this.accountDepth = br.readU32();
        this.token = br.readBytes(32);
        this.tokenDepth = br.readU32();
        this.master.fromReader(br);
        return this;
    };
    /**
     * Instantiate a wallet from serialized data.
     * @param {Buffer} data
     * @returns {Wallet}
     */
    Wallet.fromRaw = function (wdb, data) {
        return new this(wdb).fromRaw(data);
    };
    /**
     * Test an object to see if it is a Wallet.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Wallet.isWallet = function (obj) {
        return obj instanceof Wallet;
    };
    return Wallet;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Wallet;
