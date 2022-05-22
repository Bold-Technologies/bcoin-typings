/*!
 * chaindb.js - blockchain data management for bcoin
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
var bdb = require('bdb');
var bio = require('bufio');
var LRU = require('blru');
var BufferMap = require('buffer-map').BufferMap;
var Amount = require('../btc/amount');
var Network = require('../protocol/network');
var CoinView = require('../coins/coinview');
var UndoCoins = require('../coins/undocoins');
var layout = require('./layout');
var consensus = require('../protocol/consensus');
var Block = require('../primitives/block');
var Outpoint = require('../primitives/outpoint');
var ChainEntry = require('./chainentry');
var CoinEntry = require('../coins/coinentry');
/**
 * ChainDB
 * @alias module:blockchain.ChainDB
 */
var ChainDB = /** @class */ (function () {
    /**
     * Create a chaindb.
     * @constructor
     */
    function ChainDB(options) {
        this.options = options;
        this.network = this.options.network;
        this.logger = this.options.logger.context('chaindb');
        this.blocks = this.options.blocks;
        this.db = bdb.create(this.options);
        this.stateCache = new StateCache(this.network);
        this.state = new ChainState();
        this.pending = null;
        this.current = null;
        this.cacheHash = new LRU(this.options.entryCache, null, BufferMap);
        this.cacheHeight = new LRU(this.options.entryCache);
    }
    /**
     * Open and wait for the database to load.
     * @returns {Promise}
     */
    ChainDB.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.logger.info('Opening ChainDB...');
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'chain', 6)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.getState()];
                    case 3:
                        state = _b.sent();
                        if (!state) return [3 /*break*/, 7];
                        // Verify options have not changed.
                        return [4 /*yield*/, this.verifyFlags(state)];
                    case 4:
                        // Verify options have not changed.
                        _b.sent();
                        // Verify deployment params have not changed.
                        return [4 /*yield*/, this.verifyDeployments()];
                    case 5:
                        // Verify deployment params have not changed.
                        _b.sent();
                        // Load state caches.
                        _a = this;
                        return [4 /*yield*/, this.getStateCache()];
                    case 6:
                        // Load state caches.
                        _a.stateCache = _b.sent();
                        // Grab the chainstate if we have one.
                        this.state = state;
                        this.logger.info('ChainDB successfully loaded.');
                        return [3 /*break*/, 11];
                    case 7: 
                    // Database is fresh.
                    // Write initial state.
                    return [4 /*yield*/, this.saveFlags()];
                    case 8:
                        // Database is fresh.
                        // Write initial state.
                        _b.sent();
                        return [4 /*yield*/, this.saveDeployments()];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, this.saveGenesis()];
                    case 10:
                        _b.sent();
                        this.logger.info('ChainDB successfully initialized.');
                        _b.label = 11;
                    case 11:
                        this.logger.info('Chain State: hash=%h tx=%d coin=%d value=%s.', this.state.tip, this.state.tx, this.state.coin, Amount.btc(this.state.value));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close and wait for the database to close.
     * @returns {Promise}
     */
    ChainDB.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.close()];
            });
        });
    };
    /**
     * Start a batch.
     * @returns {Batch}
     */
    ChainDB.prototype.start = function () {
        assert(!this.current);
        assert(!this.pending);
        this.current = this.db.batch();
        this.pending = this.state.clone();
        this.cacheHash.start();
        this.cacheHeight.start();
        return this.current;
    };
    /**
     * Put key and value to current batch.
     * @param {String} key
     * @param {Buffer} value
     */
    ChainDB.prototype.put = function (key, value) {
        assert(this.current);
        this.current.put(key, value);
    };
    /**
     * Delete key from current batch.
     * @param {String} key
     */
    ChainDB.prototype.del = function (key) {
        assert(this.current);
        this.current.del(key);
    };
    /**
     * Get current batch.
     * @returns {Batch}
     */
    ChainDB.prototype.batch = function () {
        assert(this.current);
        return this.current;
    };
    /**
     * Drop current batch.
     * @returns {Batch}
     */
    ChainDB.prototype.drop = function () {
        var batch = this.current;
        assert(this.current);
        assert(this.pending);
        this.current = null;
        this.pending = null;
        this.cacheHash.drop();
        this.cacheHeight.drop();
        this.stateCache.drop();
        batch.clear();
    };
    /**
     * Commit current batch.
     * @returns {Promise}
     */
    ChainDB.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.current);
                        assert(this.pending);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.current.write()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.current = null;
                        this.pending = null;
                        this.cacheHash.drop();
                        this.cacheHeight.drop();
                        throw e_1;
                    case 4:
                        // Overwrite the entire state
                        // with our new best state
                        // only if it is committed.
                        // Note that alternate chain
                        // tips do not commit anything.
                        if (this.pending.committed)
                            this.state = this.pending;
                        this.current = null;
                        this.pending = null;
                        this.cacheHash.commit();
                        this.cacheHeight.commit();
                        this.stateCache.commit();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test the cache for a present entry hash or height.
     * @param {Hash|Number} block - Hash or height.
     */
    ChainDB.prototype.hasCache = function (block) {
        if (typeof block === 'number')
            return this.cacheHeight.has(block);
        assert(Buffer.isBuffer(block));
        return this.cacheHash.has(block);
    };
    /**
     * Get an entry directly from the LRU cache.
     * @param {Hash|Number} block - Hash or height.
     */
    ChainDB.prototype.getCache = function (block) {
        if (typeof block === 'number')
            return this.cacheHeight.get(block);
        assert(Buffer.isBuffer(block));
        return this.cacheHash.get(block);
    };
    /**
     * Get the height of a block by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns Number.
     */
    ChainDB.prototype.getHeight = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof hash === 'number')
                            return [2 /*return*/, hash];
                        assert(Buffer.isBuffer(hash));
                        if (hash.equals(consensus.ZERO_HASH))
                            return [2 /*return*/, -1];
                        entry = this.cacheHash.get(hash);
                        if (entry)
                            return [2 /*return*/, entry.height];
                        return [4 /*yield*/, this.db.get(layout.h.encode(hash))];
                    case 1:
                        height = _a.sent();
                        if (!height)
                            return [2 /*return*/, -1];
                        return [2 /*return*/, height.readUInt32LE(0, true)];
                }
            });
        });
    };
    /**
     * Get the hash of a block by height. Note that this
     * will only return hashes in the main chain.
     * @param {Number} height
     * @returns {Promise} - Returns {@link Hash}.
     */
    ChainDB.prototype.getHash = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                if (Buffer.isBuffer(height))
                    return [2 /*return*/, height];
                assert(typeof height === 'number');
                if (height < 0)
                    return [2 /*return*/, null];
                entry = this.cacheHeight.get(height);
                if (entry)
                    return [2 /*return*/, entry.hash];
                return [2 /*return*/, this.db.get(layout.H.encode(height))];
            });
        });
    };
    /**
     * Retrieve a chain entry by height.
     * @param {Number} height
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    ChainDB.prototype.getEntryByHeight = function (height) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, hash, state, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(typeof height === 'number');
                        if (height < 0)
                            return [2 /*return*/, null];
                        cache = this.cacheHeight.get(height);
                        if (cache)
                            return [2 /*return*/, cache];
                        return [4 /*yield*/, this.db.get(layout.H.encode(height))];
                    case 1:
                        hash = _a.sent();
                        if (!hash)
                            return [2 /*return*/, null];
                        state = this.state;
                        return [4 /*yield*/, this.getEntryByHash(hash)];
                    case 2:
                        entry = _a.sent();
                        if (!entry)
                            return [2 /*return*/, null];
                        // By the time getEntry has completed,
                        // a reorg may have occurred. This entry
                        // may not be on the main chain anymore.
                        if (this.state === state)
                            this.cacheHeight.set(entry.height, entry);
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Retrieve a chain entry by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    ChainDB.prototype.getEntryByHash = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, raw, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(Buffer.isBuffer(hash));
                        if (hash.equals(consensus.ZERO_HASH))
                            return [2 /*return*/, null];
                        cache = this.cacheHash.get(hash);
                        if (cache)
                            return [2 /*return*/, cache];
                        return [4 /*yield*/, this.db.get(layout.e.encode(hash))];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, null];
                        entry = ChainEntry.fromRaw(raw);
                        // There's no efficient way to check whether
                        // this is in the main chain or not, so
                        // don't add it to the height cache.
                        this.cacheHash.set(entry.hash, entry);
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Retrieve a chain entry.
     * @param {Number|Hash} block - Height or hash.
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    ChainDB.prototype.getEntry = function (block) {
        if (typeof block === 'number')
            return this.getEntryByHeight(block);
        return this.getEntryByHash(block);
    };
    /**
     * Test whether the chain contains a block.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    ChainDB.prototype.hasEntry = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getHeight(hash)];
                    case 1:
                        height = _a.sent();
                        return [2 /*return*/, height !== -1];
                }
            });
        });
    };
    /**
     * Get ancestor by `height`.
     * @param {ChainEntry} entry
     * @param {Number} height
     * @returns {Promise} - Returns ChainEntry.
     */
    ChainDB.prototype.getAncestor = function (entry, height) {
        return __awaiter(this, void 0, void 0, function () {
            var cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (height < 0)
                            return [2 /*return*/, null];
                        assert(height >= 0);
                        assert(height <= entry.height);
                        return [4 /*yield*/, this.isMainChain(entry)];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/, this.getEntryByHeight(height)];
                        _a.label = 2;
                    case 2:
                        if (!(entry.height !== height)) return [3 /*break*/, 6];
                        cache = this.getPrevCache(entry);
                        if (!cache) return [3 /*break*/, 3];
                        entry = cache;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.getPrevious(entry)];
                    case 4:
                        entry = _a.sent();
                        _a.label = 5;
                    case 5:
                        assert(entry);
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Get previous entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    ChainDB.prototype.getPrevious = function (entry) {
        return this.getEntryByHash(entry.prevBlock);
    };
    /**
     * Get previous cached entry.
     * @param {ChainEntry} entry
     * @returns {ChainEntry|null}
     */
    ChainDB.prototype.getPrevCache = function (entry) {
        return this.cacheHash.get(entry.prevBlock) || null;
    };
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    ChainDB.prototype.getNext = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getNextHash(entry.hash)];
                    case 1:
                        hash = _a.sent();
                        if (!hash)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.getEntryByHash(hash)];
                }
            });
        });
    };
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    ChainDB.prototype.getNextEntry = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var next;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntryByHeight(entry.height + 1)];
                    case 1:
                        next = _a.sent();
                        if (!next)
                            return [2 /*return*/, null];
                        // Not on main chain.
                        if (!next.prevBlock.equals(entry.hash))
                            return [2 /*return*/, null];
                        return [2 /*return*/, next];
                }
            });
        });
    };
    /**
     * Retrieve the tip entry from the tip record.
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    ChainDB.prototype.getTip = function () {
        return this.getEntryByHash(this.state.tip);
    };
    /**
     * Retrieve the tip entry from the tip record.
     * @returns {Promise} - Returns {@link ChainState}.
     */
    ChainDB.prototype.getState = function () {
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
     * Write genesis block to database.
     * @returns {Promise}
     */
    ChainDB.prototype.saveGenesis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var genesis, block, entry;
            return __generator(this, function (_a) {
                genesis = this.network.genesisBlock;
                block = Block.fromRaw(genesis, 'hex');
                entry = ChainEntry.fromBlock(block);
                this.logger.info('Writing genesis block to ChainDB.');
                return [2 /*return*/, this.save(entry, block, new CoinView())];
            });
        });
    };
    /**
     * Retrieve the database flags.
     * @returns {Promise} - Returns {@link ChainFlags}.
     */
    ChainDB.prototype.getFlags = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.O.encode())];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, ChainFlags.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Verify current options against db options.
     * @param {ChainState} state
     * @returns {Promise}
     */
    ChainDB.prototype.verifyFlags = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var options, flags, needsSave, needsPrune;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.options;
                        return [4 /*yield*/, this.getFlags()];
                    case 1:
                        flags = _a.sent();
                        needsSave = false;
                        needsPrune = false;
                        if (!flags)
                            throw new Error('No flags found.');
                        if (options.network !== flags.network)
                            throw new Error('Network mismatch for chain.');
                        if (options.spv && !flags.spv)
                            throw new Error('Cannot retroactively enable SPV.');
                        if (!options.spv && flags.spv)
                            throw new Error('Cannot retroactively disable SPV.');
                        if (!flags.witness) {
                            if (!options.forceFlags)
                                throw new Error('Cannot retroactively enable witness.');
                            needsSave = true;
                        }
                        if (options.bip91 !== flags.bip91) {
                            if (!options.forceFlags)
                                throw new Error('Cannot retroactively alter BIP91 flag.');
                            needsSave = true;
                        }
                        if (options.bip148 !== flags.bip148) {
                            if (!options.forceFlags)
                                throw new Error('Cannot retroactively alter BIP148 flag.');
                            needsSave = true;
                        }
                        if (options.prune && !flags.prune) {
                            if (!options.forceFlags)
                                throw new Error('Cannot retroactively prune.');
                            needsPrune = true;
                        }
                        if (!options.prune && flags.prune)
                            throw new Error('Cannot retroactively unprune.');
                        if (!needsSave) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.logger.info('Rewriting chain flags.')];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.saveFlags()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!needsPrune) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.logger.info('Retroactively pruning chain.')];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.prune(state.tip)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get state caches.
     * @returns {Promise} - Returns {@link StateCache}.
     */
    ChainDB.prototype.getStateCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stateCache, items, _i, items_1, item, _a, bit, hash, state;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        stateCache = new StateCache(this.network);
                        return [4 /*yield*/, this.db.range({
                                gte: layout.v.min(),
                                lte: layout.v.max(),
                                values: true
                            })];
                    case 1:
                        items = _b.sent();
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            _a = layout.v.decode(item.key), bit = _a[0], hash = _a[1];
                            state = item.value[0];
                            stateCache.insert(bit, hash, state);
                        }
                        return [2 /*return*/, stateCache];
                }
            });
        });
    };
    /**
     * Save deployment table.
     * @returns {Promise}
     */
    ChainDB.prototype.saveDeployments = function () {
        var b = this.db.batch();
        this.writeDeployments(b);
        return b.write();
    };
    /**
     * Save deployment table.
     * @returns {Promise}
     */
    ChainDB.prototype.writeDeployments = function (b) {
        var bw = bio.write(1 + 21 * this.network.deploys.length);
        bw.writeU8(this.network.deploys.length);
        for (var _i = 0, _a = this.network.deploys; _i < _a.length; _i++) {
            var deployment = _a[_i];
            bw.writeU8(deployment.bit);
            bw.writeI64(deployment.startTime);
            bw.writeU32(deployment.timeout);
            bw.writeI32(deployment.threshold);
            bw.writeI32(deployment.window);
        }
        b.put(layout.D.encode(), bw.render());
    };
    /**
     * Check for outdated deployments.
     * @private
     * @returns {Promise}
     */
    ChainDB.prototype.checkDeployments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var raw, br, count, invalid, i, bit, start, timeout, threshold, window_1, deployment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.D.encode())];
                    case 1:
                        raw = _a.sent();
                        assert(raw, 'No deployment table found.');
                        br = bio.read(raw);
                        count = br.readU8();
                        invalid = [];
                        for (i = 0; i < count; i++) {
                            bit = br.readU8();
                            start = br.readI64();
                            timeout = br.readU32();
                            threshold = br.readI32();
                            window_1 = br.readI32();
                            deployment = this.network.byBit(bit);
                            if (deployment
                                && start === deployment.startTime
                                && timeout === deployment.timeout
                                && threshold === deployment.threshold
                                && window_1 === deployment.window) {
                                continue;
                            }
                            invalid.push(bit);
                        }
                        return [2 /*return*/, invalid];
                }
            });
        });
    };
    /**
     * Potentially invalidate state cache.
     * @returns {Promise}
     */
    ChainDB.prototype.verifyDeployments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var invalid, e_2, i, b, _i, invalid_1, bit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkDeployments()];
                    case 1:
                        invalid = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        if (e_2.type !== 'EncodingError')
                            throw e_2;
                        invalid = [];
                        for (i = 0; i < 32; i++)
                            invalid.push(i);
                        return [3 /*break*/, 3];
                    case 3:
                        if (invalid.length === 0)
                            return [2 /*return*/, true];
                        b = this.db.batch();
                        _i = 0, invalid_1 = invalid;
                        _a.label = 4;
                    case 4:
                        if (!(_i < invalid_1.length)) return [3 /*break*/, 7];
                        bit = invalid_1[_i];
                        this.logger.warning('Versionbit deployment params modified.');
                        this.logger.warning('Invalidating cache for bit %d.', bit);
                        return [4 /*yield*/, this.invalidateCache(bit, b)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        this.writeDeployments(b);
                        return [4 /*yield*/, b.write()];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Invalidate state cache.
     * @private
     * @returns {Promise}
     */
    ChainDB.prototype.invalidateCache = function (bit, b) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, _i, keys_1, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.keys({
                            gte: layout.v.min(bit),
                            lte: layout.v.max(bit)
                        })];
                    case 1:
                        keys = _a.sent();
                        for (_i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                            key = keys_1[_i];
                            b.del(key);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retroactively prune the database.
     * @returns {Promise}
     */
    ChainDB.prototype.prune = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options, keepBlocks, pruneAfter, flags, height, start, end, i, hash, flags_1, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.options;
                        keepBlocks = this.network.block.keepBlocks;
                        pruneAfter = this.network.block.pruneAfterHeight;
                        return [4 /*yield*/, this.getFlags()];
                    case 1:
                        flags = _a.sent();
                        if (flags.prune)
                            throw new Error('Chain is already pruned.');
                        return [4 /*yield*/, this.getHeight(this.state.tip)];
                    case 2:
                        height = _a.sent();
                        if (height <= pruneAfter + keepBlocks)
                            return [2 /*return*/, false];
                        start = pruneAfter + 1;
                        end = height - keepBlocks;
                        i = start;
                        _a.label = 3;
                    case 3:
                        if (!(i <= end)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.getHash(i)];
                    case 4:
                        hash = _a.sent();
                        if (!hash)
                            throw new Error("Cannot find hash for ".concat(i, "."));
                        return [4 /*yield*/, this.blocks.pruneUndo(hash)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.blocks.prune(hash)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 3];
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        options.prune = true;
                        flags_1 = ChainFlags.fromOptions(options);
                        assert(flags_1.prune);
                        return [4 /*yield*/, this.db.put(layout.O.encode(), flags_1.toRaw())];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_3 = _a.sent();
                        options.prune = false;
                        throw e_3;
                    case 11: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Get the _next_ block hash (does not work by height).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Hash}.
     */
    ChainDB.prototype.getNextHash = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.get(layout.n.encode(hash))];
            });
        });
    };
    /**
     * Check to see if a block is on the main chain.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    ChainDB.prototype.isMainHash = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheHash, cacheHeight;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(Buffer.isBuffer(hash));
                        if (hash.equals(consensus.ZERO_HASH))
                            return [2 /*return*/, false];
                        if (hash.equals(this.network.genesis.hash))
                            return [2 /*return*/, true];
                        if (hash.equals(this.state.tip))
                            return [2 /*return*/, true];
                        cacheHash = this.cacheHash.get(hash);
                        if (cacheHash) {
                            cacheHeight = this.cacheHeight.get(cacheHash.height);
                            if (cacheHeight)
                                return [2 /*return*/, cacheHeight.hash.equals(hash)];
                        }
                        return [4 /*yield*/, this.getNextHash(hash)];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Test whether the entry is in the main chain.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns Boolean.
     */
    ChainDB.prototype.isMainChain = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (entry.isGenesis())
                            return [2 /*return*/, true];
                        if (entry.hash.equals(this.state.tip))
                            return [2 /*return*/, true];
                        cache = this.getCache(entry.height);
                        if (cache)
                            return [2 /*return*/, entry.hash.equals(cache.hash)];
                        return [4 /*yield*/, this.getNextHash(entry.hash)];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Get hash range.
     * @param {Number} [start=-1]
     * @param {Number} [end=-1]
     * @returns {Promise}
     */
    ChainDB.prototype.getHashes = function (start, end) {
        if (start === void 0) { start = -1; }
        if (end === void 0) { end = -1; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (start === -1)
                    start = 0;
                if (end === -1)
                    end >>>= 0;
                assert((start >>> 0) === start);
                assert((end >>> 0) === end);
                return [2 /*return*/, this.db.values({
                        gte: layout.H.min(start),
                        lte: layout.H.max(end)
                    })];
            });
        });
    };
    /**
     * Get all entries.
     * @returns {Promise} - Returns {@link ChainEntry}[].
     */
    ChainDB.prototype.getEntries = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.values({
                        gte: layout.e.min(),
                        lte: layout.e.max(),
                        parse: function (data) { return ChainEntry.fromRaw(data); }
                    })];
            });
        });
    };
    /**
     * Get all tip hashes.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    ChainDB.prototype.getTips = function () {
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
     * Get a coin (unspents only).
     * @private
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link CoinEntry}.
     */
    ChainDB.prototype.readCoin = function (prevout) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, index, raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.spv)
                            return [2 /*return*/, null];
                        hash = prevout.hash, index = prevout.index;
                        return [4 /*yield*/, this.db.get(layout.c.encode(hash, index))];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, null];
                        return [2 /*return*/, CoinEntry.fromRaw(raw)];
                }
            });
        });
    };
    /**
     * Get a coin (unspents only).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    ChainDB.prototype.getCoin = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            var prevout, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prevout = new Outpoint(hash, index);
                        return [4 /*yield*/, this.readCoin(prevout)];
                    case 1:
                        coin = _a.sent();
                        if (!coin)
                            return [2 /*return*/, null];
                        return [2 /*return*/, coin.toCoin(prevout)];
                }
            });
        });
    };
    /**
     * Check whether coins are still unspent. Necessary for bip30.
     * @see https://bitcointalk.org/index.php?topic=67738.0
     * @param {TX} tx
     * @returns {Promise} - Returns Boolean.
     */
    ChainDB.prototype.hasCoins = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var i, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tx.outputs.length)) return [3 /*break*/, 4];
                        key = layout.c.encode(tx.hash(), i);
                        return [4 /*yield*/, this.db.has(key)];
                    case 2:
                        if (_a.sent())
                            return [2 /*return*/, true];
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Get coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    ChainDB.prototype.getCoinView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, _i, _a, prevout, coin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        return [4 /*yield*/, this.readCoin(prevout)];
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
     * Get coins necessary to be resurrected during a reorg.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Coin}[].
     */
    ChainDB.prototype.getUndoCoins = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.blocks.readUndo(hash)];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, new UndoCoins()];
                        return [2 /*return*/, UndoCoins.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    ChainDB.prototype.getBlock = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRawBlock(hash)];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, Block.fromRaw(data)];
                }
            });
        });
    };
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    ChainDB.prototype.getRawBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.spv)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.getHash(block)];
                    case 1:
                        hash = _a.sent();
                        if (!hash)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.blocks.read(hash)];
                }
            });
        });
    };
    /**
     * Get a historical block coin viewpoint.
     * @param {Block} hash
     * @returns {Promise} - Returns {@link CoinView}.
     */
    ChainDB.prototype.getBlockView = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var view, undo, i, tx, j, input;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = new CoinView();
                        return [4 /*yield*/, this.getUndoCoins(block.hash())];
                    case 1:
                        undo = _a.sent();
                        if (undo.isEmpty())
                            return [2 /*return*/, view];
                        for (i = block.txs.length - 1; i > 0; i--) {
                            tx = block.txs[i];
                            for (j = tx.inputs.length - 1; j >= 0; j--) {
                                input = tx.inputs[j];
                                undo.apply(view, input.prevout);
                            }
                        }
                        // Undo coins should be empty.
                        assert(undo.isEmpty(), 'Undo coins data inconsistency.');
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Scan the blockchain for transactions containing specified address hashes.
     * @param {Hash} start - Block hash to start at.
     * @param {Bloom} filter - Bloom filter containing tx and address hashes.
     * @param {Function} iter - Iterator.
     * @returns {Promise}
     */
    ChainDB.prototype.scan = function (start, filter, iter) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, total, block, txs, i, tx, found, j, output, hash, prevout, _i, _a, prevout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (start == null)
                            start = this.network.genesis.hash;
                        if (typeof start === 'number')
                            this.logger.info('Scanning from height %d.', start);
                        else
                            this.logger.info('Scanning from block %h.', start);
                        return [4 /*yield*/, this.getEntry(start)];
                    case 1:
                        entry = _b.sent();
                        if (!entry)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.isMainChain(entry)];
                    case 2:
                        if (!(_b.sent()))
                            throw new Error('Cannot rescan an alternate chain.');
                        total = 0;
                        _b.label = 3;
                    case 3:
                        if (!entry) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.getBlock(entry.hash)];
                    case 4:
                        block = _b.sent();
                        txs = [];
                        total += 1;
                        if (!!block) return [3 /*break*/, 7];
                        if (!this.options.spv && !this.options.prune)
                            throw new Error('Block not found.');
                        return [4 /*yield*/, iter(entry, txs)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.getNext(entry)];
                    case 6:
                        entry = _b.sent();
                        return [3 /*break*/, 3];
                    case 7:
                        this.logger.info('Scanning block %h (%d).', entry.hash, entry.height);
                        for (i = 0; i < block.txs.length; i++) {
                            tx = block.txs[i];
                            found = false;
                            for (j = 0; j < tx.outputs.length; j++) {
                                output = tx.outputs[j];
                                hash = output.getHash();
                                if (!hash)
                                    continue;
                                if (filter.test(hash)) {
                                    prevout = Outpoint.fromTX(tx, j);
                                    filter.add(prevout.toRaw());
                                    found = true;
                                }
                            }
                            if (found) {
                                txs.push(tx);
                                continue;
                            }
                            if (i === 0)
                                continue;
                            for (_i = 0, _a = tx.inputs; _i < _a.length; _i++) {
                                prevout = _a[_i].prevout;
                                if (filter.test(prevout.toRaw())) {
                                    txs.push(tx);
                                    break;
                                }
                            }
                        }
                        return [4 /*yield*/, iter(entry, txs)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.getNext(entry)];
                    case 9:
                        entry = _b.sent();
                        return [3 /*break*/, 3];
                    case 10:
                        this.logger.info('Finished scanning %d blocks.', total);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save an entry to the database and optionally
     * connect it as the tip. Note that this method
     * does _not_ perform any verification which is
     * instead performed in {@link Chain#add}.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView?} view - Will not connect if null.
     * @returns {Promise}
     */
    ChainDB.prototype.save = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.start();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._save(entry, block, view)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        this.drop();
                        throw e_4;
                    case 4: return [4 /*yield*/, this.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save an entry.
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView?} view
     * @returns {Promise}
     */
    ChainDB.prototype._save = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        // Hash->height index.
                        this.put(layout.h.encode(hash), fromU32(entry.height));
                        // Entry data.
                        this.put(layout.e.encode(hash), entry.toRaw());
                        this.cacheHash.push(entry.hash, entry);
                        // Tip index.
                        this.del(layout.p.encode(entry.prevBlock));
                        this.put(layout.p.encode(hash), null);
                        // Update state caches.
                        this.saveUpdates();
                        if (!!view) return [3 /*break*/, 2];
                        // Save block data.
                        return [4 /*yield*/, this.saveBlock(entry, block)];
                    case 1:
                        // Save block data.
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        // Hash->next-block index.
                        if (!entry.isGenesis())
                            this.put(layout.n.encode(entry.prevBlock), hash);
                        // Height->hash index.
                        this.put(layout.H.encode(entry.height), hash);
                        this.cacheHeight.push(entry.height, entry);
                        // Connect block and save data.
                        return [4 /*yield*/, this.saveBlock(entry, block, view)];
                    case 3:
                        // Connect block and save data.
                        _a.sent();
                        // Commit new chain state.
                        this.put(layout.R.encode(), this.pending.commit(hash));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reconnect the block to the chain.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    ChainDB.prototype.reconnect = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.start();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._reconnect(entry, block, view)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _a.sent();
                        this.drop();
                        throw e_5;
                    case 4: return [4 /*yield*/, this.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reconnect block.
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise}
     */
    ChainDB.prototype._reconnect = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        assert(!entry.isGenesis());
                        // We can now add a hash->next-block index.
                        this.put(layout.n.encode(entry.prevBlock), hash);
                        // We can now add a height->hash index.
                        this.put(layout.H.encode(entry.height), hash);
                        this.cacheHeight.push(entry.height, entry);
                        // Re-insert into cache.
                        this.cacheHash.push(entry.hash, entry);
                        // Update state caches.
                        this.saveUpdates();
                        // Connect inputs.
                        return [4 /*yield*/, this.connectBlock(entry, block, view)];
                    case 1:
                        // Connect inputs.
                        _a.sent();
                        // Update chain state.
                        this.put(layout.R.encode(), this.pending.commit(hash));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnect block from the chain.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @returns {Promise}
     */
    ChainDB.prototype.disconnect = function (entry, block) {
        return __awaiter(this, void 0, void 0, function () {
            var view, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.start();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._disconnect(entry, block)];
                    case 2:
                        view = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        this.drop();
                        throw e_6;
                    case 4: return [4 /*yield*/, this.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Disconnect block.
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @returns {Promise} - Returns {@link CoinView}.
     */
    ChainDB.prototype._disconnect = function (entry, block) {
        return __awaiter(this, void 0, void 0, function () {
            var view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Remove hash->next-block index.
                        this.del(layout.n.encode(entry.prevBlock));
                        // Remove height->hash index.
                        this.del(layout.H.encode(entry.height));
                        this.cacheHeight.unpush(entry.height);
                        // Update state caches.
                        this.saveUpdates();
                        return [4 /*yield*/, this.disconnectBlock(entry, block)];
                    case 1:
                        view = _a.sent();
                        // Revert chain state to previous tip.
                        this.put(layout.R.encode(), this.pending.commit(entry.prevBlock));
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Save state cache updates.
     * @private
     */
    ChainDB.prototype.saveUpdates = function () {
        var updates = this.stateCache.updates;
        if (updates.length === 0)
            return;
        this.logger.info('Saving %d state cache updates.', updates.length);
        for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
            var update = updates_1[_i];
            var bit = update.bit, hash = update.hash;
            this.put(layout.v.encode(bit, hash), update.toRaw());
        }
    };
    /**
     * Reset the chain to a height or hash. Useful for replaying
     * the blockchain download for SPV.
     * @param {Hash|Number} block - hash/height
     * @returns {Promise}
     */
    ChainDB.prototype.reset = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, tip, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntry(block)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new Error('Block not found.');
                        return [4 /*yield*/, this.isMainChain(entry)];
                    case 2:
                        if (!(_a.sent()))
                            throw new Error('Cannot reset on alternate chain.');
                        if (this.options.prune)
                            throw new Error('Cannot reset when pruned.');
                        // We need to remove all alternate
                        // chains first. This is ugly, but
                        // it's the only safe way to reset
                        // the chain.
                        return [4 /*yield*/, this.removeChains()];
                    case 3:
                        // We need to remove all alternate
                        // chains first. This is ugly, but
                        // it's the only safe way to reset
                        // the chain.
                        _a.sent();
                        return [4 /*yield*/, this.getTip()];
                    case 4:
                        tip = _a.sent();
                        assert(tip);
                        this.logger.debug('Resetting main chain to: %h', entry.hash);
                        _a.label = 5;
                    case 5:
                        this.start();
                        if (!tip.hash.equals(entry.hash)) return [3 /*break*/, 7];
                        this.put(layout.R.encode(), this.pending.commit(tip.hash));
                        return [4 /*yield*/, this.commit()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 7:
                        assert(!tip.isGenesis());
                        // Revert the tip index.
                        this.del(layout.p.encode(tip.hash));
                        this.put(layout.p.encode(tip.prevBlock), null);
                        // Remove all records (including
                        // main-chain-only records).
                        this.del(layout.H.encode(tip.height));
                        this.del(layout.h.encode(tip.hash));
                        this.del(layout.e.encode(tip.hash));
                        this.del(layout.n.encode(tip.prevBlock));
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.removeBlock(tip)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_7 = _a.sent();
                        this.drop();
                        throw e_7;
                    case 11:
                        // Revert chain state to previous tip.
                        this.put(layout.R.encode(), this.pending.commit(tip.prevBlock));
                        return [4 /*yield*/, this.commit()];
                    case 12:
                        _a.sent();
                        // Update caches _after_ successful commit.
                        this.cacheHeight.remove(tip.height);
                        this.cacheHash.remove(tip.hash);
                        return [4 /*yield*/, this.getPrevious(tip)];
                    case 13:
                        tip = _a.sent();
                        assert(tip);
                        _a.label = 14;
                    case 14: return [3 /*break*/, 5];
                    case 15: return [2 /*return*/, tip];
                }
            });
        });
    };
    /**
     * Remove all alternate chains.
     * @returns {Promise}
     */
    ChainDB.prototype.removeChains = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tips, _i, tips_1, tip, e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTips()];
                    case 1:
                        tips = _a.sent();
                        // Note that this has to be
                        // one giant atomic write!
                        this.start();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        _i = 0, tips_1 = tips;
                        _a.label = 3;
                    case 3:
                        if (!(_i < tips_1.length)) return [3 /*break*/, 6];
                        tip = tips_1[_i];
                        return [4 /*yield*/, this._removeChain(tip)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        e_8 = _a.sent();
                        this.drop();
                        throw e_8;
                    case 8: return [4 /*yield*/, this.commit()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove an alternate chain.
     * @private
     * @param {Hash} hash - Alternate chain tip.
     * @returns {Promise}
     */
    ChainDB.prototype._removeChain = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var tip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntryByHash(hash)];
                    case 1:
                        tip = _a.sent();
                        if (!tip)
                            throw new Error('Alternate chain tip not found.');
                        this.logger.debug('Removing alternate chain: %h.', tip.hash);
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.isMainChain(tip)];
                    case 3:
                        if (_a.sent())
                            return [3 /*break*/, 6];
                        assert(!tip.isGenesis());
                        // Remove all non-main-chain records.
                        this.del(layout.p.encode(tip.hash));
                        this.del(layout.h.encode(tip.hash));
                        this.del(layout.e.encode(tip.hash));
                        // Queue up hash to be removed
                        // on successful write.
                        this.cacheHash.unpush(tip.hash);
                        return [4 /*yield*/, this.getPrevious(tip)];
                    case 4:
                        tip = _a.sent();
                        assert(tip);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save a block (not an entry) to the
     * database and potentially connect the inputs.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView?} view
     * @returns {Promise} - Returns {@link Block}.
     */
    ChainDB.prototype.saveBlock = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        if (this.options.spv)
                            return [2 /*return*/];
                        // Write actual block data.
                        return [4 /*yield*/, this.blocks.write(hash, block.toRaw())];
                    case 1:
                        // Write actual block data.
                        _a.sent();
                        if (!view)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.connectBlock(entry, block, view)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove a block (not an entry) to the database.
     * Disconnect inputs.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns {@link Block}.
     */
    ChainDB.prototype.removeBlock = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.spv)
                            return [2 /*return*/, new CoinView()];
                        return [4 /*yield*/, this.getBlock(entry.hash)];
                    case 1:
                        block = _a.sent();
                        if (!block)
                            throw new Error('Block not found.');
                        return [2 /*return*/, this.disconnectBlock(entry, block)];
                }
            });
        });
    };
    /**
     * Commit coin view to database.
     * @private
     * @param {CoinView} view
     */
    ChainDB.prototype.saveView = function (view) {
        for (var _i = 0, _a = view.map; _i < _a.length; _i++) {
            var _b = _a[_i], hash = _b[0], coins = _b[1];
            for (var _c = 0, _d = coins.outputs; _c < _d.length; _c++) {
                var _e = _d[_c], index = _e[0], coin = _e[1];
                if (coin.spent) {
                    this.del(layout.c.encode(hash, index));
                    continue;
                }
                var raw = coin.toRaw();
                this.put(layout.c.encode(hash, index), raw);
            }
        }
    };
    /**
     * Connect block inputs.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {CoinView} view
     * @returns {Promise} - Returns {@link Block}.
     */
    ChainDB.prototype.connectBlock = function (entry, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, i, tx, _i, _a, prevout, _b, _c, output;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.options.spv)
                            return [2 /*return*/, undefined];
                        hash = block.hash();
                        this.pending.connect(block);
                        // Genesis block's coinbase is unspendable.
                        if (entry.isGenesis())
                            return [2 /*return*/, undefined];
                        // Update chain state value.
                        for (i = 0; i < block.txs.length; i++) {
                            tx = block.txs[i];
                            if (i > 0) {
                                for (_i = 0, _a = tx.inputs; _i < _a.length; _i++) {
                                    prevout = _a[_i].prevout;
                                    this.pending.spend(view.getOutput(prevout));
                                }
                            }
                            for (_b = 0, _c = tx.outputs; _b < _c.length; _b++) {
                                output = _c[_b];
                                if (output.script.isUnspendable())
                                    continue;
                                this.pending.add(output);
                            }
                        }
                        // Commit new coin state.
                        this.saveView(view);
                        if (!!view.undo.isEmpty()) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.blocks.writeUndo(hash, view.undo.commit())];
                    case 1:
                        _d.sent();
                        _d.label = 2;
                    case 2: 
                    // Prune height-288 if pruning is enabled.
                    return [2 /*return*/, this.pruneBlock(entry)];
                }
            });
        });
    };
    /**
     * Disconnect block inputs.
     * @param {ChainEntry} entry
     * @param {Block} block
     * @returns {Promise} - Returns {@link CoinView}.
     */
    ChainDB.prototype.disconnectBlock = function (entry, block) {
        return __awaiter(this, void 0, void 0, function () {
            var view, hash, undo, i, tx, j, prevout, j, output;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = new CoinView();
                        if (this.options.spv)
                            return [2 /*return*/, view];
                        hash = block.hash();
                        return [4 /*yield*/, this.getUndoCoins(hash)];
                    case 1:
                        undo = _a.sent();
                        this.pending.disconnect(block);
                        // Disconnect all transactions.
                        for (i = block.txs.length - 1; i >= 0; i--) {
                            tx = block.txs[i];
                            if (i > 0) {
                                for (j = tx.inputs.length - 1; j >= 0; j--) {
                                    prevout = tx.inputs[j].prevout;
                                    undo.apply(view, prevout);
                                    this.pending.add(view.getOutput(prevout));
                                }
                            }
                            // Remove any created coins.
                            view.removeTX(tx, entry.height);
                            for (j = tx.outputs.length - 1; j >= 0; j--) {
                                output = tx.outputs[j];
                                if (output.script.isUnspendable())
                                    continue;
                                this.pending.spend(output);
                            }
                        }
                        // Undo coins should be empty.
                        assert(undo.isEmpty(), 'Undo coins data inconsistency.');
                        // Commit new coin state.
                        this.saveView(view);
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Prune a block from the chain and
     * add current block to the prune queue.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    ChainDB.prototype.pruneBlock = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var height, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.options.spv)
                            return [2 /*return*/];
                        if (!this.options.prune)
                            return [2 /*return*/];
                        height = entry.height - this.network.block.keepBlocks;
                        if (height <= this.network.block.pruneAfterHeight)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getHash(height)];
                    case 1:
                        hash = _a.sent();
                        if (!hash)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.blocks.pruneUndo(hash)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.blocks.prune(hash)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Save database options.
     * @returns {Promise}
     */
    ChainDB.prototype.saveFlags = function () {
        var flags = ChainFlags.fromOptions(this.options);
        var b = this.db.batch();
        b.put(layout.O.encode(), flags.toRaw());
        return b.write();
    };
    return ChainDB;
}());
/**
 * ChainFlags
 */
