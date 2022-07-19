/*!
 * packets.js - worker packets for bcoin
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
/**
 * @module workers/packets
 */
var assert = require('bsert');
var bio = require('bufio');
var Script = require('../script/script');
var Witness = require('../script/witness');
var Output = require('../primitives/output');
var MTX = require('../primitives/mtx');
var TX = require('../primitives/tx');
var KeyRing = require('../primitives/keyring');
var CoinView = require('../coins/coinview');
var ScriptError = require('../script/scripterror');
var encoding = bio.encoding;
/*
 * Constants
 */
var packetTypes = {
    ENV: 0,
    EVENT: 1,
    LOG: 2,
    ERROR: 3,
    ERRORRESULT: 4,
    CHECK: 5,
    CHECKRESULT: 6,
    SIGN: 7,
    SIGNRESULT: 8,
    CHECKINPUT: 9,
    CHECKINPUTRESULT: 10,
    SIGNINPUT: 11,
    SIGNINPUTRESULT: 12,
    ECVERIFY: 13,
    ECVERIFYRESULT: 14,
    ECSIGN: 15,
    ECSIGNRESULT: 16,
    MINE: 17,
    MINERESULT: 18,
    SCRYPT: 19,
    SCRYPTRESULT: 20
};
/**
 * Packet
 */
var Packet = /** @class */ (function () {
    function Packet() {
        this.id = ++Packet.id >>> 0;
        this.cmd = -1;
    }
    Packet.prototype.getSize = function () {
        throw new Error('Abstract method.');
    };
    Packet.prototype.toWriter = function () {
        throw new Error('Abstract method.');
    };
    Packet.prototype.fromRaw = function () {
        throw new Error('Abstract method.');
    };
    Packet.fromRaw = function () {
        throw new Error('Abstract method.');
    };
    return Packet;
}());
Packet.id = 0;
/**
 * EnvPacket
 */
var EnvPacket = /** @class */ (function (_super) {
    __extends(EnvPacket, _super);
    function EnvPacket(env) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ENV;
        _this.env = env || {};
        _this.json = JSON.stringify(_this.env);
        return _this;
    }
    EnvPacket.prototype.getSize = function () {
        return encoding.sizeVarString(this.json, 'utf8');
    };
    EnvPacket.prototype.toWriter = function (bw) {
        bw.writeVarString(this.json, 'utf8');
        return bw;
    };
    EnvPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.json = br.readVarString('utf8');
        this.env = JSON.parse(this.json);
        return this;
    };
    EnvPacket.fromRaw = function (data) {
        return new EnvPacket().fromRaw(data);
    };
    return EnvPacket;
}(Packet));
/**
 * EventPacket
 */
var EventPacket = /** @class */ (function (_super) {
    __extends(EventPacket, _super);
    function EventPacket(items) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.EVENT;
        _this.items = items || [];
        _this.json = JSON.stringify(_this.items);
        return _this;
    }
    EventPacket.prototype.getSize = function () {
        return encoding.sizeVarString(this.json, 'utf8');
    };
    EventPacket.prototype.toWriter = function (bw) {
        bw.writeVarString(this.json, 'utf8');
        return bw;
    };
    EventPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.json = br.readVarString('utf8');
        this.items = JSON.parse(this.json);
        return this;
    };
    EventPacket.fromRaw = function (data) {
        return new EventPacket().fromRaw(data);
    };
    return EventPacket;
}(Packet));
/**
 * LogPacket
 */
var LogPacket = /** @class */ (function (_super) {
    __extends(LogPacket, _super);
    function LogPacket(text) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.LOG;
        _this.text = text || '';
        return _this;
    }
    LogPacket.prototype.getSize = function () {
        return encoding.sizeVarString(this.text, 'utf8');
    };
    LogPacket.prototype.toWriter = function (bw) {
        bw.writeVarString(this.text, 'utf8');
        return bw;
    };
    LogPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.text = br.readVarString('utf8');
        return this;
    };
    LogPacket.fromRaw = function (data) {
        return new LogPacket().fromRaw(data);
    };
    return LogPacket;
}(Packet));
/**
 * ErrorPacket
 */
