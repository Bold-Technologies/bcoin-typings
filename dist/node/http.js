/*!
 * server.js - http server for bcoin
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
var Server = require('bweb').Server;
var Validator = require('bval');
var base58 = require('bcrypto/lib/encoding/base58');
var BloomFilter = require('bfilter').BloomFilter;
var sha256 = require('bcrypto/lib/sha256');
var random = require('bcrypto/lib/random');
var safeEqual = require('bcrypto/lib/safe').safeEqual;
var util = require('../utils/util');
var Address = require('../primitives/address');
var TX = require('../primitives/tx');
var Outpoint = require('../primitives/outpoint');
var Network = require('../protocol/network');
var pkg = require('../pkg');
/**
 * HTTP
 * @alias module:http.Server
 */
var HTTP = /** @class */ (function (_super) {
    __extends(HTTP, _super);
    /**
     * Create an http server.
     * @constructor
     * @param {Object} options
     */
    function HTTP(options) {
        var _this = _super.call(this, new HTTPOptions(options)) || this;
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('node-http');
        _this.node = _this.options.node;
        _this.chain = _this.node.chain;
        _this.mempool = _this.node.mempool;
        _this.pool = _this.node.pool;
        _this.fees = _this.node.fees;
        _this.miner = _this.node.miner;
        _this.rpc = _this.node.rpc;
        _this.init();
        return _this;
    }
    /**
     * Initialize routes.
     * @private
     */
    HTTP.prototype.init = function () {
        var _this = this;
        this.on('request', function (req, res) {
            if (req.method === 'POST' && req.pathname === '/')
                return;
            _this.logger.debug('Request for method=%s path=%s (%s).', req.method, req.pathname, req.socket.remoteAddress);
        });
        this.on('listening', function (address) {
            _this.logger.info('Node HTTP server listening on %s (port=%d).', address.address, address.port);
        });
        this.initRouter();
        this.initSockets();
    };
    /**
     * Initialize routes.
     * @private
     */
    HTTP.prototype.initRouter = function () {
        var _this = this;
        if (this.options.cors)
            this.use(this.cors());
        if (!this.options.noAuth) {
            this.use(this.basicAuth({
                hash: sha256.digest,
                password: this.options.apiKey,
                realm: 'node'
            }));
        }
        this.use(this.bodyParser({
            type: 'json'
        }));
        this.use(this.jsonRPC());
        this.use(this.router());
        this.error(function (err, req, res) {
            var code = err.statusCode || 500;
            res.json(code, {
                error: {
                    type: err.type,
                    code: err.code,
                    message: err.message
                }
            });
        });
        this.get('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var totalTX, size, orphans, addr;
            return __generator(this, function (_a) {
                totalTX = this.mempool ? this.mempool.map.size : 0;
                size = this.mempool ? this.mempool.getSize() : 0;
                orphans = this.mempool ? this.mempool.orphans.size : 0;
                addr = this.pool.hosts.getLocal();
                if (!addr)
                    addr = this.pool.hosts.address;
                res.json(200, {
                    version: pkg.version,
                    network: this.network.type,
                    chain: {
                        height: this.chain.height,
                        tip: this.chain.tip.rhash(),
                        progress: this.chain.getProgress()
                    },
                    indexes: {
                        addr: {
                            enabled: Boolean(this.node.addrindex),
                            height: this.node.addrindex ? this.node.addrindex.height : 0
                        },
                        tx: {
                            enabled: Boolean(this.node.txindex),
                            height: this.node.txindex ? this.node.txindex.height : 0
                        },
                        filter: {
                            enabled: Boolean(this.node.filterindex),
                            height: this.node.filterindex ? this.node.filterindex.height : 0
                        }
                    },
                    pool: {
                        host: addr.host,
                        port: addr.port,
                        agent: this.pool.options.agent,
                        services: this.pool.options.services.toString(2),
                        outbound: this.pool.peers.outbound,
                        inbound: this.pool.peers.inbound
                    },
                    mempool: {
                        tx: totalTX,
                        size: size,
                        orphans: orphans
                    },
                    time: {
                        uptime: this.node.uptime(),
                        system: util.now(),
                        adjusted: this.network.now(),
                        offset: this.network.time.offset
                    },
                    memory: this.logger.memoryUsage()
                });
                return [2 /*return*/];
            });
        }); });
        // UTXO by id
        this.get('/coin/:hash/:index', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, index, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.brhash('hash');
                        index = valid.u32('index');
                        enforce(hash, 'Hash is required.');
                        enforce(index != null, 'Index is required.');
                        enforce(!this.chain.options.spv, 'Cannot get coins in SPV mode.');
                        return [4 /*yield*/, this.node.getCoin(hash, index)];
                    case 1:
                        coin = _a.sent();
                        if (!coin) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, coin.getJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // TX by hash
        this.get('/tx/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, meta, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.brhash('hash');
                        enforce(hash, 'Hash is required.');
                        enforce(!this.chain.options.spv, 'Cannot get TX in SPV mode.');
                        return [4 /*yield*/, this.node.getMeta(hash)];
                    case 1:
                        meta = _a.sent();
                        if (!meta) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.node.getMetaView(meta)];
                    case 2:
                        view = _a.sent();
                        res.json(200, meta.getJSON(this.network, view, this.chain.height));
                        return [2 /*return*/];
                }
            });
        }); });
        // TX by address
        this.get('/tx/address/:address', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, address, limit, reverse, after, addr, metas, result, _i, metas_1, meta, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        address = valid.str('address');
                        limit = valid.uint('limit', this.options.maxTxs);
                        reverse = valid.bool('reverse', false);
                        after = valid.brhash('after', null);
                        enforce(address, 'Address is required.');
                        enforce(!this.chain.options.spv, 'Cannot get TX in SPV mode.');
                        enforce(limit <= this.options.maxTxs, "Limit above max of ".concat(this.options.maxTxs, "."));
                        addr = Address.fromString(address, this.network);
                        return [4 /*yield*/, this.node.getMetaByAddress(addr, { limit: limit, reverse: reverse, after: after })];
                    case 1:
                        metas = _a.sent();
                        result = [];
                        _i = 0, metas_1 = metas;
                        _a.label = 2;
                    case 2:
                        if (!(_i < metas_1.length)) return [3 /*break*/, 5];
                        meta = metas_1[_i];
                        return [4 /*yield*/, this.node.getMetaView(meta)];
                    case 3:
                        view = _a.sent();
                        result.push(meta.getJSON(this.network, view, this.chain.height));
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Block by hash/height
        this.get('/block/:block', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, block, view, height, depth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.uintbrhash('block');
                        enforce(hash != null, 'Hash or height required.');
                        enforce(!this.chain.options.spv, 'Cannot get block in SPV mode.');
                        return [4 /*yield*/, this.chain.getBlock(hash)];
                    case 1:
                        block = _a.sent();
                        if (!block) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.chain.getBlockView(block)];
                    case 2:
                        view = _a.sent();
                        if (!view) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.chain.getHeight(hash)];
                    case 3:
                        height = _a.sent();
                        depth = this.chain.height - height + 1;
                        res.json(200, block.getJSON(this.network, view, height, depth));
                        return [2 /*return*/];
                }
            });
        }); });
        // Block Header by hash/height
        this.get('/header/:block', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.uintbrhash('block');
                        enforce(hash != null, 'Hash or height required.');
                        return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, entry.toJSON());
                        return [2 /*return*/];
                }
            });
        }); });
        // Filters by hash/height
        this.get('/filter/:block', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.uintbrhash('block');
                        enforce(hash != null, 'Hash or height required.');
                        return [4 /*yield*/, this.node.getBlockFilter(hash)];
                    case 1:
                        filter = _a.sent();
                        if (!filter) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, filter.toJSON());
                        return [2 /*return*/];
                }
            });
        }); });
        // Mempool snapshot
        this.get('/mempool', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var hashes, result, _i, hashes_1, hash;
            return __generator(this, function (_a) {
                enforce(this.mempool, 'No mempool available.');
                hashes = this.mempool.getSnapshot();
                result = [];
                for (_i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
                    hash = hashes_1[_i];
                    result.push(util.revHex(hash));
                }
                res.json(200, result);
                return [2 /*return*/];
            });
        }); });
        // Broadcast TX
        this.post('/broadcast', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, raw, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        raw = valid.buf('tx');
                        enforce(raw, 'TX is required.');
                        tx = TX.fromRaw(raw);
                        return [4 /*yield*/, this.node.sendTX(tx)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Estimate fee
        this.get('/fee', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, blocks, fee;
            return __generator(this, function (_a) {
                valid = Validator.fromRequest(req);
                blocks = valid.u32('blocks', 1);
                if (!this.fees) {
                    res.json(200, { rate: this.network.feeRate });
                    return [2 /*return*/];
                }
                fee = this.fees.estimateFee(blocks);
                res.json(200, { rate: fee });
                return [2 /*return*/];
            });
        }); });
        // Reset chain
        this.post('/reset', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        height = valid.u32('height');
                        enforce(height != null, 'Height is required.');
                        enforce(height <= this.chain.height, 'Height cannot be greater than chain tip.');
                        return [4 /*yield*/, this.chain.reset(height)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Handle new websocket.
     * @private
     * @param {WebSocket} socket
     */
    HTTP.prototype.handleSocket = function (socket) {
        var _this = this;
        socket.hook('auth', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (socket.channel('auth'))
                throw new Error('Already authed.');
            if (!_this.options.noAuth) {
                var valid = new Validator(args);
                var key = valid.str(0, '');
                if (key.length > 255)
                    throw new Error('Invalid API key.');
                var data = Buffer.from(key, 'ascii');
                var hash = sha256.digest(data);
                if (!safeEqual(hash, _this.options.apiHash))
                    throw new Error('Invalid API key.');
            }
            socket.join('auth');
            _this.logger.info('Successful auth from %s.', socket.host);
            _this.handleAuth(socket);
            return null;
        });
        socket.fire('version', {
            version: pkg.version,
            network: this.network.type
        });
    };
    /**
     * Handle new auth'd websocket.
     * @private
     * @param {WebSocket} socket
     */
    HTTP.prototype.handleAuth = function (socket) {
        var _this = this;
        socket.hook('watch chain', function () {
            socket.join('chain');
            return null;
        });
        socket.hook('unwatch chain', function () {
            socket.leave('chain');
            return null;
        });
        socket.hook('watch mempool', function () {
            socket.join('mempool');
            return null;
        });
        socket.hook('unwatch mempool', function () {
            socket.leave('mempool');
            return null;
        });
        socket.hook('set filter', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var data = valid.buf(0);
            if (!data)
                throw new Error('Invalid parameter.');
            socket.filter = BloomFilter.fromRaw(data);
            return null;
        });
        socket.hook('get tip', function () {
            return _this.chain.tip.toRaw();
        });
        socket.hook('get entry', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var valid, block, entry;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            valid = new Validator(args);
                            block = valid.uintbrhash(0);
                            if (block == null)
                                throw new Error('Invalid parameter.');
                            return [4 /*yield*/, this.chain.getEntry(block)];
                        case 1:
                            entry = _a.sent();
                            if (!entry)
                                return [2 /*return*/, null];
                            return [4 /*yield*/, this.chain.isMainChain(entry)];
                        case 2:
                            if (!(_a.sent()))
                                return [2 /*return*/, null];
                            return [2 /*return*/, entry.toRaw()];
                    }
                });
            });
        });
        socket.hook('get hashes', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var valid, start, end;
                return __generator(this, function (_a) {
                    valid = new Validator(args);
                    start = valid.i32(0, -1);
                    end = valid.i32(1, -1);
                    return [2 /*return*/, this.chain.getHashes(start, end)];
                });
            });
        });
        socket.hook('add filter', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var chunks = valid.array(0);
            if (!chunks)
                throw new Error('Invalid parameter.');
            if (!socket.filter)
                throw new Error('No filter set.');
            var items = new Validator(chunks);
            for (var i = 0; i < chunks.length; i++) {
                var data = items.buf(i);
                if (!data)
                    throw new Error('Bad data chunk.');
                socket.filter.add(data);
                if (_this.node.spv)
                    _this.pool.watch(data);
            }
            return null;
        });
        socket.hook('reset filter', function () {
            socket.filter = null;
            return null;
        });
        socket.hook('estimate fee', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var blocks = valid.u32(0);
            if (!_this.fees)
                return _this.network.feeRate;
            return _this.fees.estimateFee(blocks);
        });
        socket.hook('send', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var data = valid.buf(0);
            if (!data)
                throw new Error('Invalid parameter.');
            var tx = TX.fromRaw(data);
            _this.node.relay(tx);
            return null;
        });
        socket.hook('rescan', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var start = valid.uintbrhash(0);
            if (start == null)
                throw new Error('Invalid parameter.');
            return _this.scan(socket, start);
        });
    };
    /**
     * Bind to chain events.
     * @private
     */
    HTTP.prototype.initSockets = function () {
        var _this = this;
        var pool = this.mempool || this.pool;
        this.chain.on('connect', function (entry, block, view) {
            var sockets = _this.channel('chain');
            if (!sockets)
                return;
            var raw = entry.toRaw();
            _this.to('chain', 'chain connect', raw);
            for (var _i = 0, sockets_1 = sockets; _i < sockets_1.length; _i++) {
                var socket = sockets_1[_i];
                var txs = _this.filterBlock(socket, block);
                socket.fire('block connect', raw, txs);
            }
        });
        this.chain.on('disconnect', function (entry, block, view) {
            var sockets = _this.channel('chain');
            if (!sockets)
                return;
            var raw = entry.toRaw();
            _this.to('chain', 'chain disconnect', raw);
            _this.to('chain', 'block disconnect', raw);
        });
        this.chain.on('reset', function (tip) {
            var sockets = _this.channel('chain');
            if (!sockets)
                return;
            _this.to('chain', 'chain reset', tip.toRaw());
        });
        pool.on('tx', function (tx) {
            var sockets = _this.channel('mempool');
            if (!sockets)
                return;
            var raw = tx.toRaw();
            for (var _i = 0, sockets_2 = sockets; _i < sockets_2.length; _i++) {
                var socket = sockets_2[_i];
                if (!_this.filterTX(socket, tx))
                    continue;
                socket.fire('tx', raw);
            }
        });
    };
    /**
     * Filter block by socket.
     * @private
     * @param {WebSocket} socket
     * @param {Block} block
     * @returns {TX[]}
     */
    HTTP.prototype.filterBlock = function (socket, block) {
        if (!socket.filter)
            return [];
        var txs = [];
        for (var _i = 0, _a = block.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            if (this.filterTX(socket, tx))
                txs.push(tx.toRaw());
        }
        return txs;
    };
    /**
     * Filter transaction by socket.
     * @private
     * @param {WebSocket} socket
     * @param {TX} tx
     * @returns {Boolean}
     */
    HTTP.prototype.filterTX = function (socket, tx) {
        if (!socket.filter)
            return false;
        var found = false;
        for (var i = 0; i < tx.outputs.length; i++) {
            var output = tx.outputs[i];
            var hash = output.getHash();
            if (!hash)
                continue;
            if (socket.filter.test(hash)) {
                var prevout = Outpoint.fromTX(tx, i);
                socket.filter.add(prevout.toRaw());
                found = true;
            }
        }
        if (found)
            return true;
        if (!tx.isCoinbase()) {
            for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
                var prevout = _a[_i].prevout;
                if (socket.filter.test(prevout.toRaw()))
                    return true;
            }
        }
        return false;
    };
    /**
     * Scan using a socket's filter.
     * @private
     * @param {WebSocket} socket
     * @param {Hash} start
     * @returns {Promise}
     */
    HTTP.prototype.scan = function (socket, start) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!socket.filter)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.node.scan(start, socket.filter, function (entry, txs) {
                                var block = entry.toRaw();
                                var raw = [];
                                for (var _i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
                                    var tx = txs_1[_i];
                                    raw.push(tx.toRaw());
                                }
                                return socket.call('block rescan', block, raw);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    return HTTP;
}(Server));
var HTTPOptions = /** @class */ (function () {
    /**
     * HTTPOptions
     * @alias module:http.HTTPOptions
     * @constructor
     * @param {Object} options
     */
    function HTTPOptions(options) {
        this.network = Network.primary;
        this.logger = null;
        this.node = null;
        this.apiKey = base58.encode(random.randomBytes(20));
        this.apiHash = sha256.digest(Buffer.from(this.apiKey, 'ascii'));
        this.noAuth = false;
        this.cors = false;
        this.maxTxs = 100;
        this.prefix = null;
        this.host = '127.0.0.1';
        this.port = 8080;
        this.ssl = false;
        this.keyFile = null;
        this.certFile = null;
        this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {HTTPOptions}
     */
    HTTPOptions.prototype.fromOptions = function (options) {
        assert(options);
        assert(options.node && typeof options.node === 'object', 'HTTP Server requires a Node.');
        this.node = options.node;
        this.network = options.node.network;
        this.logger = options.node.logger;
        this.port = this.network.rpcPort;
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.apiKey != null) {
            assert(typeof options.apiKey === 'string', 'API key must be a string.');
            assert(options.apiKey.length <= 255, 'API key must be under 256 bytes.');
            this.apiKey = options.apiKey;
            this.apiHash = sha256.digest(Buffer.from(this.apiKey, 'ascii'));
        }
        if (options.noAuth != null) {
            assert(typeof options.noAuth === 'boolean');
            this.noAuth = options.noAuth;
        }
        if (options.cors != null) {
            assert(typeof options.cors === 'boolean');
            this.cors = options.cors;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.keyFile = path.join(this.prefix, 'key.pem');
            this.certFile = path.join(this.prefix, 'cert.pem');
        }
        if (options.host != null) {
            assert(typeof options.host === 'string');
            this.host = options.host;
        }
        if (options.port != null) {
            assert((options.port & 0xffff) === options.port, 'Port must be a number.');
            this.port = options.port;
        }
        if (options.ssl != null) {
            assert(typeof options.ssl === 'boolean');
            this.ssl = options.ssl;
        }
        if (options.keyFile != null) {
            assert(typeof options.keyFile === 'string');
            this.keyFile = options.keyFile;
        }
        if (options.certFile != null) {
            assert(typeof options.certFile === 'string');
            this.certFile = options.certFile;
        }
        if (options.maxTxs != null) {
            assert(Number.isSafeInteger(options.maxTxs));
            this.maxTxs = options.maxTxs;
        }
        // Allow no-auth implicitly
        // if we're listening locally.
        if (!options.apiKey) {
            if (this.host === '127.0.0.1' || this.host === '::1')
                this.noAuth = true;
        }
        return this;
    };
    /**
     * Instantiate http options from object.
     * @param {Object} options
     * @returns {HTTPOptions}
     */
    HTTPOptions.fromOptions = function (options) {
        return new HTTPOptions().fromOptions(options);
    };
    return HTTPOptions;
}());
/*
 * Helpers
 */
function enforce(value, msg) {
    if (!value) {
        var err = new Error(msg);
        err.statusCode = 400;
        throw err;
    }
}
/*
 * Expose
 */
module.exports = HTTP;
