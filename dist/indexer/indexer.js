/*!
 * indexer.js - abstract interface for bcoin indexers
 * Copyright (c) 2018, the bcoin developers (MIT License).
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
var assert = require('assert');
var path = require('path');
var fs = require('bfile');
var bio = require('bufio');
var EventEmitter = require('events');
var Logger = require('blgr');
var Network = require('../protocol/network');
var util = require('../utils/util');
var layout = require('./layout');
var CoinView = require('../coins/coinview');
var Block = require('../primitives/block');
var ZERO_HASH = require('../protocol/consensus').ZERO_HASH;
/**
 * Indexer
 * The class which indexers inherit from and implement the
 * `indexBlock` and `unindexBlock` methods and database
 * and storage initialization for indexing blocks.
 * @alias module:indexer.Indexer
 * @extends EventEmitter
 * @abstract
 */
var Indexer = /** @class */ (function (_super) {
    __extends(Indexer, _super);
    /**
     * Create an indexer.
     * @constructor
     * @param {String} module
     * @param {Object} options
     */
    function Indexer(module, options) {
        var _this = _super.call(this) || this;
        assert(typeof module === 'string');
        assert(module.length > 0);
        _this.options = new IndexOptions(module, options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context("".concat(module, "indexer"));
        _this.blocks = _this.options.blocks;
        _this.chain = _this.options.chain;
        _this.closing = false;
        _this.db = null;
        _this.batch = null;
        _this.bound = [];
        _this.syncing = false;
        _this.height = 0;
        return _this;
    }
    /**
     * Start a new batch write.
     * @returns {Batch}
     */
    Indexer.prototype.start = function () {
        assert(this.batch === null, 'Already started.');
        this.batch = this.db.batch();
        return this.batch;
    };
    /**
     * Put key and value to the current batch.
     * @param {String} key
     * @param {Buffer} value
     */
    Indexer.prototype.put = function (key, value) {
        this.batch.put(key, value);
    };
    /**
     * Delete key from the current batch.
     * @param {String} key
     */
    Indexer.prototype.del = function (key) {
        this.batch.del(key);
    };
    /**
     * Commit the current batch.
     * @returns {Promise}
     */
    Indexer.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.batch.write()];
                    case 1:
                        _a.sent();
                        this.batch = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open the indexer, open the database,
     * initialize height, and bind to events.
     * @returns {Promise}
     */
    Indexer.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Indexer is loading.');
                        this.closing = false;
                        return [4 /*yield*/, this.ensure()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.open()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'index', 0)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.verifyNetwork()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.db.get(layout.R.encode())];
                    case 5:
                        data = _a.sent();
                        if (!data) return [3 /*break*/, 6];
                        this.height = bio.readU32(data, 0);
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, this.saveGenesis()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        // Bind to chain events.
                        this.bind();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the indexer, wait for the database to close,
     * unbind all events.
     * @returns {Promise}
     */
    Indexer.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, event_1, listener;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.closing = true;
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _c.sent();
                        for (_i = 0, _a = this.bound; _i < _a.length; _i++) {
                            _b = _a[_i], event_1 = _b[0], listener = _b[1];
                            this.chain.removeListener(event_1, listener);
                        }
                        this.bound.length = 0;
                        this.closing = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ensure prefix directory (prefix/index).
     * @returns {Promise}
     */
    Indexer.prototype.ensure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fs.unsupported)
                            return [2 /*return*/];
                        if (this.options.memory)
                            return [2 /*return*/];
                        return [4 /*yield*/, fs.mkdirp(this.options.prefix)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify network of index.
     * @returns {Promise}
     */
    Indexer.prototype.verifyNetwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var raw, magic;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.O.encode())];
                    case 1:
                        raw = _a.sent();
                        if (!!raw) return [3 /*break*/, 3];
                        raw = bio.write(4).writeU32(this.network.magic).render();
                        return [4 /*yield*/, this.db.put(layout.O.encode(), raw)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        magic = bio.readU32(raw, 0);
                        if (magic !== this.network.magic)
                            throw new Error('Indexer: Network mismatch.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * A special case for indexing the genesis block. The genesis
     * block coins are not spendable, however indexers can still index
     * the block for historical and informational purposes.
     * @private
     * @returns {Promise}
     */
    Indexer.prototype.saveGenesis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var block, meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.start();
                        block = Block.fromRaw(Buffer.from(this.network.genesisBlock, 'hex'));
                        meta = new BlockMeta(block.hash(), 0);
                        return [4 /*yield*/, this.indexBlock(meta, block, new CoinView())];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._setTip(meta)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.commit()];
                    case 3:
                        _a.sent();
                        this.height = 0;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bind to chain events and save listeners for removal on close
     * @private
     */
    Indexer.prototype.bind = function () {
        var _this = this;
        var listener = function (entry, block, view) { return __awaiter(_this, void 0, void 0, function () {
            var meta, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        meta = new BlockMeta(entry.hash, entry.height);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.sync(meta, block, view)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.emit('error', e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        for (var _i = 0, _a = ['connect', 'disconnect', 'reset']; _i < _a.length; _i++) {
            var event_2 = _a[_i];
            this.bound.push([event_2, listener]);
            this.chain.on(event_2, listener);
        }
    };
    /**
     * Get a chain entry for the main chain only.
     * @private
     * @returns {Promise}
     */
    Indexer.prototype.getEntry = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.chain.isMainChain(entry)];
                    case 2:
                        if (!(_a.sent()))
                            return [2 /*return*/, null];
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Get a index block meta.
     * @param {Hash} hash
     * @returns {Promise}
     */
    Indexer.prototype.getBlockMeta = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.h.encode(height))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, new BlockMeta(data, height)];
                }
            });
        });
    };
    /**
     * Sync with the chain.
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype.sync = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var connected;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.syncing)
                            return [2 /*return*/];
                        this.syncing = true;
                        return [4 /*yield*/, this._syncBlock(meta, block, view)];
                    case 1:
                        connected = _a.sent();
                        if (connected) {
                            this.syncing = false;
                        }
                        else {
                            (function () { return __awaiter(_this, void 0, void 0, function () {
                                var e_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, 3, 4]);
                                            return [4 /*yield*/, this._syncChain()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 4];
                                        case 2:
                                            e_2 = _a.sent();
                                            this.emit('error', e_2);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            this.syncing = false;
                                            return [7 /*endfinally*/];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); })();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sync with the chain with a block.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype._syncBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var prev, current;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(meta && block && view)) return [3 /*break*/, 6];
                        if (!(meta.height === this.height + 1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getBlockMeta(this.height)];
                    case 1:
                        prev = _a.sent();
                        if (prev.hash.compare(block.prevBlock) !== 0)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this._addBlock(meta, block, view)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        if (!(meta.height === this.height)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getBlockMeta(this.height)];
                    case 4:
                        current = _a.sent();
                        if (current.hash.compare(block.hash()) !== 0)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this._removeBlock(meta, block, view)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Sync with the chain.
     * @private
     * @returns {Promise}
     */
    Indexer.prototype._syncChain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var height, meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        height = this.height;
                        if (!!height) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._rollforward()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (!(height > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getBlockMeta(height)];
                    case 3:
                        meta = _a.sent();
                        assert(meta);
                        return [4 /*yield*/, this.getEntry(meta.hash)];
                    case 4:
                        if (_a.sent())
                            return [3 /*break*/, 5];
                        height -= 1;
                        return [3 /*break*/, 2];
                    case 5:
                        if (!(height < this.height)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._rollback(height)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this._rollforward()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, this._rollforward()];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scan blockchain to the best chain height.
     * @private
     * @returns {Promise}
     */
    Indexer.prototype._rollforward = function () {
        return __awaiter(this, void 0, void 0, function () {
            var height, entry, meta, block, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Indexing to best height from height (%d).', this.height);
                        height = this.height + 1;
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.getEntry(height)];
                    case 2:
                        entry = _a.sent();
                        if (!entry)
                            return [3 /*break*/, 7];
                        meta = new BlockMeta(entry.hash, height);
                        return [4 /*yield*/, this.chain.getBlock(entry.hash)];
                    case 3:
                        block = _a.sent();
                        assert(block);
                        return [4 /*yield*/, this.chain.getBlockView(block)];
                    case 4:
                        view = _a.sent();
                        assert(view);
                        if (this.closing)
                            return [2 /*return*/];
                        return [4 /*yield*/, this._addBlock(meta, block, view)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        height++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rollback to a given chain height.
     * @param {Number} height
     * @returns {Promise}
     */
    Indexer.prototype._rollback = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var meta, block, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (height > this.height) {
                            this.logger.warning('Ignoring rollback to future height (%d).', height);
                            return [2 /*return*/];
                        }
                        this.logger.info('Rolling back to height %d.', height);
                        _a.label = 1;
                    case 1:
                        if (!(this.height > height && this.height > 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getBlockMeta(this.height)];
                    case 2:
                        meta = _a.sent();
                        assert(meta);
                        return [4 /*yield*/, this.chain.getBlock(meta.hash)];
                    case 3:
                        block = _a.sent();
                        assert(block);
                        return [4 /*yield*/, this.chain.getBlockView(block)];
                    case 4:
                        view = _a.sent();
                        assert(view);
                        return [4 /*yield*/, this._removeBlock(meta, block, view)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add a block's transactions without a lock.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype._addBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var start, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = util.bench();
                        if (meta.height !== this.height + 1)
                            throw new Error('Indexer: Can not add block.');
                        // Start the batch write.
                        this.start();
                        // Call the implemented indexer to add to
                        // the batch write.
                        return [4 /*yield*/, this.indexBlock(meta, block, view)];
                    case 1:
                        // Call the implemented indexer to add to
                        // the batch write.
                        _a.sent();
                        return [4 /*yield*/, this._setTip(meta)];
                    case 2:
                        height = _a.sent();
                        // Commit the write batch to disk.
                        return [4 /*yield*/, this.commit()];
                    case 3:
                        // Commit the write batch to disk.
                        _a.sent();
                        // Update height _after_ successful commit.
                        this.height = height;
                        // Log the current indexer status.
                        this.logStatus(start, block, meta);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process block indexing
     * Indexers will implement this method to process the block for indexing
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype.indexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Undo block indexing
     * Indexers will implement this method to undo indexing for the block
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype.unindexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Prune block indexing
     * Indexers will implement this method to prune indexing for the block
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype.pruneBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Unconfirm a block's transactions.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    Indexer.prototype._removeBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var start, prev, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = util.bench();
                        if (meta.height !== this.height)
                            throw new Error('Indexer: Can not remove block.');
                        // Start the batch write.
                        this.start();
                        // Call the implemented indexer to add to
                        // the batch write.
                        return [4 /*yield*/, this.unindexBlock(meta, block, view)];
                    case 1:
                        // Call the implemented indexer to add to
                        // the batch write.
                        _a.sent();
                        return [4 /*yield*/, this.getBlockMeta(meta.height - 1)];
                    case 2:
                        prev = _a.sent();
                        assert(prev);
                        return [4 /*yield*/, this._setTip(prev)];
                    case 3:
                        height = _a.sent();
                        // Commit the write batch to disk.
                        return [4 /*yield*/, this.commit()];
                    case 4:
                        // Commit the write batch to disk.
                        _a.sent();
                        // Prune block data _after_ successful commit.
                        return [4 /*yield*/, this.pruneBlock(meta)];
                    case 5:
                        // Prune block data _after_ successful commit.
                        _a.sent();
                        // Update height _after_ successful commit.
                        this.height = height;
                        // Log the current indexer status.
                        this.logStatus(start, block, meta, true);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the current height to tip.
     * @param {BlockMeta} tip
     * @returns {Promise}
     */
    Indexer.prototype._setTip = function (meta) {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                if (meta.height < this.height) {
                    assert(meta.height === this.height - 1);
                    this.del(layout.h.encode(this.height));
                }
                else if (meta.height > this.height) {
                    assert(meta.height === this.height + 1);
                }
                // Add to batch write to save tip and height.
                this.put(layout.h.encode(meta.height), meta.hash);
                raw = bio.write(4).writeU32(meta.height).render();
                this.put(layout.R.encode(), raw);
                return [2 /*return*/, meta.height];
            });
        });
    };
    /**
     * Test whether the indexer has reached its slow height.
     * @private
     * @returns {Boolean}
     */
    Indexer.prototype.isSlow = function () {
        if (this.height === 1 || this.height % 20 === 0)
            return true;
        if (this.height >= this.network.block.slowHeight)
            return true;
        return false;
    };
    /**
     * Log the current indexer status.
     * @private
     * @param {Array} start
     * @param {Block} block
     * @param {BlockMeta} meta
     * @param {Boolean} reverse
     */
    Indexer.prototype.logStatus = function (start, block, meta, reverse) {
        if (!this.isSlow())
            return;
        var elapsed = util.bench(start);
        var msg = reverse ? 'removed from' : 'added to';
        this.logger.info('Block (%d) %s indexer (txs=%d time=%d).', meta.height, msg, block.txs.length, elapsed);
    };
    return Indexer;
}(EventEmitter));
/**
 * Block Meta
 */
var BlockMeta = /** @class */ (function () {
    function BlockMeta(hash, height) {
        this.hash = hash || ZERO_HASH;
        this.height = height || 0;
        assert(Buffer.isBuffer(this.hash) && this.hash.length === 32);
        assert(Number.isInteger(this.height));
    }
    return BlockMeta;
}());
/**
 * Index Options
 */
var IndexOptions = /** @class */ (function () {
    /**
     * Create index options.
     * @constructor
     * @param {String} module
     * @param {Object} options
     */
    function IndexOptions(module, options) {
        this.module = module;
        this.network = Network.primary;
        this.logger = Logger.global;
        this.blocks = null;
        this.chain = null;
        this.prefix = null;
        this.location = null;
        this.memory = true;
        this.maxFiles = 64;
        this.cacheSize = 16 << 20;
        this.compression = true;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {IndexOptions}
     */
    IndexOptions.prototype.fromOptions = function (options) {
        assert(options.blocks && typeof options.blocks === 'object', 'Indexer requires a blockstore.');
        assert(options.chain && typeof options.chain === 'object', 'Indexer requires chain.');
        assert(!options.prune, 'Can not index while pruned.');
        this.blocks = options.blocks;
        this.chain = options.chain;
        if (options.network != null)
            this.network = Network.get(options.network);
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.prefix = path.join(this.prefix, 'index');
            this.location = path.join(this.prefix, this.module);
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
        return this;
    };
    /**
     * Instantiate indexer options from object.
     * @param {Object} options
     * @returns {IndexOptions}
     */
    IndexOptions.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    return IndexOptions;
}());
/*
 * Expose
 */
module.exports = Indexer;
