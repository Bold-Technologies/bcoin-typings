/*!
 * address.js - address object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var base58 = require('bcrypto/lib/encoding/base58');
var bech32 = require('bcrypto/lib/encoding/bech32');
var bech32m = require('bcrypto/lib/encoding/bech32m');
var sha256 = require('bcrypto/lib/sha256');
var hash160 = require('bcrypto/lib/hash160');
var hash256 = require('bcrypto/lib/hash256');
var Network = require('../protocol/network');
var consensus = require('../protocol/consensus');
var inspectSymbol = require('../utils').inspectSymbol;
/*
 * Constants
 */
var ZERO_HASH160 = Buffer.alloc(20, 0x00);
/**
 * Address
 * Represents an address.
 * @alias module:primitives.Address
 * @property {Buffer} hash
 * @property {AddressPrefix} type
 * @property {Number} version
 */
var Address = /** @class */ (function () {
    /**
     * Create an address.
     * @constructor
     * @param {Object?} options
     */
    function Address(options, network) {
        this.type = Address.types.PUBKEYHASH;
        this.version = -1;
        this.hash = ZERO_HASH160;
        if (options)
            this.fromOptions(options, network);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Address.prototype.fromOptions = function (options, network) {
        if (typeof options === 'string')
            return this.fromString(options, network);
        assert(options);
        var hash = options.hash, type = options.type, version = options.version;
        return this.fromHash(hash, type, version);
    };
    /**
     * Insantiate address from options.
     * @param {Object} options
     * @returns {Address}
     */
    Address.fromOptions = function (options, network) {
        return new this().fromOptions(options, network);
    };
    /**
     * Get the address hash.
     * @param {String?} enc - Can be `"hex"` or `null`.
     * @returns {Hash|Buffer}
     */
    Address.prototype.getHash = function (enc) {
        if (enc === 'hex')
            return this.hash.toString('hex');
        return this.hash;
    };
    /**
     * Test whether the address is null.
     * @returns {Boolean}
     */
    Address.prototype.isNull = function () {
        if (this.hash.length === 20)
            return this.hash.equals(ZERO_HASH160);
        if (this.hash.length === 32)
            return this.hash.equals(consensus.ZERO_HASH);
        for (var i = 0; i < this.hash.length; i++) {
            if (this.hash[i] !== 0)
                return false;
        }
        return true;
    };
    /**
     * Test equality against another address.
     * @param {Address} addr
     * @returns {Boolean}
     */
    Address.prototype.equals = function (addr) {
        assert(addr instanceof Address);
        return this.type === addr.type
            && this.version === addr.version
            && this.hash.equals(addr.hash);
    };
    /**
     * Get the address type as a string.
     * @returns {String}
     */
    Address.prototype.getType = function () {
        return Address.typesByVal[this.type].toLowerCase();
    };
    /**
     * Get prefix for indexers
     * It's a single byte encoded as follows:
     *  1 bit whether it's legacy or witness.
     *  7 bits used for the data.
     * @param {Network|String} network
     * @returns {Number}
     */
    Address.prototype.getPrefix = function (network) {
        if (this.isProgram())
            return this.version;
        // Note: -1 | 0x80 = -1
        return 0x80 | this.getBase58Prefix(network);
    };
    /**
     * Get a network address prefix for the address.
     * @param {Network?} network
     * @returns {Number}
     */
    Address.prototype.getBase58Prefix = function (network) {
        network = Network.get(network);
        var prefixes = network.addressPrefix;
        switch (this.type) {
            case Address.types.PUBKEYHASH:
                return prefixes.pubkeyhash;
            case Address.types.SCRIPTHASH:
                return prefixes.scripthash;
        }
        return -1;
    };
    /**
     * Calculate size of serialized address.
     * @returns {Number}
     */
    Address.prototype.getSize = function () {
        var size = 5 + this.hash.length;
        if (this.version !== -1)
            size += 2;
        return size;
    };
    /**
     * Compile the address object to its raw serialization.
     * @param {{NetworkType|Network)?} network
     * @returns {Buffer}
     * @throws Error on bad hash/prefix.
     */
    Address.prototype.toRaw = function (network) {
        var size = this.getSize();
        var bw = bio.write(size);
        var prefix = this.getBase58Prefix(network);
        assert(prefix !== -1, 'Not a valid address prefix.');
        bw.writeU8(prefix);
        if (this.version !== -1) {
            bw.writeU8(this.version);
            bw.writeU8(0);
        }
        bw.writeBytes(this.hash);
        bw.writeChecksum(hash256.digest);
        return bw.render();
    };
    /**
     * Compile the address object to a base58 address.
     * @param {{NetworkType|Network)?} network
     * @returns {AddressString}
     * @throws Error on bad hash/prefix.
     */
    Address.prototype.toBase58 = function (network) {
        return base58.encode(this.toRaw(network));
    };
    /**
     * Compile the address object to a bech32 address.
     * @param {{NetworkType|Network)?} network
     * @returns {String}
     * @throws Error on bad hash/prefix.
     */
    Address.prototype.toBech32 = function (network) {
        var version = this.version;
        var hash = this.hash;
        assert(version !== -1, 'Cannot convert non-program address to bech32.');
        assert(version === 0, 'Cannot convert program version > 0 to bech32 address.');
        network = Network.get(network);
        var hrp = network.addressPrefix.bech32;
        return bech32.encode(hrp, version, hash);
    };
    /**
     * Compile the address object to a bech32m address.
     * @param {{NetworkType|Network)?} network
     * @returns {String}
     * @throws Error on bad hash/prefix.
     */
    Address.prototype.toBech32m = function (network) {
        var version = this.version;
        var hash = this.hash;
        assert(version !== -1, 'Cannot convert non-program address to bech32m.');
        assert(version !== 0, 'Cannot convert version 0 program to bech32m address.');
        network = Network.get(network);
        var hrp = network.addressPrefix.bech32;
        return bech32m.encode(hrp, version, hash);
    };
    /**
     * Inject properties from string.
     * @private
     * @param {String} addr
     * @param {(Network|NetworkType)?} network
     * @returns {Address}
     */
    Address.prototype.fromString = function (addr, network) {
        assert(typeof addr === 'string');
        assert(addr.length > 0);
        assert(addr.length <= 100);
        // If the address is mixed case,
        // it can only ever be base58.
        if (isMixedCase(addr))
            return this.fromBase58(addr, network);
        // Otherwise, it's most likely bech32.
        try {
            try {
                return this.fromBech32(addr, network);
            }
            catch (e) {
                return this.fromBech32m(addr, network);
            }
        }
        catch (e) {
            return this.fromBase58(addr, network);
        }
    };
    /**
     * Instantiate address from string.
     * @param {String} addr
     * @param {(Network|NetworkType)?} network
     * @returns {Address}
     */
    Address.fromString = function (addr, network) {
        return new this().fromString(addr, network);
    };
    /**
     * Convert the Address to a string.
     * @param {(Network|NetworkType)?} network
     * @returns {AddressString}
     */
    Address.prototype.toString = function (network) {
        if (this.version !== -1) {
            if (this.version === 0)
                return this.toBech32(network);
            return this.toBech32m(network);
        }
        return this.toBase58(network);
    };
    /**
     * Inspect the Address.
     * @returns {Object}
     */
    Address.prototype[inspectSymbol] = function () {
        return '<Address:'
            + " type=".concat(this.getType())
            + " version=".concat(this.version)
            + " str=".concat(this.toString())
            + '>';
    };
    /**
     * Decode base58.
     * @private
     * @param {Buffer} data
     * @throws Parse error
     */
    Address.prototype.fromRaw = function (data, network) {
        var br = bio.read(data, true);
        var prefix = br.readU8();
        network = Network.fromBase58(prefix, network);
        var type = Address.getType(prefix, network);
        if (data.length !== 25)
            throw new Error('Address is too long.');
        var hash = br.readBytes(br.left() - 4);
        br.verifyChecksum(hash256.digest);
        return this.fromHash(hash, type);
    };
    /**
     * Create an address object from a serialized address.
     * @param {Buffer} data
     * @returns {Address}
     * @throws Parse error.
     */
    Address.fromRaw = function (data, network) {
        return new this().fromRaw(data, network);
    };
    /**
     * Inject properties from base58 address.
     * @private
     * @param {AddressString} data
     * @param {Network?} network
     * @throws Parse error
     */
    Address.prototype.fromBase58 = function (data, network) {
        assert(typeof data === 'string');
        if (data.length > 55)
            throw new Error('Address is too long.');
        return this.fromRaw(base58.decode(data), network);
    };
    /**
     * Create an address object from a base58 address.
     * @param {AddressString} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    Address.fromBase58 = function (data, network) {
        return new this().fromBase58(data, network);
    };
    /**
     * Inject properties from bech32 address.
     * @private
     * @param {String} data
     * @param {Network?} network
     * @throws Parse error
     */
    Address.prototype.fromBech32 = function (data, network) {
        var type = Address.types.WITNESS;
        assert(typeof data === 'string');
        var _a = bech32.decode(data), hrp = _a[0], version = _a[1], hash = _a[2];
        assert(version !== -1, 'Cannot convert non-program address to bech32');
        assert(version === 0, 'Cannot convert program version > 0 to bech32');
        // make sure HRP is correct.
        Network.fromBech32(hrp, network);
        return this.fromHash(hash, type, version);
    };
    /**
     * Create an address object from a bech32 address.
     * @param {String} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    Address.fromBech32 = function (data, network) {
        return new this().fromBech32(data, network);
    };
    /**
     * Inject properties from bech32m address.
     * @private
     * @param {String} data
     * @param {Network?} network
     * @throws Parse error
     */
    Address.prototype.fromBech32m = function (data, network) {
        var type = Address.types.WITNESS;
        assert(typeof data === 'string');
        var _a = bech32m.decode(data), hrp = _a[0], version = _a[1], hash = _a[2];
        assert(version !== -1, 'Cannot convert non-program address to bech32m');
        assert(version > 0, 'Cannot convert program version 0 to bech32m.');
        // make sure HRP is correct.
        Network.fromBech32m(hrp, network);
        return this.fromHash(hash, type, version);
    };
    /**
     * Create an address object from a bech32m address.
     * @param {String} data
     * @param {Network?} network
     * @returns {Address}
     * @throws Parse error.
     */
    Address.fromBech32m = function (data, network) {
        return new this().fromBech32m(data, network);
    };
    /**
     * Inject properties from output script.
     * @private
     * @param {Script} script
     */
    Address.prototype.fromScript = function (script) {
        var pk = script.getPubkey();
        if (pk) {
            this.hash = hash160.digest(pk);
            this.type = Address.types.PUBKEYHASH;
            this.version = -1;
            return this;
        }
        var pkh = script.getPubkeyhash();
        if (pkh) {
            this.hash = pkh;
            this.type = Address.types.PUBKEYHASH;
            this.version = -1;
            return this;
        }
        var sh = script.getScripthash();
        if (sh) {
            this.hash = sh;
            this.type = Address.types.SCRIPTHASH;
            this.version = -1;
            return this;
        }
        var program = script.getProgram();
        if (program && !program.isMalformed()) {
            this.hash = program.data;
            this.type = Address.types.WITNESS;
            this.version = program.version;
            return this;
        }
        // Put this last: it's the slowest to check.
        if (script.isMultisig()) {
            this.hash = script.hash160();
            this.type = Address.types.SCRIPTHASH;
            this.version = -1;
            return this;
        }
        return null;
    };
    /**
     * Inject properties from witness.
     * @private
     * @param {Witness} witness
     */
    Address.prototype.fromWitness = function (witness) {
        var _a = witness.getPubkeyhashInput(), pk = _a[1];
        // We're pretty much screwed here
        // since we can't get the version.
        if (pk) {
            this.hash = hash160.digest(pk);
            this.type = Address.types.WITNESS;
            this.version = 0;
            return this;
        }
        var redeem = witness.getScripthashInput();
        if (redeem) {
            this.hash = sha256.digest(redeem);
            this.type = Address.types.WITNESS;
            this.version = 0;
            return this;
        }
        return null;
    };
    /**
     * Inject properties from input script.
     * @private
     * @param {Script} script
     */
    Address.prototype.fromInputScript = function (script) {
        var _a = script.getPubkeyhashInput(), pk = _a[1];
        if (pk) {
            this.hash = hash160.digest(pk);
            this.type = Address.types.PUBKEYHASH;
            this.version = -1;
            return this;
        }
        var redeem = script.getScripthashInput();
        if (redeem) {
            this.hash = hash160.digest(redeem);
            this.type = Address.types.SCRIPTHASH;
            this.version = -1;
            return this;
        }
        return null;
    };
    /**
     * Create an Address from a witness.
     * Attempt to extract address
     * properties from a witness.
     * @param {Witness}
     * @returns {Address|null}
     */
    Address.fromWitness = function (witness) {
        return new this().fromWitness(witness);
    };
    /**
     * Create an Address from an input script.
     * Attempt to extract address
     * properties from an input script.
     * @param {Script}
     * @returns {Address|null}
     */
    Address.fromInputScript = function (script) {
        return new this().fromInputScript(script);
    };
    /**
     * Create an Address from an output script.
     * Parse an output script and extract address
     * properties. Converts pubkey and multisig
     * scripts to pubkeyhash and scripthash addresses.
     * @param {Script}
     * @returns {Address|null}
     */
    Address.fromScript = function (script) {
        return new this().fromScript(script);
    };
    /**
     * Inject properties from a hash.
     * @private
     * @param {Buffer|Hash} hash
     * @param {AddressPrefix} type
     * @param {Number} [version=-1]
     * @throws on bad hash size
     */
    Address.prototype.fromHash = function (hash, type, version) {
        if (typeof type === 'string') {
            type = Address.types[type.toUpperCase()];
            assert(type != null, 'Not a valid address type.');
        }
        if (type == null)
            type = Address.types.PUBKEYHASH;
        if (version == null)
            version = -1;
        assert(Buffer.isBuffer(hash));
        assert((type >>> 0) === type);
        assert((version | 0) === version);
        assert(type >= Address.types.PUBKEYHASH && type <= Address.types.WITNESS, 'Not a valid address type.');
        if (version === -1) {
            assert(type !== Address.types.WITNESS, 'Wrong version (witness)');
            assert(hash.length === 20, 'Hash is the wrong size.');
        }
        else {
            assert(type === Address.types.WITNESS, 'Wrong version (non-witness).');
            assert(version >= 0 && version <= 16, 'Bad program version.');
            if (version === 0) {
                assert(hash.length === 20 || hash.length === 32, 'Witness version 0 program hash is the wrong size.');
            }
            assert(hash.length >= 2 && hash.length <= 40, 'Hash is the wrong size.');
        }
        this.hash = hash;
        this.type = type;
        this.version = version;
        return this;
    };
    /**
     * Create a naked address from hash/type/version.
     * @param {Hash} hash
     * @param {AddressPrefix} type
     * @param {Number} [version=-1]
     * @returns {Address}
     * @throws on bad hash size
     */
    Address.fromHash = function (hash, type, version) {
        return new this().fromHash(hash, type, version);
    };
    /**
     * Inject properties from pubkeyhash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.prototype.fromPubkeyhash = function (hash) {
        var type = Address.types.PUBKEYHASH;
        assert(hash.length === 20, 'P2PKH must be 20 bytes.');
        return this.fromHash(hash, type, -1);
    };
    /**
     * Instantiate address from pubkeyhash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.fromPubkeyhash = function (hash) {
        return new this().fromPubkeyhash(hash);
    };
    /**
     * Inject properties from scripthash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.prototype.fromScripthash = function (hash) {
        var type = Address.types.SCRIPTHASH;
        assert(hash && hash.length === 20, 'P2SH must be 20 bytes.');
        return this.fromHash(hash, type, -1);
    };
    /**
     * Instantiate address from scripthash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.fromScripthash = function (hash) {
        return new this().fromScripthash(hash);
    };
    /**
     * Inject properties from witness pubkeyhash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.prototype.fromWitnessPubkeyhash = function (hash) {
        var type = Address.types.WITNESS;
        assert(hash && hash.length === 20, 'P2WPKH must be 20 bytes.');
        return this.fromHash(hash, type, 0);
    };
    /**
     * Instantiate address from witness pubkeyhash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.fromWitnessPubkeyhash = function (hash) {
        return new this().fromWitnessPubkeyhash(hash);
    };
    /**
     * Inject properties from witness scripthash.
     * @private
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.prototype.fromWitnessScripthash = function (hash) {
        var type = Address.types.WITNESS;
        assert(hash && hash.length === 32, 'P2WPKH must be 32 bytes.');
        return this.fromHash(hash, type, 0);
    };
    /**
     * Instantiate address from witness scripthash.
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.fromWitnessScripthash = function (hash) {
        return new this().fromWitnessScripthash(hash);
    };
    /**
     * Inject properties from witness program.
     * @private
     * @param {Number} version
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.prototype.fromProgram = function (version, hash) {
        var type = Address.types.WITNESS;
        assert(version >= 0, 'Bad version for witness program.');
        return this.fromHash(hash, type, version);
    };
    /**
     * Instantiate address from witness program.
     * @param {Number} version
     * @param {Buffer} hash
     * @returns {Address}
     */
    Address.fromProgram = function (version, hash) {
        return new this().fromProgram(version, hash);
    };
    /**
     * Test whether the address is pubkeyhash.
     * @returns {Boolean}
     */
    Address.prototype.isPubkeyhash = function () {
        return this.type === Address.types.PUBKEYHASH;
    };
    /**
     * Test whether the address is scripthash.
     * @returns {Boolean}
     */
    Address.prototype.isScripthash = function () {
        return this.type === Address.types.SCRIPTHASH;
    };
    /**
     * Test whether the address is witness pubkeyhash.
     * @returns {Boolean}
     */
    Address.prototype.isWitnessPubkeyhash = function () {
        return this.version === 0 && this.hash.length === 20;
    };
    /**
     * Test whether the address is witness scripthash.
     * @returns {Boolean}
     */
    Address.prototype.isWitnessScripthash = function () {
        return this.version === 0 && this.hash.length === 32;
    };
    /**
     * Test whether the address is a witness program.
     * @returns {Boolean}
     */
    Address.prototype.isProgram = function () {
        return this.version !== -1;
    };
    /**
     * Get the hash of a base58 address or address-related object.
     * @param {String|Address|Hash} data
     * @param {String?} enc - Can be `"hex"` or `null`.
     * @returns {Hash}
     */
    Address.getHash = function (data, enc) {
        if (!data)
            throw new Error('Object is not an address.');
        var hash;
        if (Buffer.isBuffer(data)) {
            hash = data;
        }
        else if (data instanceof Address) {
            hash = data.hash;
        }
        else {
            throw new Error('Object is not an address.');
        }
        if (enc === 'hex')
            return hash.toString('hex');
        return hash;
    };
    /**
     * Get an address type for a specified network address prefix.
     * @param {Number} prefix
     * @param {Network} network
     * @returns {AddressType}
     */
    Address.getType = function (prefix, network) {
        var prefixes = network.addressPrefix;
        switch (prefix) {
            case prefixes.pubkeyhash:
                return Address.types.PUBKEYHASH;
            case prefixes.scripthash:
                return Address.types.SCRIPTHASH;
            default:
                throw new Error('Unknown address prefix.');
        }
    };
    return Address;
}());
/**
 * Address types.
 * @enum {Number}
 */
Address.types = {
    PUBKEYHASH: 0,
    SCRIPTHASH: 1,
    WITNESS: 2
};
/**
 * Address types by value.
 * @const {Object}
 */
Address.typesByVal = [
    'PUBKEYHASH',
    'SCRIPTHASH',
    'WITNESS'
];
/*
 * Helpers
 */
function isMixedCase(str) {
    var lower = false;
    var upper = false;
    for (var i = 0; i < str.length; i++) {
        var ch = str.charCodeAt(i);
        if (ch >= 0x30 && ch <= 0x39)
            continue;
        if (ch & 32) {
            assert(ch >= 0x61 && ch <= 0x7a);
            lower = true;
        }
        else {
            assert(ch >= 0x41 && ch <= 0x5a);
            upper = true;
        }
        if (lower && upper)
            return true;
    }
    return false;
}
/*
 * Expose
 */
module.exports = Address;
