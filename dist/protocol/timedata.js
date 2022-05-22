/*!
 * timedata.js - time management for bcoin
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
var EventEmitter = require('events');
var util = require('../utils/util');
var binary = require('../utils/binary');
/**
 * Time Data
 * An object which handles "adjusted time". This may not
 * look it, but this is actually a semi-consensus-critical
 * piece of code. It handles version packets from peers
 * and calculates what to offset our system clock's time by.
 * @alias module:protocol.TimeData
 * @extends EventEmitter
 * @property {Array} samples
 * @property {Object} known
 * @property {Number} limit
 * @property {Number} offset
 */
var TimeData = /** @class */ (function (_super) {
    __extends(TimeData, _super);
    /**
     * Create time data.
     * @constructor
     * @param {Number} [limit=200]
     */
    function TimeData(limit) {
        var _this = _super.call(this) || this;
        if (limit == null)
            limit = 200;
        _this.samples = [];
        _this.known = new Map();
        _this.limit = limit;
        _this.offset = 0;
        _this.checked = false;
        return _this;
    }
    /**
     * Add time data.
     * @param {String} id
     * @param {Number} time
     */
    TimeData.prototype.add = function (id, time) {
        if (this.samples.length >= this.limit)
            return;
        if (this.known.has(id))
            return;
        var sample = time - util.now();
        this.known.set(id, sample);
        binary.insert(this.samples, sample, compare);
        this.emit('sample', sample, this.samples.length);
        if (this.samples.length >= 5 && this.samples.length % 2 === 1) {
            var median = this.samples[this.samples.length >>> 1];
            if (Math.abs(median) >= 70 * 60) {
                if (!this.checked) {
                    var match = false;
                    for (var _i = 0, _a = this.samples; _i < _a.length; _i++) {
                        var offset = _a[_i];
                        if (offset !== 0 && Math.abs(offset) < 5 * 60) {
                            match = true;
                            break;
                        }
                    }
                    if (!match) {
                        this.checked = true;
                        this.emit('mismatch');
                    }
                }
                median = 0;
            }
            this.offset = median;
            this.emit('offset', this.offset);
        }
    };
    /**
     * Get the current adjusted time.
     * @returns {Number} Adjusted Time.
     */
    TimeData.prototype.now = function () {
        return util.now() + this.offset;
    };
    /**
     * Adjust a timestamp.
     * @param {Number} time
     * @returns {Number} Adjusted Time.
     */
    TimeData.prototype.adjust = function (time) {
        return time + this.offset;
    };
    /**
     * Unadjust a timestamp.
     * @param {Number} time
     * @returns {Number} Local Time.
     */
    TimeData.prototype.local = function (time) {
        return time - this.offset;
    };
    /**
     * Get the current adjusted time in milliseconds.
     * @returns {Number} Adjusted Time.
     */
    TimeData.prototype.ms = function () {
        return Date.now() + this.offset * 1000;
    };
    return TimeData;
}(EventEmitter));
/*
 * Helpers
 */
function compare(a, b) {
    return a - b;
}
/*
 * Expose
 */
module.exports = TimeData;