var ChainFlags = /** @class */ (function () {
    /**
     * Create chain flags.
     * @alias module:blockchain.ChainFlags
     * @constructor
     */
    function ChainFlags(options) {
        this.network = Network.primary;
        this.spv = false;
        this.witness = true;
        this.bip91 = false;
        this.bip148 = false;
        this.prune = false;
        if (options)
            this.fromOptions(options);
    }
    ChainFlags.prototype.fromOptions = function (options) {
        this.network = Network.get(options.network);
        if (options.spv != null) {
            assert(typeof options.spv === 'boolean');
            this.spv = options.spv;
        }
        if (options.bip91 != null) {
            assert(typeof options.bip91 === 'boolean');
            this.bip91 = options.bip91;
        }
        if (options.bip148 != null) {
            assert(typeof options.bip148 === 'boolean');
            this.bip148 = options.bip148;
        }
        if (options.prune != null) {
            assert(typeof options.prune === 'boolean');
            this.prune = options.prune;
        }
        return this;
    };
    ChainFlags.fromOptions = function (data) {
        return new ChainFlags().fromOptions(data);
    };
    ChainFlags.prototype.toRaw = function () {
        var bw = bio.write(12);
        var flags = 0;
        if (this.spv)
            flags |= 1 << 0;
        if (this.witness)
            flags |= 1 << 1;
        if (this.prune)
            flags |= 1 << 2;
        if (this.bip91)
            flags |= 1 << 5;
        if (this.bip148)
            flags |= 1 << 6;
        bw.writeU32(this.network.magic);
        bw.writeU32(flags);
        bw.writeU32(0);
        return bw.render();
    };
    ChainFlags.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.network = Network.fromMagic(br.readU32());
        var flags = br.readU32();
        this.spv = (flags & 1) !== 0;
        this.witness = (flags & 2) !== 0;
        this.prune = (flags & 4) !== 0;
        this.bip91 = (flags & 32) !== 0;
        this.bip148 = (flags & 64) !== 0;
        return this;
    };
    ChainFlags.fromRaw = function (data) {
        return new ChainFlags().fromRaw(data);
    };
    return ChainFlags;
}());
/**
 * Chain State
 */
