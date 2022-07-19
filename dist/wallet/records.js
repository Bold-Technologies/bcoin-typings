/*!
 * records.js - walletdb records
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
/**
 * @module wallet/records
 */
var assert = require('bsert');
var bio = require('bufio');
var util = require('../utils/util');
var TX = require('../primitives/tx');
var consensus = require('../protocol/consensus');
/**
 * Chain State
 */
var ChainState = /** @class */ (function () {
    /**
     * Create a chain state.
     * @constructor
     */
    function ChainState() {
        this.startHeight = 0;
        this.startHash = consensus.ZERO_HASH;
        this.height = 0;
        this.marked = false;
    }
    /**
     * Clone the state.
     * @returns {ChainState}
     */
    ChainState.prototype.clone = function () {
        var state = new ChainState();
        state.startHeight = this.startHeight;
        state.startHash = this.startHash;
        state.height = this.height;
        state.marked = this.marked;
        return state;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    ChainState.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.startHeight = br.readU32();
        this.startHash = br.readHash();
        this.height = br.readU32();
        this.marked = br.readU8() === 1;
        return this;
    };
    /**
     * Instantiate chain state from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {ChainState}
     */
    ChainState.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Serialize the chain state.
     * @returns {Buffer}
     */
    ChainState.prototype.toRaw = function () {
        var bw = bio.write(41);
        bw.writeU32(this.startHeight);
        bw.writeHash(this.startHash);
        bw.writeU32(this.height);
        bw.writeU8(this.marked ? 1 : 0);
        return bw.render();
    };
    return ChainState;
}());
/**
 * Block Meta
 */
var BlockMeta = /** @class */ (function () {
    /**
     * Create block meta.
     * @constructor
     * @param {Hash} hash
     * @param {Number} height
     * @param {Number} time
     */
    function BlockMeta(hash, height, time) {
        this.hash = hash || consensus.ZERO_HASH;
        this.height = height != null ? height : -1;
        this.time = time || 0;
    }
    /**
     * Clone the block.
     * @returns {BlockMeta}
     */
    BlockMeta.prototype.clone = function () {
        return new this.constructor(this.hash, this.height, this.time);
    };
    /**
     * Get block meta hash as a buffer.
     * @returns {Buffer}
     */
    BlockMeta.prototype.toHash = function () {
        return this.hash;
    };
    /**
     * Instantiate block meta from chain entry.
     * @private
     * @param {ChainEntry} entry
     */
    BlockMeta.prototype.fromEntry = function (entry) {
        this.hash = entry.hash;
        this.height = entry.height;
        this.time = entry.time;
        return this;
    };
    /**
     * Instantiate block meta from json object.
     * @private
     * @param {Object} json
     */
    BlockMeta.prototype.fromJSON = function (json) {
        this.hash = util.revHex(json.hash);
        this.height = json.height;
        this.time = json.time;
        return this;
    };
    /**
     * Instantiate block meta from serialized tip data.
     * @private
     * @param {Buffer} data
     */
    BlockMeta.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.hash = br.readHash();
        this.height = br.readU32();
        this.time = br.readU32();
        return this;
    };
    /**
     * Instantiate block meta from chain entry.
     * @param {ChainEntry} entry
     * @returns {BlockMeta}
     */
    BlockMeta.fromEntry = function (entry) {
        return new this().fromEntry(entry);
    };
    /**
     * Instantiate block meta from json object.
     * @param {Object} json
     * @returns {BlockMeta}
     */
    BlockMeta.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Instantiate block meta from serialized data.
     * @param {Hash} hash
     * @param {Buffer} data
     * @returns {BlockMeta}
     */
    BlockMeta.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Serialize the block meta.
     * @returns {Buffer}
     */
    BlockMeta.prototype.toRaw = function () {
        var bw = bio.write(42);
        bw.writeHash(this.hash);
        bw.writeU32(this.height);
        bw.writeU32(this.time);
        return bw.render();
    };
    /**
     * Convert the block meta to a more json-friendly object.
     * @returns {Object}
     */
    BlockMeta.prototype.toJSON = function () {
        return {
            hash: util.revHex(this.hash),
            height: this.height,
            time: this.time
        };
    };
    return BlockMeta;
}());
/**
 * TX Record
 */
