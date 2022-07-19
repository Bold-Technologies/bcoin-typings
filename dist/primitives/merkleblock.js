/*!
 * merkleblock.js - merkleblock object for bcoin
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
var assert = require('bsert');
var bio = require('bufio');
var _a = require('buffer-map'), BufferMap = _a.BufferMap, BufferSet = _a.BufferSet;
var util = require('../utils/util');
var hash256 = require('bcrypto/lib/hash256');
var consensus = require('../protocol/consensus');
var AbstractBlock = require('./abstractblock');
var TX = require('./tx');
var Headers = require('./headers');
var DUMMY = Buffer.from([0]);
var encoding = bio.encoding;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Merkle Block
 * Represents a merkle (filtered) block.
 * @alias module:primitives.MerkleBlock
 * @extends AbstractBlock
 */
var MerkleBlock = /** @class */ (function (_super) {
    __extends(MerkleBlock, _super);
    /**
     * Create a merkle block.
     * @constructor
     * @param {Object} options
     */
    function MerkleBlock(options) {
        var _this = _super.call(this) || this;
        _this.txs = [];
        _this.hashes = [];
        _this.flags = DUMMY;
        _this.totalTX = 0;
        _this._tree = null;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    MerkleBlock.prototype.fromOptions = function (options) {
        this.parseOptions(options);
        assert(options, 'MerkleBlock data is required.');
        assert(Array.isArray(options.hashes));
        assert(Buffer.isBuffer(options.flags));
        assert((options.totalTX >>> 0) === options.totalTX);
        if (options.hashes) {
            for (var _i = 0, _a = options.hashes; _i < _a.length; _i++) {
                var hash = _a[_i];
                assert(Buffer.isBuffer(hash));
                this.hashes.push(hash);
            }
        }
        if (options.flags) {
            assert(Buffer.isBuffer(options.flags));
            this.flags = options.flags;
        }
        if (options.totalTX != null) {
            assert((options.totalTX >>> 0) === options.totalTX);
            this.totalTX = options.totalTX;
        }
        return this;
    };
    /**
     * Instantiate merkle block from options object.
     * @param {Object} options
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromOptions = function (data) {
        return new this().fromOptions(data);
    };
    /**
     * Clear any cached values.
     * @param {Boolean?} all - Clear transactions.
     */
    MerkleBlock.prototype.refresh = function (all) {
        this._refresh();
        this._tree = null;
        if (!all)
            return;
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            tx.refresh();
        }
    };
    /**
     * Test the block's _matched_ transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    MerkleBlock.prototype.hasTX = function (hash) {
        return this.indexOf(hash) !== -1;
    };
    /**
     * Test the block's _matched_ transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Number} Index.
     */
    MerkleBlock.prototype.indexOf = function (hash) {
        var tree = this.getTree();
        var index = tree.map.get(hash);
        if (index == null)
            return -1;
        return index;
    };
    /**
     * Verify the partial merkletree.
     * @private
     * @returns {Boolean}
     */
    MerkleBlock.prototype.verifyBody = function () {
        var valid = this.checkBody()[0];
        return valid;
    };
    /**
     * Verify the partial merkletree.
     * @private
     * @returns {Array} [valid, reason, score]
     */
    MerkleBlock.prototype.checkBody = function () {
        var tree = this.getTree();
        if (!tree.root.equals(this.merkleRoot))
            return [false, 'bad-txnmrklroot', 100];
        return [true, 'valid', 0];
    };
    /**
     * Extract the matches from partial merkle
     * tree and calculate merkle root.
     * @returns {Object}
     */
    MerkleBlock.prototype.getTree = function () {
        if (!this._tree) {
            try {
                this._tree = this.extractTree();
            }
            catch (e) {
                this._tree = new PartialTree();
            }
        }
        return this._tree;
    };
    /**
     * Extract the matches from partial merkle
     * tree and calculate merkle root.
     * @private
     * @returns {Object}
     */
    MerkleBlock.prototype.extractTree = function () {
        var matches = [];
        var indexes = [];
        var map = new BufferMap();
        var hashes = this.hashes;
        var flags = this.flags;
        var totalTX = this.totalTX;
        var bitsUsed = 0;
        var hashUsed = 0;
        var failed = false;
        var height = 0;
        var width = function (height) {
            return (totalTX + (1 << height) - 1) >>> height;
        };
        var traverse = function (height, pos) {
            if (bitsUsed >= flags.length * 8) {
                failed = true;
                return consensus.ZERO_HASH;
            }
            var parent = (flags[bitsUsed / 8 | 0] >>> (bitsUsed % 8)) & 1;
            bitsUsed += 1;
            if (height === 0 || !parent) {
                if (hashUsed >= hashes.length) {
                    failed = true;
                    return consensus.ZERO_HASH;
                }
                var hash = hashes[hashUsed];
                hashUsed += 1;
                if (height === 0 && parent) {
                    matches.push(hash);
                    indexes.push(pos);
                    map.set(hash, pos);
                }
                return hash;
            }
            var left = traverse(height - 1, pos * 2);
            var right;
            if (pos * 2 + 1 < width(height - 1)) {
                right = traverse(height - 1, pos * 2 + 1);
                if (right.equals(left))
                    failed = true;
            }
            else {
                right = left;
            }
            return hash256.root(left, right);
        };
        if (totalTX === 0)
            throw new Error('Zero transactions.');
        if (totalTX > consensus.MAX_BLOCK_SIZE / 60)
            throw new Error('Too many transactions.');
        if (hashes.length > totalTX)
            throw new Error('Too many hashes.');
        if (flags.length * 8 < hashes.length)
            throw new Error('Flags too small.');
        while (width(height) > 1)
            height += 1;
        var root = traverse(height, 0);
        if (failed)
            throw new Error('Mutated merkle tree.');
        if (((bitsUsed + 7) / 8 | 0) !== flags.length)
            throw new Error('Too many flag bits.');
        if (hashUsed !== hashes.length)
            throw new Error('Incorrect number of hashes.');
        return new PartialTree(root, matches, indexes, map);
    };
    /**
     * Extract the coinbase height (always -1).
     * @returns {Number}
     */
    MerkleBlock.prototype.getCoinbaseHeight = function () {
        return -1;
    };
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @returns {Object}
     */
    MerkleBlock.prototype[inspectSymbol] = function () {
        return this.format();
    };
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    MerkleBlock.prototype.format = function (view, height) {
        return {
            hash: this.rhash(),
            height: height != null ? height : -1,
            date: util.date(this.time),
            version: this.version.toString(16),
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            time: this.time,
            bits: this.bits,
            nonce: this.nonce,
            totalTX: this.totalTX,
            hashes: this.hashes.map(function (hash) {
                return hash.toString('hex');
            }),
            flags: this.flags,
            map: this.getTree().map,
            txs: this.txs.map(function (tx, i) {
                return tx.format(view, null, i);
            })
        };
    };
    /**
     * Get merkleblock size.
     * @returns {Number} Size.
     */
    MerkleBlock.prototype.getSize = function () {
        var size = 0;
        size += 80;
        size += 4;
        size += encoding.sizeVarint(this.hashes.length);
        size += this.hashes.length * 32;
        size += encoding.sizeVarint(this.flags.length);
        size += this.flags.length;
        return size;
    };
    /**
     * Get merkleblock size with transactions.
     * @returns {Number} Size.
     */
    MerkleBlock.prototype.getExtendedSize = function () {
        var size = this.getSize();
        size += encoding.sizeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            size += tx.getSize();
        }
        return size;
    };
    /**
     * Write the merkleblock to a buffer writer.
     * @param {BufferWriter} bw
     */
    MerkleBlock.prototype.toWriter = function (bw) {
        this.writeHead(bw);
        bw.writeU32(this.totalTX);
        bw.writeVarint(this.hashes.length);
        for (var _i = 0, _a = this.hashes; _i < _a.length; _i++) {
            var hash = _a[_i];
            bw.writeHash(hash);
        }
        bw.writeVarBytes(this.flags);
        return bw;
    };
    /**
     * Write the merkleblock to a buffer writer with transactions.
     * @param {BufferWriter} bw
     */
    MerkleBlock.prototype.toExtendedWriter = function (bw) {
        this.toWriter(bw);
        bw.writeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            tx.toWriter(bw);
        }
        return bw;
    };
    /**
     * Serialize the merkleblock.
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Buffer|String}
     */
    MerkleBlock.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Serialize the merkleblock with transactions.
     * @returns {Buffer}
     */
    MerkleBlock.prototype.toExtendedRaw = function () {
        var size = this.getExtendedSize();
        return this.toExtendedWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    MerkleBlock.prototype.fromReader = function (br) {
        this.readHead(br);
        this.totalTX = br.readU32();
        var count = br.readVarint();
        for (var i = 0; i < count; i++)
            this.hashes.push(br.readHash());
        this.flags = br.readVarBytes();
        return this;
    };
    /**
     * Inject properties with transactions from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    MerkleBlock.prototype.fromExtendedReader = function (br) {
        this.fromReader(br);
        var count = br.readVarint();
        for (var i = 0; i < count; i++)
            this.txs.push(TX.fromReader(br));
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    MerkleBlock.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Inject properties with transactions from serialized data.
     * @private
     * @param {Buffer} data
     */
    MerkleBlock.prototype.fromExtendedRaw = function (data) {
        return this.fromExtendedReader(bio.read(data));
    };
    /**
     * Instantiate a merkleblock from a buffer reader.
     * @param {BufferReader} br
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate a merkleblock with transactions from a buffer reader.
     * @param {BufferReader} br
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromExtendedReader = function (br) {
        return new this().fromExtendedReader(br);
    };
    /**
     * Instantiate a merkleblock from a serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Instantiate a merkleblock with transactions from a serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromExtendedRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromExtendedRaw(data);
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    MerkleBlock.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    MerkleBlock.prototype.getJSON = function (network, view, height) {
        return {
            hash: this.rhash(),
            height: height,
            version: this.version,
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            time: this.time,
            bits: this.bits,
            nonce: this.nonce,
            totalTX: this.totalTX,
            hashes: this.hashes.map(function (hash) {
                return util.revHex(hash);
            }),
            flags: this.flags.toString('hex')
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    MerkleBlock.prototype.fromJSON = function (json) {
        assert(json, 'MerkleBlock data is required.');
        assert(Array.isArray(json.hashes));
        assert(typeof json.flags === 'string');
        assert((json.totalTX >>> 0) === json.totalTX);
        this.parseJSON(json);
        for (var _i = 0, _a = json.hashes; _i < _a.length; _i++) {
            var hash = _a[_i];
            this.hashes.push(util.fromRev(hash));
        }
        this.flags = Buffer.from(json.flags, 'hex');
        this.totalTX = json.totalTX;
        return this;
    };
    /**
     * Instantiate a merkle block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Create a merkleblock from a {@link Block} object, passing
     * it through a filter first. This will build the partial
     * merkle tree.
     * @param {Block} block
     * @param {Bloom} filter
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromBlock = function (block, filter) {
        var matches = [];
        for (var _i = 0, _a = block.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            matches.push(tx.isWatched(filter) ? 1 : 0);
        }
        return this.fromMatches(block, matches);
    };
    /**
     * Create a merkleblock from an array of txids.
     * This will build the partial merkle tree.
     * @param {Block} block
     * @param {Hash[]} hashes
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromHashes = function (block, hashes) {
        var filter = new BufferSet();
        for (var _i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
            var hash = hashes_1[_i];
            filter.add(hash);
        }
        var matches = [];
        for (var _a = 0, _b = block.txs; _a < _b.length; _a++) {
            var tx = _b[_a];
            var hash = tx.hash();
            matches.push(filter.has(hash) ? 1 : 0);
        }
        return this.fromMatches(block, matches);
    };
    /**
     * Create a merkleblock from an array of matches.
     * This will build the partial merkle tree.
     * @param {Block} block
     * @param {Number[]} matches
     * @returns {MerkleBlock}
     */
    MerkleBlock.fromMatches = function (block, matches) {
        var txs = [];
        var leaves = [];
        var bits = [];
        var hashes = [];
        var totalTX = block.txs.length;
        var height = 0;
        var width = function (height) {
            return (totalTX + (1 << height) - 1) >>> height;
        };
        var hash = function (height, pos, leaves) {
            if (height === 0)
                return leaves[pos];
            var left = hash(height - 1, pos * 2, leaves);
            var right;
            if (pos * 2 + 1 < width(height - 1))
                right = hash(height - 1, pos * 2 + 1, leaves);
            else
                right = left;
            return hash256.root(left, right);
        };
        var traverse = function (height, pos, leaves, matches) {
            var parent = 0;
            for (var p = pos << height; p < ((pos + 1) << height) && p < totalTX; p++)
                parent |= matches[p];
            bits.push(parent);
            if (height === 0 || !parent) {
                hashes.push(hash(height, pos, leaves));
                return;
            }
            traverse(height - 1, pos * 2, leaves, matches);
            if (pos * 2 + 1 < width(height - 1))
                traverse(height - 1, pos * 2 + 1, leaves, matches);
        };
        for (var i = 0; i < block.txs.length; i++) {
            var tx = block.txs[i];
            if (matches[i])
                txs.push(tx);
            leaves.push(tx.hash());
        }
        while (width(height) > 1)
            height += 1;
        traverse(height, 0, leaves, matches);
        var flags = Buffer.allocUnsafe((bits.length + 7) / 8 | 0);
        flags.fill(0);
        for (var p = 0; p < bits.length; p++)
            flags[p / 8 | 0] |= bits[p] << (p % 8);
        var merkle = new this();
        merkle._hash = block._hash;
        merkle._hhash = block._hhash;
        merkle.version = block.version;
        merkle.prevBlock = block.prevBlock;
        merkle.merkleRoot = block.merkleRoot;
        merkle.time = block.time;
        merkle.bits = block.bits;
        merkle.nonce = block.nonce;
        merkle.totalTX = totalTX;
        merkle.hashes = hashes;
        merkle.flags = flags;
        merkle.txs = txs;
        return merkle;
    };
    /**
     * Test whether an object is a MerkleBlock.
     * @param {Object} obj
     * @returns {Boolean}
     */
    MerkleBlock.isMerkleBlock = function (obj) {
        return obj instanceof MerkleBlock;
    };
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    MerkleBlock.prototype.toHeaders = function () {
        return Headers.fromBlock(this);
    };
    return MerkleBlock;
}(AbstractBlock));
/*
 * Helpers
 */
var PartialTree = /** @class */ (function () {
    function PartialTree(root, matches, indexes, map) {
        this.root = root || consensus.ZERO_HASH;
        this.matches = matches || [];
        this.indexes = indexes || [];
        this.map = map || new BufferMap();
    }
    return PartialTree;
}());
/*
 * Expose
 */
module.exports = MerkleBlock;
