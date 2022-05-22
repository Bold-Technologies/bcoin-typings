/*!
 * coin.js - coin object for bcoin
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
var bio = require('bufio');
var util = require('../utils/util');
var Amount = require('../btc/amount');
var Output = require('./output');
var Network = require('../protocol/network');
var consensus = require('../protocol/consensus');
var Outpoint = require('./outpoint');
var inspectSymbol = require('../utils').inspectSymbol;
var encoding = require('bufio').encoding;
/**
 * Coin
 * Represents an unspent output.
 * @alias module:primitives.Coin
 * @extends Output
 * @property {Number} version
 * @property {Number} height
 * @property  {SatoshiAmount} value
 * @property {Script} script
 * @property {Boolean} coinbase
 * @property {Hash} hash
 * @property {Number} index
 */
var Coin = /** @class */ (function (_super) {
    __extends(Coin, _super);
    /**
     * Create a coin.
     * @constructor
     * @param {Object} options
     */
    function Coin(options) {
        var _this = _super.call(this) || this;
        _this.version = 1;
        _this.height = -1;
        _this.coinbase = false;
        _this.hash = consensus.ZERO_HASH;
        _this.index = 0;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject options into coin.
     * @private
     * @param {Object} options
     */
    Coin.prototype.fromOptions = function (options) {
        assert(options, 'Coin data is required.');
        if (options.version != null) {
            assert((options.version >>> 0) === options.version, 'Version must be a uint32.');
            this.version = options.version;
        }
        if (options.height != null) {
            if (options.height !== -1) {
                assert((options.height >>> 0) === options.height, 'Height must be a uint32.');
                this.height = options.height;
            }
            else {
                this.height = -1;
            }
        }
        if (options.value != null) {
            assert(Number.isSafeInteger(options.value) && options.value >= 0, 'Value must be a uint64.');
            this.value = options.value;
        }
        if (options.script)
            this.script.fromOptions(options.script);
        if (options.coinbase != null) {
            assert(typeof options.coinbase === 'boolean', 'Coinbase must be a boolean.');
            this.coinbase = options.coinbase;
        }
        if (options.hash != null) {
            assert(Buffer.isBuffer(options.hash));
            this.hash = options.hash;
        }
        if (options.index != null) {
            assert((options.index >>> 0) === options.index, 'Index must be a uint32.');
            this.index = options.index;
        }
        return this;
    };
    /**
     * Instantiate Coin from options object.
     * @private
     * @param {Object} options
     */
    Coin.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clone the coin.
     * @private
     * @returns {Coin}
     */
    Coin.prototype.clone = function () {
        assert(false, 'Coins are not cloneable.');
    };
    /**
     * Calculate number of confirmations since coin was created.
     * @param {Number?} height - Current chain height. Network
     * height is used if not passed in.
     * @return {Number}
     */
    Coin.prototype.getDepth = function (height) {
        assert(typeof height === 'number', 'Must pass a height.');
        if (this.height === -1)
            return 0;
        if (height === -1)
            return 0;
        if (height < this.height)
            return 0;
        return height - this.height + 1;
    };
    /**
     * Serialize coin to a key
     * suitable for a hash table.
     * @returns {String}
     */
    Coin.prototype.toKey = function () {
        return Outpoint.toKey(this.hash, this.index);
    };
    /**
     * Inject properties from hash table key.
     * @private
     * @param {String} key
     * @returns {Coin}
     */
    Coin.prototype.fromKey = function (key) {
        var _a = Outpoint.fromKey(key), hash = _a.hash, index = _a.index;
        this.hash = hash;
        this.index = index;
        return this;
    };
    /**
     * Instantiate coin from hash table key.
     * @param {String} key
     * @returns {Coin}
     */
    Coin.fromKey = function (key) {
        return new this().fromKey(key);
    };
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    Coin.prototype.rhash = function () {
        return util.revHex(this.hash);
    };
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    Coin.prototype.txid = function () {
        return this.rhash();
    };
    /**
     * Convert the coin to a more user-friendly object.
     * @returns {Object}
     */
    Coin.prototype[inspectSymbol] = function () {
        return {
            type: this.getType(),
            version: this.version,
            height: this.height,
            value: Amount.btc(this.value),
            script: this.script,
            coinbase: this.coinbase,
            hash: this.hash ? util.revHex(this.hash) : null,
            index: this.index,
            address: this.getAddress()
        };
    };
    /**
     * Convert the coin to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    Coin.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the coin to an object suitable
     * for JSON serialization. Note that the hash
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {Boolean} minimal
     * @returns {Object}
     */
    Coin.prototype.getJSON = function (network, minimal) {
        var addr = this.getAddress();
        network = Network.get(network);
        if (addr)
            addr = addr.toString(network);
        return {
            version: this.version,
            height: this.height,
            value: this.value,
            script: this.script.toJSON(),
            address: addr,
            coinbase: this.coinbase,
            hash: !minimal ? this.rhash() : undefined,
            index: !minimal ? this.index : undefined
        };
    };
    /**
     * Inject JSON properties into coin.
     * @private
     * @param {Object} json
     */
    Coin.prototype.fromJSON = function (json) {
        assert(json, 'Coin data required.');
        assert((json.version >>> 0) === json.version, 'Version must be a uint32.');
        assert(json.height === -1 || (json.height >>> 0) === json.height, 'Height must be a uint32.');
        assert(Number.isSafeInteger(json.value) && json.value >= 0, 'Value must be a uint64.');
        assert(typeof json.coinbase === 'boolean', 'Coinbase must be a boolean.');
        this.version = json.version;
        this.height = json.height;
        this.value = json.value;
        this.script.fromJSON(json.script);
        this.coinbase = json.coinbase;
        if (json.hash != null) {
            assert(typeof json.hash === 'string', 'Hash must be a string.');
            assert(json.hash.length === 64, 'Hash must be a string.');
            assert((json.index >>> 0) === json.index, 'Index must be a uint32.');
            this.hash = util.fromRev(json.hash);
            this.index = json.index;
        }
        return this;
    };
    /**
     * Instantiate an Coin from a jsonified coin object.
     * @param {Object} json - The jsonified coin object.
     * @returns {Coin}
     */
    Coin.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Calculate size of coin.
     * @returns {Number}
     */
    Coin.prototype.getSize = function () {
        return 17 + this.script.getVarSize();
    };
    /**
     * Estimate spending size.
     * @param {Function?} getAccount - Returns account that can spend
     * from a given address.
     * @returns {Number}
     */
    Coin.prototype.estimateSpendingSize = function (getAccount) {
        return __awaiter(this, void 0, void 0, function () {
            var total, scale, script, m, size, size, n, type, witness, account, size, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        total = 0;
                        // Outpoint (hash and index) + sequence
                        total += 32 + 4 + 4;
                        scale = consensus.WITNESS_SCALE_FACTOR;
                        script = this.script;
                        // P2PK
                        if (script.isPubkey()) {
                            // varint script size
                            total += 1;
                            // OP_PUSHDATA0 [signature]
                            total += 1 + 73;
                            return [2 /*return*/, total];
                        }
                        // P2PKH
                        if (script.isPubkeyhash()) {
                            // varint script size
                            total += 1;
                            // OP_PUSHDATA0 [signature]
                            total += 1 + 73;
                            // OP_PUSHDATA0 [key]
                            total += 1 + 33;
                            return [2 /*return*/, total];
                        }
                        m = script.getMultisig()[0];
                        if (m !== -1) {
                            size = 0;
                            // Bare Multisig
                            // OP_0
                            size += 1;
                            // OP_PUSHDATA0 [signature] ...
                            size += (1 + 73) * m;
                            // varint len
                            size += encoding.sizeVarint(size);
                            total += size;
                            return [2 /*return*/, total];
                        }
                        // P2WPKH
                        if (script.isWitnessPubkeyhash()) {
                            size = 0;
                            // legacy script size (0x00)
                            total += 1;
                            // varint-items-len
                            size += 1;
                            // varint-len [signature]
                            size += 1 + 73;
                            // varint-len [key]
                            size += 1 + 33;
                            // vsize
                            size = (size + scale - 1) / scale | 0;
                            total += size;
                            return [2 /*return*/, total];
                        }
                        // Assume 2-of-3 multisig for P2SH
                        m = 2;
                        n = 3;
                        type = 1;
                        witness = false;
                        if (!getAccount) return [3 /*break*/, 2];
                        return [4 /*yield*/, getAccount(script.getAddress())];
                    case 1:
                        account = _a.sent();
                        // if account is defined,
                        // update m, n, type and witness
                        if (account) {
                            m = account.m;
                            n = account.n;
                            type = account.type;
                            witness = account.witness;
                        }
                        _a.label = 2;
                    case 2:
                        // P2SH
                        if (script.isScripthash()) {
                            size = 0;
                            if (!witness) {
                                // Multisig
                                // OP_0
                                size += 1;
                                // varint-len [signature] ...
                                size += (1 + 73) * m;
                                // script (OP_PUSHDATA1, varint length)
                                size += 1 + 1;
                                // OP_2
                                size += 1;
                                // varint [pubkey] ...
                                size += (1 + 33) * n;
                                // OP_3 OP_CHECKMULTISIG
                                size += 1 + 1;
                                total += size;
                            }
                            else {
                                // 0 = PubKeyHash, 1 = Multisig
                                if (type) {
                                    // Multisig
                                    // scriptSig (varint-len, OP_0, varint-len, scriptHash)
                                    total += 1 + 1 + 1 + 32;
                                    // OP_0
                                    size += 1;
                                    // OP_PUSHDATA0 [signature] ...
                                    size += (1 + 73) * m;
                                    // script (OP_PUSHDATA1, varint length)
                                    size += 1 + 1;
                                    // OP_2
                                    size += 1;
                                    // [pubkey] ...
                                    size += (1 + 33) * n;
                                    // OP_3 OP_CHECKMULTISIG
                                    size += 1 + 1;
                                    // vsize
                                    size = (size + scale - 1) / scale | 0;
                                    total += size;
                                }
                                else {
                                    // PubKeyHash
                                    // scriptSig (varint-len, OP_0, varint-len, pubKeyHash)
                                    total += 1 + 1 + 1 + 32;
                                    // varint script size
                                    size += 1;
                                    // OP_PUSHDATA0 [signature]
                                    size += 1 + 73;
                                    // OP_PUSHDATA0 [key]
                                    size += 1 + 33;
                                    // vsize
                                    size = (size + scale - 1) / scale | 0;
                                    total += size;
                                }
                            }
                            return [2 /*return*/, total];
                        }
                        // P2WSH
                        if (script.isWitnessScripthash()) {
                            // legacy script size (0x00)
                            total += 1;
                            size = 0;
                            // varint-items-len
                            size += 1;
                            // OP_0
                            size += 1;
                            // OP_PUSHDATA0 [signature] ...
                            size += (1 + 73) * m;
                            // script (OP_PUSHDATA1, varint length)
                            size += 1 + 1;
                            // OP_2
                            size += 1;
                            // [pubkey] ...
                            size += (1 + 33) * n;
                            // OP_3 OP_CHECKMULTISIG
                            size += 1 + 1;
                            // vsize
                            size = (size + scale - 1) / scale | 0;
                            total += size;
                            return [2 /*return*/, total];
                        }
                        // Unknown.
                        // Assume it's a P2PKH :(
                        total += 110;
                        return [2 /*return*/, total];
                }
            });
        });
    };
    /**
     * Write the coin to a buffer writer.
     * @param {BufferWriter} bw
     */
    Coin.prototype.toWriter = function (bw) {
        var height = this.height;
        if (height === -1)
            height = 0x7fffffff;
        bw.writeU32(this.version);
        bw.writeU32(height);
        bw.writeI64(this.value);
        bw.writeVarBytes(this.script.toRaw());
        bw.writeU8(this.coinbase ? 1 : 0);
        return bw;
    };
    /**
     * Serialize the coin.
     * @returns {Buffer|String}
     */
    Coin.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from serialized buffer writer.
     * @private
     * @param {BufferReader} br
     */
    Coin.prototype.fromReader = function (br) {
        this.version = br.readU32();
        this.height = br.readU32();
        this.value = br.readI64();
        this.script.fromRaw(br.readVarBytes());
        this.coinbase = br.readU8() === 1;
        if (this.height === 0x7fffffff)
            this.height = -1;
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Coin.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate a coin from a buffer reader.
     * @param {BufferReader} br
     * @returns {Coin}
     */
    Coin.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Coin}
     */
    Coin.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     */
    Coin.prototype.fromTX = function (tx, index, height) {
        assert(typeof index === 'number');
        assert(typeof height === 'number');
        assert(index >= 0 && index < tx.outputs.length);
        this.version = tx.version;
        this.height = height;
        this.value = tx.outputs[index].value;
        this.script = tx.outputs[index].script;
        this.coinbase = tx.isCoinbase();
        this.hash = tx.hash();
        this.index = index;
        return this;
    };
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @returns {Coin}
     */
    Coin.fromTX = function (tx, index, height) {
        return new this().fromTX(tx, index, height);
    };
    /**
     * Test an object to see if it is a Coin.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Coin.isCoin = function (obj) {
        return obj instanceof Coin;
    };
    return Coin;
}(Output));
/*
 * Expose
 */
module.exports = Coin;