var ErrorPacket = /** @class */ (function (_super) {
    __extends(ErrorPacket, _super);
    function ErrorPacket(error) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ERROR;
        _this.error = error || new Error();
        return _this;
    }
    ErrorPacket.prototype.getSize = function () {
        var err = this.error;
        var size = 0;
        size += encoding.sizeVarString(stringify(err.message), 'utf8');
        size += encoding.sizeVarString(stringify(err.stack), 'utf8');
        size += encoding.sizeVarString(stringify(err.type), 'utf8');
        switch (typeof err.code) {
            case 'number':
                size += 1;
                size += 4;
                break;
            case 'string':
                size += 1;
                size += encoding.sizeVarString(err.code, 'utf8');
                break;
            default:
                size += 1;
                break;
        }
        return size;
    };
    ErrorPacket.prototype.toWriter = function (bw) {
        var err = this.error;
        bw.writeVarString(stringify(err.message), 'utf8');
        bw.writeVarString(stringify(err.stack), 'utf8');
        bw.writeVarString(stringify(err.type), 'utf8');
        switch (typeof err.code) {
            case 'number':
                bw.writeU8(2);
                bw.writeI32(err.code);
                break;
            case 'string':
                bw.writeU8(1);
                bw.writeVarString(err.code, 'utf8');
                break;
            default:
                bw.writeU8(0);
                break;
        }
        return bw;
    };
    ErrorPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        var err = this.error;
        err.message = br.readVarString('utf8');
        err.stack = br.readVarString('utf8');
        err.type = br.readVarString('utf8');
        switch (br.readU8()) {
            case 2:
                err.code = br.readI32();
                break;
            case 1:
                err.code = br.readVarString('utf8');
                break;
            default:
                err.code = null;
                break;
        }
        return this;
    };
    ErrorPacket.fromRaw = function (data) {
        return new ErrorPacket().fromRaw(data);
    };
    return ErrorPacket;
}(Packet));
/**
 * ErrorResultPacket
 */
var ErrorResultPacket = /** @class */ (function (_super) {
    __extends(ErrorResultPacket, _super);
    function ErrorResultPacket(error) {
        var _this = _super.call(this, error) || this;
        _this.cmd = packetTypes.ERRORRESULT;
        return _this;
    }
    ErrorResultPacket.fromRaw = function (data) {
        return new ErrorResultPacket().fromRaw(data);
    };
    return ErrorResultPacket;
}(ErrorPacket));
/**
 * CheckPacket
 */
var CheckPacket = /** @class */ (function (_super) {
    __extends(CheckPacket, _super);
    function CheckPacket(tx, view, flags) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.CHECK;
        _this.tx = tx || null;
        _this.view = view || null;
        _this.flags = flags != null ? flags : null;
        return _this;
    }
    CheckPacket.prototype.getSize = function () {
        return this.tx.getSize() + this.view.getSize(this.tx) + 4;
    };
    CheckPacket.prototype.toWriter = function (bw) {
        this.tx.toWriter(bw);
        this.view.toWriter(bw, this.tx);
        bw.writeI32(this.flags != null ? this.flags : -1);
        return bw;
    };
    CheckPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.tx = TX.fromReader(br);
        this.view = CoinView.fromReader(br, this.tx);
        this.flags = br.readI32();
        if (this.flags === -1)
            this.flags = null;
        return this;
    };
    CheckPacket.fromRaw = function (data) {
        return new CheckPacket().fromRaw(data);
    };
    return CheckPacket;
}(Packet));
/**
 * CheckResultPacket
 */
var CheckResultPacket = /** @class */ (function (_super) {
    __extends(CheckResultPacket, _super);
    function CheckResultPacket(error) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.CHECKRESULT;
        _this.error = error || null;
        return _this;
    }
    CheckResultPacket.prototype.getSize = function () {
        var err = this.error;
        var size = 0;
        if (!err) {
            size += 1;
            return size;
        }
        size += 1;
        size += encoding.sizeVarString(stringify(err.message), 'utf8');
        size += encoding.sizeVarString(stringify(err.stack), 'utf8');
        size += encoding.sizeVarString(stringify(err.code), 'utf8');
        size += 1;
        size += 4;
        return size;
    };
    CheckResultPacket.prototype.toWriter = function (bw) {
        var err = this.error;
        if (!err) {
            bw.writeU8(0);
            return bw;
        }
        bw.writeU8(1);
        bw.writeVarString(stringify(err.message), 'utf8');
        bw.writeVarString(stringify(err.stack), 'utf8');
        bw.writeVarString(stringify(err.code), 'utf8');
        bw.writeU8(err.op === -1 ? 0xff : err.op);
        bw.writeU32(err.ip === -1 ? 0xffffffff : err.ip);
        return bw;
    };
    CheckResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        if (br.readU8() === 0)
            return this;
        var err = new ScriptError('');
        err.message = br.readVarString('utf8');
        err.stack = br.readVarString('utf8');
        err.code = br.readVarString('utf8');
        err.op = br.readU8();
        err.ip = br.readU32();
        if (err.op === 0xff)
            err.op = -1;
        if (err.ip === 0xffffffff)
            err.ip = -1;
        this.error = err;
        return this;
    };
    CheckResultPacket.fromRaw = function (data) {
        return new CheckResultPacket().fromRaw(data);
    };
    return CheckResultPacket;
}(Packet));
/**
 * SignPacket
 */
