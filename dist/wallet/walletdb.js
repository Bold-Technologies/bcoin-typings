/*!
 * walletdb.js - storage for wallets
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
var path = require('path');
var EventEmitter = require('events');
var bio = require('bufio');
var BloomFilter = require('bfilter').BloomFilter;
var _a = require('bmutex'), Lock = _a.Lock, MapLock = _a.MapLock;
var bdb = require('bdb');
var Logger = require('blgr');
var safeEqual = require('bcrypto/lib/safe').safeEqual;
var aes = require('bcrypto/lib/aes');
var Network = require('../protocol/network');
var Path = require('./path');
var common = require('./common');
var Wallet = require('./wallet');
var Account = require('./account');
var Outpoint = require('../primitives/outpoint');
var layouts = require('./layout');
var records = require('./records');
var NullClient = require('./nullclient');
var layout = layouts.wdb;
var tlayout = layouts.txdb;
var ChainState = records.ChainState, BlockMeta = records.BlockMeta, TXRecord = records.TXRecord, MapRecord = records.MapRecord;
/**
 * WalletDB
 * @alias module:wallet.WalletDB
 * @extends EventEmitter
 */
var WalletDB = /** @class */ (function (_super) {
    __extends(WalletDB, _super);
    /**
     * Create a wallet db.
     * @constructor
     * @param {Object} options
     */
    function WalletDB(options) {
        var _this = _super.call(this) || this;
        _this.options = new WalletOptions(options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('wallet');
        _this.workers = _this.options.workers;
        _this.client = _this.options.client || new NullClient(_this);
        _this.feeRate = _this.options.feeRate;
        _this.db = bdb.create(_this.options);
        _this.primary = null;
        _this.state = new ChainState();
        _this.confirming = false;
        _this.height = 0;
        _this.wallets = new Map();
        _this.depth = 0;
        _this.rescanning = false;
        _this.filterSent = false;
        // Wallet read lock.
        _this.readLock = new MapLock();
        // Wallet write lock (creation and rename).
        _this.writeLock = new Lock();
        // Lock for handling anything tx related.
        _this.txLock = new Lock();
        // Address and outpoint filter.
        _this.filter = new BloomFilter();
        _this.init();
        return _this;
    }
    /**
     * Initialize walletdb.
     * @private
     */
    WalletDB.prototype.init = function () {
        var items = 3000000;
        var flag = -1;
        // Highest number of items with an
        // FPR of 0.001. We have to do this
        // by hand because BloomFilter.fromRate's
        // policy limit enforcing is fairly
        // naive.
        if (this.options.spv) {
            items = 20000;
            flag = BloomFilter.flags.ALL;
        }
        this.filter = BloomFilter.fromRate(items, 0.001, flag);
        this._bind();
    };
    /**
     * Bind to node events.
     * @private
     */
    WalletDB.prototype._bind = function () {
        var _this = this;
        this.client.on('error', function (err) {
            _this.emit('error', err);
        });
        this.client.on('connect', function () { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.syncNode()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.emit('error', e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.client.on('disconnect', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.filterSent = false;
                return [2 /*return*/];
            });
        }); });
        this.client.bind('block connect', function (entry, txs) { return __awaiter(_this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.addBlock(entry, txs)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        this.emit('error', e_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.client.bind('block disconnect', function (entry) { return __awaiter(_this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.removeBlock(entry)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        this.emit('error', e_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.client.hook('block rescan', function (entry, txs) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.rescanBlock(entry, txs)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        this.emit('error', e_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.client.bind('tx', function (tx) { return __awaiter(_this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.addTX(tx)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_5 = _a.sent();
                        this.emit('error', e_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.client.bind('chain reset', function (tip) { return __awaiter(_this, void 0, void 0, function () {
            var e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.resetChain(tip)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_6 = _a.sent();
                        this.emit('error', e_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Open the walletdb, wait for the database to load.
     * @returns {Promise}
     */
    WalletDB.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, wallet, addr;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.info('Opening WalletDB...');
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'wallet', 7)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.verifyNetwork()];
                    case 3:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.getDepth()];
                    case 4:
                        _a.depth = _b.sent();
                        if (!this.options.wipeNoReally) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.wipe()];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6: return [4 /*yield*/, this.watch()];
                    case 7:
                        _b.sent();
                        return [4 /*yield*/, this.connect()];
                    case 8:
                        _b.sent();
                        this.logger.info('WalletDB loaded (depth=%d, height=%d, start=%d).', this.depth, this.state.height, this.state.startHeight);
                        return [4 /*yield*/, this.ensure({
                                id: 'primary'
                            })];
                    case 9:
                        wallet = _b.sent();
                        return [4 /*yield*/, wallet.receiveAddress()];
                    case 10:
                        addr = _b.sent();
                        this.logger.info('Loaded primary wallet (id=%s, wid=%d, address=%s)', wallet.id, wallet.wid, addr.toString(this.network));
                        this.primary = wallet;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify network.
     * @returns {Promise}
     */
    WalletDB.prototype.verifyNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var raw, b, magic;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.O.encode())];
                    case 1:
                        raw = _a.sent();
                        if (!raw) {
                            b = this.db.batch();
                            b.put(layout.O.encode(), fromU32(this.network.magic));
                            return [2 /*return*/, b.write()];
                        }
                        magic = raw.readUInt32LE(0, true);
                        if (magic !== this.network.magic)
                            throw new Error('Network mismatch for WalletDB.');
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Close the walletdb, wait for the database to close.
     * @returns {Promise}
     */
    WalletDB.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, wallet;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.disconnect()];
                    case 1:
                        _b.sent();
                        _i = 0, _a = this.wallets.values();
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        wallet = _a[_i];
                        return [4 /*yield*/, wallet.destroy()];
                    case 3:
                        _b.sent();
                        this.unregister(wallet);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, this.db.close()];
                }
            });
        });
    };
    /**
     * Watch addresses and outpoints.
     * @private
     * @returns {Promise}
     */
    WalletDB.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var piter, hashes, oiter, outpoints;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        piter = this.db.iterator({
                            gte: layout.p.min(),
                            lte: layout.p.max()
                        });
                        hashes = 0;
                        return [4 /*yield*/, piter.each(function (key) {
                                var data = layout.p.decode(key)[0];
                                _this.filter.add(data);
                                hashes += 1;
                            })];
                    case 1:
                        _a.sent();
                        this.logger.info('Added %d hashes to WalletDB filter.', hashes);
                        oiter = this.db.iterator({
                            gte: layout.o.min(),
                            lte: layout.o.max()
                        });
                        outpoints = 0;
                        return [4 /*yield*/, oiter.each(function (key) {
                                var _a = layout.o.decode(key), hash = _a[0], index = _a[1];
                                var outpoint = new Outpoint(hash, index);
                                var data = outpoint.toRaw();
                                _this.filter.add(data);
                                outpoints += 1;
                            })];
                    case 2:
                        _a.sent();
                        this.logger.info('Added %d outpoints to WalletDB filter.', outpoints);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to the node server (client required).
     * @returns {Promise}
     */
    WalletDB.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.open()];
            });
        });
    };
    /**
     * Disconnect from node server (client required).
     * @returns {Promise}
     */
    WalletDB.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.close()];
            });
        });
    };
    /**
     * Sync state with server on every connect.
     * @returns {Promise}
     */
    WalletDB.prototype.syncNode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 7, 8]);
                        this.logger.info('Resyncing from server...');
                        return [4 /*yield*/, this.syncState()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.syncFilter()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.syncChain()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.resend()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        unlock();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize and write initial sync state.
     * @returns {Promise}
     */
    WalletDB.prototype.syncState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cache, b, hashes, tip, height, hash, meta, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getState()];
                    case 1:
                        cache = _a.sent();
                        if (!cache) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getBlock(0)];
                    case 2:
                        if (!(_a.sent()))
                            return [2 /*return*/, this.migrateState(cache)];
                        this.state = cache;
                        this.height = cache.height;
                        return [2 /*return*/, undefined];
                    case 3:
                        this.logger.info('Initializing database state from server.');
                        b = this.db.batch();
                        return [4 /*yield*/, this.client.getHashes()];
                    case 4:
                        hashes = _a.sent();
                        tip = null;
                        for (height = 0; height < hashes.length; height++) {
                            hash = hashes[height];
                            meta = new BlockMeta(hash, height);
                            b.put(layout.h.encode(height), meta.toHash());
                            tip = meta;
                        }
                        assert(tip);
                        state = this.state.clone();
                        state.startHeight = tip.height;
                        state.startHash = tip.hash;
                        state.height = tip.height;
                        state.marked = false;
                        b.put(layout.R.encode(), state.toRaw());
                        return [4 /*yield*/, b.write()];
                    case 5:
                        _a.sent();
                        this.state = state;
                        this.height = state.height;
                        return [2 /*return*/, undefined];
                }
            });
        });
    };
    /**
     * Migrate sync state.
     * @private
     * @param {ChainState} state
     * @returns {Promise}
     */
    WalletDB.prototype.migrateState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var b, hashes, height, hash, meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        b = this.db.batch();
                        this.logger.info('Migrating to new sync state.');
                        return [4 /*yield*/, this.client.getHashes(0, state.height)];
                    case 1:
                        hashes = _a.sent();
                        for (height = 0; height < hashes.length; height++) {
                            hash = hashes[height];
                            meta = new BlockMeta(hash, height);
                            b.put(layout.h.encode(height), meta.toHash());
                        }
                        return [4 /*yield*/, b.write()];
                    case 2:
                        _a.sent();
                        this.state = state;
                        this.height = state.height;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect and sync with the chain server.
     * @private
     * @returns {Promise}
     */
    WalletDB.prototype.syncChain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var height, tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        height = this.state.height;
                        this.logger.info('Syncing state from height %d.', height);
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.getBlock(height)];
                    case 2:
                        tip = _a.sent();
                        assert(tip);
                        return [4 /*yield*/, this.client.getEntry(tip.hash)];
                    case 3:
                        if (_a.sent())
                            return [3 /*break*/, 5];
                        assert(height !== 0);
                        height -= 1;
                        _a.label = 4;
                    case 4: return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, this.scan(height)];
                }
            });
        });
    };
    /**
     * Rescan blockchain from a given height.
     * @private
     * @param {Number?} height
     * @returns {Promise}
     */
    WalletDB.prototype.scan = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (height == null)
                            height = this.state.startHeight;
                        assert((height >>> 0) === height, 'WDB: Must pass in a height.');
                        this.logger.info('WalletDB is scanning %d blocks.', this.state.height - height + 1);
                        return [4 /*yield*/, this.rollback(height)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getTip()];
                    case 2:
                        tip = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        this.rescanning = true;
                        return [4 /*yield*/, this.client.rescan(tip.hash)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        this.rescanning = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Force a rescan.
     * @param {Number} height
     * @returns {Promise}
     */
    WalletDB.prototype.rescan = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._rescan(height)];
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
     * Force a rescan (without a lock).
     * @private
     * @param {Number} height
     * @returns {Promise}
     */
    WalletDB.prototype._rescan = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.scan(height)];
            });
        });
    };
    /**
     * Broadcast a transaction via chain server.
     * @param {TX} tx
     * @returns {Promise}
     */
    WalletDB.prototype.send = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.send(tx)];
            });
        });
    };
    /**
     * Estimate smart fee from chain server.
     * @param {Number} blocks
     * @returns {Promise}
     */
    WalletDB.prototype.estimateFee = function (blocks) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.feeRate > 0)
                            return [2 /*return*/, this.feeRate];
                        return [4 /*yield*/, this.client.estimateFee(blocks)];
                    case 1:
                        json = _a.sent();
                        if (!json)
                            throw new Error('Fee not found.');
                        if (!Number.isInteger(json.rate))
                            throw new Error('Fee is not an integer.');
                        if (json.rate < this.network.feeRate)
                            return [2 /*return*/, this.network.feeRate];
                        if (json.rate > this.network.maxFeeRate)
                            return [2 /*return*/, this.network.maxFeeRate];
                        return [2 /*return*/, json.rate];
                }
            });
        });
    };
    /**
     * Send filter to the remote node.
     * @private
     * @returns {Promise}
     */
    WalletDB.prototype.syncFilter = function () {
        this.logger.info('Sending filter to server (%dmb).', this.filter.size / 8 / (1 << 20));
        this.filterSent = true;
        return this.client.setFilter(this.filter);
    };
    /**
     * Add data to remote filter.
     * @private
     * @param {Buffer} data
     * @returns {Promise}
     */
    WalletDB.prototype.addFilter = function (data) {
        if (!this.filterSent)
            return undefined;
        return this.client.addFilter(data);
    };
    /**
     * Reset remote filter.
     * @private
     * @returns {Promise}
     */
    WalletDB.prototype.resetFilter = function () {
        if (!this.filterSent)
            return undefined;
        return this.client.resetFilter();
    };
    /**
     * Backup the wallet db.
     * @param {String} path
     * @returns {Promise}
     */
    WalletDB.prototype.backup = function (path) {
        return this.db.backup(path);
    };
    /**
     * Wipe the txdb - NEVER USE.
     * @returns {Promise}
     */
    WalletDB.prototype.wipe = function () {
        return __awaiter(this, void 0, void 0, function () {
            var iter, b, total;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.warning('Wiping WalletDB TXDB...');
                        this.logger.warning('I hope you know what you\'re doing.');
                        iter = this.db.iterator();
                        b = this.db.batch();
                        total = 0;
                        return [4 /*yield*/, iter.each(function (key) {
                                switch (key[0]) {
                                    case 0x62: // b
                                    case 0x63: // c
                                    case 0x65: // e
                                    case 0x74: // t
                                    case 0x6f: // o
                                    case 0x68: // h
                                    case 0x52: // R
                                        b.del(key);
                                        total += 1;
                                        break;
                                }
                            })];
                    case 1:
                        _a.sent();
                        this.logger.warning('Wiped %d txdb records.', total);
                        return [2 /*return*/, b.write()];
                }
            });
        });
    };
    /**
     * Get current wallet wid depth.
     * @private
     * @returns {Promise}
     */
    WalletDB.prototype.getDepth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.D.encode())];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, 0];
                        return [2 /*return*/, raw.readUInt32LE(0, true)];
                }
            });
        });
    };
    /**
     * Test the bloom filter against a tx or address hash.
     * @private
     * @param {Hash} hash
     * @returns {Boolean}
     */
    WalletDB.prototype.testFilter = function (data) {
        return this.filter.test(data);
    };
    /**
     * Add hash to local and remote filters.
     * @private
     * @param {Hash} hash
     */
    WalletDB.prototype.addHash = function (hash) {
        this.filter.add(hash);
        return this.addFilter(hash);
    };
    /**
     * Add outpoint to local filter.
     * @private
     * @param {Hash} hash
     * @param {Number} index
     */
    WalletDB.prototype.addOutpoint = function (hash, index) {
        var outpoint = new Outpoint(hash, index);
        this.filter.add(outpoint.toRaw());
    };
    /**
     * Dump database (for debugging).
     * @returns {Promise} - Returns Object.
     */
    WalletDB.prototype.dump = function () {
        return this.db.dump();
    };
    /**
     * Register an object with the walletdb.
     * @param {Object} object
     */
    WalletDB.prototype.register = function (wallet) {
        assert(!this.wallets.has(wallet.wid));
        this.wallets.set(wallet.wid, wallet);
    };
    /**
     * Unregister a object with the walletdb.
     * @param {Object} object
     * @returns {Boolean}
     */
    WalletDB.prototype.unregister = function (wallet) {
        assert(this.wallets.has(wallet.wid));
        this.wallets["delete"](wallet.wid);
    };
    /**
     * Map wallet id to wid.
     * @param {String|Number} id
     * @returns {Promise} - Returns {Number}.
     */
    WalletDB.prototype.ensureWID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(typeof id === 'number')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.has(layout.W.encode(id))];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, -1];
                        return [2 /*return*/, id];
                    case 2: return [2 /*return*/, this.getWID(id)];
                }
            });
        });
    };
    /**
     * Map wallet id to wid.
     * @param {String} id
     * @returns {Promise} - Returns {Number}.
     */
    WalletDB.prototype.getWID = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.l.encode(id))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, -1];
                        assert(data.length === 4);
                        return [2 /*return*/, data.readUInt32LE(0, true)];
                }
            });
        });
    };
    /**
     * Map wallet wid to id.
     * @param {Number} wid
     * @returns {Promise} - Returns {String}.
     */
    WalletDB.prototype.getID = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.W.encode(wid))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, toString(data)];
                }
            });
        });
    };
    /**
     * Get a wallet from the database, setup watcher.
     * @param {Number|String} id
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var wid, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureWID(id)];
                    case 1:
                        wid = _a.sent();
                        if (wid === -1)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.readLock.lock(wid)];
                    case 2:
                        unlock = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, this._get(wid)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        unlock();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a wallet from the database without a lock.
     * @private
     * @param {Number} wid
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype._get = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, id, data, wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache = this.wallets.get(wid);
                        if (cache)
                            return [2 /*return*/, cache];
                        return [4 /*yield*/, this.getID(wid)];
                    case 1:
                        id = _a.sent();
                        if (!id)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.db.get(layout.w.encode(wid))];
                    case 2:
                        data = _a.sent();
                        assert(data);
                        wallet = Wallet.fromRaw(this, data);
                        wallet.wid = wid;
                        wallet.id = id;
                        return [4 /*yield*/, wallet.open()];
                    case 3:
                        _a.sent();
                        this.register(wallet);
                        return [2 /*return*/, wallet];
                }
            });
        });
    };
    /**
     * Save a wallet to the database.
     * @param {Wallet} wallet
     */
    WalletDB.prototype.save = function (b, wallet) {
        var wid = wallet.wid;
        var id = wallet.id;
        b.put(layout.w.encode(wid), wallet.toRaw());
        b.put(layout.W.encode(wid), fromString(id));
        b.put(layout.l.encode(id), fromU32(wid));
    };
    /**
     * Increment the wid depth.
     * @param {Batch} b
     * @param {Number} wid
     */
    WalletDB.prototype.increment = function (b, wid) {
        b.put(layout.D.encode(), fromU32(wid + 1));
    };
    /**
     * Rename a wallet.
     * @param {Wallet} wallet
     * @param {String} id
     * @returns {Promise}
     */
    WalletDB.prototype.rename = function (wallet, id) {
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
                        return [4 /*yield*/, this._rename(wallet, id)];
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
     * Rename a wallet without a lock.
     * @private
     * @param {Wallet} wallet
     * @param {String} id
     * @returns {Promise}
     */
    WalletDB.prototype._rename = function (wallet, id) {
        return __awaiter(this, void 0, void 0, function () {
            var b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!common.isName(id))
                            throw new Error('WDB: Bad wallet ID.');
                        return [4 /*yield*/, this.has(id)];
                    case 1:
                        if (_a.sent())
                            throw new Error('WDB: ID not available.');
                        b = this.db.batch();
                        // Update wid->id index.
                        b.put(layout.W.encode(wallet.wid), fromString(id));
                        // Delete old id->wid index.
                        b.del(layout.l.encode(wallet.id));
                        // Add new id->wid index.
                        b.put(layout.l.encode(id), fromU32(wallet.wid));
                        return [4 /*yield*/, b.write()];
                    case 2:
                        _a.sent();
                        wallet.id = id;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rename an account.
     * @param {Account} account
     * @param {String} name
     */
    WalletDB.prototype.renameAccount = function (b, account, name) {
        var wid = account.wid;
        var index = account.accountIndex;
        // Remove old wid/name->account index.
        b.del(layout.i.encode(wid, account.name));
        // Name->Index lookups
        b.put(layout.i.encode(wid, name), fromU32(index));
        // Index->Name lookups
        b.put(layout.n.encode(wid, index), fromString(name));
        account.name = name;
    };
    /**
     * Remove a wallet.
     * @param {Number|String} id
     * @returns {Promise}
     */
    WalletDB.prototype.remove = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var wid, unlock1, unlock2, unlock3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureWID(id)];
                    case 1:
                        wid = _a.sent();
                        if (wid === -1)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.readLock.lock(wid)];
                    case 2:
                        unlock1 = _a.sent();
                        return [4 /*yield*/, this.writeLock.lock()];
                    case 3:
                        unlock2 = _a.sent();
                        return [4 /*yield*/, this.txLock.lock()];
                    case 4:
                        unlock3 = _a.sent();
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, , 7, 8]);
                        return [4 /*yield*/, this._remove(wid)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        unlock3();
                        unlock2();
                        unlock1();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a wallet (without a lock).
     * @private
     * @param {Number} wid
     * @returns {Promise}
     */
    WalletDB.prototype._remove = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            var id, b, piter, removeRange, bucket, biter, siter, uiter, wallet;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getID(wid)];
                    case 1:
                        id = _a.sent();
                        if (!id)
                            return [2 /*return*/, false];
                        if (id === 'primary')
                            throw new Error('Cannot remove primary wallet.');
                        b = this.db.batch();
                        b.del(layout.w.encode(wid));
                        b.del(layout.W.encode(wid));
                        b.del(layout.l.encode(id));
                        piter = this.db.iterator({
                            gte: layout.P.min(wid),
                            lte: layout.P.max(wid)
                        });
                        return [4 /*yield*/, piter.each(function (key, value) {
                                var _a = layout.P.decode(key), hash = _a[1];
                                b.del(key);
                                return _this.removePathMap(b, hash, wid);
                            })];
                    case 2:
                        _a.sent();
                        removeRange = function (opt) {
                            return _this.db.iterator(opt).each(function (key) { return b.del(key); });
                        };
                        return [4 /*yield*/, removeRange({
                                gte: layout.r.min(wid),
                                lte: layout.r.max(wid)
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, removeRange({
                                gte: layout.a.min(wid),
                                lte: layout.a.max(wid)
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, removeRange({
                                gte: layout.i.min(wid),
                                lte: layout.i.max(wid)
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, removeRange({
                                gte: layout.n.min(wid),
                                lte: layout.n.max(wid)
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, removeRange({
                                gt: layout.t.encode(wid),
                                lt: layout.t.encode(wid + 1)
                            })];
                    case 7:
                        _a.sent();
                        bucket = this.db.bucket(layout.t.encode(wid));
                        biter = bucket.iterator({
                            gte: tlayout.b.min(),
                            lte: tlayout.b.max()
                        });
                        return [4 /*yield*/, biter.each(function (key, value) {
                                var height = tlayout.b.decode(key)[0];
                                return _this.removeBlockMap(b, height, wid);
                            })];
                    case 8:
                        _a.sent();
                        siter = bucket.iterator({
                            gte: tlayout.s.min(),
                            lte: tlayout.s.max(),
                            keys: true
                        });
                        return [4 /*yield*/, siter.each(function (key, value) {
                                var _a = tlayout.s.decode(key), hash = _a[0], index = _a[1];
                                return _this.removeOutpointMap(b, hash, index, wid);
                            })];
                    case 9:
                        _a.sent();
                        uiter = bucket.iterator({
                            gte: tlayout.p.min(),
                            lte: tlayout.p.max(),
                            keys: true
                        });
                        return [4 /*yield*/, uiter.each(function (key, value) {
                                var hash = tlayout.p.decode(key)[0];
                                return _this.removeTXMap(b, hash, wid);
                            })];
                    case 10:
                        _a.sent();
                        wallet = this.wallets.get(wid);
                        if (!wallet) return [3 /*break*/, 12];
                        return [4 /*yield*/, wallet.destroy()];
                    case 11:
                        _a.sent();
                        this.unregister(wallet);
                        _a.label = 12;
                    case 12: return [4 /*yield*/, b.write()];
                    case 13:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Get a wallet with token auth first.
     * @param {Number|String} id
     * @param {Buffer} token
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype.auth = function (id, token) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(id)];
                    case 1:
                        wallet = _a.sent();
                        if (!wallet)
                            return [2 /*return*/, null];
                        // Compare in constant time:
                        if (!safeEqual(token, wallet.token))
                            throw new Error('WDB: Authentication error.');
                        return [2 /*return*/, wallet];
                }
            });
        });
    };
    /**
     * Create a new wallet, save to database, setup watcher.
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype.create = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writeLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        if (!options)
                            options = {};
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._create(options)];
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
     * Create a new wallet, save to database without a lock.
     * @private
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype._create = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.has(options.id)];
                    case 1:
                        if (_a.sent())
                            throw new Error('WDB: Wallet already exists.');
                        _a.label = 2;
                    case 2:
                        wallet = Wallet.fromOptions(this, options);
                        wallet.wid = this.depth;
                        return [4 /*yield*/, wallet.init(options, options.passphrase)];
                    case 3:
                        _a.sent();
                        this.depth += 1;
                        this.register(wallet);
                        this.logger.info('Created wallet %s in WalletDB.', wallet.id);
                        return [2 /*return*/, wallet];
                }
            });
        });
    };
    /**
     * Test for the existence of a wallet.
     * @param {Number|String} id
     * @returns {Promise}
     */
    WalletDB.prototype.has = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var wid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureWID(id)];
                    case 1:
                        wid = _a.sent();
                        return [2 /*return*/, wid !== -1];
                }
            });
        });
    };
    /**
     * Attempt to create wallet, return wallet if already exists.
     * @param {Object} options - See {@link Wallet}.
     * @returns {Promise}
     */
    WalletDB.prototype.ensure = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!options.id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get(options.id)];
                    case 1:
                        wallet = _a.sent();
                        if (wallet)
                            return [2 /*return*/, wallet];
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.create(options)];
                }
            });
        });
    };
    /**
     * Get an account from the database by wid.
     * @private
     * @param {Number} wid
     * @param {Number} index - Account index.
     * @returns {Promise} - Returns {@link Wallet}.
     */
    WalletDB.prototype.getAccount = function (wid, index) {
        return __awaiter(this, void 0, void 0, function () {
            var name, data, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccountName(wid, index)];
                    case 1:
                        name = _a.sent();
                        if (!name)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.db.get(layout.a.encode(wid, index))];
                    case 2:
                        data = _a.sent();
                        assert(data);
                        account = Account.fromRaw(this, data);
                        account.accountIndex = index;
                        account.name = name;
                        return [2 /*return*/, account];
                }
            });
        });
    };
    /**
     * List account names and indexes from the db.
     * @param {Number} wid
     * @returns {Promise} - Returns Array.
     */
    WalletDB.prototype.getAccounts = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.values({
                        gte: layout.n.min(wid),
                        lte: layout.n.max(wid),
                        parse: toString
                    })];
            });
        });
    };
    /**
     * Lookup the corresponding account name's index.
     * @param {Number} wid
     * @param {String} name - Account name/index.
     * @returns {Promise} - Returns Number.
     */
    WalletDB.prototype.getAccountIndex = function (wid, name) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.i.encode(wid, name))];
                    case 1:
                        index = _a.sent();
                        if (!index)
                            return [2 /*return*/, -1];
                        return [2 /*return*/, index.readUInt32LE(0, true)];
                }
            });
        });
    };
    /**
     * Lookup the corresponding account index's name.
     * @param {Number} wid
     * @param {Number} index
     * @returns {Promise} - Returns Number.
     */
    WalletDB.prototype.getAccountName = function (wid, index) {
        return __awaiter(this, void 0, void 0, function () {
            var name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.n.encode(wid, index))];
                    case 1:
                        name = _a.sent();
                        if (!name)
                            return [2 /*return*/, null];
                        return [2 /*return*/, toString(name)];
                }
            });
        });
    };
    /**
     * Save an account to the database.
     * @param {Account} account
     * @returns {Promise}
     */
    WalletDB.prototype.saveAccount = function (b, account) {
        var wid = account.wid;
        var index = account.accountIndex;
        var name = account.name;
        // Account data
        b.put(layout.a.encode(wid, index), account.toRaw());
        // Name->Index lookups
        b.put(layout.i.encode(wid, name), fromU32(index));
        // Index->Name lookups
        b.put(layout.n.encode(wid, index), fromString(name));
    };
    /**
     * Test for the existence of an account.
     * @param {Number} wid
     * @param {String|Number} acct
     * @returns {Promise} - Returns Boolean.
     */
    WalletDB.prototype.hasAccount = function (wid, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.a.encode(wid, index))];
            });
        });
    };
    /**
     * Save an address to the path map.
     * @param {Wallet} wallet
     * @param {WalletKey} ring
     * @returns {Promise}
     */
    WalletDB.prototype.saveKey = function (b, wid, ring) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.savePath(b, wid, ring.toPath())];
            });
        });
    };
    /**
     * Save a path to the path map.
     *
     * The path map exists in the form of:
     *   - `p[address-hash] -> wid map`
     *   - `P[wid][address-hash] -> path data`
     *   - `r[wid][account-index][address-hash] -> dummy`
     *
     * @param {Wallet} wallet
     * @param {Path} path
     * @returns {Promise}
     */
    WalletDB.prototype.savePath = function (b, wid, path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Address Hash -> Wallet Map
                    return [4 /*yield*/, this.addPathMap(b, path.hash, wid)];
                    case 1:
                        // Address Hash -> Wallet Map
                        _a.sent();
                        // Wallet ID + Address Hash -> Path Data
                        b.put(layout.P.encode(wid, path.hash), path.toRaw());
                        // Wallet ID + Account Index + Address Hash -> Dummy
                        b.put(layout.r.encode(wid, path.account, path.hash), null);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieve path by hash.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletDB.prototype.getPath = function (wid, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.readPath(wid, hash)];
                    case 1:
                        path = _b.sent();
                        if (!path)
                            return [2 /*return*/, null];
                        _a = path;
                        return [4 /*yield*/, this.getAccountName(wid, path.account)];
                    case 2:
                        _a.name = _b.sent();
                        assert(path.name);
                        return [2 /*return*/, path];
                }
            });
        });
    };
    /**
     * Retrieve path by hash.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletDB.prototype.readPath = function (wid, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var data, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.P.encode(wid, hash))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        path = Path.fromRaw(data);
                        path.hash = hash;
                        return [2 /*return*/, path];
                }
            });
        });
    };
    /**
     * Test whether a wallet contains a path.
     * @param {Number} wid
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletDB.prototype.hasPath = function (wid, hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.P.encode(wid, hash))];
            });
        });
    };
    /**
     * Get all address hashes.
     * @returns {Promise}
     */
    WalletDB.prototype.getHashes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.keys({
                        gte: layout.p.min(),
                        lte: layout.p.max(),
                        parse: function (key) { return layout.p.decode(key)[0]; }
                    })];
            });
        });
    };
    /**
     * Get all outpoints.
     * @returns {Promise}
     */
    WalletDB.prototype.getOutpoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.keys({
                        gte: layout.o.min(),
                        lte: layout.o.max(),
                        parse: function (key) {
                            var _a = layout.o.decode(key), hash = _a[0], index = _a[1];
                            return new Outpoint(hash, index);
                        }
                    })];
            });
        });
    };
    /**
     * Get all address hashes.
     * @param {Number} wid
     * @returns {Promise}
     */
    WalletDB.prototype.getWalletHashes = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.keys({
                        gte: layout.P.min(wid),
                        lte: layout.P.max(wid),
                        parse: function (key) { return layout.P.decode(key)[1]; }
                    })];
            });
        });
    };
    /**
     * Get all account address hashes.
     * @param {Number} wid
     * @param {Number} account
     * @returns {Promise}
     */
    WalletDB.prototype.getAccountHashes = function (wid, account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.keys({
                        gte: layout.r.min(wid, account),
                        lte: layout.r.max(wid, account),
                        parse: function (key) { return layout.r.decode(key)[2]; }
                    })];
            });
        });
    };
    /**
     * Get all paths for a wallet.
     * @param {Number} wid
     * @returns {Promise}
     */
    WalletDB.prototype.getWalletPaths = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            var items, paths, _i, items_1, _a, key, value, _b, hash, path_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.db.range({
                            gte: layout.P.min(wid),
                            lte: layout.P.max(wid)
                        })];
                    case 1:
                        items = _d.sent();
                        paths = [];
                        _i = 0, items_1 = items;
                        _d.label = 2;
                    case 2:
                        if (!(_i < items_1.length)) return [3 /*break*/, 5];
                        _a = items_1[_i], key = _a.key, value = _a.value;
                        _b = layout.P.decode(key), hash = _b[1];
                        path_1 = Path.fromRaw(value);
                        path_1.hash = hash;
                        _c = path_1;
                        return [4 /*yield*/, this.getAccountName(wid, path_1.account)];
                    case 3:
                        _c.name = _d.sent();
                        assert(path_1.name);
                        paths.push(path_1);
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, paths];
                }
            });
        });
    };
    /**
     * Get all wallet ids.
     * @returns {Promise}
     */
    WalletDB.prototype.getWallets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.values({
                        gte: layout.W.min(),
                        lte: layout.W.max(),
                        parse: toString
                    })];
            });
        });
    };
    /**
     * Encrypt all imported keys for a wallet.
     * @param {Number} wid
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.encryptKeys = function (b, wid, key) {
        return __awaiter(this, void 0, void 0, function () {
            var iter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iter = this.db.iterator({
                            gte: layout.P.min(wid),
                            lte: layout.P.max(wid),
                            values: true
                        });
                        return [4 /*yield*/, iter.each(function (k, value) {
                                var _a = layout.P.decode(k), hash = _a[1];
                                var path = Path.fromRaw(value);
                                if (!path.data)
                                    return;
                                assert(!path.encrypted);
                                var iv = hash.slice(0, 16);
                                path.data = aes.encipher(path.data, key, iv);
                                path.encrypted = true;
                                b.put(k, path.toRaw());
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Decrypt all imported keys for a wallet.
     * @param {Number} wid
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.decryptKeys = function (b, wid, key) {
        return __awaiter(this, void 0, void 0, function () {
            var iter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iter = this.db.iterator({
                            gte: layout.P.min(wid),
                            lte: layout.P.max(wid),
                            values: true
                        });
                        return [4 /*yield*/, iter.each(function (k, value) {
                                var _a = layout.P.decode(k), hash = _a[1];
                                var path = Path.fromRaw(value);
                                if (!path.data)
                                    return;
                                assert(path.encrypted);
                                var iv = hash.slice(0, 16);
                                path.data = aes.decipher(path.data, key, iv);
                                path.encrypted = false;
                                b.put(k, path.toRaw());
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resend all pending transactions.
     * @returns {Promise}
     */
    WalletDB.prototype.resend = function () {
        return __awaiter(this, void 0, void 0, function () {
            var wids, _i, wids_1, wid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.keys({
                            gte: layout.w.min(),
                            lte: layout.w.max(),
                            parse: function (key) { return layout.w.decode(key)[0]; }
                        })];
                    case 1:
                        wids = _a.sent();
                        this.logger.info('Resending from %d wallets.', wids.length);
                        _i = 0, wids_1 = wids;
                        _a.label = 2;
                    case 2:
                        if (!(_i < wids_1.length)) return [3 /*break*/, 5];
                        wid = wids_1[_i];
                        return [4 /*yield*/, this.resendPending(wid)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resend all pending transactions for a specific wallet.
     * @private
     * @param {Number} wid
     * @returns {Promise}
     */
    WalletDB.prototype.resendPending = function (wid) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, b, hashes, txs, _i, hashes_1, hash, data, wtx, _a, _b, tx;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        prefix = layout.t.encode(wid);
                        b = this.db.bucket(prefix);
                        return [4 /*yield*/, b.keys({
                                gte: tlayout.p.min(),
                                lte: tlayout.p.max(),
                                parse: function (key) { return tlayout.p.decode(key)[0]; }
                            })];
                    case 1:
                        hashes = _c.sent();
                        if (hashes.length === 0)
                            return [2 /*return*/];
                        this.logger.info('Rebroadcasting %d transactions for %d.', hashes.length, wid);
                        txs = [];
                        _i = 0, hashes_1 = hashes;
                        _c.label = 2;
                    case 2:
                        if (!(_i < hashes_1.length)) return [3 /*break*/, 5];
                        hash = hashes_1[_i];
                        return [4 /*yield*/, b.get(tlayout.t.encode(hash))];
                    case 3:
                        data = _c.sent();
                        if (!data)
                            return [3 /*break*/, 4];
                        wtx = TXRecord.fromRaw(data);
                        if (wtx.tx.isCoinbase())
                            return [3 /*break*/, 4];
                        txs.push(wtx.tx);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        _a = 0, _b = common.sortDeps(txs);
                        _c.label = 6;
                    case 6:
                        if (!(_a < _b.length)) return [3 /*break*/, 9];
                        tx = _b[_a];
                        return [4 /*yield*/, this.send(tx)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _a++;
                        return [3 /*break*/, 6];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all wallet ids by output addresses and outpoints.
     * @param {Hash[]} hashes
     * @returns {Promise}
     */
    WalletDB.prototype.getWalletsByTX = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var wids, _i, _a, prevout, hash, index, map, _b, _c, wid, hashes, _d, hashes_2, hash, map, _e, _f, wid;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        wids = new Set();
                        if (!!tx.isCoinbase()) return [3 /*break*/, 4];
                        _i = 0, _a = tx.inputs;
                        _g.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        hash = prevout.hash, index = prevout.index;
                        if (!this.testFilter(prevout.toRaw()))
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getOutpointMap(hash, index)];
                    case 2:
                        map = _g.sent();
                        if (!map)
                            return [3 /*break*/, 3];
                        for (_b = 0, _c = map.wids; _b < _c.length; _b++) {
                            wid = _c[_b];
                            wids.add(wid);
                        }
                        _g.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        hashes = tx.getOutputHashes();
                        _d = 0, hashes_2 = hashes;
                        _g.label = 5;
                    case 5:
                        if (!(_d < hashes_2.length)) return [3 /*break*/, 8];
                        hash = hashes_2[_d];
                        if (!this.testFilter(hash))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getPathMap(hash)];
                    case 6:
                        map = _g.sent();
                        if (!map)
                            return [3 /*break*/, 7];
                        for (_e = 0, _f = map.wids; _e < _f.length; _e++) {
                            wid = _f[_e];
                            wids.add(wid);
                        }
                        _g.label = 7;
                    case 7:
                        _d++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (wids.size === 0)
                            return [2 /*return*/, null];
                        return [2 /*return*/, wids];
                }
            });
        });
    };
    /**
     * Get the best block hash.
     * @returns {Promise}
     */
    WalletDB.prototype.getState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.R.encode())];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, ChainState.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Sync the current chain state to tip.
     * @param {BlockMeta} tip
     * @returns {Promise}
     */
    WalletDB.prototype.setTip = function (tip) {
        return __awaiter(this, void 0, void 0, function () {
            var b, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        b = this.db.batch();
                        state = this.state.clone();
                        if (tip.height < state.height) {
                            // Hashes ahead of our new tip
                            // that we need to delete.
                            while (state.height !== tip.height) {
                                b.del(layout.h.encode(state.height));
                                state.height -= 1;
                            }
                        }
                        else if (tip.height > state.height) {
                            assert(tip.height === state.height + 1, 'Bad chain sync.');
                            state.height += 1;
                        }
                        if (tip.height < state.startHeight) {
                            state.startHeight = tip.height;
                            state.startHash = tip.hash;
                            state.marked = false;
                        }
                        // Save tip and state.
                        b.put(layout.h.encode(tip.height), tip.toHash());
                        b.put(layout.R.encode(), state.toRaw());
                        return [4 /*yield*/, b.write()];
                    case 1:
                        _a.sent();
                        this.state = state;
                        this.height = state.height;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Will return the current height and will increment
     * to the current height of a block currently being
     * added to the wallet.
     * @returns {Number}
     */
    WalletDB.prototype.liveHeight = function () {
        var height = this.height;
        if (this.confirming)
            height += 1;
        return height;
    };
    /**
     * Mark current state.
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    WalletDB.prototype.markState = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var state, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = this.state.clone();
                        state.startHeight = block.height;
                        state.startHash = block.hash;
                        state.marked = true;
                        b = this.db.batch();
                        b.put(layout.R.encode(), state.toRaw());
                        return [4 /*yield*/, b.write()];
                    case 1:
                        _a.sent();
                        this.state = state;
                        this.height = state.height;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.getMap = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(key)];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, MapRecord.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Add wid to a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.addMap = function (b, key, wid) {
        return __awaiter(this, void 0, void 0, function () {
            var data, map, len, bw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(key)];
                    case 1:
                        data = _a.sent();
                        if (!data) {
                            map = new MapRecord();
                            map.add(wid);
                            b.put(key, map.toRaw());
                            return [2 /*return*/];
                        }
                        assert(data.length >= 4);
                        len = data.readUInt32LE(0, true);
                        bw = bio.write(data.length + 4);
                        bw.writeU32(len + 1);
                        bw.copy(data, 4, data.length);
                        bw.writeU32(wid);
                        b.put(key, bw.render());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove wid from a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.removeMap = function (b, key, wid) {
        return __awaiter(this, void 0, void 0, function () {
            var map;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMap(key)];
                    case 1:
                        map = _a.sent();
                        if (!map)
                            return [2 /*return*/];
                        if (!map.remove(wid))
                            return [2 /*return*/];
                        if (map.size === 0) {
                            b.del(key);
                            return [2 /*return*/];
                        }
                        b.put(key, map.toRaw());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.getPathMap = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getMap(layout.p.encode(hash))];
            });
        });
    };
    /**
     * Add wid to a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.addPathMap = function (b, hash, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addHash(hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.addMap(b, layout.p.encode(hash), wid)];
                }
            });
        });
    };
    /**
     * Remove wid from a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.removePathMap = function (b, hash, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.removeMap(b, layout.p.encode(hash), wid)];
            });
        });
    };
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.getBlockMap = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getMap(layout.b.encode(height))];
            });
        });
    };
    /**
     * Add wid to a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.addBlockMap = function (b, height, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.addMap(b, layout.b.encode(height), wid)];
            });
        });
    };
    /**
     * Remove wid from a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.removeBlockMap = function (b, height, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.removeMap(b, layout.b.encode(height), wid)];
            });
        });
    };
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.getTXMap = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getMap(layout.T.encode(hash))];
            });
        });
    };
    /**
     * Add wid to a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.addTXMap = function (b, hash, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.addMap(b, layout.T.encode(hash), wid)];
            });
        });
    };
    /**
     * Remove wid from a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.removeTXMap = function (b, hash, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.removeMap(b, layout.T.encode(hash), wid)];
            });
        });
    };
    /**
     * Get a wallet map.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WalletDB.prototype.getOutpointMap = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getMap(layout.o.encode(hash, index))];
            });
        });
    };
    /**
     * Add wid to a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.addOutpointMap = function (b, hash, index, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.addOutpoint(hash, index)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.addMap(b, layout.o.encode(hash, index), wid)];
                }
            });
        });
    };
    /**
     * Remove wid from a wallet map.
     * @param {Wallet} wallet
     * @param {Buffer} key
     * @param {Number} wid
     */
    WalletDB.prototype.removeOutpointMap = function (b, hash, index, wid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.removeMap(b, layout.o.encode(hash, index), wid)];
            });
        });
    };
    /**
     * Get a wallet block meta.
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletDB.prototype.getBlock = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var data, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.h.encode(height))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        block = new BlockMeta();
                        block.hash = data;
                        block.height = height;
                        return [2 /*return*/, block];
                }
            });
        });
    };
    /**
     * Get wallet tip.
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletDB.prototype.getTip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(this.state.height)];
                    case 1:
                        tip = _a.sent();
                        if (!tip)
                            throw new Error('WDB: Tip not found!');
                        return [2 /*return*/, tip];
                }
            });
        });
    };
    /**
     * Sync with chain height.
     * @param {Number} height
     * @returns {Promise}
     */
    WalletDB.prototype.rollback = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (height > this.state.height)
                            throw new Error('WDB: Cannot rollback to the future.');
                        if (height === this.state.height) {
                            this.logger.info('Rolled back to same height (%d).', height);
                            return [2 /*return*/];
                        }
                        this.logger.info('Rolling back %d WalletDB blocks to height %d.', this.state.height - height, height);
                        return [4 /*yield*/, this.getBlock(height)];
                    case 1:
                        tip = _a.sent();
                        assert(tip);
                        return [4 /*yield*/, this.revert(tip.height)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.setTip(tip)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revert TXDB to an older state.
     * @param {Number} target
     * @returns {Promise}
     */
    WalletDB.prototype.revert = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var iter, total;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iter = this.db.iterator({
                            gte: layout.b.encode(target + 1),
                            lte: layout.b.max(),
                            reverse: true,
                            values: true
                        });
                        total = 0;
                        return [4 /*yield*/, iter.each(function (key, value) { return __awaiter(_this, void 0, void 0, function () {
                                var height, block, _i, _a, wid, wallet, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            height = layout.b.decode(key)[0];
                                            block = MapRecord.fromRaw(value);
                                            _i = 0, _a = block.wids;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                                            wid = _a[_i];
                                            return [4 /*yield*/, this.get(wid)];
                                        case 2:
                                            wallet = _c.sent();
                                            assert(wallet);
                                            _b = total;
                                            return [4 /*yield*/, wallet.revert(height)];
                                        case 3:
                                            total = _b + _c.sent();
                                            _c.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        this.logger.info('Rolled back %d WalletDB transactions.', total);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a block's transactions and write the new best hash.
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    WalletDB.prototype.addBlock = function (entry, txs) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._addBlock(entry, txs)];
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
     * Add a block's transactions without a lock.
     * @private
     * @param {ChainEntry} entry
     * @param {TX[]} txs
     * @returns {Promise}
     */
    WalletDB.prototype._addBlock = function (entry, txs) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, total, _i, txs_1, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tip = BlockMeta.fromEntry(entry);
                        if (tip.height < this.state.height) {
                            this.logger.warning('WalletDB is connecting low blocks (%d).', tip.height);
                            return [2 /*return*/, 0];
                        }
                        if (tip.height >= this.network.block.slowHeight)
                            this.logger.debug('Adding block: %d.', tip.height);
                        if (!(tip.height === this.state.height)) return [3 /*break*/, 1];
                        // We let blocks of the same height
                        // through specifically for rescans:
                        // we always want to rescan the last
                        // block since the state may have
                        // updated before the block was fully
                        // processed (in the case of a crash).
                        this.logger.warning('Already saw WalletDB block (%d).', tip.height);
                        return [3 /*break*/, 3];
                    case 1:
                        if (!(tip.height !== this.state.height + 1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.scan(this.state.height)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, 0];
                    case 3:
                        total = 0;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, , 10, 11]);
                        // We set the state as confirming so that
                        // anything that uses the current height can
                        // increment by one until the block is fully
                        // added and the height is updated.
                        this.confirming = true;
                        _i = 0, txs_1 = txs;
                        _a.label = 5;
                    case 5:
                        if (!(_i < txs_1.length)) return [3 /*break*/, 8];
                        tx = txs_1[_i];
                        return [4 /*yield*/, this._addTX(tx, tip)];
                    case 6:
                        if (_a.sent())
                            total += 1;
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: 
                    // Sync the state to the new tip.
                    return [4 /*yield*/, this.setTip(tip)];
                    case 9:
                        // Sync the state to the new tip.
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        this.confirming = false;
                        return [7 /*endfinally*/];
                    case 11:
                        if (total > 0) {
                            this.logger.info('Connected WalletDB block %h (tx=%d).', tip.hash, total);
                        }
                        return [2 /*return*/, total];
                }
            });
        });
    };
    /**
     * Unconfirm a block's transactions
     * and write the new best hash (SPV version).
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    WalletDB.prototype.removeBlock = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._removeBlock(entry)];
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
     * Unconfirm a block's transactions.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    WalletDB.prototype._removeBlock = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, prev, map, total, _i, _a, wid, wallet, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        tip = BlockMeta.fromEntry(entry);
                        if (tip.height === 0)
                            throw new Error('WDB: Bad disconnection (genesis block).');
                        if (tip.height > this.state.height) {
                            this.logger.warning('WalletDB is disconnecting high blocks (%d).', tip.height);
                            return [2 /*return*/, 0];
                        }
                        if (tip.height !== this.state.height)
                            throw new Error('WDB: Bad disconnection (height mismatch).');
                        return [4 /*yield*/, this.getBlock(tip.height - 1)];
                    case 1:
                        prev = _c.sent();
                        assert(prev);
                        return [4 /*yield*/, this.getBlockMap(tip.height)];
                    case 2:
                        map = _c.sent();
                        if (!!map) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.setTip(prev)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, 0];
                    case 4:
                        total = 0;
                        _i = 0, _a = map.wids;
                        _c.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        wid = _a[_i];
                        return [4 /*yield*/, this.get(wid)];
                    case 6:
                        wallet = _c.sent();
                        assert(wallet);
                        _b = total;
                        return [4 /*yield*/, wallet.revert(tip.height)];
                    case 7:
                        total = _b + _c.sent();
                        _c.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 5];
                    case 9: 
                    // Sync the state to the previous tip.
                    return [4 /*yield*/, this.setTip(prev)];
                    case 10:
                        // Sync the state to the previous tip.
                        _c.sent();
                        this.logger.warning('Disconnected wallet block %h (tx=%d).', tip.hash, total);
                        return [2 /*return*/, total];
                }
            });
        });
    };
    /**
     * Rescan a block.
     * @private
     * @param {ChainEntry} entry
     * @param {TX[]} txs
     * @returns {Promise}
     */
    WalletDB.prototype.rescanBlock = function (entry, txs) {
        return __awaiter(this, void 0, void 0, function () {
            var e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.rescanning) {
                            this.logger.warning('Unsolicited rescan block: %d.', entry.height);
                            return [2 /*return*/];
                        }
                        if (entry.height > this.state.height + 1) {
                            this.logger.warning('Rescan block too high: %d.', entry.height);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._addBlock(entry, txs)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _a.sent();
                        this.emit('error', e_7);
                        throw e_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a transaction to the database, map addresses
     * to wallet IDs, potentially store orphans, resolve
     * orphans, or confirm a transaction.
     * @param {TX} tx
     * @param {BlockMeta?} block
     * @returns {Promise}
     */
    WalletDB.prototype.addTX = function (tx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._addTX(tx, block)];
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
     * Add a transaction to the database without a lock.
     * @private
     * @param {TX} tx
     * @param {BlockMeta} block
     * @returns {Promise}
     */
    WalletDB.prototype._addTX = function (tx, block) {
        return __awaiter(this, void 0, void 0, function () {
            var wids, result, _i, wids_2, wid, wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWalletsByTX(tx)];
                    case 1:
                        wids = _a.sent();
                        assert(!tx.mutable, 'WDB: Cannot add mutable TX.');
                        if (!wids)
                            return [2 /*return*/, null];
                        if (!(block && !this.state.marked)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.markState(block)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.logger.info('Incoming transaction for %d wallets in WalletDB (%h).', wids.size, tx.hash());
                        result = false;
                        _i = 0, wids_2 = wids;
                        _a.label = 4;
                    case 4:
                        if (!(_i < wids_2.length)) return [3 /*break*/, 8];
                        wid = wids_2[_i];
                        return [4 /*yield*/, this.get(wid)];
                    case 5:
                        wallet = _a.sent();
                        assert(wallet);
                        return [4 /*yield*/, wallet.add(tx, block)];
                    case 6:
                        if (_a.sent()) {
                            this.logger.info('Added transaction to wallet in WalletDB: %s (%d).', wallet.id, wid);
                            result = true;
                        }
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        if (!result)
                            return [2 /*return*/, null];
                        return [2 /*return*/, wids];
                }
            });
        });
    };
    /**
     * Handle a chain reset.
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    WalletDB.prototype.resetChain = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.txLock.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._resetChain(entry)];
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
     * Handle a chain reset without a lock.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    WalletDB.prototype._resetChain = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (entry.height > this.state.height)
                    throw new Error('WDB: Bad reset height.');
                return [2 /*return*/, this.rollback(entry.height)];
            });
        });
    };
    return WalletDB;
}(EventEmitter));
/**
 * Wallet Options
 * @alias module:wallet.WalletOptions
 */
