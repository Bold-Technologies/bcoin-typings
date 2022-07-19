/*!
 * packets.js - packets for bcoin
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
/**
 * @module net/packets
 */
var assert = require('bsert');
var bio = require('bufio');
var BloomFilter = require('bfilter').BloomFilter;
var common = require('./common');
var util = require('../utils/util');
var bip152 = require('./bip152');
var NetAddress = require('./netaddress');
var consensus = require('../protocol/consensus');
var Headers = require('../primitives/headers');
var InvItem = require('../primitives/invitem');
var MemBlock = require('../primitives/memblock');
var MerkleBlock = require('../primitives/merkleblock');
var TX = require('../primitives/tx');
var encoding = bio.encoding;
var DUMMY = Buffer.alloc(0);
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Packet types.
 * @enum {Number}
 * @default
 */
exports.types = {
    VERSION: 0,
    VERACK: 1,
    PING: 2,
    PONG: 3,
    GETADDR: 4,
    ADDR: 5,
    INV: 6,
    GETDATA: 7,
    NOTFOUND: 8,
    GETBLOCKS: 9,
    GETHEADERS: 10,
    HEADERS: 11,
    SENDHEADERS: 12,
    BLOCK: 13,
    TX: 14,
    REJECT: 15,
    MEMPOOL: 16,
    FILTERLOAD: 17,
    FILTERADD: 18,
    FILTERCLEAR: 19,
    MERKLEBLOCK: 20,
    FEEFILTER: 21,
    SENDCMPCT: 22,
    CMPCTBLOCK: 23,
    GETBLOCKTXN: 24,
    BLOCKTXN: 25,
    UNKNOWN: 26,
    // Internal
    INTERNAL: 27,
    DATA: 28
};
/**
 * Packet types by value.
 * @const {Object}
 * @default
 */
exports.typesByVal = [
    'VERSION',
    'VERACK',
    'PING',
    'PONG',
    'GETADDR',
    'ADDR',
    'INV',
    'GETDATA',
    'NOTFOUND',
    'GETBLOCKS',
    'GETHEADERS',
    'HEADERS',
    'SENDHEADERS',
    'BLOCK',
    'TX',
    'REJECT',
    'MEMPOOL',
    'FILTERLOAD',
    'FILTERADD',
    'FILTERCLEAR',
    'MERKLEBLOCK',
    'FEEFILTER',
    'SENDCMPCT',
    'CMPCTBLOCK',
    'GETBLOCKTXN',
    'BLOCKTXN',
    'UNKNOWN',
    // Internal
    'INTERNAL',
    'DATA'
];
/**
 * Base Packet
 */
var Packet = /** @class */ (function () {
    /**
     * Create a base packet.
     * @constructor
     */
    function Packet() {
        this.type = -1;
        this.cmd = '';
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    Packet.prototype.getSize = function () {
        return 0;
    };
    /**
     * Serialize packet to writer.
     * @param {BufferWriter} bw
     */
    Packet.prototype.toWriter = function (bw) {
        return bw;
    };
    /**
     * Serialize packet.
     * @returns {Buffer}
     */
    Packet.prototype.toRaw = function () {
        return DUMMY;
    };
    /**
     * Inject properties from buffer reader.
     * @param {BufferReader} br
     */
    Packet.prototype.fromReader = function (br) {
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     */
    Packet.prototype.fromRaw = function (data) {
        return this;
    };
    return Packet;
}());
/**
 * Version Packet
 * @extends Packet
 * @property {Number} version - Protocol version.
 * @property {Number} services - Service bits.
 * @property {Number} time - Timestamp of discovery.
 * @property {NetAddress} local - Our address.
 * @property {NetAddress} remote - Their address.
 * @property {Buffer} nonce
 * @property {String} agent - User agent string.
 * @property {Number} height - Chain height.
 * @property {Boolean} noRelay - Whether transactions
 * should be relayed immediately.
 */
var VersionPacket = /** @class */ (function (_super) {
    __extends(VersionPacket, _super);
    /**
     * Create a version packet.
     * @constructor
     * @param {Object?} options
     * @param {Number} options.version - Protocol version.
     * @param {Number} options.services - Service bits.
     * @param {Number} options.time - Timestamp of discovery.
     * @param {NetAddress} options.local - Our address.
     * @param {NetAddress} options.remote - Their address.
     * @param {Buffer} options.nonce
     * @param {String} options.agent - User agent string.
     * @param {Number} options.height - Chain height.
     * @param {Boolean} options.noRelay - Whether transactions
     * should be relayed immediately.
     */
    function VersionPacket(options) {
        var _this = _super.call(this) || this;
        _this.cmd = 'version';
        _this.type = exports.types.VERSION;
        _this.version = common.PROTOCOL_VERSION;
        _this.services = common.LOCAL_SERVICES;
        _this.time = util.now();
        _this.remote = new NetAddress();
        _this.local = new NetAddress();
        _this.nonce = common.ZERO_NONCE;
        _this.agent = common.USER_AGENT;
        _this.height = 0;
        _this.noRelay = false;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     */
    VersionPacket.prototype.fromOptions = function (options) {
        if (options.version != null)
            this.version = options.version;
        if (options.services != null)
            this.services = options.services;
        if (options.time != null)
            this.time = options.time;
        if (options.remote)
            this.remote.fromOptions(options.remote);
        if (options.local)
            this.local.fromOptions(options.local);
        if (options.nonce)
            this.nonce = options.nonce;
        if (options.agent)
            this.agent = options.agent;
        if (options.height != null)
            this.height = options.height;
        if (options.noRelay != null)
            this.noRelay = options.noRelay;
        return this;
    };
    /**
     * Instantiate version packet from options.
     * @param {Object} options
     * @returns {VersionPacket}
     */
    VersionPacket.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Get serialization size.
     * @returns {Number}
     */
    VersionPacket.prototype.getSize = function () {
        var size = 0;
        size += 20;
        size += this.remote.getSize(false);
        size += this.local.getSize(false);
        size += 8;
        size += encoding.sizeVarString(this.agent, 'ascii');
        size += 5;
        return size;
    };
    /**
     * Write version packet to buffer writer.
     * @param {BufferWriter} bw
     */
    VersionPacket.prototype.toWriter = function (bw) {
        bw.writeI32(this.version);
        bw.writeU32(this.services);
        bw.writeU32(0);
        bw.writeI64(this.time);
        this.remote.toWriter(bw, false);
        this.local.toWriter(bw, false);
        bw.writeBytes(this.nonce);
        bw.writeVarString(this.agent, 'ascii');
        bw.writeI32(this.height);
        bw.writeU8(this.noRelay ? 0 : 1);
        return bw;
    };
    /**
     * Serialize version packet.
     * @returns {Buffer}
     */
    VersionPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    VersionPacket.prototype.fromReader = function (br) {
        this.version = br.readI32();
        this.services = br.readU32();
        // Note: hi service bits
        // are currently unused.
        br.readU32();
        this.time = br.readI64();
        this.remote.fromReader(br, false);
        if (br.left() > 0) {
            this.local.fromReader(br, false);
            this.nonce = br.readBytes(8);
        }
        if (br.left() > 0)
            this.agent = br.readVarString('ascii', 256);
        if (br.left() > 0)
            this.height = br.readI32();
        if (br.left() > 0)
            this.noRelay = br.readU8() === 0;
        if (this.version === 10300)
            this.version = 300;
        assert(this.version >= 0, 'Version is negative.');
        assert(this.time >= 0, 'Timestamp is negative.');
        // No idea why so many peers do this.
        if (this.height < 0)
            this.height = 0;
        return this;
    };
    /**
     * Instantiate version packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VersionPacket}
     */
    VersionPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    VersionPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate version packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VersionPacket}
     */
    VersionPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data, enc);
    };
    return VersionPacket;
}(Packet));
/**
 * Verack Packet
 * @extends Packet
 */
