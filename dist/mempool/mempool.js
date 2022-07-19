/*!
 * mempool.js - mempool for bcoin
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
var path = require('path');
var EventEmitter = require('events');
var bdb = require('bdb');
var RollingFilter = require('bfilter').RollingFilter;
var Heap = require('bheep');
var _a = require('buffer-map'), BufferMap = _a.BufferMap, BufferSet = _a.BufferSet;
var common = require('../blockchain/common');
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var util = require('../utils/util');
var random = require('bcrypto/lib/random');
var VerifyError = require('../protocol/errors').VerifyError;
var Script = require('../script/script');
var Outpoint = require('../primitives/outpoint');
var TX = require('../primitives/tx');
var Coin = require('../primitives/coin');
var TXMeta = require('../primitives/txmeta');
var MempoolEntry = require('./mempoolentry');
var Network = require('../protocol/network');
var layout = require('./layout');
var AddrIndexer = require('./addrindexer');
var Fees = require('./fees');
var CoinView = require('../coins/coinview');
/**
 * Mempool
 * Represents a mempool.
 * @extends EventEmitter
 * @alias module:mempool.Mempool
 */
var Mempool = /** @class */ (function (_super) {
    __extends(Mempool, _super);
    /**
     * Create a mempool.
     * @constructor
     * @param {Object} options
     */
    function Mempool(options) {
        var _this = _super.call(this) || this;
        _this.opened = false;
        _this.options = new MempoolOptions(options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('mempool');
        _this.workers = _this.options.workers;
        _this.chain = _this.options.chain;
        _this.fees = _this.options.fees;
        _this.locker = _this.chain.locker;
        _this.cache = new MempoolCache(_this.options);
        _this.size = 0;
        _this.freeCount = 0;
        _this.lastTime = 0;
        _this.lastFlush = 0;
        _this.tip = _this.network.genesis.hash;
        _this.waiting = new BufferMap();
        _this.orphans = new BufferMap();
        _this.map = new BufferMap();
        _this.spents = new BufferMap();
        _this.rejects = new RollingFilter(120000, 0.000001);
        _this.addrindex = new AddrIndexer(_this.network);
        return _this;
    }
    /**
     * Open the chain, wait for the database to load.
     * @returns {Promise}
     */
    Mempool.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var entries, _i, entries_1, entry, _a, entries_2, entry, view, fees, size;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assert(!this.opened, 'Mempool is already open.');
                        this.opened = true;
                        return [4 /*yield*/, this.cache.open()];
                    case 1:
                        _b.sent();
                        if (!this.options.persistent) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.cache.getEntries()];
                    case 2:
                        entries = _b.sent();
                        for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                            entry = entries_1[_i];
                            this.trackEntry(entry);
                        }
                        _a = 0, entries_2 = entries;
                        _b.label = 3;
                    case 3:
                        if (!(_a < entries_2.length)) return [3 /*break*/, 6];
                        entry = entries_2[_a];
                        this.updateAncestors(entry, addFee);
                        if (!this.options.indexAddress) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getCoinView(entry.tx)];
                    case 4:
                        view = _b.sent();
                        this.indexEntry(entry, view);
                        _b.label = 5;
                    case 5:
                        _a++;
                        return [3 /*break*/, 3];
                    case 6:
                        this.logger.info('Loaded mempool from disk (%d entries).', entries.length);
                        if (!this.fees) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.cache.getFees()];
                    case 7:
                        fees = _b.sent();
                        if (fees) {
                            this.fees.inject(fees);
                            this.logger.info('Loaded mempool fee data (rate=%d).', this.fees.estimateFee());
                        }
                        _b.label = 8;
                    case 8:
                        this.tip = this.chain.tip.hash;
                        size = (this.options.maxSize / 1024).toFixed(2);
                        this.logger.info('Mempool loaded (maxsize=%dkb).', size);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the chain, wait for the database to close.
     * @returns {Promise}
     */
    Mempool.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(this.opened, 'Mempool is not open.');
                this.opened = false;
                return [2 /*return*/, this.cache.close()];
            });
        });
    };
    /**
     * Notify the mempool that a new block has come
     * in (removes all transactions contained in the
     * block from the mempool).
     * @method
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    Mempool.prototype.addBlock = function (block, txs) {
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
                        return [4 /*yield*/, this._addBlock(block, txs)];
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
     * Notify the mempool that a new block
     * has come without a lock.
     * @private
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    Mempool.prototype._addBlock = function (block, txs) {
        return __awaiter(this, void 0, void 0, function () {
            var entries, i, tx, hash, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.map.size === 0) {
                            this.tip = block.hash;
                            return [2 /*return*/];
                        }
                        entries = [];
                        i = txs.length - 1;
                        _a.label = 1;
                    case 1:
                        if (!(i >= 1)) return [3 /*break*/, 6];
                        tx = txs[i];
                        hash = tx.hash();
                        entry = this.getEntry(hash);
                        if (!!entry) return [3 /*break*/, 4];
                        this.removeOrphan(hash);
                        this.removeDoubleSpends(tx);
                        if (!this.waiting.has(hash)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleOrphans(tx)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        this.removeEntry(entry);
                        this.emit('confirmed', tx, block);
                        entries.push(entry);
                        _a.label = 5;
                    case 5:
                        i--;
                        return [3 /*break*/, 1];
                    case 6:
                        // We need to reset the rejects filter periodically.
                        // There may be a locktime in a TX that is now valid.
                        this.rejects.reset();
                        if (this.fees) {
                            this.fees.processBlock(block.height, entries, this.chain.synced);
                            this.cache.writeFees(this.fees);
                        }
                        this.cache.sync(block.hash);
                        return [4 /*yield*/, this.cache.flush()];
                    case 7:
                        _a.sent();
                        this.tip = block.hash;
                        if (entries.length === 0)
                            return [2 /*return*/];
                        this.logger.debug('Removed %d txs from mempool for block %d.', entries.length, block.height);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Notify the mempool that a block has been disconnected
     * from the main chain (reinserts transactions into the mempool).
     * @method
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    Mempool.prototype.removeBlock = function (block, txs) {
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
                        return [4 /*yield*/, this._removeBlock(block, txs)];
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
     * Notify the mempool that a block
     * has been disconnected without a lock.
     * @method
     * @private
     * @param {ChainEntry} block
     * @param {TX[]} txs
     * @returns {Promise}
     */
    Mempool.prototype._removeBlock = function (block, txs) {
        return __awaiter(this, void 0, void 0, function () {
            var total, i, tx, hash, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.map.size === 0) {
                            this.tip = block.prevBlock;
                            return [2 /*return*/];
                        }
                        total = 0;
                        i = 1;
                        _a.label = 1;
                    case 1:
                        if (!(i < txs.length)) return [3 /*break*/, 7];
                        tx = txs[i];
                        hash = tx.hash();
                        if (this.hasEntry(hash))
                            return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.insertTX(tx, -1)];
                    case 3:
                        _a.sent();
                        total++;
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        this.emit('error', e_1);
                        return [3 /*break*/, 6];
                    case 5:
                        this.emit('unconfirmed', tx, block);
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        this.rejects.reset();
                        this.cache.sync(block.prevBlock);
                        return [4 /*yield*/, this.cache.flush()];
                    case 8:
                        _a.sent();
                        this.tip = block.prevBlock;
                        if (total === 0)
                            return [2 /*return*/];
                        this.logger.debug('Added %d txs back into the mempool for block %d.', total, block.height);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sanitize the mempool after a reorg.
     * @private
     * @returns {Promise}
     */
    Mempool.prototype._handleReorg = function () {
        return __awaiter(this, void 0, void 0, function () {
            var height, mtp, remove, _i, _a, _b, hash, entry, tx, hasLocks, _c, _d, sequence, _e, remove_1, hash, entry;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        height = this.chain.height + 1;
                        return [4 /*yield*/, this.chain.getMedianTime(this.chain.tip)];
                    case 1:
                        mtp = _f.sent();
                        remove = [];
                        for (_i = 0, _a = this.map; _i < _a.length; _i++) {
                            _b = _a[_i], hash = _b[0], entry = _b[1];
                            tx = entry.tx;
                            if (!tx.isFinal(height, mtp)) {
                                remove.push(hash);
                                continue;
                            }
                            if (tx.version > 1) {
                                hasLocks = false;
                                for (_c = 0, _d = tx.inputs; _c < _d.length; _c++) {
                                    sequence = _d[_c].sequence;
                                    if (!(sequence & consensus.SEQUENCE_DISABLE_FLAG)) {
                                        hasLocks = true;
                                        break;
                                    }
                                }
                                if (hasLocks) {
                                    remove.push(hash);
                                    continue;
                                }
                            }
                            if (entry.coinbase)
                                remove.push(hash);
                        }
                        for (_e = 0, remove_1 = remove; _e < remove_1.length; _e++) {
                            hash = remove_1[_e];
                            entry = this.getEntry(hash);
                            if (!entry)
                                continue;
                            this.evictEntry(entry);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset the mempool.
     * @method
     * @returns {Promise}
     */
    Mempool.prototype.reset = function () {
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
                        return [4 /*yield*/, this._reset()];
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
     * Reset the mempool without a lock.
     * @private
     */
    Mempool.prototype._reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Mempool reset (%d txs removed).', this.map.size);
                        this.size = 0;
                        this.waiting.clear();
                        this.orphans.clear();
                        this.map.clear();
                        this.spents.clear();
                        this.addrindex.reset();
                        this.freeCount = 0;
                        this.lastTime = 0;
                        if (this.fees)
                            this.fees.reset();
                        this.rejects.reset();
                        if (!this.options.persistent) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.cache.wipe()];
                    case 1:
                        _a.sent();
                        this.cache.clear();
                        _a.label = 2;
                    case 2:
                        this.tip = this.chain.tip.hash;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ensure the size of the mempool stays below `maxSize`.
     * Evicts entries by timestamp and cumulative fee rate.
     * @param {MempoolEntry} added
     * @returns {Promise}
     */
    Mempool.prototype.limitSize = function (added) {
        var maxSize = this.options.maxSize;
        if (this.size <= maxSize)
            return false;
        var threshold = maxSize - (maxSize / 10);
        var expiryTime = this.options.expiryTime;
        var now = util.now();
        var start = util.bench();
        var queue = new Heap(cmpRate);
        for (var _i = 0, _a = this.map.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (this.hasDepends(entry.tx))
                continue;
            if (now < entry.time + expiryTime) {
                queue.insert(entry);
                continue;
            }
            this.logger.debug('Removing package %h from mempool (too old).', entry.hash());
            this.evictEntry(entry);
        }
        if (this.size <= threshold)
            return !this.hasEntry(added);
        this.logger.debug('(bench) Heap mempool traversal: %d.', util.bench(start));
        start = util.bench();
        this.logger.debug('(bench) Heap mempool queue size: %d.', queue.size());
        while (queue.size() > 0) {
            var entry = queue.shift();
            var hash = entry.hash();
            assert(this.hasEntry(hash));
            this.logger.debug('Removing package %h from mempool (low fee).', entry.hash());
            this.evictEntry(entry);
            if (this.size <= threshold)
                break;
        }
        this.logger.debug('(bench) Heap mempool map removal: %d.', util.bench(start));
        return !this.hasEntry(added);
    };
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {TX}
     */
    Mempool.prototype.getTX = function (hash) {
        var entry = this.map.get(hash);
        if (!entry)
            return null;
        return entry.tx;
    };
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {MempoolEntry}
     */
    Mempool.prototype.getEntry = function (hash) {
        return this.map.get(hash);
    };
    /**
     * Retrieve a coin from the mempool (unspents only).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Coin}
     */
    Mempool.prototype.getCoin = function (hash, index) {
        var entry = this.map.get(hash);
        if (!entry)
            return null;
        if (this.isSpent(hash, index))
            return null;
        if (index >= entry.tx.outputs.length)
            return null;
        return Coin.fromTX(entry.tx, index, -1);
    };
    /**
     * Check whether coin is still unspent.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {boolean}
     */
    Mempool.prototype.hasCoin = function (hash, index) {
        var entry = this.map.get(hash);
        if (!entry)
            return false;
        if (this.isSpent(hash, index))
            return false;
        if (index >= entry.tx.outputs.length)
            return false;
        return true;
    };
    /**
     * Check to see if a coin has been spent. This differs from
     * {@link ChainDB#isSpent} in that it actually maintains a
     * map of spent coins, whereas ChainDB may return `true`
     * for transaction outputs that never existed.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Boolean}
     */
    Mempool.prototype.isSpent = function (hash, index) {
        var key = Outpoint.toKey(hash, index);
        return this.spents.has(key);
    };
    /**
     * Get an output's spender entry.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {MempoolEntry}
     */
    Mempool.prototype.getSpent = function (hash, index) {
        var key = Outpoint.toKey(hash, index);
        return this.spents.get(key);
    };
    /**
     * Get an output's spender transaction.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {MempoolEntry}
     */
    Mempool.prototype.getSpentTX = function (hash, index) {
        var key = Outpoint.toKey(hash, index);
        var entry = this.spents.get(key);
        if (!entry)
            return null;
        return entry.tx;
    };
    /**
     * Find all transactions pertaining to a certain address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {TX[]}
     */
    Mempool.prototype.getTXByAddress = function (addr, options) {
        return this.addrindex.get(addr, options);
    };
    /**
     * Find all transactions pertaining to a certain address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {TXMeta[]}
     */
    Mempool.prototype.getMetaByAddress = function (addr, options) {
        return this.addrindex.getMeta(addr, options);
    };
    /**
     * Retrieve a transaction from the mempool.
     * @param {Hash} hash
     * @returns {TXMeta}
     */
    Mempool.prototype.getMeta = function (hash) {
        var entry = this.getEntry(hash);
        if (!entry)
            return null;
        var meta = TXMeta.fromTX(entry.tx);
        meta.mtime = entry.time;
        return meta;
    };
    /**
     * Test the mempool to see if it contains a transaction.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Mempool.prototype.hasEntry = function (hash) {
        return this.map.has(hash);
    };
    /**
     * Test the mempool to see if it
     * contains a transaction or an orphan.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Mempool.prototype.has = function (hash) {
        if (this.locker.has(hash))
            return true;
        if (this.hasOrphan(hash))
            return true;
        return this.hasEntry(hash);
    };
    /**
     * Test the mempool to see if it
     * contains a transaction or an orphan.
     * @private
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Mempool.prototype.exists = function (hash) {
        if (this.locker.pending(hash))
            return true;
        if (this.hasOrphan(hash))
            return true;
        return this.hasEntry(hash);
    };
    /**
     * Test the mempool to see if it
     * contains a recent reject.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Mempool.prototype.hasReject = function (hash) {
        return this.rejects.test(hash);
    };
    /**
     * Add a transaction to the mempool. Note that this
     * will lock the mempool until the transaction is
     * fully processed.
     * @method
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    Mempool.prototype.addTX = function (tx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = tx.hash();
                        return [4 /*yield*/, this.locker.lock(hash)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._addTX(tx, id)];
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
     * Add a transaction to the mempool without a lock.
     * @method
     * @private
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    Mempool.prototype._addTX = function (tx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var missing, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id == null)
                            id = -1;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.insertTX(tx, id)];
                    case 2:
                        missing = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        if (err_1.type === 'VerifyError') {
                            if (!tx.hasWitness() && !err_1.malleated)
                                this.rejects.add(tx.hash());
                        }
                        throw err_1;
                    case 4:
                        if (!(util.now() - this.lastFlush > 10)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.cache.flush()];
                    case 5:
                        _a.sent();
                        this.lastFlush = util.now();
                        _a.label = 6;
                    case 6: return [2 /*return*/, missing];
                }
            });
        });
    };
    /**
     * Add a transaction to the mempool without a lock.
     * @method
     * @private
     * @param {TX} tx
     * @param {Number?} id
     * @returns {Promise}
     */
    Mempool.prototype.insertTX = function (tx, id) {
        return __awaiter(this, void 0, void 0, function () {
            var lockFlags, height, hash, _a, valid, reason, score, _b, valid_1, reason_1, score_1, view, missing, entry;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        assert(!tx.mutable, 'Cannot add mutable TX to mempool.');
                        lockFlags = common.lockFlags.STANDARD_LOCKTIME_FLAGS;
                        height = this.chain.height;
                        hash = tx.hash();
                        _a = tx.checkSanity(), valid = _a[0], reason = _a[1], score = _a[2];
                        if (!valid)
                            throw new VerifyError(tx, 'invalid', reason, score);
                        // Coinbases are an insta-ban.
                        // Why? Who knows.
                        if (tx.isCoinbase()) {
                            throw new VerifyError(tx, 'invalid', 'coinbase', 100);
                        }
                        // Do not allow CSV until it's activated.
                        if (this.options.requireStandard) {
                            if (!this.chain.state.hasCSV() && tx.version >= 2) {
                                throw new VerifyError(tx, 'nonstandard', 'premature-version2-tx', 0);
                            }
                        }
                        // Do not allow segwit until it's activated.
                        if (!this.chain.state.hasWitness() && !this.options.prematureWitness) {
                            if (tx.hasWitness()) {
                                throw new VerifyError(tx, 'nonstandard', 'no-witness-yet', 0, true);
                            }
                        }
                        // Non-contextual standardness checks.
                        if (this.options.requireStandard) {
                            _b = tx.checkStandard(), valid_1 = _b[0], reason_1 = _b[1], score_1 = _b[2];
                            if (!valid_1)
                                throw new VerifyError(tx, 'nonstandard', reason_1, score_1);
                            if (!this.options.replaceByFee) {
                                if (tx.isRBF()) {
                                    throw new VerifyError(tx, 'nonstandard', 'replace-by-fee', 0);
                                }
                            }
                        }
                        return [4 /*yield*/, this.verifyFinal(tx, lockFlags)];
                    case 1:
                        // Verify transaction finality (see isFinal()).
                        if (!(_c.sent())) {
                            throw new VerifyError(tx, 'nonstandard', 'non-final', 0);
                        }
                        // We can maybe ignore this.
                        if (this.exists(hash)) {
                            throw new VerifyError(tx, 'alreadyknown', 'txn-already-in-mempool', 0);
                        }
                        return [4 /*yield*/, this.chain.hasCoins(tx)];
                    case 2:
                        // We can test whether this is an
                        // non-fully-spent transaction on
                        // the chain.
                        if (_c.sent()) {
                            throw new VerifyError(tx, 'alreadyknown', 'txn-already-known', 0);
                        }
                        // Quick and dirty test to verify we're
                        // not double-spending an output in the
                        // mempool.
                        if (this.isDoubleSpend(tx)) {
                            this.emit('conflict', tx);
                            throw new VerifyError(tx, 'duplicate', 'bad-txns-inputs-spent', 0);
                        }
                        return [4 /*yield*/, this.getCoinView(tx)];
                    case 3:
                        view = _c.sent();
                        missing = this.maybeOrphan(tx, view, id);
                        // Return missing outpoint hashes.
                        if (missing)
                            return [2 /*return*/, missing];
                        entry = MempoolEntry.fromTX(tx, view, height);
                        // Contextual verification.
                        return [4 /*yield*/, this.verify(entry, view)];
                    case 4:
                        // Contextual verification.
                        _c.sent();
                        // Add and index the entry.
                        return [4 /*yield*/, this.addEntry(entry, view)];
                    case 5:
                        // Add and index the entry.
                        _c.sent();
                        // Trim size if we're too big.
                        if (this.limitSize(hash)) {
                            throw new VerifyError(tx, 'insufficientfee', 'mempool full', 0);
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Verify a transaction with mempool standards.
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @returns {Promise}
     */
    Mempool.prototype.verify = function (entry, view) {
        return __awaiter(this, void 0, void 0, function () {
            var height, lockFlags, tx, minFee, now, _a, fee, reason, score, flags, err_2, flags_1, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        height = this.chain.height + 1;
                        lockFlags = common.lockFlags.STANDARD_LOCKTIME_FLAGS;
                        tx = entry.tx;
                        return [4 /*yield*/, this.verifyLocks(tx, view, lockFlags)];
                    case 1:
                        // Verify sequence locks.
                        if (!(_c.sent())) {
                            throw new VerifyError(tx, 'nonstandard', 'non-BIP68-final', 0);
                        }
                        // Check input an witness standardness.
                        if (this.options.requireStandard) {
                            if (!tx.hasStandardInputs(view)) {
                                throw new VerifyError(tx, 'nonstandard', 'bad-txns-nonstandard-inputs', 0);
                            }
                            if (this.chain.state.hasWitness()) {
                                if (!tx.hasStandardWitness(view)) {
                                    throw new VerifyError(tx, 'nonstandard', 'bad-witness-nonstandard', 0, true);
                                }
                            }
                        }
                        // Annoying process known as sigops counting.
                        if (entry.sigops > policy.MAX_TX_SIGOPS_COST) {
                            throw new VerifyError(tx, 'nonstandard', 'bad-txns-too-many-sigops', 0);
                        }
                        minFee = policy.getMinFee(entry.size, this.options.minRelay);
                        if (this.options.relayPriority && entry.fee < minFee) {
                            if (!entry.isFree(height)) {
                                throw new VerifyError(tx, 'insufficientfee', 'insufficient priority', 0);
                            }
                        }
                        // Continuously rate-limit free (really, very-low-fee)
                        // transactions. This mitigates 'penny-flooding'.
                        if (this.options.limitFree && entry.fee < minFee) {
                            now = util.now();
                            // Use an exponentially decaying ~10-minute window.
                            this.freeCount *= Math.pow(1 - 1 / 600, now - this.lastTime);
                            this.lastTime = now;
                            // The limitFreeRelay unit is thousand-bytes-per-minute
                            // At default rate it would take over a month to fill 1GB.
                            if (this.freeCount > this.options.limitFreeRelay * 10 * 1000) {
                                throw new VerifyError(tx, 'insufficientfee', 'rate limited free transaction', 0);
                            }
                            this.freeCount += entry.size;
                        }
                        // Important safety feature.
                        if (this.options.rejectAbsurdFees && entry.fee > minFee * 10000)
                            throw new VerifyError(tx, 'highfee', 'absurdly-high-fee', 0);
                        // Why do we have this here? Nested transactions are cool.
                        if (this.countAncestors(entry) + 1 > this.options.maxAncestors) {
                            throw new VerifyError(tx, 'nonstandard', 'too-long-mempool-chain', 0);
                        }
                        _a = tx.checkInputs(view, height), fee = _a[0], reason = _a[1], score = _a[2];
                        if (fee === -1)
                            throw new VerifyError(tx, 'invalid', reason, score);
                        flags = Script.flags.STANDARD_VERIFY_FLAGS;
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this.verifyInputs(tx, view, flags)];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        err_2 = _c.sent();
                        if (tx.hasWitness())
                            throw err_2;
                        // Try without segwit and cleanstack.
                        flags &= ~Script.flags.VERIFY_WITNESS;
                        flags &= ~Script.flags.VERIFY_CLEANSTACK;
                        return [4 /*yield*/, this.verifyResult(tx, view, flags)];
                    case 5:
                        // If it failed, the first verification
                        // was the only result we needed.
                        if (!(_c.sent()))
                            throw err_2;
                        // If it succeeded, segwit may be causing the
                        // failure. Try with segwit but without cleanstack.
                        flags |= Script.flags.VERIFY_WITNESS;
                        return [4 /*yield*/, this.verifyResult(tx, view, flags)];
                    case 6:
                        // Cleanstack was causing the failure.
                        if (_c.sent())
                            throw err_2;
                        // Do not insert into reject cache.
                        err_2.malleated = true;
                        throw err_2;
                    case 7:
                        if (!this.options.paranoidChecks) return [3 /*break*/, 9];
                        flags_1 = Script.flags.MANDATORY_VERIFY_FLAGS;
                        _b = assert;
                        return [4 /*yield*/, this.verifyResult(tx, view, flags_1)];
                    case 8:
                        _b.apply(void 0, [_c.sent(), 'BUG: Verify failed for mandatory but not standard.']);
                        _c.label = 9;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify inputs, return a boolean
     * instead of an error based on success.
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    Mempool.prototype.verifyResult = function (tx, view, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.verifyInputs(tx, view, flags)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_3 = _a.sent();
                        if (err_3.type === 'VerifyError')
                            return [2 /*return*/, false];
                        throw err_3;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Verify inputs for standard
     * _and_ mandatory flags on failure.
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    Mempool.prototype.verifyInputs = function (tx, view, flags) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tx.verifyAsync(view, flags, this.workers)];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/];
                        if (!(flags & Script.flags.ONLY_STANDARD_VERIFY_FLAGS)) return [3 /*break*/, 3];
                        flags &= ~Script.flags.ONLY_STANDARD_VERIFY_FLAGS;
                        return [4 /*yield*/, tx.verifyAsync(view, flags, this.workers)];
                    case 2:
                        if (_a.sent()) {
                            throw new VerifyError(tx, 'nonstandard', 'non-mandatory-script-verify-flag', 0);
                        }
                        _a.label = 3;
                    case 3: throw new VerifyError(tx, 'nonstandard', 'mandatory-script-verify-flag', 100);
                }
            });
        });
    };
    /**
     * Add a transaction to the mempool without performing any
     * validation. Note that this method does not lock the mempool
     * and may lend itself to race conditions if used unwisely.
     * This function will also resolve orphans if possible (the
     * resolved orphans _will_ be validated).
     * @method
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     * @returns {Promise}
     */
    Mempool.prototype.addEntry = function (entry, view) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = entry.tx;
                        this.trackEntry(entry, view);
                        this.updateAncestors(entry, addFee);
                        this.emit('tx', tx, view);
                        this.emit('add entry', entry);
                        if (this.fees)
                            this.fees.processTX(entry, this.chain.synced);
                        this.logger.debug('Added %h to mempool (txs=%d).', tx.hash(), this.map.size);
                        this.cache.save(entry);
                        return [4 /*yield*/, this.handleOrphans(tx)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a transaction from the mempool.
     * Generally only called when a new block
     * is added to the main chain.
     * @param {MempoolEntry} entry
     */
    Mempool.prototype.removeEntry = function (entry) {
        var tx = entry.tx;
        var hash = tx.hash();
        this.untrackEntry(entry);
        if (this.fees)
            this.fees.removeTX(hash);
        this.cache.remove(hash);
        this.emit('remove entry', entry);
    };
    /**
     * Remove a transaction from the mempool.
     * Recursively remove its spenders.
     * @param {MempoolEntry} entry
     */
    Mempool.prototype.evictEntry = function (entry) {
        this.removeSpenders(entry);
        this.updateAncestors(entry, removeFee);
        this.removeEntry(entry);
    };
    /**
     * Recursively remove spenders of a transaction.
     * @private
     * @param {MempoolEntry} entry
     */
    Mempool.prototype.removeSpenders = function (entry) {
        var tx = entry.tx;
        var hash = tx.hash();
        for (var i = 0; i < tx.outputs.length; i++) {
            var spender = this.getSpent(hash, i);
            if (!spender)
                continue;
            this.removeSpenders(spender);
            this.removeEntry(spender);
        }
    };
    /**
     * Count the highest number of
     * ancestors a transaction may have.
     * @param {MempoolEntry} entry
     * @returns {Number}
     */
    Mempool.prototype.countAncestors = function (entry) {
        return this._countAncestors(entry, new BufferSet(), entry, nop);
    };
    /**
     * Count the highest number of
     * ancestors a transaction may have.
     * Update descendant fees and size.
     * @param {MempoolEntry} entry
     * @param {Function} map
     * @returns {Number}
     */
    Mempool.prototype.updateAncestors = function (entry, map) {
        return this._countAncestors(entry, new BufferSet(), entry, map);
    };
    /**
     * Traverse ancestors and count.
     * @private
     * @param {MempoolEntry} entry
     * @param {Object} set
     * @param {MempoolEntry} child
     * @param {Function} map
     * @returns {Number}
     */
    Mempool.prototype._countAncestors = function (entry, set, child, map) {
        var tx = entry.tx;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var hash = prevout.hash;
            var parent_1 = this.getEntry(hash);
            if (!parent_1)
                continue;
            if (set.has(hash))
                continue;
            set.add(hash);
            map(parent_1, child);
            if (set.size > this.options.maxAncestors)
                break;
            this._countAncestors(parent_1, set, child, map);
            if (set.size > this.options.maxAncestors)
                break;
        }
        return set.size;
    };
    /**
     * Count the highest number of
     * descendants a transaction may have.
     * @param {MempoolEntry} entry
     * @returns {Number}
     */
    Mempool.prototype.countDescendants = function (entry) {
        return this._countDescendants(entry, new BufferSet());
    };
    /**
     * Count the highest number of
     * descendants a transaction may have.
     * @private
     * @param {MempoolEntry} entry
     * @param {Object} set
     * @returns {Number}
     */
    Mempool.prototype._countDescendants = function (entry, set) {
        var tx = entry.tx;
        var hash = tx.hash();
        for (var i = 0; i < tx.outputs.length; i++) {
            var child = this.getSpent(hash, i);
            if (!child)
                continue;
            var next = child.hash();
            if (set.has(next))
                continue;
            set.add(next);
            this._countDescendants(child, set);
        }
        return set.size;
    };
    /**
     * Get all transaction ancestors.
     * @param {MempoolEntry} entry
     * @returns {MempoolEntry[]}
     */
    Mempool.prototype.getAncestors = function (entry) {
        return this._getAncestors(entry, [], new BufferSet());
    };
    /**
     * Get all transaction ancestors.
     * @private
     * @param {MempoolEntry} entry
     * @param {MempoolEntry[]} entries
     * @param {Object} set
     * @returns {MempoolEntry[]}
     */
    Mempool.prototype._getAncestors = function (entry, entries, set) {
        var tx = entry.tx;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var hash = prevout.hash;
            var parent_2 = this.getEntry(hash);
            if (!parent_2)
                continue;
            if (set.has(hash))
                continue;
            set.add(hash);
            entries.push(parent_2);
            this._getAncestors(parent_2, entries, set);
        }
        return entries;
    };
    /**
     * Get all a transaction descendants.
     * @param {MempoolEntry} entry
     * @returns {MempoolEntry[]}
     */
    Mempool.prototype.getDescendants = function (entry) {
        return this._getDescendants(entry, [], new BufferSet());
    };
    /**
     * Get all a transaction descendants.
     * @param {MempoolEntry} entry
     * @param {MempoolEntry[]} entries
     * @param {Object} set
     * @returns {MempoolEntry[]}
     */
    Mempool.prototype._getDescendants = function (entry, entries, set) {
        var tx = entry.tx;
        var hash = tx.hash();
        for (var i = 0; i < tx.outputs.length; i++) {
            var child = this.getSpent(hash, i);
            if (!child)
                continue;
            var next = child.hash();
            if (set.has(next))
                continue;
            set.add(next);
            entries.push(child);
            this._getDescendants(child, entries, set);
        }
        return entries;
    };
    /**
     * Find a unconfirmed transactions that
     * this transaction depends on.
     * @param {TX} tx
     * @returns {Hash[]}
     */
    Mempool.prototype.getDepends = function (tx) {
        var prevout = tx.getPrevout();
        var depends = [];
        for (var _i = 0, prevout_1 = prevout; _i < prevout_1.length; _i++) {
            var hash = prevout_1[_i];
            if (this.hasEntry(hash))
                depends.push(hash);
        }
        return depends;
    };
    /**
     * Test whether a transaction has dependencies.
     * @param {TX} tx
     * @returns {Boolean}
     */
    Mempool.prototype.hasDepends = function (tx) {
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            if (this.hasEntry(prevout.hash))
                return true;
        }
        return false;
    };
    /**
     * Return the full balance of all unspents in the mempool
     * (not very useful in practice, only used for testing).
     * @returns {Amount}
     */
    Mempool.prototype.getBalance = function () {
        var total = 0;
        for (var _i = 0, _a = this.map; _i < _a.length; _i++) {
            var _b = _a[_i], hash = _b[0], entry = _b[1];
            var tx = entry.tx;
            for (var i = 0; i < tx.outputs.length; i++) {
                var coin = this.getCoin(hash, i);
                if (coin)
                    total += coin.value;
            }
        }
        return total;
    };
    /**
     * Retrieve _all_ transactions from the mempool.
     * @returns {TX[]}
     */
    Mempool.prototype.getHistory = function () {
        var txs = [];
        for (var _i = 0, _a = this.map.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            txs.push(entry.tx);
        }
        return txs;
    };
    /**
     * Retrieve an orphan transaction.
     * @param {Hash} hash
     * @returns {TX}
     */
    Mempool.prototype.getOrphan = function (hash) {
        return this.orphans.get(hash);
    };
    /**
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Mempool.prototype.hasOrphan = function (hash) {
        return this.orphans.has(hash);
    };
    /**
     * Maybe store an orphaned transaction.
     * @param {TX} tx
     * @param {CoinView} view
     * @param {Number} id
     */
    Mempool.prototype.maybeOrphan = function (tx, view, id) {
        var hashes = new BufferSet();
        var missing = [];
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            if (view.hasEntry(prevout))
                continue;
            if (this.hasReject(prevout.hash)) {
                this.logger.debug('Not storing orphan %h (rejected parents).', tx.hash());
                this.rejects.add(tx.hash());
                return missing;
            }
            if (this.hasEntry(prevout.hash)) {
                this.logger.debug('Not storing orphan %h (non-existent output).', tx.hash());
                this.rejects.add(tx.hash());
                return missing;
            }
            hashes.add(prevout.hash);
        }
        // Not an orphan.
        if (hashes.size === 0)
            return null;
        // Weight limit for orphans.
        if (tx.getWeight() > policy.MAX_TX_WEIGHT) {
            this.logger.debug('Ignoring large orphan: %h', tx.hash());
            if (!tx.hasWitness())
                this.rejects.add(tx.hash());
            return missing;
        }
        if (this.options.maxOrphans === 0)
            return missing;
        this.limitOrphans();
        var hash = tx.hash();
        for (var _b = 0, _c = hashes.keys(); _b < _c.length; _b++) {
            var prev = _c[_b];
            if (!this.waiting.has(prev))
                this.waiting.set(prev, new BufferSet());
            this.waiting.get(prev).add(hash);
            missing.push(prev);
        }
        this.orphans.set(hash, new Orphan(tx, missing.length, id));
        this.logger.debug('Added orphan %h to mempool.', tx.hash());
        this.emit('add orphan', tx);
        return missing;
    };
    /**
     * Resolve orphans and attempt to add to mempool.
     * @method
     * @param {TX} parent
     * @returns {Promise} - Returns {@link TX}[].
     */
    Mempool.prototype.handleOrphans = function (parent) {
        return __awaiter(this, void 0, void 0, function () {
            var resolved, _i, resolved_1, orphan, tx, missing, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resolved = this.resolveOrphans(parent);
                        _i = 0, resolved_1 = resolved;
                        _a.label = 1;
                    case 1:
                        if (!(_i < resolved_1.length)) return [3 /*break*/, 7];
                        orphan = resolved_1[_i];
                        tx = void 0, missing = void 0;
                        try {
                            tx = orphan.toTX();
                        }
                        catch (e) {
                            this.logger.warning('%s %s', 'Warning: possible memory corruption.', 'Orphan failed deserialization.');
                            return [3 /*break*/, 6];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.insertTX(tx, orphan.id)];
                    case 3:
                        missing = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _a.sent();
                        if (err_4.type === 'VerifyError') {
                            this.logger.debug('Could not resolve orphan %h: %s.', tx.hash(), err_4.message);
                            if (!tx.hasWitness() && !err_4.malleated)
                                this.rejects.add(tx.hash());
                            this.emit('bad orphan', err_4, orphan.id);
                            return [3 /*break*/, 6];
                        }
                        throw err_4;
                    case 5:
                        // Can happen if an existing parent is
                        // evicted in the interim between fetching
                        // the non-present parents.
                        if (missing && missing.length > 0) {
                            this.logger.debug('Transaction %h was double-orphaned in mempool.', tx.hash());
                            this.removeOrphan(tx.hash());
                            return [3 /*break*/, 6];
                        }
                        this.logger.debug('Resolved orphan %h in mempool.', tx.hash());
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Potentially resolve any transactions
     * that redeem the passed-in transaction.
     * Deletes all orphan entries and
     * returns orphan objects.
     * @param {TX} parent
     * @returns {Orphan[]}
     */
    Mempool.prototype.resolveOrphans = function (parent) {
        var hash = parent.hash();
        var set = this.waiting.get(hash);
        if (!set)
            return [];
        assert(set.size > 0);
        var resolved = [];
        for (var _i = 0, _a = set.keys(); _i < _a.length; _i++) {
            var hash_1 = _a[_i];
            var orphan = this.getOrphan(hash_1);
            assert(orphan);
            if (--orphan.missing === 0) {
                this.orphans["delete"](hash_1);
                resolved.push(orphan);
            }
        }
        this.waiting["delete"](hash);
        return resolved;
    };
    /**
     * Remove a transaction from the mempool.
     * @param {Hash} tx
     * @returns {Boolean}
     */
    Mempool.prototype.removeOrphan = function (hash) {
        var orphan = this.getOrphan(hash);
        if (!orphan)
            return false;
        var tx;
        try {
            tx = orphan.toTX();
        }
        catch (e) {
            this.orphans["delete"](hash);
            this.logger.warning('%s %s', 'Warning: possible memory corruption.', 'Orphan failed deserialization.');
            return false;
        }
        for (var _i = 0, _a = tx.getPrevout(); _i < _a.length; _i++) {
            var prev = _a[_i];
            var set = this.waiting.get(prev);
            if (!set)
                continue;
            assert(set.has(hash));
            set["delete"](hash);
            if (set.size === 0)
                this.waiting["delete"](prev);
        }
        this.orphans["delete"](hash);
        this.emit('remove orphan', tx);
        return true;
    };
    /**
     * Remove a random orphan transaction from the mempool.
     * @returns {Boolean}
     */
    Mempool.prototype.limitOrphans = function () {
        if (this.orphans.size < this.options.maxOrphans)
            return false;
        var index = random.randomRange(0, this.orphans.size);
        var hash;
        for (var _i = 0, _a = this.orphans.keys(); _i < _a.length; _i++) {
            hash = _a[_i];
            if (index === 0)
                break;
            index--;
        }
        assert(hash);
        this.logger.debug('Removing orphan %h from mempool.', hash);
        this.removeOrphan(hash);
        return true;
    };
    /**
     * Test all of a transactions outpoints to see if they are doublespends.
     * Note that this will only test against the mempool spents, not the
     * blockchain's. The blockchain spents are not checked against because
     * the blockchain does not maintain a spent list. The transaction will
     * be seen as an orphan rather than a double spend.
     * @param {TX} tx
     * @returns {Promise} - Returns Boolean.
     */
    Mempool.prototype.isDoubleSpend = function (tx) {
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var hash = prevout.hash, index = prevout.index;
            if (this.isSpent(hash, index))
                return true;
        }
        return false;
    };
    /**
     * Get coin viewpoint (lock).
     * Note: this does not return
     * historical view of coins from the indexers.
     * @method
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Mempool.prototype.getSpentView = function (tx) {
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
                        return [4 /*yield*/, this._getSpentView(tx)];
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
     * Get coin viewpoint
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}
     */
    Mempool.prototype._getSpentView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, _i, _a, prevout, hash, index, tx_1, coin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash, index = prevout.index;
                        tx_1 = this.getTX(hash);
                        if (tx_1) {
                            if (index < tx_1.outputs.length)
                                view.addIndex(tx_1, index, -1);
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, this.chain.readCoin(prevout)];
                    case 2:
                        coin = _b.sent();
                        if (coin)
                            view.addEntry(prevout, coin);
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
     * Get coin viewpoint (no lock).
     * @method
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Mempool.prototype.getCoinView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, _i, _a, prevout, hash, index, tx_2, coin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash, index = prevout.index;
                        tx_2 = this.getTX(hash);
                        if (tx_2) {
                            if (this.hasCoin(hash, index))
                                view.addIndex(tx_2, index, -1);
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, this.chain.readCoin(prevout)];
                    case 2:
                        coin = _b.sent();
                        if (coin)
                            view.addEntry(prevout, coin);
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
     * Get a snapshot of all transaction hashes in the mempool. Used
     * for generating INV packets in response to MEMPOOL packets.
     * @returns {Hash[]}
     */
    Mempool.prototype.getSnapshot = function () {
        var keys = [];
        for (var _i = 0, _a = this.map.keys(); _i < _a.length; _i++) {
            var hash = _a[_i];
            keys.push(hash);
        }
        return keys;
    };
    /**
     * Check sequence locks on a transaction against the current tip.
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    Mempool.prototype.verifyLocks = function (tx, view, flags) {
        return this.chain.verifyLocks(this.chain.tip, tx, view, flags);
    };
    /**
     * Check locktime on a transaction against the current tip.
     * @param {TX} tx
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    Mempool.prototype.verifyFinal = function (tx, flags) {
        return this.chain.verifyFinal(this.chain.tip, tx, flags);
    };
    /**
     * Map a transaction to the mempool.
     * @private
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     */
    Mempool.prototype.trackEntry = function (entry, view) {
        var tx = entry.tx;
        var hash = tx.hash();
        assert(!this.map.has(hash));
        this.map.set(hash, entry);
        assert(!tx.isCoinbase());
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var key = prevout.toKey();
            this.spents.set(key, entry);
        }
        if (this.options.indexAddress && view)
            this.indexEntry(entry, view);
        this.size += entry.memUsage();
    };
    /**
     * Unmap a transaction from the mempool.
     * @private
     * @param {MempoolEntry} entry
     */
    Mempool.prototype.untrackEntry = function (entry) {
        var tx = entry.tx;
        var hash = tx.hash();
        assert(this.map.has(hash));
        this.map["delete"](hash);
        assert(!tx.isCoinbase());
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var key = prevout.toKey();
            this.spents["delete"](key);
        }
        if (this.options.indexAddress)
            this.unindexEntry(entry);
        this.size -= entry.memUsage();
    };
    /**
     * Index an entry by address.
     * @private
     * @param {MempoolEntry} entry
     * @param {CoinView} view
     */
    Mempool.prototype.indexEntry = function (entry, view) {
        this.addrindex.insert(entry, view);
    };
    /**
     * Unindex an entry by address.
     * @private
     * @param {MempoolEntry} entry
     */
    Mempool.prototype.unindexEntry = function (entry) {
        var hash = entry.tx.hash();
        this.addrindex.remove(hash);
    };
    /**
     * Recursively remove double spenders
     * of a mined transaction's outpoints.
     * @private
     * @param {TX} tx
     */
    Mempool.prototype.removeDoubleSpends = function (tx) {
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var hash = prevout.hash, index = prevout.index;
            var spent = this.getSpent(hash, index);
            if (!spent)
                continue;
            this.logger.debug('Removing double spender from mempool: %h.', spent.hash());
            this.evictEntry(spent);
            this.emit('double spend', spent);
        }
    };
    /**
     * Calculate the memory usage of the entire mempool.
     * @see DynamicMemoryUsage()
     * @returns {Number} Usage in bytes.
     */
    Mempool.prototype.getSize = function () {
        return this.size;
    };
    /**
     * Prioritise transaction.
     * @param {MempoolEntry} entry
     * @param {Number} pri
     * @param {Amount} fee
     */
    Mempool.prototype.prioritise = function (entry, pri, fee) {
        if (-pri > entry.priority)
            pri = -entry.priority;
        entry.priority += pri;
        if (-fee > entry.deltaFee)
            fee = -entry.deltaFee;
        if (fee === 0)
            return;
        this.updateAncestors(entry, prePrioritise);
        entry.deltaFee += fee;
        entry.descFee += fee;
        this.updateAncestors(entry, postPrioritise);
    };
    return Mempool;
}(EventEmitter));
/**
 * Mempool Options
 * @alias module:mempool.MempoolOptions
 */
