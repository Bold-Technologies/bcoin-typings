/*!
 * masterkey.js - master bip32 key object for bcoin
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
var Lock = require('bmutex').Lock;
var random = require('bcrypto/lib/random');
var cleanse = require('bcrypto/lib/cleanse');
var aes = require('bcrypto/lib/aes');
var sha256 = require('bcrypto/lib/sha256');
var hash256 = require('bcrypto/lib/hash256');
var secp256k1 = require('bcrypto/lib/secp256k1');
var pbkdf2 = require('bcrypto/lib/pbkdf2');
var scrypt = require('bcrypto/lib/scrypt');
var util = require('../utils/util');
var HDPrivateKey = require('../hd/private');
var Mnemonic = require('../hd/mnemonic');
var encoding = bio.encoding;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Master Key
 * Master BIP32 key which can exist
 * in a timed out encrypted state.
 * @alias module:wallet.MasterKey
 */
var MasterKey = /** @class */ (function () {
    /**
     * Create a master key.
     * @constructor
     * @param {Object} options
     */
    function MasterKey(options) {
        this.encrypted = false;
        this.iv = null;
        this.ciphertext = null;
        this.key = null;
        this.mnemonic = null;
        this.alg = MasterKey.alg.PBKDF2;
        this.n = 50000;
        this.r = 0;
        this.p = 0;
        this.aesKey = null;
        this.timer = null;
        this.until = 0;
        this.locker = new Lock();
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    MasterKey.prototype.fromOptions = function (options) {
        assert(options);
        if (options.encrypted != null) {
            assert(typeof options.encrypted === 'boolean');
            this.encrypted = options.encrypted;
        }
        if (options.iv) {
            assert(Buffer.isBuffer(options.iv));
            this.iv = options.iv;
        }
        if (options.ciphertext) {
            assert(Buffer.isBuffer(options.ciphertext));
            this.ciphertext = options.ciphertext;
        }
        if (options.key) {
            assert(HDPrivateKey.isHDPrivateKey(options.key));
            this.key = options.key;
        }
        if (options.mnemonic) {
            assert(options.mnemonic instanceof Mnemonic);
            this.mnemonic = options.mnemonic;
        }
        if (options.alg != null) {
            if (typeof options.alg === 'string') {
                this.alg = MasterKey.alg[options.alg.toUpperCase()];
                assert(this.alg != null, 'Unknown algorithm.');
            }
            else {
                assert(typeof options.alg === 'number');
                assert(MasterKey.algByVal[options.alg]);
                this.alg = options.alg;
            }
        }
        if (options.rounds != null) {
            assert((options.rounds >>> 0) === options.rounds);
            this.rounds = options.rounds;
        }
        if (options.n != null) {
            assert((options.n >>> 0) === options.n);
            this.n = options.n;
        }
        if (options.r != null) {
            assert((options.r >>> 0) === options.r);
            this.r = options.r;
        }
        if (options.p != null) {
            assert((options.p >>> 0) === options.p);
            this.p = options.p;
        }
        assert(this.encrypted ? !this.key : this.key);
        return this;
    };
    /**
     * Instantiate master key from options.
     * @returns {MasterKey}
     */
    MasterKey.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Decrypt the key and set a timeout to destroy decrypted data.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Number} [timeout=60000] timeout in ms.
     * @returns {Promise} - Returns {@link HDPrivateKey}.
     */
    MasterKey.prototype.unlock = function (passphrase, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var _unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        _unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._unlock(passphrase, timeout)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        _unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt the key without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @param {Number} [timeout=60000] timeout in ms.
     * @returns {Promise} - Returns {@link HDPrivateKey}.
     */
    MasterKey.prototype._unlock = function (passphrase, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var key, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.key) {
                            if (this.encrypted) {
                                assert(this.timer != null);
                                this.start(timeout);
                            }
                            return [2 /*return*/, this.key];
                        }
                        if (!passphrase)
                            throw new Error('No passphrase.');
                        assert(this.encrypted);
                        return [4 /*yield*/, this.derive(passphrase)];
                    case 1:
                        key = _a.sent();
                        data = aes.decipher(this.ciphertext, key, this.iv);
                        this.readKey(data);
                        this.start(timeout);
                        this.aesKey = key;
                        return [2 /*return*/, this.key];
                }
            });
        });
    };
    /**
     * Start the destroy timer.
     * @private
     * @param {Number} [timeout=60] timeout in seconds.
     */
    MasterKey.prototype.start = function (timeout) {
        var _this = this;
        if (!timeout)
            timeout = 60;
        this.stop();
        if (timeout === -1)
            return;
        assert((timeout >>> 0) === timeout);
        this.until = util.now() + timeout;
        this.timer = setTimeout(function () { return _this.lock(); }, timeout * 1000);
    };
    /**
     * Stop the destroy timer.
     * @private
     */
    MasterKey.prototype.stop = function () {
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
            this.until = 0;
        }
    };
    /**
     * Derive an aes key based on params.
     * @param {String|Buffer} passphrase
     * @returns {Promise}
     */
    MasterKey.prototype.derive = function (passwd) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, n, r, p;
            return __generator(this, function (_a) {
                salt = MasterKey.SALT;
                n = this.n;
                r = this.r;
                p = this.p;
                if (typeof passwd === 'string')
                    passwd = Buffer.from(passwd, 'utf8');
                switch (this.alg) {
                    case MasterKey.alg.PBKDF2:
                        return [2 /*return*/, pbkdf2.deriveAsync(sha256, passwd, salt, n, 32)];
                    case MasterKey.alg.SCRYPT:
                        return [2 /*return*/, scrypt.deriveAsync(passwd, salt, n, r, p, 32)];
                    default:
                        throw new Error("Unknown algorithm: ".concat(this.alg, "."));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Encrypt data with in-memory aes key.
     * @param {Buffer} data
     * @param {Buffer} iv
     * @returns {Buffer}
     */
    MasterKey.prototype.encipher = function (data, iv) {
        if (!this.aesKey)
            return null;
        return aes.encipher(data, this.aesKey, iv.slice(0, 16));
    };
    /**
     * Decrypt data with in-memory aes key.
     * @param {Buffer} data
     * @param {Buffer} iv
     * @returns {Buffer}
     */
    MasterKey.prototype.decipher = function (data, iv) {
        if (!this.aesKey)
            return null;
        return aes.decipher(data, this.aesKey, iv.slice(0, 16));
    };
    /**
     * Destroy the key by zeroing the
     * privateKey and chainCode. Stop
     * the timer if there is one.
     * @returns {Promise}
     */
    MasterKey.prototype.lock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._lock()];
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
     * Destroy the key by zeroing the
     * privateKey and chainCode. Stop
     * the timer if there is one.
     */
    MasterKey.prototype._lock = function () {
        if (!this.encrypted) {
            assert(this.timer == null);
            assert(this.key);
            return;
        }
        this.stop();
        if (this.key) {
            this.key.destroy(true);
            this.key = null;
        }
        if (this.aesKey) {
            cleanse(this.aesKey);
            this.aesKey = null;
        }
    };
    /**
     * Destroy the key permanently.
     */
    MasterKey.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.lock()];
                    case 1:
                        _a.sent();
                        this.locker.destroy();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt the key permanently.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @returns {Promise}
     */
    MasterKey.prototype.decrypt = function (passphrase, clean) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._decrypt(passphrase, clean)];
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
     * Decrypt the key permanently without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @returns {Promise}
     */
    MasterKey.prototype._decrypt = function (passphrase, clean) {
        return __awaiter(this, void 0, void 0, function () {
            var key, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.encrypted)
                            throw new Error('Master key is not encrypted.');
                        if (!passphrase)
                            throw new Error('No passphrase provided.');
                        this._lock();
                        return [4 /*yield*/, this.derive(passphrase)];
                    case 1:
                        key = _a.sent();
                        data = aes.decipher(this.ciphertext, key, this.iv);
                        this.readKey(data);
                        this.encrypted = false;
                        this.iv = null;
                        this.ciphertext = null;
                        if (!clean) {
                            cleanse(key);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, key];
                }
            });
        });
    };
    /**
     * Encrypt the key permanently.
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @returns {Promise}
     */
    MasterKey.prototype.encrypt = function (passphrase, clean) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._encrypt(passphrase, clean)];
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
     * Encrypt the key permanently without a lock.
     * @private
     * @param {Buffer|String} passphrase - Zero this yourself.
     * @returns {Promise}
     */
    MasterKey.prototype._encrypt = function (passphrase, clean) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, iv, key, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.encrypted)
                            throw new Error('Master key is already encrypted.');
                        if (!passphrase)
                            throw new Error('No passphrase provided.');
                        raw = this.writeKey();
                        iv = random.randomBytes(16);
                        this.stop();
                        return [4 /*yield*/, this.derive(passphrase)];
                    case 1:
                        key = _a.sent();
                        data = aes.encipher(raw, key, iv);
                        this.key = null;
                        this.mnemonic = null;
                        this.encrypted = true;
                        this.iv = iv;
                        this.ciphertext = data;
                        if (!clean) {
                            cleanse(key);
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, key];
                }
            });
        });
    };
    /**
     * Calculate key serialization size.
     * @returns {Number}
     */
    MasterKey.prototype.keySize = function () {
        var size = 0;
        size += 64;
        size += 1;
        if (this.mnemonic)
            size += this.mnemonic.getSize();
        return size;
    };
    /**
     * Serialize key and menmonic to a single buffer.
     * @returns {Buffer}
     */
    MasterKey.prototype.writeKey = function () {
        var bw = bio.write(this.keySize());
        bw.writeBytes(this.key.chainCode);
        bw.writeBytes(this.key.privateKey);
        if (this.mnemonic) {
            bw.writeU8(1);
            this.mnemonic.toWriter(bw);
        }
        else {
            bw.writeU8(0);
        }
        return bw.render();
    };
    /**
     * Inject properties from serialized key.
     * @param {Buffer} data
     */
    MasterKey.prototype.readKey = function (data) {
        var br = bio.read(data);
        this.key = new HDPrivateKey();
        if (isLegacy(data)) {
            br.seek(13);
            this.key.chainCode = br.readBytes(32);
            assert(br.readU8() === 0);
            this.key.privateKey = br.readBytes(32);
        }
        else {
            this.key.chainCode = br.readBytes(32);
            this.key.privateKey = br.readBytes(32);
        }
        this.key.publicKey = secp256k1.publicKeyCreate(this.key.privateKey, true);
        if (br.readU8() === 1)
            this.mnemonic = Mnemonic.fromReader(br);
        return this;
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    MasterKey.prototype.getSize = function () {
        var size = 0;
        if (this.encrypted) {
            size += 1;
            size += encoding.sizeVarBytes(this.iv);
            size += encoding.sizeVarBytes(this.ciphertext);
            size += 13;
            return size;
        }
        size += 1;
        size += this.keySize();
        return size;
    };
    /**
     * Serialize the key in the form of:
     * `[enc-flag][iv?][ciphertext?][extended-key?]`
     * @returns {Buffer}
     */
    MasterKey.prototype.toWriter = function (bw) {
        if (this.encrypted) {
            bw.writeU8(1);
            bw.writeVarBytes(this.iv);
            bw.writeVarBytes(this.ciphertext);
            bw.writeU8(this.alg);
            bw.writeU32(this.n);
            bw.writeU32(this.r);
            bw.writeU32(this.p);
            return bw;
        }
        bw.writeU8(0);
        bw.writeBytes(this.key.chainCode);
        bw.writeBytes(this.key.privateKey);
        if (this.mnemonic) {
            bw.writeU8(1);
            this.mnemonic.toWriter(bw);
        }
        else {
            bw.writeU8(0);
        }
        return bw;
    };
    /**
     * Serialize the key in the form of:
     * `[enc-flag][iv?][ciphertext?][extended-key?]`
     * @returns {Buffer}
     */
    MasterKey.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} raw
     */
    MasterKey.prototype.fromReader = function (br) {
        this.encrypted = br.readU8() === 1;
        if (this.encrypted) {
            this.iv = br.readVarBytes();
            this.ciphertext = br.readVarBytes();
            this.alg = br.readU8();
            assert(this.alg < MasterKey.algByVal.length);
            this.n = br.readU32();
            this.r = br.readU32();
            this.p = br.readU32();
            return this;
        }
        this.key = new HDPrivateKey();
        this.key.chainCode = br.readBytes(32);
        this.key.privateKey = br.readBytes(32);
        this.key.publicKey = secp256k1.publicKeyCreate(this.key.privateKey, true);
        if (br.readU8() === 1)
            this.mnemonic = Mnemonic.fromReader(br);
        return this;
    };
    /**
     * Instantiate master key from serialized data.
     * @returns {MasterKey}
     */
    MasterKey.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} raw
     */
    MasterKey.prototype.fromRaw = function (raw) {
        return this.fromReader(bio.read(raw));
    };
    /**
     * Instantiate master key from serialized data.
     * @returns {MasterKey}
     */
    MasterKey.fromRaw = function (raw) {
        return new this().fromRaw(raw);
    };
    /**
     * Inject properties from an HDPrivateKey.
     * @private
     * @param {HDPrivateKey} key
     * @param {Mnemonic?} mnemonic
     */
    MasterKey.prototype.fromKey = function (key, mnemonic) {
        this.encrypted = false;
        this.iv = null;
        this.ciphertext = null;
        this.key = key;
        this.mnemonic = mnemonic || null;
        return this;
    };
    /**
     * Instantiate master key from an HDPrivateKey.
     * @param {HDPrivateKey} key
     * @param {Mnemonic?} mnemonic
     * @returns {MasterKey}
     */
    MasterKey.fromKey = function (key, mnemonic) {
        return new this().fromKey(key, mnemonic);
    };
    /**
     * Convert master key to a jsonifiable object.
     * @param {Network?} network
     * @param {Boolean?} unsafe - Whether to include
     * the key data in the JSON.
     * @returns {Object}
     */
    MasterKey.prototype.toJSON = function (network, unsafe) {
        if (!this.key) {
            return {
                encrypted: true,
                until: this.until,
                iv: this.iv.toString('hex'),
                ciphertext: unsafe ? this.ciphertext.toString('hex') : undefined,
                algorithm: MasterKey.algByVal[this.alg].toLowerCase(),
                n: this.n,
                r: this.r,
                p: this.p
            };
        }
        return {
            encrypted: false,
            key: unsafe ? this.key.toJSON(network) : undefined,
            mnemonic: unsafe && this.mnemonic ? this.mnemonic.toJSON() : undefined
        };
    };
    /**
     * Inspect the key.
     * @returns {Object}
     */
    MasterKey.prototype[inspectSymbol] = function () {
        var json = this.toJSON(null, true);
        if (this.key)
            json.key = this.key.toJSON();
        if (this.mnemonic)
            json.mnemonic = this.mnemonic.toJSON();
        return json;
    };
    /**
     * Test whether an object is a MasterKey.
     * @param {Object} obj
     * @returns {Boolean}
     */
    MasterKey.isMasterKey = function (obj) {
        return obj instanceof MasterKey;
    };
    return MasterKey;
}());
/**
 * Key derivation salt.
 * @const {Buffer}
 * @default
 */
MasterKey.SALT = Buffer.from('bcoin', 'ascii');
/**
 * Key derivation algorithms.
 * @enum {Number}
 * @default
 */
MasterKey.alg = {
    PBKDF2: 0,
    SCRYPT: 1
};
/**
 * Key derivation algorithms by value.
 * @enum {String}
 * @default
 */
MasterKey.algByVal = [
    'PBKDF2',
    'SCRYPT'
];
/*
 * Helpers
 */
function isLegacy(data) {
    if (data.length < 82)
        return false;
    var key = data.slice(0, 78);
    var chk = data.readUInt32LE(78, true);
    var hash = hash256.digest(key);
    return hash.readUInt32LE(0, true) === chk;
}
/*
 * Expose
 */
module.exports = MasterKey;
