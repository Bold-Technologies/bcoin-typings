/*!
 * mtx.js - mutable transaction object for bcoin
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
var encoding = require('bufio').encoding;
var BufferMap = require('buffer-map').BufferMap;
var Script = require('../script/script');
var TX = require('./tx');
var Input = require('./input');
var Output = require('./output');
var Coin = require('./coin');
var Outpoint = require('./outpoint');
var CoinView = require('../coins/coinview');
var Address = require('./address');
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var Amount = require('../btc/amount');
var Stack = require('../script/stack');
var util = require('../utils/util');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * MTX
 * A mutable transaction object.
 * @alias module:primitives.MTX
 * @extends TX
 * @property {Number} changeIndex
 * @property {CoinView} view
 */
var MTX = /** @class */ (function (_super) {
    __extends(MTX, _super);
    /**
     * Create a mutable transaction.
     * @alias module:primitives.MTX
     * @constructor
     * @param {Object} options
     */
    function MTX(options) {
        var _this = _super.call(this) || this;
        _this.mutable = true;
        _this.changeIndex = -1;
        _this.view = new CoinView();
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    MTX.prototype.fromOptions = function (options) {
        if (options.version != null) {
            assert((options.version >>> 0) === options.version, 'Version must a be uint32.');
            this.version = options.version;
        }
        if (options.inputs) {
            assert(Array.isArray(options.inputs), 'Inputs must be an array.');
            for (var _i = 0, _a = options.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                this.addInput(input);
            }
        }
        if (options.outputs) {
            assert(Array.isArray(options.outputs), 'Outputs must be an array.');
            for (var _b = 0, _c = options.outputs; _b < _c.length; _b++) {
                var output = _c[_b];
                this.addOutput(output);
            }
        }
        if (options.locktime != null) {
            assert((options.locktime >>> 0) === options.locktime, 'Locktime must be a uint32.');
            this.locktime = options.locktime;
        }
        if (options.changeIndex != null) {
            if (options.changeIndex !== -1) {
                assert((options.changeIndex >>> 0) === options.changeIndex, 'Change index must be a uint32.');
                this.changeIndex = options.changeIndex;
            }
            else {
                this.changeIndex = -1;
            }
        }
        return this;
    };
    /**
     * Instantiate MTX from options.
     * @param {Object} options
     * @returns {MTX}
     */
    MTX.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clone the transaction. Note that
     * this will not carry over the view.
     * @returns {MTX}
     */
    MTX.prototype.clone = function () {
        var mtx = new this.constructor();
        mtx.inject(this);
        mtx.changeIndex = this.changeIndex;
        return mtx;
    };
    /**
     * Add an input to the transaction.
     * @param {Input|Object} options
     * @returns {Input}
     *
     * @example
     * mtx.addInput({ prevout: { hash: ... }, script: ... });
     * mtx.addInput(new Input());
     */
    MTX.prototype.addInput = function (options) {
        var input = Input.fromOptions(options);
        this.inputs.push(input);
        return input;
    };
    /**
     * Add an outpoint as an input.
     * @param {Outpoint|Object} outpoint
     * @returns {Input}
     *
     * @example
     * mtx.addOutpoint({ hash: ..., index: 0 });
     * mtx.addOutpoint(new Outpoint(hash, index));
     */
    MTX.prototype.addOutpoint = function (outpoint) {
        var prevout = Outpoint.fromOptions(outpoint);
        var input = Input.fromOutpoint(prevout);
        this.inputs.push(input);
        return input;
    };
    /**
     * Add a coin as an input. Note that this will
     * add the coin to the internal coin viewpoint.
     * @param {Coin} coin
     * @returns {Input}
     *
     * @example
     * mtx.addCoin(Coin.fromTX(tx, 0, -1));
     */
    MTX.prototype.addCoin = function (coin) {
        assert(coin instanceof Coin, 'Cannot add non-coin.');
        var input = Input.fromCoin(coin);
        this.inputs.push(input);
        this.view.addCoin(coin);
        return input;
    };
    /**
     * Add a transaction as an input. Note that
     * this will add the coin to the internal
     * coin viewpoint.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number?} height
     * @returns {Input}
     *
     * @example
     * mtx.addTX(tx, 0);
     */
    MTX.prototype.addTX = function (tx, index, height) {
        assert(tx instanceof TX, 'Cannot add non-transaction.');
        if (height == null)
            height = -1;
        var input = Input.fromTX(tx, index);
        this.inputs.push(input);
        this.view.addIndex(tx, index, height);
        return input;
    };
    /**
     * Add an output.
     * @param {Address|Script|Output|Object} script - Script or output options.
     * @param {Amount?} value
     * @returns {Output}
     *
     * @example
     * mtx.addOutput(new Output());
     * mtx.addOutput({ address: ..., value: 100000 });
     * mtx.addOutput(address, 100000);
     * mtx.addOutput(script, 100000);
     */
    MTX.prototype.addOutput = function (script, value) {
        var output;
        if (value != null)
            output = Output.fromScript(script, value);
        else
            output = Output.fromOptions(script);
        this.outputs.push(output);
        return output;
    };
    /**
     * Verify all transaction inputs.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     * @throws {ScriptError} on invalid inputs
     */
    MTX.prototype.check = function (flags) {
        return _super.prototype.check.call(this, this.view, flags);
    };
    /**
     * Verify the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    MTX.prototype.checkAsync = function (flags, pool) {
        return _super.prototype.checkAsync.call(this, this.view, flags, pool);
    };
    /**
     * Verify all transaction inputs.
     * @param {VerifyFlags} [flags=STANDARD_VERIFY_FLAGS]
     * @returns {Boolean} Whether the inputs are valid.
     */
    MTX.prototype.verify = function (flags) {
        try {
            this.check(flags);
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
     * @param {VerifyFlags?} [flags=STANDARD_VERIFY_FLAGS]
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    MTX.prototype.verifyAsync = function (flags, pool) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkAsync(flags, pool)];
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
     * Calculate the fee for the transaction.
     * @returns {Amount} fee (zero if not all coins are available).
     */
    MTX.prototype.getFee = function () {
        return _super.prototype.getFee.call(this, this.view);
    };
    /**
     * Calculate the total input value.
     * @returns {Amount} value
     */
    MTX.prototype.getInputValue = function () {
        return _super.prototype.getInputValue.call(this, this.view);
    };
    /**
     * Get all input addresses.
     * @returns {Address[]} addresses
     */
    MTX.prototype.getInputAddresses = function () {
        return _super.prototype.getInputAddresses.call(this, this.view);
    };
    /**
     * Get all addresses.
     * @returns {Address[]} addresses
     */
    MTX.prototype.getAddresses = function () {
        return _super.prototype.getAddresses.call(this, this.view);
    };
    /**
     * Get all input address hashes.
     * @returns {Hash[]} hashes
     */
    MTX.prototype.getInputHashes = function (enc) {
        return _super.prototype.getInputHashes.call(this, this.view, enc);
    };
    /**
     * Get all address hashes.
     * @returns {Hash[]} hashes
     */
    MTX.prototype.getHashes = function (enc) {
        return _super.prototype.getHashes.call(this, this.view, enc);
    };
    /**
     * Test whether the transaction has
     * all coins available/filled.
     * @returns {Boolean}
     */
    MTX.prototype.hasCoins = function () {
        return _super.prototype.hasCoins.call(this, this.view);
    };
    /**
     * Calculate virtual sigop count.
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop count
     */
    MTX.prototype.getSigops = function (flags) {
        return _super.prototype.getSigops.call(this, this.view, flags);
    };
    /**
     * Calculate sigops weight, taking into account witness programs.
     * @param {VerifyFlags?} flags
     * @returns {Number} sigop weight
     */
    MTX.prototype.getSigopsCost = function (flags) {
        return _super.prototype.getSigopsCost.call(this, this.view, flags);
    };
    /**
     * Calculate the virtual size of the transaction
     * (weighted against bytes per sigop cost).
     * @returns {Number} vsize
     */
    MTX.prototype.getSigopsSize = function () {
        return _super.prototype.getSigopsSize.call(this, this.getSigopsCost());
    };
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Boolean}
     */
    MTX.prototype.verifyInputs = function (height) {
        var fee = this.checkInputs(height)[0];
        return fee !== -1;
    };
    /**
     * Perform contextual checks to verify input, output,
     * and fee values, as well as coinbase spend maturity
     * (coinbases can only be spent 100 blocks or more
     * after they're created). Note that this function is
     * consensus critical.
     * @param {Number} height - Height at which the
     * transaction is being spent. In the mempool this is
     * the chain height plus one at the time it entered the pool.
     * @returns {Array} [fee, reason, score]
     */
    MTX.prototype.checkInputs = function (height) {
        return _super.prototype.checkInputs.call(this, this.view, height);
    };
    /**
     * Build input script (or witness) templates (with
     * OP_0 in place of signatures).
     * @param {Number} index - Input index.
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @returns {Boolean} Whether the script was able to be built.
     */
    MTX.prototype.scriptInput = function (index, coin, ring) {
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert(coin, 'No coin passed.');
        // Don't bother with any below calculation
        // if the output is already templated.
        if (input.script.raw.length !== 0
            || input.witness.items.length !== 0) {
            return true;
        }
        // Get the previous output's script
        var prev = coin.script;
        // This is easily the hardest part about
        // building a transaction with segwit:
        // figuring out where the redeem script
        // and witness redeem scripts go.
        var sh = prev.getScripthash();
        if (sh) {
            var redeem = ring.getRedeem(sh);
            if (!redeem)
                return false;
            // Witness program nested in regular P2SH.
            if (redeem.isProgram()) {
                // P2WSH nested within pay-to-scripthash.
                var wsh = redeem.getWitnessScripthash();
                if (wsh) {
                    var wredeem = ring.getRedeem(wsh);
                    if (!wredeem)
                        return false;
                    var witness = this.scriptVector(wredeem, ring);
                    if (!witness)
                        return false;
                    witness.push(wredeem.toRaw());
                    input.witness.fromStack(witness);
                    input.script.fromItems([redeem.toRaw()]);
                    return true;
                }
                // P2WPKH nested within pay-to-scripthash.
                var wpkh = redeem.getWitnessPubkeyhash();
                if (wpkh) {
                    var pkh = Script.fromPubkeyhash(wpkh);
                    var witness = this.scriptVector(pkh, ring);
                    if (!witness)
                        return false;
                    input.witness.fromStack(witness);
                    input.script.fromItems([redeem.toRaw()]);
                    return true;
                }
                // Unknown witness program.
                return false;
            }
            // Regular P2SH.
            var vector_1 = this.scriptVector(redeem, ring);
            if (!vector_1)
                return false;
            vector_1.push(redeem.toRaw());
            input.script.fromStack(vector_1);
            return true;
        }
        // Witness program.
        if (prev.isProgram()) {
            // Bare P2WSH.
            var wsh = prev.getWitnessScripthash();
            if (wsh) {
                var wredeem = ring.getRedeem(wsh);
                if (!wredeem)
                    return false;
                var vector_2 = this.scriptVector(wredeem, ring);
                if (!vector_2)
                    return false;
                vector_2.push(wredeem.toRaw());
                input.witness.fromStack(vector_2);
                return true;
            }
            // Bare P2WPKH.
            var wpkh = prev.getWitnessPubkeyhash();
            if (wpkh) {
                var pkh = Script.fromPubkeyhash(wpkh);
                var vector_3 = this.scriptVector(pkh, ring);
                if (!vector_3)
                    return false;
                input.witness.fromStack(vector_3);
                return true;
            }
            // Bare... who knows?
            return false;
        }
        // Wow, a normal output! Praise be to Jengus and Gord.
        var vector = this.scriptVector(prev, ring);
        if (!vector)
            return false;
        input.script.fromStack(vector);
        return true;
    };
    /**
     * Build script for a single vector
     * based on a previous script.
     * @param {Script} prev
     * @param {Buffer} ring
     * @return {Stack}
     */
    MTX.prototype.scriptVector = function (prev, ring) {
        // P2PK
        var pk = prev.getPubkey();
        if (pk) {
            if (!pk.equals(ring.publicKey))
                return null;
            var stack = new Stack();
            stack.pushInt(0);
            return stack;
        }
        // P2PKH
        var pkh = prev.getPubkeyhash();
        if (pkh) {
            if (!pkh.equals(ring.getKeyHash()))
                return null;
            var stack = new Stack();
            stack.pushInt(0);
            stack.pushData(ring.publicKey);
            return stack;
        }
        // Multisig
        var _a = prev.getMultisig(), n = _a[1];
        if (n !== -1) {
            if (prev.indexOf(ring.publicKey) === -1)
                return null;
            // Technically we should create m signature slots,
            // but we create n signature slots so we can order
            // the signatures properly.
            var stack = new Stack();
            stack.pushInt(0);
            // Fill script with `n` signature slots.
            for (var i = 0; i < n; i++)
                stack.pushInt(0);
            return stack;
        }
        return null;
    };
    /**
     * Sign a transaction input on the worker pool
     * (if workers are enabled).
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @param {SighashType?} type
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    MTX.prototype.signInputAsync = function (index, coin, ring, type, pool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!pool)
                            return [2 /*return*/, this.signInput(index, coin, ring, type)];
                        return [4 /*yield*/, pool.signInput(this, index, coin, ring, type, pool)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sign an input.
     * @param {Number} index - Index of input being signed.
     * @param {Coin|Output} coin
     * @param {KeyRing} ring - Private key.
     * @param {SighashType} type
     * @returns {Boolean} Whether the input was able to be signed.
     */
    MTX.prototype.signInput = function (index, coin, ring, type) {
        var input = this.inputs[index];
        var key = ring.privateKey;
        assert(input, 'Input does not exist.');
        assert(coin, 'No coin passed.');
        // Get the previous output's script
        var value = coin.value;
        var prev = coin.script;
        var vector = input.script;
        var version = 0;
        var redeem = false;
        // Grab regular p2sh redeem script.
        if (prev.isScripthash()) {
            prev = input.script.getRedeem();
            if (!prev)
                throw new Error('Input has not been templated.');
            redeem = true;
        }
        // If the output script is a witness program,
        // we have to switch the vector to the witness
        // and potentially alter the length. Note that
        // witnesses are stack items, so the `dummy`
        // _has_ to be an empty buffer (what OP_0
        // pushes onto the stack).
        if (prev.isWitnessScripthash()) {
            prev = input.witness.getRedeem();
            if (!prev)
                throw new Error('Input has not been templated.');
            vector = input.witness;
            redeem = true;
            version = 1;
        }
        else {
            var wpkh = prev.getWitnessPubkeyhash();
            if (wpkh) {
                prev = Script.fromPubkeyhash(wpkh);
                vector = input.witness;
                redeem = false;
                version = 1;
            }
        }
        // Create our signature.
        var sig = this.signature(index, prev, value, key, type, version);
        if (redeem) {
            var stack_1 = vector.toStack();
            var redeem_1 = stack_1.pop();
            var result_1 = this.signVector(prev, stack_1, sig, ring);
            if (!result_1)
                return false;
            result_1.push(redeem_1);
            vector.fromStack(result_1);
            return true;
        }
        var stack = vector.toStack();
        var result = this.signVector(prev, stack, sig, ring);
        if (!result)
            return false;
        vector.fromStack(result);
        return true;
    };
    /**
     * Add a signature to a vector
     * based on a previous script.
     * @param {Script} prev
     * @param {Stack} vector
     * @param {Buffer} sig
     * @param {KeyRing} ring
     * @return {Boolean}
     */
    MTX.prototype.signVector = function (prev, vector, sig, ring) {
        // P2PK
        var pk = prev.getPubkey();
        if (pk) {
            // Make sure the pubkey is ours.
            if (!ring.publicKey.equals(pk))
                return null;
            if (vector.length === 0)
                throw new Error('Input has not been templated.');
            // Already signed.
            if (vector.get(0).length > 0)
                return vector;
            vector.set(0, sig);
            return vector;
        }
        // P2PKH
        var pkh = prev.getPubkeyhash();
        if (pkh) {
            // Make sure the pubkey hash is ours.
            if (!ring.getKeyHash().equals(pkh))
                return null;
            if (vector.length !== 2)
                throw new Error('Input has not been templated.');
            if (vector.get(1).length === 0)
                throw new Error('Input has not been templated.');
            // Already signed.
            if (vector.get(0).length > 0)
                return vector;
            vector.set(0, sig);
            return vector;
        }
        // Multisig
        var _a = prev.getMultisig(), m = _a[0], n = _a[1];
        if (m !== -1) {
            if (vector.length < 2)
                throw new Error('Input has not been templated.');
            if (vector.get(0).length !== 0)
                throw new Error('Input has not been templated.');
            // Too many signature slots. Abort.
            if (vector.length - 1 > n)
                throw new Error('Input has not been templated.');
            // Count the number of current signatures.
            var total = 0;
            for (var i = 1; i < vector.length; i++) {
                var item = vector.get(i);
                if (item.length > 0)
                    total += 1;
            }
            // Signatures are already finalized.
            if (total === m && vector.length - 1 === m)
                return vector;
            // Add some signature slots for us to use if
            // there was for some reason not enough.
            while (vector.length - 1 < n)
                vector.pushInt(0);
            // Grab the redeem script's keys to figure
            // out where our key should go.
            var keys = [];
            for (var _i = 0, _b = prev.code; _i < _b.length; _i++) {
                var op = _b[_i];
                if (op.data)
                    keys.push(op.data);
            }
            // Find the key index so we can place
            // the signature in the same index.
            var keyIndex = -1;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key.equals(ring.publicKey)) {
                    keyIndex = i;
                    break;
                }
            }
            // Our public key is not in the prev_out
            // script. We tried to sign a transaction
            // that is not redeemable by us.
            if (keyIndex === -1)
                return null;
            // Offset key index by one to turn it into
            // "sig index". Accounts for OP_0 byte at
            // the start.
            keyIndex += 1;
            // Add our signature to the correct slot
            // and increment the total number of
            // signatures.
            if (keyIndex < vector.length && total < m) {
                if (vector.get(keyIndex).length === 0) {
                    vector.set(keyIndex, sig);
                    total += 1;
                }
            }
            // All signatures added. Finalize.
            if (total >= m) {
                // Remove empty slots left over.
                for (var i = vector.length - 1; i >= 1; i--) {
                    var item = vector.get(i);
                    if (item.length === 0)
                        vector.remove(i);
                }
                // Remove signatures which are not required.
                // This should never happen.
                while (total > m) {
                    vector.pop();
                    total -= 1;
                }
                // Sanity checks.
                assert(total === m);
                assert(vector.length - 1 === m);
            }
            return vector;
        }
        return null;
    };
    /**
     * Test whether the transaction is fully-signed.
     * @returns {Boolean}
     */
    MTX.prototype.isSigned = function () {
        for (var i = 0; i < this.inputs.length; i++) {
            var prevout = this.inputs[i].prevout;
            var coin = this.view.getOutput(prevout);
            if (!coin)
                return false;
            if (!this.isInputSigned(i, coin))
                return false;
        }
        return true;
    };
    /**
     * Test whether an input is fully-signed.
     * @param {Number} index
     * @param {Coin|Output} coin
     * @returns {Boolean}
     */
    MTX.prototype.isInputSigned = function (index, coin) {
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert(coin, 'No coin passed.');
        var prev = coin.script;
        var vector = input.script;
        var redeem = false;
        // Grab redeem script if possible.
        if (prev.isScripthash()) {
            prev = input.script.getRedeem();
            if (!prev)
                return false;
            redeem = true;
        }
        // If the output script is a witness program,
        // we have to switch the vector to the witness
        // and potentially alter the length.
        if (prev.isWitnessScripthash()) {
            prev = input.witness.getRedeem();
            if (!prev)
                return false;
            vector = input.witness;
            redeem = true;
        }
        else {
            var wpkh = prev.getWitnessPubkeyhash();
            if (wpkh) {
                prev = Script.fromPubkeyhash(wpkh);
                vector = input.witness;
                redeem = false;
            }
        }
        var stack = vector.toStack();
        if (redeem)
            stack.pop();
        return this.isVectorSigned(prev, stack);
    };
    /**
     * Test whether a vector is fully-signed.
     * @param {Script} prev
     * @param {Stack} vector
     * @returns {Boolean}
     */
    MTX.prototype.isVectorSigned = function (prev, vector) {
        if (prev.isPubkey()) {
            if (vector.length !== 1)
                return false;
            if (vector.get(0).length === 0)
                return false;
            return true;
        }
        if (prev.isPubkeyhash()) {
            if (vector.length !== 2)
                return false;
            if (vector.get(0).length === 0)
                return false;
            if (vector.get(1).length === 0)
                return false;
            return true;
        }
        var m = prev.getMultisig()[0];
        if (m !== -1) {
            // Ensure we have the correct number
            // of required signatures.
            if (vector.length - 1 !== m)
                return false;
            // Ensure all members are signatures.
            for (var i = 1; i < vector.length; i++) {
                var item = vector.get(i);
                if (item.length === 0)
                    return false;
            }
            return true;
        }
        return false;
    };
    /**
     * Build input scripts (or witnesses).
     * @param {KeyRing} ring - Address used to sign. The address
     * must be able to redeem the coin.
     * @returns {Number} Number of inputs templated.
     */
    MTX.prototype.template = function (ring) {
        if (Array.isArray(ring)) {
            var total_1 = 0;
            for (var _i = 0, ring_1 = ring; _i < ring_1.length; _i++) {
                var key = ring_1[_i];
                total_1 += this.template(key);
            }
            return total_1;
        }
        var total = 0;
        for (var i = 0; i < this.inputs.length; i++) {
            var prevout = this.inputs[i].prevout;
            var coin = this.view.getOutput(prevout);
            if (!coin)
                continue;
            if (!ring.ownOutput(coin))
                continue;
            // Build script for input
            if (!this.scriptInput(i, coin, ring))
                continue;
            total += 1;
        }
        return total;
    };
    /**
     * Build input scripts (or witnesses) and sign the inputs.
     * @param {KeyRing} ring - Address used to sign. The address
     * must be able to redeem the coin.
     * @param {SighashType} type
     * @returns {Number} Number of inputs signed.
     */
    MTX.prototype.sign = function (ring, type) {
        if (Array.isArray(ring)) {
            var total_2 = 0;
            for (var _i = 0, ring_2 = ring; _i < ring_2.length; _i++) {
                var key = ring_2[_i];
                total_2 += this.sign(key, type);
            }
            return total_2;
        }
        assert(ring.privateKey, 'No private key available.');
        var total = 0;
        for (var i = 0; i < this.inputs.length; i++) {
            var prevout = this.inputs[i].prevout;
            var coin = this.view.getOutput(prevout);
            if (!coin)
                continue;
            if (!ring.ownOutput(coin))
                continue;
            // Build script for input
            if (!this.scriptInput(i, coin, ring))
                continue;
            // Sign input
            if (!this.signInput(i, coin, ring, type))
                continue;
            total += 1;
        }
        return total;
    };
    /**
     * Sign the transaction inputs on the worker pool
     * (if workers are enabled).
     * @param {KeyRing} ring
     * @param {SighashType?} type
     * @param {WorkerPool?} pool
     * @returns {Promise}
     */
    MTX.prototype.signAsync = function (ring, type, pool) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!pool)
                            return [2 /*return*/, this.sign(ring, type)];
                        return [4 /*yield*/, pool.sign(this, ring, type)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Estimate maximum possible size.
     * @param {Function?} getAccount - Returns account that can spend
     * from a given address.
     * @returns {Number}
     */
    MTX.prototype.estimateSize = function (getAccount) {
        return __awaiter(this, void 0, void 0, function () {
            var total, _i, _a, output, _b, _c, input, coin, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        total = 0;
                        // Version
                        total += 4;
                        // timelock
                        total += 4;
                        // Number of inputs
                        total += encoding.sizeVarint(this.inputs.length);
                        // Number of outputs
                        total += encoding.sizeVarint(this.outputs.length);
                        // since outputs are final, we can get final size
                        for (_i = 0, _a = this.outputs; _i < _a.length; _i++) {
                            output = _a[_i];
                            total += output.getSize();
                        }
                        // Assume it's a witness txin
                        // Witness marker and flag
                        total += 2;
                        _b = 0, _c = this.inputs;
                        _e.label = 1;
                    case 1:
                        if (!(_b < _c.length)) return [3 /*break*/, 4];
                        input = _c[_b];
                        coin = this.view.getCoinFor(input);
                        // We're out of luck here.
                        // Just assume it's a p2pkh.
                        if (!coin) {
                            total += 110;
                            return [3 /*break*/, 3];
                        }
                        _d = total;
                        return [4 /*yield*/, coin.estimateSpendingSize(getAccount)];
                    case 2:
                        total = _d + _e.sent();
                        _e.label = 3;
                    case 3:
                        _b++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, total];
                }
            });
        });
    };
    /**
     * Select necessary coins based on total output value.
     * @param {Coin[]} coins
     * @param {Object?} options
     * @returns {CoinSelection}
     * @throws on not enough funds available.
     */
    MTX.prototype.selectCoins = function (coins, options) {
        var selector = new CoinSelector(this, options);
        return selector.select(coins);
    };
    /**
     * Attempt to subtract a fee from a single output.
     * @param {Number} index
     * @param {Amount} fee
     */
    MTX.prototype.subtractIndex = function (index, fee) {
        assert(typeof index === 'number');
        assert(typeof fee === 'number');
        var output = this.outputs[index];
        if (!output)
            throw new Error('Subtraction index does not exist.');
        if (output.value < fee + output.getDustThreshold())
            throw new Error('Could not subtract fee.');
        output.value -= fee;
    };
    /**
     * Attempt to subtract a fee from all outputs evenly.
     * @param {Amount} fee
     */
    MTX.prototype.subtractFee = function (fee) {
        assert(typeof fee === 'number');
        var outputs = 0;
        for (var _i = 0, _a = this.outputs; _i < _a.length; _i++) {
            var output = _a[_i];
            // Ignore nulldatas and
            // other OP_RETURN scripts.
            if (output.script.isUnspendable())
                continue;
            outputs += 1;
        }
        if (outputs === 0)
            throw new Error('Could not subtract fee.');
        var left = fee % outputs;
        var share = (fee - left) / outputs;
        // First pass, remove even shares.
        for (var _b = 0, _c = this.outputs; _b < _c.length; _b++) {
            var output = _c[_b];
            if (output.script.isUnspendable())
                continue;
            if (output.value < share + output.getDustThreshold())
                throw new Error('Could not subtract fee.');
            output.value -= share;
        }
        // Second pass, remove the remainder
        // for the one unlucky output.
        for (var _d = 0, _e = this.outputs; _d < _e.length; _d++) {
            var output = _e[_d];
            if (output.script.isUnspendable())
                continue;
            if (output.value >= left + output.getDustThreshold()) {
                output.value -= left;
                return;
            }
        }
        throw new Error('Could not subtract fee.');
    };
    /**
     * Select coins and fill the inputs.
     * @param {Coin[]} coins
     * @param {Object} options - See {@link MTX#selectCoins} options.
     * @returns {CoinSelector}
     */
    MTX.prototype.fund = function (coins, options) {
        return __awaiter(this, void 0, void 0, function () {
            var select, _i, _a, coin, index, output;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assert(options, 'Options are required.');
                        assert(options.changeAddress, 'Change address is required.');
                        assert(this.inputs.length === 0, 'TX is already funded.');
                        return [4 /*yield*/, this.selectCoins(coins, options)];
                    case 1:
                        select = _b.sent();
                        // Add coins to transaction.
                        for (_i = 0, _a = select.chosen; _i < _a.length; _i++) {
                            coin = _a[_i];
                            this.addCoin(coin);
                        }
                        // Attempt to subtract fee.
                        if (select.subtractFee) {
                            index = select.subtractIndex;
                            if (index !== -1)
                                this.subtractIndex(index, select.fee);
                            else
                                this.subtractFee(select.fee);
                        }
                        output = new Output();
                        output.value = select.change;
                        output.script.fromAddress(select.changeAddress);
                        if (output.isDust(policy.MIN_RELAY)) {
                            // Do nothing. Change is added to fee.
                            this.changeIndex = -1;
                            assert.strictEqual(this.getFee(), select.fee + select.change);
                        }
                        else {
                            this.outputs.push(output);
                            this.changeIndex = this.outputs.length - 1;
                            assert.strictEqual(this.getFee(), select.fee);
                        }
                        return [2 /*return*/, select];
                }
            });
        });
    };
    /**
     * Sort inputs and outputs according to BIP69.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki
     */
    MTX.prototype.sortMembers = function () {
        var changeOutput = null;
        if (this.changeIndex !== -1) {
            changeOutput = this.outputs[this.changeIndex];
            assert(changeOutput);
        }
        this.inputs.sort(sortInputs);
        this.outputs.sort(sortOutputs);
        if (this.changeIndex !== -1) {
            this.changeIndex = this.outputs.indexOf(changeOutput);
            assert(this.changeIndex !== -1);
        }
    };
    /**
     * Avoid fee sniping.
     * @param {Number} - Current chain height.
     * @see bitcoin/src/wallet/wallet.cpp
     */
    MTX.prototype.avoidFeeSniping = function (height) {
        assert(typeof height === 'number', 'Must pass in height.');
        if ((Math.random() * 10 | 0) === 0) {
            height -= Math.random() * 100 | 0;
            if (height < 0)
                height = 0;
        }
        this.setLocktime(height);
    };
    /**
     * Set locktime and sequences appropriately.
     * @param {Number} locktime
     */
    MTX.prototype.setLocktime = function (locktime) {
        assert((locktime >>> 0) === locktime, 'Locktime must be a uint32.');
        assert(this.inputs.length > 0, 'Cannot set sequence with no inputs.');
        for (var _i = 0, _a = this.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            if (input.sequence === 0xffffffff)
                input.sequence = 0xfffffffe;
        }
        this.locktime = locktime;
    };
    /**
     * Set sequence locktime.
     * @param {Number} index - Input index.
     * @param {Number} locktime
     * @param {Boolean?} seconds
     */
    MTX.prototype.setSequence = function (index, locktime, seconds) {
        var input = this.inputs[index];
        assert(input, 'Input does not exist.');
        assert((locktime >>> 0) === locktime, 'Locktime must be a uint32.');
        this.version = 2;
        if (seconds) {
            locktime >>>= consensus.SEQUENCE_GRANULARITY;
            locktime &= consensus.SEQUENCE_MASK;
            locktime |= consensus.SEQUENCE_TYPE_FLAG;
        }
        else {
            locktime &= consensus.SEQUENCE_MASK;
        }
        input.sequence = locktime;
    };
    /**
     * Inspect the transaction.
     * @returns {Object}
     */
    MTX.prototype[inspectSymbol] = function () {
        return this.format();
    };
    /**
     * Inspect the transaction.
     * @returns {Object}
     */
    MTX.prototype.format = function () {
        return _super.prototype.format.call(this, this.view);
    };
    /**
     * Convert transaction to JSON.
     * @returns {Object}
     */
    MTX.prototype.toJSON = function () {
        return _super.prototype.toJSON.call(this, null, this.view);
    };
    /**
     * Convert transaction to JSON.
     * @param {Network} network
     * @returns {Object}
     */
    MTX.prototype.getJSON = function (network) {
        return _super.prototype.getJSON.call(this, network, this.view);
    };
    /**
     * Inject properties from a json object
     * @param {Object} json
     */
    MTX.prototype.fromJSON = function (json) {
        _super.prototype.fromJSON.call(this, json);
        for (var i = 0; i < json.inputs.length; i++) {
            var input = json.inputs[i];
            var prevout = input.prevout;
            if (!input.coin)
                continue;
            var coin = Coin.fromJSON(input.coin);
            coin.hash = util.fromRev(prevout.hash);
            coin.index = prevout.index;
            this.view.addCoin(coin);
        }
        return this;
    };
    /**
     * Instantiate a transaction from a
     * jsonified transaction object.
     * @param {Object} json - The jsonified transaction object.
     * @returns {MTX}
     */
    MTX.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Instantiate a transaction from a buffer reader.
     * @param {BufferReader} br
     * @returns {MTX}
     */
    MTX.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate a transaction from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {MTX}
     */
    MTX.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Convert the MTX to a TX.
     * @returns {TX}
     */
    MTX.prototype.toTX = function () {
        return new TX().inject(this);
    };
    /**
     * Convert the MTX to a TX.
     * @returns {Array} [tx, view]
     */
    MTX.prototype.commit = function () {
        return [this.toTX(), this.view];
    };
    /**
     * Instantiate MTX from TX.
     * @param {TX} tx
     * @returns {MTX}
     */
    MTX.fromTX = function (tx) {
        return new this().inject(tx);
    };
    /**
     * Test whether an object is an MTX.
     * @param {Object} obj
     * @returns {Boolean}
     */
    MTX.isMTX = function (obj) {
        return obj instanceof MTX;
    };
    return MTX;
}(TX));
/**
 * Coin Selector
 * @alias module:primitives.CoinSelector
 */
