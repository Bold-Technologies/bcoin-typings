/*!
 * peer.js - peer object for bcoin
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
var format = require('util').format;
var tcp = require('btcp');
var dns = require('bdns');
var Logger = require('blgr');
var RollingFilter = require('bfilter').RollingFilter;
var BufferMap = require('buffer-map').BufferMap;
var Parser = require('./parser');
var Framer = require('./framer');
var packets = require('./packets');
var consensus = require('../protocol/consensus');
var common = require('./common');
var InvItem = require('../primitives/invitem');
var BIP152 = require('./bip152');
var Block = require('../primitives/block');
var TX = require('../primitives/tx');
var NetAddress = require('./netaddress');
var Network = require('../protocol/network');
var services = common.services;
var invTypes = InvItem.types;
var packetTypes = packets.types;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Represents a network peer.
 * @alias module:net.Peer
 * @extends EventEmitter
 * @property {net.Socket} socket
 * @property {NetAddress} address
 * @property {Parser} parser
 * @property {Framer} framer
 * @property {Number} version
 * @property {Boolean} destroyed
 * @property {Boolean} ack - Whether verack has been received.
 * @property {Boolean} connected
 * @property {Number} time
 * @property {Boolean} preferHeaders - Whether the peer has
 * requested getheaders.
 * @property {Hash?} hashContinue - The block hash at which to continue
 * the sync for the peer.
 * @property {Bloom?} spvFilter - The _peer's_ bloom spvFilter.
 * @property {Boolean} noRelay - Whether to relay transactions
 * immediately to the peer.
 * @property {BN} challenge - Local nonce.
 * @property {Number} lastPong - Timestamp for last `pong`
 * received (unix time).
 * @property {Number} lastPing - Timestamp for last `ping`
 * sent (unix time).
 * @property {Number} minPing - Lowest ping time seen.
 * @property {Number} banScore
 */