var MempoolOptions = /** @class */ (function () {
    /**
     * Create mempool options.
     * @constructor
     * @param {Object}
     */
    function MempoolOptions(options) {
        this.network = Network.primary;
        this.chain = null;
        this.logger = null;
        this.workers = null;
        this.fees = null;
        this.limitFree = true;
        this.limitFreeRelay = 15;
        this.relayPriority = true;
        this.requireStandard = this.network.requireStandard;
        this.rejectAbsurdFees = true;
        this.prematureWitness = false;
        this.paranoidChecks = false;
        this.replaceByFee = false;
        this.maxSize = policy.MEMPOOL_MAX_SIZE;
        this.maxOrphans = policy.MEMPOOL_MAX_ORPHANS;
        this.maxAncestors = policy.MEMPOOL_MAX_ANCESTORS;
        this.expiryTime = policy.MEMPOOL_EXPIRY_TIME;
        this.minRelay = this.network.minRelay;
        this.prefix = null;
        this.location = null;
        this.memory = true;
        this.maxFiles = 64;
        this.cacheSize = 32 << 20;
        this.compression = true;
        this.persistent = false;
        this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {MempoolOptions}
     */
    MempoolOptions.prototype.fromOptions = function (options) {
        assert(options, 'Mempool requires options.');
        assert(options.chain && typeof options.chain === 'object', 'Mempool requires a blockchain.');
        this.chain = options.chain;
        this.network = options.chain.network;
        this.logger = options.chain.logger;
        this.workers = options.chain.workers;
        this.requireStandard = this.network.requireStandard;
        this.minRelay = this.network.minRelay;
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.workers != null) {
            assert(typeof options.workers === 'object');
            this.workers = options.workers;
        }
        if (options.fees != null) {
            assert(typeof options.fees === 'object');
            this.fees = options.fees;
        }
        if (options.limitFree != null) {
            assert(typeof options.limitFree === 'boolean');
            this.limitFree = options.limitFree;
        }
        if (options.limitFreeRelay != null) {
            assert((options.limitFreeRelay >>> 0) === options.limitFreeRelay);
            this.limitFreeRelay = options.limitFreeRelay;
        }
        if (options.relayPriority != null) {
            assert(typeof options.relayPriority === 'boolean');
            this.relayPriority = options.relayPriority;
        }
        if (options.requireStandard != null) {
            assert(typeof options.requireStandard === 'boolean');
            this.requireStandard = options.requireStandard;
        }
        if (options.rejectAbsurdFees != null) {
            assert(typeof options.rejectAbsurdFees === 'boolean');
            this.rejectAbsurdFees = options.rejectAbsurdFees;
        }
        if (options.prematureWitness != null) {
            assert(typeof options.prematureWitness === 'boolean');
            this.prematureWitness = options.prematureWitness;
        }
        if (options.paranoidChecks != null) {
            assert(typeof options.paranoidChecks === 'boolean');
            this.paranoidChecks = options.paranoidChecks;
        }
        if (options.replaceByFee != null) {
            assert(typeof options.replaceByFee === 'boolean');
            this.replaceByFee = options.replaceByFee;
        }
        if (options.maxSize != null) {
            assert((options.maxSize >>> 0) === options.maxSize);
            this.maxSize = options.maxSize;
        }
        if (options.maxOrphans != null) {
            assert((options.maxOrphans >>> 0) === options.maxOrphans);
            this.maxOrphans = options.maxOrphans;
        }
        if (options.maxAncestors != null) {
            assert((options.maxAncestors >>> 0) === options.maxAncestors);
            this.maxAncestors = options.maxAncestors;
        }
        if (options.expiryTime != null) {
            assert((options.expiryTime >>> 0) === options.expiryTime);
            this.expiryTime = options.expiryTime;
        }
        if (options.minRelay != null) {
            assert((options.minRelay >>> 0) === options.minRelay);
            this.minRelay = options.minRelay;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.location = path.join(this.prefix, 'mempool');
        }
        if (options.location != null) {
            assert(typeof options.location === 'string');
            this.location = options.location;
        }
        if (options.memory != null) {
            assert(typeof options.memory === 'boolean');
            this.memory = options.memory;
        }
        if (options.maxFiles != null) {
            assert((options.maxFiles >>> 0) === options.maxFiles);
            this.maxFiles = options.maxFiles;
        }
        if (options.cacheSize != null) {
            assert(Number.isSafeInteger(options.cacheSize));
            assert(options.cacheSize >= 0);
            this.cacheSize = options.cacheSize;
        }
        if (options.compression != null) {
            assert(typeof options.compression === 'boolean');
            this.compression = options.compression;
        }
        if (options.persistent != null) {
            assert(typeof options.persistent === 'boolean');
            this.persistent = options.persistent;
        }
        if (options.indexAddress != null) {
            assert(typeof options.indexAddress === 'boolean');
            this.indexAddress = options.indexAddress;
        }
        return this;
    };
    /**
     * Instantiate mempool options from object.
     * @param {Object} options
     * @returns {MempoolOptions}
     */
    MempoolOptions.fromOptions = function (options) {
        return new MempoolOptions().fromOptions(options);
    };
    return MempoolOptions;
}());
/**
 * Orphan
 * @ignore
 */
