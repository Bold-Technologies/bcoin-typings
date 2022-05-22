/*!
 * parser.js - packet parser for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
/* eslint nonblock-statement-body-position: "off" */
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
var hash256 = require('bcrypto/lib/hash256');
var common = require('./common');
var packets = require('./packets');
/**
 * Protocol Message Parser
 * @alias module:net.Parser
 * @extends EventEmitter
 * @emits Parser#error
 * @emits Parser#packet
 */
var Parser = /** @class */ (function (_super) {
    __extends(Parser, _super);
    /**
     * Create a parser.
     * @constructor
     * @param {Network} network
     */
    function Parser(network) {
        var _this = _super.call(this) || this;
        _this.network = Network.get(network);
        _this.pending = [];
        _this.total = 0;
        _this.waiting = 24;
        _this.header = null;
        return _this;
    }
    /**
     * Emit an error.
     * @private
     * @param {...String} msg
     */
    Parser.prototype.error = function () {
        var msg = format.apply(null, arguments);
        this.emit('error', new Error(msg));
    };
    /**
     * Feed data to the parser.
     * @param {Buffer} data
     */
    Parser.prototype.feed = function (data) {
        this.total += data.length;
        this.pending.push(data);
        while (this.total >= this.waiting) {
            var chunk = Buffer.allocUnsafe(this.waiting);
            var off = 0;
            while (off < chunk.length) {
                var len = this.pending[0].copy(chunk, off);
                if (len === this.pending[0].length)
                    this.pending.shift();
                else
                    this.pending[0] = this.pending[0].slice(len);
                off += len;
            }
            assert.strictEqual(off, chunk.length);
            this.total -= chunk.length;
            this.parse(chunk);
        }
    };
    /**
     * Parse a fully-buffered chunk.
     * @param {Buffer} chunk
     */
    Parser.prototype.parse = function (data) {
        assert(data.length <= common.MAX_MESSAGE);
        if (!this.header) {
            this.header = this.parseHeader(data);
            return;
        }
        var hash = hash256.digest(data);
        var checksum = hash.readUInt32LE(0, true);
        if (checksum !== this.header.checksum) {
            this.waiting = 24;
            this.header = null;
            this.error('Invalid checksum: %s.', checksum.toString(16));
            return;
        }
        var payload;
        try {
            payload = this.parsePayload(this.header.cmd, data);
        }
        catch (e) {
            this.waiting = 24;
            this.header = null;
            this.emit('error', e);
            return;
        }
        this.waiting = 24;
        this.header = null;
        this.emit('packet', payload);
    };
    /**
     * Parse buffered packet header.
     * @param {Buffer} data - Header.
     * @returns {Header}
     */
    Parser.prototype.parseHeader = function (data) {
        var magic = data.readUInt32LE(0, true);
        if (magic !== this.network.magic) {
            this.error('Invalid magic value: %s.', magic.toString(16));
            return null;
        }
        // Count length of the cmd.
        var i = 0;
        for (; data[i + 4] !== 0 && i < 12; i++)
            ;
        if (i === 12) {
            this.error('Non NULL-terminated command.');
            return null;
        }
        var cmd = data.toString('ascii', 4, 4 + i);
        var size = data.readUInt32LE(16, true);
        if (size > common.MAX_MESSAGE) {
            this.waiting = 24;
            this.error('Packet length too large: %d.', size);
            return null;
        }
        this.waiting = size;
        var checksum = data.readUInt32LE(20, true);
        return new Header(cmd, size, checksum);
    };
    /**
     * Parse a payload.
     * @param {String} cmd - Packet type.
     * @param {Buffer} data - Payload.
     * @returns {Object}
     */
    Parser.prototype.parsePayload = function (cmd, data) {
        return packets.fromRaw(cmd, data);
    };
    return Parser;
}(EventEmitter));
/**
 * Packet Header
 * @ignore
 */
var Header = /** @class */ (function () {
    /**
     * Create a header.
     * @constructor
     */
    function Header(cmd, size, checksum) {
        this.cmd = cmd;
        this.size = size;
        this.checksum = checksum;
    }
    return Header;
}());
/*
 * Expose
 */
module.exports = Parser;