var VerackPacket = /** @class */ (function (_super) {
    __extends(VerackPacket, _super);
    /**
     * Create a `verack` packet.
     * @constructor
     */
    function VerackPacket() {
        var _this = _super.call(this) || this;
        _this.cmd = 'verack';
        _this.type = exports.types.VERACK;
        return _this;
    }
    /**
     * Instantiate verack packet from serialized data.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    VerackPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate verack packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    VerackPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return VerackPacket;
}(Packet));
/**
 * Ping Packet
 * @extends Packet
 * @property {Buffer|null} nonce
 */
var PingPacket = /** @class */ (function (_super) {
    __extends(PingPacket, _super);
    /**
     * Create a `ping` packet.
     * @constructor
     * @param {Buffer?} nonce
     */
    function PingPacket(nonce) {
        var _this = _super.call(this) || this;
        _this.cmd = 'ping';
        _this.type = exports.types.PING;
        _this.nonce = nonce || null;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    PingPacket.prototype.getSize = function () {
        return this.nonce ? 8 : 0;
    };
    /**
     * Serialize ping packet.
     * @returns {Buffer}
     */
    PingPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Serialize ping packet to writer.
     * @param {BufferWriter} bw
     */
    PingPacket.prototype.toWriter = function (bw) {
        if (this.nonce)
            bw.writeBytes(this.nonce);
        return bw;
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    PingPacket.prototype.fromReader = function (br) {
        if (br.left() >= 8)
            this.nonce = br.readBytes(8);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    PingPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate ping packet from serialized data.
     * @param {BufferReader} br
     * @returns {PingPacket}
     */
    PingPacket.fromReader = function (br) {
        return new this().fromRaw(br);
    };
    /**
     * Instantiate ping packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {PingPacket}
     */
    PingPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return PingPacket;
}(Packet));
/**
 * Pong Packet
 * @extends Packet
 * @property {BN} nonce
 */
var PongPacket = /** @class */ (function (_super) {
    __extends(PongPacket, _super);
    /**
     * Create a `pong` packet.
     * @constructor
     * @param {BN?} nonce
     */
    function PongPacket(nonce) {
        var _this = _super.call(this) || this;
        _this.cmd = 'pong';
        _this.type = exports.types.PONG;
        _this.nonce = nonce || common.ZERO_NONCE;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    PongPacket.prototype.getSize = function () {
        return 8;
    };
    /**
     * Serialize pong packet to writer.
     * @param {BufferWriter} bw
     */
    PongPacket.prototype.toWriter = function (bw) {
        bw.writeBytes(this.nonce);
        return bw;
    };
    /**
     * Serialize pong packet.
     * @returns {Buffer}
     */
    PongPacket.prototype.toRaw = function () {
        return this.toWriter(bio.write(8)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    PongPacket.prototype.fromReader = function (br) {
        this.nonce = br.readBytes(8);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    PongPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate pong packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    PongPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate pong packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    PongPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return PongPacket;
}(Packet));
/**
 * GetAddr Packet
 * @extends Packet
 */
var GetAddrPacket = /** @class */ (function (_super) {
    __extends(GetAddrPacket, _super);
    /**
     * Create a `getaddr` packet.
     * @constructor
     */
    function GetAddrPacket() {
        var _this = _super.call(this) || this;
        _this.cmd = 'getaddr';
        _this.type = exports.types.GETADDR;
        return _this;
    }
    /**
     * Instantiate getaddr packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetAddrPacket}
     */
    GetAddrPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate getaddr packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetAddrPacket}
     */
    GetAddrPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return GetAddrPacket;
}(Packet));
/**
 * Addr Packet
 * @extends Packet
 * @property {NetAddress[]} items
 */
var AddrPacket = /** @class */ (function (_super) {
    __extends(AddrPacket, _super);
    /**
     * Create a `addr` packet.
     * @constructor
     * @param {(NetAddress[])?} items
     */
    function AddrPacket(items) {
        var _this = _super.call(this) || this;
        _this.cmd = 'addr';
        _this.type = exports.types.ADDR;
        _this.items = items || [];
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    AddrPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarint(this.items.length);
        size += 30 * this.items.length;
        return size;
    };
    /**
     * Serialize addr packet to writer.
     * @param {BufferWriter} bw
     */
    AddrPacket.prototype.toWriter = function (bw) {
        bw.writeVarint(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            item.toWriter(bw, true);
        }
        return bw;
    };
    /**
     * Serialize addr packet.
     * @returns {Buffer}
     */
    AddrPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    AddrPacket.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        var count = br.readVarint();
        for (var i = 0; i < count; i++)
            this.items.push(NetAddress.fromReader(br, true));
        return this;
    };
    /**
     * Instantiate addr packet from Buffer reader.
     * @param {BufferReader} br
     * @returns {AddrPacket}
     */
    AddrPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate addr packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {AddrPacket}
     */
    AddrPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return AddrPacket;
}(Packet));
/**
 * Inv Packet
 * @extends Packet
 * @property {InvItem[]} items
 */
var InvPacket = /** @class */ (function (_super) {
    __extends(InvPacket, _super);
    /**
     * Create a `inv` packet.
     * @constructor
     * @param {(InvItem[])?} items
     */
    function InvPacket(items) {
        var _this = _super.call(this) || this;
        _this.cmd = 'inv';
        _this.type = exports.types.INV;
        _this.items = items || [];
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    InvPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarint(this.items.length);
        size += 36 * this.items.length;
        return size;
    };
    /**
     * Serialize inv packet to writer.
     * @param {Buffer} bw
     */
    InvPacket.prototype.toWriter = function (bw) {
        assert(this.items.length <= common.MAX_INV);
        bw.writeVarint(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            item.toWriter(bw);
        }
        return bw;
    };
    /**
     * Serialize inv packet.
     * @returns {Buffer}
     */
    InvPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    InvPacket.prototype.fromReader = function (br) {
        var count = br.readVarint();
        assert(count <= common.MAX_INV, 'Inv item count too high.');
        for (var i = 0; i < count; i++)
            this.items.push(InvItem.fromReader(br));
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    InvPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate inv packet from buffer reader.
     * @param {BufferReader} br
     * @returns {InvPacket}
     */
    InvPacket.fromReader = function (br) {
        return new this().fromRaw(br);
    };
    /**
     * Instantiate inv packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {InvPacket}
     */
    InvPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return InvPacket;
}(Packet));
/**
 * GetData Packet
 * @extends InvPacket
 */
var GetDataPacket = /** @class */ (function (_super) {
    __extends(GetDataPacket, _super);
    /**
     * Create a `getdata` packet.
     * @constructor
     * @param {(InvItem[])?} items
     */
    function GetDataPacket(items) {
        var _this = _super.call(this, items) || this;
        _this.cmd = 'getdata';
        _this.type = exports.types.GETDATA;
        return _this;
    }
    /**
     * Instantiate getdata packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetDataPacket}
     */
    GetDataPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate getdata packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetDataPacket}
     */
    GetDataPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return GetDataPacket;
}(InvPacket));
/**
 * NotFound Packet
 * @extends InvPacket
 */
var NotFoundPacket = /** @class */ (function (_super) {
    __extends(NotFoundPacket, _super);
    /**
     * Create a `notfound` packet.
     * @constructor
     * @param {(InvItem[])?} items
     */
    function NotFoundPacket(items) {
        var _this = _super.call(this, items) || this;
        _this.cmd = 'notfound';
        _this.type = exports.types.NOTFOUND;
        return _this;
    }
    /**
     * Instantiate notfound packet from buffer reader.
     * @param {BufferReader} br
     * @returns {NotFoundPacket}
     */
    NotFoundPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate notfound packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {NotFoundPacket}
     */
    NotFoundPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return NotFoundPacket;
}(InvPacket));
/**
 * GetBlocks Packet
 * @extends Packet
 * @property {Hash[]} locator
 * @property {Hash|null} stop
 */
var GetBlocksPacket = /** @class */ (function (_super) {
    __extends(GetBlocksPacket, _super);
    /**
     * Create a `getblocks` packet.
     * @constructor
     * @param {Hash[]} locator
     * @param {Hash?} stop
     */
    function GetBlocksPacket(locator, stop) {
        var _this = _super.call(this) || this;
        _this.cmd = 'getblocks';
        _this.type = exports.types.GETBLOCKS;
        _this.version = common.PROTOCOL_VERSION;
        _this.locator = locator || [];
        _this.stop = stop || null;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    GetBlocksPacket.prototype.getSize = function () {
        var size = 0;
        size += 4;
        size += encoding.sizeVarint(this.locator.length);
        size += 32 * this.locator.length;
        size += 32;
        return size;
    };
    /**
     * Serialize getblocks packet to writer.
     * @param {BufferWriter} bw
     */
    GetBlocksPacket.prototype.toWriter = function (bw) {
        assert(this.locator.length <= common.MAX_INV, 'Too many block hashes.');
        bw.writeU32(this.version);
        bw.writeVarint(this.locator.length);
        for (var _i = 0, _a = this.locator; _i < _a.length; _i++) {
            var hash = _a[_i];
            bw.writeHash(hash);
        }
        bw.writeHash(this.stop || consensus.ZERO_HASH);
        return bw;
    };
    /**
     * Serialize getblocks packet.
     * @returns {Buffer}
     */
    GetBlocksPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    GetBlocksPacket.prototype.fromReader = function (br) {
        this.version = br.readU32();
        var count = br.readVarint();
        assert(count <= common.MAX_INV, 'Too many block hashes.');
        for (var i = 0; i < count; i++)
            this.locator.push(br.readHash());
        this.stop = br.readHash();
        if (this.stop.equals(consensus.ZERO_HASH))
            this.stop = null;
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    GetBlocksPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate getblocks packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetBlocksPacket}
     */
    GetBlocksPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return GetBlocksPacket;
}(Packet));
/**
 * GetHeader Packets
 * @extends GetBlocksPacket
 */
var GetHeadersPacket = /** @class */ (function (_super) {
    __extends(GetHeadersPacket, _super);
    /**
     * Create a `getheaders` packet.
     * @constructor
     * @param {Hash[]} locator
     * @param {Hash?} stop
     */
    function GetHeadersPacket(locator, stop) {
        var _this = _super.call(this, locator, stop) || this;
        _this.cmd = 'getheaders';
        _this.type = exports.types.GETHEADERS;
        return _this;
    }
    /**
     * Instantiate getheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetHeadersPacket}
     */
    GetHeadersPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate getheaders packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetHeadersPacket}
     */
    GetHeadersPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return GetHeadersPacket;
}(GetBlocksPacket));
/**
 * Headers Packet
 * @extends Packet
 * @property {Headers[]} items
 */
var HeadersPacket = /** @class */ (function (_super) {
    __extends(HeadersPacket, _super);
    /**
     * Create a `headers` packet.
     * @constructor
     * @param {(Headers[])?} items
     */
    function HeadersPacket(items) {
        var _this = _super.call(this) || this;
        _this.cmd = 'headers';
        _this.type = exports.types.HEADERS;
        _this.items = items || [];
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    HeadersPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarint(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            size += item.getSize();
        }
        return size;
    };
    /**
     * Serialize headers packet to writer.
     * @param {BufferWriter} bw
     */
    HeadersPacket.prototype.toWriter = function (bw) {
        assert(this.items.length <= 2000, 'Too many headers.');
        bw.writeVarint(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            item.toWriter(bw);
        }
        return bw;
    };
    /**
     * Serialize headers packet.
     * @returns {Buffer}
     */
    HeadersPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    HeadersPacket.prototype.fromReader = function (br) {
        var count = br.readVarint();
        assert(count <= 2000, 'Too many headers.');
        for (var i = 0; i < count; i++)
            this.items.push(Headers.fromReader(br));
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    HeadersPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate headers packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    HeadersPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return HeadersPacket;
}(Packet));
/**
 * SendHeaders Packet
 * @extends Packet
 */
var SendHeadersPacket = /** @class */ (function (_super) {
    __extends(SendHeadersPacket, _super);
    /**
     * Create a `sendheaders` packet.
     * @constructor
     */
    function SendHeadersPacket() {
        var _this = _super.call(this) || this;
        _this.cmd = 'sendheaders';
        _this.type = exports.types.SENDHEADERS;
        return _this;
    }
    /**
     * Instantiate sendheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {SendHeadersPacket}
     */
    SendHeadersPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate sendheaders packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {SendHeadersPacket}
     */
    SendHeadersPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return SendHeadersPacket;
}(Packet));
/**
 * Block Packet
 * @extends Packet
 * @property {Block} block
 * @property {Boolean} witness
 */
var BlockPacket = /** @class */ (function (_super) {
    __extends(BlockPacket, _super);
    /**
     * Create a `block` packet.
     * @constructor
     * @param {Block|null} block
     * @param {Boolean?} witness
     */
    function BlockPacket(block, witness) {
        var _this = _super.call(this) || this;
        _this.cmd = 'block';
        _this.type = exports.types.BLOCK;
        _this.block = block || new MemBlock();
        _this.witness = witness || false;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    BlockPacket.prototype.getSize = function () {
        if (this.witness)
            return this.block.getSize();
        return this.block.getBaseSize();
    };
    /**
     * Serialize block packet to writer.
     * @param {BufferWriter} bw
     */
    BlockPacket.prototype.toWriter = function (bw) {
        if (this.witness)
            return this.block.toWriter(bw);
        return this.block.toNormalWriter(bw);
    };
    /**
     * Serialize block packet.
     * @returns {Buffer}
     */
    BlockPacket.prototype.toRaw = function () {
        if (this.witness)
            return this.block.toRaw();
        return this.block.toNormal();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    BlockPacket.prototype.fromReader = function (br) {
        this.block.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    BlockPacket.prototype.fromRaw = function (data) {
        this.block.fromRaw(data);
        return this;
    };
    /**
     * Instantiate block packet from buffer reader.
     * @param {BufferReader} br
     * @returns {BlockPacket}
     */
    BlockPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate block packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {BlockPacket}
     */
    BlockPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return BlockPacket;
}(Packet));
/**
 * TX Packet
 * @extends Packet
 * @property {TX} block
 * @property {Boolean} witness
 */
var TXPacket = /** @class */ (function (_super) {
    __extends(TXPacket, _super);
    /**
     * Create a `tx` packet.
     * @constructor
     * @param {TX|null} tx
     * @param {Boolean?} witness
     */
    function TXPacket(tx, witness) {
        var _this = _super.call(this) || this;
        _this.cmd = 'tx';
        _this.type = exports.types.TX;
        _this.tx = tx || new TX();
        _this.witness = witness || false;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    TXPacket.prototype.getSize = function () {
        if (this.witness)
            return this.tx.getSize();
        return this.tx.getBaseSize();
    };
    /**
     * Serialize tx packet to writer.
     * @param {BufferWriter} bw
     */
    TXPacket.prototype.toWriter = function (bw) {
        if (this.witness)
            return this.tx.toWriter(bw);
        return this.tx.toNormalWriter(bw);
    };
    /**
     * Serialize tx packet.
     * @returns {Buffer}
     */
    TXPacket.prototype.toRaw = function () {
        if (this.witness)
            return this.tx.toRaw();
        return this.tx.toNormal();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    TXPacket.prototype.fromReader = function (br) {
        this.tx.fromRaw(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    TXPacket.prototype.fromRaw = function (data) {
        this.tx.fromRaw(data);
        return this;
    };
    /**
     * Instantiate tx packet from buffer reader.
     * @param {BufferReader} br
     * @returns {TXPacket}
     */
    TXPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate tx packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {TXPacket}
     */
    TXPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return TXPacket;
}(Packet));
/**
 * Reject Packet
 * @extends Packet
 * @property {(Number|String)?} code - Code
 * (see {@link RejectPacket.codes}).
 * @property {String?} msg - Message.
 * @property {String?} reason - Reason.
 * @property {(Hash|Buffer)?} data - Transaction or block hash.
 */
var RejectPacket = /** @class */ (function (_super) {
    __extends(RejectPacket, _super);
    /**
     * Create reject packet.
     * @constructor
     */
    function RejectPacket(options) {
        var _this = _super.call(this) || this;
        _this.cmd = 'reject';
        _this.type = exports.types.REJECT;
        _this.message = '';
        _this.code = RejectPacket.codes.INVALID;
        _this.reason = '';
        _this.hash = null;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    RejectPacket.prototype.fromOptions = function (options) {
        var code = options.code;
        if (options.message)
            this.message = options.message;
        if (code != null) {
            if (typeof code === 'string')
                code = RejectPacket.codes[code.toUpperCase()];
            if (code >= RejectPacket.codes.INTERNAL)
                code = RejectPacket.codes.INVALID;
            this.code = code;
        }
        if (options.reason)
            this.reason = options.reason;
        if (options.hash)
            this.hash = options.hash;
        return this;
    };
    /**
     * Instantiate reject packet from options.
     * @param {Object} options
     * @returns {RejectPacket}
     */
    RejectPacket.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Get uint256le hash if present.
     * @returns {Hash}
     */
    RejectPacket.prototype.rhash = function () {
        return this.hash ? util.revHex(this.hash) : null;
    };
    /**
     * Get symbolic code.
     * @returns {String}
     */
    RejectPacket.prototype.getCode = function () {
        var code = RejectPacket.codesByVal[this.code];
        if (!code)
            return this.code.toString(10);
        return code.toLowerCase();
    };
    /**
     * Get serialization size.
     * @returns {Number}
     */
    RejectPacket.prototype.getSize = function () {
        var size = 0;
        size += encoding.sizeVarString(this.message, 'ascii');
        size += 1;
        size += encoding.sizeVarString(this.reason, 'ascii');
        if (this.hash)
            size += 32;
        return size;
    };
    /**
     * Serialize reject packet to writer.
     * @param {BufferWriter} bw
     */
    RejectPacket.prototype.toWriter = function (bw) {
        assert(this.message.length <= 12);
        assert(this.reason.length <= 111);
        bw.writeVarString(this.message, 'ascii');
        bw.writeU8(this.code);
        bw.writeVarString(this.reason, 'ascii');
        if (this.hash)
            bw.writeHash(this.hash);
        return bw;
    };
    /**
     * Serialize reject packet.
     * @returns {Buffer}
     */
    RejectPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    RejectPacket.prototype.fromReader = function (br) {
        this.message = br.readVarString('ascii', 12);
        this.code = br.readU8();
        this.reason = br.readVarString('ascii', 111);
        switch (this.message) {
            case 'block':
            case 'tx':
                this.hash = br.readHash();
                break;
            default:
                this.hash = null;
                break;
        }
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    RejectPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate reject packet from buffer reader.
     * @param {BufferReader} br
     * @returns {RejectPacket}
     */
    RejectPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate reject packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {RejectPacket}
     */
    RejectPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data, enc);
    };
    /**
     * Inject properties from reason message and object.
     * @private
     * @param {Number|String} code
     * @param {String} reason
     * @param {String?} msg
     * @param {Hash?} hash
     */
    RejectPacket.prototype.fromReason = function (code, reason, msg, hash) {
        if (typeof code === 'string')
            code = RejectPacket.codes[code.toUpperCase()];
        if (!code)
            code = RejectPacket.codes.INVALID;
        if (code >= RejectPacket.codes.INTERNAL)
            code = RejectPacket.codes.INVALID;
        this.message = '';
        this.code = code;
        this.reason = reason;
        if (msg) {
            assert(hash);
            this.message = msg;
            this.hash = hash;
        }
        return this;
    };
    /**
     * Instantiate reject packet from reason message.
     * @param {Number} code
     * @param {String} reason
     * @param {String?} msg
     * @param {Hash?} hash
     * @returns {RejectPacket}
     */
    RejectPacket.fromReason = function (code, reason, msg, hash) {
        return new this().fromReason(code, reason, msg, hash);
    };
    /**
     * Instantiate reject packet from verify error.
     * @param {VerifyError} err
     * @param {(TX|Block)?} obj
     * @returns {RejectPacket}
     */
    RejectPacket.fromError = function (err, obj) {
        return this.fromReason(err.code, err.reason, obj);
    };
    /**
     * Inspect reject packet.
     * @returns {String}
     */
    RejectPacket.prototype[inspectSymbol] = function () {
        var code = RejectPacket.codesByVal[this.code] || this.code;
        var hash = this.hash ? util.revHex(this.hash) : null;
        return '<Reject:'
            + " msg=".concat(this.message)
            + " code=".concat(code)
            + " reason=".concat(this.reason)
            + " hash=".concat(hash)
            + '>';
    };
    return RejectPacket;
}(Packet));
/**
 * Reject codes. Note that `internal` and higher
 * are not meant for use on the p2p network.
 * @enum {Number}
 * @default
 */
RejectPacket.codes = {
    MALFORMED: 0x01,
    INVALID: 0x10,
    OBSOLETE: 0x11,
    DUPLICATE: 0x12,
    NONSTANDARD: 0x40,
    DUST: 0x41,
    INSUFFICIENTFEE: 0x42,
    CHECKPOINT: 0x43,
    // Internal codes (NOT FOR USE ON NETWORK)
    INTERNAL: 0x100,
    HIGHFEE: 0x101,
    ALREADYKNOWN: 0x102,
    CONFLICT: 0x103
};
/**
 * Reject codes by value.
 * @const {Object}
 */
RejectPacket.codesByVal = {
    0x01: 'MALFORMED',
    0x10: 'INVALID',
    0x11: 'OBSOLETE',
    0x12: 'DUPLICATE',
    0x40: 'NONSTANDARD',
    0x41: 'DUST',
    0x42: 'INSUFFICIENTFEE',
    0x43: 'CHECKPOINT',
    // Internal codes (NOT FOR USE ON NETWORK)
    0x100: 'INTERNAL',
    0x101: 'HIGHFEE',
    0x102: 'ALREADYKNOWN',
    0x103: 'CONFLICT'
};
/**
 * Mempool Packet
 * @extends Packet
 */
var MempoolPacket = /** @class */ (function (_super) {
    __extends(MempoolPacket, _super);
    /**
     * Create a `mempool` packet.
     * @constructor
     */
    function MempoolPacket() {
        var _this = _super.call(this) || this;
        _this.cmd = 'mempool';
        _this.type = exports.types.MEMPOOL;
        return _this;
    }
    /**
     * Instantiate mempool packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    MempoolPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate mempool packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    MempoolPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return MempoolPacket;
}(Packet));
/**
 * FilterLoad Packet
 * @extends Packet
 */
var FilterLoadPacket = /** @class */ (function (_super) {
    __extends(FilterLoadPacket, _super);
    /**
     * Create a `filterload` packet.
     * @constructor
     * @param {BloomFilter|null} filter
     */
    function FilterLoadPacket(filter) {
        var _this = _super.call(this) || this;
        _this.cmd = 'filterload';
        _this.type = exports.types.FILTERLOAD;
        _this.filter = filter || new BloomFilter();
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    FilterLoadPacket.prototype.getSize = function () {
        return this.filter.getSize();
    };
    /**
     * Serialize filterload packet to writer.
     * @param {BufferWriter} bw
     */
    FilterLoadPacket.prototype.toWriter = function (bw) {
        return this.filter.toWriter(bw);
    };
    /**
     * Serialize filterload packet.
     * @returns {Buffer}
     */
    FilterLoadPacket.prototype.toRaw = function () {
        return this.filter.toRaw();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    FilterLoadPacket.prototype.fromReader = function (br) {
        this.filter.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    FilterLoadPacket.prototype.fromRaw = function (data) {
        this.filter.fromRaw(data);
        return this;
    };
    /**
     * Instantiate filterload packet from buffer reader.
     * @param {BufferReader} br
     * @returns {FilterLoadPacket}
     */
    FilterLoadPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate filterload packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterLoadPacket}
     */
    FilterLoadPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Ensure the filter is within the size limits.
     * @returns {Boolean}
     */
    FilterLoadPacket.prototype.isWithinConstraints = function () {
        return this.filter.isWithinConstraints();
    };
    return FilterLoadPacket;
}(Packet));
/**
 * FilterAdd Packet
 * @extends Packet
 * @property {Buffer} data
 */
var FilterAddPacket = /** @class */ (function (_super) {
    __extends(FilterAddPacket, _super);
    /**
     * Create a `filteradd` packet.
     * @constructor
     * @param {Buffer?} data
     */
    function FilterAddPacket(data) {
        var _this = _super.call(this) || this;
        _this.cmd = 'filteradd';
        _this.type = exports.types.FILTERADD;
        _this.data = data || DUMMY;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    FilterAddPacket.prototype.getSize = function () {
        return encoding.sizeVarBytes(this.data);
    };
    /**
     * Serialize filteradd packet to writer.
     * @returns {BufferWriter} bw
     */
    FilterAddPacket.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.data);
        return bw;
    };
    /**
     * Serialize filteradd packet.
     * @returns {Buffer}
     */
    FilterAddPacket.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    FilterAddPacket.prototype.fromReader = function (br) {
        this.data = br.readVarBytes();
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    FilterAddPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate filteradd packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterAddPacket}
     */
    FilterAddPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return FilterAddPacket;
}(Packet));
/**
 * FilterClear Packet
 * @extends Packet
 */
var FilterClearPacket = /** @class */ (function (_super) {
    __extends(FilterClearPacket, _super);
    /**
     * Create a `filterclear` packet.
     * @constructor
     */
    function FilterClearPacket() {
        var _this = _super.call(this) || this;
        _this.cmd = 'filterclear';
        _this.type = exports.types.FILTERCLEAR;
        return _this;
    }
    /**
     * Instantiate filterclear packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterClearPacket}
     */
    FilterClearPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return FilterClearPacket;
}(Packet));
/**
 * MerkleBlock Packet
 * @extends Packet
 * @property {MerkleBlock} block
 */
var MerkleBlockPacket = /** @class */ (function (_super) {
    __extends(MerkleBlockPacket, _super);
    /**
     * Create a `merkleblock` packet.
     * @constructor
     * @param {MerkleBlock?} block
     */
    function MerkleBlockPacket(block) {
        var _this = _super.call(this) || this;
        _this.cmd = 'merkleblock';
        _this.type = exports.types.MERKLEBLOCK;
        _this.block = block || new MerkleBlock();
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    MerkleBlockPacket.prototype.getSize = function () {
        return this.block.getSize();
    };
    /**
     * Serialize merkleblock packet to writer.
     * @param {BufferWriter} bw
     */
    MerkleBlockPacket.prototype.toWriter = function (bw) {
        return this.block.toWriter(bw);
    };
    /**
     * Serialize merkleblock packet.
     * @returns {Buffer}
     */
    MerkleBlockPacket.prototype.toRaw = function () {
        return this.block.toRaw();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    MerkleBlockPacket.prototype.fromReader = function (br) {
        this.block.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    MerkleBlockPacket.prototype.fromRaw = function (data) {
        this.block.fromRaw(data);
        return this;
    };
    /**
     * Instantiate merkleblock packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {MerkleBlockPacket}
     */
    MerkleBlockPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return MerkleBlockPacket;
}(Packet));
/**
 * FeeFilter Packet
 * @extends Packet
 * @property {Rate} rate
 */
var FeeFilterPacket = /** @class */ (function (_super) {
    __extends(FeeFilterPacket, _super);
    /**
     * Create a `feefilter` packet.
     * @constructor
     * @param {Rate?} rate
     */
    function FeeFilterPacket(rate) {
        var _this = _super.call(this) || this;
        _this.cmd = 'feefilter';
        _this.type = exports.types.FEEFILTER;
        _this.rate = rate || 0;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    FeeFilterPacket.prototype.getSize = function () {
        return 8;
    };
    /**
     * Serialize feefilter packet to writer.
     * @param {BufferWriter} bw
     */
    FeeFilterPacket.prototype.toWriter = function (bw) {
        bw.writeI64(this.rate);
        return bw;
    };
    /**
     * Serialize feefilter packet.
     * @returns {Buffer}
     */
    FeeFilterPacket.prototype.toRaw = function () {
        return this.toWriter(bio.write(8)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    FeeFilterPacket.prototype.fromReader = function (br) {
        this.rate = br.readI64();
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    FeeFilterPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate feefilter packet from buffer reader.
     * @param {BufferReader} br
     * @returns {FeeFilterPacket}
     */
    FeeFilterPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate feefilter packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FeeFilterPacket}
     */
    FeeFilterPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return FeeFilterPacket;
}(Packet));
/**
 * SendCmpct Packet
 * @extends Packet
 * @property {Number} mode
 * @property {Number} version
 */
var SendCmpctPacket = /** @class */ (function (_super) {
    __extends(SendCmpctPacket, _super);
    /**
     * Create a `sendcmpct` packet.
     * @constructor
     * @param {Number|null} mode
     * @param {Number|null} version
     */
    function SendCmpctPacket(mode, version) {
        var _this = _super.call(this) || this;
        _this.cmd = 'sendcmpct';
        _this.type = exports.types.SENDCMPCT;
        _this.mode = mode || 0;
        _this.version = version || 1;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    SendCmpctPacket.prototype.getSize = function () {
        return 9;
    };
    /**
     * Serialize sendcmpct packet to writer.
     * @param {BufferWriter} bw
     */
    SendCmpctPacket.prototype.toWriter = function (bw) {
        bw.writeU8(this.mode);
        bw.writeU64(this.version);
        return bw;
    };
    /**
     * Serialize sendcmpct packet.
     * @returns {Buffer}
     */
    SendCmpctPacket.prototype.toRaw = function () {
        return this.toWriter(bio.write(9)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    SendCmpctPacket.prototype.fromReader = function (br) {
        this.mode = br.readU8();
        this.version = br.readU64();
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    SendCmpctPacket.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate sendcmpct packet from buffer reader.
     * @param {BufferReader} br
     * @returns {SendCmpctPacket}
     */
    SendCmpctPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate sendcmpct packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {SendCmpctPacket}
     */
    SendCmpctPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return SendCmpctPacket;
}(Packet));
/**
 * CmpctBlock Packet
 * @extends Packet
 * @property {Block} block
 * @property {Boolean} witness
 */
var CmpctBlockPacket = /** @class */ (function (_super) {
    __extends(CmpctBlockPacket, _super);
    /**
     * Create a `cmpctblock` packet.
     * @constructor
     * @param {Block|null} block
     * @param {Boolean|null} witness
     */
    function CmpctBlockPacket(block, witness) {
        var _this = _super.call(this) || this;
        _this.cmd = 'cmpctblock';
        _this.type = exports.types.CMPCTBLOCK;
        _this.block = block || new bip152.CompactBlock();
        _this.witness = witness || false;
        return _this;
    }
    /**
     * Serialize cmpctblock packet.
     * @returns {Buffer}
     */
    CmpctBlockPacket.prototype.getSize = function () {
        if (this.witness)
            return this.block.getSize(true);
        return this.block.getSize(false);
    };
    /**
     * Serialize cmpctblock packet to writer.
     * @param {BufferWriter} bw
     */
    CmpctBlockPacket.prototype.toWriter = function (bw) {
        if (this.witness)
            return this.block.toWriter(bw);
        return this.block.toNormalWriter(bw);
    };
    /**
     * Serialize cmpctblock packet.
     * @returns {Buffer}
     */
    CmpctBlockPacket.prototype.toRaw = function () {
        if (this.witness)
            return this.block.toRaw();
        return this.block.toNormal();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    CmpctBlockPacket.prototype.fromReader = function (br) {
        this.block.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    CmpctBlockPacket.prototype.fromRaw = function (data) {
        this.block.fromRaw(data);
        return this;
    };
    /**
     * Instantiate cmpctblock packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CmpctBlockPacket}
     */
    CmpctBlockPacket.fromReader = function (br) {
        return new this().fromRaw(br);
    };
    /**
     * Instantiate cmpctblock packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {CmpctBlockPacket}
     */
    CmpctBlockPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return CmpctBlockPacket;
}(Packet));
/**
 * GetBlockTxn Packet
 * @extends Packet
 * @property {TXRequest} request
 */
var GetBlockTxnPacket = /** @class */ (function (_super) {
    __extends(GetBlockTxnPacket, _super);
    /**
     * Create a `getblocktxn` packet.
     * @constructor
     * @param {TXRequest?} request
     */
    function GetBlockTxnPacket(request) {
        var _this = _super.call(this) || this;
        _this.cmd = 'getblocktxn';
        _this.type = exports.types.GETBLOCKTXN;
        _this.request = request || new bip152.TXRequest();
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    GetBlockTxnPacket.prototype.getSize = function () {
        return this.request.getSize();
    };
    /**
     * Serialize getblocktxn packet to writer.
     * @param {BufferWriter} bw
     */
    GetBlockTxnPacket.prototype.toWriter = function (bw) {
        return this.request.toWriter(bw);
    };
    /**
     * Serialize getblocktxn packet.
     * @returns {Buffer}
     */
    GetBlockTxnPacket.prototype.toRaw = function () {
        return this.request.toRaw();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    GetBlockTxnPacket.prototype.fromReader = function (br) {
        this.request.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    GetBlockTxnPacket.prototype.fromRaw = function (data) {
        this.request.fromRaw(data);
        return this;
    };
    /**
     * Instantiate getblocktxn packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetBlockTxnPacket}
     */
    GetBlockTxnPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate getblocktxn packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetBlockTxnPacket}
     */
    GetBlockTxnPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return GetBlockTxnPacket;
}(Packet));
/**
 * BlockTxn Packet
 * @extends Packet
 * @property {TXResponse} response
 * @property {Boolean} witness
 */
var BlockTxnPacket = /** @class */ (function (_super) {
    __extends(BlockTxnPacket, _super);
    /**
     * Create a `blocktxn` packet.
     * @constructor
     * @param {TXResponse?} response
     * @param {Boolean?} witness
     */
    function BlockTxnPacket(response, witness) {
        var _this = _super.call(this) || this;
        _this.cmd = 'blocktxn';
        _this.type = exports.types.BLOCKTXN;
        _this.response = response || new bip152.TXResponse();
        _this.witness = witness || false;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    BlockTxnPacket.prototype.getSize = function () {
        if (this.witness)
            return this.response.getSize(true);
        return this.response.getSize(false);
    };
    /**
     * Serialize blocktxn packet to writer.
     * @param {BufferWriter} bw
     */
    BlockTxnPacket.prototype.toWriter = function (bw) {
        if (this.witness)
            return this.response.toWriter(bw);
        return this.response.toNormalWriter(bw);
    };
    /**
     * Serialize blocktxn packet.
     * @returns {Buffer}
     */
    BlockTxnPacket.prototype.toRaw = function () {
        if (this.witness)
            return this.response.toRaw();
        return this.response.toNormal();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    BlockTxnPacket.prototype.fromReader = function (br) {
        this.response.fromReader(br);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    BlockTxnPacket.prototype.fromRaw = function (data) {
        this.response.fromRaw(data);
        return this;
    };
    /**
     * Instantiate blocktxn packet from buffer reader.
     * @param {BufferReader} br
     * @returns {BlockTxnPacket}
     */
    BlockTxnPacket.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate blocktxn packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {BlockTxnPacket}
     */
    BlockTxnPacket.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    return BlockTxnPacket;
}(Packet));
/**
 * Unknown Packet
 * @extends Packet
 * @property {String} cmd
 * @property {Buffer} data
 */
var UnknownPacket = /** @class */ (function (_super) {
    __extends(UnknownPacket, _super);
    /**
     * Create an unknown packet.
     * @constructor
     * @param {String|null} cmd
     * @param {Buffer|null} data
     */
    function UnknownPacket(cmd, data) {
        var _this = _super.call(this) || this;
        _this.cmd = cmd;
        _this.type = exports.types.UNKNOWN;
        _this.data = data;
        return _this;
    }
    /**
     * Get serialization size.
     * @returns {Number}
     */
    UnknownPacket.prototype.getSize = function () {
        return this.data.length;
    };
    /**
     * Serialize unknown packet to writer.
     * @param {BufferWriter} bw
     */
    UnknownPacket.prototype.toWriter = function (bw) {
        bw.writeBytes(this.data);
        return bw;
    };
    /**
     * Serialize unknown packet.
     * @returns {Buffer}
     */
    UnknownPacket.prototype.toRaw = function () {
        return this.data;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    UnknownPacket.prototype.fromRaw = function (cmd, data) {
        assert(Buffer.isBuffer(data));
        this.cmd = cmd;
        this.data = data;
        return this;
    };
    /**
     * Instantiate unknown packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {UnknownPacket}
     */
    UnknownPacket.fromRaw = function (cmd, data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(cmd, data);
    };
    return UnknownPacket;
}(Packet));
/**
 * Parse a payload.
 * @param {String} cmd
 * @param {Buffer} data
 * @returns {Packet}
 */
exports.fromRaw = function fromRaw(cmd, data) {
    switch (cmd) {
        case 'version':
            return VersionPacket.fromRaw(data);
        case 'verack':
            return VerackPacket.fromRaw(data);
        case 'ping':
            return PingPacket.fromRaw(data);
        case 'pong':
            return PongPacket.fromRaw(data);
        case 'getaddr':
            return GetAddrPacket.fromRaw(data);
        case 'addr':
            return AddrPacket.fromRaw(data);
        case 'inv':
            return InvPacket.fromRaw(data);
        case 'getdata':
            return GetDataPacket.fromRaw(data);
        case 'notfound':
            return NotFoundPacket.fromRaw(data);
        case 'getblocks':
            return GetBlocksPacket.fromRaw(data);
        case 'getheaders':
            return GetHeadersPacket.fromRaw(data);
        case 'headers':
            return HeadersPacket.fromRaw(data);
        case 'sendheaders':
            return SendHeadersPacket.fromRaw(data);
        case 'block':
            return BlockPacket.fromRaw(data);
        case 'tx':
            return TXPacket.fromRaw(data);
        case 'reject':
            return RejectPacket.fromRaw(data);
        case 'mempool':
            return MempoolPacket.fromRaw(data);
        case 'filterload':
            return FilterLoadPacket.fromRaw(data);
        case 'filteradd':
            return FilterAddPacket.fromRaw(data);
        case 'filterclear':
            return FilterClearPacket.fromRaw(data);
        case 'merkleblock':
            return MerkleBlockPacket.fromRaw(data);
        case 'feefilter':
            return FeeFilterPacket.fromRaw(data);
        case 'sendcmpct':
            return SendCmpctPacket.fromRaw(data);
        case 'cmpctblock':
            return CmpctBlockPacket.fromRaw(data);
        case 'getblocktxn':
            return GetBlockTxnPacket.fromRaw(data);
        case 'blocktxn':
            return BlockTxnPacket.fromRaw(data);
        default:
            return UnknownPacket.fromRaw(cmd, data);
    }
};
/*
 * Expose
 */
exports.Packet = Packet;
exports.VersionPacket = VersionPacket;
exports.VerackPacket = VerackPacket;
exports.PingPacket = PingPacket;
exports.PongPacket = PongPacket;
exports.GetAddrPacket = GetAddrPacket;
exports.AddrPacket = AddrPacket;
exports.InvPacket = InvPacket;
exports.GetDataPacket = GetDataPacket;
exports.NotFoundPacket = NotFoundPacket;
exports.GetBlocksPacket = GetBlocksPacket;
exports.GetHeadersPacket = GetHeadersPacket;
exports.HeadersPacket = HeadersPacket;
exports.SendHeadersPacket = SendHeadersPacket;
exports.BlockPacket = BlockPacket;
exports.TXPacket = TXPacket;
exports.RejectPacket = RejectPacket;
exports.MempoolPacket = MempoolPacket;
exports.FilterLoadPacket = FilterLoadPacket;
exports.FilterAddPacket = FilterAddPacket;
exports.FilterClearPacket = FilterClearPacket;
exports.MerkleBlockPacket = MerkleBlockPacket;
exports.FeeFilterPacket = FeeFilterPacket;
exports.SendCmpctPacket = SendCmpctPacket;
exports.CmpctBlockPacket = CmpctBlockPacket;
exports.GetBlockTxnPacket = GetBlockTxnPacket;
exports.BlockTxnPacket = BlockTxnPacket;
exports.UnknownPacket = UnknownPacket;
