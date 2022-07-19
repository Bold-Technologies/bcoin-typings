/*!
 * txindexer.js - transaction indexer for bcoin
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
var assert = require('bsert');
var bdb = require('bdb');
var bio = require('bufio');
var layout = require('./layout');
var consensus = require('../protocol/consensus');
var TX = require('../primitives/tx');
var TXMeta = require('../primitives/txmeta');
var Indexer = require('./indexer');
/*
 * TXIndexer Database Layout:
 *  t[hash] -> tx record
 *  b[height] -> block record
 *
 * The transaction index maps a transaction to a block
 * and an index, offset, and length within that block. The
 * block hash is stored in a separate record by height so that
 * the 32 byte hash is not repeated for every transaction
 * within a block.
 */
Object.assign(layout, {
    t: bdb.key('t', ['hash256']),
    b: bdb.key('b', ['uint32'])
});
/**
 * Block Record
 */
var BlockRecord = /** @class */ (function () {
    /**
     * Create a block record.
     * @constructor
     */
    function BlockRecord(options) {
        if (options === void 0) { options = {}; }
        this.block = options.block || consensus.ZERO_HASH;
        this.time = options.time || 0;
        assert(this.block.length === 32);
        assert((this.time >>> 0) === this.time);
    }
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    BlockRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.block = br.readHash();
        this.time = br.readU32();
        return this;
    };
    /**
     * Instantiate block record from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {BlockRecord}
     */
    BlockRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Serialize the block record.
     * @returns {Buffer}
     */
    BlockRecord.prototype.toRaw = function () {
        var bw = bio.write(36);
        bw.writeHash(this.block);
        bw.writeU32(this.time);
        return bw.render();
    };
    return BlockRecord;
}());
/**
 * Transaction Record
 */
var TxRecord = /** @class */ (function () {
    /**
     * Create a transaction record.
     * @constructor
     */
    function TxRecord(options) {
        if (options === void 0) { options = {}; }
        this.height = options.height || 0;
        this.index = options.index || 0;
        this.offset = options.offset || 0;
        this.length = options.length || 0;
        assert((this.height >>> 0) === this.height);
        assert((this.index >>> 0) === this.index);
        assert((this.offset >>> 0) === this.offset);
        assert((this.length >>> 0) === this.length);
    }
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    TxRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.height = br.readU32();
        this.index = br.readU32();
        this.offset = br.readU32();
        this.length = br.readU32();
        return this;
    };
    /**
     * Instantiate transaction record from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {BlockRecord}
     */
    TxRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Serialize the transaction record.
     * @returns {Buffer}
     */
    TxRecord.prototype.toRaw = function () {
        var bw = bio.write(16);
        bw.writeU32(this.height);
        bw.writeU32(this.index);
        bw.writeU32(this.offset);
        bw.writeU32(this.length);
        return bw.render();
    };
    return TxRecord;
}());
/**
 * TXIndexer
 * @alias module:indexer.TXIndexer
 * @extends Indexer
 */
var TXIndexer = /** @class */ (function (_super) {
    __extends(TXIndexer, _super);
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    function TXIndexer(options) {
        var _this = _super.call(this, 'tx', options) || this;
        _this.db = bdb.create(_this.options);
        return _this;
    }
    /**
     * Index transactions by txid.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    TXIndexer.prototype.indexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var brecord, i, tx, hash, _a, offset, size, txrecord;
            return __generator(this, function (_b) {
                assert(block.hasRaw(), 'Expected raw data for block.');
                brecord = new BlockRecord({
                    block: meta.hash,
                    time: block.time
                });
                this.put(layout.b.encode(meta.height), brecord.toRaw());
                for (i = 0; i < block.txs.length; i++) {
                    tx = block.txs[i];
                    hash = tx.hash();
                    _a = tx.getPosition(), offset = _a.offset, size = _a.size;
                    txrecord = new TxRecord({
                        height: meta.height,
                        index: i,
                        offset: offset,
                        length: size
                    });
                    this.put(layout.t.encode(hash), txrecord.toRaw());
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove transactions from index.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    TXIndexer.prototype.unindexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var i, tx, hash;
            return __generator(this, function (_a) {
                this.del(layout.b.encode(meta.height));
                for (i = 0; i < block.txs.length; i++) {
                    tx = block.txs[i];
                    hash = tx.hash();
                    this.del(layout.t.encode(hash));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get a transaction with metadata.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TXMeta}.
     */
    TXIndexer.prototype.getMeta = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, record, height, index, offset, length, braw, brecord, block, time, data, tx, meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.t.encode(hash))];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, null];
                        record = TxRecord.fromRaw(raw);
                        height = record.height, index = record.index, offset = record.offset, length = record.length;
                        return [4 /*yield*/, this.db.get(layout.b.encode(height))];
                    case 2:
                        braw = _a.sent();
                        if (!braw)
                            return [2 /*return*/, null];
                        brecord = BlockRecord.fromRaw(braw);
                        block = brecord.block, time = brecord.time;
                        return [4 /*yield*/, this.blocks.read(block, offset, length)];
                    case 3:
                        data = _a.sent();
                        tx = TX.fromRaw(data);
                        meta = TXMeta.fromTX(tx);
                        meta.height = height;
                        meta.block = block;
                        meta.time = time;
                        meta.index = index;
                        return [2 /*return*/, meta];
                }
            });
        });
    };
    /**
     * Retrieve a transaction.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link TX}.
     */
    TXIndexer.prototype.getTX = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMeta(hash)];
                    case 1:
                        meta = _a.sent();
                        if (!meta)
                            return [2 /*return*/, null];
                        return [2 /*return*/, meta.tx];
                }
            });
        });
    };
    /**
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    TXIndexer.prototype.hasTX = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.t.encode(hash))];
            });
        });
    };
    /**
     * Get coin viewpoint (historical).
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    TXIndexer.prototype.getSpentView = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            var view, _i, _a, prevout, hash, index, meta, tx_1, height;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.chain.getCoinView(tx)];
                    case 1:
                        view = _b.sent();
                        _i = 0, _a = tx.inputs;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        prevout = _a[_i].prevout;
                        if (view.hasEntry(prevout))
                            return [3 /*break*/, 4];
                        hash = prevout.hash, index = prevout.index;
                        return [4 /*yield*/, this.getMeta(hash)];
                    case 3:
                        meta = _b.sent();
                        if (!meta)
                            return [3 /*break*/, 4];
                        tx_1 = meta.tx, height = meta.height;
                        if (index < tx_1.outputs.length)
                            view.addIndex(tx_1, index, height);
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, view];
                }
            });
        });
    };
    return TXIndexer;
}(Indexer));
module.exports = TXIndexer;
