/*!
 * bip152.js - compact block object for bcoin
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
/**
 * @module net/bip152
 */
var assert = require('bsert');
var bio = require('bufio');
var consensus = require('../protocol/consensus');
var sha256 = require('bcrypto/lib/sha256');
var siphash = require('bcrypto/lib/siphash').siphash;
var AbstractBlock = require('../primitives/abstractblock');
var TX = require('../primitives/tx');
var Headers = require('../primitives/headers');
var Block = require('../primitives/block');
var common = require('./common');
var encoding = bio.encoding;
/**
 * Compact Block
 * Represents a compact block (bip152): `cmpctblock` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @extends AbstractBlock
 * @property {Buffer|null} keyNonce - Nonce for siphash key.
 * @property {Number[]} ids - Short IDs.
 * @property {Object[]} ptx - Prefilled transactions.
 * @property {TX[]} available - Available transaction vector.
 * @property {Object} idMap - Map of short ids to indexes.
 * @property {Number} count - Transactions resolved.
 * @property {Buffer|null} sipKey - Siphash key.
 */
var CompactBlock = /** @class */ (function (_super) {
    __extends(CompactBlock, _super);
    /**
     * Create a compact block.
     * @constructor
     * @param {Object?} options
     */
    function CompactBlock(options) {
        var _this = _super.call(this) || this;
        _this.keyNonce = null;
        _this.ids = [];
        _this.ptx = [];
        _this.available = [];
        _this.idMap = new Map();
        _this.count = 0;
        _this.sipKey = null;
        _this.totalTX = 0;
        _this.now = 0;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    CompactBlock.prototype.fromOptions = function (options) {
        this.parseOptions(options);
        assert(Buffer.isBuffer(options.keyNonce));
        assert(Array.isArray(options.ids));
        assert(Array.isArray(options.ptx));
        this.keyNonce = options.keyNonce;
        this.ids = options.ids;
        this.ptx = options.ptx;
        if (options.available)
            this.available = options.available;
        if (options.idMap)
            this.idMap = options.idMap;
        if (options.count)
            this.count = options.count;
        if (options.totalTX != null)
            this.totalTX = options.totalTX;
        this.sipKey = this.getKey();
        return this;
    };
    /**
     * Instantiate compact block from options.
     * @param {Object} options
     * @returns {CompactBlock}
     */
    CompactBlock.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Verify the block.
     * @returns {Boolean}
     */
    CompactBlock.prototype.verifyBody = function () {
        return true;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    CompactBlock.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.readHead(br);
        this.keyNonce = br.readBytes(8);
        this.sipKey = this.getKey();
        var idCount = br.readVarint();
        this.totalTX += idCount;
        for (var i = 0; i < idCount; i++) {
            var lo = br.readU32();
            var hi = br.readU16();
            this.ids.push(hi * 0x100000000 + lo);
        }
        var txCount = br.readVarint();
        this.totalTX += txCount;
        for (var i = 0; i < txCount; i++) {
            var index = br.readVarint();
            assert(index <= 0xffff);
            assert(index < this.totalTX);
            var tx = TX.fromReader(br);
            this.ptx.push([index, tx]);
        }
        return this;
    };
    /**
     * Instantiate a block from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {CompactBlock}
     */
    CompactBlock.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Serialize compact block with witness data.
     * @returns {Buffer}
     */
    CompactBlock.prototype.toRaw = function () {
        return this.frameRaw(true);
    };
    /**
     * Serialize compact block without witness data.
     * @returns {Buffer}
     */
    CompactBlock.prototype.toNormal = function () {
        return this.frameRaw(false);
    };
    /**
     * Write serialized block to a buffer
     * writer (includes witness data).
     * @param {BufferWriter} bw
     */
    CompactBlock.prototype.toWriter = function (bw) {
        return this.writeRaw(bw, true);
    };
    /**
     * Write serialized block to a buffer
     * writer (excludes witness data).
     * @param {BufferWriter} bw
     */
    CompactBlock.prototype.toNormalWriter = function (bw) {
        return this.writeRaw(bw, false);
    };
    /**
     * Serialize compact block.
     * @private
     * @param {Boolean} witness
     * @returns {Buffer}
     */
    CompactBlock.prototype.frameRaw = function (witness) {
        var size = this.getSize(witness);
        return this.writeRaw(bio.write(size), witness).render();
    };
    /**
     * Calculate block serialization size.
     * @param {Boolean} witness
     * @returns {Number}
     */
    CompactBlock.prototype.getSize = function (witness) {
        var size = 0;
        size += 80;
        size += 8;
        size += encoding.sizeVarint(this.ids.length);
        size += this.ids.length * 6;
        size += encoding.sizeVarint(this.ptx.length);
        for (var _i = 0, _a = this.ptx; _i < _a.length; _i++) {
            var _b = _a[_i], index = _b[0], tx = _b[1];
            size += encoding.sizeVarint(index);
            if (witness)
                size += tx.getSize();
            else
                size += tx.getBaseSize();
        }
        return size;
    };
    /**
     * Serialize block to buffer writer.
     * @private
     * @param {BufferWriter} bw
     * @param {Boolean} witness
     */
    CompactBlock.prototype.writeRaw = function (bw, witness) {
        this.writeHead(bw);
        bw.writeBytes(this.keyNonce);
        bw.writeVarint(this.ids.length);
        for (var _i = 0, _a = this.ids; _i < _a.length; _i++) {
            var id = _a[_i];
            var lo = id % 0x100000000;
            var hi = (id - lo) / 0x100000000;
            assert(hi <= 0xffff);
            bw.writeU32(lo);
            bw.writeU16(hi);
        }
        bw.writeVarint(this.ptx.length);
        for (var _b = 0, _c = this.ptx; _b < _c.length; _b++) {
            var _d = _c[_b], index = _d[0], tx = _d[1];
            bw.writeVarint(index);
            if (witness)
                tx.toWriter(bw);
            else
                tx.toNormalWriter(bw);
        }
        return bw;
    };
    /**
     * Convert block to a TXRequest
     * containing missing indexes.
     * @returns {TXRequest}
     */
    CompactBlock.prototype.toRequest = function () {
        return TXRequest.fromCompact(this);
    };
    /**
     * Attempt to fill missing transactions from mempool.
     * @param {Boolean} witness
     * @param {Mempool} mempool
     * @returns {Boolean}
     */
    CompactBlock.prototype.fillMempool = function (witness, mempool) {
        if (this.count === this.totalTX)
            return true;
        var set = new Set();
        for (var _i = 0, _a = mempool.map.values(); _i < _a.length; _i++) {
            var tx = _a[_i].tx;
            var hash = tx.hash();
            if (witness)
                hash = tx.witnessHash();
            var id = this.sid(hash);
            var index = this.idMap.get(id);
            if (index == null)
                continue;
            if (set.has(index)) {
                // Siphash collision, just request it.
                this.available[index] = null;
                this.count -= 1;
                continue;
            }
            this.available[index] = tx;
            set.add(index);
            this.count += 1;
            // We actually may have a siphash collision
            // here, but exit early anyway for perf.
            if (this.count === this.totalTX)
                return true;
        }
        return false;
    };
    /**
     * Attempt to fill missing transactions from TXResponse.
     * @param {TXResponse} res
     * @returns {Boolean}
     */
    CompactBlock.prototype.fillMissing = function (res) {
        var offset = 0;
        for (var i = 0; i < this.available.length; i++) {
            if (this.available[i])
                continue;
            if (offset >= res.txs.length)
                return false;
            this.available[i] = res.txs[offset++];
        }
        return offset === res.txs.length;
    };
    /**
     * Calculate a transaction short ID.
     * @param {Hash} hash
     * @returns {Number}
     */
    CompactBlock.prototype.sid = function (hash) {
        var _a = siphash(hash, this.sipKey), hi = _a[0], lo = _a[1];
        return (hi & 0xffff) * 0x100000000 + (lo >>> 0);
    };
    /**
     * Test whether an index is available.
     * @param {Number} index
     * @returns {Boolean}
     */
    CompactBlock.prototype.hasIndex = function (index) {
        return this.available[index] != null;
    };
    /**
     * Initialize the siphash key.
     * @private
     * @returns {Buffer}
     */
    CompactBlock.prototype.getKey = function () {
        var data = Buffer.concat([this.toHead(), this.keyNonce]);
        var hash = sha256.digest(data);
        return hash.slice(0, 16);
    };
    /**
     * Initialize compact block and short id map.
     * @private
     */
    CompactBlock.prototype.init = function () {
        if (this.totalTX === 0)
            throw new Error('Empty vectors.');
        if (this.totalTX > consensus.MAX_BLOCK_SIZE / 10)
            throw new Error('Compact block too big.');
        // Custom limit to avoid a hashdos.
        // Min valid tx size: (4 + 1 + 41 + 1 + 9 + 4) = 60
        // Min block header size: 81
        // Max number of transactions: (1000000 - 81) / 60 = 16665
        if (this.totalTX > (consensus.MAX_BLOCK_SIZE - 81) / 60)
            throw new Error('Compact block too big.');
        // No sparse arrays here, v8.
        for (var i = 0; i < this.totalTX; i++)
            this.available.push(null);
        var last = -1;
        var offset = 0;
        for (var i = 0; i < this.ptx.length; i++) {
            var _a = this.ptx[i], index = _a[0], tx = _a[1];
            last += index + 1;
            assert(last <= 0xffff);
            assert(last <= this.ids.length + i);
            this.available[last] = tx;
            this.count += 1;
        }
        for (var i = 0; i < this.ids.length; i++) {
            var id = this.ids[i];
            while (this.available[i + offset])
                offset += 1;
            // Fails on siphash collision.
            if (this.idMap.has(id))
                return false;
            this.idMap.set(id, i + offset);
        }
        return true;
    };
    /**
     * Convert completely filled compact
     * block to a regular block.
     * @returns {Block}
     */
    CompactBlock.prototype.toBlock = function () {
        var block = new Block();
        block.version = this.version;
        block.prevBlock = this.prevBlock;
        block.merkleRoot = this.merkleRoot;
        block.time = this.time;
        block.bits = this.bits;
        block.nonce = this.nonce;
        block._hash = this._hash;
        block._hhash = this._hhash;
        for (var _i = 0, _a = this.available; _i < _a.length; _i++) {
            var tx = _a[_i];
            assert(tx, 'Compact block is not full.');
            block.txs.push(tx);
        }
        return block;
    };
    /**
     * Inject properties from block.
     * @private
     * @param {Block} block
     * @param {Boolean} witness
     * @param {Buffer?} nonce
     * @returns {CompactBlock}
     */
    CompactBlock.prototype.fromBlock = function (block, witness, nonce) {
        this.version = block.version;
        this.prevBlock = block.prevBlock;
        this.merkleRoot = block.merkleRoot;
        this.time = block.time;
        this.bits = block.bits;
        this.nonce = block.nonce;
        this.totalTX = block.txs.length;
        this._hash = block._hash;
        this._hhash = block._hhash;
        if (!nonce)
            nonce = common.nonce();
        this.keyNonce = nonce;
        this.sipKey = this.getKey();
        for (var i = 1; i < block.txs.length; i++) {
            var tx = block.txs[i];
            var hash = tx.hash();
            if (witness)
                hash = tx.witnessHash();
            var id = this.sid(hash);
            this.ids.push(id);
        }
        this.ptx.push([0, block.txs[0]]);
        return this;
    };
    /**
     * Instantiate compact block from a block.
     * @param {Block} block
     * @param {Boolean} witness
     * @param {Buffer?} nonce
     * @returns {CompactBlock}
     */
    CompactBlock.fromBlock = function (block, witness, nonce) {
        return new this().fromBlock(block, witness, nonce);
    };
    /**
     * Convert block to headers.
     * @returns {Headers}
     */
    CompactBlock.prototype.toHeaders = function () {
        return Headers.fromBlock(this);
    };
    return CompactBlock;
}(AbstractBlock));
/**
 * TX Request
 * Represents a BlockTransactionsRequest (bip152): `getblocktxn` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @property {Hash} hash
 * @property {Number[]} indexes
 */
var TXRequest = /** @class */ (function () {
    /**
     * TX Request
     * @constructor
     * @param {Object?} options
     */
    function TXRequest(options) {
        this.hash = consensus.ZERO_HASH;
        this.indexes = [];
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     * @returns {TXRequest}
     */
    TXRequest.prototype.fromOptions = function (options) {
        this.hash = options.hash;
        if (options.indexes)
            this.indexes = options.indexes;
        return this;
    };
    /**
     * Instantiate request from options.
     * @param {Object} options
     * @returns {TXRequest}
     */
    TXRequest.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Inject properties from compact block.
     * @private
     * @param {CompactBlock} block
     * @returns {TXRequest}
     */
    TXRequest.prototype.fromCompact = function (block) {
        this.hash = block.hash();
        for (var i = 0; i < block.available.length; i++) {
            if (!block.available[i])
                this.indexes.push(i);
        }
        return this;
    };
    /**
     * Instantiate request from compact block.
     * @param {CompactBlock} block
     * @returns {TXRequest}
     */
    TXRequest.fromCompact = function (block) {
        return new this().fromCompact(block);
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {TXRequest}
     */
    TXRequest.prototype.fromReader = function (br) {
        this.hash = br.readHash();
        var count = br.readVarint();
        for (var i = 0; i < count; i++) {
            var index = br.readVarint();
            assert(index <= 0xffff);
            this.indexes.push(index);
        }
        var offset = 0;
        for (var i = 0; i < count; i++) {
            var index = this.indexes[i];
            index += offset;
            assert(index <= 0xffff);
            this.indexes[i] = index;
            offset = index + 1;
        }
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {TXRequest}
     */
    TXRequest.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate request from buffer reader.
     * @param {BufferReader} br
     * @returns {TXRequest}
     */
    TXRequest.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate request from serialized data.
     * @param {Buffer} data
     * @returns {TXRequest}
     */
    TXRequest.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Calculate request serialization size.
     * @returns {Number}
     */
    TXRequest.prototype.getSize = function () {
        var size = 0;
        size += 32;
        size += encoding.sizeVarint(this.indexes.length);
        for (var i = 0; i < this.indexes.length; i++) {
            var index = this.indexes[i];
            if (i > 0)
                index -= this.indexes[i - 1] + 1;
            size += encoding.sizeVarint(index);
        }
        return size;
    };
    /**
     * Write serialized request to buffer writer.
     * @param {BufferWriter} bw
     */
    TXRequest.prototype.toWriter = function (bw) {
        bw.writeHash(this.hash);
        bw.writeVarint(this.indexes.length);
        for (var i = 0; i < this.indexes.length; i++) {
            var index = this.indexes[i];
            if (i > 0)
                index -= this.indexes[i - 1] + 1;
            bw.writeVarint(index);
        }
        return bw;
    };
    /**
     * Serialize request.
     * @returns {Buffer}
     */
    TXRequest.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    return TXRequest;
}());
/**
 * TX Response
 * Represents BlockTransactions (bip152): `blocktxn` packet.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0152.mediawiki
 * @property {Hash} hash
 * @property {TX[]} txs
 */
var TXResponse = /** @class */ (function () {
    /**
     * Create a tx response.
     * @constructor
     * @param {Object?} options
     */
    function TXResponse(options) {
        this.hash = consensus.ZERO_HASH;
        this.txs = [];
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     * @returns {TXResponse}
     */
    TXResponse.prototype.fromOptions = function (options) {
        this.hash = options.hash;
        if (options.txs)
            this.txs = options.txs;
        return this;
    };
    /**
     * Instantiate response from options.
     * @param {Object} options
     * @returns {TXResponse}
     */
    TXResponse.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {TXResponse}
     */
    TXResponse.prototype.fromReader = function (br) {
        this.hash = br.readHash();
        var count = br.readVarint();
        for (var i = 0; i < count; i++)
            this.txs.push(TX.fromReader(br));
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {TXResponse}
     */
    TXResponse.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate response from buffer reader.
     * @param {BufferReader} br
     * @returns {TXResponse}
     */
    TXResponse.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate response from serialized data.
     * @param {Buffer} data
     * @returns {TXResponse}
     */
    TXResponse.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Inject properties from block.
     * @private
     * @param {Block} block
     * @returns {TXResponse}
     */
    TXResponse.prototype.fromBlock = function (block, req) {
        this.hash = req.hash;
        for (var _i = 0, _a = req.indexes; _i < _a.length; _i++) {
            var index = _a[_i];
            if (index >= block.txs.length)
                break;
            this.txs.push(block.txs[index]);
        }
        return this;
    };
    /**
     * Instantiate response from block.
     * @param {Block} block
     * @returns {TXResponse}
     */
    TXResponse.fromBlock = function (block, req) {
        return new this().fromBlock(block, req);
    };
    /**
     * Serialize response with witness data.
     * @returns {Buffer}
     */
    TXResponse.prototype.toRaw = function () {
        return this.frameRaw(true);
    };
    /**
     * Serialize response without witness data.
     * @returns {Buffer}
     */
    TXResponse.prototype.toNormal = function () {
        return this.frameRaw(false);
    };
    /**
     * Write serialized response to a buffer
     * writer (includes witness data).
     * @param {BufferWriter} bw
     */
    TXResponse.prototype.toWriter = function (bw) {
        return this.writeRaw(bw, true);
    };
    /**
     * Write serialized response to a buffer
     * writer (excludes witness data).
     * @param {BufferWriter} bw
     */
    TXResponse.prototype.toNormalWriter = function (bw) {
        return this.writeRaw(bw, false);
    };
    /**
     * Calculate request serialization size.
     * @returns {Number}
     */
    TXResponse.prototype.getSize = function (witness) {
        var size = 0;
        size += 32;
        size += encoding.sizeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            if (witness)
                size += tx.getSize();
            else
                size += tx.getBaseSize();
        }
        return size;
    };
    /**
     * Write serialized response to buffer writer.
     * @private
     * @param {BufferWriter} bw
     * @param {Boolean} witness
     */
    TXResponse.prototype.writeRaw = function (bw, witness) {
        bw.writeHash(this.hash);
        bw.writeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            if (witness)
                tx.toWriter(bw);
            else
                tx.toNormalWriter(bw);
        }
        return bw;
    };
    /**
     * Serialize response with witness data.
     * @private
     * @param {Boolean} witness
     * @returns {Buffer}
     */
    TXResponse.prototype.frameRaw = function (witness) {
        var size = this.getSize(witness);
        return this.writeRaw(bio.write(size), witness).render();
    };
    return TXResponse;
}());
/*
 * Expose
 */
exports.CompactBlock = CompactBlock;
exports.TXRequest = TXRequest;
exports.TXResponse = TXResponse;
