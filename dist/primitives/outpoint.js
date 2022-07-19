/*!
 * outpoint.js - outpoint object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var util = require('../utils/util');
var consensus = require('../protocol/consensus');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Outpoint
 * Represents a COutPoint.
 * @alias module:primitives.Outpoint
 * @property {Hash} hash
 * @property {Number} index
 */
var Outpoint = /** @class */ (function () {
    /**
     * Create an outpoint.
     * @constructor
     * @param {Hash?} hash
     * @param {Number?} index
     */
    function Outpoint(hash, index) {
        this.hash = consensus.ZERO_HASH;
        this.index = 0xffffffff;
        if (hash != null) {
            assert(Buffer.isBuffer(hash));
            assert((index >>> 0) === index, 'Index must be a uint32.');
            this.hash = hash;
            this.index = index;
        }
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Outpoint.prototype.fromOptions = function (options) {
        assert(options, 'Outpoint data is required.');
        assert(Buffer.isBuffer(options.hash));
        assert((options.index >>> 0) === options.index, 'Index must be a uint32.');
        this.hash = options.hash;
        this.index = options.index;
        return this;
    };
    /**
     * Instantate outpoint from options object.
     * @param {Object} options
     * @returns {Outpoint}
     */
    Outpoint.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clone the outpoint.
     * @returns {Outpoint}
     */
    Outpoint.prototype.clone = function () {
        var outpoint = new this.constructor();
        outpoint.hash = this.hash;
        outpoint.index = this.index;
        return outpoint;
    };
    /**
     * Test equality against another outpoint.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    Outpoint.prototype.equals = function (prevout) {
        assert(Outpoint.isOutpoint(prevout));
        return this.hash.equals(prevout.hash)
            && this.index === prevout.index;
    };
    /**
     * Compare against another outpoint (BIP69).
     * @param {Outpoint} prevout
     * @returns {Number}
     */
    Outpoint.prototype.compare = function (prevout) {
        assert(Outpoint.isOutpoint(prevout));
        var cmp = strcmp(this.txid(), prevout.txid());
        if (cmp !== 0)
            return cmp;
        return this.index - prevout.index;
    };
    /**
     * Test whether the outpoint is null (hash of zeroes
     * with max-u32 index). Used to detect coinbases.
     * @returns {Boolean}
     */
    Outpoint.prototype.isNull = function () {
        return this.index === 0xffffffff && this.hash.equals(consensus.ZERO_HASH);
    };
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    Outpoint.prototype.rhash = function () {
        return util.revHex(this.hash);
    };
    /**
     * Get little-endian hash.
     * @returns {Hash}
     */
    Outpoint.prototype.txid = function () {
        return this.rhash();
    };
    /**
     * Serialize outpoint to a key
     * suitable for a hash table.
     * @returns {String}
     */
    Outpoint.prototype.toKey = function () {
        return this.toRaw();
    };
    /**
     * Inject properties from hash table key.
     * @private
     * @param {String} key
     * @returns {Outpoint}
     */
    Outpoint.prototype.fromKey = function (key) {
        this.hash = key.slice(0, 32);
        this.index = bio.readU32(key, 32);
        return this;
    };
    /**
     * Instantiate outpoint from hash table key.
     * @param {String} key
     * @returns {Outpoint}
     */
    Outpoint.fromKey = function (key) {
        return new this().fromKey(key);
    };
    /**
     * Write outpoint to a buffer writer.
     * @param {BufferWriter} bw
     */
    Outpoint.prototype.toWriter = function (bw) {
        bw.writeHash(this.hash);
        bw.writeU32(this.index);
        return bw;
    };
    /**
     * Calculate size of outpoint.
     * @returns {Number}
     */
    Outpoint.prototype.getSize = function () {
        return 36;
    };
    /**
     * Serialize outpoint.
     * @returns {Buffer}
     */
    Outpoint.prototype.toRaw = function () {
        return this.toWriter(bio.write(36)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    Outpoint.prototype.fromReader = function (br) {
        this.hash = br.readHash();
        this.index = br.readU32();
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Outpoint.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate outpoint from a buffer reader.
     * @param {BufferReader} br
     * @returns {Outpoint}
     */
    Outpoint.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate outpoint from serialized data.
     * @param {Buffer} data
     * @returns {Outpoint}
     */
    Outpoint.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Inject properties from json object.
     * @private
     * @params {Object} json
     */
    Outpoint.prototype.fromJSON = function (json) {
        assert(json, 'Outpoint data is required.');
        assert(typeof json.hash === 'string', 'Hash must be a string.');
        assert((json.index >>> 0) === json.index, 'Index must be a uint32.');
        this.hash = util.fromRev(json.hash);
        this.index = json.index;
        return this;
    };
    /**
     * Convert the outpoint to an object suitable
     * for JSON serialization. Note that the hash
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @returns {Object}
     */
    Outpoint.prototype.toJSON = function () {
        return {
            hash: util.revHex(this.hash),
            index: this.index
        };
    };
    /**
     * Instantiate outpoint from json object.
     * @param {Object} json
     * @returns {Outpoint}
     */
    Outpoint.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Inject properties from tx.
     * @private
     * @param {TX} tx
     * @param {Number} index
     */
    Outpoint.prototype.fromTX = function (tx, index) {
        assert(tx);
        assert(typeof index === 'number');
        assert(index >= 0);
        this.hash = tx.hash();
        this.index = index;
        return this;
    };
    /**
     * Instantiate outpoint from tx.
     * @param {TX} tx
     * @param {Number} index
     * @returns {Outpoint}
     */
    Outpoint.fromTX = function (tx, index) {
        return new this().fromTX(tx, index);
    };
    /**
     * Serialize outpoint to a key
     * suitable for a hash table.
     * @param {Hash} hash
     * @param {Number} index
     * @returns {String}
     */
    Outpoint.toKey = function (hash, index) {
        return new Outpoint(hash, index).toKey();
    };
    /**
     * Convert the outpoint to a user-friendly string.
     * @returns {String}
     */
    Outpoint.prototype[inspectSymbol] = function () {
        return "<Outpoint: ".concat(this.rhash(), "/").concat(this.index, ">");
    };
    /**
     * Test an object to see if it is an outpoint.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Outpoint.isOutpoint = function (obj) {
        return obj instanceof Outpoint;
    };
    return Outpoint;
}());
/*
 * Helpers
 */
function strcmp(a, b) {
    var len = Math.min(a.length, b.length);
    for (var i = 0; i < len; i++) {
        if (a[i] < b[i])
            return -1;
        if (a[i] > b[i])
            return 1;
    }
    if (a.length < b.length)
        return -1;
    if (a.length > b.length)
        return 1;
    return 0;
}
/*
 * Expose
 */
module.exports = Outpoint;
