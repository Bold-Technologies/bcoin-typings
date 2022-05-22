/*!
 * txdb.js - persistent transaction pool
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
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
var BufferSet = require('buffer-map').BufferSet;
var util = require('../utils/util');
var Amount = require('../btc/amount');
var CoinView = require('../coins/coinview');
var Coin = require('../primitives/coin');
var Outpoint = require('../primitives/outpoint');
var records = require('./records');
var layout = require('./layout').txdb;
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var TXRecord = records.TXRecord;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * TXDB
 * @alias module:wallet.TXDB
 */
var TXDB = /** @class */ (function () {
    /**
     * Create a TXDB.
     * @constructor
     * @param {WalletDB} wdb
     */
    function TXDB(wdb, wid) {
        this.wdb = wdb;
        this.db = wdb.db;
        this.logger = wdb.logger;
        this.wid = wid || 0;
        this.bucket = null;
        this.wallet = null;
        this.locked = new BufferSet();
    }
    /**
     * Open TXDB.
     * @returns {Promise}
     */
    TXDB.prototype.open = function (wallet) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix;
            return __generator(this, function (_a) {
                prefix = layout.prefix.encode(wallet.wid);
                this.wid = wallet.wid;
                this.bucket = this.db.bucket(prefix);
                this.wallet = wallet;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Emit transaction event.
     * @private
     * @param {String} event
     * @param {Object} data
     * @param {Details} details
     */
    TXDB.prototype.emit = function (event, data, details) {
        this.wdb.emit(event, this.wallet, data, details);
        this.wallet.emit(event, data, details);
    };
    /**
     * Get wallet path for output.
     * @param {Output} output
     * @returns {Promise} - Returns {@link Path}.
     */
    TXDB.prototype.getPath = function (output) {
        var hash = output.getHash();
        if (!hash)
            return null;
        return this.wdb.getPath(this.wid, hash);
    };
    /**
     * Test whether path exists for output.
     * @param {Output} output
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.hasPath = function (output) {
        var hash = output.getHash();
        if (!hash)
            return false;
        return this.wdb.hasPath(this.wid, hash);
    };
    /**
     * Save credit.
     * @param {Credit} credit
     * @param {Path} path
     */
    TXDB.prototype.saveCredit = function (b, credit, path) {
        return __awaiter(this, void 0, void 0, function () {
            var coin;
            return __generator(this, function (_a) {
                coin = credit.coin;
                b.put(layout.c.encode(coin.hash, coin.index), credit.toRaw());
                b.put(layout.C.encode(path.account, coin.hash, coin.index), null);
                return [2 /*return*/, this.addOutpointMap(b, coin.hash, coin.index)];
            });
        });
    };
    /**
     * Remove credit.
     * @param {Credit} credit
     * @param {Path} path
     */
    TXDB.prototype.removeCredit = function (b, credit, path) {
        return __awaiter(this, void 0, void 0, function () {
            var coin;
            return __generator(this, function (_a) {
                coin = credit.coin;
                b.del(layout.c.encode(coin.hash, coin.index));
                b.del(layout.C.encode(path.account, coin.hash, coin.index));
                return [2 /*return*/, this.removeOutpointMap(b, coin.hash, coin.index)];
            });
        });
    };
    /**
     * Spend credit.
     * @param {Credit} credit
     * @param {TX} tx
     * @param {Number} index
     */
    TXDB.prototype.spendCredit = function (b, credit, tx, index) {
        var prevout = tx.inputs[index].prevout;
        var spender = Outpoint.fromTX(tx, index);
        b.put(layout.s.encode(prevout.hash, prevout.index), spender.toRaw());
        b.put(layout.d.encode(spender.hash, spender.index), credit.coin.toRaw());
    };
    /**
     * Unspend credit.
     * @param {TX} tx
     * @param {Number} index
     */
    TXDB.prototype.unspendCredit = function (b, tx, index) {
        var prevout = tx.inputs[index].prevout;
        var spender = Outpoint.fromTX(tx, index);
        b.del(layout.s.encode(prevout.hash, prevout.index));
        b.del(layout.d.encode(spender.hash, spender.index));
    };
    /**
     * Write input record.
     * @param {TX} tx
     * @param {Number} index
     */
    TXDB.prototype.writeInput = function (b, tx, index) {
        return __awaiter(this, void 0, void 0, function () {
            var prevout, spender;
            return __generator(this, function (_a) {
                prevout = tx.inputs[index].prevout;
                spender = Outpoint.fromTX(tx, index);
                b.put(layout.s.encode(prevout.hash, prevout.index), spender.toRaw());
                return [2 /*return*/, this.addOutpointMap(b, prevout.hash, prevout.index)];
            });
        });
    };
    /**
     * Remove input record.
     * @param {TX} tx
     * @param {Number} index
     */
    TXDB.prototype.removeInput = function (b, tx, index) {
        return __awaiter(this, void 0, void 0, function () {
            var prevout;
            return __generator(this, function (_a) {
                prevout = tx.inputs[index].prevout;
                b.del(layout.s.encode(prevout.hash, prevout.index));
                return [2 /*return*/, this.removeOutpointMap(b, prevout.hash, prevout.index)];
            });
        });
    };
    /**
     * Update wallet balance.
     * @param {BalanceDelta} state
     */
    TXDB.prototype.updateBalance = function (b, state) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWalletBalance()];
                    case 1:
                        balance = _a.sent();
                        state.applyTo(balance);
                        b.put(layout.R.encode(), balance.toRaw());
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    /**
     * Update account balance.
     * @param {Number} acct
     * @param {Balance} delta
     */
    TXDB.prototype.updateAccountBalance = function (b, acct, delta) {
        return __awaiter(this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountBalance(acct)];
                    case 1:
                        balance = _a.sent();
                        delta.applyTo(balance);
                        b.put(layout.r.encode(acct), balance.toRaw());
                        return [2 /*return*/, balance];
                }
            });
        });
    };
    /**
     * Test a whether a coin has been spent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.getSpent = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.s.encode(hash, index))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, Outpoint.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Test a whether a coin has been spent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.isSpent = function (hash, index) {
        return this.bucket.has(layout.s.encode(hash, index));
    };
    /**
     * Append to global map.
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.addBlockMap = function (b, height) {
        return this.wdb.addBlockMap(b.root(), height, this.wid);
    };
    /**
     * Remove from global map.
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.removeBlockMap = function (b, height) {
        return this.wdb.removeBlockMap(b.root(), height, this.wid);
    };
    /**
     * Append to global map.
     * @param {Hash} hash
     * @returns {Promise}
     */
    TXDB.prototype.addTXMap = function (b, hash) {
        return this.wdb.addTXMap(b.root(), hash, this.wid);
    };
    /**
     * Remove from global map.
     * @param {Hash} hash
     * @returns {Promise}
     */
    TXDB.prototype.removeTXMap = function (b, hash) {
        return this.wdb.removeTXMap(b.root(), hash, this.wid);
    };
    /**
     * Append to global map.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    TXDB.prototype.addOutpointMap = function (b, hash, index) {
        return this.wdb.addOutpointMap(b.root(), hash, index, this.wid);
    };
    /**
     * Remove from global map.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    TXDB.prototype.removeOutpointMap = function (b, hash, index) {
        return this.wdb.removeOutpointMap(b.root(), hash, index, this.wid);
    };
    /**
     * List block records.
     * @returns {Promise}
     */
    TXDB.prototype.getBlocks = function () {
        return this.bucket.keys({
            gte: layout.b.min(),
            lte: layout.b.max(),
            parse: function (key) { return layout.b.decode(key)[0]; }
        });
    };
    /**
     * Get block record.
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.getBlock = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.b.encode(height))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, BlockRecord.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Append to the global block record.
     * @param {Hash} hash
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    TXDB.prototype.addBlock = function (b, hash, block) {
        return __awaiter(this, void 0, void 0, function () {
            var key, data, blk, raw, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = layout.b.encode(block.height);
                        return [4 /*yield*/, this.bucket.get(key)];
                    case 1:
                        data = _a.sent();
                        if (!data) {
                            blk = BlockRecord.fromMeta(block);
                            blk.add(hash);
                            b.put(key, blk.toRaw());
                            return [2 /*return*/];
                        }
                        raw = Buffer.allocUnsafe(data.length + 32);
                        data.copy(raw, 0);
                        size = raw.readUInt32LE(40, true);
                        raw.writeUInt32LE(size + 1, 40, true);
                        hash.copy(raw, data.length);
                        b.put(key, raw);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove from the global block record.
     * @param {Hash} hash
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.removeBlock = function (b, hash, height) {
        return __awaiter(this, void 0, void 0, function () {
            var key, data, size, raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = layout.b.encode(height);
                        return [4 /*yield*/, this.bucket.get(key)];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/];
                        size = data.readUInt32LE(40, true);
                        assert(size > 0);
                        assert(data.slice(-32).equals(hash));
                        if (size === 1) {
                            b.del(key);
                            return [2 /*return*/];
                        }
                        raw = data.slice(0, -32);
                        raw.writeUInt32LE(size - 1, 40, true);
                        b.put(key, raw);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove from the global block record.
     * @param {Hash} hash
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.spliceBlock = function (b, hash, height) {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(height)];
                    case 1:
                        block = _a.sent();
                        if (!block)
                            return [2 /*return*/];
                        if (!block.remove(hash))
                            return [2 /*return*/];
                        if (block.hashes.size === 0) {
                            b.del(layout.b.encode(height));
                            return [2 /*return*/];
                        }
                        b.put(layout.b.encode(height), block.toRaw());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add transaction without a batch.
     * @private
     * @param {TX} tx
     * @returns {Promise}
     */
    TXDB.prototype.add = function (tx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, existing, wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = tx.hash();
                        return [4 /*yield*/, this.getTX(hash)];
                    case 1:
                        existing = _a.sent();
                        assert(!tx.mutable, 'Cannot add mutable TX to wallet.');
                        if (existing) {
                            // Existing tx is already confirmed. Ignore.
                            if (existing.height !== -1)
                                return [2 /*return*/, null];
                            // The incoming tx won't confirm the
                            // existing one anyway. Ignore.
                            if (!block)
                                return [2 /*return*/, null];
                            // Confirm transaction.
                            return [2 /*return*/, this.confirm(existing, block)];
                        }
                        wtx = TXRecord.fromTX(tx, block);
                        if (!!block) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.removeConflicts(tx, true)];
                    case 2:
                        // Potentially remove double-spenders.
                        // Only remove if they're not confirmed.
                        if (!(_a.sent()))
                            return [2 /*return*/, null];
                        return [3 /*break*/, 5];
                    case 3: 
                    // Potentially remove double-spenders.
                    return [4 /*yield*/, this.removeConflicts(tx, false)];
                    case 4:
                        // Potentially remove double-spenders.
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // Finally we can do a regular insertion.
                    return [2 /*return*/, this.insert(wtx, block)];
                }
            });
        });
    };
    /**
     * Insert transaction.
     * @private
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    TXDB.prototype.insert = function (wtx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var b, tx, hash, height, details, state, own, i, input, _a, hash_1, index, credit, coin, path, i, output, path, credit, _i, _b, _c, acct, delta, balance;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        b = this.bucket.batch();
                        tx = wtx.tx, hash = wtx.hash;
                        height = block ? block.height : -1;
                        details = new Details(wtx, block);
                        state = new BalanceDelta();
                        own = false;
                        if (!!tx.isCoinbase()) return [3 /*break*/, 12];
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 12];
                        input = tx.inputs[i];
                        _a = input.prevout, hash_1 = _a.hash, index = _a.index;
                        return [4 /*yield*/, this.getCredit(hash_1, index)];
                    case 2:
                        credit = _d.sent();
                        if (!!credit) return [3 /*break*/, 5];
                        if (!!block) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.writeInput(b, tx, i)];
                    case 3:
                        _d.sent();
                        _d.label = 4;
                    case 4: return [3 /*break*/, 11];
                    case 5:
                        coin = credit.coin;
                        return [4 /*yield*/, this.getPath(coin)];
                    case 6:
                        path = _d.sent();
                        assert(path);
                        // Build the tx details object
                        // as we go, for speed.
                        details.setInput(i, path, coin);
                        // Write an undo coin for the credit
                        // and add it to the stxo set.
                        this.spendCredit(b, credit, tx, i);
                        // Unconfirmed balance should always
                        // be updated as it reflects the on-chain
                        // balance _and_ mempool balance assuming
                        // everything in the mempool were to confirm.
                        state.tx(path, 1);
                        state.coin(path, -1);
                        state.unconfirmed(path, -coin.value);
                        if (!!block) return [3 /*break*/, 8];
                        // If the tx is not mined, we do not
                        // disconnect the coin, we simply mark
                        // a `spent` flag on the credit. This
                        // effectively prevents the mempool
                        // from altering our utxo state
                        // permanently. It also makes it
                        // possible to compare the on-chain
                        // state vs. the mempool state.
                        credit.spent = true;
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        // If the tx is mined, we can safely
                        // remove the coin being spent. This
                        // coin will be indexed as an undo
                        // coin so it can be reconnected
                        // later during a reorg.
                        state.confirmed(path, -coin.value);
                        return [4 /*yield*/, this.removeCredit(b, credit, path)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10:
                        own = true;
                        _d.label = 11;
                    case 11:
                        i++;
                        return [3 /*break*/, 1];
                    case 12:
                        i = 0;
                        _d.label = 13;
                    case 13:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 17];
                        output = tx.outputs[i];
                        return [4 /*yield*/, this.getPath(output)];
                    case 14:
                        path = _d.sent();
                        if (!path)
                            return [3 /*break*/, 16];
                        details.setOutput(i, path);
                        credit = Credit.fromTX(tx, i, height);
                        credit.own = own;
                        state.tx(path, 1);
                        state.coin(path, 1);
                        state.unconfirmed(path, output.value);
                        if (block)
                            state.confirmed(path, output.value);
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 15:
                        _d.sent();
                        _d.label = 16;
                    case 16:
                        i++;
                        return [3 /*break*/, 13];
                    case 17:
                        // If this didn't update any coins,
                        // it's not our transaction.
                        if (!state.updated())
                            return [2 /*return*/, null];
                        // Save and index the transaction record.
                        b.put(layout.t.encode(hash), wtx.toRaw());
                        b.put(layout.m.encode(wtx.mtime, hash), null);
                        if (!block)
                            b.put(layout.p.encode(hash), null);
                        else
                            b.put(layout.h.encode(height, hash), null);
                        _i = 0, _b = state.accounts;
                        _d.label = 18;
                    case 18:
                        if (!(_i < _b.length)) return [3 /*break*/, 21];
                        _c = _b[_i], acct = _c[0], delta = _c[1];
                        return [4 /*yield*/, this.updateAccountBalance(b, acct, delta)];
                    case 19:
                        _d.sent();
                        b.put(layout.T.encode(acct, hash), null);
                        b.put(layout.M.encode(acct, wtx.mtime, hash), null);
                        if (!block)
                            b.put(layout.P.encode(acct, hash), null);
                        else
                            b.put(layout.H.encode(acct, height, hash), null);
                        _d.label = 20;
                    case 20:
                        _i++;
                        return [3 /*break*/, 18];
                    case 21:
                        if (!block) return [3 /*break*/, 24];
                        return [4 /*yield*/, this.addBlockMap(b, height)];
                    case 22:
                        _d.sent();
                        return [4 /*yield*/, this.addBlock(b, tx.hash(), block)];
                    case 23:
                        _d.sent();
                        return [3 /*break*/, 26];
                    case 24: return [4 /*yield*/, this.addTXMap(b, hash)];
                    case 25:
                        _d.sent();
                        _d.label = 26;
                    case 26: return [4 /*yield*/, this.updateBalance(b, state)];
                    case 27:
                        balance = _d.sent();
                        return [4 /*yield*/, b.write()];
                    case 28:
                        _d.sent();
                        // This transaction may unlock some
                        // coins now that we've seen it.
                        this.unlockTX(tx);
                        // Emit events for potential local and
                        // websocket listeners. Note that these
                        // will only be emitted if the batch is
                        // successfully written to disk.
                        this.emit('tx', tx, details);
                        this.emit('balance', balance);
                        return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Attempt to confirm a transaction.
     * @private
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    TXDB.prototype.confirm = function (wtx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var b, tx, hash, height, details, state, own, credits, i, input, _a, hash_2, index, resolved, credit_1, credit, coin, path, i, output, path, credit, _i, _b, _c, acct, delta, balance;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        b = this.bucket.batch();
                        tx = wtx.tx, hash = wtx.hash;
                        height = block.height;
                        details = new Details(wtx, block);
                        state = new BalanceDelta();
                        own = false;
                        wtx.setBlock(block);
                        if (!!tx.isCoinbase()) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.getSpentCredits(tx)];
                    case 1:
                        credits = _d.sent();
                        i = 0;
                        _d.label = 2;
                    case 2:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 9];
                        input = tx.inputs[i];
                        _a = input.prevout, hash_2 = _a.hash, index = _a.index;
                        resolved = false;
                        if (!!credits[i]) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.removeInput(b, tx, i)];
                    case 3:
                        _d.sent();
                        return [4 /*yield*/, this.getCredit(hash_2, index)];
                    case 4:
                        credit_1 = _d.sent();
                        if (!credit_1)
                            return [3 /*break*/, 8];
                        // Add a spend record and undo coin
                        // for the coin we now know is ours.
                        // We don't need to remove the coin
                        // since it was never added in the
                        // first place.
                        this.spendCredit(b, credit_1, tx, i);
                        credits[i] = credit_1;
                        resolved = true;
                        _d.label = 5;
                    case 5:
                        credit = credits[i];
                        coin = credit.coin;
                        assert(coin.height !== -1);
                        return [4 /*yield*/, this.getPath(coin)];
                    case 6:
                        path = _d.sent();
                        assert(path);
                        own = true;
                        details.setInput(i, path, coin);
                        if (resolved) {
                            state.coin(path, -1);
                            state.unconfirmed(path, -coin.value);
                        }
                        // We can now safely remove the credit
                        // entirely, now that we know it's also
                        // been removed on-chain.
                        state.confirmed(path, -coin.value);
                        return [4 /*yield*/, this.removeCredit(b, credit, path)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9:
                        i = 0;
                        _d.label = 10;
                    case 10:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 17];
                        output = tx.outputs[i];
                        return [4 /*yield*/, this.getPath(output)];
                    case 11:
                        path = _d.sent();
                        if (!path)
                            return [3 /*break*/, 16];
                        details.setOutput(i, path);
                        return [4 /*yield*/, this.getCredit(hash, i)];
                    case 12:
                        credit = _d.sent();
                        if (!credit) {
                            // This credit didn't belong to us the first time we
                            // saw the transaction (before confirmation or rescan).
                            // Create new credit for database.
                            credit = Credit.fromTX(tx, i, height);
                            // If this tx spent any of our own coins, we "own" this output,
                            // meaning if it becomes unconfirmed, we can still confidently spend it.
                            credit.own = own;
                            // Add coin to "unconfirmed" balance (which includes confirmed coins)
                            state.coin(path, 1);
                            state.unconfirmed(path, credit.coin.value);
                        }
                        if (!credit.spent) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.updateSpentCoin(b, tx, i, height)];
                    case 13:
                        _d.sent();
                        _d.label = 14;
                    case 14:
                        // Update coin height and confirmed
                        // balance. Save once again.
                        state.confirmed(path, output.value);
                        credit.coin.height = height;
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 15:
                        _d.sent();
                        _d.label = 16;
                    case 16:
                        i++;
                        return [3 /*break*/, 10];
                    case 17:
                        // Save the new serialized transaction as
                        // the block-related properties have been
                        // updated. Also reindex for height.
                        b.put(layout.t.encode(hash), wtx.toRaw());
                        b.del(layout.p.encode(hash));
                        b.put(layout.h.encode(height, hash), null);
                        _i = 0, _b = state.accounts;
                        _d.label = 18;
                    case 18:
                        if (!(_i < _b.length)) return [3 /*break*/, 21];
                        _c = _b[_i], acct = _c[0], delta = _c[1];
                        return [4 /*yield*/, this.updateAccountBalance(b, acct, delta)];
                    case 19:
                        _d.sent();
                        b.del(layout.P.encode(acct, hash));
                        b.put(layout.H.encode(acct, height, hash), null);
                        _d.label = 20;
                    case 20:
                        _i++;
                        return [3 /*break*/, 18];
                    case 21: return [4 /*yield*/, this.removeTXMap(b, hash)];
                    case 22:
                        _d.sent();
                        return [4 /*yield*/, this.addBlockMap(b, height)];
                    case 23:
                        _d.sent();
                        return [4 /*yield*/, this.addBlock(b, tx.hash(), block)];
                    case 24:
                        _d.sent();
                        return [4 /*yield*/, this.updateBalance(b, state)];
                    case 25:
                        balance = _d.sent();
                        return [4 /*yield*/, b.write()];
                    case 26:
                        _d.sent();
                        this.unlockTX(tx);
                        this.emit('confirmed', tx, details);
                        this.emit('balance', balance);
                        return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Recursively remove a transaction
     * from the database.
     * @param {Hash} hash
     * @returns {Promise}
     */
    TXDB.prototype.remove = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTX(hash)];
                    case 1:
                        wtx = _a.sent();
                        if (!wtx)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.removeRecursive(wtx)];
                }
            });
        });
    };
    /**
     * Remove a transaction from the
     * database. Disconnect inputs.
     * @private
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    TXDB.prototype.erase = function (wtx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var b, tx, hash, height, details, state, credits, i, credit, coin, path, i, output, path, credit, _i, _a, _b, acct, delta, balance;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        b = this.bucket.batch();
                        tx = wtx.tx, hash = wtx.hash;
                        height = block ? block.height : -1;
                        details = new Details(wtx, block);
                        state = new BalanceDelta();
                        if (!!tx.isCoinbase()) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.getSpentCredits(tx)];
                    case 1:
                        credits = _c.sent();
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 9];
                        credit = credits[i];
                        if (!!credit) return [3 /*break*/, 5];
                        if (!!block) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.removeInput(b, tx, i)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        coin = credit.coin;
                        return [4 /*yield*/, this.getPath(coin)];
                    case 6:
                        path = _c.sent();
                        assert(path);
                        details.setInput(i, path, coin);
                        // Recalculate the balance, remove
                        // from stxo set, remove the undo
                        // coin, and resave the credit.
                        state.tx(path, -1);
                        state.coin(path, 1);
                        state.unconfirmed(path, coin.value);
                        if (block)
                            state.confirmed(path, coin.value);
                        this.unspendCredit(b, tx, i);
                        credit.spent = false;
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9:
                        i = 0;
                        _c.label = 10;
                    case 10:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 14];
                        output = tx.outputs[i];
                        return [4 /*yield*/, this.getPath(output)];
                    case 11:
                        path = _c.sent();
                        if (!path)
                            return [3 /*break*/, 13];
                        details.setOutput(i, path);
                        credit = Credit.fromTX(tx, i, height);
                        state.tx(path, -1);
                        state.coin(path, -1);
                        state.unconfirmed(path, -output.value);
                        if (block)
                            state.confirmed(path, -output.value);
                        return [4 /*yield*/, this.removeCredit(b, credit, path)];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 10];
                    case 14:
                        // Remove the transaction data
                        // itself as well as unindex.
                        b.del(layout.t.encode(hash));
                        b.del(layout.m.encode(wtx.mtime, hash));
                        if (!block)
                            b.del(layout.p.encode(hash));
                        else
                            b.del(layout.h.encode(height, hash));
                        _i = 0, _a = state.accounts;
                        _c.label = 15;
                    case 15:
                        if (!(_i < _a.length)) return [3 /*break*/, 18];
                        _b = _a[_i], acct = _b[0], delta = _b[1];
                        return [4 /*yield*/, this.updateAccountBalance(b, acct, delta)];
                    case 16:
                        _c.sent();
                        b.del(layout.T.encode(acct, hash));
                        b.del(layout.M.encode(acct, wtx.mtime, hash));
                        if (!block)
                            b.del(layout.P.encode(acct, hash));
                        else
                            b.del(layout.H.encode(acct, height, hash));
                        _c.label = 17;
                    case 17:
                        _i++;
                        return [3 /*break*/, 15];
                    case 18:
                        if (!block) return [3 /*break*/, 21];
                        return [4 /*yield*/, this.removeBlockMap(b, height)];
                    case 19:
                        _c.sent();
                        return [4 /*yield*/, this.spliceBlock(b, hash, height)];
                    case 20:
                        _c.sent();
                        return [3 /*break*/, 23];
                    case 21: return [4 /*yield*/, this.removeTXMap(b, hash)];
                    case 22:
                        _c.sent();
                        _c.label = 23;
                    case 23: return [4 /*yield*/, this.updateBalance(b, state)];
                    case 24:
                        balance = _c.sent();
                        return [4 /*yield*/, b.write()];
                    case 25:
                        _c.sent();
                        this.emit('remove tx', tx, details);
                        this.emit('balance', balance);
                        return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Remove a transaction and recursively
     * remove all of its spenders.
     * @private
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    TXDB.prototype.removeRecursive = function (wtx) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, hash, i, spent, stx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = wtx.tx, hash = wtx.hash;
                        return [4 /*yield*/, this.hasTX(hash)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, null];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getSpent(hash, i)];
                    case 3:
                        spent = _a.sent();
                        if (!spent)
                            return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getTX(spent.hash)];
                    case 4:
                        stx = _a.sent();
                        assert(stx);
                        return [4 /*yield*/, this.removeRecursive(stx)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 2];
                    case 7: 
                    // Remove the spender.
                    return [2 /*return*/, this.erase(wtx, wtx.getBlock())];
                }
            });
        });
    };
    /**
     * Revert a block.
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.revert = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var block, hashes, i, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(height)];
                    case 1:
                        block = _a.sent();
                        if (!block)
                            return [2 /*return*/, 0];
                        this.logger.debug('Rescan: reverting block %d', height);
                        hashes = block.toArray();
                        i = hashes.length - 1;
                        _a.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 5];
                        hash = hashes[i];
                        return [4 /*yield*/, this.unconfirm(hash)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i--;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, hashes.length];
                }
            });
        });
    };
    /**
     * Unconfirm a transaction without a batch.
     * @private
     * @param {Hash} hash
     * @returns {Promise}
     */
    TXDB.prototype.unconfirm = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTX(hash)];
                    case 1:
                        wtx = _a.sent();
                        if (!wtx)
                            return [2 /*return*/, null];
                        if (wtx.height === -1)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.disconnect(wtx, wtx.getBlock())];
                }
            });
        });
    };
    /**
     * Unconfirm a transaction. Necessary after a reorg.
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    TXDB.prototype.disconnect = function (wtx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var b, tx, hash, height, details, state, credits, i, credit, coin, path, i, output, path, credit, _i, _a, _b, acct, delta, balance;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        b = this.bucket.batch();
                        tx = wtx.tx, hash = wtx.hash, height = wtx.height;
                        details = new Details(wtx, block);
                        state = new BalanceDelta();
                        assert(block);
                        wtx.unsetBlock();
                        if (!!tx.isCoinbase()) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getSpentCredits(tx)];
                    case 1:
                        credits = _c.sent();
                        i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 8];
                        credit = credits[i];
                        if (!!credit) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.writeInput(b, tx, i)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        coin = credit.coin;
                        assert(coin.height !== -1);
                        return [4 /*yield*/, this.getPath(coin)];
                    case 5:
                        path = _c.sent();
                        assert(path);
                        details.setInput(i, path, coin);
                        state.confirmed(path, coin.value);
                        // Resave the credit and mark it
                        // as spent in the mempool instead.
                        credit.spent = true;
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 2];
                    case 8:
                        i = 0;
                        _c.label = 9;
                    case 9:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 18];
                        output = tx.outputs[i];
                        return [4 /*yield*/, this.getPath(output)];
                    case 10:
                        path = _c.sent();
                        if (!path)
                            return [3 /*break*/, 17];
                        return [4 /*yield*/, this.getCredit(hash, i)];
                    case 11:
                        credit = _c.sent();
                        if (!!credit) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.updateSpentCoin(b, tx, i, height)];
                    case 12:
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 13:
                        if (!credit.spent) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.updateSpentCoin(b, tx, i, height)];
                    case 14:
                        _c.sent();
                        _c.label = 15;
                    case 15:
                        details.setOutput(i, path);
                        // Update coin height and confirmed
                        // balance. Save once again.
                        credit.coin.height = -1;
                        state.confirmed(path, -output.value);
                        return [4 /*yield*/, this.saveCredit(b, credit, path)];
                    case 16:
                        _c.sent();
                        _c.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 9];
                    case 18: return [4 /*yield*/, this.addTXMap(b, hash)];
                    case 19:
                        _c.sent();
                        return [4 /*yield*/, this.removeBlockMap(b, height)];
                    case 20:
                        _c.sent();
                        return [4 /*yield*/, this.removeBlock(b, tx.hash(), height)];
                    case 21:
                        _c.sent();
                        // We need to update the now-removed
                        // block properties and reindex due
                        // to the height change.
                        b.put(layout.t.encode(hash), wtx.toRaw());
                        b.put(layout.p.encode(hash), null);
                        b.del(layout.h.encode(height, hash));
                        _i = 0, _a = state.accounts;
                        _c.label = 22;
                    case 22:
                        if (!(_i < _a.length)) return [3 /*break*/, 25];
                        _b = _a[_i], acct = _b[0], delta = _b[1];
                        return [4 /*yield*/, this.updateAccountBalance(b, acct, delta)];
                    case 23:
                        _c.sent();
                        b.put(layout.P.encode(acct, hash), null);
                        b.del(layout.H.encode(acct, height, hash));
                        _c.label = 24;
                    case 24:
                        _i++;
                        return [3 /*break*/, 22];
                    case 25: return [4 /*yield*/, this.updateBalance(b, state)];
                    case 26:
                        balance = _c.sent();
                        return [4 /*yield*/, b.write()];
                    case 27:
                        _c.sent();
                        this.emit('unconfirmed', tx, details);
                        this.emit('balance', balance);
                        return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Remove spenders that have not been confirmed. We do this in the
     * odd case of stuck transactions or when a coin is double-spent
     * by a newer transaction. All previously-spending transactions
     * of that coin that are _not_ confirmed will be removed from
     * the database.
     * @private
     * @param {Hash} hash
     * @param {TX} ref - Reference tx, the tx that double-spent.
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.removeConflict = function (wtx) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = wtx.tx;
                        this.logger.warning('Handling conflicting tx: %h.', tx.hash());
                        return [4 /*yield*/, this.removeRecursive(wtx)];
                    case 1:
                        details = _a.sent();
                        if (!details)
                            return [2 /*return*/, null];
                        this.logger.warning('Removed conflict: %h.', tx.hash());
                        // Emit the _removed_ transaction.
                        this.emit('conflict', tx, details);
                        return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Retrieve coins for own inputs, remove
     * double spenders, and verify inputs.
     * @private
     * @param {TX} tx
     * @returns {Promise}
     */
    TXDB.prototype.removeConflicts = function (tx, conf) {
        return __awaiter(this, void 0, void 0, function () {
            var txid, spends, _i, _a, prevout, hash, index, spent, spender, _b, spends_1, spender;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (tx.isCoinbase())
                            return [2 /*return*/, true];
                        txid = tx.hash();
                        spends = [];
                        _i = 0, _a = tx.inputs;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash, index = prevout.index;
                        return [4 /*yield*/, this.getSpent(hash, index)];
                    case 2:
                        spent = _c.sent();
                        if (!spent)
                            return [3 /*break*/, 4];
                        // Did _we_ spend it?
                        if (spent.hash.equals(txid))
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getTX(spent.hash)];
                    case 3:
                        spender = _c.sent();
                        assert(spender);
                        if (conf && spender.height !== -1)
                            return [2 /*return*/, false];
                        spends.push(spender);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        _b = 0, spends_1 = spends;
                        _c.label = 6;
                    case 6:
                        if (!(_b < spends_1.length)) return [3 /*break*/, 9];
                        spender = spends_1[_b];
                        // Remove the double spender.
                        return [4 /*yield*/, this.removeConflict(spender)];
                    case 7:
                        // Remove the double spender.
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Lock all coins in a transaction.
     * @param {TX} tx
     */
    TXDB.prototype.lockTX = function (tx) {
        if (tx.isCoinbase())
            return;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            this.lockCoin(input.prevout);
        }
    };
    /**
     * Unlock all coins in a transaction.
     * @param {TX} tx
     */
    TXDB.prototype.unlockTX = function (tx) {
        if (tx.isCoinbase())
            return;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            this.unlockCoin(input.prevout);
        }
    };
    /**
     * Lock a single coin.
     * @param {Coin|Outpoint} coin
     */
    TXDB.prototype.lockCoin = function (coin) {
        var key = coin.toKey();
        this.locked.add(key);
    };
    /**
     * Unlock a single coin.
     * @param {Coin|Outpoint} coin
     */
    TXDB.prototype.unlockCoin = function (coin) {
        var key = coin.toKey();
        return this.locked["delete"](key);
    };
    /**
     * Unlock all coins.
     */
    TXDB.prototype.unlockCoins = function () {
        for (var _i = 0, _a = this.getLocked(); _i < _a.length; _i++) {
            var coin = _a[_i];
            this.unlockCoin(coin);
        }
    };
    /**
     * Test locked status of a single coin.
     * @param {Coin|Outpoint} coin
     */
    TXDB.prototype.isLocked = function (coin) {
        var key = coin.toKey();
        return this.locked.has(key);
    };
    /**
     * Filter array of coins or outpoints
     * for only unlocked ones.
     * @param {Coin[]|Outpoint[]}
     * @returns {Array}
     */
    TXDB.prototype.filterLocked = function (coins) {
        var out = [];
        for (var _i = 0, coins_1 = coins; _i < coins_1.length; _i++) {
            var coin = coins_1[_i];
            if (!this.isLocked(coin))
                out.push(coin);
        }
        return out;
    };
    /**
     * Return an array of all locked outpoints.
     * @returns {Outpoint[]}
     */
    TXDB.prototype.getLocked = function () {
        var outpoints = [];
        for (var _i = 0, _a = this.locked.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            outpoints.push(Outpoint.fromKey(key));
        }
        return outpoints;
    };
    /**
     * Get hashes of all transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getAccountHistoryHashes = function (acct) {
        assert(typeof acct === 'number');
        return this.bucket.keys({
            gte: layout.T.min(acct),
            lte: layout.T.max(acct),
            parse: function (key) {
                var _a = layout.T.decode(key), hash = _a[1];
                return hash;
            }
        });
    };
    /**
     * Get hashes of all transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getHistoryHashes = function (acct) {
        assert(typeof acct === 'number');
        if (acct !== -1)
            return this.getAccountHistoryHashes(acct);
        return this.bucket.keys({
            gte: layout.t.min(),
            lte: layout.t.max(),
            parse: function (key) { return layout.t.decode(key)[0]; }
        });
    };
    /**
     * Get hashes of all unconfirmed transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getAccountPendingHashes = function (acct) {
        assert(typeof acct === 'number');
        return this.bucket.keys({
            gte: layout.P.min(acct),
            lte: layout.P.max(acct),
            parse: function (key) {
                var _a = layout.P.decode(key), hash = _a[1];
                return hash;
            }
        });
    };
    /**
     * Get hashes of all unconfirmed transactions in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getPendingHashes = function (acct) {
        assert(typeof acct === 'number');
        if (acct !== -1)
            return this.getAccountPendingHashes(acct);
        return this.bucket.keys({
            gte: layout.p.min(),
            lte: layout.p.max(),
            parse: function (key) { return layout.p.decode(key)[0]; }
        });
    };
    /**
     * Test whether the database has a pending transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.hasPending = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.bucket.has(layout.p.encode(hash))];
            });
        });
    };
    /**
     * Get all coin hashes in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getAccountOutpoints = function (acct) {
        assert(typeof acct === 'number');
        return this.bucket.keys({
            gte: layout.C.min(acct),
            lte: layout.C.max(acct),
            parse: function (key) {
                var _a = layout.C.decode(key), hash = _a[1], index = _a[2];
                return new Outpoint(hash, index);
            }
        });
    };
    /**
     * Get all coin hashes in the database.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getOutpoints = function (acct) {
        assert(typeof acct === 'number');
        if (acct !== -1)
            return this.getAccountOutpoints(acct);
        return this.bucket.keys({
            gte: layout.c.min(),
            lte: layout.c.max(),
            parse: function (key) {
                var _a = layout.c.decode(key), hash = _a[0], index = _a[1];
                return new Outpoint(hash, index);
            }
        });
    };
    /**
     * Get TX hashes by height range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getAccountHeightRangeHashes = function (acct, options) {
        assert(typeof acct === 'number');
        var start = options.start || 0;
        var end = options.end || 0xffffffff;
        return this.bucket.keys({
            gte: layout.H.min(acct, start),
            lte: layout.H.max(acct, end),
            limit: options.limit,
            reverse: options.reverse,
            parse: function (key) {
                var _a = layout.H.decode(key), hash = _a[2];
                return hash;
            }
        });
    };
    /**
     * Get TX hashes by height range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getHeightRangeHashes = function (acct, options) {
        assert(typeof acct === 'number');
        if (acct !== -1)
            return this.getAccountHeightRangeHashes(acct, options);
        var start = options.start || 0;
        var end = options.end || 0xffffffff;
        return this.bucket.keys({
            gte: layout.h.min(start),
            lte: layout.h.max(end),
            limit: options.limit,
            reverse: options.reverse,
            parse: function (key) {
                var _a = layout.h.decode(key), hash = _a[1];
                return hash;
            }
        });
    };
    /**
     * Get TX hashes by height.
     * @param {Number} height
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getHeightHashes = function (height) {
        return this.getHeightRangeHashes({ start: height, end: height });
    };
    /**
     * Get TX hashes by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getAccountRangeHashes = function (acct, options) {
        assert(typeof acct === 'number');
        var start = options.start || 0;
        var end = options.end || 0xffffffff;
        return this.bucket.keys({
            gte: layout.M.min(acct, start),
            lte: layout.M.max(acct, end),
            limit: options.limit,
            reverse: options.reverse,
            parse: function (key) {
                var _a = layout.M.decode(key), hash = _a[2];
                return hash;
            }
        });
    };
    /**
     * Get TX hashes by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start height.
     * @param {Number} options.end - End height.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    TXDB.prototype.getRangeHashes = function (acct, options) {
        assert(typeof acct === 'number');
        if (acct !== -1)
            return this.getAccountRangeHashes(acct, options);
        var start = options.start || 0;
        var end = options.end || 0xffffffff;
        return this.bucket.keys({
            gte: layout.m.min(start),
            lte: layout.m.max(end),
            limit: options.limit,
            reverse: options.reverse,
            parse: function (key) {
                var _a = layout.m.decode(key), hash = _a[1];
                return hash;
            }
        });
    };
    /**
     * Get transactions by timestamp range.
     * @param {Number} acct
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise} - Returns {@link TX}[].
     */
    TXDB.prototype.getRange = function (acct, options) {
        return __awaiter(this, void 0, void 0, function () {
            var hashes, txs, _i, hashes_1, hash, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRangeHashes(acct, options)];
                    case 1:
                        hashes = _a.sent();
                        txs = [];
                        _i = 0, hashes_1 = hashes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < hashes_1.length)) return [3 /*break*/, 5];
                        hash = hashes_1[_i];
                        return [4 /*yield*/, this.getTX(hash)];
                    case 3:
                        tx = _a.sent();
                        assert(tx);
                        txs.push(tx);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, txs];
                }
            });
        });
    };
    /**
     * Get last N transactions.
     * @param {Number} acct
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise} - Returns {@link TX}[].
     */
    TXDB.prototype.getLast = function (acct, limit) {
        return this.getRange(acct, {
            start: 0,
            end: 0xffffffff,
            reverse: true,
            limit: limit || 10
        });
    };
    /**
     * Get all transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    TXDB.prototype.getHistory = function (acct) {
        assert(typeof acct === 'number');
        // Slow case
        if (acct !== -1)
            return this.getAccountHistory(acct);
        // Fast case
        return this.bucket.values({
            gte: layout.t.min(),
            lte: layout.t.max(),
            parse: function (data) { return TXRecord.fromRaw(data); }
        });
    };
    /**
     * Get all acct transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    TXDB.prototype.getAccountHistory = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var hashes, txs, _i, hashes_2, hash, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getHistoryHashes(acct)];
                    case 1:
                        hashes = _a.sent();
                        txs = [];
                        _i = 0, hashes_2 = hashes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < hashes_2.length)) return [3 /*break*/, 5];
                        hash = hashes_2[_i];
                        return [4 /*yield*/, this.getTX(hash)];
                    case 3:
                        tx = _a.sent();
                        assert(tx);
                        txs.push(tx);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, txs];
                }
            });
        });
    };
    /**
     * Get unconfirmed transactions.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link TX}[].
     */
    TXDB.prototype.getPending = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var hashes, txs, _i, hashes_3, hash, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPendingHashes(acct)];
                    case 1:
                        hashes = _a.sent();
                        txs = [];
                        _i = 0, hashes_3 = hashes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < hashes_3.length)) return [3 /*break*/, 5];
                        hash = hashes_3[_i];
                        return [4 /*yield*/, this.getTX(hash)];
                    case 3:
                        tx = _a.sent();
                        assert(tx);
                        txs.push(tx);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, txs];
                }
            });
        });
    };
    /**
     * Get coins.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    TXDB.prototype.getCredits = function (acct) {
        assert(typeof acct === 'number');
        // Slow case
        if (acct !== -1)
            return this.getAccountCredits(acct);
        // Fast case
        return this.bucket.range({
            gte: layout.c.min(),
            lte: layout.c.max(),
            parse: function (key, value) {
                var _a = layout.c.decode(key), hash = _a[0], index = _a[1];
                var credit = Credit.fromRaw(value);
                credit.coin.hash = hash;
                credit.coin.index = index;
                return credit;
            }
        });
    };
    /**
     * Get coins by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    TXDB.prototype.getAccountCredits = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var outpoints, credits, _i, outpoints_1, _a, hash, index, credit;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getOutpoints(acct)];
                    case 1:
                        outpoints = _b.sent();
                        credits = [];
                        _i = 0, outpoints_1 = outpoints;
                        _b.label = 2;
                    case 2:
                        if (!(_i < outpoints_1.length)) return [3 /*break*/, 5];
                        _a = outpoints_1[_i], hash = _a.hash, index = _a.index;
                        return [4 /*yield*/, this.getCredit(hash, index)];
                    case 3:
                        credit = _b.sent();
                        if (!credit)
                            return [3 /*break*/, 4];
                        credits.push(credit);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, credits];
                }
            });
        });
    };
    /**
     * Fill a transaction with coins (all historical coins).
     * @param {TX} tx
     * @returns {Promise} - Returns {@link TX}.
     */
    TXDB.prototype.getSpentCredits = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, credits, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (tx.isCoinbase())
                            return [2 /*return*/, []];
                        hash = tx.hash();
                        credits = [];
                        for (i = 0; i < tx.inputs.length; i++)
                            credits.push(null);
                        return [4 /*yield*/, this.bucket.range({
                                gte: layout.d.min(hash),
                                lte: layout.d.max(hash),
                                parse: function (key, value) {
                                    var _a = layout.d.decode(key), index = _a[1];
                                    var coin = Coin.fromRaw(value);
                                    var input = tx.inputs[index];
                                    assert(input);
                                    coin.hash = input.prevout.hash;
                                    coin.index = input.prevout.index;
                                    credits[index] = new Credit(coin);
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, credits];
                }
            });
        });
    };
    /**
     * Get coins.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    TXDB.prototype.getCoins = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var credits, coins, _i, credits_1, credit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCredits(acct)];
                    case 1:
                        credits = _a.sent();
                        coins = [];
                        for (_i = 0, credits_1 = credits; _i < credits_1.length; _i++) {
                            credit = credits_1[_i];
                            if (credit.spent)
                                continue;
                            coins.push(credit.coin);
                        }
                        return [2 /*return*/, coins];
                }
            });
        });
    };
    /**
     * Get coins by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Coin}[].
     */
    TXDB.prototype.getAccountCoins = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var credits, coins, _i, credits_2, credit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountCredits(acct)];
                    case 1:
                        credits = _a.sent();
                        coins = [];
                        for (_i = 0, credits_2 = credits; _i < credits_2.length; _i++) {
                            credit = credits_2[_i];
                            if (credit.spent)
                                continue;
                            coins.push(credit.coin);
                        }
                        return [2 /*return*/, coins];
                }
            });
        });
    };
    /**
     * Get historical coins for a transaction.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link TX}.
     */
    TXDB.prototype.getSpentCoins = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var credits, coins, _i, credits_3, credit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (tx.isCoinbase())
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.getSpentCredits(tx)];
                    case 1:
                        credits = _a.sent();
                        coins = [];
                        for (_i = 0, credits_3 = credits; _i < credits_3.length; _i++) {
                            credit = credits_3[_i];
                            if (!credit) {
                                coins.push(null);
                                continue;
                            }
                            coins.push(credit.coin);
                        }
                        return [2 /*return*/, coins];
                }
            });
        });
    };
    /**
     * Get a coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    TXDB.prototype.getCoinView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, _i, _a, prevout, hash, index, coin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        if (tx.isCoinbase())
                            return [2 /*return*/, view];
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash, index = prevout.index;
                        return [4 /*yield*/, this.getCoin(hash, index)];
                    case 2:
                        coin = _b.sent();
                        if (!coin)
                            return [3 /*break*/, 3];
                        view.addCoin(coin);
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Get historical coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    TXDB.prototype.getSpentView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, coins, _i, coins_2, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = new CoinView();
                        if (tx.isCoinbase())
                            return [2 /*return*/, view];
                        return [4 /*yield*/, this.getSpentCoins(tx)];
                    case 1:
                        coins = _a.sent();
                        for (_i = 0, coins_2 = coins; _i < coins_2.length; _i++) {
                            coin = coins_2[_i];
                            if (!coin)
                                continue;
                            view.addCoin(coin);
                        }
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Get transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    TXDB.prototype.getTX = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.t.encode(hash))];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, null];
                        return [2 /*return*/, TXRecord.fromRaw(raw)];
                }
            });
        });
    };
    /**
     * Get transaction details.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXDetails}.
     */
    TXDB.prototype.getDetails = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTX(hash)];
                    case 1:
                        wtx = _a.sent();
                        if (!wtx)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.toDetails(wtx)];
                }
            });
        });
    };
    /**
     * Convert transaction to transaction details.
     * @param {TXRecord[]} wtxs
     * @returns {Promise}
     */
    TXDB.prototype.toDetails = function (wtxs) {
        return __awaiter(this, void 0, void 0, function () {
            var out, _i, wtxs_1, wtx, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        out = [];
                        if (!Array.isArray(wtxs))
                            return [2 /*return*/, this._toDetails(wtxs)];
                        _i = 0, wtxs_1 = wtxs;
                        _a.label = 1;
                    case 1:
                        if (!(_i < wtxs_1.length)) return [3 /*break*/, 4];
                        wtx = wtxs_1[_i];
                        return [4 /*yield*/, this._toDetails(wtx)];
                    case 2:
                        details = _a.sent();
                        if (!details)
                            return [3 /*break*/, 3];
                        out.push(details);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, out];
                }
            });
        });
    };
    /**
     * Convert transaction to transaction details.
     * @private
     * @param {TXRecord} wtx
     * @returns {Promise}
     */
    TXDB.prototype._toDetails = function (wtx) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, block, details, coins, i, coin, path, i, output, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = wtx.tx;
                        block = wtx.getBlock();
                        details = new Details(wtx, block);
                        return [4 /*yield*/, this.getSpentCoins(tx)];
                    case 1:
                        coins = _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 6];
                        coin = coins[i];
                        path = null;
                        if (!coin) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.getPath(coin)];
                    case 3:
                        path = _a.sent();
                        _a.label = 4;
                    case 4:
                        details.setInput(i, path, coin);
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 2];
                    case 6:
                        i = 0;
                        _a.label = 7;
                    case 7:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 10];
                        output = tx.outputs[i];
                        return [4 /*yield*/, this.getPath(output)];
                    case 8:
                        path = _a.sent();
                        details.setOutput(i, path);
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, details];
                }
            });
        });
    };
    /**
     * Test whether the database has a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.hasTX = function (hash) {
        return this.bucket.has(layout.t.encode(hash));
    };
    /**
     * Get coin.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    TXDB.prototype.getCoin = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            var credit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCredit(hash, index)];
                    case 1:
                        credit = _a.sent();
                        if (!credit)
                            return [2 /*return*/, null];
                        return [2 /*return*/, credit.coin];
                }
            });
        });
    };
    /**
     * Get coin.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    TXDB.prototype.getCredit = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            var data, credit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.c.encode(hash, index))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        credit = Credit.fromRaw(data);
                        credit.coin.hash = hash;
                        credit.coin.index = index;
                        return [2 /*return*/, credit];
                }
            });
        });
    };
    /**
     * Get spender coin.
     * @param {Outpoint} spent
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link Coin}.
     */
    TXDB.prototype.getSpentCoin = function (spent, prevout) {
        return __awaiter(this, void 0, void 0, function () {
            var data, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.d.encode(spent.hash, spent.index))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        coin = Coin.fromRaw(data);
                        coin.hash = prevout.hash;
                        coin.index = prevout.index;
                        return [2 /*return*/, coin];
                }
            });
        });
    };
    /**
     * Test whether the database has a spent coin.
     * @param {Outpoint} spent
     * @returns {Promise} - Returns {@link Coin}.
     */
    TXDB.prototype.hasSpentCoin = function (spent) {
        return this.bucket.has(layout.d.encode(spent.hash, spent.index));
    };
    /**
     * Update spent coin height in storage.
     * @param {TX} tx - Sending transaction.
     * @param {Number} index
     * @param {Number} height
     * @returns {Promise}
     */
    TXDB.prototype.updateSpentCoin = function (b, tx, index, height) {
        return __awaiter(this, void 0, void 0, function () {
            var prevout, spent, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prevout = Outpoint.fromTX(tx, index);
                        return [4 /*yield*/, this.getSpent(prevout.hash, prevout.index)];
                    case 1:
                        spent = _a.sent();
                        if (!spent)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getSpentCoin(spent, prevout)];
                    case 2:
                        coin = _a.sent();
                        if (!coin)
                            return [2 /*return*/];
                        coin.height = height;
                        b.put(layout.d.encode(spent.hash, spent.index), coin.toRaw());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test whether the database has a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    TXDB.prototype.hasCoin = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.bucket.has(layout.c.encode(hash, index))];
            });
        });
    };
    /**
     * Calculate balance.
     * @param {Number?} account
     * @returns {Promise} - Returns {@link Balance}.
     */
    TXDB.prototype.getBalance = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(typeof acct === 'number');
                if (acct !== -1)
                    return [2 /*return*/, this.getAccountBalance(acct)];
                return [2 /*return*/, this.getWalletBalance()];
            });
        });
    };
    /**
     * Calculate balance.
     * @returns {Promise} - Returns {@link Balance}.
     */
    TXDB.prototype.getWalletBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.R.encode())];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, new Balance()];
                        return [2 /*return*/, Balance.fromRaw(-1, data)];
                }
            });
        });
    };
    /**
     * Calculate balance by account.
     * @param {Number} acct
     * @returns {Promise} - Returns {@link Balance}.
     */
    TXDB.prototype.getAccountBalance = function (acct) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.get(layout.r.encode(acct))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, new Balance(acct)];
                        return [2 /*return*/, Balance.fromRaw(acct, data)];
                }
            });
        });
    };
    /**
     * Zap pending transactions older than `age`.
     * @param {Number} acct
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    TXDB.prototype.zap = function (acct, age) {
        return __awaiter(this, void 0, void 0, function () {
            var now, txs, hashes, _i, txs_1, wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert((age >>> 0) === age);
                        now = util.now();
                        return [4 /*yield*/, this.getRange(acct, {
                                start: 0,
                                end: now - age
                            })];
                    case 1:
                        txs = _a.sent();
                        hashes = [];
                        _i = 0, txs_1 = txs;
                        _a.label = 2;
                    case 2:
                        if (!(_i < txs_1.length)) return [3 /*break*/, 5];
                        wtx = txs_1[_i];
                        if (wtx.height !== -1)
                            return [3 /*break*/, 4];
                        assert(now - wtx.mtime >= age);
                        this.logger.debug('Zapping TX: %h (%d)', wtx.tx.hash(), this.wid);
                        return [4 /*yield*/, this.remove(wtx.hash)];
                    case 3:
                        _a.sent();
                        hashes.push(wtx.hash);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, hashes];
                }
            });
        });
    };
    /**
     * Abandon transaction.
     * @param {Hash} hash
     * @returns {Promise}
     */
    TXDB.prototype.abandon = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bucket.has(layout.p.encode(hash))];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            throw new Error('TX not eligible.');
                        return [2 /*return*/, this.remove(hash)];
                }
            });
        });
    };
    return TXDB;
}());
/**
 * Balance
 * @alias module:wallet.Balance
 */