var SignPacket = /** @class */ (function (_super) {
    __extends(SignPacket, _super);
    function SignPacket(tx, rings, type) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SIGN;
        _this.tx = tx || null;
        _this.rings = rings || [];
        _this.type = type != null ? type : 1;
        return _this;
    }
    SignPacket.prototype.getSize = function () {
        var size = 0;
        size += this.tx.getSize();
        size += this.tx.view.getSize(this.tx);
        size += encoding.sizeVarint(this.rings.length);
        for (var _i = 0, _a = this.rings; _i < _a.length; _i++) {
            var ring = _a[_i];
            size += ring.getSize();
        }
        size += 1;
        return size;
    };
    SignPacket.prototype.toWriter = function (bw) {
        this.tx.toWriter(bw);
        this.tx.view.toWriter(bw, this.tx);
        bw.writeVarint(this.rings.length);
        for (var _i = 0, _a = this.rings; _i < _a.length; _i++) {
            var ring = _a[_i];
            ring.toWriter(bw);
        }
        bw.writeU8(this.type);
        return bw;
    };
    SignPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.tx = MTX.fromReader(br);
        this.tx.view.fromReader(br, this.tx);
        var count = br.readVarint();
        for (var i = 0; i < count; i++) {
            var ring = KeyRing.fromReader(br);
            this.rings.push(ring);
        }
        this.type = br.readU8();
        return this;
    };
    SignPacket.fromRaw = function (data) {
        return new SignPacket().fromRaw(data);
    };
    return SignPacket;
}(Packet));
/**
 * SignResultPacket
 */
var SignResultPacket = /** @class */ (function (_super) {
    __extends(SignResultPacket, _super);
    function SignResultPacket(total, witness, script) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SIGNRESULT;
        _this.total = total || 0;
        _this.script = script || [];
        _this.witness = witness || [];
        return _this;
    }
    SignResultPacket.prototype.fromTX = function (tx, total) {
        this.total = total;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            this.script.push(input.script);
            this.witness.push(input.witness);
        }
        return this;
    };
    SignResultPacket.fromTX = function (tx, total) {
        return new SignResultPacket().fromTX(tx, total);
    };
    SignResultPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarint(this.total);
        size += encoding.sizeVarint(this.script.length);
        for (var i = 0; i < this.script.length; i++) {
            var script = this.script[i];
            var witness = this.witness[i];
            size += script.getVarSize();
            size += witness.getVarSize();
        }
        return size;
    };
    SignResultPacket.prototype.toWriter = function (bw) {
        assert(this.script.length === this.witness.length);
        bw.writeVarint(this.total);
        bw.writeVarint(this.script.length);
        for (var i = 0; i < this.script.length; i++) {
            this.script[i].toWriter(bw);
            this.witness[i].toWriter(bw);
        }
        return bw;
    };
    SignResultPacket.prototype.inject = function (tx) {
        assert(this.script.length === tx.inputs.length);
        assert(this.witness.length === tx.inputs.length);
        for (var i = 0; i < tx.inputs.length; i++) {
            var input = tx.inputs[i];
            input.script = this.script[i];
            input.witness = this.witness[i];
        }
    };
    SignResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.total = br.readVarint();
        var count = br.readVarint();
        for (var i = 0; i < count; i++) {
            this.script.push(Script.fromReader(br));
            this.witness.push(Witness.fromReader(br));
        }
        return this;
    };
    SignResultPacket.fromRaw = function (data) {
        return new SignResultPacket().fromRaw(data);
    };
    return SignResultPacket;
}(Packet));
/**
 * CheckInputPacket
 */