var ChainState = /** @class */ (function () {
    /**
     * Create chain state.
     * @alias module:blockchain.ChainState
     * @constructor
     */
    function ChainState() {
        this.tip = consensus.ZERO_HASH;
        this.tx = 0;
        this.coin = 0;
        this.value = 0;
        this.committed = false;
    }
    ChainState.prototype.clone = function () {
        var state = new ChainState();
        state.tip = this.tip;
        state.tx = this.tx;
        state.coin = this.coin;
        state.value = this.value;
        return state;
    };
    ChainState.prototype.connect = function (block) {
        this.tx += block.txs.length;
    };
    ChainState.prototype.disconnect = function (block) {
        this.tx -= block.txs.length;
    };
    ChainState.prototype.add = function (coin) {
        this.coin += 1;
        this.value += coin.value;
    };
    ChainState.prototype.spend = function (coin) {
        this.coin -= 1;
        this.value -= coin.value;
    };
    ChainState.prototype.commit = function (hash) {
        this.tip = hash;
        this.committed = true;
        return this.toRaw();
    };
    ChainState.prototype.toRaw = function () {
        var bw = bio.write(56);
        bw.writeHash(this.tip);
        bw.writeU64(this.tx);
        bw.writeU64(this.coin);
        bw.writeU64(this.value);
        return bw.render();
    };
    ChainState.fromRaw = function (data) {
        var state = new ChainState();
        var br = bio.read(data);
        state.tip = br.readHash();
        state.tx = br.readU64();
        state.coin = br.readU64();
        state.value = br.readU64();
        return state;
    };
    return ChainState;
}());
/**
 * State Cache
 */