var Balance = /** @class */ (function () {
    /**
     * Create a balance.
     * @constructor
     * @param {Number} account
     */
    function Balance(acct) {
        if (acct === void 0) { acct = -1; }
        assert(typeof acct === 'number');
        this.account = acct;
        this.tx = 0;
        this.coin = 0;
        this.unconfirmed = 0;
        this.confirmed = 0;
    }
    /**
     * Apply delta.
     * @param {Balance} balance
     */
    Balance.prototype.applyTo = function (balance) {
        balance.tx += this.tx;
        balance.coin += this.coin;
        balance.unconfirmed += this.unconfirmed;
        balance.confirmed += this.confirmed;
        assert(balance.tx >= 0);
        assert(balance.coin >= 0);
        assert(balance.unconfirmed >= 0);
        assert(balance.confirmed >= 0);
    };
    /**
     * Serialize balance.
     * @returns {Buffer}
     */
    Balance.prototype.toRaw = function () {
        var bw = bio.write(32);
        bw.writeU64(this.tx);
        bw.writeU64(this.coin);
        bw.writeU64(this.unconfirmed);
        bw.writeU64(this.confirmed);
        return bw.render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {TXDBState}
     */
    Balance.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.tx = br.readU64();
        this.coin = br.readU64();
        this.unconfirmed = br.readU64();
        this.confirmed = br.readU64();
        return this;
    };
    /**
     * Instantiate balance from serialized data.
     * @param {Number} acct
     * @param {Buffer} data
     * @returns {TXDBState}
     */
    Balance.fromRaw = function (acct, data) {
        return new this(acct).fromRaw(data);
    };
    /**
     * Convert balance to a more json-friendly object.
     * @param {Boolean?} minimal
     * @returns {Object}
     */
    Balance.prototype.toJSON = function (minimal) {
        return {
            account: !minimal ? this.account : undefined,
            tx: this.tx,
            coin: this.coin,
            unconfirmed: this.unconfirmed,
            confirmed: this.confirmed
        };
    };
    /**
     * Inspect balance.
     * @param {String}
     */
    Balance.prototype[inspectSymbol] = function () {
        return '<Balance'
            + " tx=".concat(this.tx)
            + " coin=".concat(this.coin)
            + " unconfirmed=".concat(Amount.btc(this.unconfirmed))
            + " confirmed=".concat(Amount.btc(this.confirmed))
            + '>';
    };
    return Balance;
}());
/**
 * Balance Delta
 * @ignore
 */