var CheckInputPacket = /** @class */ (function (_super) {
    __extends(CheckInputPacket, _super);
    function CheckInputPacket(tx, index, coin, flags) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.CHECKINPUT;
        _this.tx = tx || null;
        _this.index = index;
        _this.coin = coin || null;
        _this.flags = flags != null ? flags : null;
        return _this;
    }
    CheckInputPacket.prototype.getSize = function () {
        var size = 0;
        size += this.tx.getSize();
        size += encoding.sizeVarint(this.index);
        size += encoding.sizeVarint(this.coin.value);
        size += this.coin.script.getVarSize();
        size += 4;
        return size;
    };
    CheckInputPacket.prototype.toWriter = function (bw) {
        this.tx.toWriter(bw);
        bw.writeVarint(this.index);
        bw.writeVarint(this.coin.value);
        this.coin.script.toWriter(bw);
        bw.writeI32(this.flags != null ? this.flags : -1);
        return bw;
    };
    CheckInputPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.tx = TX.fromReader(br);
        this.index = br.readVarint();
        this.coin = new Output();
        this.coin.value = br.readVarint();
        this.coin.script.fromReader(br);
        this.flags = br.readI32();
        if (this.flags === -1)
            this.flags = null;
        return this;
    };
    CheckInputPacket.fromRaw = function (data) {
        return new CheckInputPacket().fromRaw(data);
    };
    return CheckInputPacket;
}(Packet));
/**
 * CheckInputResultPacket
 */
var CheckInputResultPacket = /** @class */ (function (_super) {
    __extends(CheckInputResultPacket, _super);
    function CheckInputResultPacket(error) {
        var _this = _super.call(this, error) || this;
        _this.cmd = packetTypes.CHECKINPUTRESULT;
        return _this;
    }
    CheckInputResultPacket.fromRaw = function (data) {
        return new CheckInputResultPacket().fromRaw(data);
    };
    return CheckInputResultPacket;
}(CheckResultPacket));
/**
 * SignInputPacket
 */
var SignInputPacket = /** @class */ (function (_super) {
    __extends(SignInputPacket, _super);
    function SignInputPacket(tx, index, coin, ring, type) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SIGNINPUT;
        _this.tx = tx || null;
        _this.index = index;
        _this.coin = coin || null;
        _this.ring = ring || null;
        _this.type = type != null ? type : 1;
        return _this;
    }
    SignInputPacket.prototype.getSize = function () {
        var size = 0;
        size += this.tx.getSize();
        size += encoding.sizeVarint(this.index);
        size += encoding.sizeVarint(this.coin.value);
        size += this.coin.script.getVarSize();
        size += this.ring.getSize();
        size += 1;
        return size;
    };
    SignInputPacket.prototype.toWriter = function (bw) {
        this.tx.toWriter(bw);
        bw.writeVarint(this.index);
        bw.writeVarint(this.coin.value);
        this.coin.script.toWriter(bw);
        this.ring.toWriter(bw);
        bw.writeU8(this.type);
        return bw;
    };
    SignInputPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.tx = MTX.fromReader(br);
        this.index = br.readVarint();
        this.coin = new Output();
        this.coin.value = br.readVarint();
        this.coin.script.fromReader(br);
        this.ring = KeyRing.fromReader(br);
        this.type = br.readU8();
        return this;
    };
    SignInputPacket.fromRaw = function (data) {
        return new SignInputPacket().fromRaw(data);
    };
    return SignInputPacket;
}(Packet));
/**
 * SignInputResultPacket
 */
var SignInputResultPacket = /** @class */ (function (_super) {
    __extends(SignInputResultPacket, _super);
    function SignInputResultPacket(value, witness, script) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SIGNINPUTRESULT;
        _this.value = value || false;
        _this.script = script || null;
        _this.witness = witness || null;
        return _this;
    }
    SignInputResultPacket.prototype.fromTX = function (tx, i, value) {
        var input = tx.inputs[i];
        assert(input);
        this.value = value;
        this.script = input.script;
        this.witness = input.witness;
        return this;
    };
    SignInputResultPacket.fromTX = function (tx, i, value) {
        return new SignInputResultPacket().fromTX(tx, i, value);
    };
    SignInputResultPacket.prototype.getSize = function () {
        return 1 + this.script.getVarSize() + this.witness.getVarSize();
    };
    SignInputResultPacket.prototype.toWriter = function (bw) {
        bw.writeU8(this.value ? 1 : 0);
        this.script.toWriter(bw);
        this.witness.toWriter(bw);
        return bw;
    };
    SignInputResultPacket.prototype.inject = function (tx, i) {
        var input = tx.inputs[i];
        assert(input);
        input.script = this.script;
        input.witness = this.witness;
    };
    SignInputResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.value = br.readU8() === 1;
        this.script = Script.fromReader(br);
        this.witness = Witness.fromReader(br);
        return this;
    };
    SignInputResultPacket.fromRaw = function (data) {
        return new SignInputResultPacket().fromRaw(data);
    };
    return SignInputResultPacket;
}(Packet));
/**
 * ECVerifyPacket
 */
