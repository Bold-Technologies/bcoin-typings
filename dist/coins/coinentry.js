/*!
 * coinentry.js - coin entry object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var Coin = require('../primitives/coin');
var Output = require('../primitives/output');
var compress = require('./compress');
var encoding = bio.encoding;
/*
 * Constants
 */
var NUM_FLAGS = 1;
var MAX_HEIGHT = ((1 << (32 - NUM_FLAGS)) >>> 0) - 1;
/**
 * Coin Entry
 * Represents an unspent output.
 * @alias module:coins.CoinEntry
 * @property {Number} version - Transaction version.
 * @property {Number} height - Transaction height (-1 if unconfirmed).
 * @property {Boolean} coinbase - Whether the containing
 * transaction is a coinbase.
 * @property {Output} output
 * @property {Boolean} spent
 * @property {Buffer} raw
 */
var CoinEntry = /** @class */ (function () {
    /**
     * Create a coin entry.
     * @constructor
     */
    function CoinEntry() {
        this.version = 1;
        this.height = -1;
        this.coinbase = false;
        this.output = new Output();
        this.spent = false;
        this.raw = null;
    }
    /**
     * Convert coin entry to an output.
     * @returns {Output}
     */
    CoinEntry.prototype.toOutput = function () {
        return this.output;
    };
    /**
     * Convert coin entry to a coin.
     * @param {Outpoint} prevout
     * @returns {Coin}
     */
    CoinEntry.prototype.toCoin = function (prevout) {
        var coin = new Coin();
        coin.version = this.version;
        coin.height = this.height;
        coin.coinbase = this.coinbase;
        coin.script = this.output.script;
        coin.value = this.output.value;
        coin.hash = prevout.hash;
        coin.index = prevout.index;
        return coin;
    };
    /**
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     */
    CoinEntry.prototype.fromOutput = function (output) {
        this.output = output;
        return this;
    };
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @returns {CoinEntry}
     */
    CoinEntry.fromOutput = function (output) {
        return new this().fromOutput(output);
    };
    /**
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     */
    CoinEntry.prototype.fromCoin = function (coin) {
        this.version = coin.version;
        this.height = coin.height;
        this.coinbase = coin.coinbase;
        this.output.script = coin.script;
        this.output.value = coin.value;
        return this;
    };
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @returns {CoinEntry}
     */
    CoinEntry.fromCoin = function (coin) {
        return new this().fromCoin(coin);
    };
    /**
     * Inject properties from TX.
     * @param {TX} tx
     * @param {Number} index
     */
    CoinEntry.prototype.fromTX = function (tx, index, height) {
        assert(typeof index === 'number');
        assert(typeof height === 'number');
        assert(index >= 0 && index < tx.outputs.length);
        this.version = tx.version;
        this.height = height;
        this.coinbase = tx.isCoinbase();
        this.output = tx.outputs[index];
        return this;
    };
    /**
     * Instantiate a coin from a TX
     * @param {TX} tx
     * @param {Number} index - Output index.
     * @returns {CoinEntry}
     */
    CoinEntry.fromTX = function (tx, index, height) {
        return new this().fromTX(tx, index, height);
    };
    /**
     * Calculate size of coin.
     * @returns {Number}
     */
    CoinEntry.prototype.getSize = function () {
        if (this.raw)
            return this.raw.length;
        var size = 0;
        size += encoding.sizeVarint(this.version);
        size += 4;
        size += compress.size(this.output);
        return size;
    };
    /**
     * Write the coin to a buffer writer.
     * @param {BufferWriter} bw
     */
    CoinEntry.prototype.toWriter = function (bw) {
        if (this.raw) {
            bw.writeBytes(this.raw);
            return bw;
        }
        var height = this.height;
        var field = 0;
        if (this.coinbase)
            field |= 1;
        if (height === -1)
            height = MAX_HEIGHT;
        field |= height << NUM_FLAGS;
        bw.writeVarint(this.version);
        bw.writeU32(field);
        compress.pack(this.output, bw);
        return bw;
    };
    /**
     * Serialize the coin.
     * @returns {Buffer}
     */
    CoinEntry.prototype.toRaw = function () {
        if (this.raw)
            return this.raw;
        var size = this.getSize();
        var bw = bio.write(size);
        this.toWriter(bw);
        this.raw = bw.render();
        return this.raw;
    };
    /**
     * Inject properties from serialized buffer writer.
     * @private
     * @param {BufferReader} br
     */
    CoinEntry.prototype.fromReader = function (br) {
        var version = br.readVarint();
        var field = br.readU32();
        var height = field >>> NUM_FLAGS;
        if (height === MAX_HEIGHT)
            height = -1;
        this.version = version;
        this.coinbase = (field & 1) !== 0;
        this.height = height;
        compress.unpack(this.output, br);
        return this;
    };
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @returns {CoinEntry}
     */
    CoinEntry.fromReader = function (data) {
        return new this().fromReader(data);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    CoinEntry.prototype.fromRaw = function (data) {
        this.fromReader(bio.read(data));
        this.raw = data;
        return this;
    };
    /**
     * Instantiate a coin from a serialized Buffer.
     * @param {Buffer} data
     * @returns {CoinEntry}
     */
    CoinEntry.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    return CoinEntry;
}());
/*
 * Expose
 */
module.exports = CoinEntry;