var BalanceDelta = /** @class */ (function () {
    /**
     * Create a balance delta.
     * @constructor
     */
    function BalanceDelta() {
        this.wallet = new Balance();
        this.accounts = new Map();
    }
    BalanceDelta.prototype.updated = function () {
        return this.wallet.tx !== 0;
    };
    BalanceDelta.prototype.applyTo = function (balance) {
        this.wallet.applyTo(balance);
    };
    BalanceDelta.prototype.get = function (path) {
        if (!this.accounts.has(path.account))
            this.accounts.set(path.account, new Balance());
        return this.accounts.get(path.account);
    };
    BalanceDelta.prototype.tx = function (path, value) {
        var account = this.get(path);
        account.tx = value;
        this.wallet.tx = value;
    };
    BalanceDelta.prototype.coin = function (path, value) {
        var account = this.get(path);
        account.coin += value;
        this.wallet.coin += value;
    };
    BalanceDelta.prototype.unconfirmed = function (path, value) {
        var account = this.get(path);
        account.unconfirmed += value;
        this.wallet.unconfirmed += value;
    };
    BalanceDelta.prototype.confirmed = function (path, value) {
        var account = this.get(path);
        account.confirmed += value;
        this.wallet.confirmed += value;
    };
    return BalanceDelta;
}());
/**
 * Credit (wrapped coin)
 * @alias module:wallet.Credit
 * @property {Coin} coin
 * @property {Boolean} spent
 */
