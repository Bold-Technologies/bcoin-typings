/*!
 * master.js - master process for bcoin
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
var assert = require('bsert');
var EventEmitter = require('events');
var format = require('util').format;
var Network = require('../protocol/network');
var jobs = require('./jobs');
var Parser = require('./parser');
var Framer = require('./framer');
var packets = require('./packets');
var Parent = require('./parent');
/**
 * Master
 * Represents the master process.
 * @alias module:workers.Master
 * @extends EventEmitter
 */
var Master = /** @class */ (function (_super) {
    __extends(Master, _super);
    /**
     * Create the master process.
     * @constructor
     */
    function Master() {
        var _this = _super.call(this) || this;
        _this.parent = new Parent();
        _this.framer = new Framer();
        _this.parser = new Parser();
        _this.listening = false;
        _this.color = false;
        _this.init();
        return _this;
    }
    /**
     * Initialize master. Bind events.
     * @private
     */
    Master.prototype.init = function () {
        var _this = this;
        this.parent.on('data', function (data) {
            _this.parser.feed(data);
        });
        this.parent.on('error', function (err) {
            _this.emit('error', err);
        });
        this.parent.on('exception', function (err) {
            _this.send(new packets.ErrorPacket(err));
            setTimeout(function () { return _this.destroy(); }, 1000);
        });
        this.parser.on('error', function (err) {
            _this.emit('error', err);
        });
        this.parser.on('packet', function (packet) {
            _this.emit('packet', packet);
        });
    };
    /**
     * Set environment.
     * @param {Object} env
     */
    Master.prototype.setEnv = function (env) {
        this.color = env.BCOIN_WORKER_ISTTY === '1';
        this.set(env.BCOIN_WORKER_NETWORK);
    };
    /**
     * Set primary network.
     * @param {NetworkType|Network} network
     */
    Master.prototype.set = function (network) {
        return Network.set(network);
    };
    /**
     * Send data to worker.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Master.prototype.write = function (data) {
        return this.parent.write(data);
    };
    /**
     * Frame and send a packet.
     * @param {Packet} packet
     * @returns {Boolean}
     */
    Master.prototype.send = function (packet) {
        return this.write(this.framer.packet(packet));
    };
    /**
     * Emit an event on the worker side.
     * @param {String} event
     * @param {...Object} arg
     * @returns {Boolean}
     */
    Master.prototype.sendEvent = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return this.send(new packets.EventPacket(items));
    };
    /**
     * Destroy the worker.
     */
    Master.prototype.destroy = function () {
        return this.parent.destroy();
    };
    /**
     * Write a message to stdout in the master process.
     * @param {Object|String} obj
     * @param {...String} args
     */
    Master.prototype.log = function () {
        var text = format.apply(null, arguments);
        this.send(new packets.LogPacket(text));
    };
    /**
     * Listen for messages from master process (only if worker).
     */
    Master.prototype.listen = function () {
        var _this = this;
        assert(!this.listening, 'Already listening.');
        this.listening = true;
        this.on('error', function (err) {
            _this.send(new packets.ErrorPacket(err));
        });
        this.on('packet', function (packet) {
            try {
                _this.handlePacket(packet);
            }
            catch (e) {
                _this.emit('error', e);
            }
        });
    };
    /**
     * Handle packet.
     * @private
     * @param {Packet}
     */
    Master.prototype.handlePacket = function (packet) {
        var result;
        switch (packet.cmd) {
            case packets.types.ENV:
                this.setEnv(packet.env);
                break;
            case packets.types.EVENT:
                this.emit('event', packet.items);
                this.emit.apply(this, packet.items);
                break;
            case packets.types.ERROR:
                this.emit('error', packet.error);
                break;
            default:
                result = jobs.execute(packet);
                result.id = packet.id;
                this.send(result);
                break;
        }
    };
    return Master;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Master;
