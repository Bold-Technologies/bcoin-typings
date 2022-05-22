/*!
 * memblock.js - memblock block object for bcoin
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
var bio = require('bufio');
var AbstractBlock = require('./abstractblock');
var Block = require('./block');
var Headers = require('./headers');
var Script = require('../script/script');
var DUMMY = Buffer.alloc(0);
/**
 * Mem Block
 * A block object which is essentially a "placeholder"
 * for a full {@link Block} object. The v8 garbage
 * collector's head will explode if there is too much
 * data on the javascript heap. Blocks can currently
 * be up to 1mb in size. In the future, they may be
 * 2mb, 8mb, or maybe 20mb, who knows? A MemBlock
 * is an optimization in Bcoin which defers parsing of
 * the serialized transactions (the block Buffer) until
 * the block has passed through the chain queue and
 * is about to enter the chain. This keeps a lot data
 * off of the javascript heap for most of the time a
 * block even exists in memory, and manages to keep a
 * lot of strain off of the garbage collector. Having
 * 500mb of blocks on the js heap would not be a good
 * thing.
 * @alias module:primitives.MemBlock
 * @extends AbstractBlock
 */
var MemBlock = /** @class */ (function (_super) {
    __extends(MemBlock, _super);
    /**
     * Create a mem block.
     * @constructor
     */
    function MemBlock() {
        var _this = _super.call(this) || this;
        _this._raw = DUMMY;
        return _this;
    }
    /**
     * Test whether the block is a memblock.
     * @returns {Boolean}
     */
    MemBlock.prototype.isMemory = function () {
        return true;
    };
    /**
     * Serialize the block headers.
     * @returns {Buffer}
     */
    MemBlock.prototype.toHead = function () {
        return this._raw.slice(0, 80);
    };
    /**
     * Get the full block size.
     * @returns {Number}
     */
    MemBlock.prototype.getSize = function () {
        return this._raw.length;
    };
    /**
     * Verify the block.
     * @returns {Boolean}
     */
    MemBlock.prototype.verifyBody = function () {
        return true;
    };
    /**
     * Retrieve the coinbase height
     * from the coinbase input script.
     * @returns {Number} height (-1 if not present).
     */
    MemBlock.prototype.getCoinbaseHeight = function () {
        if (this.version < 2)
            return -1;
        try {
            return this.parseCoinbaseHeight();
        }
        catch (e) {
            return -1;
        }
    };
    /**
     * Parse the coinbase height
     * from the coinbase input script.
     * @private
     * @returns {Number} height (-1 if not present).
     */
    MemBlock.prototype.parseCoinbaseHeight = function () {
        var br = bio.read(this._raw, true);
        br.seek(80);
        var txCount = br.readVarint();
        if (txCount === 0)
            return -1;
        br.seek(4);
        var inCount = br.readVarint();
        if (inCount === 0) {
            if (br.readU8() !== 0)
                inCount = br.readVarint();
        }
        if (inCount === 0)
            return -1;
        br.seek(36);
        var script = br.readVarBytes();
        return Script.getCoinbaseHeight(script);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    MemBlock.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.readHead(br);
        this._raw = br.data;
        return this;
    };
    /**
     * Insantiate a memblock from serialized data.
     * @param {Buffer} data
     * @returns {MemBlock}
     */
    MemBlock.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Return serialized block data.
     * @returns {Buffer}
     */
    MemBlock.prototype.toRaw = function () {
        return this._raw;
    };
    /**
     * Return serialized block data.
     * @returns {Buffer}
     */
    MemBlock.prototype.toNormal = function () {
        return this._raw;
    };
    /**
     * Parse the serialized block data
     * and create an actual {@link Block}.
     * @returns {Block}
     * @throws Parse error
     */
    MemBlock.prototype.toBlock = function () {
        var block = Block.fromRaw(this._raw);
        block._hash = this._hash;
        block._hhash = this._hhash;
        return block;
    };
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    MemBlock.prototype.toHeaders = function () {
        return Headers.fromBlock(this);
    };
    /**
     * Test whether an object is a MemBlock.
     * @param {Object} obj
     * @returns {Boolean}
     */
    MemBlock.isMemBlock = function (obj) {
        return obj instanceof MemBlock;
    };
    return MemBlock;
}(AbstractBlock));
/*
 * Expose
 */
module.exports = MemBlock;