var Credit = /** @class */ (function () {
    /**
     * Create a credit.
     * @constructor
     * @param {Coin} coin
     * @param {Boolean?} spent
     */
    function Credit(coin, spent) {
        this.coin = coin || new Coin();
        this.spent = spent || false;
        this.own = false;
    }
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Credit.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.coin.fromReader(br);
        this.spent = br.readU8() === 1;
        this.own = br.readU8() === 1;
        return this;
    };
    /**
     * Instantiate credit from serialized data.
     * @param {Buffer} data
     * @returns {Credit}
     */
    Credit.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Get serialization size.
     * @returns {Number}
     */
    Credit.prototype.getSize = function () {
        return this.coin.getSize() + 2;
    };
    /**
     * Serialize credit.
     * @returns {Buffer}
     */
    Credit.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        this.coin.toWriter(bw);
        bw.writeU8(this.spent ? 1 : 0);
        bw.writeU8(this.own ? 1 : 0);
        return bw.render();
    };
    /**
     * Inject properties from tx object.
     * @private
     * @param {TX} tx
     * @param {Number} index
     * @returns {Credit}
     */
    Credit.prototype.fromTX = function (tx, index, height) {
        this.coin.fromTX(tx, index, height);
        this.spent = false;
        this.own = false;
        return this;
    };
    /**
     * Instantiate credit from transaction.
     * @param {TX} tx
     * @param {Number} index
     * @returns {Credit}
     */
    Credit.fromTX = function (tx, index, height) {
        return new this().fromTX(tx, index, height);
    };
    return Credit;
}());
/**
 * Transaction Details
 * @alias module:wallet.Details
 */
