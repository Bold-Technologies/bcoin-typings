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
var EventEmitter = require('events');
/**
 * Parent
 * Represents the parent process.
 * @alias module:workers.Parent
 * @extends EventEmitter
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
     * Initialize master (node.js).
     * @private
     */
    Parent.prototype.init = function () {
        var _this = this;
        process.stdin.on('data', function (data) {
            _this.emit('data', data);
        });
        // Nowhere to send these errors:
        process.stdin.on('error', function () { });
        process.stdout.on('error', function () { });
        process.stderr.on('error', function () { });
        process.on('uncaughtException', function (err) {
            _this.emit('exception', err);
        });
    };
    /**
     * Send data to parent process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Parent.prototype.write = function (data) {
        return process.stdout.write(data);
    };
    /**
     * Destroy the parent process.
     */
    Parent.prototype.destroy = function () {
        process.exit(0);
    };
    return Parent;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Parent;
