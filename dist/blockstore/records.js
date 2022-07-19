/*!
 * blockstore/records.js - blockstore records
 * Copyright (c) 2019, Braydon Fuller (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
/**
 * @module blockstore/records
 */
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
        this.file = options.file || 0;
        this.position = options.position || 0;
        this.length = options.length || 0;
        assert((this.file >>> 0) === this.file);
        assert((this.position >>> 0) === this.position);
        assert((this.length >>> 0) === this.length);
    }
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    BlockRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.file = br.readU32();
        this.position = br.readU32();
        this.length = br.readU32();
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
        var bw = bio.write(12);
        bw.writeU32(this.file);
        bw.writeU32(this.position);
        bw.writeU32(this.length);
        return bw.render();
    };
    return BlockRecord;
}());
/**
 * File Record
 */
var FileRecord = /** @class */ (function () {
    /**
     * Create a file record.
     * @constructor
     */
    function FileRecord(options) {
        if (options === void 0) { options = {}; }
        this.blocks = options.blocks || 0;
        this.used = options.used || 0;
        this.length = options.length || 0;
        assert((this.blocks >>> 0) === this.blocks);
        assert((this.used >>> 0) === this.used);
        assert((this.length >>> 0) === this.length);
    }
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    FileRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.blocks = br.readU32();
        this.used = br.readU32();
        this.length = br.readU32();
        return this;
    };
    /**
     * Instantiate file record from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {ChainState}
     */
    FileRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Serialize the file record.
     * @returns {Buffer}
     */
    FileRecord.prototype.toRaw = function () {
        var bw = bio.write(12);
        bw.writeU32(this.blocks);
        bw.writeU32(this.used);
        bw.writeU32(this.length);
        return bw.render();
    };
    return FileRecord;
}());
/*
 * Expose
 */
exports.BlockRecord = BlockRecord;
exports.FileRecord = FileRecord;
module.exports = exports;
