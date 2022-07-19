/*!
 * blockstore/level.js - leveldb blockstore for bcoin
 * Copyright (c) 2019, Braydon Fuller (MIT License).
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
var fs = require('bfile');
var AbstractBlockStore = require('./abstract');
var layout = require('./layout');
var types = require('./common').types;
/**
 * LevelDB Block Store
 *
 * @alias module:blockstore:LevelBlockStore
 * @abstract
 */
var LevelBlockStore = /** @class */ (function (_super) {
    __extends(LevelBlockStore, _super);
    /**
     * Create a blockstore that stores blocks in LevelDB.
     * @constructor
     */
    function LevelBlockStore(options) {
        var _this = _super.call(this, options) || this;
        _this.location = options.location;
        _this.db = bdb.create({
            location: _this.location,
            cacheSize: options.cacheSize,
            compression: false,
            memory: options.memory
        });
        return _this;
    }
    /**
     * This method ensures that the storage directory exists
     * before opening.
     * @returns {Promise}
     */
    LevelBlockStore.prototype.ensure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fs.mkdirp(this.location)];
            });
        });
    };
    /**
     * Opens the block storage.
     * @returns {Promise}
     */
    LevelBlockStore.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Opening LevelBlockStore...');
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'levelblockstore', 0)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Closes the block storage.
     */
    LevelBlockStore.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Closing LevelBlockStore...');
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method stores merkle block data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    LevelBlockStore.prototype.writeMerkle = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.put(layout.b.encode(types.MERKLE, hash), data)];
            });
        });
    };
    /**
     * This method stores block undo coin data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    LevelBlockStore.prototype.writeUndo = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.put(layout.b.encode(types.UNDO, hash), data)];
            });
        });
    };
    /**
     * This method stores block data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    LevelBlockStore.prototype.write = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.put(layout.b.encode(types.BLOCK, hash), data)];
            });
        });
    };
    /**
     * This method stores serialized block filter data in LevelDB.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The serialized block filter data.
     * @returns {Promise}
     */
    LevelBlockStore.prototype.writeFilter = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.put(layout.b.encode(types.FILTER, hash), data)];
            });
        });
    };
    /**
     * This method will retrieve merkle block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.readMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.get(layout.b.encode(types.MERKLE, hash))];
            });
        });
    };
    /**
     * This method will retrieve block undo coin data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.readUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.get(layout.b.encode(types.UNDO, hash))];
            });
        });
    };
    /**
     * This method will retrieve serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.readFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.get(layout.b.encode(types.FILTER, hash))];
            });
        });
    };
    /**
     * This method will retrieve block filter header only.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.readFilterHeader = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.b.encode(types.FILTER, hash))];
                    case 1:
                        data = _a.sent();
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, data.slice(0, 32)];
                }
            });
        });
    };
    /**
     * This method will retrieve block data. Smaller portions of the
     * block (e.g. transactions) can be returned using the offset and
     * length arguments. However, the entire block will be read as the
     * data is stored in a key/value database.
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    LevelBlockStore.prototype.read = function (hash, offset, length) {
        return __awaiter(this, void 0, void 0, function () {
            var raw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.b.encode(types.BLOCK, hash))];
                    case 1:
                        raw = _a.sent();
                        if (offset) {
                            if (offset + length > raw.length)
                                throw new Error('Out-of-bounds read.');
                            raw = raw.slice(offset, offset + length);
                        }
                        return [2 /*return*/, raw];
                }
            });
        });
    };
    /**
     * This will free resources for storing merkle block data.
     * The block data may not be immediately removed from disk, and will
     * be reclaimed during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.pruneMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasMerkle(hash)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.db.del(layout.b.encode(types.MERKLE, hash))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This will free resources for storing the block undo coin data.
     * The block data may not be immediately removed from disk, and will
     * be reclaimed during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.pruneUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasUndo(hash)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.db.del(layout.b.encode(types.UNDO, hash))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This will free resources for storing the serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.pruneFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasFilter(hash)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.db.del(layout.b.encode(types.FILTER, hash))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This will free resources for storing the block data. The block
     * data may not be immediately removed from disk, and will be reclaimed
     * during LevelDB compaction.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.prune = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.has(hash)];
                    case 1:
                        if (!(_a.sent()))
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.db.del(layout.b.encode(types.BLOCK, hash))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This will check if a merkle block data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.hasMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.b.encode(types.MERKLE, hash))];
            });
        });
    };
    /**
     * This will check if a block undo coin data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.hasUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.b.encode(types.UNDO, hash))];
            });
        });
    };
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.hasFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.b.encode(types.FILTER, hash))];
            });
        });
    };
    /**
     * This will check if a block has been stored and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    LevelBlockStore.prototype.has = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.db.has(layout.b.encode(types.BLOCK, hash))];
            });
        });
    };
    return LevelBlockStore;
}(AbstractBlockStore));
/*
 * Expose
 */
module.exports = LevelBlockStore;
