/*!
 * parent.js - worker processes for bcoin
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
var EventEmitter = require('events');
/**
 * Parent
 * Represents the parent process.
 * @alias module:workers.Parent
 * @extends EventEmitter
 * @ignore
 */
var Parent = /** @class */ (function (_super) {
    __extends(Parent, _super);
    /**
     * Create the parent process.
     * @constructor
     */
    function Parent() {
        var _this = _super.call(this) || this;
        _this.init();
        return _this;
    }
    /**
     * Initialize master (web workers).
     * @private
     */
    Parent.prototype.init = function () {
        var _this = this;
        global.onerror = function (event) {
            _this.emit('error', new Error('Worker error.'));
        };
        global.onmessage = function (event) {
            var data;
            if (typeof event.data === 'string') {
                data = Buffer.from(event.data, 'hex');
                assert(data.length === event.data.length / 2);
            }
            else {
                assert(event.data && typeof event.data === 'object');
                assert(event.data.data && typeof event.data.data.length === 'number');
                data = event.data.data;
                data.__proto__ = Buffer.prototype;
            }
            _this.emit('data', data);
        };
    };
    /**
     * Send data to parent process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Parent.prototype.write = function (data) {
        if (global.postMessage.length === 2) {
            data.__proto__ = Uint8Array.prototype;
            global.postMessage({ data: data }, [data]);
        }
        else {
            global.postMessage(data.toString('hex'));
        }
        return true;
    };
    /**
     * Destroy the parent process.
     */
    Parent.prototype.destroy = function () {
        global.close();
    };
    return Parent;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Parent;
