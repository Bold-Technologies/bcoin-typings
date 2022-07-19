/*!
 * coins.js - coins object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var CoinEntry = require('./coinentry');
/**
 * Coins
 * Represents the outputs for a single transaction.
 * @alias module:coins.Coins
 * @property {Map[]} outputs - Coins.
 */
var Coins = /** @class */ (function () {
    /**
     * Create coins.
     * @constructor
     */
    function Coins() {
        this.outputs = new Map();
    }
    /**
     * Add a single entry to the collection.
     * @param {Number} index
     * @param {CoinEntry} coin
     * @returns {CoinEntry}
     */
    Coins.prototype.add = function (index, coin) {
        assert((index >>> 0) === index);
        assert(coin);
        this.outputs.set(index, coin);
        return coin;
    };
    /**
     * Add a single output to the collection.
     * @param {Number} index
     * @param {Output} output
     * @returns {CoinEntry}
     */
    Coins.prototype.addOutput = function (index, output) {
        return this.add(index, CoinEntry.fromOutput(output));
    };
    /**
     * Add an output to the collection by output index.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {CoinEntry}
     */
    Coins.prototype.addIndex = function (tx, index, height) {
        return this.add(index, CoinEntry.fromTX(tx, index, height));
    };
    /**
     * Add a single coin to the collection.
     * @param {Coin} coin
     * @returns {CoinEntry}
     */
    Coins.prototype.addCoin = function (coin) {
        return this.add(coin.index, CoinEntry.fromCoin(coin));
    };
    /**
     * Test whether the collection has a coin.
     * @param {Number} index
     * @returns {Boolean}
     */
    Coins.prototype.has = function (index) {
        return this.outputs.has(index);
    };
    /**
     * Test whether the collection has an unspent coin.
     * @param {Number} index
     * @returns {Boolean}
     */
    Coins.prototype.isUnspent = function (index) {
        var coin = this.outputs.get(index);
        if (!coin || coin.spent)
            return false;
        return true;
    };
    /**
     * Get a coin entry.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    Coins.prototype.get = function (index) {
        return this.outputs.get(index) || null;
    };
    /**
     * Get an output.
     * @param {Number} index
     * @returns {Output|null}
     */
    Coins.prototype.getOutput = function (index) {
        var coin = this.outputs.get(index);
        if (!coin)
            return null;
        return coin.output;
    };
    /**
     * Get a coin.
     * @param {Outpoint} prevout
     * @returns {Coin|null}
     */
    Coins.prototype.getCoin = function (prevout) {
        var coin = this.outputs.get(prevout.index);
        if (!coin)
            return null;
        return coin.toCoin(prevout);
    };
    /**
     * Spend a coin entry and return it.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    Coins.prototype.spend = function (index) {
        var coin = this.get(index);
        if (!coin || coin.spent)
            return null;
        coin.spent = true;
        return coin;
    };
    /**
     * Remove a coin entry and return it.
     * @param {Number} index
     * @returns {CoinEntry|null}
     */
    Coins.prototype.remove = function (index) {
        var coin = this.get(index);
        if (!coin)
            return null;
        this.outputs["delete"](index);
        return coin;
    };
    /**
     * Test whether the coins are fully spent.
     * @returns {Boolean}
     */
    Coins.prototype.isEmpty = function () {
        return this.outputs.size === 0;
    };
    /**
     * Inject properties from tx.
     * @private
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    Coins.prototype.fromTX = function (tx, height) {
        assert(typeof height === 'number');
        for (var i = 0; i < tx.outputs.length; i++) {
            var output = tx.outputs[i];
            if (output.script.isUnspendable())
                continue;
            var entry = CoinEntry.fromTX(tx, i, height);
            this.outputs.set(i, entry);
        }
        return this;
    };
    /**
     * Instantiate a coins object from a transaction.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    Coins.fromTX = function (tx, height) {
        return new this().fromTX(tx, height);
    };
    return Coins;
}());
/*
 * Expose
 */
module.exports = Coins;