var Peer = /** @class */ (function (_super) {
    __extends(Peer, _super);
    /**
     * Create a peer.
     * @alias module:net.Peer
     * @constructor
     * @param {PeerOptions|PoolOptions} options
     */
    function Peer(options) {
        var _this = _super.call(this) || this;
        _this.options = options;
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('peer');
        _this.locker = new Lock();
        _this.parser = new Parser(_this.network);
        _this.framer = new Framer(_this.network);
        _this.id = -1;
        _this.socket = null;
        _this.opened = false;
        _this.outbound = false;
        _this.loader = false;
        _this.address = new NetAddress();
        _this.local = new NetAddress();
        _this.name = null;
        _this.connected = false;
        _this.destroyed = false;
        _this.ack = false;
        _this.handshake = false;
        _this.time = 0;
        _this.lastSend = 0;
        _this.lastRecv = 0;
        _this.drainSize = 0;
        _this.drainQueue = [];
        _this.banScore = 0;
        _this.invQueue = [];
        _this.onPacket = null;
        _this.next = null;
        _this.prev = null;
        _this.version = -1;
        _this.services = 0;
        _this.height = -1;
        _this.agent = null;
        _this.noRelay = false;
        _this.preferHeaders = false;
        _this.hashContinue = null;
        _this.spvFilter = null;
        _this.feeRate = -1;
        _this.compactMode = -1;
        _this.compactWitness = false;
        _this.merkleBlock = null;
        _this.merkleTime = -1;
        _this.merkleMatches = 0;
        _this.merkleMap = null;
        _this.syncing = false;
        _this.sentAddr = false;
        _this.sentGetAddr = false;
        _this.challenge = null;
        _this.lastPong = -1;
        _this.lastPing = -1;
        _this.minPing = -1;
        _this.blockTime = -1;
        _this.bestHash = null;
        _this.bestHeight = -1;
        _this.connectTimeout = null;
        _this.pingTimer = null;
        _this.invTimer = null;
        _this.stallTimer = null;
        _this.addrFilter = new RollingFilter(5000, 0.001);
        _this.invFilter = new RollingFilter(50000, 0.000001);
        _this.blockMap = new BufferMap();
        _this.txMap = new BufferMap();
        _this.responseMap = new Map();
        _this.compactBlocks = new BufferMap();
        _this.init();
        return _this;
    }
    /**
     * Create inbound peer from socket.
     * @param {PeerOptions} options
     * @param {net.Socket} socket
     * @returns {Peer}
     */
    Peer.fromInbound = function (options, socket) {
        var peer = new this(options);
        peer.accept(socket);
        return peer;
    };
    /**
     * Create outbound peer from net address.
     * @param {PeerOptions} options
     * @param {NetAddress} addr
     * @returns {Peer}
     */
    Peer.fromOutbound = function (options, addr) {
        var peer = new this(options);
        peer.connect(addr);
        return peer;
    };
    /**
     * Create a peer from options.
     * @param {Object} options
     * @returns {Peer}
     */
    Peer.fromOptions = function (options) {
        return new this(new PeerOptions(options));
    };
    /**
     * Begin peer initialization.
     * @private
     */
    Peer.prototype.init = function () {
        var _this = this;
        this.parser.on('packet', function (packet) { return __awaiter(_this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.readPacket(packet)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.error(e_1);
                        this.destroy();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this.parser.on('error', function (err) {
            if (_this.destroyed)
                return;
            _this.error(err);
            _this.sendReject('malformed', 'error parsing message');
            _this.increaseBan(10);
        });
    };
    /**
     * Getter to retrieve hostname.
     * @returns {String}
     */
    Peer.prototype.hostname = function () {
        return this.address.hostname;
    };
    /**
     * Frame a payload with a header.
     * @param {String} cmd - Packet type.
     * @param {Buffer} payload
     * @returns {Buffer} Payload with header prepended.
     */
    Peer.prototype.framePacket = function (cmd, payload, checksum) {
        return this.framer.packet(cmd, payload, checksum);
    };
    /**
     * Feed data to the parser.
     * @param {Buffer} data
     */
    Peer.prototype.feedParser = function (data) {
        return this.parser.feed(data);
    };
    /**
     * Bind to socket.
     * @param {net.Socket} socket
     */
    Peer.prototype._bind = function (socket) {
        var _this = this;
        assert(!this.socket);
        this.socket = socket;
        this.socket.once('error', function (err) {
            if (!_this.connected)
                return;
            _this.error(err);
            _this.destroy();
        });
        this.socket.once('close', function () {
            _this.error('Socket hangup.');
            _this.destroy();
        });
        this.socket.on('drain', function () {
            _this.handleDrain();
        });
        this.socket.on('data', function (chunk) {
            _this.lastRecv = Date.now();
            _this.feedParser(chunk);
        });
        this.socket.setNoDelay(true);
    };
    /**
     * Accept an inbound socket.
     * @param {net.Socket} socket
     * @returns {net.Socket}
     */
    Peer.prototype.accept = function (socket) {
        assert(!this.socket);
        this.address = NetAddress.fromSocket(socket, this.network);
        this.address.services = 0;
        this.time = Date.now();
        this.outbound = false;
        this.connected = true;
        this._bind(socket);
        return socket;
    };
    /**
     * Create the socket and begin connecting. This method
     * will use `options.createSocket` if provided.
     * @param {NetAddress} addr
     * @returns {net.Socket}
     */
    Peer.prototype.connect = function (addr) {
        assert(!this.socket);
        var socket = this.options.createSocket(addr.port, addr.host);
        this.address = addr;
        this.outbound = true;
        this.connected = false;
        this._bind(socket);
        return socket;
    };
    /**
     * Do a reverse dns lookup on peer's addr.
     * @returns {Promise}
     */
    Peer.prototype.getName = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, host, port, hostname, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!!this.name) return [3 /*break*/, 2];
                        _a = this.address, host = _a.host, port = _a.port;
                        return [4 /*yield*/, dns.lookupService(host, port)];
                    case 1:
                        hostname = (_b.sent()).hostname;
                        this.name = hostname;
                        _b.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        e_2 = _b.sent();
                        ;
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, this.name];
                }
            });
        });
    };
    /**
     * Open and perform initial handshake (without rejection).
     * @method
     * @returns {Promise}
     */
    Peer.prototype.tryOpen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.open()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        ;
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open and perform initial handshake.
     * @method
     * @returns {Promise}
     */
    Peer.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._open()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_4 = _a.sent();
                        this.error(e_4);
                        this.destroy();
                        throw e_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open and perform initial handshake.
     * @method
     * @returns {Promise}
     */
    Peer.prototype._open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.opened = true;
                        // Connect to peer.
                        return [4 /*yield*/, this.initConnect()];
                    case 1:
                        // Connect to peer.
                        _a.sent();
                        return [4 /*yield*/, this.initStall()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.initVersion()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.finalize()];
                    case 4:
                        _a.sent();
                        assert(!this.destroyed);
                        // Finally we can let the pool know
                        // that this peer is ready to go.
                        this.emit('open');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Wait for connection.
     * @private
     * @returns {Promise}
     */
    Peer.prototype.initConnect = function () {
        var _this = this;
        if (this.connected) {
            assert(!this.outbound);
            return Promise.resolve();
        }
        return new Promise(function (resolve, reject) {
            var cleanup = function () {
                if (_this.connectTimeout != null) {
                    clearTimeout(_this.connectTimeout);
                    _this.connectTimeout = null;
                }
                // eslint-disable-next-line no-use-before-define
                _this.socket.removeListener('error', onError);
            };
            var onError = function (err) {
                cleanup();
                reject(err);
            };
            _this.socket.once('connect', function () {
                _this.time = Date.now();
                _this.connected = true;
                _this.emit('connect');
                cleanup();
                resolve();
            });
            _this.socket.once('error', onError);
            _this.connectTimeout = setTimeout(function () {
                _this.connectTimeout = null;
                cleanup();
                reject(new Error('Connection timed out.'));
            }, 10000);
        });
    };
    /**
     * Setup stall timer.
     * @private
     * @returns {Promise}
     */
    Peer.prototype.initStall = function () {
        var _this = this;
        assert(!this.stallTimer);
        assert(!this.destroyed);
        this.stallTimer = setInterval(function () {
            _this.maybeTimeout();
        }, Peer.STALL_INTERVAL);
        return Promise.resolve();
    };
    /**
     * Handle post handshake.
     * @method
     * @private
     * @returns {Promise}
     */
    Peer.prototype.initVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(!this.destroyed);
                        // Say hello.
                        this.sendVersion();
                        if (!!this.ack) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wait(packetTypes.VERACK, 10000)];
                    case 1:
                        _a.sent();
                        assert(this.ack);
                        _a.label = 2;
                    case 2:
                        if (!(this.version === -1)) return [3 /*break*/, 4];
                        this.logger.debug('Peer sent a verack without a version (%s).', this.hostname());
                        return [4 /*yield*/, this.wait(packetTypes.VERSION, 10000)];
                    case 3:
                        _a.sent();
                        assert(this.version !== -1);
                        _a.label = 4;
                    case 4:
                        if (this.destroyed)
                            throw new Error('Peer was destroyed during handshake.');
                        this.handshake = true;
                        this.logger.debug('Version handshake complete (%s).', this.hostname());
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Finalize peer after handshake.
     * @method
     * @private
     * @returns {Promise}
     */
    Peer.prototype.finalize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                assert(!this.destroyed);
                // Setup the ping interval.
                this.pingTimer = setInterval(function () {
                    _this.sendPing();
                }, Peer.PING_INTERVAL);
                // Setup the inv flusher.
                this.invTimer = setInterval(function () {
                    _this.flushInv();
                }, Peer.INV_INTERVAL);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Broadcast blocks to peer.
     * @param {Block|Block[]} blocks
     */
    Peer.prototype.announceBlock = function (blocks) {
        if (!this.handshake)
            return;
        if (this.destroyed)
            return;
        if (!Array.isArray(blocks))
            blocks = [blocks];
        var inv = [];
        for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
            var block = blocks_1[_i];
            assert(block instanceof Block);
            // Don't send if they already have it.
            if (this.invFilter.test(block.hash()))
                continue;
            // Send them the block immediately if
            // they're using compact block mode 1.
            if (this.compactMode === 1) {
                this.invFilter.add(block.hash());
                this.sendCompactBlock(block);
                continue;
            }
            // Convert item to block headers
            // for peers that request it.
            if (this.preferHeaders) {
                inv.push(block.toHeaders());
                continue;
            }
            inv.push(block.toInv());
        }
        if (this.preferHeaders) {
            this.sendHeaders(inv);
            return;
        }
        this.queueInv(inv);
    };
    /**
     * Broadcast transactions to peer.
     * @param {TX|TX[]} txs
     */
    Peer.prototype.announceTX = function (txs) {
        if (!this.handshake)
            return;
        if (this.destroyed)
            return;
        // Do not send txs to spv clients
        // that have relay unset.
        if (this.noRelay)
            return;
        if (!Array.isArray(txs))
            txs = [txs];
        var inv = [];
        for (var _i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
            var tx = txs_1[_i];
            assert(tx instanceof TX);
            // Don't send if they already have it.
            if (this.invFilter.test(tx.hash()))
                continue;
            // Check the peer's bloom
            // filter if they're using spv.
            if (this.spvFilter) {
                if (!tx.isWatched(this.spvFilter))
                    continue;
            }
            // Check the fee filter.
            if (this.feeRate !== -1) {
                var hash = tx.hash();
                var rate = this.options.getRate(hash);
                if (rate !== -1 && rate < this.feeRate)
                    continue;
            }
            inv.push(tx.toInv());
        }
        this.queueInv(inv);
    };
    /**
     * Send inv to a peer.
     * @param {InvItem[]} items
     */
    Peer.prototype.queueInv = function (items) {
        if (!this.handshake)
            return;
        if (this.destroyed)
            return;
        if (!Array.isArray(items))
            items = [items];
        var hasBlock = false;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            if (item.type === invTypes.BLOCK)
                hasBlock = true;
            this.invQueue.push(item);
        }
        if (this.invQueue.length >= 500 || hasBlock)
            this.flushInv();
    };
    /**
     * Flush inv queue.
     * @private
     */
    Peer.prototype.flushInv = function () {
        if (this.destroyed)
            return;
        var queue = this.invQueue;
        if (queue.length === 0)
            return;
        this.invQueue = [];
        this.logger.spam('Serving %d inv items to %s.', queue.length, this.hostname());
        var items = [];
        for (var _i = 0, queue_1 = queue; _i < queue_1.length; _i++) {
            var item = queue_1[_i];
            if (!this.invFilter.added(item.hash))
                continue;
            items.push(item);
        }
        for (var i = 0; i < items.length; i += 1000) {
            var chunk = items.slice(i, i + 1000);
            this.send(new packets.InvPacket(chunk));
        }
    };
    /**
     * Force send an inv (no filter check).
     * @param {InvItem[]} items
     */
    Peer.prototype.sendInv = function (items) {
        if (!this.handshake)
            return;
        if (this.destroyed)
            return;
        if (!Array.isArray(items))
            items = [items];
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var item = items_2[_i];
            this.invFilter.add(item.hash);
        }
        if (items.length === 0)
            return;
        this.logger.spam('Serving %d inv items to %s.', items.length, this.hostname());
        for (var i = 0; i < items.length; i += 1000) {
            var chunk = items.slice(i, i + 1000);
            this.send(new packets.InvPacket(chunk));
        }
    };
    /**
     * Send headers to a peer.
     * @param {Headers[]} items
     */
    Peer.prototype.sendHeaders = function (items) {
        if (!this.handshake)
            return;
        if (this.destroyed)
            return;
        if (!Array.isArray(items))
            items = [items];
        for (var _i = 0, items_3 = items; _i < items_3.length; _i++) {
            var item = items_3[_i];
            this.invFilter.add(item.hash());
        }
        if (items.length === 0)
            return;
        this.logger.spam('Serving %d headers to %s.', items.length, this.hostname());
        for (var i = 0; i < items.length; i += 2000) {
            var chunk = items.slice(i, i + 2000);
            this.send(new packets.HeadersPacket(chunk));
        }
    };
    /**
     * Send a compact block.
     * @private
     * @param {Block} block
     * @returns {Boolean}
     */
    Peer.prototype.sendCompactBlock = function (block) {
        var witness = this.compactWitness;
        var compact = BIP152.CompactBlock.fromBlock(block, witness);
        this.send(new packets.CmpctBlockPacket(compact, witness));
    };
    /**
     * Send a `version` packet.
     */
    Peer.prototype.sendVersion = function () {
        var packet = new packets.VersionPacket();
        packet.version = this.options.version;
        packet.services = this.options.services;
        packet.time = this.network.now();
        packet.remote = this.address;
        packet.local.setNull();
        packet.local.services = this.options.services;
        packet.nonce = this.options.createNonce(this.hostname());
        packet.agent = this.options.agent;
        packet.height = this.options.getHeight();
        packet.noRelay = this.options.noRelay;
        this.send(packet);
    };
    /**
     * Send a `getaddr` packet.
     */
    Peer.prototype.sendGetAddr = function () {
        if (this.sentGetAddr)
            return;
        this.sentGetAddr = true;
        this.send(new packets.GetAddrPacket());
    };
    /**
     * Send a `ping` packet.
     */
    Peer.prototype.sendPing = function () {
        if (!this.handshake)
            return;
        if (this.version <= common.PONG_VERSION) {
            this.send(new packets.PingPacket());
            return;
        }
        if (this.challenge) {
            this.logger.debug('Peer has not responded to ping (%s).', this.hostname());
            return;
        }
        this.lastPing = Date.now();
        this.challenge = common.nonce();
        this.send(new packets.PingPacket(this.challenge));
    };
    /**
     * Send `filterload` to update the local bloom filter.
     */
    Peer.prototype.sendFilterLoad = function (filter) {
        if (!this.handshake)
            return;
        if (!this.options.spv)
            return;
        if (!(this.services & services.BLOOM))
            return;
        this.send(new packets.FilterLoadPacket(filter));
    };
    /**
     * Set a fee rate filter for the peer.
     * @param {Rate} rate
     */
    Peer.prototype.sendFeeRate = function (rate) {
        if (!this.handshake)
            return;
        this.send(new packets.FeeFilterPacket(rate));
    };
    /**
     * Disconnect from and destroy the peer.
     */
    Peer.prototype.destroy = function () {
        var connected = this.connected;
        if (this.destroyed)
            return;
        this.destroyed = true;
        this.connected = false;
        this.socket.destroy();
        this.socket = null;
        if (this.pingTimer != null) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
        if (this.invTimer != null) {
            clearInterval(this.invTimer);
            this.invTimer = null;
        }
        if (this.stallTimer != null) {
            clearInterval(this.stallTimer);
            this.stallTimer = null;
        }
        if (this.connectTimeout != null) {
            clearTimeout(this.connectTimeout);
            this.connectTimeout = null;
        }
        var jobs = this.drainQueue;
        this.drainSize = 0;
        this.drainQueue = [];
        for (var _i = 0, jobs_1 = jobs; _i < jobs_1.length; _i++) {
            var job = jobs_1[_i];
            job.reject(new Error('Peer was destroyed.'));
        }
        for (var _a = 0, _b = this.responseMap; _a < _b.length; _a++) {
            var _c = _b[_a], cmd = _c[0], entry = _c[1];
            this.responseMap["delete"](cmd);
            entry.reject(new Error('Peer was destroyed.'));
        }
        this.locker.destroy();
        this.emit('close', connected);
    };
    /**
     * Write data to the peer's socket.
     * @param {Buffer} data
     */
    Peer.prototype.write = function (data) {
        if (this.destroyed)
            throw new Error('Peer is destroyed (write).');
        this.lastSend = Date.now();
        if (this.socket.write(data) === false)
            this.needsDrain(data.length);
    };
    /**
     * Send a packet.
     * @param {Packet} packet
     */
    Peer.prototype.send = function (packet) {
        if (this.destroyed)
            throw new Error('Peer is destroyed (send).');
        // Used cached hashes as the
        // packet checksum for speed.
        var checksum = null;
        if (packet.type === packetTypes.TX) {
            var tx = packet.tx;
            if (packet.witness) {
                if (!tx.isCoinbase())
                    checksum = tx.witnessHash();
            }
            else {
                checksum = tx.hash();
            }
        }
        this.sendRaw(packet.cmd, packet.toRaw(), checksum);
        this.addTimeout(packet);
    };
    /**
     * Send a packet.
     * @param {Packet} packet
     */
    Peer.prototype.sendRaw = function (cmd, body, checksum) {
        var payload = this.framePacket(cmd, body, checksum);
        this.write(payload);
    };
    /**
     * Wait for a drain event.
     * @returns {Promise}
     */
    Peer.prototype.drain = function () {
        var _this = this;
        if (this.destroyed)
            return Promise.reject(new Error('Peer is destroyed.'));
        if (this.drainSize === 0)
            return Promise.resolve();
        return new Promise(function (resolve, reject) {
            _this.drainQueue.push({ resolve: resolve, reject: reject });
        });
    };
    /**
     * Handle drain event.
     * @private
     */
    Peer.prototype.handleDrain = function () {
        var jobs = this.drainQueue;
        this.drainSize = 0;
        if (jobs.length === 0)
            return;
        this.drainQueue = [];
        for (var _i = 0, jobs_2 = jobs; _i < jobs_2.length; _i++) {
            var job = jobs_2[_i];
            job.resolve();
        }
    };
    /**
     * Add to drain counter.
     * @private
     * @param {Number} size
     */
    Peer.prototype.needsDrain = function (size) {
        this.drainSize += size;
        if (this.drainSize >= Peer.DRAIN_MAX) {
            this.logger.warning('Peer is not reading: %dmb buffered (%s).', this.drainSize / (1 << 20), this.hostname());
            this.error('Peer stalled (drain).');
            this.destroy();
        }
    };
    /**
     * Potentially add response timeout.
     * @private
     * @param {Packet} packet
     */
    Peer.prototype.addTimeout = function (packet) {
        var timeout = Peer.RESPONSE_TIMEOUT;
        if (!this.outbound)
            return;
        switch (packet.type) {
            case packetTypes.MEMPOOL:
                this.request(packetTypes.INV, timeout);
                break;
            case packetTypes.GETBLOCKS:
                if (!this.options.isFull())
                    this.request(packetTypes.INV, timeout);
                break;
            case packetTypes.GETHEADERS:
                this.request(packetTypes.HEADERS, timeout * 2);
                break;
            case packetTypes.GETDATA:
                this.request(packetTypes.DATA, timeout * 2);
                break;
            case packetTypes.GETBLOCKTXN:
                this.request(packetTypes.BLOCKTXN, timeout);
                break;
        }
    };
    /**
     * Potentially finish response timeout.
     * @private
     * @param {Packet} packet
     */
    Peer.prototype.fulfill = function (packet) {
        switch (packet.type) {
            case packetTypes.BLOCK:
            case packetTypes.CMPCTBLOCK:
            case packetTypes.MERKLEBLOCK:
            case packetTypes.TX:
            case packetTypes.NOTFOUND: {
                var entry = this.response(packetTypes.DATA, packet);
                assert(!entry || entry.jobs.length === 0);
                break;
            }
        }
        return this.response(packet.type, packet);
    };
    /**
     * Potentially timeout peer if it hasn't responded.
     * @private
     */
    Peer.prototype.maybeTimeout = function () {
        var now = Date.now();
        for (var _i = 0, _a = this.responseMap; _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], entry = _b[1];
            if (now > entry.timeout) {
                var name_1 = packets.typesByVal[key];
                this.error('Peer is stalling (%s).', name_1.toLowerCase());
                this.destroy();
                return;
            }
        }
        if (this.merkleBlock) {
            assert(this.merkleTime !== -1);
            if (now > this.merkleTime + Peer.BLOCK_TIMEOUT) {
                this.error('Peer is stalling (merkleblock).');
                this.destroy();
                return;
            }
        }
        if (this.syncing && this.loader && !this.options.isFull()) {
            if (now > this.blockTime + Peer.BLOCK_TIMEOUT) {
                this.error('Peer is stalling (block).');
                this.destroy();
                return;
            }
        }
        if (this.options.isFull() || !this.syncing) {
            for (var _c = 0, _d = this.blockMap.values(); _c < _d.length; _c++) {
                var time = _d[_c];
                if (now > time + Peer.BLOCK_TIMEOUT) {
                    this.error('Peer is stalling (block).');
                    this.destroy();
                    return;
                }
            }
            for (var _e = 0, _f = this.txMap.values(); _e < _f.length; _e++) {
                var time = _f[_e];
                if (now > time + Peer.TX_TIMEOUT) {
                    this.error('Peer is stalling (tx).');
                    this.destroy();
                    return;
                }
            }
            for (var _g = 0, _h = this.compactBlocks.values(); _g < _h.length; _g++) {
                var block = _h[_g];
                if (now > block.now + Peer.RESPONSE_TIMEOUT) {
                    this.error('Peer is stalling (blocktxn).');
                    this.destroy();
                    return;
                }
            }
        }
        if (now > this.time + 60000) {
            assert(this.time !== 0);
            if (this.lastRecv === 0 || this.lastSend === 0) {
                this.error('Peer is stalling (no message).');
                this.destroy();
                return;
            }
            if (now > this.lastSend + Peer.TIMEOUT_INTERVAL) {
                this.error('Peer is stalling (send).');
                this.destroy();
                return;
            }
            var mult = this.version <= common.PONG_VERSION ? 4 : 1;
            if (now > this.lastRecv + Peer.TIMEOUT_INTERVAL * mult) {
                this.error('Peer is stalling (recv).');
                this.destroy();
                return;
            }
            if (this.challenge && now > this.lastPing + Peer.TIMEOUT_INTERVAL) {
                this.error('Peer is stalling (ping).');
                this.destroy();
                return;
            }
        }
    };
    /**
     * Wait for a packet to be received from peer.
     * @private
     * @param {Number} type - Packet type.
     * @param {Number} timeout
     * @returns {RequestEntry}
     */
    Peer.prototype.request = function (type, timeout) {
        if (this.destroyed)
            return null;
        var entry = this.responseMap.get(type);
        if (!entry) {
            entry = new RequestEntry();
            this.responseMap.set(type, entry);
            if (this.responseMap.size >= common.MAX_REQUEST) {
                this.destroy();
                return null;
            }
        }
        entry.setTimeout(timeout);
        return entry;
    };
    /**
     * Fulfill awaiting requests created with {@link Peer#request}.
     * @private
     * @param {Number} type - Packet type.
     * @param {Object} payload
     */
    Peer.prototype.response = function (type, payload) {
        var entry = this.responseMap.get(type);
        if (!entry)
            return null;
        this.responseMap["delete"](type);
        return entry;
    };
    /**
     * Wait for a packet to be received from peer.
     * @private
     * @param {Number} type - Packet type.
     * @returns {Promise} - Returns Object(payload).
     * Executed on timeout or once packet is received.
     */
    Peer.prototype.wait = function (type, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var entry = _this.request(type);
            if (!entry) {
                reject(new Error('Peer is destroyed (request).'));
                return;
            }
            entry.setTimeout(timeout);
            entry.addJob(resolve, reject);
        });
    };
    /**
     * Emit an error and destroy the peer.
     * @private
     * @param {...String|Error} err
     */
    Peer.prototype.error = function (err) {
        if (this.destroyed)
            return;
        if (typeof err === 'string') {
            var msg = format.apply(null, arguments);
            err = new Error(msg);
        }
        if (typeof err.code === 'string' && err.code[0] === 'E') {
            var msg = err.code;
            err = new Error(msg);
            err.code = msg;
            err.message = "Socket Error: ".concat(msg);
        }
        err.message += " (".concat(this.hostname(), ")");
        this.emit('error', err);
    };
    /**
     * Calculate peer block inv type (filtered,
     * compact, witness, or non-witness).
     * @returns {Number}
     */
    Peer.prototype.blockType = function () {
        if (this.options.spv)
            return invTypes.FILTERED_BLOCK;
        if (this.options.compact
            && this.hasCompactSupport()
            && this.hasCompact()) {
            return invTypes.CMPCT_BLOCK;
        }
        if (this.hasWitness())
            return invTypes.WITNESS_BLOCK;
        return invTypes.BLOCK;
    };
    /**
     * Calculate peer tx inv type (witness or non-witness).
     * @returns {Number}
     */
    Peer.prototype.txType = function () {
        if (this.hasWitness())
            return invTypes.WITNESS_TX;
        return invTypes.TX;
    };
    /**
     * Send `getdata` to peer.
     * @param {InvItem[]} items
     */
    Peer.prototype.getData = function (items) {
        this.send(new packets.GetDataPacket(items));
    };
    /**
     * Send batched `getdata` to peer.
     * @param {InvType} type
     * @param {Hash[]} hashes
     */
    Peer.prototype.getItems = function (type, hashes) {
        var items = [];
        for (var _i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
            var hash = hashes_1[_i];
            items.push(new InvItem(type, hash));
        }
        if (items.length === 0)
            return;
        this.getData(items);
    };
    /**
     * Send batched `getdata` to peer (blocks).
     * @param {Hash[]} hashes
     */
    Peer.prototype.getBlock = function (hashes) {
        this.getItems(this.blockType(), hashes);
    };
    /**
     * Send batched `getdata` to peer (txs).
     * @param {Hash[]} hashes
     */
    Peer.prototype.getTX = function (hashes) {
        this.getItems(this.txType(), hashes);
    };
    /**
     * Send `getdata` to peer for a single block.
     * @param {Hash} hash
     */
    Peer.prototype.getFullBlock = function (hash) {
        assert(!this.options.spv);
        var type = invTypes.BLOCK;
        if (this.hasWitness())
            type |= InvItem.WITNESS_FLAG;
        this.getItems(type, [hash]);
    };
    /**
     * Handle a packet payload.
     * @method
     * @private
     * @param {Packet} packet
     */
    Peer.prototype.readPacket = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, unlock;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.destroyed)
                            return [2 /*return*/];
                        _a = packet.type;
                        switch (_a) {
                            case packetTypes.PONG: return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        _b.trys.push([1, , 3, 4]);
                        this.socket.pause();
                        return [4 /*yield*/, this.handlePacket(packet)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        if (!this.destroyed)
                            this.socket.resume();
                        return [7 /*endfinally*/];
                    case 4: return [3 /*break*/, 11];
                    case 5: return [4 /*yield*/, this.locker.lock()];
                    case 6:
                        unlock = _b.sent();
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, , 9, 10]);
                        this.socket.pause();
                        return [4 /*yield*/, this.handlePacket(packet)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        if (!this.destroyed)
                            this.socket.resume();
                        unlock();
                        return [7 /*endfinally*/];
                    case 10: return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle a packet payload without a lock.
     * @method
     * @private
     * @param {Packet} packet
     */
    Peer.prototype.handlePacket = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.destroyed)
                            throw new Error('Destroyed peer sent a packet.');
                        entry = this.fulfill(packet);
                        _a = packet.type;
                        switch (_a) {
                            case packetTypes.VERSION: return [3 /*break*/, 1];
                            case packetTypes.VERACK: return [3 /*break*/, 3];
                            case packetTypes.PING: return [3 /*break*/, 5];
                            case packetTypes.PONG: return [3 /*break*/, 7];
                            case packetTypes.SENDHEADERS: return [3 /*break*/, 9];
                            case packetTypes.FILTERLOAD: return [3 /*break*/, 11];
                            case packetTypes.FILTERADD: return [3 /*break*/, 13];
                            case packetTypes.FILTERCLEAR: return [3 /*break*/, 15];
                            case packetTypes.FEEFILTER: return [3 /*break*/, 17];
                            case packetTypes.SENDCMPCT: return [3 /*break*/, 19];
                        }
                        return [3 /*break*/, 21];
                    case 1: return [4 /*yield*/, this.handleVersion(packet)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 3: return [4 /*yield*/, this.handleVerack(packet)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 5: return [4 /*yield*/, this.handlePing(packet)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 7: return [4 /*yield*/, this.handlePong(packet)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 9: return [4 /*yield*/, this.handleSendHeaders(packet)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 11: return [4 /*yield*/, this.handleFilterLoad(packet)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 13: return [4 /*yield*/, this.handleFilterAdd(packet)];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 15: return [4 /*yield*/, this.handleFilterClear(packet)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 17: return [4 /*yield*/, this.handleFeeFilter(packet)];
                    case 18:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 19: return [4 /*yield*/, this.handleSendCmpct(packet)];
                    case 20:
                        _b.sent();
                        return [3 /*break*/, 21];
                    case 21:
                        if (!this.onPacket) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.onPacket(packet)];
                    case 22:
                        _b.sent();
                        _b.label = 23;
                    case 23:
                        this.emit('packet', packet);
                        if (entry)
                            entry.resolve(packet);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle `version` packet.
     * @method
     * @private
     * @param {VersionPacket} packet
     */
    Peer.prototype.handleVersion = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.version !== -1)
                    throw new Error('Peer sent a duplicate version.');
                this.version = packet.version;
                this.services = packet.services;
                this.height = packet.height;
                this.agent = packet.agent;
                this.noRelay = packet.noRelay;
                this.local = packet.remote;
                if (!this.network.selfConnect) {
                    if (this.options.hasNonce(packet.nonce))
                        throw new Error('We connected to ourself. Oops.');
                }
                if (this.version < common.MIN_VERSION)
                    throw new Error('Peer does not support required protocol version.');
                if (this.outbound) {
                    if (!(this.services & services.NETWORK))
                        throw new Error('Peer does not support network services.');
                    if (this.options.headers) {
                        if (this.version < common.HEADERS_VERSION)
                            throw new Error('Peer does not support getheaders.');
                    }
                    if (this.options.spv) {
                        if (!(this.services & services.BLOOM))
                            throw new Error('Peer does not support BIP37.');
                        if (this.version < common.BLOOM_VERSION)
                            throw new Error('Peer does not support BIP37.');
                    }
                    if (this.options.hasWitness()) {
                        if (!(this.services & services.WITNESS))
                            throw new Error('Peer does not support segregated witness.');
                    }
                    if (this.options.compact) {
                        if (!this.hasCompactSupport()) {
                            this.logger.debug('Peer does not support compact blocks (%s).', this.hostname());
                        }
                    }
                }
                this.send(new packets.VerackPacket());
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `verack` packet.
     * @method
     * @private
     * @param {VerackPacket} packet
     */
    Peer.prototype.handleVerack = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.ack) {
                    this.logger.debug('Peer sent duplicate ack (%s).', this.hostname());
                    return [2 /*return*/];
                }
                this.ack = true;
                this.logger.debug('Received verack (%s).', this.hostname());
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `ping` packet.
     * @method
     * @private
     * @param {PingPacket} packet
     */
    Peer.prototype.handlePing = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!packet.nonce)
                    return [2 /*return*/];
                this.send(new packets.PongPacket(packet.nonce));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `pong` packet.
     * @method
     * @private
     * @param {PongPacket} packet
     */
    Peer.prototype.handlePong = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var nonce, now;
            return __generator(this, function (_a) {
                nonce = packet.nonce;
                now = Date.now();
                if (!this.challenge) {
                    this.logger.debug('Peer sent an unsolicited pong (%s).', this.hostname());
                    return [2 /*return*/];
                }
                if (!nonce.equals(this.challenge)) {
                    if (nonce.equals(common.ZERO_NONCE)) {
                        this.logger.debug('Peer sent a zero nonce (%s).', this.hostname());
                        this.challenge = null;
                        return [2 /*return*/];
                    }
                    this.logger.debug('Peer sent the wrong nonce (%s).', this.hostname());
                    return [2 /*return*/];
                }
                if (now >= this.lastPing) {
                    this.lastPong = now;
                    if (this.minPing === -1)
                        this.minPing = now - this.lastPing;
                    this.minPing = Math.min(this.minPing, now - this.lastPing);
                }
                else {
                    this.logger.debug('Timing mismatch (what?) (%s).', this.hostname());
                }
                this.challenge = null;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `sendheaders` packet.
     * @method
     * @private
     * @param {SendHeadersPacket} packet
     */
    Peer.prototype.handleSendHeaders = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.preferHeaders) {
                    this.logger.debug('Peer sent a duplicate sendheaders (%s).', this.hostname());
                    return [2 /*return*/];
                }
                this.preferHeaders = true;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filterload` packet.
     * @method
     * @private
     * @param {FilterLoadPacket} packet
     */
    Peer.prototype.handleFilterLoad = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!packet.isWithinConstraints()) {
                    this.increaseBan(100);
                    return [2 /*return*/];
                }
                this.spvFilter = packet.filter;
                this.noRelay = false;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filteradd` packet.
     * @method
     * @private
     * @param {FilterAddPacket} packet
     */
    Peer.prototype.handleFilterAdd = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = packet.data;
                if (data.length > consensus.MAX_SCRIPT_PUSH) {
                    this.increaseBan(100);
                    return [2 /*return*/];
                }
                if (this.spvFilter)
                    this.spvFilter.add(data);
                this.noRelay = false;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `filterclear` packet.
     * @method
     * @private
     * @param {FilterClearPacket} packet
     */
    Peer.prototype.handleFilterClear = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.spvFilter)
                    this.spvFilter.reset();
                this.noRelay = false;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `feefilter` packet.
     * @method
     * @private
     * @param {FeeFilterPacket} packet
     */
    Peer.prototype.handleFeeFilter = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            var rate;
            return __generator(this, function (_a) {
                rate = packet.rate;
                if (rate < 0 || rate > consensus.MAX_MONEY) {
                    this.increaseBan(100);
                    return [2 /*return*/];
                }
                this.feeRate = rate;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {SendCmpctPacket}
     */
    Peer.prototype.handleSendCmpct = function (packet) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Only support compact block relay with witnesses
                if (packet.version !== 2) {
                    // Ignore
                    this.logger.info('Peer request compact blocks version %d (%s).', packet.version, this.hostname());
                    return [2 /*return*/];
                }
                if (packet.mode > 1) {
                    this.logger.info('Peer request compact blocks mode %d (%s).', packet.mode, this.hostname());
                    return [2 /*return*/];
                }
                this.logger.info('Peer initialized compact blocks (mode=%d, version=%d) (%s).', packet.mode, packet.version, this.hostname());
                this.compactMode = packet.mode;
                this.compactWitness = packet.version === 2;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Send `getheaders` to peer. Note that unlike
     * `getblocks`, `getheaders` can have a null locator.
     * @param {Hash[]?} locator - Chain locator.
     * @param {Hash?} stop - Hash to stop at.
     */
    Peer.prototype.sendGetHeaders = function (locator, stop) {
        var packet = new packets.GetHeadersPacket(locator, stop);
        var hash = null;
        if (packet.locator.length > 0)
            hash = packet.locator[0];
        var end = null;
        if (stop)
            end = stop;
        this.logger.debug('Requesting headers packet from peer with getheaders (%s).', this.hostname());
        this.logger.debug('Sending getheaders (hash=%h, stop=%h).', hash, end);
        this.send(packet);
    };
    /**
     * Send `getblocks` to peer.
     * @param {Hash[]} locator - Chain locator.
     * @param {Hash?} stop - Hash to stop at.
     */
    Peer.prototype.sendGetBlocks = function (locator, stop) {
        var packet = new packets.GetBlocksPacket(locator, stop);
        var hash = null;
        if (packet.locator.length > 0)
            hash = packet.locator[0];
        var end = null;
        if (stop)
            end = stop;
        this.logger.debug('Requesting inv packet from peer with getblocks (%s).', this.hostname());
        this.logger.debug('Sending getblocks (hash=%h, stop=%h).', hash, end);
        this.send(packet);
    };
    /**
     * Send `mempool` to peer.
     */
    Peer.prototype.sendMempool = function () {
        if (!this.handshake)
            return;
        if (!(this.services & services.BLOOM)) {
            this.logger.debug('Cannot request mempool for non-bloom peer (%s).', this.hostname());
            return;
        }
        this.logger.debug('Requesting inv packet from peer with mempool (%s).', this.hostname());
        this.send(new packets.MempoolPacket());
    };
    /**
     * Send `reject` to peer.
     * @param {Number} code
     * @param {String} reason
     * @param {String} msg
     * @param {Hash} hash
     */
    Peer.prototype.sendReject = function (code, reason, msg, hash) {
        var reject = packets.RejectPacket.fromReason(code, reason, msg, hash);
        if (msg) {
            this.logger.debug('Rejecting %s %h (%s): code=%s reason=%s.', msg, hash, this.hostname(), code, reason);
        }
        else {
            this.logger.debug('Rejecting packet from %s: code=%s reason=%s.', this.hostname(), code, reason);
        }
        this.logger.debug('Sending reject packet to peer (%s).', this.hostname());
        this.send(reject);
    };
    /**
     * Send a `sendcmpct` packet.
     * @param {Number} mode
     */
    Peer.prototype.sendCompact = function (mode) {
        if (this.services & common.services.WITNESS) {
            if (this.version >= common.COMPACT_WITNESS_VERSION) {
                this.logger.info('Initializing witness compact blocks (%s).', this.hostname());
                this.send(new packets.SendCmpctPacket(mode, 2));
                return;
            }
        }
        if (this.version >= common.COMPACT_VERSION) {
            this.logger.info('Initializing normal compact blocks (%s).', this.hostname());
            this.send(new packets.SendCmpctPacket(mode, 1));
        }
    };
    /**
     * Increase banscore on peer.
     * @param {Number} score
     * @returns {Boolean}
     */
    Peer.prototype.increaseBan = function (score) {
        this.banScore += score;
        if (this.banScore >= this.options.banScore) {
            this.logger.debug('Ban threshold exceeded (%s).', this.hostname());
            this.ban();
            return true;
        }
        return false;
    };
    /**
     * Ban peer.
     */
    Peer.prototype.ban = function () {
        this.emit('ban');
    };
    /**
     * Send a `reject` packet to peer.
     * @param {String} msg
     * @param {VerifyError} err
     * @returns {Boolean}
     */
    Peer.prototype.reject = function (msg, err) {
        this.sendReject(err.code, err.reason, msg, err.hash);
        return this.increaseBan(err.score);
    };
    /**
     * Returns human readable list of services
     * that are available.
     * @returns {String[]}
     */
    Peer.prototype.getServiceNames = function () {
        var enabled = [];
        for (var _i = 0, _a = Object.entries(services); _i < _a.length; _i++) {
            var _b = _a[_i], service = _b[0], bit = _b[1];
            if (this.hasServices(bit))
                enabled.push(service);
        }
        return enabled;
    };
    /**
     * Test whether required services are available.
     * @param {Number} services
     * @returns {Boolean}
     */
    Peer.prototype.hasServices = function (services) {
        return (this.services & services) === services;
    };
    /**
     * Test whether the WITNESS service bit is set.
     * @returns {Boolean}
     */
    Peer.prototype.hasWitness = function () {
        return (this.services & services.WITNESS) !== 0;
    };
    /**
     * Test whether the peer supports compact blocks.
     * @returns {Boolean}
     */
    Peer.prototype.hasCompactSupport = function () {
        if (this.version < common.COMPACT_VERSION)
            return false;
        if (!this.options.hasWitness())
            return true;
        if (!(this.services & services.WITNESS))
            return false;
        return this.version >= common.COMPACT_WITNESS_VERSION;
    };
    /**
     * Test whether the peer sent us a
     * compatible compact block handshake.
     * @returns {Boolean}
     */
    Peer.prototype.hasCompact = function () {
        if (this.compactMode === -1)
            return false;
        if (!this.options.hasWitness())
            return true;
        if (!this.compactWitness)
            return false;
        return true;
    };
    /**
     * Inspect the peer.
     * @returns {String}
     */
    Peer.prototype[inspectSymbol] = function () {
        return '<Peer:'
            + " handshake=".concat(this.handshake)
            + " host=".concat(this.hostname())
            + " outbound=".concat(this.outbound)
            + " ping=".concat(this.minPing)
            + '>';
    };
    return Peer;
}(EventEmitter));
/**
 * Max output bytes buffered before
 * invoking stall behavior for peer.
 * @const {Number}
 * @default
 */
Peer.DRAIN_MAX = 10 << 20;
/**
 * Interval to check for drainage
 * and required responses from peer.
 * @const {Number}
 * @default
 */
Peer.STALL_INTERVAL = 5000;
/**
 * Interval for pinging peers.
 * @const {Number}
 * @default
 */
Peer.PING_INTERVAL = 30000;
/**
 * Interval to flush invs.
 * Higher means more invs (usually
 * txs) will be accumulated before
 * flushing.
 * @const {Number}
 * @default
 */
Peer.INV_INTERVAL = 5000;
/**
 * Required time for peers to
 * respond to messages (i.e.
 * getblocks/getdata).
 * @const {Number}
 * @default
 */
Peer.RESPONSE_TIMEOUT = 30000;
/**
 * Required time for loader to
 * respond with block/merkleblock.
 * @const {Number}
 * @default
 */
Peer.BLOCK_TIMEOUT = 120000;
/**
 * Required time for loader to
 * respond with a tx.
 * @const {Number}
 * @default
 */
Peer.TX_TIMEOUT = 120000;
/**
 * Generic timeout interval.
 * @const {Number}
 * @default
 */
Peer.TIMEOUT_INTERVAL = 20 * 60000;
/**
 * Peer Options
 * @alias module:net.PeerOptions
 */
var PeerOptions = /** @class */ (function () {
    /**
     * Create peer options.
     * @constructor
     */
    function PeerOptions(options) {
        this.network = Network.primary;
        this.logger = Logger.global;
        this.createSocket = tcp.createSocket;
        this.version = common.PROTOCOL_VERSION;
        this.services = common.LOCAL_SERVICES;
        this.agent = common.USER_AGENT;
        this.noRelay = false;
        this.spv = false;
        this.compact = false;
        this.headers = false;
        this.banScore = common.BAN_SCORE;
        this.getHeight = PeerOptions.getHeight;
        this.isFull = PeerOptions.isFull;
        this.hasWitness = PeerOptions.hasWitness;
        this.createNonce = PeerOptions.createNonce;
        this.hasNonce = PeerOptions.hasNonce;
        this.getRate = PeerOptions.getRate;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {PeerOptions}
     */
    PeerOptions.prototype.fromOptions = function (options) {
        assert(options, 'Options are required.');
        if (options.network != null)
            this.network = Network.get(options.network);
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.createSocket != null) {
            assert(typeof options.createSocket === 'function');
            this.createSocket = options.createSocket;
        }
        if (options.version != null) {
            assert(typeof options.version === 'number');
            this.version = options.version;
        }
        if (options.services != null) {
            assert(typeof options.services === 'number');
            this.services = options.services;
        }
        if (options.agent != null) {
            assert(typeof options.agent === 'string');
            this.agent = options.agent;
        }
        if (options.noRelay != null) {
            assert(typeof options.noRelay === 'boolean');
            this.noRelay = options.noRelay;
        }
        if (options.spv != null) {
            assert(typeof options.spv === 'boolean');
            this.spv = options.spv;
        }
        if (options.compact != null) {
            assert(typeof options.compact === 'boolean');
            this.compact = options.compact;
        }
        if (options.headers != null) {
            assert(typeof options.headers === 'boolean');
            this.headers = options.headers;
        }
        if (options.banScore != null) {
            assert(typeof options.banScore === 'number');
            this.banScore = options.banScore;
        }
        if (options.getHeight != null) {
            assert(typeof options.getHeight === 'function');
            this.getHeight = options.getHeight;
        }
        if (options.isFull != null) {
            assert(typeof options.isFull === 'function');
            this.isFull = options.isFull;
        }
        if (options.hasWitness != null) {
            assert(typeof options.hasWitness === 'function');
            this.hasWitness = options.hasWitness;
        }
        if (options.createNonce != null) {
            assert(typeof options.createNonce === 'function');
            this.createNonce = options.createNonce;
        }
        if (options.hasNonce != null) {
            assert(typeof options.hasNonce === 'function');
            this.hasNonce = options.hasNonce;
        }
        if (options.getRate != null) {
            assert(typeof options.getRate === 'function');
            this.getRate = options.getRate;
        }
        return this;
    };
    /**
     * Instantiate options from object.
     * @param {Object} options
     * @returns {PeerOptions}
     */
    PeerOptions.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Get the chain height.
     * @private
     * @returns {Number}
     */
    PeerOptions.getHeight = function () {
        return 0;
    };
    /**
     * Test whether the chain is synced.
     * @private
     * @returns {Boolean}
     */
    PeerOptions.isFull = function () {
        return false;
    };
    /**
     * Whether segwit is enabled.
     * @private
     * @returns {Boolean}
     */
    PeerOptions.hasWitness = function () {
        return true;
    };
    /**
     * Create a version packet nonce.
     * @private
     * @param {String} hostname
     * @returns {Buffer}
     */
    PeerOptions.createNonce = function (hostname) {
        return common.nonce();
    };
    /**
     * Test whether version nonce is ours.
     * @private
     * @param {Buffer} nonce
     * @returns {Boolean}
     */
    PeerOptions.hasNonce = function (nonce) {
        return false;
    };
    /**
     * Get fee rate for txid.
     * @private
     * @param {Hash} hash
     * @returns {Rate}
     */
    PeerOptions.getRate = function (hash) {
        return -1;
    };
    return PeerOptions;
}());
/**
 * Request Entry
 * @ignore
 */
var RequestEntry = /** @class */ (function () {
    /**
     * Create a request entry.
     * @constructor
     */
    function RequestEntry() {
        this.timeout = 0;
        this.jobs = [];
    }
    RequestEntry.prototype.addJob = function (resolve, reject) {
        this.jobs.push({ resolve: resolve, reject: reject });
    };
    RequestEntry.prototype.setTimeout = function (timeout) {
        this.timeout = Date.now() + timeout;
    };
    RequestEntry.prototype.reject = function (err) {
        for (var _i = 0, _a = this.jobs; _i < _a.length; _i++) {
            var job = _a[_i];
            job.reject(err);
        }
        this.jobs.length = 0;
    };
    RequestEntry.prototype.resolve = function (result) {
        for (var _i = 0, _a = this.jobs; _i < _a.length; _i++) {
            var job = _a[_i];
            job.resolve(result);
        }
        this.jobs.length = 0;
    };
    return RequestEntry;
}());
/*
 * Expose
 */
module.exports = Peer;
