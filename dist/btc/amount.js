/*!
 * amount.js - amount object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var fixed = require('../utils/fixed');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Amount
 * Represents a bitcoin amount (satoshis internally).
 * @alias module:btc.Amount
 * @property {Amount} value
 */
var Amount = /** @class */ (function () {
    /**
     * Create an amount.
     * @constructor
     * @param {(String|Number)?} value
     * @param {String?} unit
     */
    function Amount(value, unit) {
        this.value = 0;
        if (value != null)
            this.fromOptions(value, unit);
    }
    /**
     * Inject properties from options.
     * @private
     * @param {(String|Number)?} value
     * @param {String?} unit
     * @returns {Amount}
     */
    Amount.prototype.fromOptions = function (value, unit) {
        if (typeof unit === 'string')
            return this.from(unit, value);
        if (typeof value === 'number')
            return this.fromValue(value);
        return this.fromBTC(value);
    };
    /**
     * Get satoshi value.
     * @returns {Amount}
     */
    Amount.prototype.toValue = function () {
        return this.value;
    };
    /**
     * Get satoshi string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    Amount.prototype.toSatoshis = function (num) {
        if (num)
            return this.value;
        return this.value.toString(10);
    };
    /**
     * Get bits string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    Amount.prototype.toBits = function (num) {
        return Amount.encode(this.value, 2, num);
    };
    /**
     * Get mbtc string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    Amount.prototype.toMBTC = function (num) {
        return Amount.encode(this.value, 5, num);
    };
    /**
     * Get btc string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    Amount.prototype.toBTC = function (num) {
        return Amount.encode(this.value, 8, num);
    };
    /**
     * Get unit string or value.
     * @param {String} unit - Can be `sat`,
     * `ubtc`, `bits`, `mbtc`, or `btc`.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    Amount.prototype.to = function (unit, num) {
        switch (unit) {
            case 'sat':
                return this.toSatoshis(num);
            case 'ubtc':
            case 'bits':
                return this.toBits(num);
            case 'mbtc':
                return this.toMBTC(num);
            case 'btc':
                return this.toBTC(num);
        }
        throw new Error("Unknown unit \"".concat(unit, "\"."));
    };
    /**
     * Convert amount to bitcoin string.
     * @returns {String}
     */
    Amount.prototype.toString = function () {
        return this.toBTC();
    };
    /**
     * Inject properties from value.
     * @private
     * @param {Amount} value
     * @returns {Amount}
     */
    Amount.prototype.fromValue = function (value) {
        assert(Number.isSafeInteger(value) && value >= 0, 'Value must be an int64.');
        this.value = value;
        return this;
    };
    /**
     * Inject properties from satoshis.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.prototype.fromSatoshis = function (value) {
        this.value = Amount.decode(value, 0);
        return this;
    };
    /**
     * Inject properties from bits.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.prototype.fromBits = function (value) {
        this.value = Amount.decode(value, 2);
        return this;
    };
    /**
     * Inject properties from mbtc.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.prototype.fromMBTC = function (value) {
        this.value = Amount.decode(value, 5);
        return this;
    };
    /**
     * Inject properties from btc.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.prototype.fromBTC = function (value) {
        this.value = Amount.decode(value, 8);
        return this;
    };
    /**
     * Inject properties from unit.
     * @private
     * @param {String} unit
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.prototype.from = function (unit, value) {
        switch (unit) {
            case 'sat':
                return this.fromSatoshis(value);
            case 'ubtc':
            case 'bits':
                return this.fromBits(value);
            case 'mbtc':
                return this.fromMBTC(value);
            case 'btc':
                return this.fromBTC(value);
        }
        throw new Error("Unknown unit \"".concat(unit, "\"."));
    };
    /**
     * Instantiate amount from options.
     * @param {(String|Number)?} value
     * @param {String?} unit
     * @returns {Amount}
     */
    Amount.fromOptions = function (value, unit) {
        return new this().fromOptions(value, unit);
    };
    /**
     * Instantiate amount from value.
     * @private
     * @param {Amount} value
     * @returns {Amount}
     */
    Amount.fromValue = function (value) {
        return new this().fromValue(value);
    };
    /**
     * Instantiate amount from satoshis.
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.fromSatoshis = function (value) {
        return new this().fromSatoshis(value);
    };
    /**
     * Instantiate amount from bits.
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.fromBits = function (value) {
        return new this().fromBits(value);
    };
    /**
     * Instantiate amount from mbtc.
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.fromMBTC = function (value) {
        return new this().fromMBTC(value);
    };
    /**
     * Instantiate amount from btc.
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.fromBTC = function (value) {
        return new this().fromBTC(value);
    };
    /**
     * Instantiate amount from unit.
     * @param {String} unit
     * @param {Number|String} value
     * @returns {Amount}
     */
    Amount.from = function (unit, value) {
        return new this().from(unit, value);
    };
    /**
     * Inspect amount.
     * @returns {String}
     */
    Amount.prototype[inspectSymbol] = function () {
        return "<Amount: ".concat(this.toString(), ">");
    };
    /**
     * Safely convert satoshis to a BTC string.
     * This function explicitly avoids any
     * floating point arithmetic.
     * @param {Amount} value - Satoshis.
     * @returns {String} BTC string.
     */
    Amount.btc = function (value, num) {
        if (typeof value === 'string')
            return value;
        return Amount.encode(value, 8, num);
    };
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String} str - BTC
     * @returns {Amount} Satoshis.
     * @throws on parse error
     */
    Amount.value = function (str) {
        if (typeof str === 'number')
            return str;
        return Amount.decode(str, 8);
    };
    /**
     * Safely convert satoshis to a BTC string.
     * @param {Amount} value
     * @param {Number} exp - Exponent.
     * @param {Boolean} num - Return a number.
     * @returns {String|Number}
     */
    Amount.encode = function (value, exp, num) {
        if (num)
            return fixed.toFloat(value, exp);
        return fixed.encode(value, exp);
    };
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String|Number} value - BTC
     * @param {Number} exp - Exponent.
     * @returns {Amount} Satoshis.
     * @throws on parse error
     */
    Amount.decode = function (value, exp) {
        if (typeof value === 'number')
            return fixed.fromFloat(value, exp);
        return fixed.decode(value, exp);
    };
    return Amount;
}());
/*
 * Expose
 */
module.exports = Amount;
