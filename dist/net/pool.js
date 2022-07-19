/*!
 * pool.js - peer management for bcoin
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
var EventEmitter = require('events');
var Lock = require('bmutex').Lock;
var IP = require('binet');
var dns = require('bdns');
var tcp = require('btcp');
var UPNP = require('bupnp');
var socks = require('bsocks');
var List = require('blst');
var _a = require('bfilter'), BloomFilter = _a.BloomFilter, RollingFilter = _a.RollingFilter;
var _b = require('buffer-map'), BufferMap = _b.BufferMap, BufferSet = _b.BufferSet;
var util = require('../utils/util');
var common = require('./common');
var chainCommon = require('../blockchain/common');
var Address = require('../primitives/address');
var BIP152 = require('./bip152');
var Network = require('../protocol/network');
var Peer = require('./peer');
var HostList = require('./hostlist');
var InvItem = require('../primitives/invitem');
var packets = require('./packets');
var services = common.services;
var invTypes = InvItem.types;
var packetTypes = packets.types;
var scores = HostList.scores;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Pool
 * A pool of peers for handling all network activity.
 * @alias module:net.Pool
 * @extends EventEmitter
 */
var Pool = /** @class */ (function (_super) {
    __extends(Pool, _super);
    /**
     * Create a pool.
     * @constructor
     * @param {Object} options
     */
    function Pool(options) {
        var _this = _super.call(this) || this;
        _this.opened = false;
        _this.options = new PoolOptions(options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('net');
        _this.chain = _this.options.chain;
        _this.mempool = _this.options.mempool;
        _this.server = _this.options.createServer();
        _this.nonces = _this.options.nonces;
        _this.locker = new Lock(true, BufferMap);
        _this.connected = false;
        _this.disconnecting = false;
        _this.syncing = false;
        _this.discovering = false;
        _this.spvFilter = null;
        _this.txFilter = null;
        _this.blockMap = new BufferSet();
        _this.txMap = new BufferSet();
        _this.compactBlocks = new BufferSet();
        _this.invMap = new BufferMap();
        _this.pendingFilter = null;
        _this.pendingRefill = null;
        _this.checkpoints = false;
        _this.headerChain = new List();
        _this.headerNext = null;
        _this.headerTip = null;
        _this.peers = new PeerList();
        _this.hosts = new HostList(_this.options);
        _this.id = 0;
        if (_this.options.spv) {
            _this.spvFilter = BloomFilter.fromRate(20000, 0.001, BloomFilter.flags.ALL);
        }
        if (!_this.options.mempool)
            _this.txFilter = new RollingFilter(50000, 0.000001);
        _this.init();
        return _this;
    }
    /**
     * Initialize the pool.
     * @private
     */
    Pool.prototype.init = function () {
        var _this = this;
        this.server.on('error', function (err) {
            _this.emit('error', err);
        });
        this.server.on('connection', function (socket) {
            _this.handleSocket(socket);
            _this.emit('connection', socket);
        });
        this.server.on('listening', function () {
            var data = _this.server.address();
            _this.logger.info('Pool server listening on %s (port=%d).', data.address, data.port);
            _this.emit('listening', data);
        });
        this.chain.on('block', function (block, entry) {
            _this.emit('block', block, entry);
        });
        this.chain.on('reset', function () {
            if (_this.checkpoints)
                _this.resetChain();
            _this.forceSync();
        });
        this.chain.on('full', function () {
            _this.sync();
            _this.emit('full');
            _this.logger.info('Chain is fully synced (height=%d).', _this.chain.height);
        });
        this.chain.on('bad orphan', function (err, id) {
            _this.handleBadOrphan('block', err, id);
        });
        if (this.mempool) {
            this.mempool.on('tx', function (tx) {
                _this.emit('tx', tx);
            });
            this.mempool.on('bad orphan', function (err, id) {
                _this.handleBadOrphan('tx', err, id);
            });
        }
        if (!this.options.selfish && !this.options.spv) {
            if (this.mempool) {
                this.mempool.on('tx', function (tx) {
                    _this.announceTX(tx);
                });
            }
            // Normally we would also broadcast
            // competing chains, but we want to
            // avoid getting banned if an evil
            // miner sends us an invalid competing
            // chain that we can't connect and
            // verify yet.
            this.chain.on('block', function (block) {
                if (!_this.chain.synced)
                    return;
                _this.announceBlock(block);
            });
        }
    };
    /**
     * Open the pool, wait for the chain to load.
     * @returns {Promise}
     */
    Pool.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(!this.opened, 'Pool is already open.');
                this.opened = true;
                this.logger.info('Pool loaded (maxpeers=%d).', this.options.maxOutbound);
                this.resetChain();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close and destroy the pool.
     * @method
     * @alias Pool#close
     * @returns {Promise}
     */
    Pool.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(this.opened, 'Pool is not open.');
                this.opened = false;
                return [2 /*return*/, this.disconnect()];
            });
        });
    };
    /**
     * Reset header chain.
     */
    Pool.prototype.resetChain = function () {
        if (!this.options.checkpoints)
            return;
        this.checkpoints = false;
        this.headerTip = null;
        this.headerChain.reset();
        this.headerNext = null;
        var tip = this.chain.tip;
        if (tip.height < this.network.lastCheckpoint) {
            this.checkpoints = true;
            this.headerTip = this.getNextTip(tip.height);
            this.headerChain.push(new HeaderEntry(tip.hash, tip.height));
            this.logger.info('Initialized header chain to height %d (checkpoint=%h).', tip.height, this.headerTip.hash);
        }
    };
    /**
     * Connect to the network.
     * @method
     * @returns {Promise}
     */
    Pool.prototype.connect = function () {
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
                        return [4 /*yield*/, this._connect()];
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
     * Connect to the network (no lock).
     * @method
     * @returns {Promise}
     */
    Pool.prototype._connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.opened, 'Pool is not opened.');
                        if (this.connected)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.hosts.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.discoverGateway()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.discoverExternal()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.discoverSeeds()];
                    case 4:
                        _a.sent();
                        this.fillOutbound();
                        return [4 /*yield*/, this.listen()];
                    case 5:
                        _a.sent();
                        this.startTimer();
                        this.connected = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnect from the network.
     * @method
     * @returns {Promise}
     */
    Pool.prototype.disconnect = function () {
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
                        return [4 /*yield*/, this._disconnect()];
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
     * Disconnect from the network.
     * @method
     * @returns {Promise}
     */
    Pool.prototype._disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        for (_i = 0, _a = this.invMap.values(); _i < _a.length; _i++) {
                            item = _a[_i];
                            item.resolve();
                        }
                        if (!this.connected)
                            return [2 /*return*/];
                        this.disconnecting = true;
                        this.peers.destroy();
                        this.blockMap.clear();
                        this.txMap.clear();
                        if (this.pendingFilter != null) {
                            clearTimeout(this.pendingFilter);
                            this.pendingFilter = null;
                        }
                        if (this.pendingRefill != null) {
                            clearTimeout(this.pendingRefill);
                            this.pendingRefill = null;
                        }
                        this.checkpoints = false;
                        this.headerTip = null;
                        this.headerChain.reset();
                        this.headerNext = null;
                        this.stopTimer();
                        return [4 /*yield*/, this.hosts.close()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, this.unlisten()];
                    case 2:
                        _b.sent();
                        this.disconnecting = false;
                        this.syncing = false;
                        this.connected = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start listening on a server socket.
     * @method
     * @private
     * @returns {Promise}
     */
    Pool.prototype.listen = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.server);
                        assert(!this.connected, 'Already listening.');
                        if (!this.options.listen)
                            return [2 /*return*/];
                        this.server.maxConnections = this.options.maxInbound;
                        return [4 /*yield*/, this.server.listen(this.options.port, this.options.host)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop listening on server socket.
     * @method
     * @private
     * @returns {Promise}
     */
    Pool.prototype.unlisten = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.server);
                        assert(this.connected, 'Not listening.');
                        if (!this.options.listen)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.server.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start discovery timer.
     * @private
     */
    Pool.prototype.startTimer = function () {
        var _this = this;
        assert(this.timer == null, 'Timer already started.');
        this.timer = setInterval(function () { return _this.discover(); }, Pool.DISCOVERY_INTERVAL);
    };
    /**
     * Stop discovery timer.
     * @private
     */
    Pool.prototype.stopTimer = function () {
        assert(this.timer != null, 'Timer already stopped.');
        clearInterval(this.timer);
        this.timer = null;
    };
    /**
     * Rediscover seeds and internet gateway.
     * Attempt to add port mapping once again.
     * @returns {Promise}
     */
    Pool.prototype.discover = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.discovering)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 4, 5]);
                        this.discovering = true;
                        return [4 /*yield*/, this.discoverGateway()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.discoverSeeds(true)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        this.discovering = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Attempt to add port mapping (i.e.
     * remote:8333->local:8333) via UPNP.
     * @returns {Promise}
     */
    Pool.prototype.discoverGateway = function () {
        return __awaiter(this, void 0, void 0, function () {
            var src, dest, wan, e_1, host, e_2, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        src = this.options.publicPort;
                        dest = this.options.port;
                        // Pointless if we're not listening.
                        if (!this.options.listen)
                            return [2 /*return*/, false];
                        // UPNP is always optional, since
                        // it's likely to not work anyway.
                        if (!this.options.upnp)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.logger.debug('Discovering internet gateway (upnp).');
                        return [4 /*yield*/, UPNP.discover()];
                    case 2:
                        wan = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.logger.debug('Could not discover internet gateway (upnp).');
                        this.logger.debug(e_1);
                        return [2 /*return*/, false];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, wan.getExternalIP()];
                    case 5:
                        host = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        this.logger.debug('Could not find external IP (upnp).');
                        this.logger.debug(e_2);
                        return [2 /*return*/, false];
                    case 7:
                        if (this.hosts.addLocal(host, src, scores.UPNP))
                            this.logger.info('External IP found (upnp): %s.', host);
                        this.logger.debug('Adding port mapping %d->%d.', src, dest);
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, wan.addPortMapping(host, src, dest)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_3 = _a.sent();
                        this.logger.debug('Could not add port mapping (upnp).');
                        this.logger.debug(e_3);
                        return [2 /*return*/, false];
                    case 11: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Attempt to resolve DNS seeds if necessary.
     * @param {Boolean} checkPeers
     * @returns {Promise}
     */
    Pool.prototype.discoverSeeds = function (checkPeers) {
        return __awaiter(this, void 0, void 0, function () {
            var max, size, total, peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.options.discover)
                            return [2 /*return*/];
                        if (this.hosts.dnsSeeds.length === 0)
                            return [2 /*return*/];
                        max = Math.min(2, this.options.maxOutbound);
                        size = this.hosts.size();
                        total = 0;
                        for (peer = this.peers.head(); peer; peer = peer.next) {
                            if (!peer.outbound)
                                continue;
                            if (peer.connected) {
                                if (++total > max)
                                    break;
                            }
                        }
                        if (!(size === 0 || (checkPeers && total < max))) return [3 /*break*/, 2];
                        this.logger.warning('Could not find enough peers.');
                        this.logger.warning('Hitting DNS seeds...');
                        return [4 /*yield*/, this.hosts.discoverSeeds()];
                    case 1:
                        _a.sent();
                        this.logger.info('Resolved %d hosts from DNS seeds.', this.hosts.size() - size);
                        this.refill();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Attempt to discover external IP via DNS.
     * @returns {Promise}
     */
    Pool.prototype.discoverExternal = function () {
        return __awaiter(this, void 0, void 0, function () {
            var port, host4, e_4, host6, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        port = this.options.publicPort;
                        // Pointless if we're not listening.
                        if (!this.options.listen)
                            return [2 /*return*/];
                        // Never hit a DNS server if
                        // we're using an outbound proxy.
                        if (this.options.proxy)
                            return [2 /*return*/];
                        // Try not to hit this if we can avoid it.
                        if (this.hosts.local.size > 0)
                            return [2 /*return*/];
                        host4 = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, dns.getIPv4(2000)];
                    case 2:
                        host4 = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        this.logger.debug('Could not find external IPv4 (dns).');
                        this.logger.debug(e_4);
                        return [3 /*break*/, 4];
                    case 4:
                        if (host4 && this.hosts.addLocal(host4, port, scores.DNS))
                            this.logger.info('External IPv4 found (dns): %s.', host4);
                        host6 = null;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, dns.getIPv6(2000)];
                    case 6:
                        host6 = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_5 = _a.sent();
                        this.logger.debug('Could not find external IPv6 (dns).');
                        this.logger.debug(e_5);
                        return [3 /*break*/, 8];
                    case 8:
                        if (host6 && this.hosts.addLocal(host6, port, scores.DNS))
                            this.logger.info('External IPv6 found (dns): %s.', host6);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming connection.
     * @private
     * @param {net.Socket} socket
     */
    Pool.prototype.handleSocket = function (socket) {
        if (!socket.remoteAddress) {
            this.logger.debug('Ignoring disconnected peer.');
            socket.destroy();
            return;
        }
        var ip = IP.normalize(socket.remoteAddress);
        if (this.peers.inbound >= this.options.maxInbound) {
            this.logger.debug('Ignoring peer: too many inbound (%s).', ip);
            socket.destroy();
            return;
        }
        if (this.hosts.isBanned(ip)) {
            this.logger.debug('Ignoring banned peer (%s).', ip);
            socket.destroy();
            return;
        }
        var host = IP.toHostname(ip, socket.remotePort);
        assert(!this.peers.map.has(host), 'Port collision.');
        this.addInbound(socket);
    };
    /**
     * Add a loader peer. Necessary for
     * a sync to even begin.
     * @private
     */
    Pool.prototype.addLoader = function () {
        if (!this.opened)
            return;
        assert(!this.peers.load);
        for (var peer_1 = this.peers.head(); peer_1; peer_1 = peer_1.next) {
            if (!peer_1.outbound)
                continue;
            this.logger.info('Repurposing peer for loader (%s).', peer_1.hostname());
            this.setLoader(peer_1);
            return;
        }
        var addr = this.getHost();
        if (!addr)
            return;
        var peer = this.createOutbound(addr);
        this.logger.info('Adding loader peer (%s).', peer.hostname());
        this.peers.add(peer);
        this.setLoader(peer);
    };
    /**
     * Add a loader peer. Necessary for
     * a sync to even begin.
     * @private
     */
    Pool.prototype.setLoader = function (peer) {
        if (!this.opened)
            return;
        assert(peer.outbound);
        assert(!this.peers.load);
        assert(!peer.loader);
        peer.loader = true;
        this.peers.load = peer;
        this.sendSync(peer);
        this.emit('loader', peer);
    };
    /**
     * Start the blockchain sync.
     */
    Pool.prototype.startSync = function () {
        if (!this.opened || !this.connected)
            return;
        this.syncing = true;
        this.resync(false);
    };
    /**
     * Force sending of a sync to each peer.
     */
    Pool.prototype.forceSync = function () {
        if (!this.opened || !this.connected)
            return;
        this.resync(true);
    };
    /**
     * Send a sync to each peer.
     */
    Pool.prototype.sync = function (force) {
        this.resync(false);
    };
    /**
     * Stop the sync.
     * @private
     */
    Pool.prototype.stopSync = function () {
        if (!this.syncing)
            return;
        this.syncing = false;
        for (var peer = this.peers.head(); peer; peer = peer.next) {
            if (!peer.outbound)
                continue;
            if (!peer.syncing)
                continue;
            peer.syncing = false;
            peer.merkleBlock = null;
            peer.merkleTime = -1;
            peer.merkleMatches = 0;
            peer.merkleMap = null;
            peer.blockTime = -1;
            peer.blockMap.clear();
            peer.compactBlocks.clear();
        }
        this.blockMap.clear();
        this.compactBlocks.clear();
    };
    /**
     * Send a sync to each peer.
     * @private
     * @param {Boolean?} force
     * @returns {Promise}
     */
    Pool.prototype.resync = function (force) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, e_6, peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.syncing)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.getLocator()];
                    case 2:
                        locator = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        this.emit('error', e_6);
                        return [2 /*return*/];
                    case 4:
                        for (peer = this.peers.head(); peer; peer = peer.next) {
                            if (!peer.outbound)
                                continue;
                            if (!force && peer.syncing)
                                continue;
                            this.sendLocator(locator, peer);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test whether a peer is sync-worthy.
     * @param {Peer} peer
     * @returns {Boolean}
     */
    Pool.prototype.isSyncable = function (peer) {
        if (!this.syncing)
            return false;
        if (peer.destroyed)
            return false;
        if (!peer.handshake)
            return false;
        if (!(peer.services & services.NETWORK))
            return false;
        if (this.options.hasWitness() && !peer.hasWitness())
            return false;
        if (!peer.loader) {
            if (!this.chain.synced)
                return false;
        }
        return true;
    };
    /**
     * Start syncing from peer.
     * @method
     * @param {Peer} peer
     * @returns {Promise}
     */
    Pool.prototype.sendSync = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (peer.syncing)
                            return [2 /*return*/, false];
                        if (!this.isSyncable(peer))
                            return [2 /*return*/, false];
                        peer.syncing = true;
                        peer.blockTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.getLocator()];
                    case 2:
                        locator = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _a.sent();
                        peer.syncing = false;
                        peer.blockTime = -1;
                        this.emit('error', e_7);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/, this.sendLocator(locator, peer)];
                }
            });
        });
    };
    /**
     * Send a chain locator and start syncing from peer.
     * @method
     * @param {Hash[]} locator
     * @param {Peer} peer
     * @returns {Boolean}
     */
    Pool.prototype.sendLocator = function (locator, peer) {
        if (!this.isSyncable(peer))
            return false;
        // Ask for the mempool if we're synced.
        if (this.network.requestMempool) {
            if (peer.loader && this.chain.synced)
                peer.sendMempool();
        }
        peer.syncing = true;
        peer.blockTime = Date.now();
        if (this.checkpoints) {
            peer.sendGetHeaders(locator, this.headerTip.hash);
            return true;
        }
        peer.sendGetBlocks(locator);
        return true;
    };
    /**
     * Send `mempool` to all peers.
     */
    Pool.prototype.sendMempool = function () {
        for (var peer = this.peers.head(); peer; peer = peer.next)
            peer.sendMempool();
    };
    /**
     * Send `getaddr` to all peers.
     */
    Pool.prototype.sendGetAddr = function () {
        for (var peer = this.peers.head(); peer; peer = peer.next)
            peer.sendGetAddr();
    };
    /**
     * Request current header chain blocks.
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.resolveHeaders = function (peer) {
        var items = [];
        for (var node = this.headerNext; node; node = node.next) {
            this.headerNext = node.next;
            items.push(node.hash);
            if (items.length === common.MAX_INV)
                break;
        }
        this.getBlock(peer, items);
    };
    /**
     * Update all peer heights by their best hash.
     * @param {Hash} hash
     * @param {Number} height
     */
    Pool.prototype.resolveHeight = function (hash, height) {
        var total = 0;
        for (var peer = this.peers.head(); peer; peer = peer.next) {
            if (!peer.bestHash || !peer.bestHash.equals(hash))
                continue;
            if (peer.bestHeight !== height) {
                peer.bestHeight = height;
                total += 1;
            }
        }
        if (total > 0)
            this.logger.debug('Resolved height for %d peers.', total);
    };
    /**
     * Find the next checkpoint.
     * @private
     * @param {Number} height
     * @returns {Object}
     */
    Pool.prototype.getNextTip = function (height) {
        for (var _i = 0, _a = this.network.checkpoints; _i < _a.length; _i++) {
            var next = _a[_i];
            if (next.height > height)
                return new HeaderEntry(next.hash, next.height);
        }
        throw new Error('Next checkpoint not found.');
    };
    /**
     * Announce broadcast list to peer.
     * @param {Peer} peer
     */
    Pool.prototype.announceList = function (peer) {
        var blocks = [];
        var txs = [];
        for (var _i = 0, _a = this.invMap.values(); _i < _a.length; _i++) {
            var item = _a[_i];
            switch (item.type) {
                case invTypes.BLOCK:
                    blocks.push(item.msg);
                    break;
                case invTypes.TX:
                    txs.push(item.msg);
                    break;
                default:
                    assert(false, 'Bad item type.');
                    break;
            }
        }
        if (blocks.length > 0)
            peer.announceBlock(blocks);
        if (txs.length > 0)
            peer.announceTX(txs);
    };
    /**
     * Get a block/tx from the broadcast map.
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Promise}
     */
    Pool.prototype.getBroadcasted = function (peer, item) {
        var type = item.isTX() ? invTypes.TX : invTypes.BLOCK;
        var entry = this.invMap.get(item.hash);
        if (!entry)
            return null;
        if (type !== entry.type) {
            this.logger.debug('Peer requested item with the wrong type (%s).', peer.hostname());
            return null;
        }
        this.logger.debug('Peer requested %s %h as a %s packet (%s).', item.isTX() ? 'tx' : 'block', item.hash, item.hasWitness() ? 'witness' : 'normal', peer.hostname());
        entry.handleAck(peer);
        return entry.msg;
    };
    /**
     * Get a block/tx either from the broadcast map, mempool, or blockchain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Promise}
     */
    Pool.prototype.getItem = function (peer, item) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                entry = this.getBroadcasted(peer, item);
                if (entry)
                    return [2 /*return*/, entry];
                if (this.options.selfish)
                    return [2 /*return*/, null];
                if (item.isTX()) {
                    if (!this.mempool)
                        return [2 /*return*/, null];
                    return [2 /*return*/, this.mempool.getTX(item.hash)];
                }
                if (this.chain.options.spv)
                    return [2 /*return*/, null];
                if (this.chain.options.prune)
                    return [2 /*return*/, null];
                return [2 /*return*/, this.chain.getBlock(item.hash)];
            });
        });
    };
    /**
     * Send a block from the broadcast list or chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Boolean}
     */
    Pool.prototype.sendBlock = function (peer, item, witness) {
        return __awaiter(this, void 0, void 0, function () {
            var broadcasted, block_1, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        broadcasted = this.getBroadcasted(peer, item);
                        // Check for a broadcasted item first.
                        if (broadcasted) {
                            peer.send(new packets.BlockPacket(broadcasted, witness));
                            return [2 /*return*/, true];
                        }
                        if (this.options.selfish
                            || this.chain.options.spv
                            || this.chain.options.prune) {
                            return [2 /*return*/, false];
                        }
                        if (!(witness || !this.options.hasWitness())) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.getRawBlock(item.hash)];
                    case 1:
                        block_1 = _a.sent();
                        if (block_1) {
                            peer.sendRaw('block', block_1);
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                    case 2: return [4 /*yield*/, this.chain.getBlock(item.hash)];
                    case 3:
                        block = _a.sent();
                        if (block) {
                            peer.send(new packets.BlockPacket(block, witness));
                            return [2 /*return*/, true];
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Create an outbound peer with no special purpose.
     * @private
     * @param {NetAddress} addr
     * @returns {Peer}
     */
    Pool.prototype.createOutbound = function (addr) {
        var peer = Peer.fromOutbound(this.options, addr);
        this.hosts.markAttempt(addr.hostname);
        this.bindPeer(peer);
        this.logger.debug('Connecting to %s.', peer.hostname());
        peer.tryOpen();
        return peer;
    };
    /**
     * Accept an inbound socket.
     * @private
     * @param {net.Socket} socket
     * @returns {Peer}
     */
    Pool.prototype.createInbound = function (socket) {
        var peer = Peer.fromInbound(this.options, socket);
        this.bindPeer(peer);
        peer.tryOpen();
        return peer;
    };
    /**
     * Allocate new peer id.
     * @returns {Number}
     */
    Pool.prototype.uid = function () {
        var MAX = Number.MAX_SAFE_INTEGER;
        if (this.id >= MAX - this.peers.size() - 1)
            this.id = 0;
        // Once we overflow, there's a chance
        // of collisions. Unlikely to happen
        // unless we have tried to connect 9
        // quadrillion times, but still
        // account for it.
        do {
            this.id += 1;
        } while (this.peers.find(this.id));
        return this.id;
    };
    /**
     * Bind to peer events.
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.bindPeer = function (peer) {
        var _this = this;
        peer.id = this.uid();
        peer.onPacket = function (packet) {
            return _this.handlePacket(peer, packet);
        };
        peer.on('error', function (err) {
            _this.logger.debug(err);
        });
        peer.once('connect', function () {
            _this.handleConnect(peer);
        });
        peer.once('open', function () { return __awaiter(_this, void 0, void 0, function () {
            var e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.handleOpen(peer)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        this.emit('error', e_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        peer.once('close', function (connected) {
            _this.handleClose(peer, connected);
        });
        peer.once('ban', function () {
            _this.handleBan(peer);
        });
    };
    /**
     * Handle peer packet event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Packet} packet
     * @returns {Promise}
     */
    Pool.prototype.handlePacket = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = packet.type;
                        switch (_a) {
                            case packetTypes.VERSION: return [3 /*break*/, 1];
                            case packetTypes.VERACK: return [3 /*break*/, 3];
                            case packetTypes.PING: return [3 /*break*/, 5];
                            case packetTypes.PONG: return [3 /*break*/, 7];
                            case packetTypes.GETADDR: return [3 /*break*/, 9];
                            case packetTypes.ADDR: return [3 /*break*/, 11];
                            case packetTypes.INV: return [3 /*break*/, 13];
                            case packetTypes.GETDATA: return [3 /*break*/, 15];
                            case packetTypes.NOTFOUND: return [3 /*break*/, 17];
                            case packetTypes.GETBLOCKS: return [3 /*break*/, 19];
                            case packetTypes.GETHEADERS: return [3 /*break*/, 21];
                            case packetTypes.HEADERS: return [3 /*break*/, 23];
                            case packetTypes.SENDHEADERS: return [3 /*break*/, 25];
                            case packetTypes.BLOCK: return [3 /*break*/, 27];
                            case packetTypes.TX: return [3 /*break*/, 29];
                            case packetTypes.REJECT: return [3 /*break*/, 31];
                            case packetTypes.MEMPOOL: return [3 /*break*/, 33];
                            case packetTypes.FILTERLOAD: return [3 /*break*/, 35];
                            case packetTypes.FILTERADD: return [3 /*break*/, 37];
                            case packetTypes.FILTERCLEAR: return [3 /*break*/, 39];
                            case packetTypes.MERKLEBLOCK: return [3 /*break*/, 41];
                            case packetTypes.FEEFILTER: return [3 /*break*/, 43];
                            case packetTypes.SENDCMPCT: return [3 /*break*/, 45];
                            case packetTypes.CMPCTBLOCK: return [3 /*break*/, 47];
                            case packetTypes.GETBLOCKTXN: return [3 /*break*/, 49];
                            case packetTypes.BLOCKTXN: return [3 /*break*/, 51];
                            case packetTypes.UNKNOWN: return [3 /*break*/, 53];
                        }
                        return [3 /*break*/, 55];
                    case 1: return [4 /*yield*/, this.handleVersion(peer, packet)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 3: return [4 /*yield*/, this.handleVerack(peer, packet)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 5: return [4 /*yield*/, this.handlePing(peer, packet)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 7: return [4 /*yield*/, this.handlePong(peer, packet)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 9: return [4 /*yield*/, this.handleGetAddr(peer, packet)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 11: return [4 /*yield*/, this.handleAddr(peer, packet)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 13: return [4 /*yield*/, this.handleInv(peer, packet)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 15: return [4 /*yield*/, this.handleGetData(peer, packet)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 17: return [4 /*yield*/, this.handleNotFound(peer, packet)];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 19: return [4 /*yield*/, this.handleGetBlocks(peer, packet)];
                    case 20:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 21: return [4 /*yield*/, this.handleGetHeaders(peer, packet)];
                    case 22:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 23: return [4 /*yield*/, this.handleHeaders(peer, packet)];
                    case 24:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 25: return [4 /*yield*/, this.handleSendHeaders(peer, packet)];
                    case 26:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 27: return [4 /*yield*/, this.handleBlock(peer, packet)];
                    case 28:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 29: return [4 /*yield*/, this.handleTX(peer, packet)];
                    case 30:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 31: return [4 /*yield*/, this.handleReject(peer, packet)];
                    case 32:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 33: return [4 /*yield*/, this.handleMempool(peer, packet)];
                    case 34:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 35: return [4 /*yield*/, this.handleFilterLoad(peer, packet)];
                    case 36:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 37: return [4 /*yield*/, this.handleFilterAdd(peer, packet)];
                    case 38:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 39: return [4 /*yield*/, this.handleFilterClear(peer, packet)];
                    case 40:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 41: return [4 /*yield*/, this.handleMerkleBlock(peer, packet)];
                    case 42:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 43: return [4 /*yield*/, this.handleFeeFilter(peer, packet)];
                    case 44:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 45: return [4 /*yield*/, this.handleSendCmpct(peer, packet)];
                    case 46:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 47: return [4 /*yield*/, this.handleCmpctBlock(peer, packet)];
                    case 48:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 49: return [4 /*yield*/, this.handleGetBlockTxn(peer, packet)];
                    case 50:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 51: return [4 /*yield*/, this.handleBlockTxn(peer, packet)];
                    case 52:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 53: return [4 /*yield*/, this.handleUnknown(peer, packet)];
                    case 54:
                        _b.sent();
                        return [3 /*break*/, 56];
                    case 55:
                        assert(false, 'Bad packet type.');
                        return [3 /*break*/, 56];
                    case 56:
                        this.emit('packet', packet, peer);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle peer connect event.
     * @method
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.handleConnect = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.logger.info('Connected to %s.', peer.hostname());
                if (peer.outbound)
                    this.hosts.markSuccess(peer.hostname());
                this.emit('peer connect', peer);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle peer open event.
     * @method
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.handleOpen = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            var addr;
            return __generator(this, function (_a) {
                // Advertise our address.
                if (!this.options.selfish && this.options.listen) {
                    addr = this.hosts.getLocal(peer.address);
                    if (addr)
                        peer.send(new packets.AddrPacket([addr]));
                }
                // We want compact blocks!
                if (this.options.compact)
                    peer.sendCompact(this.options.blockMode);
                // Find some more peers.
                if (!this.hosts.isFull())
                    peer.sendGetAddr();
                // Relay our spv filter if we have one.
                if (this.spvFilter)
                    peer.sendFilterLoad(this.spvFilter);
                // Announce our currently broadcasted items.
                this.announceList(peer);
                // Set a fee rate filter.
                if (this.options.feeRate !== -1)
                    peer.sendFeeRate(this.options.feeRate);
                // Start syncing the chain.
                if (peer.outbound)
                    this.sendSync(peer);
                if (peer.outbound) {
                    this.hosts.markAck(peer.hostname(), peer.services);
                    // If we don't have an ack'd
                    // loader yet consider it dead.
                    if (!peer.loader) {
                        if (this.peers.load && !this.peers.load.handshake) {
                            assert(this.peers.load.loader);
                            this.peers.load.loader = false;
                            this.peers.load = null;
                        }
                    }
                    // If we do not have a loader,
                    // use this peer.
                    if (!this.peers.load)
                        this.setLoader(peer);
                }
                this.emit('peer open', peer);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle peer close event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Boolean} connected
     */
    Pool.prototype.handleClose = function (peer, connected) {
        return __awaiter(this, void 0, void 0, function () {
            var outbound, loader, size;
            return __generator(this, function (_a) {
                outbound = peer.outbound;
                loader = peer.loader;
                size = peer.blockMap.size;
                this.removePeer(peer);
                if (loader) {
                    this.logger.info('Removed loader peer (%s).', peer.hostname());
                    if (this.checkpoints)
                        this.resetChain();
                }
                this.nonces.remove(peer.hostname());
                this.emit('peer close', peer, connected);
                if (!this.opened)
                    return [2 /*return*/];
                if (this.disconnecting)
                    return [2 /*return*/];
                if (this.chain.synced && size > 0) {
                    this.logger.warning('Peer disconnected with requested blocks.');
                    this.logger.warning('Resending sync...');
                    this.forceSync();
                }
                if (!outbound)
                    return [2 /*return*/];
                this.refill();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle ban event.
     * @method
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.handleBan = function (peer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.ban(peer.address);
                this.emit('ban', peer);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle peer version event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {VersionPacket} packet
     */
    Pool.prototype.handleVersion = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.logger.info('Received version (%s): version=%d height=%d services=%s agent=%s', peer.hostname(), packet.version, packet.height, packet.services.toString(2), packet.agent);
                this.network.time.add(peer.hostname(), packet.time);
                this.nonces.remove(peer.hostname());
                if (!peer.outbound && packet.remote.isRoutable())
                    this.hosts.markLocal(packet.remote);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `verack` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {VerackPacket} packet
     */
    Pool.prototype.handleVerack = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `ping` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {PingPacket} packet
     */
    Pool.prototype.handlePing = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `pong` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {PongPacket} packet
     */
    Pool.prototype.handlePong = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `getaddr` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetAddrPacket} packet
     */
    Pool.prototype.handleGetAddr = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var addrs, items, _i, addrs_1, addr;
            return __generator(this, function (_a) {
                if (this.options.selfish)
                    return [2 /*return*/];
                if (peer.sentAddr) {
                    this.logger.debug('Ignoring repeated getaddr (%s).', peer.hostname());
                    return [2 /*return*/];
                }
                peer.sentAddr = true;
                addrs = this.hosts.toArray();
                items = [];
                for (_i = 0, addrs_1 = addrs; _i < addrs_1.length; _i++) {
                    addr = addrs_1[_i];
                    if (!peer.addrFilter.added(addr.hostname, 'ascii'))
                        continue;
                    items.push(addr);
                    if (items.length === 1000)
                        break;
                }
                if (items.length === 0)
                    return [2 /*return*/];
                this.logger.debug('Sending %d addrs to peer (%s)', items.length, peer.hostname());
                peer.send(new packets.AddrPacket(items));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle peer addr event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {AddrPacket} packet
     */
    Pool.prototype.handleAddr = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var addrs, now, services, _i, addrs_2, addr;
            return __generator(this, function (_a) {
                addrs = packet.items;
                now = this.network.now();
                services = this.options.getRequiredServices();
                for (_i = 0, addrs_2 = addrs; _i < addrs_2.length; _i++) {
                    addr = addrs_2[_i];
                    peer.addrFilter.add(addr.hostname, 'ascii');
                    if (!addr.isRoutable())
                        continue;
                    if (!addr.hasServices(services))
                        continue;
                    if (addr.time <= 100000000 || addr.time > now + 10 * 60)
                        addr.time = now - 5 * 24 * 60 * 60;
                    if (addr.port === 0)
                        continue;
                    this.hosts.add(addr, peer.address);
                }
                this.logger.info('Received %d addrs (hosts=%d, peers=%d) (%s).', addrs.length, this.hosts.size(), this.peers.size(), peer.hostname());
                this.fillOutbound();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `inv` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvPacket} packet
     */
    Pool.prototype.handleInv = function (peer, packet) {
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
                        return [4 /*yield*/, this._handleInv(peer, packet)];
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
     * Handle `inv` packet (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvPacket} packet
     */
    Pool.prototype._handleInv = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var items, blocks, txs, unknown, _i, items_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        items = packet.items;
                        if (items.length > common.MAX_INV) {
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        blocks = [];
                        txs = [];
                        unknown = -1;
                        for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                            item = items_1[_i];
                            switch (item.type) {
                                case invTypes.BLOCK:
                                    blocks.push(item.hash);
                                    break;
                                case invTypes.TX:
                                    txs.push(item.hash);
                                    break;
                                default:
                                    unknown = item.type;
                                    continue;
                            }
                            peer.invFilter.add(item.hash);
                        }
                        this.logger.spam('Received inv packet with %d items: blocks=%d txs=%d (%s).', items.length, blocks.length, txs.length, peer.hostname());
                        if (unknown !== -1) {
                            this.logger.warning('Peer sent an unknown inv type: %d (%s).', unknown, peer.hostname());
                        }
                        if (!(blocks.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleBlockInv(peer, blocks)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(txs.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.handleTXInv(peer, txs)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `inv` packet from peer (containing only BLOCK types).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash[]} hashes
     * @returns {Promise}
     */
    Pool.prototype.handleBlockInv = function (peer, hashes) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, items, exists, i, hash, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(hashes.length > 0);
                        if (!this.syncing)
                            return [2 /*return*/];
                        // Always keep track of the peer's best hash.
                        if (!peer.loader || this.chain.synced) {
                            hash = hashes[hashes.length - 1];
                            peer.bestHash = hash;
                        }
                        // Ignore for now if we're still syncing
                        if (!this.chain.synced && !peer.loader)
                            return [2 /*return*/];
                        if (this.options.hasWitness() && !peer.hasWitness())
                            return [2 /*return*/];
                        // Request headers instead.
                        if (this.checkpoints)
                            return [2 /*return*/];
                        this.logger.debug('Received %d block hashes from peer (%s).', hashes.length, peer.hostname());
                        items = [];
                        exists = null;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < hashes.length)) return [3 /*break*/, 7];
                        hash = hashes[i];
                        if (!this.chain.hasOrphan(hash)) return [3 /*break*/, 3];
                        this.logger.debug('Received known orphan hash (%s).', peer.hostname());
                        return [4 /*yield*/, this.resolveOrphan(peer, hash)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.hasBlock(hash)];
                    case 4:
                        // Request the block if we don't have it.
                        if (!(_a.sent())) {
                            items.push(hash);
                            return [3 /*break*/, 6];
                        }
                        exists = hash;
                        if (!(i === hashes.length - 1)) return [3 /*break*/, 6];
                        this.logger.debug('Received existing hash (%s).', peer.hostname());
                        return [4 /*yield*/, this.getBlocks(peer, hash)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        if (!(exists && this.chain.synced)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.chain.getHeight(exists)];
                    case 8:
                        height = _a.sent();
                        if (height !== -1)
                            peer.bestHeight = height;
                        _a.label = 9;
                    case 9:
                        this.getBlock(peer, items);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle peer inv packet (txs).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    Pool.prototype.handleTXInv = function (peer, hashes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(hashes.length > 0);
                if (this.syncing && !this.chain.synced)
                    return [2 /*return*/];
                this.ensureTX(peer, hashes);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `getdata` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetDataPacket} packet
     */
    Pool.prototype.handleGetData = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var items, notFound, txs, blocks, compact, unknown, _i, items_2, item, tx, _a, result, block, merkle, _b, _c, tx, height, result, block;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        items = packet.items;
                        if (items.length > common.MAX_INV) {
                            this.logger.warning('Peer sent inv with >50k items (%s).', peer.hostname());
                            peer.increaseBan(100);
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        notFound = [];
                        txs = 0;
                        blocks = 0;
                        compact = 0;
                        unknown = -1;
                        _i = 0, items_2 = items;
                        _d.label = 1;
                    case 1:
                        if (!(_i < items_2.length)) return [3 /*break*/, 17];
                        item = items_2[_i];
                        if (!item.isTX()) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getItem(peer, item)];
                    case 2:
                        tx = _d.sent();
                        if (!tx) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        // Coinbases are an insta-ban from any node.
                        // This should technically never happen, but
                        // it's worth keeping here just in case. A
                        // 24-hour ban from any node is rough.
                        if (tx.isCoinbase()) {
                            notFound.push(item);
                            this.logger.warning('Failsafe: tried to relay a coinbase.');
                            return [3 /*break*/, 16];
                        }
                        peer.send(new packets.TXPacket(tx, item.hasWitness()));
                        txs += 1;
                        return [3 /*break*/, 16];
                    case 3:
                        _a = item.type;
                        switch (_a) {
                            case invTypes.BLOCK: return [3 /*break*/, 4];
                            case invTypes.WITNESS_BLOCK: return [3 /*break*/, 4];
                            case invTypes.FILTERED_BLOCK: return [3 /*break*/, 6];
                            case invTypes.WITNESS_FILTERED_BLOCK: return [3 /*break*/, 6];
                            case invTypes.CMPCT_BLOCK: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 13];
                    case 4: return [4 /*yield*/, this.sendBlock(peer, item, item.hasWitness())];
                    case 5:
                        result = _d.sent();
                        if (!result) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        blocks += 1;
                        return [3 /*break*/, 14];
                    case 6:
                        if (!this.options.bip37) {
                            this.logger.debug('Peer requested a merkleblock without bip37 enabled (%s).', peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        if (!peer.spvFilter) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        return [4 /*yield*/, this.getItem(peer, item)];
                    case 7:
                        block = _d.sent();
                        if (!block) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        merkle = block.toMerkle(peer.spvFilter);
                        peer.send(new packets.MerkleBlockPacket(merkle));
                        for (_b = 0, _c = merkle.txs; _b < _c.length; _b++) {
                            tx = _c[_b];
                            peer.send(new packets.TXPacket(tx, item.hasWitness()));
                            txs += 1;
                        }
                        blocks += 1;
                        return [3 /*break*/, 14];
                    case 8: return [4 /*yield*/, this.chain.getHeight(item.hash)];
                    case 9:
                        height = _d.sent();
                        if (!(height < this.chain.tip.height - 10)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.sendBlock(peer, item, peer.compactWitness)];
                    case 10:
                        result = _d.sent();
                        if (!result) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        blocks += 1;
                        return [3 /*break*/, 14];
                    case 11: return [4 /*yield*/, this.getItem(peer, item)];
                    case 12:
                        block = _d.sent();
                        if (!block) {
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        peer.sendCompactBlock(block);
                        blocks += 1;
                        compact += 1;
                        return [3 /*break*/, 14];
                    case 13:
                        {
                            unknown = item.type;
                            notFound.push(item);
                            return [3 /*break*/, 16];
                        }
                        _d.label = 14;
                    case 14:
                        if (peer.hashContinue && item.hash.equals(peer.hashContinue)) {
                            peer.sendInv([new InvItem(invTypes.BLOCK, this.chain.tip.hash)]);
                            peer.hashContinue = null;
                        }
                        // Wait for the peer to read
                        // before we pull more data
                        // out of the database.
                        return [4 /*yield*/, peer.drain()];
                    case 15:
                        // Wait for the peer to read
                        // before we pull more data
                        // out of the database.
                        _d.sent();
                        _d.label = 16;
                    case 16:
                        _i++;
                        return [3 /*break*/, 1];
                    case 17:
                        if (notFound.length > 0)
                            peer.send(new packets.NotFoundPacket(notFound));
                        if (txs > 0) {
                            this.logger.debug('Served %d txs with getdata (notfound=%d) (%s).', txs, notFound.length, peer.hostname());
                        }
                        if (blocks > 0) {
                            this.logger.debug('Served %d blocks with getdata (notfound=%d, cmpct=%d) (%s).', blocks, notFound.length, compact, peer.hostname());
                        }
                        if (unknown !== -1) {
                            this.logger.warning('Peer sent an unknown getdata type: %d (%s).', unknown, peer.hostname());
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle peer notfound packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {NotFoundPacket} packet
     */
    Pool.prototype.handleNotFound = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var items, _i, items_3, item;
            return __generator(this, function (_a) {
                items = packet.items;
                for (_i = 0, items_3 = items; _i < items_3.length; _i++) {
                    item = items_3[_i];
                    if (!this.resolveItem(peer, item)) {
                        this.logger.warning('Peer sent notfound for unrequested item: %h (%s).', item.hash, peer.hostname());
                        peer.destroy();
                        return [2 /*return*/];
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `getblocks` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetBlocksPacket} packet
     */
    Pool.prototype.handleGetBlocks = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, blocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chain.synced)
                            return [2 /*return*/];
                        if (this.options.selfish)
                            return [2 /*return*/];
                        if (this.chain.options.spv)
                            return [2 /*return*/];
                        if (this.chain.options.prune)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.chain.findLocator(packet.locator)];
                    case 1:
                        hash = _a.sent();
                        if (!hash) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.chain.getNextHash(hash)];
                    case 2:
                        hash = _a.sent();
                        _a.label = 3;
                    case 3:
                        blocks = [];
                        _a.label = 4;
                    case 4:
                        if (!hash) return [3 /*break*/, 6];
                        if (packet.stop && hash.equals(packet.stop))
                            return [3 /*break*/, 6];
                        blocks.push(new InvItem(invTypes.BLOCK, hash));
                        if (blocks.length === 500) {
                            peer.hashContinue = hash;
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.chain.getNextHash(hash)];
                    case 5:
                        hash = _a.sent();
                        return [3 /*break*/, 4];
                    case 6:
                        peer.sendInv(blocks);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `getheaders` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetHeadersPacket} packet
     */
    Pool.prototype.handleGetHeaders = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, entry, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chain.synced)
                            return [2 /*return*/];
                        if (this.options.selfish)
                            return [2 /*return*/];
                        if (this.chain.options.spv)
                            return [2 /*return*/];
                        if (this.chain.options.prune)
                            return [2 /*return*/];
                        if (!(packet.locator.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.chain.findLocator(packet.locator)];
                    case 1:
                        hash = _a.sent();
                        if (!hash) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.chain.getNextHash(hash)];
                    case 2:
                        hash = _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        hash = packet.stop;
                        _a.label = 5;
                    case 5:
                        if (!hash) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 6:
                        entry = _a.sent();
                        _a.label = 7;
                    case 7:
                        headers = [];
                        _a.label = 8;
                    case 8:
                        if (!entry) return [3 /*break*/, 10];
                        headers.push(entry.toHeaders());
                        if (packet.stop && entry.hash.equals(packet.stop))
                            return [3 /*break*/, 10];
                        if (headers.length === 2000)
                            return [3 /*break*/, 10];
                        return [4 /*yield*/, this.chain.getNext(entry)];
                    case 9:
                        entry = _a.sent();
                        return [3 /*break*/, 8];
                    case 10:
                        peer.sendHeaders(headers);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `headers` packet from a given peer.
     * @method
     * @private
     * @param {Peer} peer
     * @param {HeadersPacket} packet
     * @returns {Promise}
     */
    Pool.prototype.handleHeaders = function (peer, packet) {
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
                        return [4 /*yield*/, this._handleHeaders(peer, packet)];
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
     * Handle `headers` packet from
     * a given peer without a lock.
     * @method
     * @private
     * @param {Peer} peer
     * @param {HeadersPacket} packet
     * @returns {Promise}
     */
    Pool.prototype._handleHeaders = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, checkpoint, node, _i, headers_1, header, last, hash, height;
            return __generator(this, function (_a) {
                headers = packet.items;
                if (!this.checkpoints)
                    return [2 /*return*/];
                if (!this.syncing)
                    return [2 /*return*/];
                if (!peer.loader)
                    return [2 /*return*/];
                if (headers.length === 0)
                    return [2 /*return*/];
                if (headers.length > 2000) {
                    peer.increaseBan(100);
                    return [2 /*return*/];
                }
                assert(this.headerChain.size > 0);
                checkpoint = false;
                node = null;
                for (_i = 0, headers_1 = headers; _i < headers_1.length; _i++) {
                    header = headers_1[_i];
                    last = this.headerChain.tail;
                    hash = header.hash();
                    height = last.height + 1;
                    if (!header.verify()) {
                        this.logger.warning('Peer sent an invalid header (%s).', peer.hostname());
                        peer.increaseBan(100);
                        peer.destroy();
                        return [2 /*return*/];
                    }
                    if (!header.prevBlock.equals(last.hash)) {
                        this.logger.warning('Peer sent a bad header chain (%s).', peer.hostname());
                        peer.destroy();
                        return [2 /*return*/];
                    }
                    node = new HeaderEntry(hash, height);
                    if (node.height === this.headerTip.height) {
                        if (!node.hash.equals(this.headerTip.hash)) {
                            this.logger.warning('Peer sent an invalid checkpoint (%s).', peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        checkpoint = true;
                    }
                    if (!this.headerNext)
                        this.headerNext = node;
                    this.headerChain.push(node);
                }
                this.logger.debug('Received %d headers from peer (%s).', headers.length, peer.hostname());
                // If we received a valid header
                // chain, consider this a "block".
                peer.blockTime = Date.now();
                // Request the blocks we just added.
                if (checkpoint) {
                    this.headerChain.shift();
                    this.resolveHeaders(peer);
                    return [2 /*return*/];
                }
                // Request more headers.
                peer.sendGetHeaders([node.hash], this.headerTip.hash);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `sendheaders` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {SendHeadersPacket} packet
     * @returns {Promise}
     */
    Pool.prototype.handleSendHeaders = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `block` packet. Attempt to add to chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {BlockPacket} packet
     * @returns {Promise}
     */
    Pool.prototype.handleBlock = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var flags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        flags = chainCommon.flags.DEFAULT_FLAGS;
                        if (this.options.spv) {
                            this.logger.warning('Peer sent unsolicited block (%s).', peer.hostname());
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.addBlock(peer, packet.block, flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Attempt to add block to chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Block} block
     * @returns {Promise}
     */
    Pool.prototype.addBlock = function (peer, block, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        return [4 /*yield*/, this.locker.lock(hash)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._addBlock(peer, block, flags)];
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
     * Attempt to add block to chain (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Block} block
     * @returns {Promise}
     */
    Pool.prototype._addBlock = function (peer, block, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, entry, err_1, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.syncing)
                            return [2 /*return*/];
                        hash = block.hash();
                        if (!this.resolveBlock(peer, hash)) {
                            this.logger.warning('Received unrequested block: %h (%s).', block.hash(), peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        peer.blockTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.add(block, flags, peer.id)];
                    case 2:
                        entry = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        if (err_1.type === 'VerifyError') {
                            peer.reject('block', err_1);
                            this.logger.warning(err_1);
                            return [2 /*return*/];
                        }
                        throw err_1;
                    case 4:
                        if (!!entry) return [3 /*break*/, 6];
                        if (this.checkpoints) {
                            this.logger.warning('Peer sent orphan block with getheaders (%s).', peer.hostname());
                            return [2 /*return*/];
                        }
                        height = block.getCoinbaseHeight();
                        if (height !== -1) {
                            peer.bestHash = hash;
                            peer.bestHeight = height;
                            this.resolveHeight(hash, height);
                        }
                        this.logger.debug('Peer sent an orphan block. Resolving.');
                        return [4 /*yield*/, this.resolveOrphan(peer, hash)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                    case 6:
                        if (this.chain.synced) {
                            peer.bestHash = entry.hash;
                            peer.bestHeight = entry.height;
                            this.resolveHeight(entry.hash, entry.height);
                        }
                        this.logStatus(block);
                        return [4 /*yield*/, this.resolveChain(peer, hash)];
                    case 7:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resolve header chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Promise}
     */
    Pool.prototype.resolveChain = function (peer, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.checkpoints)
                            return [2 /*return*/];
                        if (!peer.loader)
                            return [2 /*return*/];
                        if (peer.destroyed)
                            throw new Error('Peer was destroyed (header chain resolution).');
                        node = this.headerChain.head;
                        assert(node);
                        if (!hash.equals(node.hash)) {
                            this.logger.warning('Header hash mismatch %h != %h (%s).', hash, node.hash, peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        if (node.height < this.network.lastCheckpoint) {
                            if (node.height === this.headerTip.height) {
                                this.logger.info('Received checkpoint %h (%d).', node.hash, node.height);
                                this.headerTip = this.getNextTip(node.height);
                                peer.sendGetHeaders([hash], this.headerTip.hash);
                                return [2 /*return*/];
                            }
                            this.headerChain.shift();
                            this.resolveHeaders(peer);
                            return [2 /*return*/];
                        }
                        this.logger.info('Switching to getblocks (%s).', peer.hostname());
                        return [4 /*yield*/, this.switchSync(peer, hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switch to getblocks.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Promise}
     */
    Pool.prototype.switchSync = function (peer, hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.checkpoints);
                        this.checkpoints = false;
                        this.headerTip = null;
                        this.headerChain.reset();
                        this.headerNext = null;
                        return [4 /*yield*/, this.getBlocks(peer, hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle bad orphan.
     * @method
     * @private
     * @param {String} msg
     * @param {VerifyError} err
     * @param {Number} id
     */
    Pool.prototype.handleBadOrphan = function (msg, err, id) {
        var peer = this.peers.find(id);
        if (!peer) {
            this.logger.warning('Could not find offending peer for orphan: %h (%d).', err.hash, id);
            return;
        }
        this.logger.debug('Punishing peer for sending a bad orphan (%s).', peer.hostname());
        // Punish the original peer who sent this.
        peer.reject(msg, err);
    };
    /**
     * Log sync status.
     * @private
     * @param {Block} block
     */
    Pool.prototype.logStatus = function (block) {
        if (this.chain.height % 20 === 0) {
            this.logger.debug('Status:'
                + ' time=%s height=%d progress=%s'
                + ' orphans=%d active=%d'
                + ' target=%s peers=%d', util.date(block.time), this.chain.height, (this.chain.getProgress() * 100).toFixed(2) + '%', this.chain.orphanMap.size, this.blockMap.size, block.bits, this.peers.size());
        }
        if (this.chain.height % 2000 === 0) {
            this.logger.info('Received 2000 more blocks (height=%d, hash=%h).', this.chain.height, block.hash());
        }
    };
    /**
     * Handle a transaction. Attempt to add to mempool.
     * @method
     * @private
     * @param {Peer} peer
     * @param {TXPacket} packet
     * @returns {Promise}
     */
    Pool.prototype.handleTX = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = packet.tx.hash();
                        return [4 /*yield*/, this.locker.lock(hash)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._handleTX(peer, packet)];
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
     * Handle a transaction. Attempt to add to mempool (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {TXPacket} packet
     * @returns {Promise}
     */
    Pool.prototype._handleTX = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, hash, flags, block, missing, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = packet.tx;
                        hash = tx.hash();
                        flags = chainCommon.flags.VERIFY_NONE;
                        block = peer.merkleBlock;
                        if (!block) return [3 /*break*/, 3];
                        assert(peer.merkleMatches > 0);
                        assert(peer.merkleMap);
                        if (!block.hasTX(hash)) return [3 /*break*/, 3];
                        if (peer.merkleMap.has(hash)) {
                            this.logger.warning('Peer sent duplicate merkle tx: %h (%s).', tx.hash(), peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        peer.merkleMap.add(hash);
                        block.txs.push(tx);
                        if (!(--peer.merkleMatches === 0)) return [3 /*break*/, 2];
                        peer.merkleBlock = null;
                        peer.merkleTime = -1;
                        peer.merkleMatches = 0;
                        peer.merkleMap = null;
                        return [4 /*yield*/, this._addBlock(peer, block, flags)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                    case 3:
                        if (!this.resolveTX(peer, hash)) {
                            this.logger.warning('Peer sent unrequested tx: %h (%s).', tx.hash(), peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        if (!this.mempool) {
                            this.emit('tx', tx);
                            return [2 /*return*/];
                        }
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.mempool.addTX(tx, peer.id)];
                    case 5:
                        missing = _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        if (err_2.type === 'VerifyError') {
                            peer.reject('tx', err_2);
                            this.logger.info(err_2);
                            return [2 /*return*/];
                        }
                        throw err_2;
                    case 7:
                        if (missing && missing.length > 0) {
                            this.logger.debug('Requesting %d missing transactions (%s).', missing.length, peer.hostname());
                            this.ensureTX(peer, missing);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle peer reject event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {RejectPacket} packet
     */
    Pool.prototype.handleReject = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                this.logger.warning('Received reject (%s): msg=%s code=%s reason=%s hash=%h.', peer.hostname(), packet.message, packet.getCode(), packet.reason, packet.hash);
                if (!packet.hash)
                    return [2 /*return*/];
                entry = this.invMap.get(packet.hash);
                if (!entry)
                    return [2 /*return*/];
                entry.handleReject(peer);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `mempool` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {MempoolPacket} packet
     */
    Pool.prototype.handleMempool = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var items, _i, _a, hash;
            return __generator(this, function (_b) {
                if (!this.mempool)
                    return [2 /*return*/];
                if (!this.chain.synced)
                    return [2 /*return*/];
                if (this.options.selfish)
                    return [2 /*return*/];
                if (!this.options.bip37) {
                    this.logger.debug('Peer requested mempool without bip37 enabled (%s).', peer.hostname());
                    peer.destroy();
                    return [2 /*return*/];
                }
                items = [];
                for (_i = 0, _a = this.mempool.map.keys(); _i < _a.length; _i++) {
                    hash = _a[_i];
                    items.push(new InvItem(invTypes.TX, hash));
                }
                this.logger.debug('Sending mempool snapshot (%s).', peer.hostname());
                peer.queueInv(items);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filterload` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterLoadPacket} packet
     */
    Pool.prototype.handleFilterLoad = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filteradd` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterAddPacket} packet
     */
    Pool.prototype.handleFilterAdd = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filterclear` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterClearPacket} packet
     */
    Pool.prototype.handleFilterClear = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `merkleblock` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {MerkleBlockPacket} block
     */
    Pool.prototype.handleMerkleBlock = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = packet.block.hash();
                        return [4 /*yield*/, this.locker.lock(hash)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._handleMerkleBlock(peer, packet)];
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
     * Handle `merkleblock` packet (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {MerkleBlockPacket} block
     */
    Pool.prototype._handleMerkleBlock = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var block, hash, tree, flags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.syncing)
                            return [2 /*return*/];
                        // Potential DoS.
                        if (!this.options.spv) {
                            this.logger.warning('Peer sent unsolicited merkleblock (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        block = packet.block;
                        hash = block.hash();
                        if (!peer.blockMap.has(hash)) {
                            this.logger.warning('Peer sent an unrequested merkleblock (%s).', peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        if (peer.merkleBlock) {
                            this.logger.warning('Peer sent a merkleblock prematurely (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        if (!block.verify()) {
                            this.logger.warning('Peer sent an invalid merkleblock (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        tree = block.getTree();
                        if (!(tree.matches.length === 0)) return [3 /*break*/, 2];
                        flags = chainCommon.flags.VERIFY_NONE;
                        return [4 /*yield*/, this._addBlock(peer, block, flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        peer.merkleBlock = block;
                        peer.merkleTime = Date.now();
                        peer.merkleMatches = tree.matches.length;
                        peer.merkleMap = new BufferSet();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FeeFilterPacket} packet
     */
    Pool.prototype.handleFeeFilter = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {SendCmpctPacket} packet
     */
    Pool.prototype.handleSendCmpct = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `cmpctblock` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {CompactBlockPacket} packet
     */
    Pool.prototype.handleCmpctBlock = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var block, hash, witness, result, full, flags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        block = packet.block;
                        hash = block.hash();
                        witness = peer.compactWitness;
                        if (!this.syncing)
                            return [2 /*return*/];
                        if (!this.options.compact) {
                            this.logger.info('Peer sent unsolicited cmpctblock (%s).', peer.hostname());
                            this.destroy();
                            return [2 /*return*/];
                        }
                        if (!peer.hasCompactSupport() || !peer.hasCompact()) {
                            this.logger.info('Peer sent unsolicited cmpctblock (%s).', peer.hostname());
                            this.destroy();
                            return [2 /*return*/];
                        }
                        if (peer.compactBlocks.has(hash)) {
                            this.logger.debug('Peer sent us a duplicate compact block (%s).', peer.hostname());
                            return [2 /*return*/];
                        }
                        if (this.compactBlocks.has(hash)) {
                            this.logger.debug('Already waiting for compact block %h (%s).', hash, peer.hostname());
                            return [2 /*return*/];
                        }
                        if (!peer.blockMap.has(hash)) {
                            if (this.options.blockMode !== 1) {
                                this.logger.warning('Peer sent us an unrequested compact block (%s).', peer.hostname());
                                peer.destroy();
                                return [2 /*return*/];
                            }
                            peer.blockMap.set(hash, Date.now());
                            assert(!this.blockMap.has(hash));
                            this.blockMap.add(hash);
                        }
                        if (!this.mempool) {
                            this.logger.warning('Requesting compact blocks without a mempool!');
                            return [2 /*return*/];
                        }
                        if (!block.verify()) {
                            this.logger.debug('Peer sent an invalid compact block (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        try {
                            result = block.init();
                        }
                        catch (e) {
                            this.logger.debug('Peer sent an invalid compact block (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        if (!result) {
                            this.logger.warning('Siphash collision for %h. Requesting full block (%s).', block.hash(), peer.hostname());
                            peer.getFullBlock(hash);
                            peer.increaseBan(10);
                            return [2 /*return*/];
                        }
                        full = block.fillMempool(witness, this.mempool);
                        if (!full) return [3 /*break*/, 2];
                        this.logger.debug('Received full compact block %h (%s).', block.hash(), peer.hostname());
                        flags = chainCommon.flags.VERIFY_BODY;
                        return [4 /*yield*/, this.addBlock(peer, block.toBlock(), flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2:
                        if (peer.compactBlocks.size >= 15) {
                            this.logger.warning('Compact block DoS attempt (%s).', peer.hostname());
                            peer.destroy();
                            return [2 /*return*/];
                        }
                        block.now = Date.now();
                        assert(!peer.compactBlocks.has(hash));
                        peer.compactBlocks.set(hash, block);
                        this.compactBlocks.add(hash);
                        this.logger.debug('Received non-full compact block %h tx=%d/%d (%s).', block.hash(), block.count, block.totalTX, peer.hostname());
                        peer.send(new packets.GetBlockTxnPacket(block.toRequest()));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `getblocktxn` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetBlockTxnPacket} packet
     */
    Pool.prototype.handleGetBlockTxn = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var req, item, block, height, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = packet.request;
                        if (this.chain.options.spv)
                            return [2 /*return*/];
                        if (this.chain.options.prune)
                            return [2 /*return*/];
                        if (this.options.selfish)
                            return [2 /*return*/];
                        item = new InvItem(invTypes.BLOCK, req.hash);
                        return [4 /*yield*/, this.getItem(peer, item)];
                    case 1:
                        block = _a.sent();
                        if (!block) {
                            this.logger.debug('Peer sent getblocktxn for non-existent block (%s).', peer.hostname());
                            peer.increaseBan(100);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.chain.getHeight(req.hash)];
                    case 2:
                        height = _a.sent();
                        if (height < this.chain.tip.height - 15) {
                            this.logger.debug('Peer sent a getblocktxn for a block > 15 deep (%s)', peer.hostname());
                            return [2 /*return*/];
                        }
                        this.logger.debug('Sending blocktxn for %h to peer (%s).', block.hash(), peer.hostname());
                        res = BIP152.TXResponse.fromBlock(block, req);
                        peer.send(new packets.BlockTxnPacket(res, peer.compactWitness));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `blocktxn` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {BlockTxnPacket} packet
     */
    Pool.prototype.handleBlockTxn = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            var res, block, flags;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        res = packet.response;
                        block = peer.compactBlocks.get(res.hash);
                        flags = chainCommon.flags.VERIFY_BODY;
                        if (!block) {
                            this.logger.debug('Peer sent unsolicited blocktxn (%s).', peer.hostname());
                            return [2 /*return*/];
                        }
                        peer.compactBlocks["delete"](res.hash);
                        assert(this.compactBlocks.has(res.hash));
                        this.compactBlocks["delete"](res.hash);
                        if (!block.fillMissing(res)) {
                            this.logger.warning('Peer sent non-full blocktxn for %h. Requesting full block (%s).', block.hash(), peer.hostname());
                            peer.getFullBlock(res.hash);
                            peer.increaseBan(10);
                            return [2 /*return*/];
                        }
                        this.logger.debug('Filled compact block %h (%s).', block.hash(), peer.hostname());
                        return [4 /*yield*/, this.addBlock(peer, block.toBlock(), flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `unknown` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {UnknownPacket} packet
     */
    Pool.prototype.handleUnknown = function (peer, packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.logger.warning('Unknown packet: %s (%s).', packet.cmd, peer.hostname());
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create an inbound peer from an existing socket.
     * @private
     * @param {net.Socket} socket
     */
    Pool.prototype.addInbound = function (socket) {
        if (!this.opened) {
            socket.destroy();
            return;
        }
        var peer = this.createInbound(socket);
        this.logger.info('Added inbound peer (%s).', peer.hostname());
        this.peers.add(peer);
    };
    /**
     * Allocate a host from the host list.
     * @returns {NetAddress}
     */
    Pool.prototype.getHost = function () {
        for (var _i = 0, _a = this.hosts.nodes; _i < _a.length; _i++) {
            var addr = _a[_i];
            if (this.peers.has(addr.hostname))
                continue;
            return addr;
        }
        var services = this.options.getRequiredServices();
        var now = this.network.now();
        for (var i = 0; i < 100; i++) {
            var entry = this.hosts.getHost();
            if (!entry)
                break;
            var addr = entry.addr;
            if (this.peers.has(addr.hostname))
                continue;
            if (!addr.isValid())
                continue;
            if (!addr.hasServices(services))
                continue;
            if (!this.options.onion && addr.isOnion())
                continue;
            if (i < 30 && now - entry.lastAttempt < 600)
                continue;
            if (i < 50 && addr.port !== this.network.port)
                continue;
            if (i < 95 && this.hosts.isBanned(addr.host))
                continue;
            return entry.addr;
        }
        return null;
    };
    /**
     * Create an outbound non-loader peer. These primarily
     * exist for transaction relaying.
     * @private
     */
    Pool.prototype.addOutbound = function () {
        if (!this.opened)
            return;
        if (this.peers.outbound >= this.options.maxOutbound)
            return;
        // Hang back if we don't
        // have a loader peer yet.
        if (!this.peers.load)
            return;
        var addr = this.getHost();
        if (!addr)
            return;
        var peer = this.createOutbound(addr);
        this.peers.add(peer);
        this.emit('peer', peer);
    };
    /**
     * Attempt to refill the pool with peers (no lock).
     * @private
     */
    Pool.prototype.fillOutbound = function () {
        var need = this.options.maxOutbound - this.peers.outbound;
        if (!this.peers.load)
            this.addLoader();
        if (need <= 0)
            return;
        this.logger.debug('Refilling peers (%d/%d).', this.peers.outbound, this.options.maxOutbound);
        for (var i = 0; i < need; i++)
            this.addOutbound();
    };
    /**
     * Attempt to refill the pool with peers (no lock).
     * @private
     */
    Pool.prototype.refill = function () {
        var _this = this;
        if (this.pendingRefill != null)
            return;
        this.pendingRefill = setTimeout(function () {
            _this.pendingRefill = null;
            _this.fillOutbound();
        }, 3000);
    };
    /**
     * Remove a peer from any list. Drop all load requests.
     * @private
     * @param {Peer} peer
     */
    Pool.prototype.removePeer = function (peer) {
        this.peers.remove(peer);
        for (var _i = 0, _a = peer.blockMap.keys(); _i < _a.length; _i++) {
            var hash = _a[_i];
            this.resolveBlock(peer, hash);
        }
        for (var _b = 0, _c = peer.txMap.keys(); _b < _c.length; _b++) {
            var hash = _c[_b];
            this.resolveTX(peer, hash);
        }
        for (var _d = 0, _e = peer.compactBlocks.keys(); _d < _e.length; _d++) {
            var hash = _e[_d];
            assert(this.compactBlocks.has(hash));
            this.compactBlocks["delete"](hash);
        }
        peer.compactBlocks.clear();
    };
    /**
     * Ban peer.
     * @param {NetAddress} addr
     */
    Pool.prototype.ban = function (addr) {
        var peer = this.peers.get(addr.hostname);
        this.logger.debug('Banning peer (%s).', addr.hostname);
        this.hosts.ban(addr.host);
        this.hosts.remove(addr.hostname);
        if (peer)
            peer.destroy();
    };
    /**
     * Unban peer.
     * @param {NetAddress} addr
     */
    Pool.prototype.unban = function (addr) {
        this.hosts.unban(addr.host);
    };
    /**
     * Set the spv filter.
     * @param {BloomFilter} filter
     * @param {String?} enc
     */
    Pool.prototype.setFilter = function (filter) {
        if (!this.options.spv)
            return;
        this.spvFilter = filter;
        this.queueFilterLoad();
    };
    /**
     * Watch a an address hash (filterload, SPV-only).
     * @param {Buffer|Hash} data
     * @param {String?} enc
     */
    Pool.prototype.watch = function (data, enc) {
        if (!this.options.spv)
            return;
        this.spvFilter.add(data, enc);
        this.queueFilterLoad();
    };
    /**
     * Reset the spv filter (filterload, SPV-only).
     */
    Pool.prototype.unwatch = function () {
        if (!this.options.spv)
            return;
        this.spvFilter.reset();
        this.queueFilterLoad();
    };
    /**
     * Queue a resend of the bloom filter.
     */
    Pool.prototype.queueFilterLoad = function () {
        var _this = this;
        if (!this.options.spv)
            return;
        if (this.pendingFilter != null)
            return;
        this.pendingFilter = setTimeout(function () {
            _this.pendingFilter = null;
            _this.sendFilterLoad();
        }, 100);
    };
    /**
     * Resend the bloom filter to peers.
     */
    Pool.prototype.sendFilterLoad = function () {
        if (!this.options.spv)
            return;
        assert(this.spvFilter);
        for (var peer = this.peers.head(); peer; peer = peer.next)
            peer.sendFilterLoad(this.spvFilter);
    };
    /**
     * Add an address to the bloom filter (SPV-only).
     * @param {Address|AddressString} address
     */
    Pool.prototype.watchAddress = function (address) {
        if (typeof address === 'string')
            address = Address.fromString(address, this.network);
        var hash = Address.getHash(address);
        this.watch(hash);
    };
    /**
     * Add an outpoint to the bloom filter (SPV-only).
     * @param {Outpoint} outpoint
     */
    Pool.prototype.watchOutpoint = function (outpoint) {
        this.watch(outpoint.toRaw());
    };
    /**
     * Send `getblocks` to peer after building
     * locator and resolving orphan root.
     * @method
     * @param {Peer} peer
     * @param {Hash} orphan - Orphan hash to resolve.
     * @returns {Promise}
     */
    Pool.prototype.resolveOrphan = function (peer, orphan) {
        return __awaiter(this, void 0, void 0, function () {
            var locator, root;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain.getLocator()];
                    case 1:
                        locator = _a.sent();
                        root = this.chain.getOrphanRoot(orphan);
                        assert(root);
                        peer.sendGetBlocks(locator, root);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send `getheaders` to peer after building locator.
     * @method
     * @param {Peer} peer
     * @param {Hash} tip - Tip to build chain locator from.
     * @param {Hash?} stop
     * @returns {Promise}
     */
    Pool.prototype.getHeaders = function (peer, tip, stop) {
        return __awaiter(this, void 0, void 0, function () {
            var locator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain.getLocator(tip)];
                    case 1:
                        locator = _a.sent();
                        peer.sendGetHeaders(locator, stop);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send `getblocks` to peer after building locator.
     * @method
     * @param {Peer} peer
     * @param {Hash} tip - Tip hash to build chain locator from.
     * @param {Hash?} stop
     * @returns {Promise}
     */
    Pool.prototype.getBlocks = function (peer, tip, stop) {
        return __awaiter(this, void 0, void 0, function () {
            var locator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain.getLocator(tip)];
                    case 1:
                        locator = _a.sent();
                        peer.sendGetBlocks(locator, stop);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Queue a `getdata` request to be sent.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    Pool.prototype.getBlock = function (peer, hashes) {
        if (!this.opened)
            return;
        if (!peer.handshake)
            throw new Error('Peer handshake not complete (getdata).');
        if (peer.destroyed)
            throw new Error('Peer is destroyed (getdata).');
        var now = Date.now();
        var items = [];
        for (var _i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
            var hash = hashes_1[_i];
            if (this.blockMap.has(hash))
                continue;
            this.blockMap.add(hash);
            peer.blockMap.set(hash, now);
            if (this.chain.synced)
                now += 100;
            items.push(hash);
        }
        if (items.length === 0)
            return;
        if (peer.blockMap.size >= common.MAX_BLOCK_REQUEST) {
            this.logger.warning('Peer advertised too many blocks (%s).', peer.hostname());
            peer.destroy();
            return;
        }
        this.logger.debug('Requesting %d/%d blocks from peer with getdata (%s).', items.length, this.blockMap.size, peer.hostname());
        peer.getBlock(items);
    };
    /**
     * Queue a `getdata` request to be sent.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    Pool.prototype.getTX = function (peer, hashes) {
        if (!this.opened)
            return;
        if (!peer.handshake)
            throw new Error('Peer handshake not complete (getdata).');
        if (peer.destroyed)
            throw new Error('Peer is destroyed (getdata).');
        var now = Date.now();
        var items = [];
        for (var _i = 0, hashes_2 = hashes; _i < hashes_2.length; _i++) {
            var hash = hashes_2[_i];
            if (this.txMap.has(hash))
                continue;
            this.txMap.add(hash);
            peer.txMap.set(hash, now);
            now += 50;
            items.push(hash);
        }
        if (items.length === 0)
            return;
        if (peer.txMap.size >= common.MAX_TX_REQUEST) {
            this.logger.warning('Peer advertised too many txs (%s).', peer.hostname());
            peer.destroy();
            return;
        }
        this.logger.debug('Requesting %d/%d txs from peer with getdata (%s).', items.length, this.txMap.size, peer.hostname());
        peer.getTX(items);
    };
    /**
     * Test whether the chain has or has seen an item.
     * @method
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Pool.prototype.hasBlock = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check the lock.
                        if (this.locker.has(hash))
                            return [2 /*return*/, true];
                        return [4 /*yield*/, this.chain.has(hash)];
                    case 1:
                        // Check the chain.
                        if (_a.sent())
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Test whether the mempool has or has seen an item.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Pool.prototype.hasTX = function (hash) {
        // Check the lock queue.
        if (this.locker.has(hash))
            return true;
        if (!this.mempool) {
            // Check the TX filter if
            // we don't have a mempool.
            if (!this.txFilter.added(hash))
                return true;
        }
        else {
            // Check the mempool.
            if (this.mempool.has(hash))
                return true;
            // If we recently rejected this item. Ignore.
            if (this.mempool.hasReject(hash)) {
                this.logger.spam('Saw known reject of %h.', hash);
                return true;
            }
        }
        return false;
    };
    /**
     * Queue a `getdata` request to be sent.
     * Check tx existence before requesting.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    Pool.prototype.ensureTX = function (peer, hashes) {
        var items = [];
        for (var _i = 0, hashes_3 = hashes; _i < hashes_3.length; _i++) {
            var hash = hashes_3[_i];
            if (this.hasTX(hash))
                continue;
            items.push(hash);
        }
        this.getTX(peer, items);
    };
    /**
     * Fulfill a requested tx.
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Pool.prototype.resolveTX = function (peer, hash) {
        if (!peer.txMap.has(hash))
            return false;
        peer.txMap["delete"](hash);
        assert(this.txMap.has(hash));
        this.txMap["delete"](hash);
        return true;
    };
    /**
     * Fulfill a requested block.
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Pool.prototype.resolveBlock = function (peer, hash) {
        if (!peer.blockMap.has(hash))
            return false;
        peer.blockMap["delete"](hash);
        assert(this.blockMap.has(hash));
        this.blockMap["delete"](hash);
        return true;
    };
    /**
     * Fulfill a requested item.
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Boolean}
     */
    Pool.prototype.resolveItem = function (peer, item) {
        if (item.isBlock())
            return this.resolveBlock(peer, item.hash);
        if (item.isTX())
            return this.resolveTX(peer, item.hash);
        return false;
    };
    /**
     * Broadcast a transaction or block.
     * @param {TX|Block} msg
     * @returns {Promise}
     */
    Pool.prototype.broadcast = function (msg) {
        var hash = msg.hash();
        var item = this.invMap.get(hash);
        if (item) {
            item.refresh();
            item.announce();
        }
        else {
            item = new BroadcastItem(this, msg);
            item.start();
            item.announce();
        }
        return new Promise(function (resolve, reject) {
            item.addJob(resolve, reject);
        });
    };
    /**
     * Announce a block to all peers.
     * @param {Block|Blocks[]} blocks
     */
    Pool.prototype.announceBlock = function (blocks) {
        for (var peer = this.peers.head(); peer; peer = peer.next)
            peer.announceBlock(blocks);
    };
    /**
     * Announce a transaction to all peers.
     * @param {TX|TX[]} txs
     */
    Pool.prototype.announceTX = function (txs) {
        for (var peer = this.peers.head(); peer; peer = peer.next)
            peer.announceTX(txs);
    };
    /**
     * Returns human readable list of services
     * that are available.
     * @returns {String[]}
     */
    Pool.prototype.getServiceNames = function () {
        var enabled = [];
        for (var _i = 0, _a = Object.entries(services); _i < _a.length; _i++) {
            var _b = _a[_i], service = _b[0], bit = _b[1];
            if (this.options.hasServices(bit))
                enabled.push(service);
        }
        return enabled;
    };
    return Pool;
}(EventEmitter));
/**
 * Discovery interval for UPNP and DNS seeds.
 * @const {Number}
 * @default
 */
Pool.DISCOVERY_INTERVAL = 120000;
/**
 * Pool Options
 * @alias module:net.PoolOptions
 */
var PoolOptions = /** @class */ (function () {
    /**
     * Create pool options.
     * @constructor
     */
    function PoolOptions(options) {
        this.network = Network.primary;
        this.logger = null;
        this.chain = null;
        this.mempool = null;
        this.nonces = new NonceList();
        this.prefix = null;
        this.checkpoints = true;
        this.spv = false;
        this.bip37 = false;
        this.listen = false;
        this.compact = true;
        this.noRelay = false;
        this.host = '0.0.0.0';
        this.port = this.network.port;
        this.publicHost = '0.0.0.0';
        this.publicPort = this.network.port;
        this.maxOutbound = 8;
        this.maxInbound = 8;
        this.createSocket = this._createSocket.bind(this);
        this.createServer = tcp.createServer;
        this.resolve = this._resolve.bind(this);
        this.proxy = null;
        this.onion = false;
        this.upnp = false;
        this.selfish = false;
        this.version = common.PROTOCOL_VERSION;
        this.agent = common.USER_AGENT;
        this.banScore = common.BAN_SCORE;
        this.banTime = common.BAN_TIME;
        this.feeRate = -1;
        this.seeds = this.network.seeds;
        this.nodes = [];
        this.invTimeout = 60000;
        this.blockMode = 0;
        this.services = common.LOCAL_SERVICES;
        this.requiredServices = common.REQUIRED_SERVICES;
        this.memory = true;
        this.discover = true;
        this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {PoolOptions}
     */
    PoolOptions.prototype.fromOptions = function (options) {
        assert(options, 'Pool requires options.');
        assert(options.chain && typeof options.chain === 'object', 'Pool options require a blockchain.');
        this.chain = options.chain;
        this.network = options.chain.network;
        this.logger = options.chain.logger;
        this.port = this.network.port;
        this.seeds = this.network.seeds;
        this.port = this.network.port;
        this.publicPort = this.network.port;
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.mempool != null) {
            assert(typeof options.mempool === 'object');
            this.mempool = options.mempool;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
        }
        if (options.checkpoints != null) {
            assert(typeof options.checkpoints === 'boolean');
            assert(options.checkpoints === this.chain.options.checkpoints);
            this.checkpoints = options.checkpoints;
        }
        else {
            this.checkpoints = this.chain.options.checkpoints;
        }
        if (options.spv != null) {
            assert(typeof options.spv === 'boolean');
            assert(options.spv === this.chain.options.spv);
            this.spv = options.spv;
        }
        else {
            this.spv = this.chain.options.spv;
        }
        if (options.bip37 != null) {
            assert(typeof options.bip37 === 'boolean');
            this.bip37 = options.bip37;
        }
        if (options.listen != null) {
            assert(typeof options.listen === 'boolean');
            this.listen = options.listen;
        }
        if (options.compact != null) {
            assert(typeof options.compact === 'boolean');
            this.compact = options.compact;
        }
        if (options.noRelay != null) {
            assert(typeof options.noRelay === 'boolean');
            this.noRelay = options.noRelay;
        }
        if (options.host != null) {
            assert(typeof options.host === 'string');
            var raw = IP.toBuffer(options.host);
            this.host = IP.toString(raw);
            if (IP.isRoutable(raw))
                this.publicHost = this.host;
        }
        if (options.port != null) {
            assert((options.port & 0xffff) === options.port);
            this.port = options.port;
            this.publicPort = options.port;
        }
        if (options.publicHost != null) {
            assert(typeof options.publicHost === 'string');
            this.publicHost = IP.normalize(options.publicHost);
        }
        if (options.publicPort != null) {
            assert((options.publicPort & 0xffff) === options.publicPort);
            this.publicPort = options.publicPort;
        }
        if (options.maxOutbound != null) {
            assert(typeof options.maxOutbound === 'number');
            assert(options.maxOutbound > 0);
            this.maxOutbound = options.maxOutbound;
        }
        if (options.maxInbound != null) {
            assert(typeof options.maxInbound === 'number');
            this.maxInbound = options.maxInbound;
        }
        if (options.createSocket) {
            assert(typeof options.createSocket === 'function');
            this.createSocket = options.createSocket;
        }
        if (options.createServer) {
            assert(typeof options.createServer === 'function');
            this.createServer = options.createServer;
        }
        if (options.resolve) {
            assert(typeof options.resolve === 'function');
            this.resolve = options.resolve;
        }
        if (options.proxy) {
            assert(typeof options.proxy === 'string');
            this.proxy = options.proxy;
        }
        if (options.onion != null) {
            assert(typeof options.onion === 'boolean');
            this.onion = options.onion;
        }
        if (options.upnp != null) {
            assert(typeof options.upnp === 'boolean');
            this.upnp = options.upnp;
        }
        if (options.selfish) {
            assert(typeof options.selfish === 'boolean');
            this.selfish = options.selfish;
        }
        if (options.version) {
            assert(typeof options.version === 'number');
            this.version = options.version;
        }
        if (options.agent) {
            assert(typeof options.agent === 'string');
            assert(options.agent.length <= 255);
            this.agent = options.agent;
        }
        if (options.banScore != null) {
            assert(typeof this.options.banScore === 'number');
            this.banScore = this.options.banScore;
        }
        if (options.banTime != null) {
            assert(typeof this.options.banTime === 'number');
            this.banTime = this.options.banTime;
        }
        if (options.feeRate != null) {
            assert(typeof this.options.feeRate === 'number');
            this.feeRate = this.options.feeRate;
        }
        if (options.seeds) {
            assert(Array.isArray(options.seeds));
            this.seeds = options.seeds;
        }
        if (options.nodes) {
            assert(Array.isArray(options.nodes));
            this.nodes = options.nodes;
        }
        if (options.only != null) {
            assert(Array.isArray(options.only));
            if (options.only.length > 0) {
                this.nodes = options.only;
                this.maxOutbound = options.only.length;
                this.discover = false;
            }
        }
        if (options.discover != null) {
            assert(typeof options.discover === 'boolean');
            this.discover = options.discover;
        }
        if (options.invTimeout != null) {
            assert(typeof options.invTimeout === 'number');
            this.invTimeout = options.invTimeout;
        }
        if (options.blockMode != null) {
            assert(typeof options.blockMode === 'number');
            this.blockMode = options.blockMode;
        }
        if (options.memory != null) {
            assert(typeof options.memory === 'boolean');
            this.memory = options.memory;
        }
        if (this.spv) {
            this.requiredServices |= common.services.BLOOM;
            this.services &= ~common.services.NETWORK;
            this.noRelay = true;
            this.checkpoints = true;
            this.compact = false;
            this.bip37 = false;
            this.listen = false;
        }
        if (this.selfish) {
            this.services &= ~common.services.NETWORK;
            this.bip37 = false;
        }
        if (this.bip37)
            this.services |= common.services.BLOOM;
        if (this.proxy)
            this.listen = false;
        if (options.services != null) {
            assert((options.services >>> 0) === options.services);
            this.services = options.services;
        }
        if (options.requiredServices != null) {
            assert((options.requiredServices >>> 0) === options.requiredServices);
            this.requiredServices = options.requiredServices;
        }
        return this;
    };
    /**
     * Instantiate options from object.
     * @param {Object} options
     * @returns {PoolOptions}
     */
    PoolOptions.fromOptions = function (options) {
        return new PoolOptions().fromOptions(options);
    };
    /**
     * Get the chain height.
     * @private
     * @returns {Number}
     */
    PoolOptions.prototype.getHeight = function () {
        return this.chain.height;
    };
    /**
     * Test whether the chain is synced.
     * @private
     * @returns {Boolean}
     */
    PoolOptions.prototype.isFull = function () {
        return this.chain.synced;
    };
    /**
     * Get required services for outbound peers.
     * @private
     * @returns {Number}
     */
    PoolOptions.prototype.getRequiredServices = function () {
        var services = this.requiredServices;
        if (this.hasWitness())
            services |= common.services.WITNESS;
        return services;
    };
    /**
     * Test whether required services are available.
     * @param {Number} services
     * @returns {Boolean}
     */
    PoolOptions.prototype.hasServices = function (services) {
        return (this.services & services) === services;
    };
    /**
     * Whether segwit is enabled.
     * @private
     * @returns {Boolean}
     */
    PoolOptions.prototype.hasWitness = function () {
        return this.chain.state.hasWitness();
    };
    /**
     * Create a version packet nonce.
     * @private
     * @param {String} hostname
     * @returns {Buffer}
     */
    PoolOptions.prototype.createNonce = function (hostname) {
        return this.nonces.alloc(hostname);
    };
    /**
     * Test whether version nonce is ours.
     * @private
     * @param {Buffer} nonce
     * @returns {Boolean}
     */
    PoolOptions.prototype.hasNonce = function (nonce) {
        return this.nonces.has(nonce);
    };
    /**
     * Get fee rate for txid.
     * @private
     * @param {Hash} hash
     * @returns {Rate}
     */
    PoolOptions.prototype.getRate = function (hash) {
        if (!this.mempool)
            return -1;
        var entry = this.mempool.getEntry(hash);
        if (!entry)
            return -1;
        return entry.getRate();
    };
    /**
     * Default createSocket call.
     * @private
     * @param {Number} port
     * @param {String} host
     * @returns {net.Socket}
     */
    PoolOptions.prototype._createSocket = function (port, host) {
        if (this.proxy)
            return socks.connect(this.proxy, port, host);
        return tcp.createSocket(port, host);
    };
    /**
     * Default resolve call.
     * @private
     * @param {String} name
     * @returns {String[]}
     */
    PoolOptions.prototype._resolve = function (name) {
        if (this.onion)
            return socks.resolve(this.proxy, name);
        return dns.lookup(name);
    };
    return PoolOptions;
}());
/**
 * Peer List
 * @alias module:net.PeerList
 */
var PeerList = /** @class */ (function () {
    /**
     * Create peer list.
     * @constructor
     * @param {Object} options
     */
    function PeerList() {
        this.map = new Map();
        this.ids = new Map();
        this.list = new List();
        this.load = null;
        this.inbound = 0;
        this.outbound = 0;
    }
    /**
     * Get the list head.
     * @returns {Peer}
     */
    PeerList.prototype.head = function () {
        return this.list.head;
    };
    /**
     * Get the list tail.
     * @returns {Peer}
     */
    PeerList.prototype.tail = function () {
        return this.list.tail;
    };
    /**
     * Get list size.
     * @returns {Number}
     */
    PeerList.prototype.size = function () {
        return this.list.size;
    };
    /**
     * Add peer to list.
     * @param {Peer} peer
     */
    PeerList.prototype.add = function (peer) {
        assert(this.list.push(peer));
        assert(!this.map.has(peer.hostname()));
        this.map.set(peer.hostname(), peer);
        assert(!this.ids.has(peer.id));
        this.ids.set(peer.id, peer);
        if (peer.outbound)
            this.outbound += 1;
        else
            this.inbound += 1;
    };
    /**
     * Remove peer from list.
     * @param {Peer} peer
     */
    PeerList.prototype.remove = function (peer) {
        assert(this.list.remove(peer));
        assert(this.ids.has(peer.id));
        this.ids["delete"](peer.id);
        assert(this.map.has(peer.hostname()));
        this.map["delete"](peer.hostname());
        if (peer === this.load) {
            assert(peer.loader);
            peer.loader = false;
            this.load = null;
        }
        if (peer.outbound)
            this.outbound -= 1;
        else
            this.inbound -= 1;
    };
    /**
     * Get peer by hostname.
     * @param {String} hostname
     * @returns {Peer}
     */
    PeerList.prototype.get = function (hostname) {
        return this.map.get(hostname);
    };
    /**
     * Test whether a peer exists.
     * @param {String} hostname
     * @returns {Boolean}
     */
    PeerList.prototype.has = function (hostname) {
        return this.map.has(hostname);
    };
    /**
     * Get peer by ID.
     * @param {Number} id
     * @returns {Peer}
     */
    PeerList.prototype.find = function (id) {
        return this.ids.get(id);
    };
    /**
     * Destroy peer list (kills peers).
     */
    PeerList.prototype.destroy = function () {
        var next;
        for (var peer = this.list.head; peer; peer = next) {
            next = peer.next;
            peer.destroy();
        }
    };
    return PeerList;
}());
/**
 * Broadcast Item
 * Represents an item that is broadcasted via an inv/getdata cycle.
 * @alias module:net.BroadcastItem
 * @extends EventEmitter
 * @private
 * @emits BroadcastItem#ack
 * @emits BroadcastItem#reject
 * @emits BroadcastItem#timeout
 */
var BroadcastItem = /** @class */ (function (_super) {
    __extends(BroadcastItem, _super);
    /**
     * Create broadcast item.
     * @constructor
     * @param {Pool} pool
     * @param {TX|Block} msg
     */
    function BroadcastItem(pool, msg) {
        var _this = _super.call(this) || this;
        assert(!msg.mutable, 'Cannot broadcast mutable item.');
        var item = msg.toInv();
        _this.pool = pool;
        _this.hash = item.hash;
        _this.type = item.type;
        _this.msg = msg;
        _this.jobs = [];
        return _this;
    }
    /**
     * Add a job to be executed on ack, timeout, or reject.
     */
    BroadcastItem.prototype.addJob = function (resolve, reject) {
        this.jobs.push({ resolve: resolve, reject: reject });
    };
    /**
     * Start the broadcast.
     */
    BroadcastItem.prototype.start = function () {
        assert(!this.timeout, 'Already started.');
        assert(!this.pool.invMap.has(this.hash), 'Already started.');
        this.pool.invMap.set(this.hash, this);
        this.refresh();
        return this;
    };
    /**
     * Refresh the timeout on the broadcast.
     */
    BroadcastItem.prototype.refresh = function () {
        var _this = this;
        if (this.timeout != null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(function () {
            _this.emit('timeout');
            _this.reject(new Error('Timed out.'));
        }, this.pool.options.invTimeout);
    };
    /**
     * Announce the item.
     */
    BroadcastItem.prototype.announce = function () {
        switch (this.type) {
            case invTypes.TX:
                this.pool.announceTX(this.msg);
                break;
            case invTypes.BLOCK:
                this.pool.announceBlock(this.msg);
                break;
            default:
                assert(false, 'Bad type.');
                break;
        }
    };
    /**
     * Finish the broadcast.
     */
    BroadcastItem.prototype.cleanup = function () {
        assert(this.timeout != null, 'Already finished.');
        assert(this.pool.invMap.has(this.hash), 'Already finished.');
        clearTimeout(this.timeout);
        this.timeout = null;
        this.pool.invMap["delete"](this.hash);
    };
    /**
     * Finish the broadcast, return with an error.
     * @param {Error} err
     */
    BroadcastItem.prototype.reject = function (err) {
        this.cleanup();
        for (var _i = 0, _a = this.jobs; _i < _a.length; _i++) {
            var job = _a[_i];
            job.reject(err);
        }
        this.jobs.length = 0;
    };
    /**
     * Finish the broadcast successfully.
     */
    BroadcastItem.prototype.resolve = function () {
        this.cleanup();
        for (var _i = 0, _a = this.jobs; _i < _a.length; _i++) {
            var job = _a[_i];
            job.resolve(false);
        }
        this.jobs.length = 0;
    };
    /**
     * Handle an ack from a peer.
     * @param {Peer} peer
     */
    BroadcastItem.prototype.handleAck = function (peer) {
        var _this = this;
        setTimeout(function () {
            _this.emit('ack', peer);
            for (var _i = 0, _a = _this.jobs; _i < _a.length; _i++) {
                var job = _a[_i];
                job.resolve(true);
            }
            _this.jobs.length = 0;
        }, 1000);
    };
    /**
     * Handle a reject from a peer.
     * @param {Peer} peer
     */
    BroadcastItem.prototype.handleReject = function (peer) {
        this.emit('reject', peer);
        for (var _i = 0, _a = this.jobs; _i < _a.length; _i++) {
            var job = _a[_i];
            job.resolve(false);
        }
        this.jobs.length = 0;
    };
    /**
     * Inspect the broadcast item.
     * @returns {String}
     */
    BroadcastItem.prototype[inspectSymbol] = function () {
        var type = this.type === invTypes.TX ? 'tx' : 'block';
        var hash = util.revHex(this.hash);
        return "<BroadcastItem: type=".concat(type, " hash=").concat(hash, ">");
    };
    return BroadcastItem;
}(EventEmitter));
/**
 * Nonce List
 * @ignore
 */
var NonceList = /** @class */ (function () {
    /**
     * Create nonce list.
     * @constructor
     */
    function NonceList() {
        this.map = new BufferMap();
        this.hosts = new Map();
    }
    NonceList.prototype.alloc = function (hostname) {
        for (;;) {
            var nonce = common.nonce();
            if (this.map.has(nonce))
                continue;
            this.map.set(nonce, hostname);
            assert(!this.hosts.has(hostname));
            this.hosts.set(hostname, nonce);
            return nonce;
        }
    };
    NonceList.prototype.has = function (nonce) {
        return this.map.has(nonce);
    };
    NonceList.prototype.remove = function (hostname) {
        var key = this.hosts.get(hostname);
        if (!key)
            return false;
        this.hosts["delete"](hostname);
        assert(this.map.has(key));
        this.map["delete"](key);
        return true;
    };
    return NonceList;
}());
/**
 * Header Entry
 * @ignore
 */
var HeaderEntry = /** @class */ (function () {
    /**
     * Create header entry.
     * @constructor
     */
    function HeaderEntry(hash, height) {
        this.hash = hash;
        this.height = height;
        this.prev = null;
        this.next = null;
    }
    return HeaderEntry;
}());
/*
 * Expose
 */
module.exports = Pool;
