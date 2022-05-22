/*!
 * reader.js - bit reader for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var U64 = require('n64').U64;
/**
 * Bit Reader - as specified by BIP 158 for Golomb Rice Coding
 * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki#golomb-rice-coding
 */
var BitReader = /** @class */ (function () {
    /**
     * Create a bit reader.
     * @constructor
     * @ignore
     */
    function BitReader(data) {
        this.stream = data;
        this.pos = 0;
        this.remain = 8;
    }
    /**
     * Read bit.
     * @returns {Buffer} bit
     */
    BitReader.prototype.readBit = function () {
        if (this.pos >= this.stream.length)
            throw new Error('EOF');
        if (this.remain === 0) {
            this.pos += 1;
            if (this.pos >= this.stream.length)
                throw new Error('EOF');
            this.remain = 8;
        }
        this.remain -= 1;
        return (this.stream[this.pos] >> this.remain) & 1;
    };
    /**
     * Read byte.
     * @returns {Buffer} data
     */
    BitReader.prototype.readByte = function () {
        if (this.pos >= this.stream.length)
            throw new Error('EOF');
        if (this.remain === 0) {
            this.pos += 1;
            if (this.pos >= this.stream.length)
                throw new Error('EOF');
            this.remain = 8;
        }
        if (this.remain === 8) {
            var ch_1 = this.stream[this.pos];
            this.pos += 1;
            return ch_1;
        }
        var ch = this.stream[this.pos] & ((1 << this.remain) - 1);
        ch <<= 8 - this.remain;
        this.pos += 1;
        if (this.pos >= this.stream.length)
            throw new Error('EOF');
        ch |= this.stream[this.pos] >> this.remain;
        return ch;
    };
    /**
     * Read bits.
     * @returns {Buffer} data
     */
    BitReader.prototype.readBits = function (count) {
        assert(count >= 0);
        assert(count <= 32);
        var num = 0;
        while (count >= 8) {
            num <<= 8;
            num |= this.readByte();
            count -= 8;
        }
        while (count > 0) {
            num <<= 1;
            num |= this.readBit();
            count -= 1;
        }
        return num;
    };
    /**
     * Read bits. 64-bit.
     * @returns {Buffer} data
     */
    BitReader.prototype.readBits64 = function (count) {
        assert(count >= 0);
        assert(count <= 64);
        var num = new U64();
        if (count > 32) {
            num.hi = this.readBits(count - 32);
            num.lo = this.readBits(32);
        }
        else {
            num.lo = this.readBits(count);
        }
        return num;
    };
    return BitReader;
}());
/*
 * Expose
 */
module.exports = BitReader;