var Details = /** @class */ (function () {
    /**
     * Create transaction details.
     * @constructor
     * @param {TXRecord} wtx
     * @param {BlockMeta} block
     */
    function Details(wtx, block) {
        this.hash = wtx.hash;
        this.tx = wtx.tx;
        this.mtime = wtx.mtime;
        this.size = this.tx.getSize();
        this.vsize = this.tx.getVirtualSize();
        this.block = null;
        this.height = -1;
        this.time = 0;
        if (block) {
            this.block = block.hash;
            this.height = block.height;
            this.time = block.time;
        }
        this.inputs = [];
        this.outputs = [];
        this.init();
    }
    /**
     * Initialize transaction details.
     * @private
     */
    Details.prototype.init = function () {
        for (var _i = 0, _a = this.tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var member = new DetailsMember();
            member.address = input.getAddress();
            this.inputs.push(member);
        }
        for (var _b = 0, _c = this.tx.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            var member = new DetailsMember();
            member.value = output.value;
            member.address = output.getAddress();
            this.outputs.push(member);
        }
    };
    /**
     * Add necessary info to input member.
     * @param {Number} i
     * @param {Path} path
     * @param {Coin} coin
     */
    Details.prototype.setInput = function (i, path, coin) {
        var member = this.inputs[i];
        if (coin) {
            member.value = coin.value;
            member.address = coin.getAddress();
        }
        if (path)
            member.path = path;
    };
    /**
     * Add necessary info to output member.
     * @param {Number} i
     * @param {Path} path
     */
    Details.prototype.setOutput = function (i, path) {
        var member = this.outputs[i];
        if (path)
            member.path = path;
    };
    /**
     * Calculate confirmations.
     * @returns {Number}
     */
    Details.prototype.getDepth = function (height) {
        if (this.height === -1)
            return 0;
        if (height == null)
            return 0;
        var depth = height - this.height;
        if (depth < 0)
            return 0;
        return depth + 1;
    };
    /**
     * Calculate fee. Only works if wallet
     * owns all inputs. Returns 0 otherwise.
     * @returns  {SatoshiAmount}
     */
    Details.prototype.getFee = function () {
        var inputValue = 0;
        var outputValue = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (!input.path)
                return 0;
            inputValue += input.value;
        }
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            outputValue += output.value;
        }
        return inputValue - outputValue;
    };
    /**
     * Calculate fee rate. Only works if wallet
     * owns all inputs. Returns 0 otherwise.
     * @param  {SatoshiAmount} fee
     * @returns {Rate}
     */
    Details.prototype.getRate = function (fee) {
        return policy.getRate(this.vsize, fee);
    };
    /**
     * Convert details to a more json-friendly object.
     * @returns {Object}
     */
    Details.prototype.toJSON = function (network, height) {
        var fee = this.getFee();
        var rate = this.getRate(fee);
        return {
            hash: util.revHex(this.hash),
            height: this.height,
            block: this.block ? util.revHex(this.block) : null,
            time: this.time,
            mtime: this.mtime,
            date: util.date(this.time),
            mdate: util.date(this.mtime),
            size: this.size,
            virtualSize: this.vsize,
            fee: fee,
            rate: rate,
            confirmations: this.getDepth(height),
            inputs: this.inputs.map(function (input) {
                return input.getJSON(network);
            }),
            outputs: this.outputs.map(function (output) {
                return output.getJSON(network);
            }),
            tx: this.tx.toRaw().toString('hex')
        };
    };
    return Details;
}());
/**
 * Transaction Details Member
 * @property {Number} value
 * @property {Address} address
 * @property {Path} path
 */
