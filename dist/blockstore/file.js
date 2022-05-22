/*!
 * blockstore/file.js - file blockstore for bcoin
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
var _a = require('path'), isAbsolute = _a.isAbsolute, resolve = _a.resolve, join = _a.join;
var bdb = require('bdb');
var assert = require('bsert');
var fs = require('bfile');
var bio = require('bufio');
var hash256 = require('bcrypto/lib/hash256');
var Network = require('../protocol/network');
var AbstractBlockStore = require('./abstract');
var _b = require('./records'), BlockRecord = _b.BlockRecord, FileRecord = _b.FileRecord;
var layout = require('./layout');
var _c = require('./common'), types = _c.types, prefixes = _c.prefixes;
/**
 * File Block Store
 *
 * @alias module:blockstore:FileBlockStore
 * @abstract
 */
var FileBlockStore = /** @class */ (function (_super) {
    __extends(FileBlockStore, _super);
    /**
     * Create a blockstore that stores blocks in files.
     * @constructor
     */
    function FileBlockStore(options) {
        var _this = _super.call(this, options) || this;
        assert(isAbsolute(options.location), 'Location not absolute.');
        _this.location = options.location;
        _this.indexLocation = resolve(_this.location, './index');
        _this.db = bdb.create({
            location: _this.indexLocation,
            cacheSize: options.cacheSize,
            compression: false
        });
        _this.maxFileLength = options.maxFileLength || 128 * 1024 * 1024;
        assert(Number.isSafeInteger(_this.maxFileLength), 'Invalid max file length.');
        _this.network = Network.primary;
        if (options.network != null)
            _this.network = Network.get(options.network);
        _this.writing = Object.create(null);
        return _this;
    }
    /**
     * Compares the number of files in the directory
     * with the recorded number of files.
     * @param {Number} type - The type of block data
     * @private
     * @returns {Promise}
     */
    FileBlockStore.prototype.check = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, regexp, all, dats, filenos, missing, _i, filenos_1, fileno, rec;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prefix = prefixes[type];
                        regexp = new RegExp("^".concat(prefix, "(\\d{5})\\.dat$"));
                        return [4 /*yield*/, fs.readdir(this.location)];
                    case 1:
                        all = _a.sent();
                        dats = all.filter(function (f) { return regexp.test(f); });
                        filenos = dats.map(function (f) { return parseInt(f.match(regexp)[1]); });
                        missing = false;
                        _i = 0, filenos_1 = filenos;
                        _a.label = 2;
                    case 2:
                        if (!(_i < filenos_1.length)) return [3 /*break*/, 5];
                        fileno = filenos_1[_i];
                        return [4 /*yield*/, this.db.get(layout.f.encode(type, fileno))];
                    case 3:
                        rec = _a.sent();
                        if (!rec) {
                            missing = true;
                            return [3 /*break*/, 5];
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, { missing: missing, filenos: filenos }];
                }
            });
        });
    };
    /**
     * Creates indexes from files for a block type. Reads the hash of
     * the block data from the magic prefix, except for a block which
     * the hash is read from the block header.
     * @private
     * @param {Number} type - The type of block data
     * @returns {Promise}
     */
    FileBlockStore.prototype._index = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, missing, filenos, _i, filenos_2, fileno, b, filepath, data, reader, magic, blocks, hash, position, length_1, blockrecord, filerecord;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.check(type)];
                    case 1:
                        _a = _b.sent(), missing = _a.missing, filenos = _a.filenos;
                        if (!missing)
                            return [2 /*return*/];
                        this.logger.info('Indexing block type %d...', type);
                        _i = 0, filenos_2 = filenos;
                        _b.label = 2;
                    case 2:
                        if (!(_i < filenos_2.length)) return [3 /*break*/, 6];
                        fileno = filenos_2[_i];
                        b = this.db.batch();
                        filepath = this.filepath(type, fileno);
                        return [4 /*yield*/, fs.readFile(filepath)];
                    case 3:
                        data = _b.sent();
                        reader = bio.read(data);
                        magic = null;
                        blocks = 0;
                        while (reader.left() >= 4) {
                            magic = reader.readU32();
                            // Move forward a byte from the last read
                            // if the magic doesn't match.
                            if (magic !== this.network.magic) {
                                reader.seek(-3);
                                continue;
                            }
                            hash = null;
                            position = 0;
                            length_1 = 0;
                            try {
                                length_1 = reader.readU32();
                                if (type === types.BLOCK || type === types.MERKLE) {
                                    position = reader.offset;
                                    hash = hash256.digest(reader.readBytes(80, true));
                                    reader.seek(length_1 - 80);
                                }
                                else {
                                    hash = reader.readHash();
                                    position = reader.offset;
                                    reader.seek(length_1);
                                }
                            }
                            catch (err) {
                                this.logger.warning('Unknown block in file: %s, reason: %s', filepath, err.message);
                                continue;
                            }
                            blockrecord = new BlockRecord({
                                file: fileno,
                                position: position,
                                length: length_1
                            });
                            blocks += 1;
                            b.put(layout.b.encode(type, hash), blockrecord.toRaw());
                        }
                        filerecord = new FileRecord({
                            blocks: blocks,
                            used: reader.offset,
                            length: this.maxFileLength
                        });
                        b.put(layout.f.encode(type, fileno), filerecord.toRaw());
                        return [4 /*yield*/, b.write()];
                    case 4:
                        _b.sent();
                        this.logger.info('Indexed %d blocks (file=%s).', blocks, filepath);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Compares the number of files in the directory
     * with the recorded number of files. If there are any
     * inconsistencies it will reindex all blocks.
     * @private
     * @returns {Promise}
     */
    FileBlockStore.prototype.index = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._index(types.BLOCK)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._index(types.MERKLE)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this._index(types.UNDO)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method ensures that both the block storage directory
     * and index directory exist.
     * before opening.
     * @returns {Promise}
     */
    FileBlockStore.prototype.ensure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fs.mkdirp(this.indexLocation)];
            });
        });
    };
    /**
     * Opens the file block store. It will regenerate necessary block
     * indexing if the index is missing or inconsistent.
     * @returns {Promise}
     */
    FileBlockStore.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Opening FileBlockStore...');
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.verify(layout.V.encode(), 'fileblockstore', 0)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.index()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This closes the file block store and underlying
     * indexing databases.
     */
    FileBlockStore.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Closing FileBlockStore...');
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * This method will determine the file path based on the file number
     * and the current block data location.
     * @private
     * @param {Number} type - The type of block data
     * @param {Number} fileno - The number of the file.
     * @returns {Promise}
     */
    FileBlockStore.prototype.filepath = function (type, fileno) {
        var pad = 5;
        var num = fileno.toString(10);
        if (num.length > pad)
            throw new Error('File number too large.');
        while (num.length < pad)
            num = "0".concat(num);
        var filepath = null;
        var prefix = prefixes[type];
        if (!prefix)
            throw new Error('Unknown file prefix.');
        filepath = join(this.location, "".concat(prefix).concat(num, ".dat"));
        return filepath;
    };
    /**
     * This method will select and potentially allocate a file to
     * write a block based on the size and type.
     * @private
     * @param {Number} type - The type of block data
     * @param {Number} length - The number of bytes
     * @returns {Promise}
     */
    FileBlockStore.prototype.allocate = function (type, length) {
        return __awaiter(this, void 0, void 0, function () {
            var fileno, filerecord, filepath, last, rec, touch, fd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (length > this.maxFileLength)
                            throw new Error('Block length above max file length.');
                        fileno = 0;
                        filerecord = null;
                        filepath = null;
                        return [4 /*yield*/, this.db.get(layout.F.encode(type))];
                    case 1:
                        last = _a.sent();
                        if (last)
                            fileno = bio.readU32(last, 0);
                        filepath = this.filepath(type, fileno);
                        return [4 /*yield*/, this.db.get(layout.f.encode(type, fileno))];
                    case 2:
                        rec = _a.sent();
                        touch = false;
                        if (rec) {
                            filerecord = FileRecord.fromRaw(rec);
                        }
                        else {
                            touch = true;
                            filerecord = new FileRecord({
                                blocks: 0,
                                used: 0,
                                length: this.maxFileLength
                            });
                        }
                        if (filerecord.used + length > filerecord.length) {
                            fileno += 1;
                            filepath = this.filepath(type, fileno);
                            touch = true;
                            filerecord = new FileRecord({
                                blocks: 0,
                                used: 0,
                                length: this.maxFileLength
                            });
                        }
                        if (!touch) return [3 /*break*/, 5];
                        return [4 /*yield*/, fs.open(filepath, 'w')];
                    case 3:
                        fd = _a.sent();
                        return [4 /*yield*/, fs.close(fd)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, { fileno: fileno, filerecord: filerecord, filepath: filepath }];
                }
            });
        });
    };
    /**
     * This method stores merkle block data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    FileBlockStore.prototype.writeMerkle = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._write(types.MERKLE, hash, data)];
            });
        });
    };
    /**
     * This method stores block undo coin data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    FileBlockStore.prototype.writeUndo = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._write(types.UNDO, hash, data)];
            });
        });
    };
    /**
     * This method stores block data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    FileBlockStore.prototype.write = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._write(types.BLOCK, hash, data)];
            });
        });
    };
    /**
     * This method stores serialized block filter data in files.
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The serialized block filter data.
     * @returns {Promise}
     */
    FileBlockStore.prototype.writeFilter = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._write(types.FILTER, hash, data)];
            });
        });
    };
    /**
     * This method stores block data in files with by appending
     * data to the last written file and updating indexes to point
     * to the file and position.
     * @private
     * @param {Number} type - The type of block data
     * @param {Buffer} hash - The block hash
     * @param {Buffer} data - The block data
     * @returns {Promise}
     */
    FileBlockStore.prototype._write = function (type, hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            var mlength, blength, length, bwm, magic, _a, fileno, filerecord, filepath, mposition, bposition, fd, mwritten, bwritten, b, blockrecord, last;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.writing[type])
                            throw new Error('Already writing.');
                        this.writing[type] = true;
                        return [4 /*yield*/, this.db.has(layout.b.encode(type, hash))];
                    case 1:
                        if (_b.sent()) {
                            this.writing[type] = false;
                            return [2 /*return*/, false];
                        }
                        mlength = 8;
                        // Hash for a block is not stored with
                        // the magic prefix as it's read from the header
                        // of the block data.
                        if (type !== types.BLOCK && type !== types.MERKLE)
                            mlength += 32;
                        blength = data.length;
                        length = data.length + mlength;
                        bwm = bio.write(mlength);
                        bwm.writeU32(this.network.magic);
                        bwm.writeU32(blength);
                        if (type !== types.BLOCK && type !== types.MERKLE)
                            bwm.writeHash(hash);
                        magic = bwm.render();
                        return [4 /*yield*/, this.allocate(type, length)];
                    case 2:
                        _a = _b.sent(), fileno = _a.fileno, filerecord = _a.filerecord, filepath = _a.filepath;
                        mposition = filerecord.used;
                        bposition = filerecord.used + mlength;
                        return [4 /*yield*/, fs.open(filepath, 'r+')];
                    case 3:
                        fd = _b.sent();
                        mwritten = 0;
                        bwritten = 0;
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, , 7, 9]);
                        return [4 /*yield*/, fs.write(fd, magic, 0, mlength, mposition)];
                    case 5:
                        mwritten = _b.sent();
                        return [4 /*yield*/, fs.write(fd, data, 0, blength, bposition)];
                    case 6:
                        bwritten = _b.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, fs.close(fd)];
                    case 8:
                        _b.sent();
                        return [7 /*endfinally*/];
                    case 9:
                        if (mwritten !== mlength) {
                            this.writing[type] = false;
                            throw new Error('Could not write block magic.');
                        }
                        if (bwritten !== blength) {
                            this.writing[type] = false;
                            throw new Error('Could not write block.');
                        }
                        filerecord.blocks += 1;
                        filerecord.used += length;
                        b = this.db.batch();
                        blockrecord = new BlockRecord({
                            file: fileno,
                            position: bposition,
                            length: blength
                        });
                        b.put(layout.b.encode(type, hash), blockrecord.toRaw());
                        b.put(layout.f.encode(type, fileno), filerecord.toRaw());
                        last = bio.write(4).writeU32(fileno).render();
                        b.put(layout.F.encode(type), last);
                        return [4 /*yield*/, b.write()];
                    case 10:
                        _b.sent();
                        this.writing[type] = false;
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This method will retrieve merkle block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.readMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._read(types.MERKLE, hash)];
            });
        });
    };
    /**
     * This method will retrieve block undo coin data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.readUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._read(types.UNDO, hash)];
            });
        });
    };
    /**
     * This method will retrieve block data. Smaller portions of the
     * block (e.g. transactions) can be read by using the offset and
     * length arguments.
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    FileBlockStore.prototype.read = function (hash, offset, length) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._read(types.BLOCK, hash, offset, length)];
            });
        });
    };
    /**
     * This method will retrieve serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.readFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._read(types.FILTER, hash)];
            });
        });
    };
    /**
     * This method will retrieve block filter header only.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.readFilterHeader = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._read(types.FILTER, hash, 0, 32)];
            });
        });
    };
    /**
     * This methods reads data from disk by retrieving the index of
     * the data and reading from the corresponding file and location.
     * @private
     * @param {Number} type - The type of block data
     * @param {Buffer} hash - The block hash
     * @param {Number} offset - The offset within the block
     * @param {Number} length - The number of bytes of the data
     * @returns {Promise}
     */
    FileBlockStore.prototype._read = function (type, hash, offset, length) {
        return __awaiter(this, void 0, void 0, function () {
            var raw, blockrecord, filepath, position, data, fd, bytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.b.encode(type, hash))];
                    case 1:
                        raw = _a.sent();
                        if (!raw)
                            return [2 /*return*/, null];
                        blockrecord = BlockRecord.fromRaw(raw);
                        filepath = this.filepath(type, blockrecord.file);
                        position = blockrecord.position;
                        if (offset)
                            position += offset;
                        if (!length && offset > 0)
                            length = blockrecord.length - offset;
                        if (!length)
                            length = blockrecord.length;
                        if (offset + length > blockrecord.length)
                            throw new Error('Out-of-bounds read.');
                        data = Buffer.alloc(length);
                        return [4 /*yield*/, fs.open(filepath, 'r')];
                    case 2:
                        fd = _a.sent();
                        bytes = 0;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 7]);
                        return [4 /*yield*/, fs.read(fd, data, 0, length, position)];
                    case 4:
                        bytes = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, fs.close(fd)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7:
                        if (bytes !== length)
                            throw new Error('Wrong number of bytes read.');
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * This will free resources for storing merkle block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.pruneMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._prune(types.MERKLE, hash)];
            });
        });
    };
    /**
     * This will free resources for storing the block undo coin data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.pruneUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._prune(types.UNDO, hash)];
            });
        });
    };
    /**
     * This will free resources for storing the block data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.prune = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._prune(types.BLOCK, hash)];
            });
        });
    };
    /**
     * This will free resources for storing the serialized block filter data.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.pruneFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._prune(types.FILTER, hash)];
            });
        });
    };
    /**
     * This will free resources for storing the block data. The block
     * data may not be deleted from disk immediately, the index for the
     * block is removed and will not be able to be read. The underlying
     * file is unlinked when all blocks in a file have been pruned.
     * @private
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype._prune = function (type, hash) {
        return __awaiter(this, void 0, void 0, function () {
            var braw, blockrecord, fraw, filerecord, b;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.get(layout.b.encode(type, hash))];
                    case 1:
                        braw = _a.sent();
                        if (!braw)
                            return [2 /*return*/, false];
                        blockrecord = BlockRecord.fromRaw(braw);
                        return [4 /*yield*/, this.db.get(layout.f.encode(type, blockrecord.file))];
                    case 2:
                        fraw = _a.sent();
                        if (!fraw)
                            return [2 /*return*/, false];
                        filerecord = FileRecord.fromRaw(fraw);
                        filerecord.blocks -= 1;
                        b = this.db.batch();
                        if (filerecord.blocks === 0)
                            b.del(layout.f.encode(type, blockrecord.file));
                        else
                            b.put(layout.f.encode(type, blockrecord.file), filerecord.toRaw());
                        b.del(layout.b.encode(type, hash));
                        return [4 /*yield*/, b.write()];
                    case 3:
                        _a.sent();
                        if (!(filerecord.blocks === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, fs.unlink(this.filepath(type, blockrecord.file))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * This will check if merkle block data has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.hasMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.has(layout.b.encode(types.MERKLE, hash))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * This will check if a block undo coin has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.hasUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.has(layout.b.encode(types.UNDO, hash))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.hasFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.has(layout.b.encode(types.FILTER, hash))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * This will check if a block has been stored and is available.
     * @param {Buffer} hash - The block hash
     * @returns {Promise}
     */
    FileBlockStore.prototype.has = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.has(layout.b.encode(types.BLOCK, hash))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return FileBlockStore;
}(AbstractBlockStore));
/*
 * Expose
 */
module.exports = FileBlockStore;
