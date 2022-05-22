/*!
 * filterindexer.js - filter indexer
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
var bdb = require('bdb');
var assert = require('bsert');
var Indexer = require('./indexer');
var consensus = require('../protocol/consensus');
var Filter = require('../primitives/filter');
/**
 * FilterIndexer
 * @alias module:indexer.FilterIndexer
 * @extends Indexer
 */
var FilterIndexer = /** @class */ (function (_super) {
    __extends(FilterIndexer, _super);
    /**
     * Create a indexer
     * @constructor
     * @param {Object} options
     */
    function FilterIndexer(options) {
        var _this = _super.call(this, 'filter', options) || this;
        _this.db = bdb.create(_this.options);
        return _this;
    }
    /**
     * Store genesis previous filter header.
     * @private
     * @returns {Promise}
     */
    FilterIndexer.prototype.saveGenesis = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prevHash, filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prevHash = this.network.genesis.prevBlock;
                        filter = new Filter();
                        filter.header = consensus.ZERO_HASH;
                        return [4 /*yield*/, this.blocks.writeFilter(prevHash, filter.toRaw())];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, _super.prototype.saveGenesis.call(this)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Index compact filters.
     * @private
     * @param {BlockMeta} meta
     * @param {Block} block
     * @param {CoinView} view
     */
    FilterIndexer.prototype.indexBlock = function (meta, block, view) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, prev, basic, filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        return [4 /*yield*/, this.getFilterHeader(block.prevBlock)];
                    case 1:
                        prev = _a.sent();
                        basic = block.toFilter(view);
                        filter = new Filter();
                        filter.header = basic.header(prev);
                        filter.filter = basic.toRaw();
                        return [4 /*yield*/, this.blocks.writeFilter(hash, filter.toRaw())];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Prune compact filters.
     * @private
     * @param {BlockMeta} meta
     */
    FilterIndexer.prototype.pruneBlock = function (meta) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.blocks.pruneFilter(meta.hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retrieve compact filter by hash.
     * @param {Hash} hash
     * @param {Number} type
     * @returns {Promise} - Returns {@link Filter}.
     */
    FilterIndexer.prototype.getFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(hash);
                        return [4 /*yield*/, this.blocks.readFilter(hash)];
                    case 1:
                        filter = _a.sent();
                        if (!filter)
                            return [2 /*return*/, null];
                        return [2 /*return*/, Filter.fromRaw(filter)];
                }
            });
        });
    };
    /**
     * Retrieve compact filter header by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Hash}.
     */
    FilterIndexer.prototype.getFilterHeader = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(hash);
                return [2 /*return*/, this.blocks.readFilterHeader(hash)];
            });
        });
    };
    return FilterIndexer;
}(Indexer));
module.exports = FilterIndexer;