var TXRecord = /** @class */ (function () {
    /**
     * Create tx record.
     * @constructor
     * @param {TX} tx
     * @param {BlockMeta?} block
     */
    function TXRecord(tx, block) {
        this.tx = null;
        this.hash = null;
        this.mtime = util.now();
        this.height = -1;
        this.block = null;
        this.index = -1;
        this.time = 0;
        if (tx)
            this.fromTX(tx, block);
    }
    /**
     * Inject properties from tx and block.
     * @private
     * @param {TX} tx
     * @param {Block?} block
     * @returns {TXRecord}
     */
    TXRecord.prototype.fromTX = function (tx, block) {
        this.tx = tx;
        this.hash = tx.hash();
        if (block)
            this.setBlock(block);
        return this;
    };
    /**
     * Instantiate tx record from tx and block.
     * @param {TX} tx
     * @param {Block?} block
     * @returns {TXRecord}
     */
    TXRecord.fromTX = function (tx, block) {
        return new this().fromTX(tx, block);
    };
    /**
     * Set block data (confirm).
     * @param {BlockMeta} block
     */
    TXRecord.prototype.setBlock = function (block) {
        this.height = block.height;
        this.block = block.hash;
        this.time = block.time;
    };
    /**
     * Unset block (unconfirm).
     */
    TXRecord.prototype.unsetBlock = function () {
        this.height = -1;
        this.block = null;
        this.time = 0;
    };
    /**
     * Convert tx record to a block meta.
     * @returns {BlockMeta}
     */
    TXRecord.prototype.getBlock = function () {
        if (this.height === -1)
            return null;
        return new BlockMeta(this.block, this.height, this.time);
    };
    /**
     * Calculate current number of transaction confirmations.
     * @param {Number} height - Current chain height.
     * @returns {Number} confirmations
     */
    TXRecord.prototype.getDepth = function (height) {
        assert(typeof height === 'number', 'Must pass in height.');
        if (this.height === -1)
            return 0;
        if (height < this.height)
            return 0;
        return height - this.height + 1;
    };
    /**
     * Get serialization size.
     * @returns {Number}
     */
    TXRecord.prototype.getSize = function () {
        var size = 0;
        size += this.tx.getSize();
        size += 4;
        if (this.block) {
            size += 1;
            size += 32;
            size += 4 * 3;
        }
        else {
            size += 1;
        }
        return size;
    };
    /**
     * Serialize a transaction to "extended format".
     * @returns {Buffer}
     */
    TXRecord.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        var index = this.index;
        this.tx.toWriter(bw);
        bw.writeU32(this.mtime);
        if (this.block) {
            if (index === -1)
                index = 0x7fffffff;
            bw.writeU8(1);
            bw.writeHash(this.block);
            bw.writeU32(this.height);
            bw.writeU32(this.time);
            bw.writeU32(index);
        }
        else {
            bw.writeU8(0);
        }
        return bw.render();
    };
    /**
     * Inject properties from "extended" format.
     * @private
     * @param {Buffer} data
     */
    TXRecord.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.tx = new TX();
        this.tx.fromReader(br);
        this.hash = this.tx.hash();
        this.mtime = br.readU32();
        if (br.readU8() === 1) {
            this.block = br.readHash();
            this.height = br.readU32();
            this.time = br.readU32();
            this.index = br.readU32();
            if (this.index === 0x7fffffff)
                this.index = -1;
        }
        return this;
    };
    /**
     * Instantiate a transaction from a buffer
     * in "extended" serialization format.
     * @param {Buffer} data
     * @returns {TX}
     */
    TXRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    return TXRecord;
}());
/**
 * Map Record
 */
var MapRecord = /** @class */ (function () {
    /**
     * Create map record.
     * @constructor
     */
    function MapRecord() {
        this.wids = new Set();
    }
    MapRecord.prototype.add = function (wid) {
        if (this.wids.has(wid))
            return false;
        this.wids.add(wid);
        return true;
    };
    MapRecord.prototype.remove = function (wid) {
        return this.wids["delete"](wid);
    };
    MapRecord.prototype.toWriter = function (bw) {
        bw.writeU32(this.wids.size);
        for (var _i = 0, _a = this.wids; _i < _a.length; _i++) {
            var wid = _a[_i];
            bw.writeU32(wid);
        }
        return bw;
    };
    MapRecord.prototype.getSize = function () {
        return 4 + this.wids.size * 4;
    };
    MapRecord.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    MapRecord.prototype.fromReader = function (br) {
        var count = br.readU32();
        for (var i = 0; i < count; i++)
            this.wids.add(br.readU32());
        return this;
    };
    MapRecord.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    MapRecord.fromReader = function (br) {
        return new this().fromReader(br);
    };
    MapRecord.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    return MapRecord;
}());
/*
 * Expose
 */
exports.ChainState = ChainState;
exports.BlockMeta = BlockMeta;
exports.TXRecord = TXRecord;
exports.MapRecord = MapRecord;
module.exports = exports;
