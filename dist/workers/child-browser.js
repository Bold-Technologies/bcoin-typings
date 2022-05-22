/*!
 * child.js - child processes for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
/* global register */
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
 * Child
 * Represents a child process.
 * @alias module:workers.Child
 * @extends EventEmitter
 * @ignore
 */
var Child = /** @class */ (function (_super) {
    __extends(Child, _super);
    /**
     * Represents a child process.
     * @constructor
     * @param {String} file
     */
    function Child(file) {
        var _this = _super.call(this) || this;
        _this.init(file);
        return _this;
    }
    /**
     * Test whether child process support is available.
     * @returns {Boolean}
     */
    Child.hasSupport = function () {
        return typeof global.postMessage === 'function';
    };
    /**
     * Initialize child process. Bind to events.
     * @private
     * @param {String} file
     */
    Child.prototype.init = function (file) {
        var _this = this;
        if (process.env.BMOCHA)
            register(file, [__dirname, file]);
        this.child = new global.Worker(file);
        this.child.onerror = function (event) {
            _this.emit('error', new Error('Child error.'));
            _this.emit('exit', 1, null);
        };
        this.child.onmessage = function (event) {
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
     * Send data to child process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Child.prototype.write = function (data) {
        if (this.child.postMessage.length === 2) {
            data.__proto__ = Uint8Array.prototype;
            this.child.postMessage({ data: data }, [data]);
        }
        else {
            this.child.postMessage(data.toString('hex'));
        }
        return true;
    };
    /**
     * Destroy the child process.
     */
    Child.prototype.destroy = function () {
        this.child.terminate();
        this.emit('exit', 15 | 0x80, 'SIGTERM');
    };
    return Child;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Child;
