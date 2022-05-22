/*!
 * tx.js - transaction object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var assert = require('bsert');
var bio = require('bufio');
var hash256 = require('bcrypto/lib/hash256');
var secp256k1 = require('bcrypto/lib/secp256k1');
var BufferSet = require('buffer-map').BufferSet;
var util = require('../utils/util');
var Amount = require('../btc/amount');
var Network = require('../protocol/network');
var Script = require('../script/script');
var Input = require('./input');
var Output = require('./output');
var Outpoint = require('./outpoint');
var InvItem = require('./invitem');
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var ScriptError = require('../script/scripterror');
var encoding = bio.encoding;
var hashType = Script.hashType;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * TX
 * A static transaction object.
 * @alias module:primitives.TX
 * @property {Number} version
 * @property {Input[]} inputs
 * @property {Output[]} outputs
 * @property {Number} locktime
 */
var TX = /** @class */ (function () {
    /**
     * Create a transaction.
     * @constructor
     * @param {Object?} options
     */
    function TX(options) {
        this.version = 1;
        this.inputs = [];
        this.outputs = [];
        this.locktime = 0;
        this.mutable = false;
        this._hash = null;
        this._hhash = null;
        this._whash = null;
        this._raw = null;
        this._offset = -1;
        this._block = false;
        this._size = -1;
        this._witness = -1;
        this._sigops = -1;
        this._hashPrevouts = null;
        this._hashSequence = null;
        this._hashOutputs = null;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    TX.prototype.fromOptions = function (options) {
        assert(options, 'TX data is required.');
        if (options.version != null) {
            assert((options.version >>> 0) === options.version, 'Version must be a uint32.');
            this.version = options.version;
        }
        if (options.inputs) {
            assert(Array.isArray(options.inputs), 'Inputs must be an array.');
            for (var _i = 0, _a = options.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                this.inputs.push(new Input(input));
            }
        }
        if (options.outputs) {
            assert(Array.isArray(options.outputs), 'Outputs must be an array.');
            for (var _b = 0, _c = options.outputs; _b < _c.length; _b++) {
                var output = _c[_b];
                this.outputs.push(new Output(output));
            }
        }
        if (options.locktime != null) {
            assert((options.locktime >>> 0) === options.locktime, 'Locktime must be a uint32.');
            this.locktime = options.locktime;
        }
        return this;
    };
    /**
     * Instantiate TX from options object.
     * @param {Object} options
     * @returns {TX}
     */
    TX.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clone the transaction.
     * @returns {TX}
     */
    TX.prototype.clone = function () {
        return new this.constructor().inject(this);
    };
    /**
     * Inject properties from tx.
     * Used for cloning.
     * @private
     * @param {TX} tx
     * @returns {TX}
     */
    TX.prototype.inject = function (tx) {
        this.version = tx.version;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            this.inputs.push(input.clone());
        }
        for (var _b = 0, _c = tx.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            this.outputs.push(output.clone());
        }
        this.locktime = tx.locktime;
        return this;
    };
    /**
     * Clear any cached values.
     */
    TX.prototype.refresh = function () {
        this._hash = null;
        this._hhash = null;
        this._whash = null;
        this._raw = null;
        this._size = -1;
        this._offset = -1;
        this._block = false;
        this._witness = -1;
        this._sigops = -1;
        this._hashPrevouts = null;
        this._hashSequence = null;
        this._hashOutputs = null;
    };
    /**
     * Hash the transaction with the non-witness serialization.
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    TX.prototype.hash = function (enc) {
        var h = this._hash;
        if (!h) {
            h = hash256.digest(this.toNormal());
            if (!this.mutable)
                this._hash = h;
        }
        if (enc === 'hex') {
            var hex = this._hhash;
            if (!hex) {
                hex = h.toString('hex');
                if (!this.mutable)
                    this._hhash = hex;
            }
            h = hex;
        }
        return h;
    };
    /**
     * Hash the transaction with the witness
     * serialization, return the wtxid (normal
     * hash if no witness is present, all zeroes
     * if coinbase).
     * @param {String?} enc - Can be `'hex'` or `null`.
     * @returns {Hash|Buffer} hash
     */
    TX.prototype.witnessHash = function (enc) {
        if (!this.hasWitness())
            return this.hash(enc);
        var hash = this._whash;
        if (!hash) {
            hash = hash256.digest(this.toRaw());
            if (!this.mutable)
                this._whash = hash;
        }
        return enc === 'hex' ? hash.toString('hex') : hash;
    };
    /**
     * Serialize the transaction. Note
     * that this is cached. This will use
     * the witness serialization if a
     * witness is present.
     * @returns {Buffer} Serialized transaction.
     */
    TX.prototype.toRaw = function () {
        return this.frame().data;
    };
    /**
     * Serialize the transaction without the
     * witness vector, regardless of whether it
     * is a witness transaction or not.
     * @returns {Buffer} Serialized transaction.
     */
    TX.prototype.toNormal = function () {
        if (this.hasWitness())
            return this.frameNormal().data;
        return this.toRaw();
    };
    /**
     * Write the transaction to a buffer writer.
     * @param {BufferWriter} bw
     * @param {Boolean} block
     */
    TX.prototype.toWriter = function (bw, block) {
        if (this.mutable) {
            if (this.hasWitness())
                return this.writeWitness(bw);
            return this.writeNormal(bw);
        }
        if (block) {
            this._offset = bw.offset;
            this._block = true;
        }
        bw.writeBytes(this.toRaw());
        return bw;
    };
    /**
     * Write the transaction to a buffer writer.
     * Uses non-witness serialization.
     * @param {BufferWriter} bw
     */
    TX.prototype.toNormalWriter = function (bw) {
        if (this.hasWitness()) {
            this.writeNormal(bw);
            return bw;
        }
        return this.toWriter(bw);
    };
    /**
     * Serialize the transaction. Note
     * that this is cached. This will use
     * the witness serialization if a
     * witness is present.
     * @private
     * @returns {RawTX}
     */
    TX.prototype.frame = function () {
        if (this.mutable) {
            assert(!this._raw);
            if (this.hasWitness())
                return this.frameWitness();
            return this.frameNormal();
        }
        if (this._raw) {
            assert(this._size >= 0);
            assert(this._witness >= 0);
            var raw_1 = new RawTX(this._size, this._witness);
            raw_1.data = this._raw;
            return raw_1;
        }
        var raw;
        if (this.hasWitness())
            raw = this.frameWitness();
        else
            raw = this.frameNormal();
        this._raw = raw.data;
        this._size = raw.size;
        this._witness = raw.witness;
        return raw;
    };
    /**
     * Return the offset and size of the transaction. Useful
     * when the transaction is deserialized within a block.
     * @returns {Object} Contains `size` and `offset`.
     */
    TX.prototype.getPosition = function () {
        assert(this._block && this._offset > 80, 'Position not available.');
        return {
            offset: this._offset,
            size: this._size
        };
    };
    /**
     * Calculate total size and size of the witness bytes.
     * @returns {Object} Contains `size` and `witness`.
     */
    TX.prototype.getSizes = function () {
        if (this.mutable) {
            if (this.hasWitness())
                return this.getWitnessSizes();
            return this.getNormalSizes();
        }
        return this.frame();
    };
    /**
     * Calculate the virtual size of the transaction.
     * Note that this is cached.
     * @returns {Number} vsize
     */
    TX.prototype.getVirtualSize = function () {
        var scale = consensus.WITNESS_SCALE_FACTOR;
        return (this.getWeight() + scale - 1) / scale | 0;
    };
    /**
     * Calculate the virtual size of the transaction
     * (weighted against bytes per sigop cost).
     * @param {Number} sigops - Sigops cost.
     * @returns {Number} vsize
     */
    TX.prototype.getSigopsSize = function (sigops) {
        var scale = consensus.WITNESS_SCALE_FACTOR;
        var bytes = policy.BYTES_PER_SIGOP;
        var weight = Math.max(this.getWeight(), sigops * bytes);
        return (weight + scale - 1) / scale | 0;
    };
    /**
     * Calculate the weight of the transaction.
     * Note that this is cached.
     * @returns {Number} weight
     */
    TX.prototype.getWeight = function () {
        var raw = this.getSizes();
        var base = raw.size - raw.witness;
        return base * (consensus.WITNESS_SCALE_FACTOR - 1) + raw.size;
    };
    /**
     * Calculate the real size of the transaction
     * with the witness included.
     * @returns {Number} size
     */
    TX.prototype.getSize = function () {
        return this.getSizes().size;
    };
    /**
     * Calculate the size of the transaction
     * without the witness.
     * with the witness included.
     * @returns {Number} size
     */
    TX.prototype.getBaseSize = function () {
        var raw = this.getSizes();
        return raw.size - raw.witness;
    };
    /**
     * Test whether the transaction has a non-empty witness.
     * @returns {Boolean}
     */
    TX.prototype.hasWitness = function () {
        if (this._witness !== -1)
            return this._witness !== 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.witness.items.length > 0)
                return true;
        }
        return false;
    };
    /**
     * Get the signature hash of the transaction for signing verifying.
     * @param {Number} index - Index of input being signed/verified.
     * @param {Script} prev - Previous output script or redeem script
     * (in the case of witnesspubkeyhash, this should be the generated
     * p2pkh script).
     * @param  {SatoshiAmount} value - Previous output value.
     * @param {SighashType} type - Sighash type.
     * @param {Number} version - Sighash version (0=legacy, 1=segwit).
     * @returns {Buffer} Signature hash.
     */
    TX.prototype.signatureHash = function (index, prev, value, type, version) {
        assert(index >= 0 && index < this.inputs.length);
        assert(prev instanceof Script);
        assert(typeof value === 'number');
        assert(typeof type === 'number');
        // Traditional sighashing
        if (version === 0)
            return this.signatureHashV0(index, prev, type);
        // Segwit sighashing
        if (version === 1)
            return this.signatureHashV1(index, prev, value, type);
        throw new Error('Unknown sighash version.');
    };
    /**
     * Legacy sighashing -- O(n^2).
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param {SighashType} type
     * @returns {Buffer}
     */
    TX.prototype.signatureHashV0 = function (index, prev, type) {
        if ((type & 0x1f) === hashType.SINGLE) {
            // Bitcoind used to return 1 as an error code:
            // it ended up being treated like a hash.
            if (index >= this.outputs.length) {
                var hash = Buffer.alloc(32, 0x00);
                hash[0] = 0x01;
                return hash;
            }
        }
        // Remove all code separators.
        prev = prev.removeSeparators();
        // Calculate buffer size.
        var size = this.hashSize(index, prev, type);
        var bw = bio.pool(size);
        bw.writeU32(this.version);
        // Serialize inputs.
        if (type & hashType.ANYONECANPAY) {
            // Serialize only the current
            // input if ANYONECANPAY.
            var input = this.inputs[index];
            // Count.
            bw.writeVarint(1);
            // Outpoint.
            input.prevout.toWriter(bw);
            // Replace script with previous
            // output script if current index.
            bw.writeVarBytes(prev.toRaw());
            bw.writeU32(input.sequence);
        }
        else {
            bw.writeVarint(this.inputs.length);
            for (var i = 0; i < this.inputs.length; i++) {
                var input = this.inputs[i];
                // Outpoint.
                input.prevout.toWriter(bw);
                // Replace script with previous
                // output script if current index.
                if (i === index) {
                    bw.writeVarBytes(prev.toRaw());
                    bw.writeU32(input.sequence);
                    continue;
                }
                // Script is null.
                bw.writeVarint(0);
                // Sequences are 0 if NONE or SINGLE.
                switch (type & 0x1f) {
                    case hashType.NONE:
                    case hashType.SINGLE:
                        bw.writeU32(0);
                        break;
                    default:
                        bw.writeU32(input.sequence);
                        break;
                }
            }
        }
        // Serialize outputs.
        switch (type & 0x1f) {
            case hashType.NONE: {
                // No outputs if NONE.
                bw.writeVarint(0);
                break;
            }
            case hashType.SINGLE: {
                var output = this.outputs[index];
                // Drop all outputs after the
                // current input index if SINGLE.
                bw.writeVarint(index + 1);
                for (var i = 0; i < index; i++) {
                    // Null all outputs not at
                    // current input index.
                    bw.writeI64(-1);
                    bw.writeVarint(0);
                }
                // Regular serialization
                // at current input index.
                output.toWriter(bw);
                break;
            }
            default: {
                // Regular output serialization if ALL.
                bw.writeVarint(this.outputs.length);
                for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
                    var output = _a[_i];
                    output.toWriter(bw);
                }
                break;
            }
        }
        bw.writeU32(this.locktime);
        // Append the hash type.
        bw.writeU32(type);
        return hash256.digest(bw.render());
    };
    /**
     * Calculate sighash size.
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param {Number} type
     * @returns {Number}
     */
    TX.prototype.hashSize = function (index, prev, type) {
        var size = 0;
        size += 4;
        if (type & hashType.ANYONECANPAY) {
            size += 1;
            size += 36;
            size += prev.getVarSize();
            size += 4;
        }
        else {
            size += encoding.sizeVarint(this.inputs.length);
            size += 41 * (this.inputs.length - 1);
            size += 36;
            size += prev.getVarSize();
            size += 4;
        }
        switch (type & 0x1f) {
            case hashType.NONE:
                size += 1;
                break;
            case hashType.SINGLE:
                size += encoding.sizeVarint(index + 1);
                size += 9 * index;
                size += this.outputs[index].getSize();
                break;
            default:
                size += encoding.sizeVarint(this.outputs.length);
                for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
                    var output = _a[_i];
                    size += output.getSize();
                }
                break;
        }
        size += 8;
        return size;
    };
    /**
     * Witness sighashing -- O(n).
     * @private
     * @param {Number} index
     * @param {Script} prev
     * @param  {SatoshiAmount} value
     * @param {SighashType} type
     * @returns {Buffer}
     */
    TX.prototype.signatureHashV1 = function (index, prev, value, type) {
        var input = this.inputs[index];
        var prevouts = consensus.ZERO_HASH;
        var sequences = consensus.ZERO_HASH;
        var outputs = consensus.ZERO_HASH;
        if (!(type & hashType.ANYONECANPAY)) {
            if (this._hashPrevouts) {
                prevouts = this._hashPrevouts;
            }
            else {
                var bw_1 = bio.pool(this.inputs.length * 36);
                for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                    var input_1 = _a[_i];
                    input_1.prevout.toWriter(bw_1);
                }
                prevouts = hash256.digest(bw_1.render());
                if (!this.mutable)
                    this._hashPrevouts = prevouts;
            }
        }
        if (!(type & hashType.ANYONECANPAY)
            && (type & 0x1f) !== hashType.SINGLE
            && (type & 0x1f) !== hashType.NONE) {
            if (this._hashSequence) {
                sequences = this._hashSequence;
            }
            else {
                var bw_2 = bio.pool(this.inputs.length * 4);
                for (var _b = 0, _c = this.inputs; _b < _c.length; _b++) {
                    var input_2 = _c[_b];
                    bw_2.writeU32(input_2.sequence);
                }
                sequences = hash256.digest(bw_2.render());
                if (!this.mutable)
                    this._hashSequence = sequences;
            }
        }
        if ((type & 0x1f) !== hashType.SINGLE
            && (type & 0x1f) !== hashType.NONE) {
            if (this._hashOutputs) {
                outputs = this._hashOutputs;
            }
            else {
                var size_1 = 0;
                for (var _d = 0, _e = this.outputs; _d < _e.length; _d++) {
                    var output = _e[_d];
                    size_1 += output.getSize();
                }
                var bw_3 = bio.pool(size_1);
                for (var _f = 0, _g = this.outputs; _f < _g.length; _f++) {
                    var output = _g[_f];
                    output.toWriter(bw_3);
                }
                outputs = hash256.digest(bw_3.render());
                if (!this.mutable)
                    this._hashOutputs = outputs;
            }
        }
        else if ((type & 0x1f) === hashType.SINGLE) {
            if (index < this.outputs.length) {
                var output = this.outputs[index];
                outputs = hash256.digest(output.toRaw());
            }
        }
        var size = 156 + prev.getVarSize();
        var bw = bio.pool(size);
        bw.writeU32(this.version);
        bw.writeBytes(prevouts);
        bw.writeBytes(sequences);
        bw.writeHash(input.prevout.hash);
        bw.writeU32(input.prevout.index);
        bw.writeVarBytes(prev.toRaw());
        bw.writeI64(value);
        bw.writeU32(input.sequence);
        bw.writeBytes(outputs);
        bw.writeU32(this.locktime);
        bw.writeU32(type);
        return hash256.digest(bw.render());
    };
    /**
     * Verify signature.
     * @param {Number} index
     * @param {Script} prev
     * @param  {SatoshiAmount} value
     * @param {Buffer} sig
     * @param {Buffer} key
     * @param {Number} version
     * @returns {Boolean}
     */
    TX.prototype.checksig = function (index, prev, value, sig, key, version) {
        if (sig.length === 0)
            return false;
        var type = sig[sig.length - 1];
        var hash = this.signatureHash(index, prev, value, type, version);
        return secp256k1.verifyDER(hash, sig.slice(0, -1), key);
    };
    /**
     * Create a signature suitable for inserting into scriptSigs/witnesses.
     * @param {Number} index - Index of input being signed.
     * @param {Script} prev - Previous output script or redeem script
     * (in the case of witnesspubkeyhash, this should be the generated
     * p2pkh script).
     * @param  {SatoshiAmount} value - Previous output value.
     * @param {Buffer} key
     * @param {SighashType} type
     * @param {Number} version - Sighash version (0=legacy, 1=segwit).
     * @returns {Buffer} Signature in DER format.
     */
    TX.prototype.signature = function (index, prev, value, key, type, version) {
        if (type == null)
            type = hashType.ALL;
        if (version == null)
            version = 0;
        var hash = this.signatureHash(index, prev, value, type, version);
        var sig = secp256k1.signDER(hash, key);
        var bw = bio.write(sig.length + 1);
        bw.writeBytes(sig);
        bw.writeU8(type);
        return bw.render();
    };
    /**
     * Verify all transaction inputs.
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @throws {ScriptError} on invalid inputs
     */
    TX.prototype.check = function (view, flags) {
        if (this.inputs.length === 0)
            throw new ScriptError('UNKNOWN_ERROR', 'No inputs.');
        if (this.isCoinbase())
            return;
        for (var i = 0; i < this.inputs.length; i++) {
            var prevout = this.inputs[i].prevout;
            var coin = view.getOutput(prevout);
            if (!coin)
                throw new ScriptError('UNKNOWN_ERROR', 'No coin available.');
            this.checkInput(i, coin, flags);
        }
    };
    /**
     * Verify a transaction input.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @throws {ScriptError} on invalid input
     */
    TX.prototype.checkInput = function (index, coin, flags) {
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert(coin, 'No coin passed.');
        Script.verify(input.script, input.witness, coin.script, this, index, coin.value, flags);
    };
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    TX.prototype.checkAsync = function (view, flags, pool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.inputs.length === 0)
                            throw new ScriptError('UNKNOWN_ERROR', 'No inputs.');
                        if (this.isCoinbase())
                            return [2 /*return*/];
                        if (!pool) {
                            this.check(view, flags);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.check(this, view, flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify a transaction input asynchronously.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    TX.prototype.checkInputAsync = function (index, coin, flags, pool) {
        return __awaiter(this, void 0, void 0, function () {
            var input;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = this.inputs[index];
                        assert(input, 'Input does not exist.');
                        assert(coin, 'No coin passed.');
                        if (!pool) {
                            this.checkInput(index, coin, flags);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.checkInput(this, index, coin, flags)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Verify all transaction inputs.
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     */
    TX.prototype.verify = function (view, flags) {
        try {
            this.check(view, flags);
        }
        catch (e) {
            if (e.type === 'ScriptError')
                return false;
            throw e;
        }
        return true;
    };
    /**
     * Verify a transaction input.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the input is valid.
     */
    TX.prototype.verifyInput = function (index, coin, flags) {
        try {
            this.checkInput(index, coin, flags);
        }
        catch (e) {
            if (e.type === 'ScriptError')
                return false;
            throw e;
        }
        return true;
    };
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {CoinView} view
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    TX.prototype.verifyAsync = function (view, flags, pool) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkAsync(view, flags, pool)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        if (e_1.type === 'ScriptError')
                            return [2 /*return*/, false];
                        throw e_1;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Verify a transaction input asynchronously.
     * @param {Number} index - Index of output being
     * verified.
     * @param {Coin|Output} coin - Previous output.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    TX.prototype.verifyInputAsync = function (index, coin, flags, pool) {
        return __awaiter(this, void 0, void 0, function () {
            var e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkInput(index, coin, flags, pool)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        if (e_2.type === 'ScriptError')
                            return [2 /*return*/, false];
                        throw e_2;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Test whether the transaction is a coinbase
     * by examining the inputs.
     * @returns {Boolean}
     */
    TX.prototype.isCoinbase = function () {
        return this.inputs.length === 1 && this.inputs[0].prevout.isNull();
    };
    /**
     * Test whether the transaction is replaceable.
     * @returns {Boolean}
     */
    TX.prototype.isRBF = function () {
        // Core doesn't do this, but it should:
        if (this.version === 2)
            return false;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.isRBF())
                return true;
        }
        return false;
    };
    /**
     * Calculate the fee for the transaction.
     * @param {CoinView} view
     * @returns  {SatoshiAmount} fee (zero if not all coins are available).
     */
    TX.prototype.getFee = function (view) {
        if (!this.hasCoins(view))
            return 0;
        return this.getInputValue(view) - this.getOutputValue();
    };
    /**
     * Calculate the total input value.
     * @param {CoinView} view
     * @returns  {SatoshiAmount} value
     */
    TX.prototype.getInputValue = function (view) {
        var total = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var coin = view.getOutput(prevout);
            if (!coin)
                return 0;
            total += coin.value;
        }
        return total;
    };
    /**
     * Calculate the total output value.
     * @returns  {SatoshiAmount} value
     */
    TX.prototype.getOutputValue = function () {
        var total = 0;
        for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            total += output.value;
        }
        return total;
    };
    /**
     * Get all input addresses.
     * @private
     * @param {CoinView} view
     * @returns {Array} [addrs, table]
     */
    TX.prototype._getInputAddresses = function (view) {
        var table = new BufferSet();
        var addrs = [];
        if (this.isCoinbase())
            return [addrs, table];
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var coin = view ? view.getOutputFor(input) : null;
            var addr = input.getAddress(coin);
            if (!addr)
                continue;
            var hash = addr.getHash();
            if (!table.has(hash)) {
                table.add(hash);
                addrs.push(addr);
            }
        }
        return [addrs, table];
    };
    /**
     * Get all output addresses.
     * @private
     * @returns {Array} [addrs, table]
     */
    TX.prototype._getOutputAddresses = function () {
        var table = new BufferSet();
        var addrs = [];
        for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            var addr = output.getAddress();
            if (!addr)
                continue;
            var hash = addr.getHash();
            if (!table.has(hash)) {
                table.add(hash);
                addrs.push(addr);
            }
        }
        return [addrs, table];
    };
    /**
     * Get all addresses.
     * @private
     * @param {CoinView} view
     * @returns {Array} [addrs, table]
     */
    TX.prototype._getAddresses = function (view) {
        var _a = this._getInputAddresses(view), addrs = _a[0], table = _a[1];
        var output = this.getOutputAddresses();
        for (var _i = 0, output_1 = output; _i < output_1.length; _i++) {
            var addr = output_1[_i];
            var hash = addr.getHash();
            if (!table.has(hash)) {
                table.add(hash);
                addrs.push(addr);
            }
        }
        return [addrs, table];
    };
    /**
     * Get all input addresses.
     * @param {CoinView|null} view
     * @returns {Address[]} addresses
     */
    TX.prototype.getInputAddresses = function (view) {
        var addrs = this._getInputAddresses(view)[0];
        return addrs;
    };
    /**
     * Get all output addresses.
     * @returns {Address[]} addresses
     */
    TX.prototype.getOutputAddresses = function () {
        var addrs = this._getOutputAddresses()[0];
        return addrs;
    };
    /**
     * Get all addresses.
     * @param {CoinView|null} view
     * @returns {Address[]} addresses
     */
    TX.prototype.getAddresses = function (view) {
        var addrs = this._getAddresses(view)[0];
        return addrs;
    };
    /**
     * Get all input address hashes.
     * @param {CoinView|null} view
     * @returns {Hash[]} hashes
     */
    TX.prototype.getInputHashes = function (view, enc) {
        var _a = this._getInputAddresses(view), table = _a[1];
        if (enc !== 'hex')
            return table.toArray();
        return table.toArray().map(function (h) { return h.toString('hex'); });
    };
    /**
     * Get all output address hashes.
     * @returns {Hash[]} hashes
     */
    TX.prototype.getOutputHashes = function (enc) {
        var _a = this._getOutputAddresses(), table = _a[1];
        if (enc !== 'hex')
            return table.toArray();
        return table.toArray().map(function (h) { return h.toString('hex'); });
    };
    /**
     * Get all address hashes.
     * @param {CoinView|null} view
     * @returns {Hash[]} hashes
     */
    TX.prototype.getHashes = function (view, enc) {
        var _a = this._getAddresses(view), table = _a[1];
        if (enc !== 'hex')
            return table.toArray();
        return table.toArray().map(function (h) { return h.toString('hex'); });
    };
    /**
     * Test whether the transaction has
     * all coins available.
     * @param {CoinView} view
     * @returns {Boolean}
     */
    TX.prototype.hasCoins = function (view) {
        if (this.inputs.length === 0)
            return false;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            if (!view.hasEntry(prevout))
                return false;
        }
        return true;
    };
    /**
     * Check finality of transaction by examining
     * nLocktime and nSequence values.
     * @example
     * tx.isFinal(chain.height + 1, network.now());
     * @param {Number} height - Height at which to test. This
     * is usually the chain height, or the chain height + 1
     * when the transaction entered the mempool.
     * @param {Number} time - Time at which to test. This is
     * usually the chain tip's parent's median time, or the
     * time at which the transaction entered the mempool. If
     * MEDIAN_TIME_PAST is enabled this will be the median
     * time of the chain tip's previous entry's median time.
     * @returns {Boolean}
     */
    TX.prototype.isFinal = function (height, time) {
        var THRESHOLD = consensus.LOCKTIME_THRESHOLD;
        if (this.locktime === 0)
            return true;
        if (this.locktime < (this.locktime < THRESHOLD ? height : time))
            return true;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.sequence !== 0xffffffff)
                return false;
        }
        return true;
    };
    /**
     * Verify the absolute locktime of a transaction.
     * Called by OP_CHECKLOCKTIMEVERIFY.
     * @param {Number} index - Index of input being verified.
     * @param {Number} predicate - Locktime to verify against.
     * @returns {Boolean}
     */
    TX.prototype.verifyLocktime = function (index, predicate) {
        var THRESHOLD = consensus.LOCKTIME_THRESHOLD;
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert(predicate >= 0, 'Locktime must be non-negative.');
        // Locktimes must be of the same type (blocks or seconds).
        if ((this.locktime < THRESHOLD) !== (predicate < THRESHOLD))
            return false;
        if (predicate > this.locktime)
            return false;
        if (input.sequence === 0xffffffff)
            return false;
        return true;
    };
    /**
     * Verify the relative locktime of an input.
     * Called by OP_CHECKSEQUENCEVERIFY.
     * @param {Number} index - Index of input being verified.
     * @param {Number} predicate - Relative locktime to verify against.
     * @returns {Boolean}
     */
    TX.prototype.verifySequence = function (index, predicate) {
        var DISABLE_FLAG = consensus.SEQUENCE_DISABLE_FLAG;
        var TYPE_FLAG = consensus.SEQUENCE_TYPE_FLAG;
        var MASK = consensus.SEQUENCE_MASK;
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert(predicate >= 0, 'Locktime must be non-negative.');
        // For future softfork capability.
        if (predicate & DISABLE_FLAG)
            return true;
        // Version must be >=2.
        if (this.version < 2)
            return false;
        // Cannot use the disable flag without
        // the predicate also having the disable
        // flag (for future softfork capability).
        if (input.sequence & DISABLE_FLAG)
            return false;
        // Locktimes must be of the same type (blocks or seconds).
        if ((input.sequence & TYPE_FLAG) !== (predicate & TYPE_FLAG))
            return false;
        if ((predicate & MASK) > (input.sequence & MASK))
            return false;
        return true;
    };
    /**
     * Calculate legacy (inaccurate) sigop count.
     * @returns {Number} sigop count
     */
    TX.prototype.getLegacySigops = function () {
        if (this._sigops !== -1)
            return this._sigops;
        var total = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            total += input.script.getSigops(false);
        }
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            total += output.script.getSigops(false);
        }
        if (!this.mutable)
            this._sigops = total;
        return total;
    };
    /**
     * Calculate accurate sigop count, taking into account redeem scripts.
     * @param {CoinView} view
     * @returns {Number} sigop count
     */
    TX.prototype.getScripthashSigops = function (view) {
        if (this.isCoinbase())
            return 0;
        var total = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var coin = view.getOutputFor(input);
            if (!coin)
                continue;
            if (!coin.script.isScripthash())
                continue;
            total += coin.script.getScripthashSigops(input.script);
        }
        return total;
    };
    /**
     * Calculate accurate sigop count, taking into account redeem scripts.
     * @param {CoinView} view
     * @returns {Number} sigop count
     */
    TX.prototype.getWitnessSigops = function (view) {
        if (this.isCoinbase())
            return 0;
        var total = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var coin = view.getOutputFor(input);
            if (!coin)
                continue;
            total += coin.script.getWitnessSigops(input.script, input.witness);
        }
        return total;
    };
    /**
     * Calculate sigops cost, taking into account witness programs.
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop weight
     */
    TX.prototype.getSigopsCost = function (view, flags) {
        if (flags == null)
            flags = Script.flags.STANDARD_VERIFY_FLAGS;
        var scale = consensus.WITNESS_SCALE_FACTOR;
        var cost = this.getLegacySigops() * scale;
        if (flags & Script.flags.VERIFY_P2SH)
            cost += this.getScripthashSigops(view) * scale;
        if (flags & Script.flags.VERIFY_WITNESS)
            cost += this.getWitnessSigops(view);
        return cost;
    };
    /**
     * Calculate virtual sigop count.
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop count
     */
    TX.prototype.getSigops = function (view, flags) {
        var scale = consensus.WITNESS_SCALE_FACTOR;
        return (this.getSigopsCost(view, flags) + scale - 1) / scale | 0;
    };
    /**
     * Non-contextual sanity checks for the transaction.
     * Will mostly verify coin and output values.
     * @see CheckTransaction()
     * @returns {Array} [result, reason, score]
     */
    TX.prototype.isSane = function () {
        var valid = this.checkSanity()[0];
        return valid;
    };
    /**
     * Non-contextual sanity checks for the transaction.
     * Will mostly verify coin and output values.
     * @see CheckTransaction()
     * @returns {Array} [valid, reason, score]
     */
    TX.prototype.checkSanity = function () {
        if (this.inputs.length === 0)
            return [false, 'bad-txns-vin-empty', 100];
        if (this.outputs.length === 0)
            return [false, 'bad-txns-vout-empty', 100];
        if (this.getBaseSize() > consensus.MAX_BLOCK_SIZE)
            return [false, 'bad-txns-oversize', 100];
        var total = 0;
        for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            if (output.value < 0)
                return [false, 'bad-txns-vout-negative', 100];
            if (output.value > consensus.MAX_MONEY)
                return [false, 'bad-txns-vout-toolarge', 100];
            total += output.value;
            if (total < 0 || total > consensus.MAX_MONEY)
                return [false, 'bad-txns-txouttotal-toolarge', 100];
        }
        var prevout = new BufferSet();
        for (var _b = 0, _c = this.inputs; _b < _c.length; _b++) {
            var input = _c[_b];
            var key = input.prevout.toKey();
            if (prevout.has(key))
                return [false, 'bad-txns-inputs-duplicate', 100];
            prevout.add(key);
        }
        if (this.isCoinbase()) {
            var size = this.inputs[0].script.getSize();
            if (size < 2 || size > 100)
                return [false, 'bad-cb-length', 100];
        }
        else {
            for (var _d = 0, _e = this.inputs; _d < _e.length; _d++) {
                var input = _e[_d];
                if (input.prevout.isNull())
                    return [false, 'bad-txns-prevout-null', 10];
            }
        }
        return [true, 'valid', 0];
    };
    /**
     * Non-contextual checks to determine whether the
     * transaction has all standard output script
     * types and standard input script size with only
     * pushdatas in the code.
     * Will mostly verify coin and output values.
     * @see IsStandardTx()
     * @returns {Array} [valid, reason, score]
     */
    TX.prototype.isStandard = function () {
        var valid = this.checkStandard()[0];
        return valid;
    };
    /**
     * Non-contextual checks to determine whether the
     * transaction has all standard output script
     * types and standard input script size with only
     * pushdatas in the code.
     * Will mostly verify coin and output values.
     * @see IsStandardTx()
     * @returns {Array} [valid, reason, score]
     */
    TX.prototype.checkStandard = function () {
        if (this.version < 1 || this.version > policy.MAX_TX_VERSION)
            return [false, 'version', 0];
        if (this.getWeight() >= policy.MAX_TX_WEIGHT)
            return [false, 'tx-size', 0];
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.script.getSize() > 1650)
                return [false, 'scriptsig-size', 0];
            if (!input.script.isPushOnly())
                return [false, 'scriptsig-not-pushonly', 0];
        }
        var nulldata = 0;
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            if (!output.script.isStandard())
                return [false, 'scriptpubkey', 0];
            if (output.script.isNulldata()) {
                nulldata++;
                continue;
            }
            if (output.script.isMultisig() && !policy.BARE_MULTISIG)
                return [false, 'bare-multisig', 0];
            if (output.isDust(policy.MIN_RELAY))
                return [false, 'dust', 0];
        }
        if (nulldata > 1)
            return [false, 'multi-op-return', 0];
        return [true, 'valid', 0];
    };
    /**
     * Perform contextual checks to verify coin and input
     * script standardness (including the redeem script).
     * @see AreInputsStandard()
     * @param {CoinView} view
     * @param {VerifyFlags?} flags
     * @returns {Boolean}
     */
    TX.prototype.hasStandardInputs = function (view) {
        if (this.isCoinbase())
            return true;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var coin = view.getOutputFor(input);
            if (!coin)
                return false;
            if (coin.script.isPubkeyhash())
                continue;
            if (coin.script.isScripthash()) {
                var redeem = input.script.getRedeem();
                if (!redeem)
                    return false;
                if (redeem.getSigops(true) > policy.MAX_P2SH_SIGOPS)
                    return false;
                continue;
            }
            if (coin.script.isUnknown())
                return false;
        }
        return true;
    };
    /**
     * Perform contextual checks to verify coin and witness standardness.
     * @see IsBadWitness()
     * @param {CoinView} view
     * @returns {Boolean}
     */
    TX.prototype.hasStandardWitness = function (view) {
        if (this.isCoinbase())
            return true;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var witness = input.witness;
            var coin = view.getOutputFor(input);
            if (!coin)
                continue;
            if (witness.items.length === 0)
                continue;
            var prev = coin.script;
            if (prev.isScripthash()) {
                prev = input.script.getRedeem();
                if (!prev)
                    return false;
            }
            if (!prev.isProgram())
                return false;
            if (prev.isWitnessPubkeyhash()) {
                if (witness.items.length !== 2)
                    return false;
                if (witness.items[0].length > 73)
                    return false;
                if (witness.items[1].length > 65)
                    return false;
                continue;
            }
            if (prev.isWitnessScripthash()) {
                if (witness.items.length - 1 > policy.MAX_P2WSH_STACK)
                    return false;
                for (var i = 0; i < witness.items.length - 1; i++) {
                    var item = witness.items[i];
                    if (item.length > policy.MAX_P2WSH_PUSH)
                        return false;
                }
                var raw = witness.items[witness.items.length - 1];
                if (raw.length > policy.MAX_P2WSH_SIZE)
                    return false;
                var redeem = Script.fromRaw(raw);
                if (redeem.isPubkey()) {
                    if (witness.items.length - 1 !== 1)
                        return false;
                    if (witness.items[0].length > 73)
                        return false;
                    continue;
                }
                if (redeem.isPubkeyhash()) {
                    if (input.witness.items.length - 1 !== 2)
                        return false;
                    if (witness.items[0].length > 73)
                        return false;
                    if (witness.items[1].length > 65)
                        return false;
                    continue;
                }
                var m = redeem.getMultisig()[0];
                if (m !== -1) {
                    if (witness.items.length - 1 !== m + 1)
                        return false;
                    if (witness.items[0].length !== 0)
                        return false;
                    for (var i = 1; i < witness.items.length - 1; i++) {
                        var item = witness.items[i];
                        if (item.length > 73)
                            return false;
                    }
                }
                continue;
            }
            if (witness.items.length > policy.MAX_P2WSH_STACK)
                return false;
            for (var _b = 0, _c = witness.items; _b < _c.length; _b++) {
                var item = _c[_b];
                if (item.length > policy.MAX_P2WSH_PUSH)
                    return false;
            }
        }
        return true;
    };
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {CoinView} view
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Boolean}
     */
    TX.prototype.verifyInputs = function (view, height) {
        var fee = this.checkInputs(view, height)[0];
        return fee !== -1;
    };
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {CoinView} view
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Array} [fee, reason, score]
     */
    TX.prototype.checkInputs = function (view, height) {
        assert(typeof height === 'number');
        var total = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var entry = view.getEntry(prevout);
            if (!entry)
                return [-1, 'bad-txns-inputs-missingorspent', 0];
            if (entry.coinbase) {
                if (height - entry.height < consensus.COINBASE_MATURITY)
                    return [-1, 'bad-txns-premature-spend-of-coinbase', 0];
            }
            var coin = view.getOutput(prevout);
            assert(coin);
            if (coin.value < 0 || coin.value > consensus.MAX_MONEY)
                return [-1, 'bad-txns-inputvalues-outofrange', 100];
            total += coin.value;
            if (total < 0 || total > consensus.MAX_MONEY)
                return [-1, 'bad-txns-inputvalues-outofrange', 100];
        }
        // Overflows already checked in `isSane()`.
        var value = this.getOutputValue();
        if (total < value)
            return [-1, 'bad-txns-in-belowout', 100];
        var fee = total - value;
        if (fee < 0)
            return [-1, 'bad-txns-fee-negative', 100];
        if (fee > consensus.MAX_MONEY)
            return [-1, 'bad-txns-fee-outofrange', 100];
        return [fee, 'valid', 0];
    };
    /**
     * Calculate the modified size of the transaction. This
     * is used in the mempool for calculating priority.
     * @param {Number?} size - The size to modify. If not present,
     * virtual size will be used.
     * @returns {Number} Modified size.
     */
    TX.prototype.getModifiedSize = function (size) {
        if (size == null)
            size = this.getVirtualSize();
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var offset = 41 + Math.min(110, input.script.getSize());
            if (size > offset)
                size -= offset;
        }
        return size;
    };
    /**
     * Calculate the transaction priority.
     * @param {CoinView} view
     * @param {Number} height
     * @param {Number?} size - Size to calculate priority
     * based on. If not present, virtual size will be used.
     * @returns {Number}
     */
    TX.prototype.getPriority = function (view, height, size) {
        assert(typeof height === 'number', 'Must pass in height.');
        if (this.isCoinbase())
            return 0;
        if (size == null)
            size = this.getVirtualSize();
        var sum = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var coin = view.getOutput(prevout);
            if (!coin)
                continue;
            var coinHeight = view.getHeight(prevout);
            if (coinHeight === -1)
                continue;
            if (coinHeight <= height) {
                var age = height - coinHeight;
                sum += coin.value * age;
            }
        }
        return Math.floor(sum / size);
    };
    /**
     * Calculate the transaction's on-chain value.
     * @param {CoinView} view
     * @returns {Number}
     */
    TX.prototype.getChainValue = function (view) {
        if (this.isCoinbase())
            return 0;
        var value = 0;
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var coin = view.getOutput(prevout);
            if (!coin)
                continue;
            var height = view.getHeight(prevout);
            if (height === -1)
                continue;
            value += coin.value;
        }
        return value;
    };
    /**
     * Determine whether the transaction is above the
     * free threshold in priority. A transaction which
     * passed this test is most likely relayable
     * without a fee.
     * @param {CoinView} view
     * @param {Number?} height - If not present, tx
     * height or network height will be used.
     * @param {Number?} size - If not present, modified
     * size will be calculated and used.
     * @returns {Boolean}
     */
    TX.prototype.isFree = function (view, height, size) {
        var priority = this.getPriority(view, height, size);
        return priority > policy.FREE_THRESHOLD;
    };
    /**
     * Calculate minimum fee in order for the transaction
     * to be relayable (not the constant min relay fee).
     * @param {Number?} size - If not present, max size
     * estimation will be calculated and used.
     * @param {Rate?} rate - Rate of satoshi per kB.
     * @returns  {SatoshiAmount} fee
     */
    TX.prototype.getMinFee = function (size, rate) {
        if (size == null)
            size = this.getVirtualSize();
        return policy.getMinFee(size, rate);
    };
    /**
     * Calculate the minimum fee in order for the transaction
     * to be relayable, but _round to the nearest kilobyte
     * when taking into account size.
     * @param {Number?} size - If not present, max size
     * estimation will be calculated and used.
     * @param {Rate?} rate - Rate of satoshi per kB.
     * @returns  {SatoshiAmount} fee
     */
    TX.prototype.getRoundFee = function (size, rate) {
        if (size == null)
            size = this.getVirtualSize();
        return policy.getRoundFee(size, rate);
    };
    /**
     * Calculate the transaction's rate based on size
     * and fees. Size will be calculated if not present.
     * @param {CoinView} view
     * @param {Number?} size
     * @returns {Rate}
     */
    TX.prototype.getRate = function (view, size) {
        var fee = this.getFee(view);
        if (fee < 0)
            return 0;
        if (size == null)
            size = this.getVirtualSize();
        return policy.getRate(size, fee);
    };
    /**
     * Get all unique outpoint hashes.
     * @returns {Hash[]} Outpoint hashes.
     */
    TX.prototype.getPrevout = function () {
        if (this.isCoinbase())
            return [];
        var prevout = new BufferSet();
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            prevout.add(input.prevout.hash);
        }
        return prevout.toArray();
    };
    /**
     * Test a transaction against a bloom filter using
     * the BIP37 matching algorithm. Note that this may
     * update the filter depending on what the `update`
     * value is.
     * @see "Filter matching algorithm":
     * @see https://github.com/bitcoin/bips/blob/master/bip-0037.mediawiki
     * @param {BloomFilter} filter
     * @returns {Boolean} True if the transaction matched.
     */
    TX.prototype.isWatched = function (filter) {
        var found = false;
        // 1. Test the tx hash
        if (filter.test(this.hash()))
            found = true;
        // 2. Test data elements in output scripts
        //    (may need to update filter on match)
        for (var i = 0; i < this.outputs.length; i++) {
            var output = this.outputs[i];
            // Test the output script
            if (output.script.test(filter)) {
                if (filter.update === 1 /* ALL */) {
                    var prevout = Outpoint.fromTX(this, i);
                    filter.add(prevout.toRaw());
                }
                else if (filter.update === 2 /* PUBKEY_ONLY */) {
                    if (output.script.isPubkey() || output.script.isMultisig()) {
                        var prevout = Outpoint.fromTX(this, i);
                        filter.add(prevout.toRaw());
                    }
                }
                found = true;
            }
        }
        if (found)
            return found;
        // 3. Test prev_out structure
        // 4. Test data elements in input scripts
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var prevout = input.prevout;
            // Test the COutPoint structure
            if (filter.test(prevout.toRaw()))
                return true;
            // Test the input script
            if (input.script.test(filter))
                return true;
        }
        // 5. No match
        return false;
    };
    /**
     * Get little-endian tx hash.
     * @returns {Hash}
     */
    TX.prototype.rhash = function () {
        return util.revHex(this.hash());
    };
    /**
     * Get little-endian wtx hash.
     * @returns {Hash}
     */
    TX.prototype.rwhash = function () {
        return util.revHex(this.witnessHash());
    };
    /**
     * Get little-endian tx hash.
     * @returns {Hash}
     */
    TX.prototype.txid = function () {
        return this.rhash();
    };
    /**
     * Get little-endian wtx hash.
     * @returns {Hash}
     */
    TX.prototype.wtxid = function () {
        return this.rwhash();
    };
    /**
     * Convert the tx to an inv item.
     * @returns {InvItem}
     */
    TX.prototype.toInv = function () {
        return new InvItem(InvItem.types.TX, this.hash());
    };
    /**
     * Inspect the transaction and return a more
     * user-friendly representation of the data.
     * @returns {Object}
     */
    TX.prototype[inspectSymbol] = function () {
        return this.format();
    };
    /**
     * Inspect the transaction and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {ChainEntry} entry
     * @param {Number} index
     * @returns {Object}
     */
    TX.prototype.format = function (view, entry, index) {
        var rate = 0;
        var fee = 0;
        var height = -1;
        var block = null;
        var time = 0;
        var date = null;
        if (view) {
            fee = this.getFee(view);
            rate = this.getRate(view);
            // Rate can exceed 53 bits in testing.
            if (!Number.isSafeInteger(rate))
                rate = 0;
        }
        if (entry) {
            height = entry.height;
            block = util.revHex(entry.hash);
            time = entry.time;
            date = util.date(time);
        }
        if (index == null)
            index = -1;
        return {
            hash: this.txid(),
            witnessHash: this.wtxid(),
            size: this.getSize(),
            virtualSize: this.getVirtualSize(),
            value: Amount.btc(this.getOutputValue()),
            fee: Amount.btc(fee),
            rate: Amount.btc(rate),
            minFee: Amount.btc(this.getMinFee()),
            height: height,
            block: block,
            time: time,
            date: date,
            index: index,
            version: this.version,
            inputs: this.inputs.map(function (input) {
                var coin = view ? view.getOutputFor(input) : null;
                return input.format(coin);
            }),
            outputs: this.outputs,
            locktime: this.locktime
        };
    };
    /**
     * Convert the transaction to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    TX.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the transaction to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {ChainEntry} entry
     * @param {Number} index
     * @returns {Object}
     */
    TX.prototype.getJSON = function (network, view, entry, index) {
        var rate, fee, height, block, time, date;
        if (view) {
            fee = this.getFee(view);
            rate = this.getRate(view);
            // Rate can exceed 53 bits in testing.
            if (!Number.isSafeInteger(rate))
                rate = 0;
        }
        if (entry) {
            height = entry.height;
            block = util.revHex(entry.hash);
            time = entry.time;
            date = util.date(time);
        }
        network = Network.get(network);
        return {
            hash: this.txid(),
            witnessHash: this.wtxid(),
            fee: fee,
            rate: rate,
            mtime: util.now(),
            height: height,
            block: block,
            time: time,
            date: date,
            index: index,
            version: this.version,
            inputs: this.inputs.map(function (input) {
                var coin = view ? view.getCoinFor(input) : null;
                return input.getJSON(network, coin);
            }),
            outputs: this.outputs.map(function (output) {
                return output.getJSON(network);
            }),
            locktime: this.locktime,
            hex: this.toRaw().toString('hex')
        };
    };
    /**
     * Inject properties from a json object.
     * @private
     * @param {Object} json
     */
    TX.prototype.fromJSON = function (json) {
        assert(json, 'TX data is required.');
        assert((json.version >>> 0) === json.version, 'Version must be a uint32.');
        assert(Array.isArray(json.inputs), 'Inputs must be an array.');
        assert(Array.isArray(json.outputs), 'Outputs must be an array.');
        assert((json.locktime >>> 0) === json.locktime, 'Locktime must be a uint32.');
        this.version = json.version;
        for (var _i = 0, _a = json.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            this.inputs.push(Input.fromJSON(input));
        }
        for (var _b = 0, _c = json.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            this.outputs.push(Output.fromJSON(output));
        }
        this.locktime = json.locktime;
        return this;
    };
    /**
     * Instantiate a transaction from a
     * jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {TX}
     */
    TX.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Instantiate a transaction from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {TX}
     */
    TX.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Instantiate a transaction from a buffer reader.
     * @param {BufferReader} br
     * @param {Boolean} block
     * @returns {TX}
     */
    TX.fromReader = function (br, block) {
        return new this().fromReader(br, block);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    TX.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @param {Boolean} block
     */
    TX.prototype.fromReader = function (br, block) {
        if (hasWitnessBytes(br))
            return this.fromWitnessReader(br, block);
        var start = br.start();
        this.version = br.readU32();
        var inCount = br.readVarint();
        for (var i = 0; i < inCount; i++)
            this.inputs.push(Input.fromReader(br));
        var outCount = br.readVarint();
        for (var i = 0; i < outCount; i++)
            this.outputs.push(Output.fromReader(br));
        this.locktime = br.readU32();
        if (block) {
            this._offset = start;
            this._block = true;
        }
        if (!this.mutable) {
            this._raw = br.endData();
            this._size = this._raw.length;
            this._witness = 0;
        }
        else {
            br.end();
        }
        return this;
    };
    /**
     * Inject properties from serialized
     * buffer reader (witness serialization).
     * @private
     * @param {BufferReader} br
     * @param {Boolean} block
     */
    TX.prototype.fromWitnessReader = function (br, block) {
        var start = br.start();
        this.version = br.readU32();
        assert(br.readU8() === 0, 'Non-zero marker.');
        var flags = br.readU8();
        assert(flags !== 0, 'Flags byte is zero.');
        var inCount = br.readVarint();
        for (var i = 0; i < inCount; i++)
            this.inputs.push(Input.fromReader(br));
        var outCount = br.readVarint();
        for (var i = 0; i < outCount; i++)
            this.outputs.push(Output.fromReader(br));
        var witness = 0;
        var hasWitness = false;
        if (flags & 1) {
            flags ^= 1;
            witness = br.offset;
            for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                input.witness.fromReader(br);
                if (input.witness.items.length > 0)
                    hasWitness = true;
            }
            witness = (br.offset - witness) + 2;
        }
        if (flags !== 0)
            throw new Error('Unknown witness flag.');
        // We'll never be able to reserialize
        // this to get the regular txid, and
        // there's no way it's valid anyway.
        if (this.inputs.length === 0 && this.outputs.length !== 0)
            throw new Error('Zero input witness tx.');
        this.locktime = br.readU32();
        if (block) {
            this._offset = start;
            this._block = true;
        }
        if (!this.mutable && hasWitness) {
            this._raw = br.endData();
            this._size = this._raw.length;
            this._witness = witness;
        }
        else {
            br.end();
        }
        return this;
    };
    /**
     * Serialize transaction without witness.
     * @private
     * @returns {RawTX}
     */
    TX.prototype.frameNormal = function () {
        var raw = this.getNormalSizes();
        var bw = bio.write(raw.size);
        this.writeNormal(bw);
        raw.data = bw.render();
        return raw;
    };
    /**
     * Serialize transaction with witness. Calculates the witness
     * size as it is framing (exposed on return value as `witness`).
     * @private
     * @returns {RawTX}
     */
    TX.prototype.frameWitness = function () {
        var raw = this.getWitnessSizes();
        var bw = bio.write(raw.size);
        this.writeWitness(bw);
        raw.data = bw.render();
        return raw;
    };
    /**
     * Serialize transaction without witness.
     * @private
     * @param {BufferWriter} bw
     * @returns {RawTX}
     */
    TX.prototype.writeNormal = function (bw) {
        if (this.inputs.length === 0 && this.outputs.length !== 0)
            throw new Error('Cannot serialize zero-input tx.');
        bw.writeU32(this.version);
        bw.writeVarint(this.inputs.length);
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            input.toWriter(bw);
        }
        bw.writeVarint(this.outputs.length);
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            output.toWriter(bw);
        }
        bw.writeU32(this.locktime);
        return bw;
    };
    /**
     * Serialize transaction with witness. Calculates the witness
     * size as it is framing (exposed on return value as `witness`).
     * @private
     * @param {BufferWriter} bw
     * @returns {RawTX}
     */
    TX.prototype.writeWitness = function (bw) {
        if (this.inputs.length === 0 && this.outputs.length !== 0)
            throw new Error('Cannot serialize zero-input tx.');
        bw.writeU32(this.version);
        bw.writeU8(0);
        bw.writeU8(1);
        bw.writeVarint(this.inputs.length);
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            input.toWriter(bw);
        }
        bw.writeVarint(this.outputs.length);
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            output.toWriter(bw);
        }
        var start = bw.offset;
        for (var _d = 0, _e = this.inputs; _d < _e.length; _d++) {
            var input = _e[_d];
            input.witness.toWriter(bw);
        }
        var witness = bw.offset - start;
        bw.writeU32(this.locktime);
        if (witness === this.inputs.length)
            throw new Error('Cannot serialize empty-witness tx.');
        return bw;
    };
    /**
     * Calculate the real size of the transaction
     * without the witness vector.
     * @returns {RawTX}
     */
    TX.prototype.getNormalSizes = function () {
        var base = 0;
        base += 4;
        base += encoding.sizeVarint(this.inputs.length);
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            base += input.getSize();
        }
        base += encoding.sizeVarint(this.outputs.length);
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            base += output.getSize();
        }
        base += 4;
        return new RawTX(base, 0);
    };
    /**
     * Calculate the real size of the transaction
     * with the witness included.
     * @returns {RawTX}
     */
    TX.prototype.getWitnessSizes = function () {
        var base = 0;
        var witness = 0;
        base += 4;
        witness += 2;
        base += encoding.sizeVarint(this.inputs.length);
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            base += input.getSize();
            witness += input.witness.getVarSize();
        }
        base += encoding.sizeVarint(this.outputs.length);
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            base += output.getSize();
        }
        base += 4;
        return new RawTX(base + witness, witness);
    };
    /**
     * Test whether an object is a TX.
     * @param {Object} obj
     * @returns {Boolean}
     */
    TX.isTX = function (obj) {
        return obj instanceof TX;
    };
    return TX;
}());
/*
 * Helpers
 */
function hasWitnessBytes(br) {
    if (br.left() < 6)
        return false;
    return br.data[br.offset + 4] === 0
        && br.data[br.offset + 5] !== 0;
}
var RawTX = /** @class */ (function () {
    function RawTX(size, witness) {
        this.data = null;
        this.size = size;
        this.witness = witness;
    }
    return RawTX;
}());
/*
 * Expose
 */
module.exports = TX;
