/*!
 * spvnode.js - spv node for bcoin
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
var Pool = require('../net/pool');
var Node = require('./node');
var HTTP = require('./http');
var RPC = require('./rpc');
/**
 * SPV Node
 * Create an spv node which only maintains
 * a chain, a pool, and an http server.
 * @alias module:node.SPVNode
 * @extends Node
 */
var SPVNode = /** @class */ (function (_super) {
    __extends(SPVNode, _super);
    /**
     * Create SPV node.
     * @constructor
     * @param {Object?} options
     * @param {Buffer?} options.sslKey
     * @param {Buffer?} options.sslCert
     * @param {Number?} options.httpPort
     * @param {String?} options.httpHost
     */
    function SPVNode(options) {
        var _this = _super.call(this, 'bcoin', 'bcoin.conf', 'debug.log', options) || this;
        _this.opened = false;
        // SPV flag.
        _this.spv = true;
        _this.chain = new Chain({
            network: _this.network,
            logger: _this.logger,
            prefix: _this.config.prefix,
            memory: _this.memory,
            maxFiles: _this.config.uint('max-files'),
            cacheSize: _this.config.mb('cache-size'),
            entryCache: _this.config.uint('entry-cache'),
            forceFlags: _this.config.bool('force-flags'),
            checkpoints: _this.config.bool('checkpoints'),
            bip91: _this.config.bool('bip91'),
            bip148: _this.config.bool('bip148'),
            spv: true
        });
        _this.pool = new Pool({
            network: _this.network,
            logger: _this.logger,
            chain: _this.chain,
            prefix: _this.config.prefix,
            proxy: _this.config.str('proxy'),
            onion: _this.config.bool('onion'),
            upnp: _this.config.bool('upnp'),
            seeds: _this.config.array('seeds'),
            nodes: _this.config.array('nodes'),
            only: _this.config.array('only'),
            maxOutbound: _this.config.uint('max-outbound'),
            createSocket: _this.config.func('create-socket'),
            memory: _this.memory,
            selfish: true,
            listen: false
        });
        _this.rpc = new RPC(_this);
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
            cors: _this.config.bool('cors')
        });
        _this.init();
        return _this;
    }
    /**
     * Initialize the node.
     * @private
     */
    SPVNode.prototype.init = function () {
        var _this = this;
        // Bind to errors
        this.chain.on('error', function (err) { return _this.error(err); });
        this.pool.on('error', function (err) { return _this.error(err); });
        if (this.http)
            this.http.on('error', function (err) { return _this.error(err); });
        this.pool.on('tx', function (tx) {
            _this.emit('tx', tx);
        });
        this.chain.on('block', function (block) {
            _this.emit('block', block);
        });
        this.chain.on('connect', function (entry, block) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.emit('connect', entry, block);
                return [2 /*return*/];
            });
        }); });
        this.chain.on('disconnect', function (entry, block) {
            _this.emit('disconnect', entry, block);
        });
        this.chain.on('reorganize', function (tip, competitor) {
            _this.emit('reorganize', tip, competitor);
        });
        this.chain.on('reset', function (tip) {
            _this.emit('reset', tip);
        });
        this.loadPlugins();
    };
    /**
     * Open the node and all its child objects,
     * wait for the database to load.
     * @returns {Promise}
     */
    SPVNode.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(!this.opened, 'SPVNode is already open.');
                        this.opened = true;
                        return [4 /*yield*/, this.handlePreopen()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.chain.open()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.pool.open()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.openPlugins()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.http.open()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.handleOpen()];
                    case 6:
                        _a.sent();
                        this.logger.info('Node is loaded.');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the node, wait for the database to close.
     * @returns {Promise}
     */
    SPVNode.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(this.opened, 'SPVNode is not open.');
                        this.opened = false;
                        return [4 /*yield*/, this.handlePreclose()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.http.close()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.closePlugins()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.pool.close()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.chain.close()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.handleClose()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Scan for any missed transactions.
     * Note that this will replay the blockchain sync.
     * @param {Number|Hash} start - Start block.
     * @returns {Promise}
     */
    SPVNode.prototype.scan = function (start) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Not implemented.');
            });
        });
    };
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX|Block} item
     * @returns {Promise}
     */
    SPVNode.prototype.broadcast = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pool.broadcast(item)];
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
        });
    };
    /**
     * Broadcast a transaction (note that this will _not_ be verified
     * by the mempool - use with care, lest you get banned from
     * bitcoind nodes).
     * @param {TX} tx
     * @returns {Promise}
     */
    SPVNode.prototype.sendTX = function (tx) {
        return this.broadcast(tx);
    };
    /**
     * Broadcast a transaction. Silence errors.
     * @param {TX} tx
     * @returns {Promise}
     */
    SPVNode.prototype.relay = function (tx) {
        return this.broadcast(tx);
    };
    /**
     * Connect to the network.
     * @returns {Promise}
     */
    SPVNode.prototype.connect = function () {
        return this.pool.connect();
    };
    /**
     * Disconnect from the network.
     * @returns {Promise}
     */
    SPVNode.prototype.disconnect = function () {
        return this.pool.disconnect();
    };
    /**
     * Start the blockchain sync.
     */
    SPVNode.prototype.startSync = function () {
        return this.pool.startSync();
    };
    /**
     * Stop syncing the blockchain.
     */
    SPVNode.prototype.stopSync = function () {
        return this.pool.stopSync();
    };
    return SPVNode;
}(Node));
/*
 * Expose
 */
module.exports = SPVNode;
