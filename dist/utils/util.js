/*!
 * util.js - utils for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
/**
 * @exports utils/util
 */
var util = exports;
/**
 * Return hrtime (shim for browser).
 * @param {Array} time
 * @returns {Array} [seconds, nanoseconds]
 */
util.bench = function bench(time) {
    if (!process.hrtime) {
        var now = Date.now();
        if (time) {
            var hi_1 = time[0], lo_1 = time[1];
            var start = hi_1 * 1000 + lo_1 / 1e6;
            return now - start;
        }
        var ms = now % 1000;
        // Seconds
        var hi = (now - ms) / 1000;
        // Nanoseconds
        var lo = ms * 1e6;
        return [hi, lo];
    }
    if (time) {
        var _a = process.hrtime(time), hi = _a[0], lo = _a[1];
        return hi * 1000 + lo / 1e6;
    }
    return process.hrtime();
};
/**
 * Get current time in unix time (seconds).
 * @returns {Number}
 */
util.now = function now() {
    return Math.floor(Date.now() / 1000);
};
/**
 * Get current time in unix time (milliseconds).
 * @returns {Number}
 */
util.ms = function ms() {
    return Date.now();
};
/**
 * Create a Date ISO string from time in unix time (seconds).
 * @param {Number?} time - Seconds in unix time.
 * @returns {String}
 */
util.date = function date(time) {
    if (time == null)
        time = util.now();
    return new Date(time * 1000).toISOString().slice(0, -5) + 'Z';
};
/**
 * Get unix seconds from a Date string.
 * @param {String?} date - Date ISO String.
 * @returns {Number}
 */
util.time = function time(date) {
    if (date == null)
        return util.now();
    return new Date(date) / 1000 | 0;
};
/**
 * Reverse a hex-string.
 * @param {Buffer}
 * @returns {String} Reversed hex string.
 */
util.revHex = function revHex(buf) {
    assert(Buffer.isBuffer(buf));
    return Buffer.from(buf).reverse().toString('hex');
};
util.fromRev = function fromRev(str) {
    assert(typeof str === 'string');
    assert((str.length & 1) === 0);
    return Buffer.from(str, 'hex').reverse();
};