var CoinSelector = /** @class */ (function () {
    /**
     * Create a coin selector.
     * @constructor
     * @param {TX} tx
     * @param {Object?} options
     */
    function CoinSelector(tx, options) {
        this.tx = tx.clone();
        this.coins = [];
        this.outputValue = 0;
        this.index = 0;
        this.chosen = [];
        this.change = 0;
        this.fee = CoinSelector.MIN_FEE;
        this.selection = 'value';
        this.subtractFee = false;
        this.subtractIndex = -1;
        this.height = -1;
        this.depth = -1;
        this.hardFee = -1;
        this.rate = CoinSelector.FEE_RATE;
        this.maxFee = -1;
        this.round = false;
        this.changeAddress = null;
        this.inputs = new BufferMap();
        // Needed for size estimation.
        this.getAccount = null;
        this.injectInputs();
        if (options)
            this.fromOptions(options);
    }
    /**
     * Initialize selector options.
     * @param {Object} options
     * @private
     */
    CoinSelector.prototype.fromOptions = function (options) {
        if (options.selection) {
            assert(typeof options.selection === 'string');
            this.selection = options.selection;
        }
        if (options.subtractFee != null) {
            if (typeof options.subtractFee === 'number') {
                assert(Number.isSafeInteger(options.subtractFee));
                assert(options.subtractFee >= -1);
                this.subtractIndex = options.subtractFee;
                this.subtractFee = this.subtractIndex !== -1;
            }
            else {
                assert(typeof options.subtractFee === 'boolean');
                this.subtractFee = options.subtractFee;
            }
        }
        if (options.subtractIndex != null) {
            assert(Number.isSafeInteger(options.subtractIndex));
            assert(options.subtractIndex >= -1);
            this.subtractIndex = options.subtractIndex;
            this.subtractFee = this.subtractIndex !== -1;
        }
        if (options.height != null) {
            assert(Number.isSafeInteger(options.height));
            assert(options.height >= -1);
            this.height = options.height;
        }
        if (options.confirmations != null) {
            assert(Number.isSafeInteger(options.confirmations));
            assert(options.confirmations >= -1);
            this.depth = options.confirmations;
        }
        if (options.depth != null) {
            assert(Number.isSafeInteger(options.depth));
            assert(options.depth >= -1);
            this.depth = options.depth;
        }
        if (options.hardFee != null) {
            assert(Number.isSafeInteger(options.hardFee));
            assert(options.hardFee >= -1);
            this.hardFee = options.hardFee;
        }
        if (options.rate != null) {
            assert(Number.isSafeInteger(options.rate));
            assert(options.rate >= 0);
            this.rate = options.rate;
        }
        if (options.maxFee != null) {
            assert(Number.isSafeInteger(options.maxFee));
            assert(options.maxFee >= -1);
            this.maxFee = options.maxFee;
        }
        if (options.round != null) {
            assert(typeof options.round === 'boolean');
            this.round = options.round;
        }
        if (options.changeAddress) {
            var addr = options.changeAddress;
            if (typeof addr === 'string') {
                this.changeAddress = Address.fromString(addr);
            }
            else {
                assert(addr instanceof Address);
                this.changeAddress = addr;
            }
        }
        if (options.getAccount) {
            assert(typeof options.getAccount === 'function');
            this.getAccount = options.getAccount;
        }
        if (options.inputs) {
            assert(Array.isArray(options.inputs));
            for (var i = 0; i < options.inputs.length; i++) {
                var prevout = options.inputs[i];
                assert(prevout && typeof prevout === 'object');
                var hash = prevout.hash, index = prevout.index;
                assert(Buffer.isBuffer(hash));
                assert(typeof index === 'number');
                this.inputs.set(Outpoint.toKey(hash, index), i);
            }
        }
        return this;
    };
    /**
     * Attempt to inject existing inputs.
     * @private
     */
    CoinSelector.prototype.injectInputs = function () {
        if (this.tx.inputs.length > 0) {
            for (var i = 0; i < this.tx.inputs.length; i++) {
                var prevout = this.tx.inputs[i].prevout;
                this.inputs.set(prevout.toKey(), i);
            }
        }
    };
    /**
     * Initialize the selector with coins to select from.
     * @param {Coin[]} coins
     */
    CoinSelector.prototype.init = function (coins) {
        this.coins = coins.slice();
        this.outputValue = this.tx.getOutputValue();
        this.index = 0;
        this.chosen = [];
        this.change = 0;
        this.fee = CoinSelector.MIN_FEE;
        this.tx.inputs.length = 0;
        switch (this.selection) {
            case 'all':
            case 'random':
                this.coins.sort(sortRandom);
                break;
            case 'age':
                this.coins.sort(sortAge);
                break;
            case 'value':
                this.coins.sort(sortValue);
                break;
            default:
                throw new FundingError("Bad selection type: ".concat(this.selection, "."));
        }
    };
    /**
     * Calculate total value required.
     * @returns {Amount}
     */
    CoinSelector.prototype.total = function () {
        if (this.subtractFee)
            return this.outputValue;
        return this.outputValue + this.fee;
    };
    /**
     * Test whether the selector has
     * completely funded the transaction.
     * @returns {Boolean}
     */
    CoinSelector.prototype.isFull = function () {
        return this.tx.getInputValue() >= this.total();
    };
    /**
     * Test whether a coin is spendable
     * with regards to the options.
     * @param {Coin} coin
     * @returns {Boolean}
     */
    CoinSelector.prototype.isSpendable = function (coin) {
        if (this.tx.view.hasEntry(coin))
            return false;
        if (this.height === -1)
            return true;
        if (coin.coinbase) {
            if (coin.height === -1)
                return false;
            if (this.height + 1 < coin.height + consensus.COINBASE_MATURITY)
                return false;
            return true;
        }
        if (this.depth === -1)
            return true;
        var depth = coin.getDepth(this.height);
        if (depth < this.depth)
            return false;
        return true;
    };
    /**
     * Get the current fee based on a size.
     * @param {Number} size
     * @returns {Amount}
     */
    CoinSelector.prototype.getFee = function (size) {
        // This is mostly here for testing.
        // i.e. A fee rounded to the nearest
        // kb is easier to predict ahead of time.
        if (this.round) {
            var fee_1 = policy.getRoundFee(size, this.rate);
            return Math.min(fee_1, CoinSelector.MAX_FEE);
        }
        var fee = policy.getMinFee(size, this.rate);
        return Math.min(fee, CoinSelector.MAX_FEE);
    };
    /**
     * Fund the transaction with more
     * coins if the `output value + fee`
     * total was updated.
     */
    CoinSelector.prototype.fund = function () {
        // Ensure all preferred inputs first.
        if (this.inputs.size > 0) {
            var coins = [];
            for (var i = 0; i < this.inputs.size; i++)
                coins.push(null);
            for (var _i = 0, _a = this.coins; _i < _a.length; _i++) {
                var coin = _a[_i];
                var hash = coin.hash, index = coin.index;
                var key = Outpoint.toKey(hash, index);
                var i = this.inputs.get(key);
                if (i != null) {
                    coins[i] = coin;
                    this.inputs["delete"](key);
                }
            }
            if (this.inputs.size > 0)
                throw new Error('Could not resolve preferred inputs.');
            for (var _b = 0, coins_1 = coins; _b < coins_1.length; _b++) {
                var coin = coins_1[_b];
                this.tx.addCoin(coin);
                this.chosen.push(coin);
            }
        }
        while (this.index < this.coins.length) {
            var coin = this.coins[this.index++];
            if (!this.isSpendable(coin))
                continue;
            this.tx.addCoin(coin);
            this.chosen.push(coin);
            if (this.selection === 'all')
                continue;
            if (this.isFull())
                break;
        }
    };
    /**
     * Initiate selection from `coins`.
     * @param {Coin[]} coins
     * @returns {CoinSelector}
     */
    CoinSelector.prototype.select = function (coins) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.init(coins);
                        if (!(this.hardFee !== -1)) return [3 /*break*/, 1];
                        this.selectHard();
                        return [3 /*break*/, 3];
                    case 1: 
                    // This is potentially asynchronous:
                    // it may invoke the size estimator
                    // required for redeem scripts (we
                    // may be calling out to a wallet
                    // or something similar).
                    return [4 /*yield*/, this.selectEstimate()];
                    case 2:
                        // This is potentially asynchronous:
                        // it may invoke the size estimator
                        // required for redeem scripts (we
                        // may be calling out to a wallet
                        // or something similar).
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!this.isFull()) {
                            // Still failing to get enough funds.
                            throw new FundingError('Not enough funds.', this.tx.getInputValue(), this.total());
                        }
                        // How much money is left after filling outputs.
                        this.change = this.tx.getInputValue() - this.total();
                        return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Initialize selection based on size estimate.
     */
    CoinSelector.prototype.selectEstimate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var change, size;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Set minimum fee and do
                        // an initial round of funding.
                        this.fee = CoinSelector.MIN_FEE;
                        this.fund();
                        change = new Output();
                        if (this.changeAddress) {
                            change.script.fromAddress(this.changeAddress);
                        }
                        else {
                            // In case we don't have a change address,
                            // we use a fake p2pkh output to gauge size.
                            change.script.fromPubkeyhash(Buffer.allocUnsafe(20));
                        }
                        this.tx.outputs.push(change);
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.tx.estimateSize(this.getAccount)];
                    case 2:
                        size = _a.sent();
                        this.fee = this.getFee(size);
                        if (this.maxFee > 0 && this.fee > this.maxFee)
                            throw new FundingError('Fee is too high.');
                        // Failed to get enough funds, add more coins.
                        if (!this.isFull())
                            this.fund();
                        _a.label = 3;
                    case 3:
                        if (!this.isFull() && this.index < this.coins.length) return [3 /*break*/, 1];
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initiate selection based on a hard fee.
     */
    CoinSelector.prototype.selectHard = function () {
        this.fee = Math.min(this.hardFee, CoinSelector.MAX_FEE);
        this.fund();
    };
    return CoinSelector;
}());
/**
 * Default fee rate
 * for coin selection.
 * @const {Amount}
 * @default
 */
