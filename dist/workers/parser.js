/*!
 * parser.js - worker parser for bcoin
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
var packets = require('./packets');
/**
 * Parser
 * @alias module:workers.Parser
 * @extends EventEmitter
 */
var Parser = /** @class */ (function (_super) {
    __extends(Parser, _super);
    /**
     * Create a parser.
     * @constructor
     */
    function Parser() {
        var _this = _super.call(this) || this;
        _this.waiting = 9;
        _this.header = null;
        _this.pending = [];
        _this.total = 0;
        return _this;
    }
    Parser.prototype.feed = function (data) {
        this.total += data.length;
        this.pending.push(data);
        while (this.total >= this.waiting) {
            var chunk = this.read(this.waiting);
            this.parse(chunk);
        }
    };
    Parser.prototype.read = function (size) {
        assert(this.total >= size, 'Reading too much.');
        if (size === 0)
            return Buffer.alloc(0);
        var pending = this.pending[0];
        if (pending.length > size) {
            var chunk_1 = pending.slice(0, size);
            this.pending[0] = pending.slice(size);
            this.total -= chunk_1.length;
            return chunk_1;
        }
        if (pending.length === size) {
            var chunk_2 = this.pending.shift();
            this.total -= chunk_2.length;
            return chunk_2;
        }
        var chunk = Buffer.allocUnsafe(size);
        var off = 0;
        while (off < chunk.length) {
            var pending_1 = this.pending[0];
            var len = pending_1.copy(chunk, off);
            if (len === pending_1.length)
                this.pending.shift();
            else
                this.pending[0] = pending_1.slice(len);
            off += len;
        }
        assert.strictEqual(off, chunk.length);
        this.total -= chunk.length;
        return chunk;
    };
    Parser.prototype.parse = function (data) {
        var header = this.header;
        if (!header) {
            try {
                header = this.parseHeader(data);
            }
            catch (e) {
                this.emit('error', e);
                return;
            }
            this.header = header;
            this.waiting = header.size + 1;
            return;
        }
        this.waiting = 9;
        this.header = null;
        var packet;
        try {
            packet = this.parsePacket(header, data);
        }
        catch (e) {
            this.emit('error', e);
            return;
        }
        if (data[data.length - 1] !== 0x0a) {
            this.emit('error', new Error('No trailing newline.'));
            return;
        }
        packet.id = header.id;
        this.emit('packet', packet);
    };
    Parser.prototype.parseHeader = function (data) {
        var id = data.readUInt32LE(0, true);
        var cmd = data.readUInt8(4, true);
        var size = data.readUInt32LE(5, true);
        return new Header(id, cmd, size);
    };
    Parser.prototype.parsePacket = function (header, data) {
        switch (header.cmd) {
            case packets.types.ENV:
                return packets.EnvPacket.fromRaw(data);
            case packets.types.EVENT:
                return packets.EventPacket.fromRaw(data);
            case packets.types.LOG:
                return packets.LogPacket.fromRaw(data);
            case packets.types.ERROR:
                return packets.ErrorPacket.fromRaw(data);
            case packets.types.ERRORRESULT:
                return packets.ErrorResultPacket.fromRaw(data);
            case packets.types.CHECK:
                return packets.CheckPacket.fromRaw(data);
            case packets.types.CHECKRESULT:
                return packets.CheckResultPacket.fromRaw(data);
            case packets.types.SIGN:
                return packets.SignPacket.fromRaw(data);
            case packets.types.SIGNRESULT:
                return packets.SignResultPacket.fromRaw(data);
            case packets.types.CHECKINPUT:
                return packets.CheckInputPacket.fromRaw(data);
            case packets.types.CHECKINPUTRESULT:
                return packets.CheckInputResultPacket.fromRaw(data);
            case packets.types.SIGNINPUT:
                return packets.SignInputPacket.fromRaw(data);
            case packets.types.SIGNINPUTRESULT:
                return packets.SignInputResultPacket.fromRaw(data);
            case packets.types.ECVERIFY:
                return packets.ECVerifyPacket.fromRaw(data);
            case packets.types.ECVERIFYRESULT:
                return packets.ECVerifyResultPacket.fromRaw(data);
            case packets.types.ECSIGN:
                return packets.ECSignPacket.fromRaw(data);
            case packets.types.ECSIGNRESULT:
                return packets.ECSignResultPacket.fromRaw(data);
            case packets.types.MINE:
                return packets.MinePacket.fromRaw(data);
            case packets.types.MINERESULT:
                return packets.MineResultPacket.fromRaw(data);
            case packets.types.SCRYPT:
                return packets.ScryptPacket.fromRaw(data);
            case packets.types.SCRYPTRESULT:
                return packets.ScryptResultPacket.fromRaw(data);
            default:
                throw new Error('Unknown packet.');
        }
    };
    return Parser;
}(EventEmitter));
/**
 * Header
 * @ignore
 */
var Header = /** @class */ (function () {
    /**
     * Create a header.
     * @constructor
     */
    function Header(id, cmd, size) {
        this.id = id;
        this.cmd = cmd;
        this.size = size;
    }
    return Header;
}());
/*
 * Expose
 */
module.exports = Parser;
