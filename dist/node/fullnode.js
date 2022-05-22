/*!
 * fullnode.js - full node for bcoin
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
var Chain = require('../blockchain/chain');
var Fees = require('../mempool/fees');
var Mempool = require('../mempool/mempool');
var Pool = require('../net/pool');
var Miner = require('../mining/miner');
var Node = require('./node');
var HTTP = require('./http');
var RPC = require('./rpc');
var blockstore = require('../blockstore');
var TXIndexer = require('../indexer/txindexer');
var AddrIndexer = require('../indexer/addrindexer');
var FilterIndexer = require('../indexer/filterindexer');
/**
 * Full Node
 * Respresents a fullnode complete with a
 * chain, mempool, miner, etc.
 * @alias module:node.FullNode
 * @extends Node
 */
var FullNode = /** @class */ (function (_super) {
    __extends(FullNode, _super);
    /**
     * Create a full node.
     * @constructor
     * @param {Object?} options
     */
    function FullNode(options) {
        var _this = _super.call(this, 'bcoin', 'bcoin.conf', 'debug.log', options) || this;
        _this.opened = false;
        // SPV flag.
        _this.spv = false;
        // Instantiate block storage.
        _this.blocks = blockstore.create({
            network: _this.network,
            logger: _this.logger,
            prefix: _this.config.prefix,
            cacheSize: _this.config.mb('block-cache-size'),
            memory: _this.memory
        });
        // Chain needs access to blocks.
        _this.chain = new Chain({
            network: _this.network,
            logger: _this.logger,
            blocks: _this.blocks,
            workers: _this.workers,
            memory: _this.config.bool('memory'),
            prefix: _this.config.prefix,
            maxFiles: _this.config.uint('max-files'),
            cacheSize: _this.config.mb('cache-size'),
            forceFlags: _this.config.bool('force-flags'),
            bip91: _this.config.bool('bip91'),
            bip148: _this.config.bool('bip148'),
            prune: _this.config.bool('prune'),
            checkpoints: _this.config.bool('checkpoints'),
            entryCache: _this.config.uint('entry-cache'),
            indexTX: _this.config.bool('index-tx'),
            indexAddress: _this.config.bool('index-address')
        });
        // Fee estimation.
        _this.fees = new Fees(_this.logger);
        _this.fees.init();
        // Mempool needs access to the chain.
        _this.mempool = new Mempool({
            network: _this.network,
            logger: _this.logger,
            workers: _this.workers,
            chain: _this.chain,
            fees: _this.fees,
            memory: _this.memory,
            prefix: _this.config.prefix,
            persistent: _this.config.bool('persistent-mempool'),
            maxSize: _this.config.mb('mempool-size'),
            limitFree: _this.config.bool('limit-free'),
            limitFreeRelay: _this.config.uint('limit-free-relay'),
            requireStandard: _this.config.bool('require-standard'),
            rejectAbsurdFees: _this.config.bool('reject-absurd-fees'),
            replaceByFee: _this.config.bool('replace-by-fee'),
            indexAddress: _this.config.bool('index-address')
        });
        // Pool needs access to the chain and mempool.
        _this.pool = new Pool({
            network: _this.network,
            logger: _this.logger,
            chain: _this.chain,
            mempool: _this.mempool,
            prefix: _this.config.prefix,
            selfish: _this.config.bool('selfish'),
            compact: _this.config.bool('compact'),
            bip37: _this.config.bool('bip37'),
            maxOutbound: _this.config.uint('max-outbound'),
            maxInbound: _this.config.uint('max-inbound'),
            createSocket: _this.config.func('create-socket'),
            proxy: _this.config.str('proxy'),
            onion: _this.config.bool('onion'),
            upnp: _this.config.bool('upnp'),
            seeds: _this.config.array('seeds'),
            nodes: _this.config.array('nodes'),
            only: _this.config.array('only'),
            publicHost: _this.config.str('public-host'),
            publicPort: _this.config.uint('public-port'),
            host: _this.config.str('host'),
            port: _this.config.uint('port'),
            listen: _this.config.bool('listen'),
            memory: _this.memory
        });
        // Miner needs access to the chain and mempool.
        _this.miner = new Miner({
            network: _this.network,
            logger: _this.logger,
            workers: _this.workers,
            chain: _this.chain,
            mempool: _this.mempool,
            address: _this.config.array('coinbase-address'),
            coinbaseFlags: _this.config.str('coinbase-flags'),
            preverify: _this.config.bool('preverify'),
            maxWeight: _this.config.uint('max-weight'),
            reservedWeight: _this.config.uint('reserved-weight'),
            reservedSigops: _this.config.uint('reserved-sigops')
        });
        // RPC needs access to the node.
        _this.rpc = new RPC(_this);
        // HTTP needs access to the node.
        _this.http = new HTTP({
            network: _this.network,
            logger: _this.logger,
            node: _this,
            prefix: _this.config.prefix,
            ssl: _this.config.bool('ssl'),
            keyFile: _this.config.path('ssl-key'),
            certFile: _this.config.path('ssl-cert'),
            host: _this.config.str('http-host'),
            port: _this.config.uint('http-port'),
            apiKey: _this.config.str('api-key'),
            noAuth: _this.config.bool('no-auth'),
            cors: _this.config.bool('cors'),
            maxTxs: _this.config.uint('max-txs')
        });
        // Indexers
        if (_this.config.bool('index-tx')) {
            _this.txindex = new TXIndexer({
                network: _this.network,
                logger: _this.logger,
                blocks: _this.blocks,
                chain: _this.chain,
                prune: _this.config.bool('prune'),
                memory: _this.memory,
                prefix: _this.config.str('index-prefix', _this.config.prefix)
            });
        }
        if (_this.config.bool('index-address')) {
            _this.addrindex = new AddrIndexer({
                network: _this.network,
                logger: _this.logger,
                blocks: _this.blocks,
                chain: _this.chain,
                prune: _this.config.bool('prune'),
                memory: _this.memory,
                prefix: _this.config.str('index-prefix', _this.config.prefix),
                maxTxs: _this.config.uint('max-txs')
            });
        }
        if (_this.config.bool('index-filter')) {
            _this.filterindex = new FilterIndexer({
                network: _this.network,
                logger: _this.logger,
                blocks: _this.blocks,
                chain: _this.chain,
                memory: _this.config.bool('memory'),
                prefix: _this.config.str('index-prefix', _this.config.prefix)
            });
        }
        _this.init();
        return _this;
    }
    /**
     * Initialize the node.
     * @private
     */
    FullNode.prototype.init = function () {
        var _this = this;
        // Bind to errors
        this.chain.on('error', function (err) { return _this.error(err); });
        this.mempool.on('error', function (err) { return _this.error(err); });
        this.pool.on('error', function (err) { return _this.error(err); });
        this.miner.on('error', function (err) { return _this.error(err); });
        if (this.txindex)
            this.txindex.on('error', function (err) { return _this.error(err); });
        if (this.addrindex)
            this.addrindex.on('error', function (err) { return _this.error(err); });
        if (this.filterindex)
            this.filterindex.on('error', function (err) { return _this.error(err); });
        if (this.http)
            this.http.on('error', function (err) { return _this.error(err); });
        this.mempool.on('tx', function (tx) {
            _this.miner.cpu.notifyEntry();
            _this.emit('tx', tx);
        });
        this.chain.on('connect', function (entry, block) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mempool._addBlock(entry, block.txs)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.error(e_1);
                        return [3 /*break*/, 3];
                    case 3:
                        this.emit('block', block);
                        this.emit('connect', entry, block);
                        return [2 /*return*/];
                }
            });
        }); });
        this.chain.on('disconnect', function (entry, block) { return __awaiter(_this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mempool._removeBlock(entry, block.txs)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        this.error(e_2);
                        return [3 /*break*/, 3];
                    case 3:
                        this.emit('disconnect', entry, block);
                        return [2 /*return*/];
                }
            });
        }); });
        this.chain.on('reorganize', function (tip, competitor) { return __awaiter(_this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mempool._handleReorg()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        this.error(e_3);
                        return [3 /*break*/, 3];
                    case 3:
                        this.emit('reorganize', tip, competitor);
                        return [2 /*return*/];
                }
            });
        }); });
        this.chain.on('reset', function (tip) { return __awaiter(_this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mempool._reset()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        this.error(e_4);
                        return [3 /*break*/, 3];
                    case 3:
                        this.emit('reset', tip);
                        return [2 /*return*/];
                }
            });
        }); });
        this.loadPlugins();
    };
    /**
     * Open the node and all its child objects,
     * wait for the database to load.
     * @alias FullNode#open
     * @returns {Promise}
     */
    FullNode.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(!this.opened, 'FullNode is already open.');
                        this.opened = true;
                        return [4 /*yield*/, this.handlePreopen()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.blocks.open()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.chain.open()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.mempool.open()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.miner.open()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.pool.open()];
                    case 6:
                        _a.sent();
                        if (!this.txindex) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.txindex.open()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!this.addrindex) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.addrindex.open()];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        if (!this.filterindex) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.filterindex.open()];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [4 /*yield*/, this.openPlugins()];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, this.http.open()];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, this.handleOpen()];
                    case 15:
                        _a.sent();
                        this.logger.info('Node is loaded.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the node, wait for the database to close.
     * @alias FullNode#close
     * @returns {Promise}
     */
    FullNode.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.opened, 'FullNode is not open.');
                        this.opened = false;
                        return [4 /*yield*/, this.handlePreclose()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.http.close()];
                    case 2:
                        _a.sent();
                        if (!this.txindex) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.txindex.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!this.addrindex) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.addrindex.close()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!this.filterindex) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.filterindex.close()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, this.closePlugins()];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.pool.close()];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.miner.close()];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, this.mempool.close()];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this.chain.close()];
                    case 13:
                        _a.sent();
                        return [4 /*yield*/, this.blocks.close()];
                    case 14:
                        _a.sent();
                        return [4 /*yield*/, this.handleClose()];
                    case 15:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rescan for any missed transactions.
     * @param {Number|Hash} start - Start block.
     * @param {Bloom} filter
     * @param {Function} iter - Iterator.
     * @returns {Promise}
     */
    FullNode.prototype.scan = function (start, filter, iter) {
        return this.chain.scan(start, filter, iter);
    };
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX|Block} item
     * @returns {Promise}
     */
    FullNode.prototype.broadcast = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.broadcast(item)];
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
        });
    };
    /**
     * Add transaction to mempool, broadcast.
     * @param {TX} tx
     * @returns {Promise}
     */
    FullNode.prototype.sendTX = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var missing, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mempool.addTX(tx)];
                    case 1:
                        missing = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        if (err_1.type === 'VerifyError' && err_1.score === 0) {
                            this.error(err_1);
                            this.logger.warning('Verification failed for tx: %h.', tx.hash());
                            this.logger.warning('Attempting to broadcast anyway...');
                            this.broadcast(tx);
                            return [2 /*return*/];
                        }
                        throw err_1;
                    case 3:
                        if (missing) {
                            this.logger.warning('TX was orphaned in mempool: %h.', tx.hash());
                            this.logger.warning('Attempting to broadcast anyway...');
                            this.broadcast(tx);
                            return [2 /*return*/];
                        }
                        // We need to announce by hand if
                        // we're running in selfish mode.
                        if (this.pool.options.selfish)
                            this.broadcast(tx);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Add transaction to mempool, broadcast. Silence errors.
     * @param {TX} tx
     * @returns {Promise}
     */
    FullNode.prototype.relay = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sendTX(tx)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_6 = _a.sent();
                        this.error(e_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Connect to the network.
     * @returns {Promise}
     */
    FullNode.prototype.connect = function () {
        return this.pool.connect();
    };
    /**
     * Disconnect from the network.
     * @returns {Promise}
     */
    FullNode.prototype.disconnect = function () {
        return this.pool.disconnect();
    };
    /**
     * Start the blockchain sync.
     */
    FullNode.prototype.startSync = function () {
        if (this.txindex)
            this.txindex.sync();
        if (this.addrindex)
            this.addrindex.sync();
        if (this.filterindex)
            this.filterindex.sync();
        return this.pool.startSync();
    };
    /**
     * Stop syncing the blockchain.
     */
    FullNode.prototype.stopSync = function () {
        return this.pool.stopSync();
    };
    /**
     * Retrieve a block from the chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    FullNode.prototype.getBlock = function (hash) {
        return this.chain.getBlock(hash);
    };
    /**
     * Retrieve a coin from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    FullNode.prototype.getCoin = function (hash, index) {
        return __awaiter(this, void 0, void 0, function () {
            var coin;
            return __generator(this, function (_a) {
                coin = this.mempool.getCoin(hash, index);
                if (coin)
                    return [2 /*return*/, coin];
                if (this.mempool.isSpent(hash, index))
                    return [2 /*return*/, null];
                return [2 /*return*/, this.chain.getCoin(hash, index)];
            });
        });
    };
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {Promise} - Returns {@link TXMeta}[].
     */
    FullNode.prototype.getMetaByAddress = function (addr, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var reverse, after, limit, metas, confirmed, unconfirmed;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.txindex || !this.addrindex)
                            return [2 /*return*/, []];
                        reverse = options.reverse, after = options.after;
                        limit = options.limit;
                        metas = [];
                        confirmed = function () { return __awaiter(_this, void 0, void 0, function () {
                            var hashes, _i, hashes_1, hash, mtx;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.addrindex.getHashesByAddress(addr, { limit: limit, reverse: reverse, after: after })];
                                    case 1:
                                        hashes = _a.sent();
                                        _i = 0, hashes_1 = hashes;
                                        _a.label = 2;
                                    case 2:
                                        if (!(_i < hashes_1.length)) return [3 /*break*/, 5];
                                        hash = hashes_1[_i];
                                        return [4 /*yield*/, this.txindex.getMeta(hash)];
                                    case 3:
                                        mtx = _a.sent();
                                        assert(mtx);
                                        metas.push(mtx);
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); };
                        unconfirmed = function () {
                            var mempool = _this.mempool.getMetaByAddress(addr, { limit: limit, reverse: reverse, after: after });
                            metas = metas.concat(mempool);
                        };
                        if (!reverse) return [3 /*break*/, 1];
                        unconfirmed();
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, confirmed()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (metas.length > 0)
                            limit -= metas.length;
                        if (limit <= 0)
                            return [2 /*return*/, metas];
                        if (!reverse) return [3 /*break*/, 5];
                        return [4 /*yield*/, confirmed()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        unconfirmed();
                        _a.label = 6;
                    case 6: return [2 /*return*/, metas];
                }
            });
        });
    };
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXMeta}.
     */
    FullNode.prototype.getMeta = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var meta;
            return __generator(this, function (_a) {
                meta = this.mempool.getMeta(hash);
                if (meta)
                    return [2 /*return*/, meta];
                if (this.txindex)
                    return [2 /*return*/, this.txindex.getMeta(hash)];
                return [2 /*return*/, null];
            });
        });
    };
    /**
     * Retrieve a spent coin viewpoint from mempool or chain database.
     * @param {TXMeta} meta
     * @returns {Promise} - Returns {@link CoinView}.
     */
    FullNode.prototype.getMetaView = function (meta) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (meta.height === -1)
                    return [2 /*return*/, this.mempool.getSpentView(meta.tx)];
                if (this.txindex)
                    return [2 /*return*/, this.txindex.getSpentView(meta.tx)];
                return [2 /*return*/, null];
            });
        });
    };
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     * @returns {Promise} - Returns {@link TX}[].
     */
    FullNode.prototype.getTXByAddress = function (addr, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var mtxs, out, _i, mtxs_1, mtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMetaByAddress(addr, options)];
                    case 1:
                        mtxs = _a.sent();
                        out = [];
                        for (_i = 0, mtxs_1 = mtxs; _i < mtxs_1.length; _i++) {
                            mtx = mtxs_1[_i];
                            out.push(mtx.tx);
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    FullNode.prototype.getTX = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var mtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMeta(hash)];
                    case 1:
                        mtx = _a.sent();
                        if (!mtx)
                            return [2 /*return*/, null];
                        return [2 /*return*/, mtx.tx];
                }
            });
        });
    };
    /**
     * Test whether the mempool or chain contains a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    FullNode.prototype.hasTX = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.mempool.hasEntry(hash))
                    return [2 /*return*/, true];
                if (this.txindex)
                    return [2 /*return*/, this.txindex.hasTX(hash)];
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * Retrieve compact filter by hash.
     * @param {Hash | Number} hash
     * @returns {Promise} - Returns {@link Buffer}.
     */
    FullNode.prototype.getBlockFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.filterindex)
                            return [2 /*return*/, null];
                        if (!(typeof hash === 'number')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.getHash(hash)];
                    case 1:
                        hash = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!hash)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.filterindex.getFilter(hash)];
                }
            });
        });
    };
    return FullNode;
}(Node));
/*
 * Expose
 */
module.exports = FullNode;