var DetailsMember = /** @class */ (function () {
    /**
     * Create details member.
     * @constructor
     */
    function DetailsMember() {
        this.value = 0;
        this.address = null;
        this.path = null;
    }
    /**
     * Convert the member to a more json-friendly object.
     * @returns {Object}
     */
    DetailsMember.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the member to a more json-friendly object.
     * @param {Network} network
     * @returns {Object}
     */
    DetailsMember.prototype.getJSON = function (network) {
        return {
            value: this.value,
            address: this.address
                ? this.address.toString(network)
                : null,
            path: this.path
                ? this.path.toJSON()
                : null
        };
    };
    return DetailsMember;
}());
/**
 * Block Record
 * @alias module:wallet.BlockRecord
 */
var BlockRecord = /** @class */ (function () {
    /**
     * Create a block record.
     * @constructor
     * @param {Hash} hash
     * @param {Number} height
     * @param {Number} time
     */
    function BlockRecord(hash, height, time) {
        this.hash = hash || consensus.ZERO_HASH;
        this.height = height != null ? height : -1;
        this.time = time || 0;
        this.hashes = new BufferSet();
    }
    /**
     * Add transaction to block record.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    BlockRecord.prototype.add = function (hash) {
        if (this.hashes.has(hash))
            return false;
        this.hashes.add(hash);
        return true;
    };
    /**
     * Remove transaction from block record.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    BlockRecord.prototype.remove = function (hash) {
        return this.hashes["delete"](hash);
    };
    /**
     * Instantiate wallet block from serialized tip data.
     * @private
     * @param {Buffer} data
     */
    BlockRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.hash = br.readHash();
        this.height = br.readU32();
        this.time = br.readU32();
        var count = br.readU32();
        for (var i = 0; i < count; i++) {
            var hash = br.readHash();
            this.hashes.add(hash);
        }
        return this;
    };
    /**
     * Instantiate wallet block from serialized data.
     * @param {Buffer} data
     * @returns {BlockRecord}
     */
    BlockRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Get serialization size.
     * @returns {Number}
     */
    BlockRecord.prototype.getSize = function () {
        return 44 + this.hashes.size * 32;
    };
    /**
     * Serialize the wallet block as a tip (hash and height).
     * @returns {Buffer}
     */
    BlockRecord.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        bw.writeHash(this.hash);
        bw.writeU32(this.height);
        bw.writeU32(this.time);
        bw.writeU32(this.hashes.size);
        for (var _i = 0, _a = this.hashes; _i < _a.length; _i++) {
            var hash = _a[_i];
            bw.writeHash(hash);
        }
        return bw.render();
    };
    /**
     * Convert hashes set to an array.
     * @returns {Hash[]}
     */
    BlockRecord.prototype.toArray = function () {
        var hashes = [];
        for (var _i = 0, _a = this.hashes; _i < _a.length; _i++) {
            var hash = _a[_i];
            hashes.push(hash);
        }
        return hashes;
    };
    /**
     * Convert the block to a more json-friendly object.
     * @returns {Object}
     */
    BlockRecord.prototype.toJSON = function () {
        return {
            hash: util.revHex(this.hash),
            height: this.height,
            time: this.time,
            hashes: this.toArray().map(util.revHex)
        };
    };
    /**
     * Instantiate wallet block from block meta.
     * @private
     * @param {BlockMeta} block
     */
    BlockRecord.prototype.fromMeta = function (block) {
        this.hash = block.hash;
        this.height = block.height;
        this.time = block.time;
        return this;
    };
    /**
     * Instantiate wallet block from block meta.
     * @param {BlockMeta} block
     * @returns {BlockRecord}
     */
    BlockRecord.fromMeta = function (block) {
        return new this().fromMeta(block);
    };
    return BlockRecord;
}());
/*
 * Expose
 */
module.exports = TXDB;