var Orphan = /** @class */ (function () {
    /**
     * Create an orphan.
     * @constructor
     * @param {TX} tx
     * @param {Hash[]} missing
     * @param {Number} id
     */
    function Orphan(tx, missing, id) {
        this.raw = tx.toRaw();
        this.missing = missing;
        this.id = id;
    }
    Orphan.prototype.toTX = function () {
        return TX.fromRaw(this.raw);
    };
    return Orphan;
}());
/**
 * Mempool Cache
 * @ignore
 */
var MempoolCache = /** @class */ (function () {
    /**
     * Create a mempool cache.
     * @constructor
     * @param {Object} options
     */
    function MempoolCache(options) {
        this.logger = options.logger;
        this.chain = options.chain;
        this.network = options.network;
        this.db = null;
        this.batch = null;
        if (options.persistent)
            this.db = bdb.create(options);
    }
    MempoolCache.prototype.getVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.v.encode())];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, -1];
                        return [2 /*return*/, data.readUInt32LE(0, true)];
                }
            });
        });
    };
    MempoolCache.prototype.getTip = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.get(layout.R.encode())];
            });
        });
    };
    MempoolCache.prototype.getFees = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, fees;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.F.encode())];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        fees = null;
                        try {
                            fees = Fees.fromRaw(data);
                        }
                        catch (e) {
                            this.logger.warning('Fee data failed deserialization: %s.', e.message);
                        }
                        return [2 /*return*/, fees];
                }
            });
        });
    };
    MempoolCache.prototype.getEntries = function () {
        return this.db.values({
            gte: layout.e.min(),
            lte: layout.e.max(),
            parse: function (data) { return MempoolEntry.fromRaw(data); }
        });
    };
    MempoolCache.prototype.getKeys = function () {
        return this.db.keys({
            gte: layout.e.min(),
            lte: layout.e.max()
        });
    };
    MempoolCache.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'mempool', 0)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.verify()];
                    case 3:
                        _a.sent();
                        this.batch = this.db.batch();
                        return [2 /*return*/];
                }
            });
        });
    };
    MempoolCache.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        this.batch = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    MempoolCache.prototype.save = function (entry) {
        if (!this.db)
            return;
        this.batch.put(layout.e.encode(entry.hash()), entry.toRaw());
    };
    MempoolCache.prototype.remove = function (hash) {
        if (!this.db)
            return;
        this.batch.del(layout.e.encode(hash));
    };
    MempoolCache.prototype.sync = function (tip) {
        if (!this.db)
            return;
        this.batch.put(layout.R.encode(), tip);
    };
    MempoolCache.prototype.writeFees = function (fees) {
        if (!this.db)
            return;
        this.batch.put(layout.F.encode(), fees.toRaw());
    };
    MempoolCache.prototype.clear = function () {
        this.batch.clear();
        this.batch = this.db.batch();
    };
    MempoolCache.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.db)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.batch.write()];
                    case 1:
                        _a.sent();
                        this.batch = this.db.batch();
                        return [2 /*return*/];
                }
            });
        });
    };
    MempoolCache.prototype.init = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var batch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.db.batch();
                        batch.put(layout.v.encode(), fromU32(MempoolCache.VERSION));
                        batch.put(layout.R.encode(), hash);
                        return [4 /*yield*/, batch.write()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MempoolCache.prototype.verify = function () {
        return __awaiter(this, void 0, void 0, function () {
            var version, tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVersion()];
                    case 1:
                        version = _a.sent();
                        if (!(version === -1)) return [3 /*break*/, 3];
                        version = MempoolCache.VERSION;
                        tip = this.chain.tip.hash;
                        this.logger.info('Mempool cache is empty. Writing tip %h.', tip);
                        return [4 /*yield*/, this.init(tip)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(version !== MempoolCache.VERSION)) return [3 /*break*/, 5];
                        this.logger.warning('Mempool cache version mismatch (%d != %d)!', version, MempoolCache.VERSION);
                        this.logger.warning('Invalidating mempool cache.');
                        return [4 /*yield*/, this.wipe()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [4 /*yield*/, this.getTip()];
                    case 6:
                        tip = _a.sent();
                        if (!(!tip || !tip.equals(this.chain.tip.hash))) return [3 /*break*/, 8];
                        this.logger.warning('Mempool tip not consistent with chain tip (%h != %h)!', tip, this.chain.tip.hash);
                        this.logger.warning('Invalidating mempool cache.');
                        return [4 /*yield*/, this.wipe()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/, true];
                }
            });
        });
    };
    MempoolCache.prototype.wipe = function () {
        return __awaiter(this, void 0, void 0, function () {
            var batch, keys, _i, keys_1, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batch = this.db.batch();
                        return [4 /*yield*/, this.getKeys()];
                    case 1:
                        keys = _a.sent();
                        for (_i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                            key = keys_1[_i];
                            batch.del(key);
                        }
                        batch.put(layout.v.encode(), fromU32(MempoolCache.VERSION));
                        batch.put(layout.R.encode(), this.chain.tip.hash);
                        batch.del(layout.F.encode());
                        return [4 /*yield*/, batch.write()];
                    case 2:
                        _a.sent();
                        this.logger.info('Removed %d mempool entries from disk.', keys.length);
                        return [2 /*return*/];
                }
            });
        });
    };
    return MempoolCache;
}());
MempoolCache.VERSION = 2;
/*
 * Helpers
 */
function nop(parent, child) {
    ;
}
function addFee(parent, child) {
    parent.descFee += child.deltaFee;
    parent.descSize += child.size;
}
function removeFee(parent, child) {
    parent.descFee -= child.descFee;
    parent.descSize -= child.descSize;
}
function prePrioritise(parent, child) {
    parent.descFee -= child.deltaFee;
}
function postPrioritise(parent, child) {
    parent.descFee += child.deltaFee;
}
function cmpRate(a, b) {
    var xf = a.deltaFee;
    var xs = a.size;
    var yf = b.deltaFee;
    var ys = b.size;
    var x, y;
    if (useDesc(a)) {
        xf = a.descFee;
        xs = a.descSize;
    }
    if (useDesc(b)) {
        yf = b.descFee;
        ys = b.descSize;
    }
    x = xf * ys;
    y = xs * yf;
    if (x === y) {
        x = a.time;
        y = b.time;
    }
    return x - y;
}
function useDesc(a) {
    var x = a.deltaFee * a.descSize;
    var y = a.descFee * a.size;
    return y > x;
}
function fromU32(num) {
    var data = Buffer.allocUnsafe(4);
    data.writeUInt32LE(num, 0, true);
    return data;
}
/*
 * Expose
 */
module.exports = Mempool;
