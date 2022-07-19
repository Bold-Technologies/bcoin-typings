/*!
 * keyring.js - keyring object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var base58 = require('bcrypto/lib/encoding/base58');
var bio = require('bufio');
var hash160 = require('bcrypto/lib/hash160');
var hash256 = require('bcrypto/lib/hash256');
var Network = require('../protocol/network');
var Script = require('../script/script');
var Address = require('./address');
var Output = require('./output');
var secp256k1 = require('bcrypto/lib/secp256k1');
var encoding = bio.encoding;
var inspectSymbol = require('../utils').inspectSymbol;
/*
 * Constants
 */
var ZERO_KEY = Buffer.alloc(33, 0x00);
/**
 * Key Ring
 * Represents a key ring which amounts to an address.
 * @alias module:primitives.KeyRing
 */
var KeyRing = /** @class */ (function () {
    /**
     * Create a key ring.
     * @constructor
     * @param {Object} options
     */
    function KeyRing(options) {
        this.witness = false;
        this.nested = false;
        this.publicKey = ZERO_KEY;
        this.privateKey = null;
        this.script = null;
        this._keyHash = null;
        this._keyAddress = null;
        this._program = null;
        this._nestedHash = null;
        this._nestedAddress = null;
        this._scriptHash160 = null;
        this._scriptHash256 = null;
        this._scriptAddress = null;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    KeyRing.prototype.fromOptions = function (options) {
        var key = toKey(options);
        if (options.witness != null) {
            assert(typeof options.witness === 'boolean');
            this.witness = options.witness;
        }
        if (options.nested != null) {
            assert(typeof options.nested === 'boolean');
            this.nested = options.nested;
        }
        if (Buffer.isBuffer(key))
            return this.fromKey(key);
        key = toKey(options.key);
        if (options.publicKey)
            key = toKey(options.publicKey);
        if (options.privateKey)
            key = toKey(options.privateKey);
        var script = options.script;
        var compress = options.compressed;
        if (script)
            return this.fromScript(key, script, compress);
        return this.fromKey(key, compress);
    };
    /**
     * Instantiate key ring from options.
     * @param {Object} options
     * @returns {KeyRing}
     */
    KeyRing.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clear cached key/script hashes.
     */
    KeyRing.prototype.refresh = function () {
        this._keyHash = null;
        this._keyAddress = null;
        this._program = null;
        this._nestedHash = null;
        this._nestedAddress = null;
        this._scriptHash160 = null;
        this._scriptHash256 = null;
        this._scriptAddress = null;
    };
    /**
     * Inject data from private key.
     * @private
     * @param {Buffer} key
     * @param {Boolean?} compress
     */
    KeyRing.prototype.fromPrivate = function (key, compress) {
        assert(Buffer.isBuffer(key), 'Private key must be a buffer.');
        assert(secp256k1.privateKeyVerify(key), 'Not a valid private key.');
        this.privateKey = key;
        this.publicKey = secp256k1.publicKeyCreate(key, compress !== false);
        return this;
    };
    /**
     * Instantiate keyring from a private key.
     * @param {Buffer} key
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    KeyRing.fromPrivate = function (key, compress) {
        return new this().fromPrivate(key, compress);
    };
    /**
     * Inject data from public key.
     * @private
     * @param {Buffer} key
     */
    KeyRing.prototype.fromPublic = function (key) {
        assert(Buffer.isBuffer(key), 'Public key must be a buffer.');
        assert(secp256k1.publicKeyVerify(key), 'Not a valid public key.');
        this.publicKey = key;
        return this;
    };
    /**
     * Generate a keyring.
     * @private
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    KeyRing.prototype.generate = function (compress) {
        var key = secp256k1.privateKeyGenerate();
        return this.fromKey(key, compress);
    };
    /**
     * Generate a keyring.
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    KeyRing.generate = function (compress) {
        return new this().generate(compress);
    };
    /**
     * Instantiate keyring from a public key.
     * @param {Buffer} publicKey
     * @returns {KeyRing}
     */
    KeyRing.fromPublic = function (key) {
        return new this().fromPublic(key);
    };
    /**
     * Inject data from public key.
     * @private
     * @param {Buffer} privateKey
     * @param {Boolean?} compress
     */
    KeyRing.prototype.fromKey = function (key, compress) {
        assert(Buffer.isBuffer(key), 'Key must be a buffer.');
        if (key.length === 32)
            return this.fromPrivate(key, compress !== false);
        return this.fromPublic(key);
    };
    /**
     * Instantiate keyring from a public key.
     * @param {Buffer} publicKey
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    KeyRing.fromKey = function (key, compress) {
        return new this().fromKey(key, compress);
    };
    /**
     * Inject data from script.
     * @private
     * @param {Buffer} key
     * @param {Script} script
     * @param {Boolean?} compress
     */
    KeyRing.prototype.fromScript = function (key, script, compress) {
        assert(script instanceof Script, 'Non-script passed into KeyRing.');
        this.fromKey(key, compress);
        this.script = script;
        return this;
    };
    /**
     * Instantiate keyring from script.
     * @param {Buffer} key
     * @param {Script} script
     * @param {Boolean?} compress
     * @returns {KeyRing}
     */
    KeyRing.fromScript = function (key, script, compress) {
        return new this().fromScript(key, script, compress);
    };
    /**
     * Get ith public key from multisig script.
     * @private
     * @param {Script} script
     * @param {Number} i
     * @returns {KeyRing}
     */
    KeyRing.prototype.fromMultisigScript = function (script, i) {
        assert(script instanceof Script, 'Non-script passed.');
        assert(script.isMultisig(), 'Script must be multisig');
        var n = script.getSmall(-2);
        assert(i >= 1 && i <= n, 'Requested `i`th key, `n` available');
        this.fromKey(script.code[i].toData());
        return this;
    };
    /**
     * Instantiate keyring from ith key in multisig script.
     * @param {Script} script
     * @param {Number} i
     * @returns {KeyRing}
     */
    KeyRing.fromMultisigScript = function (script, i) {
        return new this().fromMultisigScript(script, i);
    };
    /**
     * Calculate WIF serialization size.
     * @returns {Number}
     */
    KeyRing.prototype.getSecretSize = function () {
        var size = 0;
        size += 1;
        size += this.privateKey.length;
        if (this.publicKey.length === 33)
            size += 1;
        size += 4;
        return size;
    };
    /**
     * Convert key to a CBitcoinSecret.
     * @param {(Network|NetworkType)?} network
     * @returns {Base58String}
     */
    KeyRing.prototype.toSecret = function (network) {
        var size = this.getSecretSize();
        var bw = bio.write(size);
        assert(this.privateKey, 'Cannot serialize without private key.');
        network = Network.get(network);
        bw.writeU8(network.keyPrefix.privkey);
        bw.writeBytes(this.privateKey);
        if (this.publicKey.length === 33)
            bw.writeU8(1);
        bw.writeChecksum(hash256.digest);
        return base58.encode(bw.render());
    };
    /**
     * Inject properties from serialized CBitcoinSecret.
     * @private
     * @param {Base58String} secret
     * @param {(Network|NetworkType)?} network
     */
    KeyRing.prototype.fromSecret = function (data, network) {
        var br = bio.read(base58.decode(data), true);
        var version = br.readU8();
        Network.fromWIF(version, network);
        var key = br.readBytes(32);
        var compress = false;
        if (br.left() > 4) {
            assert(br.readU8() === 1, 'Bad compression flag.');
            compress = true;
        }
        br.verifyChecksum(hash256.digest);
        return this.fromPrivate(key, compress);
    };
    /**
     * Instantiate a keyring from a serialized CBitcoinSecret.
     * @param {Base58String} secret
     * @param {(Network|NetworkType)?} network
     * @returns {KeyRing}
     */
    KeyRing.fromSecret = function (data, network) {
        return new this().fromSecret(data, network);
    };
    /**
     * Get private key.
     * @param {String?} enc - Can be `"hex"`, `"base58"`, or `null`.
     * @returns {Buffer} Private key.
     */
    KeyRing.prototype.getPrivateKey = function (enc, network) {
        if (!this.privateKey)
            return null;
        if (enc === 'base58')
            return this.toSecret(network);
        if (enc === 'hex')
            return this.privateKey.toString('hex');
        return this.privateKey;
    };
    /**
     * Get public key.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getPublicKey = function (enc) {
        if (enc === 'base58')
            return base58.encode(this.publicKey);
        if (enc === 'hex')
            return this.publicKey.toString('hex');
        return this.publicKey;
    };
    /**
     * Get redeem script.
     * @returns {Script}
     */
    KeyRing.prototype.getScript = function () {
        return this.script;
    };
    /**
     * Get witness program.
     * @returns {Buffer}
     */
    KeyRing.prototype.getProgram = function () {
        if (!this.witness)
            return null;
        if (!this._program) {
            var program = void 0;
            if (!this.script) {
                var hash = hash160.digest(this.publicKey);
                program = Script.fromProgram(0, hash);
            }
            else {
                var hash = this.script.sha256();
                program = Script.fromProgram(0, hash);
            }
            this._program = program;
        }
        return this._program;
    };
    /**
     * Get address' ripemd160 program scripthash
     * (for witness programs behind a scripthash).
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getNestedHash = function (enc) {
        if (!this.witness)
            return null;
        if (!this._nestedHash)
            this._nestedHash = this.getProgram().hash160();
        return enc === 'hex'
            ? this._nestedHash.toString('hex')
            : this._nestedHash;
    };
    /**
     * Get address' scripthash address for witness program.
     * @param {String?} enc - `"base58"` or `null`.
     * @returns {Address|AddressString}
     */
    KeyRing.prototype.getNestedAddress = function (enc, network) {
        if (!this.witness)
            return null;
        if (!this._nestedAddress) {
            var hash = this.getNestedHash();
            var addr = Address.fromScripthash(hash);
            this._nestedAddress = addr;
        }
        if (enc === 'base58')
            return this._nestedAddress.toBase58(network);
        if (enc === 'string')
            return this._nestedAddress.toString(network);
        return this._nestedAddress;
    };
    /**
     * Get scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getScriptHash = function (enc) {
        if (this.witness)
            return this.getScriptHash256(enc);
        return this.getScriptHash160(enc);
    };
    /**
     * Get ripemd160 scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getScriptHash160 = function (enc) {
        if (!this.script)
            return null;
        if (!this._scriptHash160)
            this._scriptHash160 = this.script.hash160();
        return enc === 'hex'
            ? this._scriptHash160.toString('hex')
            : this._scriptHash160;
    };
    /**
     * Get sha256 scripthash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getScriptHash256 = function (enc) {
        if (!this.script)
            return null;
        if (!this._scriptHash256)
            this._scriptHash256 = this.script.sha256();
        return enc === 'hex'
            ? this._scriptHash256.toString('hex')
            : this._scriptHash256;
    };
    /**
     * Get scripthash address.
     * @param {String?} enc - `"base58"` or `null`.
     * @returns {Address|AddressString}
     */
    KeyRing.prototype.getScriptAddress = function (enc, network) {
        if (!this.script)
            return null;
        if (!this._scriptAddress) {
            var addr = void 0;
            if (this.witness) {
                var hash = this.getScriptHash256();
                addr = Address.fromWitnessScripthash(hash);
            }
            else {
                var hash = this.getScriptHash160();
                addr = Address.fromScripthash(hash);
            }
            this._scriptAddress = addr;
        }
        if (enc === 'base58')
            return this._scriptAddress.toBase58(network);
        if (enc === 'string')
            return this._scriptAddress.toString(network);
        return this._scriptAddress;
    };
    /**
     * Get public key hash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getKeyHash = function (enc) {
        if (!this._keyHash)
            this._keyHash = hash160.digest(this.publicKey);
        return enc === 'hex'
            ? this._keyHash.toString('hex')
            : this._keyHash;
    };
    /**
     * Get pubkeyhash address.
     * @param {String?} enc - `"base58"` or `null`.
     * @returns {Address|AddressString}
     */
    KeyRing.prototype.getKeyAddress = function (enc, network) {
        if (!this._keyAddress) {
            var hash = this.getKeyHash();
            var addr = void 0;
            if (this.witness)
                addr = Address.fromWitnessPubkeyhash(hash);
            else
                addr = Address.fromPubkeyhash(hash);
            this._keyAddress = addr;
        }
        if (enc === 'base58')
            return this._keyAddress.toBase58(network);
        if (enc === 'string')
            return this._keyAddress.toString(network);
        return this._keyAddress;
    };
    /**
     * Get hash.
     * @param {String?} enc - `"hex"` or `null`.
     * @returns {Buffer}
     */
    KeyRing.prototype.getHash = function (enc) {
        if (this.nested)
            return this.getNestedHash(enc);
        if (this.script)
            return this.getScriptHash(enc);
        return this.getKeyHash(enc);
    };
    /**
     * Get base58 address.
     * @param {String?} enc - `"base58"` or `null`.
     * @returns {Address|AddressString}
     */
    KeyRing.prototype.getAddress = function (enc, network) {
        if (this.nested)
            return this.getNestedAddress(enc, network);
        if (this.script)
            return this.getScriptAddress(enc, network);
        return this.getKeyAddress(enc, network);
    };
    /**
     * Test an address hash against hash and program hash.
     * @param {Buffer} hash
     * @returns {Boolean}
     */
    KeyRing.prototype.ownHash = function (hash) {
        if (!hash)
            return false;
        if (hash.equals(this.getKeyHash()))
            return true;
        if (this.script) {
            if (hash.equals(this.getScriptHash()))
                return true;
        }
        if (this.witness) {
            if (hash.equals(this.getNestedHash()))
                return true;
        }
        return false;
    };
    /**
     * Check whether transaction output belongs to this address.
     * @param {TX|Output} tx - Transaction or Output.
     * @param {Number?} index - Output index.
     * @returns {Boolean}
     */
    KeyRing.prototype.ownOutput = function (tx, index) {
        var output;
        if (tx instanceof Output) {
            output = tx;
        }
        else {
            output = tx.outputs[index];
            assert(output, 'Output does not exist.');
        }
        return this.ownHash(output.getHash());
    };
    /**
     * Test a hash against script hashes to
     * find the correct redeem script, if any.
     * @param {Buffer} hash
     * @returns {Script|null}
     */
    KeyRing.prototype.getRedeem = function (hash) {
        if (this.witness) {
            if (hash.equals(this.getNestedHash()))
                return this.getProgram();
        }
        if (this.script) {
            if (hash.equals(this.getScriptHash160()))
                return this.script;
            if (hash.equals(this.getScriptHash256()))
                return this.script;
        }
        return null;
    };
    /**
     * Sign a message.
     * @param {Buffer} msg
     * @returns {Buffer} Signature in DER format.
     */
    KeyRing.prototype.sign = function (msg) {
        assert(this.privateKey, 'Cannot sign without private key.');
        return secp256k1.signDER(msg, this.privateKey);
    };
    /**
     * Verify a message.
     * @param {Buffer} msg
     * @param {Buffer} sig - Signature in DER format.
     * @returns {Boolean}
     */
    KeyRing.prototype.verify = function (msg, sig) {
        return secp256k1.verifyDER(msg, sig, this.publicKey);
    };
    /**
     * Get witness program version.
     * @returns {Number}
     */
    KeyRing.prototype.getVersion = function () {
        if (!this.witness)
            return -1;
        if (this.nested)
            return -1;
        return 0;
    };
    /**
     * Get address type.
     * @returns {ScriptType}
     */
    KeyRing.prototype.getType = function () {
        if (this.nested)
            return Address.types.SCRIPTHASH;
        if (this.witness)
            return Address.types.WITNESS;
        if (this.script)
            return Address.types.SCRIPTHASH;
        return Address.types.PUBKEYHASH;
    };
    /**
     * Inspect keyring.
     * @returns {Object}
     */
    KeyRing.prototype[inspectSymbol] = function () {
        return this.toJSON();
    };
    /**
     * Convert an KeyRing to a more json-friendly object.
     * @returns {Object}
     */
    KeyRing.prototype.toJSON = function (network) {
        return {
            witness: this.witness,
            nested: this.nested,
            publicKey: this.publicKey.toString('hex'),
            script: this.script ? this.script.toRaw().toString('hex') : null,
            program: this.witness ? this.getProgram().toRaw().toString('hex') : null,
            type: Address.typesByVal[this.getType()].toLowerCase(),
            address: this.getAddress('string', network)
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    KeyRing.prototype.fromJSON = function (json) {
        assert(json);
        assert(typeof json.witness === 'boolean');
        assert(typeof json.nested === 'boolean');
        assert(typeof json.publicKey === 'string');
        assert(!json.script || typeof json.script === 'string');
        this.witness = json.witness;
        this.nested = json.nested;
        this.publicKey = Buffer.from(json.publicKey, 'hex');
        if (json.script)
            this.script = Buffer.from(json.script, 'hex');
        return this;
    };
    /**
     * Instantiate an KeyRing from a jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {KeyRing}
     */
    KeyRing.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    KeyRing.prototype.getSize = function () {
        var size = 0;
        size += 1;
        if (this.privateKey) {
            size += encoding.sizeVarBytes(this.privateKey);
            size += 1;
        }
        else {
            size += encoding.sizeVarBytes(this.publicKey);
        }
        size += this.script ? this.script.getVarSize() : 1;
        return size;
    };
    /**
     * Write the keyring to a buffer writer.
     * @param {BufferWriter} bw
     */
    KeyRing.prototype.toWriter = function (bw) {
        var field = 0;
        if (this.witness)
            field |= 1;
        if (this.nested)
            field |= 2;
        bw.writeU8(field);
        if (this.privateKey) {
            bw.writeVarBytes(this.privateKey);
            bw.writeU8(this.publicKey.length === 33 ? 1 : 0);
        }
        else {
            bw.writeVarBytes(this.publicKey);
        }
        if (this.script)
            bw.writeVarBytes(this.script.toRaw());
        else
            bw.writeVarint(0);
        return bw;
    };
    /**
     * Serialize the keyring.
     * @returns {Buffer}
     */
    KeyRing.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    KeyRing.prototype.fromReader = function (br) {
        var field = br.readU8();
        this.witness = (field & 1) !== 0;
        this.nested = (field & 2) !== 0;
        var key = br.readVarBytes();
        if (key.length === 32) {
            var compress = br.readU8() === 1;
            this.privateKey = key;
            this.publicKey = secp256k1.publicKeyCreate(key, compress);
        }
        else {
            this.publicKey = key;
            assert(secp256k1.publicKeyVerify(key), 'Invalid public key.');
        }
        var script = br.readVarBytes();
        if (script.length > 0)
            this.script = Script.fromRaw(script);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    KeyRing.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate a keyring from buffer reader.
     * @param {BufferReader} br
     * @returns {KeyRing}
     */
    KeyRing.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate a keyring from serialized data.
     * @param {Buffer} data
     * @returns {KeyRing}
     */
    KeyRing.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Test whether an object is a KeyRing.
     * @param {Object} obj
     * @returns {Boolean}
     */
    KeyRing.isKeyRing = function (obj) {
        return obj instanceof KeyRing;
    };
    return KeyRing;
}());
/*
 * Helpers
 */
function toKey(opt) {
    if (!opt)
        return opt;
    if (opt.privateKey)
        return opt.privateKey;
    if (opt.publicKey)
        return opt.publicKey;
    return opt;
}
/*
 * Expose
 */
module.exports = KeyRing;
