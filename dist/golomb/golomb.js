/*!
 * golomb.js - gcs filters for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var U64 = require('n64').U64;
var hash256 = require('bcrypto/lib/hash256');
var sipmod = require('bcrypto/lib/siphash').sipmod;
var bio = require('bufio');
var BufferSet = require('buffer-map').BufferSet;
var BitWriter = require('./writer');
var BitReader = require('./reader');
/*
 * Constants
 */
var DUMMY = Buffer.alloc(0);
var EOF = new U64(-1);
/**
 * Golomb - BIP 158 block filters
 * @alias module:golomb.Golomb
 * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki
 * @property {Number} m
 * @property {Number} n
 * @property {Number} p
 * @property {Buffer} data
 */
var Golomb = /** @class */ (function () {
    /**
     * Create a block filter.
     * @constructor
     */
    function Golomb(P, M) {
        assert(P < 32 && P >= 0);
        assert(M instanceof U64);
        this.n = 0;
        this.P = P;
        this.m = null;
        this.M = M;
        this.data = DUMMY;
    }
    /**
     * Hash the block filter.
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    Golomb.prototype.hash = function (enc) {
        var h = hash256.digest(this.toNBytes());
        return enc === 'hex' ? h.toString('hex') : h;
    };
    /**
     * Get the block filter header.
     * hash of block filter concatenated with previous block filter header.
     * @param {Hash} prev - previous filter header.
     * @returns {Hash|Buffer} hash
     */
    Golomb.prototype.header = function (prev) {
        return hash256.root(this.hash(), prev);
    };
    /**
     * Get the membership of given item in the block filter.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer} data - item.
     * @returns {Boolean} match
     */
    Golomb.prototype.match = function (key, data) {
        var br = new BitReader(this.data);
        var term = sipmod64(data, key, this.m);
        var last = new U64(0);
        while (last.lt(term)) {
            var value = this.readU64(br);
            if (value === EOF)
                return false;
            value.iadd(last);
            if (value.eq(term))
                return true;
            last = value;
        }
        return false;
    };
    /**
     * Get the membership of any item of given items in the block filter.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer[]} items.
     * @returns {Boolean} match
     */
    Golomb.prototype.matchAny = function (key, items) {
        items = new BufferSet(items);
        assert(items.size > 0);
        var br = new BitReader(this.data);
        var last1 = new U64(0);
        var values = [];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var hash = sipmod64(item, key, this.m);
            values.push(hash);
        }
        values.sort(compare);
        var last2 = values[0];
        var i = 1;
        for (;;) {
            var cmp = last1.cmp(last2);
            if (cmp === 0)
                break;
            if (cmp > 0) {
                if (i < values.length) {
                    last2 = values[i];
                    i += 1;
                    continue;
                }
                return false;
            }
            var value = this.readU64(br);
            if (value === EOF)
                return false;
            last1.iadd(value);
        }
        return true;
    };
    /**
     * Read uint64 from a bit reader.
     * @param {BufferReader} br {@link BitReader}
     */
    Golomb.prototype.readU64 = function (br) {
        try {
            return this._readU64(br);
        }
        catch (e) {
            if (e.message === 'EOF')
                return EOF;
            throw e;
        }
    };
    /**
     * Read uint64 from a bit reader.
     * @param {BufferReader} br {@link BitReader}
     * @throws on EOF
     */
    Golomb.prototype._readU64 = function (br) {
        var num = new U64(0);
        // Unary
        while (br.readBit())
            num.iaddn(1);
        var rem = br.readBits64(this.P);
        return num.ishln(this.P).ior(rem);
    };
    /**
     * Serialize the block filter as raw filter bytes.
     * @returns {Buffer} filter
     */
    Golomb.prototype.toBytes = function () {
        return this.data;
    };
    /**
     * Serialize the block filter as n and raw filter bytes
     * @returns {Buffer} filter
     */
    Golomb.prototype.toNBytes = function () {
        var bw = bio.write();
        bw.writeVarint(this.n);
        bw.writeBytes(this.data);
        return bw.render();
    };
    /**
     * Serialize the block filter as default filter bytes.
     * @returns {Buffer} filter
     */
    Golomb.prototype.toRaw = function () {
        return this.toNBytes();
    };
    /**
     * Instantiate a block filter from a 128-bit key and items.
     * @param {Buffer} key - 128-bit key.
     * @param {Buffer[]} items
     * @returns {Golomb}
     */
    Golomb.prototype.fromItems = function (key, items) {
        items = new BufferSet(items);
        assert(Buffer.isBuffer(key));
        assert(key.length === 16);
        assert(items.size >= 0);
        assert(items.size <= 0xffffffff);
        this.n = items.size;
        this.m = this.M.mul(new U64(this.n));
        var values = [];
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var item = items_2[_i];
            assert(Buffer.isBuffer(item));
            var hash = sipmod64(item, key, this.m);
            values.push(hash);
        }
        values.sort(compare);
        var bw = new BitWriter();
        var last = new U64(0);
        for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
            var hash = values_1[_a];
            var rem = hash.sub(last).imaskn(this.P);
            var value = hash.sub(last).isub(rem).ishrn(this.P);
            last = hash;
            // Unary
            while (!value.isZero()) {
                bw.writeBit(1);
                value.isubn(1);
            }
            bw.writeBit(0);
            bw.writeBits64(rem, this.P);
        }
        this.data = bw.render();
        return this;
    };
    /**
     * Instantiate a block filter from an n, and raw data.
     * @param {Number} n
     * @param {Buffer} data
     * @returns {Golomb}
     */
    Golomb.prototype.fromBytes = function (n, data) {
        assert(typeof n === 'number' && isFinite(n));
        assert(Buffer.isBuffer(data));
        this.n = n;
        this.m = this.M.mul(new U64(this.n));
        this.data = data;
        return this;
    };
    /**
     * Instantiate a block filter from raw data.
     * @param {Buffer} data
     * @returns {Golomb}
     */
    Golomb.prototype.fromNBytes = function (data) {
        var br = bio.read(data);
        var n = br.readVarint();
        return this.fromBytes(n, data.slice(bio.sizeVarint(n)));
    };
    /**
     * Instantiate a block filter from raw data.
     * @param {Buffer} data
     * @returns {Golomb}
     */
    Golomb.prototype.fromRaw = function (data) {
        return this.fromNBytes(data);
    };
    return Golomb;
}());
/*
 * Helpers
 */
function sipmod64(data, key, m) {
    var _a = sipmod(data, key, m.hi, m.lo), hi = _a[0], lo = _a[1];
    return U64.fromBits(hi, lo);
}
function compare(a, b) {
    return a.cmp(b);
}
/*
 * Expose
 */
module.exports = Golomb;
