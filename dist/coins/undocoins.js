/*!
 * undocoins.js - undocoins object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var CoinEntry = require('../coins/coinentry');
/**
 * Undo Coins
 * Coins need to be resurrected from somewhere
 * during a reorg. The undo coins store all
 * spent coins in a single record per block
 * (in a compressed format).
 * @alias module:coins.UndoCoins
 * @property {UndoCoin[]} items
 */
var UndoCoins = /** @class */ (function () {
    /**
     * Create undo coins.
     * @constructor
     */
    function UndoCoins() {
        this.items = [];
    }
    /**
     * Push coin entry onto undo coin array.
     * @param {CoinEntry}
     * @returns {Number}
     */
    UndoCoins.prototype.push = function (coin) {
        return this.items.push(coin);
    };
    /**
     * Calculate undo coins size.
     * @returns {Number}
     */
    UndoCoins.prototype.getSize = function () {
        var size = 0;
        size += 4;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var coin = _a[_i];
            size += coin.getSize();
        }
        return size;
    };
    /**
     * Serialize all undo coins.
     * @returns {Buffer}
     */
    UndoCoins.prototype.toRaw = function () {
        var size = this.getSize();
        var bw = bio.write(size);
        bw.writeU32(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var coin = _a[_i];
            coin.toWriter(bw);
        }
        return bw.render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {UndoCoins}
     */
    UndoCoins.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        var count = br.readU32();
        for (var i = 0; i < count; i++)
            this.items.push(CoinEntry.fromReader(br));
        return this;
    };
    /**
     * Instantiate undo coins from serialized data.
     * @param {Buffer} data
     * @returns {UndoCoins}
     */
    UndoCoins.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Test whether the undo coins have any members.
     * @returns {Boolean}
     */
    UndoCoins.prototype.isEmpty = function () {
        return this.items.length === 0;
    };
    /**
     * Render the undo coins.
     * @returns {Buffer}
     */
    UndoCoins.prototype.commit = function () {
        var raw = this.toRaw();
        this.items.length = 0;
        return raw;
    };
    /**
     * Re-apply undo coins to a view, effectively unspending them.
     * @param {CoinView} view
     * @param {Outpoint} prevout
     */
    UndoCoins.prototype.apply = function (view, prevout) {
        var undo = this.items.pop();
        assert(undo);
        view.addEntry(prevout, undo);
    };
    return UndoCoins;
}());
/*
 * Expose
 */
module.exports = UndoCoins;