var ECVerifyPacket = /** @class */ (function (_super) {
    __extends(ECVerifyPacket, _super);
    function ECVerifyPacket(msg, sig, key) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ECVERIFY;
        _this.msg = msg || null;
        _this.sig = sig || null;
        _this.key = key || null;
        return _this;
    }
    ECVerifyPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarBytes(this.msg);
        size += encoding.sizeVarBytes(this.sig);
        size += encoding.sizeVarBytes(this.key);
        return size;
    };
    ECVerifyPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.msg);
        bw.writeVarBytes(this.sig);
        bw.writeVarBytes(this.key);
        return bw;
    };
    ECVerifyPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.msg = br.readVarBytes();
        this.sig = br.readVarBytes();
        this.key = br.readVarBytes();
        return this;
    };
    ECVerifyPacket.fromRaw = function (data) {
        return new ECVerifyPacket().fromRaw(data);
    };
    return ECVerifyPacket;
}(Packet));
/**
 * ECVerifyResultPacket
 */
var ECVerifyResultPacket = /** @class */ (function (_super) {
    __extends(ECVerifyResultPacket, _super);
    function ECVerifyResultPacket(value) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ECVERIFYRESULT;
        _this.value = value;
        return _this;
    }
    ECVerifyResultPacket.prototype.getSize = function () {
        return 1;
    };
    ECVerifyResultPacket.prototype.toWriter = function (bw) {
        bw.writeU8(this.value ? 1 : 0);
        return bw;
    };
    ECVerifyResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.value = br.readU8() === 1;
        return this;
    };
    ECVerifyResultPacket.fromRaw = function (data) {
        return new ECVerifyResultPacket().fromRaw(data);
    };
    return ECVerifyResultPacket;
}(Packet));
/**
 * ECSignPacket
 */
var ECSignPacket = /** @class */ (function (_super) {
    __extends(ECSignPacket, _super);
    function ECSignPacket(msg, key) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ECSIGN;
        _this.msg = msg || null;
        _this.key = key || null;
        return _this;
    }
    ECSignPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarBytes(this.msg);
        size += encoding.sizeVarBytes(this.key);
        return size;
    };
    ECSignPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.msg);
        bw.writeVarBytes(this.key);
        return bw;
    };
    ECSignPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.msg = br.readVarBytes();
        this.key = br.readVarBytes();
        return this;
    };
    ECSignPacket.fromRaw = function (data) {
        return new ECSignPacket().fromRaw(data);
    };
    return ECSignPacket;
}(Packet));
/**
 * ECSignResultPacket
 */
var ECSignResultPacket = /** @class */ (function (_super) {
    __extends(ECSignResultPacket, _super);
    function ECSignResultPacket(sig) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.ECSIGNRESULT;
        _this.sig = sig;
        return _this;
    }
    ECSignResultPacket.prototype.getSize = function () {
        return encoding.sizeVarBytes(this.sig);
    };
    ECSignResultPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.sig);
        return bw;
    };
    ECSignResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.sig = br.readVarBytes();
        return this;
    };
    ECSignResultPacket.fromRaw = function (data) {
        return new ECSignResultPacket().fromRaw(data);
    };
    return ECSignResultPacket;
}(Packet));
/**
 * MinePacket
 */
var MinePacket = /** @class */ (function (_super) {
    __extends(MinePacket, _super);
    function MinePacket(data, target, min, max) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.MINE;
        _this.data = data || null;
        _this.target = target || null;
        _this.min = min != null ? min : -1;
        _this.max = max != null ? max : -1;
        return _this;
    }
    MinePacket.prototype.getSize = function () {
        return 120;
    };
    MinePacket.prototype.toWriter = function (bw) {
        bw.writeBytes(this.data);
        bw.writeBytes(this.target);
        bw.writeU32(this.min);
        bw.writeU32(this.max);
        return bw;
    };
    MinePacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.data = br.readBytes(80);
        this.target = br.readBytes(32);
        this.min = br.readU32();
        this.max = br.readU32();
        return this;
    };
    MinePacket.fromRaw = function (data) {
        return new MinePacket().fromRaw(data);
    };
    return MinePacket;
}(Packet));
/**
 * MineResultPacket
 */