var WalletOptions = /** @class */ (function () {
    /**
     * Create wallet options.
     * @constructor
     * @param {Object} options
     */
    function WalletOptions(options) {
        this.network = Network.primary;
        this.logger = Logger.global;
        this.workers = null;
        this.client = null;
        this.feeRate = 0;
        this.prefix = null;
        this.location = null;
        this.memory = true;
        this.maxFiles = 64;
        this.cacheSize = 16 << 20;
        this.compression = true;
        this.spv = false;
        this.witness = true;
        this.wipeNoReally = false;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {WalletOptions}
     */
    WalletOptions.prototype.fromOptions = function (options) {
        if (options.network != null)
            this.network = Network.get(options.network);
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.workers != null) {
            assert(typeof options.workers === 'object');
            this.workers = options.workers;
        }
        if (options.client != null) {
            assert(typeof options.client === 'object');
            this.client = options.client;
        }
        if (options.feeRate != null) {
            assert((options.feeRate >>> 0) === options.feeRate);
            this.feeRate = options.feeRate;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.location = path.join(this.prefix, 'wallet');
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
            assert(Number.isSafeInteger(options.cacheSize) && options.cacheSize >= 0);
            this.cacheSize = options.cacheSize;
        }
        if (options.compression != null) {
            assert(typeof options.compression === 'boolean');
            this.compression = options.compression;
        }
        if (options.spv != null) {
            assert(typeof options.spv === 'boolean');
            this.spv = options.spv;
        }
        if (options.witness != null) {
            assert(typeof options.witness === 'boolean');
            this.witness = options.witness;
        }
        if (options.wipeNoReally != null) {
            assert(typeof options.wipeNoReally === 'boolean');
            this.wipeNoReally = options.wipeNoReally;
        }
        return this;
    };
    /**
     * Instantiate chain options from object.
     * @param {Object} options
     * @returns {WalletOptions}
     */
    WalletOptions.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    return WalletOptions;
}());
/*
 * Helpers
 */
function fromU32(num) {
    var data = Buffer.allocUnsafe(4);
    data.writeUInt32LE(num, 0, true);
    return data;
}
function fromString(str) {
    var buf = Buffer.alloc(1 + str.length);
    buf[0] = str.length;
    buf.write(str, 1, str.length, 'ascii');
    return buf;
}
function toString(buf) {
    assert(buf.length > 0);
    assert(buf[0] === buf.length - 1);
    return buf.toString('ascii', 1, buf.length);
}
/*
 * Expose
 */
module.exports = WalletDB;
