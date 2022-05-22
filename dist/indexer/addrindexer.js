/*!
 * addrindexer.js - address indexer for bcoin
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
var bdb = require('bdb');
var bio = require('bufio');
var layout = require('./layout');
var Address = require('../primitives/address');
var Indexer = require('./indexer');
/*
 * AddrIndexer Database Layout:
 *  A[addr-prefix][addr-hash][height][index] -> dummy (tx by address)
 *  C[height][index] -> hash (tx hash by height and index)
 *  c[hash]-> height + index (tx height and index by hash)
 *
 * The database layout is organized so that transactions are
 * sorted in the same order as the blocks using the block height
 * and transaction index. This provides the ability to query for
 * sets of transactions within that order. For a wallet that would
 * like to synchronize or rescan, this could be a query for all of
 * the latest transactions, but not for earlier transactions that
 * are already known.
 *
 * To be able to query for all transactions in multiple sets without
 * reference to height and index, there is a mapping from tx hash to
 * the height and index as an entry point.
 *
 * A mapping of height and index is kept for each transaction
 * hash so that the tx hash is not repeated for every address within
 * a transaction.
 */
Object.assign(layout, {
    A: bdb.key('A', ['uint8', 'hash', 'uint32', 'uint32']),
    C: bdb.key('C', ['uint32', 'uint32']),
    c: bdb.key('c', ['hash256'])
});
/**
 * Count
 */
var Count = /** @class */ (function () {
    /**
     * Create count record.
     * @constructor
     * @param {Number} height
     * @param {Number} index
     */
    function Count(height, index) {
        this.height = height || 0;
        this.index = index || 0;
        assert((this.height >>> 0) === this.height);
        assert((this.index >>> 0) === this.index);
    }
    /**
     * Serialize.
     * @returns {Buffer}
     */
    Count.prototype.toRaw = function () {
        var bw = bio.write(8);
        bw.writeU32(this.height);
        bw.writeU32(this.index);
        return bw.render();
    };
    /**
     * Deserialize.
     * @private
     * @param {Buffer} data
     */
    Count.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.height = br.readU32();
        this.index = br.readU32();
        return this;
    };
    /**
     * Instantiate a count from a buffer.
     * @param {Buffer} data
     * @returns {Count}
     */
    Count.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    return Count;
}());
/**
 * AddrIndexer
 * @alias module:indexer.AddrIndexer
 * @extends Indexer
 */
var AddrIndexer = /** @class */ (function (_super) {
    __extends(AddrIndexer, _super);
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    function AddrIndexer(options) {
        var _this = _super.call(this, 'addr', options) || this;
        _this.db = bdb.create(_this.options);
        _this.maxTxs = options.maxTxs || 100;
        return _this;
    }
    /**
     * Index transactions by address.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    AddrIndexer.prototype.indexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var height, i, tx, hash, count, hasAddress, _i, _a, addr, prefix, addrHash;
            return __generator(this, function (_b) {
                height = meta.height;
                for (i = 0; i < block.txs.length; i++) {
                    tx = block.txs[i];
                    hash = tx.hash();
                    count = new Count(height, i);
                    hasAddress = false;
                    for (_i = 0, _a = tx.getAddresses(view); _i < _a.length; _i++) {
                        addr = _a[_i];
                        prefix = addr.getPrefix(this.network);
                        if (prefix < 0)
                            continue;
                        addrHash = addr.getHash();
                        this.put(layout.A.encode(prefix, addrHash, height, i), null);
                        hasAddress = true;
                    }
                    if (hasAddress) {
                        this.put(layout.C.encode(height, i), hash);
                        this.put(layout.c.encode(hash), count.toRaw());
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove addresses from index.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    AddrIndexer.prototype.unindexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var height, i, tx, hash, hasAddress, _i, _a, addr, prefix, addrHash;
            return __generator(this, function (_b) {
                height = meta.height;
                for (i = 0; i < block.txs.length; i++) {
                    tx = block.txs[i];
                    hash = tx.hash();
                    hasAddress = false;
                    for (_i = 0, _a = tx.getAddresses(view); _i < _a.length; _i++) {
                        addr = _a[_i];
                        prefix = addr.getPrefix(this.network);
                        if (prefix < 0)
                            continue;
                        addrHash = addr.getHash();
                        this.del(layout.A.encode(prefix, addrHash, height, i));
                        hasAddress = true;
                    }
                    if (hasAddress) {
                        this.del(layout.C.encode(height, i));
                        this.del(layout.c.encode(hash));
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get transaction hashes to an address in ascending or descending
     * order. If the `after` argument is supplied, results will be given
     * _after_ that transaction hash. The default order is ascending from
     * oldest to latest.
     * @param {Address} addr
     * @param {Object} options
     * @param {Buffer} options.after - A transaction hash
     * @param {Number} options.limit
     * @param {Boolean} options.reverse
     * @returns {Promise} - Returns {@link Hash}[].
     */
    AddrIndexer.prototype.getHashesByAddress = function (addr, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var after, reverse, limit, hash, prefix, opts, hasAfter, _a, skip, raw, count, height, index, txs, hashes, _i, txs_1, _b, height, index, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        after = options.after, reverse = options.reverse;
                        limit = options.limit;
                        if (!limit)
                            limit = this.maxTxs;
                        if (limit > this.maxTxs)
                            throw new Error("Limit above max of ".concat(this.maxTxs, "."));
                        hash = Address.getHash(addr);
                        prefix = addr.getPrefix(this.network);
                        opts = {
                            limit: limit,
                            reverse: reverse,
                            parse: function (key) {
                                var _a = layout.A.decode(key), height = _a[2], index = _a[3];
                                return [height, index];
                            }
                        };
                        _a = after;
                        if (!_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.db.has(layout.c.encode(after))];
                    case 1:
                        _a = (_e.sent());
                        _e.label = 2;
                    case 2:
                        hasAfter = (_a);
                        skip = (after && !hasAfter && !reverse);
                        if (skip)
                            return [2 /*return*/, []];
                        if (!(after && hasAfter)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.db.get(layout.c.encode(after))];
                    case 3:
                        raw = _e.sent();
                        count = Count.fromRaw(raw);
                        height = count.height, index = count.index;
                        if (!reverse) {
                            opts.gt = layout.A.min(prefix, hash, height, index);
                            opts.lte = layout.A.max(prefix, hash);
                        }
                        else {
                            opts.gte = layout.A.min(prefix, hash);
                            opts.lt = layout.A.max(prefix, hash, height, index);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        // Give earliest or latest results
                        // for the address.
                        opts.gte = layout.A.min(prefix, hash);
                        opts.lte = layout.A.max(prefix, hash);
                        _e.label = 5;
                    case 5: return [4 /*yield*/, this.db.keys(opts)];
                    case 6:
                        txs = _e.sent();
                        hashes = [];
                        _i = 0, txs_1 = txs;
                        _e.label = 7;
                    case 7:
                        if (!(_i < txs_1.length)) return [3 /*break*/, 10];
                        _b = txs_1[_i], height = _b[0], index = _b[1];
                        _d = (_c = hashes).push;
                        return [4 /*yield*/, this.db.get(layout.C.encode(height, index))];
                    case 8:
                        _d.apply(_c, [_e.sent()]);
                        _e.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10: return [2 /*return*/, hashes];
                }
            });
        });
    };
    return AddrIndexer;
}(Indexer));
module.exports = AddrIndexer;
