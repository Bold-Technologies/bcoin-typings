/*!
 * child.js - child processes for bcoin
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
var path = require('path');
var cp = require('child_process');
var children = new Set();
var exitBound = false;
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
        bindExit();
        children.add(_this);
        _this.init(file);
        return _this;
    }
    /**
     * Test whether child process support is available.
     * @returns {Boolean}
     */
    Child.hasSupport = function () {
        return true;
    };
    /**
     * Initialize child process (node.js).
     * @private
     * @param {String} file
     */
    Child.prototype.init = function (file) {
        var _this = this;
        var bin = process.argv[0];
        var filename = path.resolve(__dirname, file);
        var options = { stdio: 'pipe', env: process.env };
        this.child = cp.spawn(bin, [filename], options);
        this.child.unref();
        this.child.stdin.unref();
        this.child.stdout.unref();
        this.child.stderr.unref();
        this.child.on('error', function (err) {
            _this.emit('error', err);
        });
        this.child.once('exit', function (code, signal) {
            children["delete"](_this);
            _this.emit('exit', code == null ? -1 : code, signal);
        });
        this.child.stdin.on('error', function (err) {
            _this.emit('error', err);
        });
        this.child.stdout.on('error', function (err) {
            _this.emit('error', err);
        });
        this.child.stderr.on('error', function (err) {
            _this.emit('error', err);
        });
        this.child.stdout.on('data', function (data) {
            _this.emit('data', data);
        });
    };
    /**
     * Send data to child process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Child.prototype.write = function (data) {
        return this.child.stdin.write(data);
    };
    /**
     * Destroy the child process.
     */
    Child.prototype.destroy = function () {
        this.child.kill('SIGTERM');
    };
    return Child;
}(EventEmitter));
/**
 * Cleanup all child processes.
 * @private
 */
function bindExit() {
    if (exitBound)
        return;
    exitBound = true;
    listenExit(function () {
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            child.destroy();
        }
    });
}
/**
 * Listen for exit.
 * @param {Function} handler
 * @private
 */
function listenExit(handler) {
    var onSighup = function () {
        process.exit(1 | 0x80);
    };
    var onSigint = function () {
        process.exit(2 | 0x80);
    };
    var onSigterm = function () {
        process.exit(15 | 0x80);
    };
    var onError = function (err) {
        if (err && err.stack)
            console.error(String(err.stack));
        else
            console.error(String(err));
        process.exit(1);
    };
    process.once('exit', handler);
    if (process.listenerCount('SIGHUP') === 0)
        process.once('SIGHUP', onSighup);
    if (process.listenerCount('SIGINT') === 0)
        process.once('SIGINT', onSigint);
    if (process.listenerCount('SIGTERM') === 0)
        process.once('SIGTERM', onSigterm);
    if (process.listenerCount('uncaughtException') === 0)
        process.once('uncaughtException', onError);
    process.on('newListener', function (name) {
        switch (name) {
            case 'SIGHUP':
                process.removeListener(name, onSighup);
                break;
            case 'SIGINT':
                process.removeListener(name, onSigint);
                break;
            case 'SIGTERM':
                process.removeListener(name, onSigterm);
                break;
            case 'uncaughtException':
                process.removeListener(name, onError);
                break;
        }
    });
}
/*
 * Expose
 */
module.exports = Child;
