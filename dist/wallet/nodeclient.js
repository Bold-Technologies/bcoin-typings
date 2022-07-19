/*!
 * nodeclient.js - node client for bcoin
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
var AsyncEmitter = require('bevent');
/**
 * Node Client
 * @alias module:node.NodeClient
 */
var NodeClient = /** @class */ (function (_super) {
    __extends(NodeClient, _super);
    /**
     * Create a node client.
     * @constructor
     */
    function NodeClient(node) {
        var _this = _super.call(this) || this;
        _this.node = node;
        _this.network = node.network;
        _this.filter = null;
        _this.opened = false;
        _this.init();
        return _this;
    }
    /**
     * Initialize the client.
     */
    NodeClient.prototype.init = function () {
        var _this = this;
        this.node.chain.on('connect', function (entry, block) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.opened)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.emitAsync('block connect', entry, block.txs)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this.node.chain.on('disconnect', function (entry, block) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.opened)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.emitAsync('block disconnect', entry)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        this.node.on('tx', function (tx) {
            if (!_this.opened)
                return;
            _this.emit('tx', tx);
        });
        this.node.on('reset', function (tip) {
            if (!_this.opened)
                return;
            _this.emit('chain reset', tip);
        });
    };
    /**
     * Open the client.
     * @returns {Promise}
     */
    NodeClient.prototype.open = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                assert(!this.opened, 'NodeClient is already open.');
                this.opened = true;
                setImmediate(function () { return _this.emit('connect'); });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close the client.
     * @returns {Promise}
     */
    NodeClient.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                assert(this.opened, 'NodeClient is not open.');
                this.opened = false;
                setImmediate(function () { return _this.emit('disconnect'); });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Add a listener.
     * @param {String} type
     * @param {Function} handler
     */
    NodeClient.prototype.bind = function (type, handler) {
        return this.on(type, handler);
    };
    /**
     * Add a listener.
     * @param {String} type
     * @param {Function} handler
     */
    NodeClient.prototype.hook = function (type, handler) {
        return this.on(type, handler);
    };
    /**
     * Get chain tip.
     * @returns {Promise}
     */
    NodeClient.prototype.getTip = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.node.chain.tip];
            });
        });
    };
    /**
     * Get chain entry.
     * @param {Hash} hash
     * @returns {Promise}
     */
    NodeClient.prototype.getEntry = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.node.chain.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, this.node.chain.isMainChain(entry)];
                    case 2:
                        if (!(_a.sent()))
                            return [2 /*return*/, null];
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Send a transaction. Do not wait for promise.
     * @param {TX} tx
     * @returns {Promise}
     */
    NodeClient.prototype.send = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.node.relay(tx);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Set bloom filter.
     * @param {Bloom} filter
     * @returns {Promise}
     */
    NodeClient.prototype.setFilter = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.filter = filter;
                this.node.pool.setFilter(filter);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Add data to filter.
     * @param {Buffer} data
     * @returns {Promise}
     */
    NodeClient.prototype.addFilter = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.node.pool.queueFilterLoad();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Reset filter.
     * @returns {Promise}
     */
    NodeClient.prototype.resetFilter = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.node.pool.queueFilterLoad();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Estimate smart fee.
     * @param {Number?} blocks
     * @returns {Promise}
     */
    NodeClient.prototype.estimateFee = function (blocks) {
        return __awaiter(this, void 0, void 0, function () {
            var fee;
            return __generator(this, function (_a) {
                if (!this.node.fees)
                    return [2 /*return*/, { rate: this.network.feeRate }];
                fee = this.node.fees.estimateFee(blocks);
                return [2 /*return*/, { rate: fee }];
            });
        });
    };
    /**
     * Get hash range.
     * @param {Number} start
     * @param {Number} end
     * @returns {Promise}
     */
    NodeClient.prototype.getHashes = function (start, end) {
        if (start === void 0) { start = -1; }
        if (end === void 0) { end = -1; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.node.chain.getHashes(start, end)];
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
    NodeClient.prototype.rescan = function (start) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.node.spv)
                    return [2 /*return*/, this.node.chain.reset(start)];
                return [2 /*return*/, this.node.chain.scan(start, this.filter, function (entry, txs) {
                        return _this.emitAsync('block rescan', entry, txs);
                    })];
            });
        });
    };
    return NodeClient;
}(AsyncEmitter));
/*
 * Expose
 */
module.exports = NodeClient;