var StateCache = /** @class */ (function () {
    /**
     * Create state cache.
     * @alias module:blockchain.StateCache
     * @constructor
     */
    function StateCache(network) {
        this.network = network;
        this.bits = [];
        this.updates = [];
        this.init();
    }
    StateCache.prototype.init = function () {
        for (var i = 0; i < 32; i++)
            this.bits.push(null);
        for (var _i = 0, _a = this.network.deploys; _i < _a.length; _i++) {
            var bit = _a[_i].bit;
            assert(!this.bits[bit]);
            this.bits[bit] = new BufferMap();
        }
    };
    StateCache.prototype.set = function (bit, entry, state) {
        var cache = this.bits[bit];
        assert(cache);
        if (cache.get(entry.hash) !== state) {
            cache.set(entry.hash, state);
            this.updates.push(new CacheUpdate(bit, entry.hash, state));
        }
    };
    StateCache.prototype.get = function (bit, entry) {
        var cache = this.bits[bit];
        assert(cache);
        var state = cache.get(entry.hash);
        if (state == null)
            return -1;
        return state;
    };
    StateCache.prototype.commit = function () {
        this.updates.length = 0;
    };
    StateCache.prototype.drop = function () {
        for (var _i = 0, _a = this.updates; _i < _a.length; _i++) {
            var _b = _a[_i], bit = _b.bit, hash = _b.hash;
            var cache = this.bits[bit];
            assert(cache);
            cache["delete"](hash);
        }
        this.updates.length = 0;
    };
    StateCache.prototype.insert = function (bit, hash, state) {
        var cache = this.bits[bit];
        assert(cache);
        cache.set(hash, state);
    };
    return StateCache;
}());
/**
 * Cache Update
 */
var CacheUpdate = /** @class */ (function () {
    /**
     * Create cache update.
     * @constructor
     * @ignore
     */
    function CacheUpdate(bit, hash, state) {
        this.bit = bit;
        this.hash = hash;
        this.state = state;
    }
    CacheUpdate.prototype.toRaw = function () {
        var data = Buffer.allocUnsafe(1);
        data[0] = this.state;
        return data;
    };
    return CacheUpdate;
}());
/*
 * Helpers
 */
function fromU32(num) {
    var data = Buffer.allocUnsafe(4);
    data.writeUInt32LE(num, 0, true);
    return data;
}
/*
 * Expose
 */
module.exports = ChainDB;
