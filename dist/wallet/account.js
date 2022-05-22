/*!
 * account.js - account object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
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
var bio = require('bufio');
var binary = require('../utils/binary');
var Path = require('./path');
var common = require('./common');
var Script = require('../script/script');
var WalletKey = require('./walletkey');
var HDPublicKey = require('../hd/hd').HDPublicKey;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Account
 * Represents a BIP44 Account belonging to a {@link Wallet}.
 * Note that this object does not enforce locks. Any method
 * that does a write is internal API only and will lead
 * to race conditions if used elsewhere.
 * @alias module:wallet.Account
 */
var Account = /** @class */ (function () {
    /**
     * Create an account.
     * @constructor
     * @param {Object} options
     */
    function Account(wdb, options) {
        assert(wdb, 'Database is required.');
        this.wdb = wdb;
        this.network = wdb.network;
        this.wid = 0;
        this.id = null;
        this.accountIndex = 0;
        this.name = null;
        this.initialized = false;
        this.witness = wdb.options.witness === true;
        this.watchOnly = false;
        this.type = Account.types.PUBKEYHASH;
        this.m = 1;
        this.n = 1;
        this.receiveDepth = 0;
        this.changeDepth = 0;
        this.nestedDepth = 0;
        this.lookahead = 10;
        this.accountKey = null;
        this.keys = [];
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Account.prototype.fromOptions = function (options) {
        assert(options, 'Options are required.');
        assert((options.wid >>> 0) === options.wid);
        assert(common.isName(options.id), 'Bad Wallet ID.');
        assert(HDPublicKey.isHDPublicKey(options.accountKey), 'Account key is required.');
        assert((options.accountIndex >>> 0) === options.accountIndex, 'Account index is required.');
        this.wid = options.wid;
        this.id = options.id;
        if (options.accountIndex != null) {
            assert((options.accountIndex >>> 0) === options.accountIndex);
            this.accountIndex = options.accountIndex;
        }
        if (options.name != null) {
            assert(common.isName(options.name), 'Bad account name.');
            this.name = options.name;
        }
        if (options.initialized != null) {
            assert(typeof options.initialized === 'boolean');
            this.initialized = options.initialized;
        }
        if (options.witness != null) {
            assert(typeof options.witness === 'boolean');
            this.witness = options.witness;
        }
        if (options.watchOnly != null) {
            assert(typeof options.watchOnly === 'boolean');
            this.watchOnly = options.watchOnly;
        }
        if (options.type != null) {
            if (typeof options.type === 'string') {
                this.type = Account.types[options.type.toUpperCase()];
                assert(this.type != null);
            }
            else {
                assert(typeof options.type === 'number');
                this.type = options.type;
                assert(Account.typesByVal[this.type]);
            }
        }
        if (options.m != null) {
            assert((options.m & 0xff) === options.m);
            this.m = options.m;
        }
        if (options.n != null) {
            assert((options.n & 0xff) === options.n);
            this.n = options.n;
        }
        if (options.receiveDepth != null) {
            assert((options.receiveDepth >>> 0) === options.receiveDepth);
            this.receiveDepth = options.receiveDepth;
        }
        if (options.changeDepth != null) {
            assert((options.changeDepth >>> 0) === options.changeDepth);
            this.changeDepth = options.changeDepth;
        }
        if (options.nestedDepth != null) {
            assert((options.nestedDepth >>> 0) === options.nestedDepth);
            this.nestedDepth = options.nestedDepth;
        }
        if (options.lookahead != null) {
            assert((options.lookahead >>> 0) === options.lookahead);
            assert(options.lookahead >= 0);
            assert(options.lookahead <= Account.MAX_LOOKAHEAD);
            this.lookahead = options.lookahead;
        }
        this.accountKey = options.accountKey;
        if (this.n > 1)
            this.type = Account.types.MULTISIG;
        if (!this.name)
            this.name = this.accountIndex.toString(10);
        if (this.m < 1 || this.m > this.n)
            throw new Error('m ranges between 1 and n');
        if (options.keys) {
            assert(Array.isArray(options.keys));
            for (var _i = 0, _a = options.keys; _i < _a.length; _i++) {
                var key = _a[_i];
                this.pushKey(key);
            }
        }
        return this;
    };
    /**
     * Instantiate account from options.
     * @param {WalletDB} wdb
     * @param {Object} options
     * @returns {Account}
     */
    Account.fromOptions = function (wdb, options) {
        return new this(wdb).fromOptions(options);
    };
    /**
     * Attempt to intialize the account (generating
     * the first addresses along with the lookahead
     * addresses). Called automatically from the
     * walletdb.
     * @returns {Promise}
     */
    Account.prototype.init = function (b) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Waiting for more keys.
                        if (this.keys.length !== this.n - 1) {
                            assert(!this.initialized);
                            this.save(b);
                            return [2 /*return*/];
                        }
                        assert(this.receiveDepth === 0);
                        assert(this.changeDepth === 0);
                        assert(this.nestedDepth === 0);
                        this.initialized = true;
                        return [4 /*yield*/, this.initDepth(b)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a public account key to the account (multisig).
     * Does not update the database.
     * @param {HDPublicKey} key - Account (bip44)
     * key (can be in base58 form).
     * @throws Error on non-hdkey/non-accountkey.
     */
    Account.prototype.pushKey = function (key) {
        if (typeof key === 'string')
            key = HDPublicKey.fromBase58(key, this.network);
        if (!HDPublicKey.isHDPublicKey(key))
            throw new Error('Must add HD keys to wallet.');
        if (!key.isAccount())
            throw new Error('Must add HD account keys to BIP44 wallet.');
        if (this.type !== Account.types.MULTISIG)
            throw new Error('Cannot add keys to non-multisig wallet.');
        if (key.equals(this.accountKey))
            throw new Error('Cannot add own key.');
        var index = binary.insert(this.keys, key, cmp, true);
        if (index === -1)
            return false;
        if (this.keys.length > this.n - 1) {
            binary.remove(this.keys, key, cmp);
            throw new Error('Cannot add more keys.');
        }
        return true;
    };
    /**
     * Remove a public account key to the account (multisig).
     * Does not update the database.
     * @param {HDPublicKey} key - Account (bip44)
     * key (can be in base58 form).
     * @throws Error on non-hdkey/non-accountkey.
     */
    Account.prototype.spliceKey = function (key) {
        if (typeof key === 'string')
            key = HDPublicKey.fromBase58(key, this.network);
        if (!HDPublicKey.isHDPublicKey(key))
            throw new Error('Must add HD keys to wallet.');
        if (!key.isAccount())
            throw new Error('Must add HD account keys to BIP44 wallet.');
        if (this.type !== Account.types.MULTISIG)
            throw new Error('Cannot remove keys from non-multisig wallet.');
        if (this.keys.length === this.n - 1)
            throw new Error('Cannot remove key.');
        return binary.remove(this.keys, key, cmp);
    };
    /**
     * Add a public account key to the account (multisig).
     * Saves the key in the wallet database.
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Account.prototype.addSharedKey = function (b, key) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = this.pushKey(key);
                        return [4 /*yield*/, this.hasDuplicate()];
                    case 1:
                        if (_a.sent()) {
                            this.spliceKey(key);
                            throw new Error('Cannot add a key from another account.');
                        }
                        // Try to initialize again.
                        return [4 /*yield*/, this.init(b)];
                    case 2:
                        // Try to initialize again.
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Ensure accounts are not sharing keys.
     * @private
     * @returns {Promise}
     */
    Account.prototype.hasDuplicate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ring, hash;
            return __generator(this, function (_a) {
                if (this.keys.length !== this.n - 1)
                    return [2 /*return*/, false];
                ring = this.deriveReceive(0);
                hash = ring.getScriptHash();
                return [2 /*return*/, this.wdb.hasPath(this.wid, hash)];
            });
        });
    };
    /**
     * Remove a public account key from the account (multisig).
     * Remove the key from the wallet database.
     * @param {HDPublicKey} key
     * @returns {Promise}
     */
    Account.prototype.removeSharedKey = function (b, key) {
        var result = this.spliceKey(key);
        if (!result)
            return false;
        this.save(b);
        return true;
    };
    /**
     * Create a new receiving address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    Account.prototype.createReceive = function (b) {
        return this.createKey(b, 0);
    };
    /**
     * Create a new change address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    Account.prototype.createChange = function (b) {
        return this.createKey(b, 1);
    };
    /**
     * Create a new change address (increments receiveDepth).
     * @returns {Promise} - Returns {@link WalletKey}
     */
    Account.prototype.createNested = function (b) {
        return this.createKey(b, 2);
    };
    /**
     * Create a new address (increments depth).
     * @param {Boolean} change
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Account.prototype.createKey = function (b, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var key, lookahead, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = branch;
                        switch (_a) {
                            case 0: return [3 /*break*/, 1];
                            case 1: return [3 /*break*/, 3];
                            case 2: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1:
                        key = this.deriveReceive(this.receiveDepth);
                        lookahead = this.deriveReceive(this.receiveDepth + this.lookahead);
                        return [4 /*yield*/, this.saveKey(b, lookahead)];
                    case 2:
                        _b.sent();
                        this.receiveDepth += 1;
                        this.receive = key;
                        return [3 /*break*/, 8];
                    case 3:
                        key = this.deriveChange(this.changeDepth);
                        lookahead = this.deriveChange(this.changeDepth + this.lookahead);
                        return [4 /*yield*/, this.saveKey(b, lookahead)];
                    case 4:
                        _b.sent();
                        this.changeDepth += 1;
                        this.change = key;
                        return [3 /*break*/, 8];
                    case 5:
                        key = this.deriveNested(this.nestedDepth);
                        lookahead = this.deriveNested(this.nestedDepth + this.lookahead);
                        return [4 /*yield*/, this.saveKey(b, lookahead)];
                    case 6:
                        _b.sent();
                        this.nestedDepth += 1;
                        this.nested = key;
                        return [3 /*break*/, 8];
                    case 7: throw new Error("Bad branch: ".concat(branch, "."));
                    case 8:
                        this.save(b);
                        return [2 /*return*/, key];
                }
            });
        });
    };
    /**
     * Derive a receiving address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    Account.prototype.deriveReceive = function (index, master) {
        return this.deriveKey(0, index, master);
    };
    /**
     * Derive a change address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    Account.prototype.deriveChange = function (index, master) {
        return this.deriveKey(1, index, master);
    };
    /**
     * Derive a nested address at `index`. Do not increment depth.
     * @param {Number} index
     * @returns {WalletKey}
     */
    Account.prototype.deriveNested = function (index, master) {
        if (!this.witness)
            throw new Error('Cannot derive nested on non-witness account.');
        return this.deriveKey(2, index, master);
    };
    /**
     * Derive an address from `path` object.
     * @param {Path} path
     * @param {MasterKey} master
     * @returns {WalletKey}
     */
    Account.prototype.derivePath = function (path, master) {
        switch (path.keyType) {
            case Path.types.HD: {
                return this.deriveKey(path.branch, path.index, master);
            }
            case Path.types.KEY: {
                assert(this.type === Account.types.PUBKEYHASH);
                var data = path.data;
                if (path.encrypted) {
                    data = master.decipher(data, path.hash);
                    if (!data)
                        return null;
                }
                return WalletKey.fromImport(this, data);
            }
            case Path.types.ADDRESS: {
                return null;
            }
            default: {
                throw new Error('Bad key type.');
            }
        }
    };
    /**
     * Derive an address at `index`. Do not increment depth.
     * @param {Number} branch
     * @param {Number} index
     * @returns {WalletKey}
     */
    Account.prototype.deriveKey = function (branch, index, master) {
        assert(typeof branch === 'number');
        var keys = [];
        var key;
        if (master && master.key && !this.watchOnly) {
            var type = this.network.keyPrefix.coinType;
            key = master.key.deriveAccount(44, type, this.accountIndex);
            key = key.derive(branch).derive(index);
        }
        else {
            key = this.accountKey.derive(branch).derive(index);
        }
        var ring = WalletKey.fromHD(this, key, branch, index);
        switch (this.type) {
            case Account.types.PUBKEYHASH:
                break;
            case Account.types.MULTISIG:
                keys.push(key.publicKey);
                for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
                    var shared = _a[_i];
                    var key_1 = shared.derive(branch).derive(index);
                    keys.push(key_1.publicKey);
                }
                ring.script = Script.fromMultisig(this.m, this.n, keys);
                break;
        }
        return ring;
    };
    /**
     * Save the account to the database. Necessary
     * when address depth and keys change.
     * @returns {Promise}
     */
    Account.prototype.save = function (b) {
        return this.wdb.saveAccount(b, this);
    };
    /**
     * Save addresses to path map.
     * @param {WalletKey[]} rings
     * @returns {Promise}
     */
    Account.prototype.saveKey = function (b, ring) {
        return this.wdb.saveKey(b, this.wid, ring);
    };
    /**
     * Save paths to path map.
     * @param {Path[]} rings
     * @returns {Promise}
     */
    Account.prototype.savePath = function (b, path) {
        return this.wdb.savePath(b, this.wid, path);
    };
    /**
     * Initialize address depths (including lookahead).
     * @returns {Promise}
     */
    Account.prototype.initDepth = function (b) {
        return __awaiter(this, void 0, void 0, function () {
            var i, key, i, key, i, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Receive Address
                        this.receiveDepth = 1;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i <= this.lookahead)) return [3 /*break*/, 4];
                        key = this.deriveReceive(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // Change Address
                        this.changeDepth = 1;
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i <= this.lookahead)) return [3 /*break*/, 8];
                        key = this.deriveChange(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!this.witness) return [3 /*break*/, 12];
                        this.nestedDepth = 1;
                        i = 0;
                        _a.label = 9;
                    case 9:
                        if (!(i <= this.lookahead)) return [3 /*break*/, 12];
                        key = this.deriveNested(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 9];
                    case 12:
                        this.save(b);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Allocate new lookahead addresses if necessary.
     * @param {Number} receiveDepth
     * @param {Number} changeDepth
     * @param {Number} nestedDepth
     * @returns {Promise} - Returns {@link WalletKey}.
     */
    Account.prototype.syncDepth = function (b, receive, change, nested) {
        return __awaiter(this, void 0, void 0, function () {
            var derived, result, depth, i, key, depth, i, key, depth, i, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        derived = false;
                        result = null;
                        if (!(receive > this.receiveDepth)) return [3 /*break*/, 5];
                        depth = this.receiveDepth + this.lookahead;
                        assert(receive <= depth + 1);
                        i = depth;
                        _a.label = 1;
                    case 1:
                        if (!(i < receive + this.lookahead)) return [3 /*break*/, 4];
                        key = this.deriveReceive(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 2:
                        _a.sent();
                        result = key;
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.receiveDepth = receive;
                        derived = true;
                        _a.label = 5;
                    case 5:
                        if (!(change > this.changeDepth)) return [3 /*break*/, 10];
                        depth = this.changeDepth + this.lookahead;
                        assert(change <= depth + 1);
                        i = depth;
                        _a.label = 6;
                    case 6:
                        if (!(i < change + this.lookahead)) return [3 /*break*/, 9];
                        key = this.deriveChange(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 6];
                    case 9:
                        this.changeDepth = change;
                        derived = true;
                        _a.label = 10;
                    case 10:
                        if (!(this.witness && nested > this.nestedDepth)) return [3 /*break*/, 15];
                        depth = this.nestedDepth + this.lookahead;
                        assert(nested <= depth + 1);
                        i = depth;
                        _a.label = 11;
                    case 11:
                        if (!(i < nested + this.lookahead)) return [3 /*break*/, 14];
                        key = this.deriveNested(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 12:
                        _a.sent();
                        result = key;
                        _a.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14:
                        this.nestedDepth = nested;
                        derived = true;
                        result = this.nested;
                        _a.label = 15;
                    case 15:
                        if (derived)
                            this.save(b);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Allocate new lookahead addresses.
     * @param {Number} lookahead
     * @returns {Promise}
     */
    Account.prototype.setLookahead = function (b, lookahead) {
        return __awaiter(this, void 0, void 0, function () {
            var diff, depth, target, i, key, depth, target, i, key, depth, target, i, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (lookahead === this.lookahead)
                            return [2 /*return*/];
                        if (lookahead < this.lookahead) {
                            diff = this.lookahead - lookahead;
                            this.receiveDepth += diff;
                            this.changeDepth += diff;
                            if (this.witness)
                                this.nestedDepth += diff;
                            this.lookahead = lookahead;
                            this.save(b);
                            return [2 /*return*/];
                        }
                        depth = this.receiveDepth + this.lookahead;
                        target = this.receiveDepth + lookahead;
                        i = depth;
                        _a.label = 1;
                    case 1:
                        if (!(i < target)) return [3 /*break*/, 4];
                        key = this.deriveReceive(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        depth = this.changeDepth + this.lookahead;
                        target = this.changeDepth + lookahead;
                        i = depth;
                        _a.label = 5;
                    case 5:
                        if (!(i < target)) return [3 /*break*/, 8];
                        key = this.deriveChange(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!this.witness) return [3 /*break*/, 12];
                        depth = this.nestedDepth + this.lookahead;
                        target = this.nestedDepth + lookahead;
                        i = depth;
                        _a.label = 9;
                    case 9:
                        if (!(i < target)) return [3 /*break*/, 12];
                        key = this.deriveNested(i);
                        return [4 /*yield*/, this.saveKey(b, key)];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 9];
                    case 12:
                        this.lookahead = lookahead;
                        this.save(b);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current receive key.
     * @returns {WalletKey}
     */
    Account.prototype.receiveKey = function () {
        if (!this.initialized)
            return null;
        return this.deriveReceive(this.receiveDepth - 1);
    };
    /**
     * Get current change key.
     * @returns {WalletKey}
     */
    Account.prototype.changeKey = function () {
        if (!this.initialized)
            return null;
        return this.deriveChange(this.changeDepth - 1);
    };
    /**
     * Get current nested key.
     * @returns {WalletKey}
     */
    Account.prototype.nestedKey = function () {
        if (!this.initialized)
            return null;
        if (!this.witness)
            return null;
        return this.deriveNested(this.nestedDepth - 1);
    };
    /**
     * Get current receive address.
     * @returns {Address}
     */
    Account.prototype.receiveAddress = function () {
        var key = this.receiveKey();
        if (!key)
            return null;
        return key.getAddress();
    };
    /**
     * Get current change address.
     * @returns {Address}
     */
    Account.prototype.changeAddress = function () {
        var key = this.changeKey();
        if (!key)
            return null;
        return key.getAddress();
    };
    /**
     * Get current nested address.
     * @returns {Address}
     */
    Account.prototype.nestedAddress = function () {
        var key = this.nestedKey();
        if (!key)
            return null;
        return key.getAddress();
    };
    /**
     * Convert the account to a more inspection-friendly object.
     * @returns {Object}
     */
    Account.prototype[inspectSymbol] = function () {
        var _this = this;
        var receive = this.receiveAddress();
        var change = this.changeAddress();
        var nested = this.nestedAddress();
        return {
            id: this.id,
            wid: this.wid,
            name: this.name,
            network: this.network.type,
            initialized: this.initialized,
            witness: this.witness,
            watchOnly: this.watchOnly,
            type: Account.typesByVal[this.type].toLowerCase(),
            m: this.m,
            n: this.n,
            accountIndex: this.accountIndex,
            receiveDepth: this.receiveDepth,
            changeDepth: this.changeDepth,
            nestedDepth: this.nestedDepth,
            lookahead: this.lookahead,
            receiveAddress: receive ? receive.toString(this.network) : null,
            changeAddress: change ? change.toString(this.network) : null,
            nestedAddress: nested ? nested.toString(this.network) : null,
            accountKey: this.accountKey.toBase58(this.network),
            keys: this.keys.map(function (key) { return key.toBase58(_this.network); })
        };
    };
    /**
     * Convert the account to an object suitable for
     * serialization.
     * @returns {Object}
     */
    Account.prototype.toJSON = function (balance) {
        var _this = this;
        var receive = this.receiveAddress();
        var change = this.changeAddress();
        var nested = this.nestedAddress();
        return {
            name: this.name,
            initialized: this.initialized,
            witness: this.witness,
            watchOnly: this.watchOnly,
            type: Account.typesByVal[this.type].toLowerCase(),
            m: this.m,
            n: this.n,
            accountIndex: this.accountIndex,
            receiveDepth: this.receiveDepth,
            changeDepth: this.changeDepth,
            nestedDepth: this.nestedDepth,
            lookahead: this.lookahead,
            receiveAddress: receive ? receive.toString(this.network) : null,
            changeAddress: change ? change.toString(this.network) : null,
            nestedAddress: nested ? nested.toString(this.network) : null,
            accountKey: this.accountKey.toBase58(this.network),
            keys: this.keys.map(function (key) { return key.toBase58(_this.network); }),
            balance: balance ? balance.toJSON(true) : null
        };
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    Account.prototype.getSize = function () {
        var size = 0;
        size += 92;
        size += this.keys.length * 74;
        return size;
    };
    /**
     * Serialize the account.
     * @returns {Buffer}
     */
    Account.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        var flags = 0;
        if (this.initialized)
            flags |= 1;
        if (this.witness)
            flags |= 2;
        bw.writeU8(flags);
        bw.writeU8(this.type);
        bw.writeU8(this.m);
        bw.writeU8(this.n);
        bw.writeU32(this.receiveDepth);
        bw.writeU32(this.changeDepth);
        bw.writeU32(this.nestedDepth);
        bw.writeU8(this.lookahead);
        writeKey(this.accountKey, bw);
        bw.writeU8(this.keys.length);
        for (var _i = 0, _a = this.keys; _i < _a.length; _i++) {
            var key = _a[_i];
            writeKey(key, bw);
        }
        return bw.render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {Object}
     */
    Account.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        var flags = br.readU8();
        this.initialized = (flags & 1) !== 0;
        this.witness = (flags & 2) !== 0;
        this.type = br.readU8();
        this.m = br.readU8();
        this.n = br.readU8();
        this.receiveDepth = br.readU32();
        this.changeDepth = br.readU32();
        this.nestedDepth = br.readU32();
        this.lookahead = br.readU8();
        this.accountKey = readKey(br);
        assert(this.type < Account.typesByVal.length);
        var count = br.readU8();
        for (var i = 0; i < count; i++) {
            var key = readKey(br);
            binary.insert(this.keys, key, cmp, true);
        }
        return this;
    };
    /**
     * Instantiate a account from serialized data.
     * @param {WalletDB} data
     * @param {Buffer} data
     * @returns {Account}
     */
    Account.fromRaw = function (wdb, data) {
        return new this(wdb).fromRaw(data);
    };
    /**
     * Test an object to see if it is a Account.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Account.isAccount = function (obj) {
        return obj instanceof Account;
    };
    return Account;
}());
/**
 * Account types.
 * @enum {Number}
 * @default
 */
Account.types = {
    PUBKEYHASH: 0,
    MULTISIG: 1
};
/**
 * Account types by value.
 * @const {Object}
 */
Account.typesByVal = [
    'PUBKEYHASH',
    'MULTISIG'
];
/**
 * Default address lookahead.
 * @const {Number}
 */
Account.MAX_LOOKAHEAD = 40;
/*
 * Helpers
 */
function cmp(a, b) {
    return a.compare(b);
}
function writeKey(key, bw) {
    bw.writeU8(key.depth);
    bw.writeU32BE(key.parentFingerPrint);
    bw.writeU32BE(key.childIndex);
    bw.writeBytes(key.chainCode);
    bw.writeBytes(key.publicKey);
}
function readKey(br) {
    var key = new HDPublicKey();
    key.depth = br.readU8();
    key.parentFingerPrint = br.readU32BE();
    key.childIndex = br.readU32BE();
    key.chainCode = br.readBytes(32);
    key.publicKey = br.readBytes(33);
    return key;
}
/*
 * Expose
 */
module.exports = Account;