var MineResultPacket = /** @class */ (function (_super) {
    __extends(MineResultPacket, _super);
    function MineResultPacket(nonce) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.MINERESULT;
        _this.nonce = nonce != null ? nonce : -1;
        return _this;
    }
    MineResultPacket.prototype.getSize = function () {
        return 5;
    };
    MineResultPacket.prototype.toWriter = function (bw) {
        bw.writeU8(this.nonce !== -1 ? 1 : 0);
        bw.writeU32(this.nonce);
        return bw;
    };
    MineResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.nonce = -1;
        if (br.readU8() === 1)
            this.nonce = br.readU32();
        return this;
    };
    MineResultPacket.fromRaw = function (data) {
        return new MineResultPacket().fromRaw(data);
    };
    return MineResultPacket;
}(Packet));
/**
 * ScryptPacket
 */
var ScryptPacket = /** @class */ (function (_super) {
    __extends(ScryptPacket, _super);
    function ScryptPacket(passwd, salt, N, r, p, len) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SCRYPT;
        _this.passwd = passwd || null;
        _this.salt = salt || null;
        _this.N = N != null ? N : -1;
        _this.r = r != null ? r : -1;
        _this.p = p != null ? p : -1;
        _this.len = len != null ? len : -1;
        return _this;
    }
    ScryptPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarBytes(this.passwd);
        size += encoding.sizeVarBytes(this.salt);
        size += 16;
        return size;
    };
    ScryptPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.passwd);
        bw.writeVarBytes(this.salt);
        bw.writeU32(this.N);
        bw.writeU32(this.r);
        bw.writeU32(this.p);
        bw.writeU32(this.len);
        return bw;
    };
    ScryptPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.passwd = br.readVarBytes();
        this.salt = br.readVarBytes();
        this.N = br.readU32();
        this.r = br.readU32();
        this.p = br.readU32();
        this.len = br.readU32();
        return this;
    };
    ScryptPacket.fromRaw = function (data) {
        return new ScryptPacket().fromRaw(data);
    };
    return ScryptPacket;
}(Packet));
/**
 * ScryptResultPacket
 */
var ScryptResultPacket = /** @class */ (function (_super) {
    __extends(ScryptResultPacket, _super);
    function ScryptResultPacket(key) {
        var _this = _super.call(this) || this;
        _this.cmd = packetTypes.SCRYPTRESULT;
        _this.key = key || null;
        return _this;
    }
    ScryptResultPacket.prototype.getSize = function () {
        return encoding.sizeVarBytes(this.key);
    };
    ScryptResultPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.key);
        return bw;
    };
    ScryptResultPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data, true);
        this.key = br.readVarBytes();
        return this;
    };
    ScryptResultPacket.fromRaw = function (data) {
        return new ScryptResultPacket().fromRaw(data);
    };
    return ScryptResultPacket;
}(Packet));
/*
 * Helpers
 */
function stringify(value) {
    if (typeof value !== 'string')
        return '';
    return value;
}
/*
 * Expose
 */
exports.types = packetTypes;
exports.EnvPacket = EnvPacket;
exports.EventPacket = EventPacket;
exports.LogPacket = LogPacket;
exports.ErrorPacket = ErrorPacket;
exports.ErrorResultPacket = ErrorResultPacket;
exports.CheckPacket = CheckPacket;
exports.CheckResultPacket = CheckResultPacket;
exports.SignPacket = SignPacket;
exports.SignResultPacket = SignResultPacket;
exports.CheckInputPacket = CheckInputPacket;
exports.CheckInputResultPacket = CheckInputResultPacket;
exports.SignInputPacket = SignInputPacket;
exports.SignInputResultPacket = SignInputResultPacket;
exports.ECVerifyPacket = ECVerifyPacket;
exports.ECVerifyResultPacket = ECVerifyResultPacket;
exports.ECSignPacket = ECSignPacket;
exports.ECSignResultPacket = ECSignResultPacket;
exports.MinePacket = MinePacket;
exports.MineResultPacket = MineResultPacket;
exports.ScryptPacket = ScryptPacket;
exports.ScryptResultPacket = ScryptResultPacket;
