/*!
 * node.js - http node client for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
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
var Client = require('bcurl').Client;
/**
 * Node Client
 * @extends {bcurl.Client}
 */
var NodeClient = /** @class */ (function (_super) {
    __extends(NodeClient, _super);
    /**
     * Creat a node client.
     * @param {Object?} options
     */
    function NodeClient(options) {
        return _super.call(this, options) || this;
    }
    /**
     * Auth with server.
     * @returns {Promise}
     */
    NodeClient.prototype.auth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.call('auth', this.password)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.watchChain()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.watchMempool()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make an RPC call.
     * @returns {Promise}
     */
    NodeClient.prototype.execute = function (name, params) {
        return _super.prototype.execute.call(this, '/', name, params);
    };
    /**
     * Get a mempool snapshot.
     * @returns {Promise}
     */
    NodeClient.prototype.getMempool = function () {
        return this.get('/mempool');
    };
    /**
     * Get some info about the server (network and version).
     * @returns {Promise}
     */
    NodeClient.prototype.getInfo = function () {
        return this.get('/');
    };
    /**
     * Get coins that pertain to an address from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {String} address
     * @returns {Promise}
     */
    NodeClient.prototype.getCoinsByAddress = function (address) {
        assert(typeof address === 'string');
        return this.get("/coin/address/".concat(address));
    };
    /**
     * Get coins that pertain to addresses from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {String[]} addresses
     * @returns {Promise}
     */
    NodeClient.prototype.getCoinsByAddresses = function (addresses) {
        assert(Array.isArray(addresses));
        return this.post('/coin/address', { addresses: addresses });
    };
    /**
     * Retrieve a coin from the mempool or chain database.
     * Takes into account spent coins in the mempool.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    NodeClient.prototype.getCoin = function (hash, index) {
        assert(typeof hash === 'string');
        assert((index >>> 0) === index);
        return this.get("/coin/".concat(hash, "/").concat(index));
    };
    /**
     * Retrieve transactions pertaining to an
     * address from the mempool or chain database.
     * @param {String} address
     * @returns {Promise}
     */
    NodeClient.prototype.getTXByAddress = function (address) {
        assert(typeof address === 'string');
        return this.get("/tx/address/".concat(address));
    };
    /**
     * Retrieve transactions pertaining to
     * addresses from the mempool or chain database.
     * @param {String[]} addresses
     * @returns {Promise}
     */
    NodeClient.prototype.getTXByAddresses = function (addresses) {
        assert(Array.isArray(addresses));
        return this.post('/tx/address', { addresses: addresses });
    };
    /**
     * Retrieve a transaction from the mempool or chain database.
     * @param {Hash} hash
     * @returns {Promise}
     */
    NodeClient.prototype.getTX = function (hash) {
        assert(typeof hash === 'string');
        return this.get("/tx/".concat(hash));
    };
    /**
     * Retrieve a block from the chain database.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    NodeClient.prototype.getBlock = function (block) {
        assert(typeof block === 'string' || typeof block === 'number');
        return this.get("/block/".concat(block));
    };
    /**
     * Retrieve a block header.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    NodeClient.prototype.getBlockHeader = function (block) {
        assert(typeof block === 'string' || typeof block === 'number');
        return this.get("/header/".concat(block));
    };
    /**
     * Retreive a filter from the filter indexer.
     * @param {Hash|Number} filter
     * @returns {Promise}
     */
    NodeClient.prototype.getFilter = function (filter) {
        assert(typeof filter === 'string' || typeof filter === 'number');
        return this.get("/filter/".concat(filter));
    };
    /**
     * Add a transaction to the mempool and broadcast it.
     * @param {TX} tx
     * @returns {Promise}
     */
    NodeClient.prototype.broadcast = function (tx) {
        assert(typeof tx === 'string');
        return this.post('/broadcast', { tx: tx });
    };
    /**
     * Reset the chain.
     * @param {Number} height
     * @returns {Promise}
     */
    NodeClient.prototype.reset = function (height) {
        return this.post('/reset', { height: height });
    };
    /**
     * Watch the blockchain.
     * @private
     * @returns {Promise}
     */
    NodeClient.prototype.watchChain = function () {
        return this.call('watch chain');
    };
    /**
     * Watch the blockchain.
     * @private
     * @returns {Promise}
     */
    NodeClient.prototype.watchMempool = function () {
        return this.call('watch mempool');
    };
    /**
     * Get chain tip.
     * @returns {Promise}
     */
    NodeClient.prototype.getTip = function () {
        return this.call('get tip');
    };
    /**
     * Get chain entry.
     * @param {Hash} hash
     * @returns {Promise}
     */
    NodeClient.prototype.getEntry = function (block) {
        return this.call('get entry', block);
    };
    /**
     * Get hashes.
     * @param {Number} [start=-1]
     * @param {Number} [end=-1]
     * @returns {Promise}
     */
    NodeClient.prototype.getHashes = function (start, end) {
        return this.call('get hashes', start, end);
    };
    /**
     * Send a transaction. Do not wait for promise.
     * @param {TX} tx
     * @returns {Promise}
     */
    NodeClient.prototype.send = function (tx) {
        assert(Buffer.isBuffer(tx));
        return this.call('send', tx);
    };
    /**
     * Set bloom filter.
     * @param {Bloom} filter
     * @returns {Promise}
     */
    NodeClient.prototype.setFilter = function (filter) {
        assert(Buffer.isBuffer(filter));
        return this.call('set filter', filter);
    };
    /**
     * Add data to filter.
     * @param {Buffer} data
     * @returns {Promise}
     */
    NodeClient.prototype.addFilter = function (chunks) {
        if (!Array.isArray(chunks))
            chunks = [chunks];
        return this.call('add filter', chunks);
    };
    /**
     * Reset filter.
     * @returns {Promise}
     */
    NodeClient.prototype.resetFilter = function () {
        return this.call('reset filter');
    };
    /**
     * Estimate smart fee.
     * @param {Number?} blocks
     * @returns {Promise}
     */
    NodeClient.prototype.estimateFee = function (blocks) {
        assert(blocks == null || typeof blocks === 'number');
        var query = '/fee';
        if (blocks != null)
            query += "?blocks=".concat(blocks);
        return this.get(query);
    };
    /**
     * Rescan for any missed transactions.
     * @param {Number|Hash} start - Start block.
     * @returns {Promise}
     */
    NodeClient.prototype.rescan = function (start) {
        if (start == null)
            start = 0;
        assert(typeof start === 'number' || typeof start === 'string');
        return this.call('rescan', start);
    };
    return NodeClient;
}(Client));
/*
 * Expose
 */
module.exports = NodeClient;