CoinSelector.FEE_RATE = 10000;
/**
 * Minimum fee to start with
 * during coin selection.
 * @const {Amount}
 * @default
 */
CoinSelector.MIN_FEE = 10000;
/**
 * Maximum fee to allow
 * after coin selection.
 * @const {Amount}
 * @default
 */
CoinSelector.MAX_FEE = consensus.COIN / 10;
/**
 * Funding Error
 * An error thrown from the coin selector.
 * @ignore
 * @extends Error
 * @property {String} message - Error message.
 * @property {Amount} availableFunds
 * @property {Amount} requiredFunds
 */
var FundingError = /** @class */ (function (_super) {
    __extends(FundingError, _super);
    /**
     * Create a funding error.
     * @constructor
     * @param {String} msg
     * @param {Amount} available
     * @param {Amount} required
     */
    function FundingError(msg, available, required) {
        var _this = _super.call(this) || this;
        _this.type = 'FundingError';
        _this.message = msg;
        _this.availableFunds = -1;
        _this.requiredFunds = -1;
        if (available != null) {
            _this.message += " (available=".concat(Amount.btc(available), ",");
            _this.message += " required=".concat(Amount.btc(required), ")");
            _this.availableFunds = available;
            _this.requiredFunds = required;
        }
        if (Error.captureStackTrace)
            Error.captureStackTrace(_this, FundingError);
        return _this;
    }
    return FundingError;
}(Error));
/*
 * Helpers
 */
function sortAge(a, b) {
    a = a.height === -1 ? 0x7fffffff : a.height;
    b = b.height === -1 ? 0x7fffffff : b.height;
    return a - b;
}
function sortRandom(a, b) {
    return Math.random() > 0.5 ? 1 : -1;
}
function sortValue(a, b) {
    if (a.height === -1 && b.height !== -1)
        return 1;
    if (a.height !== -1 && b.height === -1)
        return -1;
    return b.value - a.value;
}
function sortInputs(a, b) {
    return a.compare(b);
}
function sortOutputs(a, b) {
    return a.compare(b);
}
/*
 * Expose
 */
exports = MTX;
exports.MTX = MTX;
exports.Selector = CoinSelector;
exports.FundingError = FundingError;
module.exports = exports;
