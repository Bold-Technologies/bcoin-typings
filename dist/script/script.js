/*!
 * script.js - script interpreter for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var ripemd160 = require('bcrypto/lib/ripemd160');
var sha1 = require('bcrypto/lib/sha1');
var sha256 = require('bcrypto/lib/sha256');
var hash160 = require('bcrypto/lib/hash160');
var hash256 = require('bcrypto/lib/hash256');
var secp256k1 = require('bcrypto/lib/secp256k1');
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var Program = require('./program');
var Opcode = require('./opcode');
var Stack = require('./stack');
var ScriptError = require('./scripterror');
var ScriptNum = require('./scriptnum');
var common = require('./common');
var Address = require('../primitives/address');
var opcodes = common.opcodes;
var scriptTypes = common.types;
var encoding = bio.encoding;
var inspectSymbol = require('../utils').inspectSymbol;
/*
 * Constants
 */
var EMPTY_BUFFER = Buffer.alloc(0);
/**
 * Script
 * Represents a input or output script.
 * @alias module:script.Script
 * @property {Array} code - Parsed script code.
 * @property {Buffer?} raw - Serialized script.
 * @property {Number} length - Number of parsed opcodes.
 */
var Script = /** @class */ (function () {
    /**
     * Create a script.
     * @constructor
     * @param {Buffer|Array|Object} code
     */
    function Script(options) {
        this.raw = EMPTY_BUFFER;
        this.code = [];
        if (options)
            this.fromOptions(options);
    }
    Object.defineProperty(Script.prototype, "length", {
        /**
         * Get length.
         * @returns {Number}
         */
        get: function () {
            return this.code.length;
        },
        /**
         * Set length.
         * @param {Number} value
         */
        set: function (value) {
            this.code.length = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Script.prototype.fromOptions = function (options) {
        assert(options, 'Script data is required.');
        if (Buffer.isBuffer(options))
            return this.fromRaw(options);
        if (Array.isArray(options))
            return this.fromArray(options);
        if (options.raw) {
            if (!options.code)
                return this.fromRaw(options.raw);
            assert(Buffer.isBuffer(options.raw), 'Raw must be a Buffer.');
            this.raw = options.raw;
        }
        if (options.code) {
            if (!options.raw)
                return this.fromArray(options.code);
            assert(Array.isArray(options.code), 'Code must be an array.');
            this.code = options.code;
        }
        return this;
    };
    /**
     * Insantiate script from options object.
     * @param {Object} options
     * @returns {Script}
     */
    Script.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Instantiate a value-only iterator.
     * @returns {ScriptIterator}
     */
    Script.prototype.values = function () {
        return this.code.values();
    };
    /**
     * Instantiate a key and value iterator.
     * @returns {ScriptIterator}
     */
    Script.prototype.entries = function () {
        return this.code.entries();
    };
    /**
     * Instantiate a value-only iterator.
     * @returns {ScriptIterator}
     */
    Script.prototype[Symbol.iterator] = function () {
        return this.code[Symbol.iterator]();
    };
    /**
     * Convert the script to an array of
     * Buffers (pushdatas) and Numbers
     * (opcodes).
     * @returns {Array}
     */
    Script.prototype.toArray = function () {
        return this.code.slice();
    };
    /**
     * Inject properties from an array of
     * of buffers and numbers.
     * @private
     * @param {Array} code
     * @returns {Script}
     */
    Script.prototype.fromArray = function (code) {
        assert(Array.isArray(code));
        this.clear();
        for (var _i = 0, code_1 = code; _i < code_1.length; _i++) {
            var op = code_1[_i];
            this.push(op);
        }
        return this.compile();
    };
    /**
     * Instantiate script from an array
     * of buffers and numbers.
     * @param {Array} code
     * @returns {Script}
     */
    Script.fromArray = function (code) {
        return new this().fromArray(code);
    };
    /**
     * Convert script to stack items.
     * @returns {Buffer[]}
     */
    Script.prototype.toItems = function () {
        var items = [];
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            var data = op.toPush();
            if (!data)
                throw new Error('Non-push opcode in script.');
            items.push(data);
        }
        return items;
    };
    /**
     * Inject data from stack items.
     * @private
     * @param {Buffer[]} items
     * @returns {Script}
     */
    Script.prototype.fromItems = function (items) {
        assert(Array.isArray(items));
        this.clear();
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            this.pushData(item);
        }
        return this.compile();
    };
    /**
     * Instantiate script from stack items.
     * @param {Buffer[]} items
     * @returns {Script}
     */
    Script.fromItems = function (items) {
        return new this().fromItems(items);
    };
    /**
     * Convert script to stack.
     * @returns {Stack}
     */
    Script.prototype.toStack = function () {
        return new Stack(this.toItems());
    };
    /**
     * Inject data from stack.
     * @private
     * @param {Stack} stack
     * @returns {Script}
     */
    Script.prototype.fromStack = function (stack) {
        return this.fromItems(stack.items);
    };
    /**
     * Instantiate script from stack.
     * @param {Stack} stack
     * @returns {Script}
     */
    Script.fromStack = function (stack) {
        return new this().fromStack(stack);
    };
    /**
     * Clone the script.
     * @returns {Script} Cloned script.
     */
    Script.prototype.clone = function () {
        return new this.constructor().inject(this);
    };
    /**
     * Inject properties from script.
     * Used for cloning.
     * @private
     * @param {Script} script
     * @returns {Script}
     */
    Script.prototype.inject = function (script) {
        this.raw = script.raw;
        this.code = script.code.slice();
        return this;
    };
    /**
     * Test equality against script.
     * @param {Script} script
     * @returns {Boolean}
     */
    Script.prototype.equals = function (script) {
        assert(Script.isScript(script));
        return this.raw.equals(script.raw);
    };
    /**
     * Compare against another script.
     * @param {Script} script
     * @returns {Number}
     */
    Script.prototype.compare = function (script) {
        assert(Script.isScript(script));
        return this.raw.compare(script.raw);
    };
    /**
     * Clear the script.
     * @returns {Script}
     */
    Script.prototype.clear = function () {
        this.raw = EMPTY_BUFFER;
        this.code.length = 0;
        return this;
    };
    /**
     * Inspect the script.
     * @returns {String} Human-readable script code.
     */
    Script.prototype[inspectSymbol] = function () {
        return "<Script: ".concat(this.toString(), ">");
    };
    /**
     * Convert the script to a bitcoind test string.
     * @returns {String} Human-readable script code.
     */
    Script.prototype.toString = function () {
        var out = [];
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            out.push(op.toFormat());
        }
        return out.join(' ');
    };
    /**
     * Format the script as bitcoind asm.
     * @param {Boolean?} decode - Attempt to decode hash types.
     * @returns {String} Human-readable script.
     */
    Script.prototype.toASM = function (decode) {
        if (this.isNulldata())
            decode = false;
        var out = [];
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            out.push(op.toASM(decode));
        }
        return out.join(' ');
    };
    /**
     * Re-encode the script internally. Useful if you
     * changed something manually in the `code` array.
     * @returns {Script}
     */
    Script.prototype.compile = function () {
        if (this.code.length === 0)
            return this.clear();
        var size = 0;
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            size += op.getSize();
        }
        var bw = bio.write(size);
        for (var _b = 0, _c = this.code; _b < _c.length; _b++) {
            var op = _c[_b];
            op.toWriter(bw);
        }
        this.raw = bw.render();
        return this;
    };
    /**
     * Write the script to a buffer writer.
     * @param {BufferWriter} bw
     */
    Script.prototype.toWriter = function (bw) {
        bw.writeVarBytes(this.raw);
        return bw;
    };
    /**
     * Encode the script to a Buffer. See {@link Script#encode}.
     * @param {String} enc - Encoding, either `'hex'` or `null`.
     * @returns {Buffer|String} Serialized script.
     */
    Script.prototype.toRaw = function () {
        return this.raw;
    };
    /**
     * Convert script to a hex string.
     * @returns {String}
     */
    Script.prototype.toJSON = function () {
        return this.toRaw().toString('hex');
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {String} json
     */
    Script.prototype.fromJSON = function (json) {
        assert(typeof json === 'string', 'Code must be a string.');
        return this.fromRaw(Buffer.from(json, 'hex'));
    };
    /**
     * Instantiate script from a hex string.
     * @params {String} json
     * @returns {Script}
     */
    Script.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Get the script's "subscript" starting at a separator.
     * @param {Number} index - The last separator to sign/verify beyond.
     * @returns {Script} Subscript.
     */
    Script.prototype.getSubscript = function (index) {
        if (index === 0)
            return this.clone();
        var script = new Script();
        for (var i = index; i < this.code.length; i++) {
            var op = this.code[i];
            if (op.value === -1)
                break;
            script.code.push(op);
        }
        return script.compile();
    };
    /**
     * Get the script's "subscript" starting at a separator.
     * Remove all OP_CODESEPARATORs if present. This bizarre
     * behavior is necessary for signing and verification when
     * code separators are present.
     * @returns {Script} Subscript.
     */
    Script.prototype.removeSeparators = function () {
        var found = false;
        // Optimizing for the common case:
        // Check for any separators first.
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                break;
            if (op.value === opcodes.OP_CODESEPARATOR) {
                found = true;
                break;
            }
        }
        if (!found)
            return this;
        // Uncommon case: someone actually
        // has a code separator. Go through
        // and remove them all.
        var script = new Script();
        for (var _b = 0, _c = this.code; _b < _c.length; _b++) {
            var op = _c[_b];
            if (op.value === -1)
                break;
            if (op.value !== opcodes.OP_CODESEPARATOR)
                script.code.push(op);
        }
        return script.compile();
    };
    /**
     * Execute and interpret the script.
     * @param {Stack} stack - Script execution stack.
     * @param {Number?} flags - Script standard flags.
     * @param {TX?} tx - Transaction being verified.
     * @param {Number?} index - Index of input being verified.
     * @param {Amount?} value - Previous output value.
     * @param {Number?} version - Signature hash version (0=legacy, 1=segwit).
     * @throws {ScriptError} Will be thrown on VERIFY failures.
     */
    Script.prototype.execute = function (stack, flags, tx, index, value, version) {
        if (flags == null)
            flags = Script.flags.STANDARD_VERIFY_FLAGS;
        if (version == null)
            version = 0;
        if (this.raw.length > consensus.MAX_SCRIPT_SIZE)
            throw new ScriptError('SCRIPT_SIZE');
        var state = [];
        var alt = [];
        var lastSep = 0;
        var opCount = 0;
        var negate = 0;
        var minimal = false;
        if (flags & Script.flags.VERIFY_MINIMALDATA)
            minimal = true;
        for (var ip = 0; ip < this.code.length; ip++) {
            var op = this.code[ip];
            if (op.value === -1)
                throw new ScriptError('BAD_OPCODE', op, ip);
            if (op.data && op.data.length > consensus.MAX_SCRIPT_PUSH)
                throw new ScriptError('PUSH_SIZE', op, ip);
            if (op.value > opcodes.OP_16 && ++opCount > consensus.MAX_SCRIPT_OPS)
                throw new ScriptError('OP_COUNT', op, ip);
            if (op.isDisabled())
                throw new ScriptError('DISABLED_OPCODE', op, ip);
            if (op.value === opcodes.OP_CODESEPARATOR && version === 0 &&
                (flags & Script.flags.VERIFY_CONST_SCRIPTCODE))
                throw new ScriptError('OP_CODESEPARATOR', op, ip);
            if (negate && !op.isBranch()) {
                if (stack.length + alt.length > consensus.MAX_SCRIPT_STACK)
                    throw new ScriptError('STACK_SIZE', op, ip);
                continue;
            }
            if (op.data) {
                if (minimal && !op.isMinimal())
                    throw new ScriptError('MINIMALDATA', op, ip);
                stack.push(op.data);
                if (stack.length + alt.length > consensus.MAX_SCRIPT_STACK)
                    throw new ScriptError('STACK_SIZE', op, ip);
                continue;
            }
            switch (op.value) {
                case opcodes.OP_0: {
                    stack.pushInt(0);
                    break;
                }
                case opcodes.OP_1NEGATE: {
                    stack.pushInt(-1);
                    break;
                }
                case opcodes.OP_1:
                case opcodes.OP_2:
                case opcodes.OP_3:
                case opcodes.OP_4:
                case opcodes.OP_5:
                case opcodes.OP_6:
                case opcodes.OP_7:
                case opcodes.OP_8:
                case opcodes.OP_9:
                case opcodes.OP_10:
                case opcodes.OP_11:
                case opcodes.OP_12:
                case opcodes.OP_13:
                case opcodes.OP_14:
                case opcodes.OP_15:
                case opcodes.OP_16: {
                    stack.pushInt(op.value - 0x50);
                    break;
                }
                case opcodes.OP_NOP: {
                    break;
                }
                case opcodes.OP_CHECKLOCKTIMEVERIFY: {
                    // OP_CHECKLOCKTIMEVERIFY = OP_NOP2
                    if (!(flags & Script.flags.VERIFY_CHECKLOCKTIMEVERIFY))
                        break;
                    if (!tx)
                        throw new ScriptError('UNKNOWN_ERROR', 'No TX passed in.');
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var num = stack.getNum(-1, minimal, 5);
                    if (num.isNeg())
                        throw new ScriptError('NEGATIVE_LOCKTIME', op, ip);
                    var locktime = num.toDouble();
                    if (!tx.verifyLocktime(index, locktime))
                        throw new ScriptError('UNSATISFIED_LOCKTIME', op, ip);
                    break;
                }
                case opcodes.OP_CHECKSEQUENCEVERIFY: {
                    // OP_CHECKSEQUENCEVERIFY = OP_NOP3
                    if (!(flags & Script.flags.VERIFY_CHECKSEQUENCEVERIFY))
                        break;
                    if (!tx)
                        throw new ScriptError('UNKNOWN_ERROR', 'No TX passed in.');
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var num = stack.getNum(-1, minimal, 5);
                    if (num.isNeg())
                        throw new ScriptError('NEGATIVE_LOCKTIME', op, ip);
                    var locktime = num.toDouble();
                    if (!tx.verifySequence(index, locktime))
                        throw new ScriptError('UNSATISFIED_LOCKTIME', op, ip);
                    break;
                }
                case opcodes.OP_NOP1:
                case opcodes.OP_NOP4:
                case opcodes.OP_NOP5:
                case opcodes.OP_NOP6:
                case opcodes.OP_NOP7:
                case opcodes.OP_NOP8:
                case opcodes.OP_NOP9:
                case opcodes.OP_NOP10: {
                    if (flags & Script.flags.VERIFY_DISCOURAGE_UPGRADABLE_NOPS)
                        throw new ScriptError('DISCOURAGE_UPGRADABLE_NOPS', op, ip);
                    break;
                }
                case opcodes.OP_IF:
                case opcodes.OP_NOTIF: {
                    var val = false;
                    if (!negate) {
                        if (stack.length < 1)
                            throw new ScriptError('UNBALANCED_CONDITIONAL', op, ip);
                        if (version === 1 && (flags & Script.flags.VERIFY_MINIMALIF)) {
                            var item = stack.get(-1);
                            if (item.length > 1)
                                throw new ScriptError('MINIMALIF');
                            if (item.length === 1 && item[0] !== 1)
                                throw new ScriptError('MINIMALIF');
                        }
                        val = stack.getBool(-1);
                        if (op.value === opcodes.OP_NOTIF)
                            val = !val;
                        stack.pop();
                    }
                    state.push(val);
                    if (!val)
                        negate += 1;
                    break;
                }
                case opcodes.OP_ELSE: {
                    if (state.length === 0)
                        throw new ScriptError('UNBALANCED_CONDITIONAL', op, ip);
                    state[state.length - 1] = !state[state.length - 1];
                    if (!state[state.length - 1])
                        negate += 1;
                    else
                        negate -= 1;
                    break;
                }
                case opcodes.OP_ENDIF: {
                    if (state.length === 0)
                        throw new ScriptError('UNBALANCED_CONDITIONAL', op, ip);
                    if (!state.pop())
                        negate -= 1;
                    break;
                }
                case opcodes.OP_VERIFY: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    if (!stack.getBool(-1))
                        throw new ScriptError('VERIFY', op, ip);
                    stack.pop();
                    break;
                }
                case opcodes.OP_RETURN: {
                    throw new ScriptError('OP_RETURN', op, ip);
                }
                case opcodes.OP_TOALTSTACK: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    alt.push(stack.pop());
                    break;
                }
                case opcodes.OP_FROMALTSTACK: {
                    if (alt.length === 0)
                        throw new ScriptError('INVALID_ALTSTACK_OPERATION', op, ip);
                    stack.push(alt.pop());
                    break;
                }
                case opcodes.OP_2DROP: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.pop();
                    stack.pop();
                    break;
                }
                case opcodes.OP_2DUP: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var v1 = stack.get(-2);
                    var v2 = stack.get(-1);
                    stack.push(v1);
                    stack.push(v2);
                    break;
                }
                case opcodes.OP_3DUP: {
                    if (stack.length < 3)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var v1 = stack.get(-3);
                    var v2 = stack.get(-2);
                    var v3 = stack.get(-1);
                    stack.push(v1);
                    stack.push(v2);
                    stack.push(v3);
                    break;
                }
                case opcodes.OP_2OVER: {
                    if (stack.length < 4)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var v1 = stack.get(-4);
                    var v2 = stack.get(-3);
                    stack.push(v1);
                    stack.push(v2);
                    break;
                }
                case opcodes.OP_2ROT: {
                    if (stack.length < 6)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var v1 = stack.get(-6);
                    var v2 = stack.get(-5);
                    stack.erase(-6, -4);
                    stack.push(v1);
                    stack.push(v2);
                    break;
                }
                case opcodes.OP_2SWAP: {
                    if (stack.length < 4)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.swap(-4, -2);
                    stack.swap(-3, -1);
                    break;
                }
                case opcodes.OP_IFDUP: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    if (stack.getBool(-1)) {
                        var val = stack.get(-1);
                        stack.push(val);
                    }
                    break;
                }
                case opcodes.OP_DEPTH: {
                    stack.pushInt(stack.length);
                    break;
                }
                case opcodes.OP_DROP: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.pop();
                    break;
                }
                case opcodes.OP_DUP: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(stack.get(-1));
                    break;
                }
                case opcodes.OP_NIP: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.remove(-2);
                    break;
                }
                case opcodes.OP_OVER: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(stack.get(-2));
                    break;
                }
                case opcodes.OP_PICK:
                case opcodes.OP_ROLL: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var num = stack.getInt(-1, minimal, 4);
                    stack.pop();
                    if (num < 0 || num >= stack.length)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var val = stack.get(-num - 1);
                    if (op.value === opcodes.OP_ROLL)
                        stack.remove(-num - 1);
                    stack.push(val);
                    break;
                }
                case opcodes.OP_ROT: {
                    if (stack.length < 3)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.swap(-3, -2);
                    stack.swap(-2, -1);
                    break;
                }
                case opcodes.OP_SWAP: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.swap(-2, -1);
                    break;
                }
                case opcodes.OP_TUCK: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.insert(-2, stack.get(-1));
                    break;
                }
                case opcodes.OP_SIZE: {
                    if (stack.length < 1)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.pushInt(stack.get(-1).length);
                    break;
                }
                case opcodes.OP_EQUAL:
                case opcodes.OP_EQUALVERIFY: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var v1 = stack.get(-2);
                    var v2 = stack.get(-1);
                    var res = v1.equals(v2);
                    stack.pop();
                    stack.pop();
                    stack.pushBool(res);
                    if (op.value === opcodes.OP_EQUALVERIFY) {
                        if (!res)
                            throw new ScriptError('EQUALVERIFY', op, ip);
                        stack.pop();
                    }
                    break;
                }
                case opcodes.OP_1ADD:
                case opcodes.OP_1SUB:
                case opcodes.OP_NEGATE:
                case opcodes.OP_ABS:
                case opcodes.OP_NOT:
                case opcodes.OP_0NOTEQUAL: {
                    if (stack.length < 1)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var num = stack.getNum(-1, minimal, 4);
                    var cmp = void 0;
                    switch (op.value) {
                        case opcodes.OP_1ADD:
                            num.iaddn(1);
                            break;
                        case opcodes.OP_1SUB:
                            num.isubn(1);
                            break;
                        case opcodes.OP_NEGATE:
                            num.ineg();
                            break;
                        case opcodes.OP_ABS:
                            num.iabs();
                            break;
                        case opcodes.OP_NOT:
                            cmp = num.isZero();
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_0NOTEQUAL:
                            cmp = !num.isZero();
                            num = ScriptNum.fromBool(cmp);
                            break;
                        default:
                            assert(false, 'Fatal script error.');
                            break;
                    }
                    stack.pop();
                    stack.pushNum(num);
                    break;
                }
                case opcodes.OP_ADD:
                case opcodes.OP_SUB:
                case opcodes.OP_BOOLAND:
                case opcodes.OP_BOOLOR:
                case opcodes.OP_NUMEQUAL:
                case opcodes.OP_NUMEQUALVERIFY:
                case opcodes.OP_NUMNOTEQUAL:
                case opcodes.OP_LESSTHAN:
                case opcodes.OP_GREATERTHAN:
                case opcodes.OP_LESSTHANOREQUAL:
                case opcodes.OP_GREATERTHANOREQUAL:
                case opcodes.OP_MIN:
                case opcodes.OP_MAX: {
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var n1 = stack.getNum(-2, minimal, 4);
                    var n2 = stack.getNum(-1, minimal, 4);
                    var num = void 0, cmp = void 0;
                    switch (op.value) {
                        case opcodes.OP_ADD:
                            num = n1.iadd(n2);
                            break;
                        case opcodes.OP_SUB:
                            num = n1.isub(n2);
                            break;
                        case opcodes.OP_BOOLAND:
                            cmp = n1.toBool() && n2.toBool();
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_BOOLOR:
                            cmp = n1.toBool() || n2.toBool();
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_NUMEQUAL:
                            cmp = n1.eq(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_NUMEQUALVERIFY:
                            cmp = n1.eq(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_NUMNOTEQUAL:
                            cmp = !n1.eq(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_LESSTHAN:
                            cmp = n1.lt(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_GREATERTHAN:
                            cmp = n1.gt(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_LESSTHANOREQUAL:
                            cmp = n1.lte(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_GREATERTHANOREQUAL:
                            cmp = n1.gte(n2);
                            num = ScriptNum.fromBool(cmp);
                            break;
                        case opcodes.OP_MIN:
                            num = ScriptNum.min(n1, n2);
                            break;
                        case opcodes.OP_MAX:
                            num = ScriptNum.max(n1, n2);
                            break;
                        default:
                            assert(false, 'Fatal script error.');
                            break;
                    }
                    stack.pop();
                    stack.pop();
                    stack.pushNum(num);
                    if (op.value === opcodes.OP_NUMEQUALVERIFY) {
                        if (!stack.getBool(-1))
                            throw new ScriptError('NUMEQUALVERIFY', op, ip);
                        stack.pop();
                    }
                    break;
                }
                case opcodes.OP_WITHIN: {
                    if (stack.length < 3)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var n1 = stack.getNum(-3, minimal, 4);
                    var n2 = stack.getNum(-2, minimal, 4);
                    var n3 = stack.getNum(-1, minimal, 4);
                    var val = n2.lte(n1) && n1.lt(n3);
                    stack.pop();
                    stack.pop();
                    stack.pop();
                    stack.pushBool(val);
                    break;
                }
                case opcodes.OP_RIPEMD160: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(ripemd160.digest(stack.pop()));
                    break;
                }
                case opcodes.OP_SHA1: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(sha1.digest(stack.pop()));
                    break;
                }
                case opcodes.OP_SHA256: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(sha256.digest(stack.pop()));
                    break;
                }
                case opcodes.OP_HASH160: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(hash160.digest(stack.pop()));
                    break;
                }
                case opcodes.OP_HASH256: {
                    if (stack.length === 0)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    stack.push(hash256.digest(stack.pop()));
                    break;
                }
                case opcodes.OP_CODESEPARATOR: {
                    lastSep = ip + 1;
                    break;
                }
                case opcodes.OP_CHECKSIG:
                case opcodes.OP_CHECKSIGVERIFY: {
                    if (!tx)
                        throw new ScriptError('UNKNOWN_ERROR', 'No TX passed in.');
                    if (stack.length < 2)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var sig = stack.get(-2);
                    var key = stack.get(-1);
                    var subscript = this.getSubscript(lastSep);
                    if (version === 0) {
                        var found = subscript.findAndDelete(sig);
                        if (found > 0 && (flags & Script.flags.VERIFY_CONST_SCRIPTCODE))
                            throw new ScriptError('SIG_FINDANDDELETE', op, ip);
                    }
                    validateSignature(sig, flags);
                    validateKey(key, flags, version);
                    var res = false;
                    if (sig.length > 0) {
                        var type = sig[sig.length - 1];
                        var hash = tx.signatureHash(index, subscript, value, type, version);
                        res = checksig(hash, sig, key);
                    }
                    if (!res && (flags & Script.flags.VERIFY_NULLFAIL)) {
                        if (sig.length !== 0)
                            throw new ScriptError('NULLFAIL', op, ip);
                    }
                    stack.pop();
                    stack.pop();
                    stack.pushBool(res);
                    if (op.value === opcodes.OP_CHECKSIGVERIFY) {
                        if (!res)
                            throw new ScriptError('CHECKSIGVERIFY', op, ip);
                        stack.pop();
                    }
                    break;
                }
                case opcodes.OP_CHECKMULTISIG:
                case opcodes.OP_CHECKMULTISIGVERIFY: {
                    if (!tx)
                        throw new ScriptError('UNKNOWN_ERROR', 'No TX passed in.');
                    var i = 1;
                    if (stack.length < i)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var n = stack.getInt(-i, minimal, 4);
                    var okey = n + 2;
                    var ikey = void 0, isig = void 0;
                    if (n < 0 || n > consensus.MAX_MULTISIG_PUBKEYS)
                        throw new ScriptError('PUBKEY_COUNT', op, ip);
                    opCount += n;
                    if (opCount > consensus.MAX_SCRIPT_OPS)
                        throw new ScriptError('OP_COUNT', op, ip);
                    i += 1;
                    ikey = i;
                    i += n;
                    if (stack.length < i)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var m = stack.getInt(-i, minimal, 4);
                    if (m < 0 || m > n)
                        throw new ScriptError('SIG_COUNT', op, ip);
                    i += 1;
                    isig = i;
                    i += m;
                    if (stack.length < i)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    var subscript = this.getSubscript(lastSep);
                    for (var j = 0; j < m; j++) {
                        var sig = stack.get(-isig - j);
                        if (version === 0) {
                            var found = subscript.findAndDelete(sig);
                            if (found > 0 && (flags & Script.flags.VERIFY_CONST_SCRIPTCODE))
                                throw new ScriptError('SIG_FINDANDDELETE', op, ip);
                        }
                    }
                    var res = true;
                    while (res && m > 0) {
                        var sig = stack.get(-isig);
                        var key = stack.get(-ikey);
                        validateSignature(sig, flags);
                        validateKey(key, flags, version);
                        if (sig.length > 0) {
                            var type = sig[sig.length - 1];
                            var hash = tx.signatureHash(index, subscript, value, type, version);
                            if (checksig(hash, sig, key)) {
                                isig += 1;
                                m -= 1;
                            }
                        }
                        ikey += 1;
                        n -= 1;
                        if (m > n)
                            res = false;
                    }
                    while (i > 1) {
                        if (!res && (flags & Script.flags.VERIFY_NULLFAIL)) {
                            if (okey === 0 && stack.get(-1).length !== 0)
                                throw new ScriptError('NULLFAIL', op, ip);
                        }
                        if (okey > 0)
                            okey -= 1;
                        stack.pop();
                        i -= 1;
                    }
                    if (stack.length < 1)
                        throw new ScriptError('INVALID_STACK_OPERATION', op, ip);
                    if (flags & Script.flags.VERIFY_NULLDUMMY) {
                        if (stack.get(-1).length !== 0)
                            throw new ScriptError('SIG_NULLDUMMY', op, ip);
                    }
                    stack.pop();
                    stack.pushBool(res);
                    if (op.value === opcodes.OP_CHECKMULTISIGVERIFY) {
                        if (!res)
                            throw new ScriptError('CHECKMULTISIGVERIFY', op, ip);
                        stack.pop();
                    }
                    break;
                }
                default: {
                    throw new ScriptError('BAD_OPCODE', op, ip);
                }
            }
            if (stack.length + alt.length > consensus.MAX_SCRIPT_STACK)
                throw new ScriptError('STACK_SIZE', op, ip);
        }
        if (state.length !== 0)
            throw new ScriptError('UNBALANCED_CONDITIONAL');
    };
    /**
     * Remove all matched data elements from
     * a script's code (used to remove signatures
     * before verification). Note that this
     * compares and removes data on the _byte level_.
     * It also reserializes the data to a single
     * script with minimaldata encoding beforehand.
     * A signature will _not_ be removed if it is
     * not minimaldata.
     * @see https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2014-November/006878.html
     * @see https://test.webbtc.com/tx/19aa42fee0fa57c45d3b16488198b27caaacc4ff5794510d0c17f173f05587ff
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Total.
     */
    Script.prototype.findAndDelete = function (data) {
        var target = Opcode.fromPush(data);
        if (this.raw.length < target.getSize())
            return 0;
        var found = false;
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                break;
            if (op.equals(target)) {
                found = true;
                break;
            }
        }
        if (!found)
            return 0;
        var code = [];
        var total = 0;
        for (var _b = 0, _c = this.code; _b < _c.length; _b++) {
            var op = _c[_b];
            if (op.value === -1)
                break;
            if (op.equals(target)) {
                total += 1;
                continue;
            }
            code.push(op);
        }
        this.code = code;
        this.compile();
        return total;
    };
    /**
     * Find a data element in a script.
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Index (`-1` if not present).
     */
    Script.prototype.indexOf = function (data) {
        for (var i = 0; i < this.code.length; i++) {
            var op = this.code[i];
            if (op.value === -1)
                break;
            if (!op.data)
                continue;
            if (op.data.equals(data))
                return i;
        }
        return -1;
    };
    /**
     * Test a script to see if it is likely
     * to be script code (no weird opcodes).
     * @returns {Boolean}
     */
    Script.prototype.isCode = function () {
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                return false;
            if (op.isDisabled())
                return false;
            switch (op.value) {
                case opcodes.OP_RESERVED:
                case opcodes.OP_NOP:
                case opcodes.OP_VER:
                case opcodes.OP_VERIF:
                case opcodes.OP_VERNOTIF:
                case opcodes.OP_RESERVED1:
                case opcodes.OP_RESERVED2:
                case opcodes.OP_NOP1:
                    return false;
            }
            if (op.value > opcodes.OP_CHECKSEQUENCEVERIFY)
                return false;
        }
        return true;
    };
    /**
     * Inject properties from a pay-to-pubkey script.
     * @private
     * @param {Buffer} key
     */
    Script.prototype.fromPubkey = function (key) {
        assert(Buffer.isBuffer(key) && (key.length === 33 || key.length === 65));
        this.raw = Buffer.allocUnsafe(1 + key.length + 1);
        this.raw[0] = key.length;
        key.copy(this.raw, 1);
        this.raw[1 + key.length] = opcodes.OP_CHECKSIG;
        key = this.raw.slice(1, 1 + key.length);
        this.code.length = 0;
        this.code.push(Opcode.fromPush(key));
        this.code.push(Opcode.fromOp(opcodes.OP_CHECKSIG));
        return this;
    };
    /**
     * Create a pay-to-pubkey script.
     * @param {Buffer} key
     * @returns {Script}
     */
    Script.fromPubkey = function (key) {
        return new this().fromPubkey(key);
    };
    /**
     * Inject properties from a pay-to-pubkeyhash script.
     * @private
     * @param {Buffer} hash
     */
    Script.prototype.fromPubkeyhash = function (hash) {
        assert(Buffer.isBuffer(hash) && hash.length === 20);
        this.raw = Buffer.allocUnsafe(25);
        this.raw[0] = opcodes.OP_DUP;
        this.raw[1] = opcodes.OP_HASH160;
        this.raw[2] = 0x14;
        hash.copy(this.raw, 3);
        this.raw[23] = opcodes.OP_EQUALVERIFY;
        this.raw[24] = opcodes.OP_CHECKSIG;
        hash = this.raw.slice(3, 23);
        this.code.length = 0;
        this.code.push(Opcode.fromOp(opcodes.OP_DUP));
        this.code.push(Opcode.fromOp(opcodes.OP_HASH160));
        this.code.push(Opcode.fromPush(hash));
        this.code.push(Opcode.fromOp(opcodes.OP_EQUALVERIFY));
        this.code.push(Opcode.fromOp(opcodes.OP_CHECKSIG));
        return this;
    };
    /**
     * Create a pay-to-pubkeyhash script.
     * @param {Buffer} hash
     * @returns {Script}
     */
    Script.fromPubkeyhash = function (hash) {
        return new this().fromPubkeyhash(hash);
    };
    /**
     * Inject properties from pay-to-multisig script.
     * @private
     * @param {Number} m
     * @param {Number} n
     * @param {Buffer[]} keys
     */
    Script.prototype.fromMultisig = function (m, n, keys) {
        assert((m & 0xff) === m && (n & 0xff) === n);
        assert(Array.isArray(keys));
        assert(keys.length === n, '`n` keys are required for multisig.');
        assert(m >= 1 && m <= n);
        assert(n >= 1 && n <= 15);
        this.clear();
        this.pushSmall(m);
        for (var _i = 0, _a = sortKeys(keys); _i < _a.length; _i++) {
            var key = _a[_i];
            this.pushData(key);
        }
        this.pushSmall(n);
        this.pushOp(opcodes.OP_CHECKMULTISIG);
        return this.compile();
    };
    /**
     * Create a pay-to-multisig script.
     * @param {Number} m
     * @param {Number} n
     * @param {Buffer[]} keys
     * @returns {Script}
     */
    Script.fromMultisig = function (m, n, keys) {
        return new this().fromMultisig(m, n, keys);
    };
    /**
     * Inject properties from a pay-to-scripthash script.
     * @private
     * @param {Buffer} hash
     */
    Script.prototype.fromScripthash = function (hash) {
        assert(Buffer.isBuffer(hash) && hash.length === 20);
        this.raw = Buffer.allocUnsafe(23);
        this.raw[0] = opcodes.OP_HASH160;
        this.raw[1] = 0x14;
        hash.copy(this.raw, 2);
        this.raw[22] = opcodes.OP_EQUAL;
        hash = this.raw.slice(2, 22);
        this.code.length = 0;
        this.code.push(Opcode.fromOp(opcodes.OP_HASH160));
        this.code.push(Opcode.fromPush(hash));
        this.code.push(Opcode.fromOp(opcodes.OP_EQUAL));
        return this;
    };
    /**
     * Create a pay-to-scripthash script.
     * @param {Buffer} hash
     * @returns {Script}
     */
    Script.fromScripthash = function (hash) {
        return new this().fromScripthash(hash);
    };
    /**
     * Inject properties from a nulldata/opreturn script.
     * @private
     * @param {Buffer} flags
     */
    Script.prototype.fromNulldata = function (flags) {
        assert(Buffer.isBuffer(flags));
        assert(flags.length <= policy.MAX_OP_RETURN, 'Nulldata too large.');
        this.clear();
        this.pushOp(opcodes.OP_RETURN);
        this.pushData(flags);
        return this.compile();
    };
    /**
     * Create a nulldata/opreturn script.
     * @param {Buffer} flags
     * @returns {Script}
     */
    Script.fromNulldata = function (flags) {
        return new this().fromNulldata(flags);
    };
    /**
     * Inject properties from a witness program.
     * @private
     * @param {Number} version
     * @param {Buffer} data
     */
    Script.prototype.fromProgram = function (version, data) {
        assert((version & 0xff) === version && version >= 0 && version <= 16);
        assert(Buffer.isBuffer(data) && data.length >= 2 && data.length <= 40);
        this.raw = Buffer.allocUnsafe(2 + data.length);
        this.raw[0] = version === 0 ? 0 : version + 0x50;
        this.raw[1] = data.length;
        data.copy(this.raw, 2);
        data = this.raw.slice(2, 2 + data.length);
        this.code.length = 0;
        this.code.push(Opcode.fromSmall(version));
        this.code.push(Opcode.fromPush(data));
        return this;
    };
    /**
     * Create a witness program.
     * @param {Number} version
     * @param {Buffer} data
     * @returns {Script}
     */
    Script.fromProgram = function (version, data) {
        return new this().fromProgram(version, data);
    };
    /**
     * Inject properties from an address.
     * @private
     * @param {Address|AddressString} address
     */
    Script.prototype.fromAddress = function (address) {
        if (typeof address === 'string')
            address = Address.fromString(address);
        assert(address instanceof Address, 'Not an address.');
        if (address.isPubkeyhash())
            return this.fromPubkeyhash(address.hash);
        if (address.isScripthash())
            return this.fromScripthash(address.hash);
        if (address.isProgram())
            return this.fromProgram(address.version, address.hash);
        throw new Error('Unknown address type.');
    };
    /**
     * Create an output script from an address.
     * @param {Address|AddressString} address
     * @returns {Script}
     */
    Script.fromAddress = function (address) {
        return new this().fromAddress(address);
    };
    /**
     * Inject properties from a witness block commitment.
     * @private
     * @param {Buffer} hash
     * @param {String|Buffer} flags
     */
    Script.prototype.fromCommitment = function (hash, flags) {
        var bw = bio.write(36);
        bw.writeU32BE(0xaa21a9ed);
        bw.writeHash(hash);
        this.clear();
        this.pushOp(opcodes.OP_RETURN);
        this.pushData(bw.render());
        if (flags)
            this.pushData(flags);
        return this.compile();
    };
    /**
     * Create a witness block commitment.
     * @param {Buffer} hash
     * @param {String|Buffer} flags
     * @returns {Script}
     */
    Script.fromCommitment = function (hash, flags) {
        return new this().fromCommitment(hash, flags);
    };
    /**
     * Grab and deserialize the redeem script.
     * @returns {Script|null} Redeem script.
     */
    Script.prototype.getRedeem = function () {
        var data = null;
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                return null;
            if (op.value > opcodes.OP_16)
                return null;
            data = op.data;
        }
        if (!data)
            return null;
        return Script.fromRaw(data);
    };
    /**
     * Get the standard script type.
     * @returns {ScriptType}
     */
    Script.prototype.getType = function () {
        if (this.isPubkey())
            return scriptTypes.PUBKEY;
        if (this.isPubkeyhash())
            return scriptTypes.PUBKEYHASH;
        if (this.isScripthash())
            return scriptTypes.SCRIPTHASH;
        if (this.isWitnessPubkeyhash())
            return scriptTypes.WITNESSPUBKEYHASH;
        if (this.isWitnessScripthash())
            return scriptTypes.WITNESSSCRIPTHASH;
        if (this.isMultisig())
            return scriptTypes.MULTISIG;
        if (this.isNulldata())
            return scriptTypes.NULLDATA;
        return scriptTypes.NONSTANDARD;
    };
    /**
     * Test whether a script is of an unknown/non-standard type.
     * @returns {Boolean}
     */
    Script.prototype.isUnknown = function () {
        return this.getType() === scriptTypes.NONSTANDARD;
    };
    /**
     * Test whether the script is standard by policy standards.
     * @returns {Boolean}
     */
    Script.prototype.isStandard = function () {
        var _a = this.getMultisig(), m = _a[0], n = _a[1];
        if (m !== -1) {
            if (n < 1 || n > 3)
                return false;
            if (m < 1 || m > n)
                return false;
            return true;
        }
        if (this.isNulldata())
            return this.raw.length <= policy.MAX_OP_RETURN_BYTES;
        return this.getType() !== scriptTypes.NONSTANDARD;
    };
    /**
     * Calculate the size of the script
     * excluding the varint size bytes.
     * @returns {Number}
     */
    Script.prototype.getSize = function () {
        return this.raw.length;
    };
    /**
     * Calculate the size of the script
     * including the varint size bytes.
     * @returns {Number}
     */
    Script.prototype.getVarSize = function () {
        return encoding.sizeVarBytes(this.raw);
    };
    /**
     * "Guess" the address of the input script.
     * This method is not 100% reliable.
     * @returns {Address|null}
     */
    Script.prototype.getInputAddress = function () {
        return Address.fromInputScript(this);
    };
    /**
     * Get the address of the script if present. Note that
     * pubkey and multisig scripts will be treated as though
     * they are pubkeyhash and scripthashes respectively.
     * @returns {Address|null}
     */
    Script.prototype.getAddress = function () {
        return Address.fromScript(this);
    };
    /**
     * Get the hash160 of the raw script.
     * @param {String?} enc
     * @returns {Hash}
     */
    Script.prototype.hash160 = function (enc) {
        var hash = hash160.digest(this.toRaw());
        if (enc === 'hex')
            hash = hash.toString('hex');
        return hash;
    };
    /**
     * Get the sha256 of the raw script.
     * @param {String?} enc
     * @returns {Hash}
     */
    Script.prototype.sha256 = function (enc) {
        var hash = sha256.digest(this.toRaw());
        if (enc === 'hex')
            hash = hash.toString('hex');
        return hash;
    };
    /**
     * Test whether the output script is pay-to-pubkey.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    Script.prototype.isPubkey = function (minimal) {
        if (minimal) {
            return this.raw.length >= 35
                && (this.raw[0] === 33 || this.raw[0] === 65)
                && this.raw[0] + 2 === this.raw.length
                && this.raw[this.raw.length - 1] === opcodes.OP_CHECKSIG;
        }
        if (this.code.length !== 2)
            return false;
        var size = this.getLength(0);
        return (size === 33 || size === 65)
            && this.getOp(1) === opcodes.OP_CHECKSIG;
    };
    /**
     * Get P2PK key if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    Script.prototype.getPubkey = function (minimal) {
        if (!this.isPubkey(minimal))
            return null;
        if (minimal)
            return this.raw.slice(1, 1 + this.raw[0]);
        return this.getData(0);
    };
    /**
     * Test whether the output script is pay-to-pubkeyhash.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    Script.prototype.isPubkeyhash = function (minimal) {
        if (minimal || this.raw.length === 25) {
            return this.raw.length === 25
                && this.raw[0] === opcodes.OP_DUP
                && this.raw[1] === opcodes.OP_HASH160
                && this.raw[2] === 0x14
                && this.raw[23] === opcodes.OP_EQUALVERIFY
                && this.raw[24] === opcodes.OP_CHECKSIG;
        }
        if (this.code.length !== 5)
            return false;
        return this.getOp(0) === opcodes.OP_DUP
            && this.getOp(1) === opcodes.OP_HASH160
            && this.getLength(2) === 20
            && this.getOp(3) === opcodes.OP_EQUALVERIFY
            && this.getOp(4) === opcodes.OP_CHECKSIG;
    };
    /**
     * Get P2PKH hash if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    Script.prototype.getPubkeyhash = function (minimal) {
        if (!this.isPubkeyhash(minimal))
            return null;
        if (minimal)
            return this.raw.slice(3, 23);
        return this.getData(2);
    };
    /**
     * Test whether the output script is pay-to-multisig.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    Script.prototype.isMultisig = function (minimal) {
        if (this.code.length < 4 || this.code.length > 19)
            return false;
        if (this.getOp(-1) !== opcodes.OP_CHECKMULTISIG)
            return false;
        var m = this.getSmall(0);
        if (m < 1)
            return false;
        var n = this.getSmall(-2);
        if (n < 1 || m > n)
            return false;
        if (this.code.length !== n + 3)
            return false;
        for (var i = 1; i < n + 1; i++) {
            var op = this.code[i];
            var size = op.toLength();
            if (size !== 33 && size !== 65)
                return false;
            if (minimal && !op.isMinimal())
                return false;
        }
        return true;
    };
    /**
     * Get multisig m and n values if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Array} [m, n]
     */
    Script.prototype.getMultisig = function (minimal) {
        if (!this.isMultisig(minimal))
            return [-1, -1];
        return [this.getSmall(0), this.getSmall(-2)];
    };
    /**
     * Test whether the output script is pay-to-scripthash. Note that
     * bitcoin itself requires scripthashes to be in strict minimaldata
     * encoding. Using `OP_HASH160 OP_PUSHDATA1 [hash] OP_EQUAL` will
     * _not_ be recognized as a scripthash.
     * @returns {Boolean}
     */
    Script.prototype.isScripthash = function () {
        return this.raw.length === 23
            && this.raw[0] === opcodes.OP_HASH160
            && this.raw[1] === 0x14
            && this.raw[22] === opcodes.OP_EQUAL;
    };
    /**
     * Get P2SH hash if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getScripthash = function () {
        if (!this.isScripthash())
            return null;
        return this.getData(1);
    };
    /**
     * Test whether the output script is nulldata/opreturn.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    Script.prototype.isNulldata = function (minimal) {
        if (this.code.length === 0)
            return false;
        if (this.getOp(0) !== opcodes.OP_RETURN)
            return false;
        if (this.code.length === 1)
            return true;
        if (minimal) {
            if (this.raw.length > policy.MAX_OP_RETURN_BYTES)
                return false;
        }
        for (var i = 1; i < this.code.length; i++) {
            var op = this.code[i];
            if (op.value === -1)
                return false;
            if (op.value > opcodes.OP_16)
                return false;
            if (minimal && !op.isMinimal())
                return false;
        }
        return true;
    };
    /**
     * Get OP_RETURN data if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    Script.prototype.getNulldata = function (minimal) {
        if (!this.isNulldata(minimal))
            return null;
        for (var i = 1; i < this.code.length; i++) {
            var op = this.code[i];
            var data = op.toPush();
            if (data)
                return data;
        }
        return EMPTY_BUFFER;
    };
    /**
     * Test whether the output script is a segregated witness
     * commitment.
     * @returns {Boolean}
     */
    Script.prototype.isCommitment = function () {
        return this.raw.length >= 38
            && this.raw[0] === opcodes.OP_RETURN
            && this.raw[1] === 0x24
            && this.raw.readUInt32BE(2, true) === 0xaa21a9ed;
    };
    /**
     * Get the commitment hash if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getCommitment = function () {
        if (!this.isCommitment())
            return null;
        return this.raw.slice(6, 38);
    };
    /**
     * Test whether the output script is a witness program.
     * Note that this will return true even for malformed
     * witness v0 programs.
     * @return {Boolean}
     */
    Script.prototype.isProgram = function () {
        if (this.raw.length < 4 || this.raw.length > 42)
            return false;
        if (this.raw[0] !== opcodes.OP_0
            && (this.raw[0] < opcodes.OP_1 || this.raw[0] > opcodes.OP_16)) {
            return false;
        }
        if (this.raw[1] + 2 !== this.raw.length)
            return false;
        return true;
    };
    /**
     * Get the witness program if present.
     * @returns {Program|null}
     */
    Script.prototype.getProgram = function () {
        if (!this.isProgram())
            return null;
        var version = this.getSmall(0);
        var data = this.getData(1);
        return new Program(version, data);
    };
    /**
     * Get the script to the equivalent witness
     * program (mimics bitcoind's scriptForWitness).
     * @returns {Script|null}
     */
    Script.prototype.forWitness = function () {
        if (this.isProgram())
            return this.clone();
        var pk = this.getPubkey();
        if (pk) {
            var hash = hash160.digest(pk);
            return Script.fromProgram(0, hash);
        }
        var pkh = this.getPubkeyhash();
        if (pkh)
            return Script.fromProgram(0, pkh);
        return Script.fromProgram(0, this.sha256());
    };
    /**
     * Test whether the output script is
     * a pay-to-witness-pubkeyhash program.
     * @returns {Boolean}
     */
    Script.prototype.isWitnessPubkeyhash = function () {
        return this.raw.length === 22
            && this.raw[0] === opcodes.OP_0
            && this.raw[1] === 0x14;
    };
    /**
     * Get P2WPKH hash if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getWitnessPubkeyhash = function () {
        if (!this.isWitnessPubkeyhash())
            return null;
        return this.getData(1);
    };
    /**
     * Test whether the output script is
     * a pay-to-witness-scripthash program.
     * @returns {Boolean}
     */
    Script.prototype.isWitnessScripthash = function () {
        return this.raw.length === 34
            && this.raw[0] === opcodes.OP_0
            && this.raw[1] === 0x20;
    };
    /**
     * Get P2WSH hash if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getWitnessScripthash = function () {
        if (!this.isWitnessScripthash())
            return null;
        return this.getData(1);
    };
    /**
     * Test whether the output script is unspendable.
     * @returns {Boolean}
     */
    Script.prototype.isUnspendable = function () {
        if (this.raw.length > consensus.MAX_SCRIPT_SIZE)
            return true;
        return this.raw.length > 0 && this.raw[0] === opcodes.OP_RETURN;
    };
    /**
     * "Guess" the type of the input script.
     * This method is not 100% reliable.
     * @returns {ScriptType}
     */
    Script.prototype.getInputType = function () {
        if (this.isPubkeyInput())
            return scriptTypes.PUBKEY;
        if (this.isPubkeyhashInput())
            return scriptTypes.PUBKEYHASH;
        if (this.isScripthashInput())
            return scriptTypes.SCRIPTHASH;
        if (this.isMultisigInput())
            return scriptTypes.MULTISIG;
        return scriptTypes.NONSTANDARD;
    };
    /**
     * "Guess" whether the input script is an unknown/non-standard type.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Script.prototype.isUnknownInput = function () {
        return this.getInputType() === scriptTypes.NONSTANDARD;
    };
    /**
     * "Guess" whether the input script is pay-to-pubkey.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Script.prototype.isPubkeyInput = function () {
        if (this.code.length !== 1)
            return false;
        var size = this.getLength(0);
        return size >= 9 && size <= 73;
    };
    /**
     * Get P2PK signature if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getPubkeyInput = function () {
        if (!this.isPubkeyInput())
            return null;
        return this.getData(0);
    };
    /**
     * "Guess" whether the input script is pay-to-pubkeyhash.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Script.prototype.isPubkeyhashInput = function () {
        if (this.code.length !== 2)
            return false;
        var sig = this.getLength(0);
        var key = this.getLength(1);
        return sig >= 9 && sig <= 73
            && (key === 33 || key === 65);
    };
    /**
     * Get P2PKH signature and key if present.
     * @returns {Array} [sig, key]
     */
    Script.prototype.getPubkeyhashInput = function () {
        if (!this.isPubkeyhashInput())
            return [null, null];
        return [this.getData(0), this.getData(1)];
    };
    /**
     * "Guess" whether the input script is pay-to-multisig.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Script.prototype.isMultisigInput = function () {
        if (this.code.length < 2)
            return false;
        if (this.getOp(0) !== opcodes.OP_0)
            return false;
        if (this.getOp(1) > opcodes.OP_PUSHDATA4)
            return false;
        // We need to rule out scripthash
        // because it may look like multisig.
        if (this.isScripthashInput())
            return false;
        for (var i = 1; i < this.code.length; i++) {
            var size = this.getLength(i);
            if (size < 9 || size > 73)
                return false;
        }
        return true;
    };
    /**
     * Get multisig signatures if present.
     * @returns {Buffer[]|null}
     */
    Script.prototype.getMultisigInput = function () {
        if (!this.isMultisigInput())
            return null;
        var sigs = [];
        for (var i = 1; i < this.code.length; i++)
            sigs.push(this.getData(i));
        return sigs;
    };
    /**
     * "Guess" whether the input script is pay-to-scripthash.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Script.prototype.isScripthashInput = function () {
        if (this.code.length < 1)
            return false;
        // Grab the raw redeem script.
        var raw = this.getData(-1);
        // Last data element should be an array
        // for the redeem script.
        if (!raw)
            return false;
        // Testing for scripthash inputs requires
        // some evil magic to work. We do it by
        // ruling things _out_. This test will not
        // be correct 100% of the time. We rule
        // out that the last data element is: a
        // null dummy, a valid signature, a valid
        // key, and we ensure that it is at least
        // a script that does not use undefined
        // opcodes.
        if (raw.length === 0)
            return false;
        if (common.isSignatureEncoding(raw))
            return false;
        if (common.isKeyEncoding(raw))
            return false;
        var redeem = Script.fromRaw(raw);
        if (!redeem.isCode())
            return false;
        if (redeem.isUnspendable())
            return false;
        if (!this.isPushOnly())
            return false;
        return true;
    };
    /**
     * Get P2SH redeem script if present.
     * @returns {Buffer|null}
     */
    Script.prototype.getScripthashInput = function () {
        if (!this.isScripthashInput())
            return null;
        return this.getData(-1);
    };
    /**
     * Get coinbase height.
     * @returns {Number} `-1` if not present.
     */
    Script.prototype.getCoinbaseHeight = function () {
        return Script.getCoinbaseHeight(this.raw);
    };
    /**
     * Get coinbase height.
     * @param {Buffer} raw - Raw script.
     * @returns {Number} `-1` if not present.
     */
    Script.getCoinbaseHeight = function (raw) {
        if (raw.length === 0)
            return -1;
        if (raw[0] >= opcodes.OP_1 && raw[0] <= opcodes.OP_16)
            return raw[0] - 0x50;
        if (raw[0] > 0x06)
            return -1;
        var op = Opcode.fromRaw(raw);
        var num = op.toNum();
        if (!num)
            return 1;
        if (num.isNeg())
            return -1;
        if (!op.equals(Opcode.fromNum(num)))
            return -1;
        return num.toDouble();
    };
    /**
     * Test the script against a bloom filter.
     * @param {Bloom} filter
     * @returns {Boolean}
     */
    Script.prototype.test = function (filter) {
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                break;
            if (!op.data || op.data.length === 0)
                continue;
            if (filter.test(op.data))
                return true;
        }
        return false;
    };
    /**
     * Test the script to see if it contains only push ops.
     * Push ops are: OP_1NEGATE, OP_0-OP_16 and all PUSHDATAs.
     * @returns {Boolean}
     */
    Script.prototype.isPushOnly = function () {
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                return false;
            if (op.value > opcodes.OP_16)
                return false;
        }
        return true;
    };
    /**
     * Count the sigops in the script.
     * @param {Boolean} accurate - Whether to enable accurate counting. This will
     * take into account the `n` value for OP_CHECKMULTISIG(VERIFY).
     * @returns {Number} sigop count
     */
    Script.prototype.getSigops = function (accurate) {
        var total = 0;
        var lastOp = -1;
        for (var _i = 0, _a = this.code; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op.value === -1)
                break;
            switch (op.value) {
                case opcodes.OP_CHECKSIG:
                case opcodes.OP_CHECKSIGVERIFY:
                    total += 1;
                    break;
                case opcodes.OP_CHECKMULTISIG:
                case opcodes.OP_CHECKMULTISIGVERIFY:
                    if (accurate && lastOp >= opcodes.OP_1 && lastOp <= opcodes.OP_16)
                        total += lastOp - 0x50;
                    else
                        total += consensus.MAX_MULTISIG_PUBKEYS;
                    break;
            }
            lastOp = op.value;
        }
        return total;
    };
    /**
     * Count the sigops in the script, taking into account redeem scripts.
     * @param {Script} input - Input script, needed for access to redeem script.
     * @returns {Number} sigop count
     */
    Script.prototype.getScripthashSigops = function (input) {
        if (!this.isScripthash())
            return this.getSigops(true);
        var redeem = input.getRedeem();
        if (!redeem)
            return 0;
        return redeem.getSigops(true);
    };
    /**
     * Count the sigops in a script, taking into account witness programs.
     * @param {Script} input
     * @param {Witness} witness
     * @returns {Number} sigop count
     */
    Script.prototype.getWitnessSigops = function (input, witness) {
        var program = this.getProgram();
        if (!program) {
            if (this.isScripthash()) {
                var redeem = input.getRedeem();
                if (redeem)
                    program = redeem.getProgram();
            }
        }
        if (!program)
            return 0;
        if (program.version === 0) {
            if (program.data.length === 20)
                return 1;
            if (program.data.length === 32 && witness.items.length > 0) {
                var redeem = witness.getRedeem();
                return redeem.getSigops(true);
            }
        }
        return 0;
    };
    /*
     * Mutation
     */
    Script.prototype.get = function (index) {
        if (index < 0)
            index += this.code.length;
        if (index < 0 || index >= this.code.length)
            return null;
        return this.code[index];
    };
    Script.prototype.pop = function () {
        var op = this.code.pop();
        return op || null;
    };
    Script.prototype.shift = function () {
        var op = this.code.shift();
        return op || null;
    };
    Script.prototype.remove = function (index) {
        if (index < 0)
            index += this.code.length;
        if (index < 0 || index >= this.code.length)
            return null;
        var items = this.code.splice(index, 1);
        if (items.length === 0)
            return null;
        return items[0];
    };
    Script.prototype.set = function (index, op) {
        if (index < 0)
            index += this.code.length;
        assert(Opcode.isOpcode(op));
        assert(index >= 0 && index <= this.code.length);
        this.code[index] = op;
        return this;
    };
    Script.prototype.push = function (op) {
        assert(Opcode.isOpcode(op));
        this.code.push(op);
        return this;
    };
    Script.prototype.unshift = function (op) {
        assert(Opcode.isOpcode(op));
        this.code.unshift(op);
        return this;
    };
    Script.prototype.insert = function (index, op) {
        if (index < 0)
            index += this.code.length;
        assert(Opcode.isOpcode(op));
        assert(index >= 0 && index <= this.code.length);
        this.code.splice(index, 0, op);
        return this;
    };
    /*
     * Op
     */
    Script.prototype.getOp = function (index) {
        var op = this.get(index);
        return op ? op.value : -1;
    };
    Script.prototype.popOp = function () {
        var op = this.pop();
        return op ? op.value : -1;
    };
    Script.prototype.shiftOp = function () {
        var op = this.shift();
        return op ? op.value : -1;
    };
    Script.prototype.removeOp = function (index) {
        var op = this.remove(index);
        return op ? op.value : -1;
    };
    Script.prototype.setOp = function (index, value) {
        return this.set(index, Opcode.fromOp(value));
    };
    Script.prototype.pushOp = function (value) {
        return this.push(Opcode.fromOp(value));
    };
    Script.prototype.unshiftOp = function (value) {
        return this.unshift(Opcode.fromOp(value));
    };
    Script.prototype.insertOp = function (index, value) {
        return this.insert(index, Opcode.fromOp(value));
    };
    /*
     * Data
     */
    Script.prototype.getData = function (index) {
        var op = this.get(index);
        return op ? op.data : null;
    };
    Script.prototype.popData = function () {
        var op = this.pop();
        return op ? op.data : null;
    };
    Script.prototype.shiftData = function () {
        var op = this.shift();
        return op ? op.data : null;
    };
    Script.prototype.removeData = function (index) {
        var op = this.remove(index);
        return op ? op.data : null;
    };
    Script.prototype.setData = function (index, data) {
        return this.set(index, Opcode.fromData(data));
    };
    Script.prototype.pushData = function (data) {
        return this.push(Opcode.fromData(data));
    };
    Script.prototype.unshiftData = function (data) {
        return this.unshift(Opcode.fromData(data));
    };
    Script.prototype.insertData = function (index, data) {
        return this.insert(index, Opcode.fromData(data));
    };
    /*
     * Length
     */
    Script.prototype.getLength = function (index) {
        var op = this.get(index);
        return op ? op.toLength() : -1;
    };
    /*
     * Push
     */
    Script.prototype.getPush = function (index) {
        var op = this.get(index);
        return op ? op.toPush() : null;
    };
    Script.prototype.popPush = function () {
        var op = this.pop();
        return op ? op.toPush() : null;
    };
    Script.prototype.shiftPush = function () {
        var op = this.shift();
        return op ? op.toPush() : null;
    };
    Script.prototype.removePush = function (index) {
        var op = this.remove(index);
        return op ? op.toPush() : null;
    };
    Script.prototype.setPush = function (index, data) {
        return this.set(index, Opcode.fromPush(data));
    };
    Script.prototype.pushPush = function (data) {
        return this.push(Opcode.fromPush(data));
    };
    Script.prototype.unshiftPush = function (data) {
        return this.unshift(Opcode.fromPush(data));
    };
    Script.prototype.insertPush = function (index, data) {
        return this.insert(index, Opcode.fromPush(data));
    };
    /*
     * String
     */
    Script.prototype.getString = function (index, enc) {
        var op = this.get(index);
        return op ? op.toString(enc) : null;
    };
    Script.prototype.popString = function (enc) {
        var op = this.pop();
        return op ? op.toString(enc) : null;
    };
    Script.prototype.shiftString = function (enc) {
        var op = this.shift();
        return op ? op.toString(enc) : null;
    };
    Script.prototype.removeString = function (index, enc) {
        var op = this.remove(index);
        return op ? op.toString(enc) : null;
    };
    Script.prototype.setString = function (index, str, enc) {
        return this.set(index, Opcode.fromString(str, enc));
    };
    Script.prototype.pushString = function (str, enc) {
        return this.push(Opcode.fromString(str, enc));
    };
    Script.prototype.unshiftString = function (str, enc) {
        return this.unshift(Opcode.fromString(str, enc));
    };
    Script.prototype.insertString = function (index, str, enc) {
        return this.insert(index, Opcode.fromString(str, enc));
    };
    /*
     * Small
     */
    Script.prototype.getSmall = function (index) {
        var op = this.get(index);
        return op ? op.toSmall() : -1;
    };
    Script.prototype.popSmall = function () {
        var op = this.pop();
        return op ? op.toSmall() : -1;
    };
    Script.prototype.shiftSmall = function () {
        var op = this.shift();
        return op ? op.toSmall() : -1;
    };
    Script.prototype.removeSmall = function (index) {
        var op = this.remove(index);
        return op ? op.toSmall() : -1;
    };
    Script.prototype.setSmall = function (index, num) {
        return this.set(index, Opcode.fromSmall(num));
    };
    Script.prototype.pushSmall = function (num) {
        return this.push(Opcode.fromSmall(num));
    };
    Script.prototype.unshiftSmall = function (num) {
        return this.unshift(Opcode.fromSmall(num));
    };
    Script.prototype.insertSmall = function (index, num) {
        return this.insert(index, Opcode.fromSmall(num));
    };
    /*
     * Num
     */
    Script.prototype.getNum = function (index, minimal, limit) {
        var op = this.get(index);
        return op ? op.toNum(minimal, limit) : null;
    };
    Script.prototype.popNum = function (minimal, limit) {
        var op = this.pop();
        return op ? op.toNum(minimal, limit) : null;
    };
    Script.prototype.shiftNum = function (minimal, limit) {
        var op = this.shift();
        return op ? op.toNum(minimal, limit) : null;
    };
    Script.prototype.removeNum = function (index, minimal, limit) {
        var op = this.remove(index);
        return op ? op.toNum(minimal, limit) : null;
    };
    Script.prototype.setNum = function (index, num) {
        return this.set(index, Opcode.fromNum(num));
    };
    Script.prototype.pushNum = function (num) {
        return this.push(Opcode.fromNum(num));
    };
    Script.prototype.unshiftNum = function (num) {
        return this.unshift(Opcode.fromNum(num));
    };
    Script.prototype.insertNum = function (index, num) {
        return this.insert(index, Opcode.fromNum(num));
    };
    /*
     * Int
     */
    Script.prototype.getInt = function (index, minimal, limit) {
        var op = this.get(index);
        return op ? op.toInt(minimal, limit) : -1;
    };
    Script.prototype.popInt = function (minimal, limit) {
        var op = this.pop();
        return op ? op.toInt(minimal, limit) : -1;
    };
    Script.prototype.shiftInt = function (minimal, limit) {
        var op = this.shift();
        return op ? op.toInt(minimal, limit) : -1;
    };
    Script.prototype.removeInt = function (index, minimal, limit) {
        var op = this.remove(index);
        return op ? op.toInt(minimal, limit) : -1;
    };
    Script.prototype.setInt = function (index, num) {
        return this.set(index, Opcode.fromInt(num));
    };
    Script.prototype.pushInt = function (num) {
        return this.push(Opcode.fromInt(num));
    };
    Script.prototype.unshiftInt = function (num) {
        return this.unshift(Opcode.fromInt(num));
    };
    Script.prototype.insertInt = function (index, num) {
        return this.insert(index, Opcode.fromInt(num));
    };
    /*
     * Bool
     */
    Script.prototype.getBool = function (index) {
        var op = this.get(index);
        return op ? op.toBool() : false;
    };
    Script.prototype.popBool = function () {
        var op = this.pop();
        return op ? op.toBool() : false;
    };
    Script.prototype.shiftBool = function () {
        var op = this.shift();
        return op ? op.toBool() : false;
    };
    Script.prototype.removeBool = function (index) {
        var op = this.remove(index);
        return op ? op.toBool() : false;
    };
    Script.prototype.setBool = function (index, value) {
        return this.set(index, Opcode.fromBool(value));
    };
    Script.prototype.pushBool = function (value) {
        return this.push(Opcode.fromBool(value));
    };
    Script.prototype.unshiftBool = function (value) {
        return this.unshift(Opcode.fromBool(value));
    };
    Script.prototype.insertBool = function (index, value) {
        return this.insert(index, Opcode.fromBool(value));
    };
    /*
     * Symbol
     */
    Script.prototype.getSym = function (index) {
        var op = this.get(index);
        return op ? op.toSymbol() : null;
    };
    Script.prototype.popSym = function () {
        var op = this.pop();
        return op ? op.toSymbol() : null;
    };
    Script.prototype.shiftSym = function () {
        var op = this.shift();
        return op ? op.toSymbol() : null;
    };
    Script.prototype.removeSym = function (index) {
        var op = this.remove(index);
        return op ? op.toSymbol() : null;
    };
    Script.prototype.setSym = function (index, symbol) {
        return this.set(index, Opcode.fromSymbol(symbol));
    };
    Script.prototype.pushSym = function (symbol) {
        return this.push(Opcode.fromSymbol(symbol));
    };
    Script.prototype.unshiftSym = function (symbol) {
        return this.unshift(Opcode.fromSymbol(symbol));
    };
    Script.prototype.insertSym = function (index, symbol) {
        return this.insert(index, Opcode.fromSymbol(symbol));
    };
    /**
     * Inject properties from bitcoind test string.
     * @private
     * @param {String} items - Script string.
     * @throws Parse error.
     */
    Script.prototype.fromString = function (code) {
        assert(typeof code === 'string');
        code = code.trim();
        if (code.length === 0)
            return this;
        var items = code.split(/\s+/);
        var bw = bio.write();
        for (var _i = 0, items_2 = items; _i < items_2.length; _i++) {
            var item = items_2[_i];
            var symbol = item;
            if (symbol.charCodeAt(0) & 32)
                symbol = symbol.toUpperCase();
            if (!/^OP_/.test(symbol))
                symbol = "OP_".concat(symbol);
            var value = opcodes[symbol];
            if (value == null) {
                if (item[0] === '\'') {
                    assert(item[item.length - 1] === '\'', 'Invalid string.');
                    var str = item.slice(1, -1);
                    var op = Opcode.fromString(str);
                    bw.writeBytes(op.toRaw());
                    continue;
                }
                if (/^-?\d+$/.test(item)) {
                    var num = ScriptNum.fromString(item, 10);
                    var op = Opcode.fromNum(num);
                    bw.writeBytes(op.toRaw());
                    continue;
                }
                assert(item.indexOf('0x') === 0, 'Unknown opcode.');
                var hex = item.substring(2);
                var data = Buffer.from(hex, 'hex');
                assert(data.length === hex.length / 2, 'Invalid hex string.');
                bw.writeBytes(data);
                continue;
            }
            bw.writeU8(value);
        }
        return this.fromRaw(bw.render());
    };
    /**
     * Parse a bitcoind test script
     * string into a script object.
     * @param {String} items - Script string.
     * @returns {Script}
     * @throws Parse error.
     */
    Script.fromString = function (code) {
        return new this().fromString(code);
    };
    /**
     * Verify an input and output script, and a witness if present.
     * @param {Script} input
     * @param {Witness} witness
     * @param {Script} output
     * @param {TX} tx
     * @param {Number} index
     * @param {Amount} value
     * @param {VerifyFlags} flags
     * @throws {ScriptError}
     */
    Script.verify = function (input, witness, output, tx, index, value, flags) {
        if (flags == null)
            flags = Script.flags.STANDARD_VERIFY_FLAGS;
        if (flags & Script.flags.VERIFY_SIGPUSHONLY) {
            if (!input.isPushOnly())
                throw new ScriptError('SIG_PUSHONLY');
        }
        // Setup a stack.
        var stack = new Stack();
        // Execute the input script
        input.execute(stack, flags, tx, index, value, 0);
        // Copy the stack for P2SH
        var copy;
        if (flags & Script.flags.VERIFY_P2SH)
            copy = stack.clone();
        // Execute the previous output script.
        output.execute(stack, flags, tx, index, value, 0);
        // Verify the stack values.
        if (stack.length === 0 || !stack.getBool(-1))
            throw new ScriptError('EVAL_FALSE');
        var hadWitness = false;
        if ((flags & Script.flags.VERIFY_WITNESS) && output.isProgram()) {
            hadWitness = true;
            // Input script must be empty.
            if (input.raw.length !== 0)
                throw new ScriptError('WITNESS_MALLEATED');
            // Verify the program in the output script.
            Script.verifyProgram(witness, output, flags, tx, index, value);
            // Force a cleanstack
            stack.length = 1;
        }
        // If the script is P2SH, execute the real output script
        if ((flags & Script.flags.VERIFY_P2SH) && output.isScripthash()) {
            // P2SH can only have push ops in the scriptSig
            if (!input.isPushOnly())
                throw new ScriptError('SIG_PUSHONLY');
            // Reset the stack
            stack = copy;
            // Stack should not be empty at this point
            if (stack.length === 0)
                throw new ScriptError('EVAL_FALSE');
            // Grab the real redeem script
            var raw = stack.pop();
            var redeem = Script.fromRaw(raw);
            // Execute the redeem script.
            redeem.execute(stack, flags, tx, index, value, 0);
            // Verify the the stack values.
            if (stack.length === 0 || !stack.getBool(-1))
                throw new ScriptError('EVAL_FALSE');
            if ((flags & Script.flags.VERIFY_WITNESS) && redeem.isProgram()) {
                hadWitness = true;
                // Input script must be exactly one push of the redeem script.
                if (!input.raw.equals(Opcode.fromPush(raw).toRaw()))
                    throw new ScriptError('WITNESS_MALLEATED_P2SH');
                // Verify the program in the redeem script.
                Script.verifyProgram(witness, redeem, flags, tx, index, value);
                // Force a cleanstack.
                stack.length = 1;
            }
        }
        // Ensure there is nothing left on the stack.
        if (flags & Script.flags.VERIFY_CLEANSTACK) {
            assert((flags & Script.flags.VERIFY_P2SH) !== 0);
            if (stack.length !== 1)
                throw new ScriptError('CLEANSTACK');
        }
        // If we had a witness but no witness program, fail.
        if (flags & Script.flags.VERIFY_WITNESS) {
            assert((flags & Script.flags.VERIFY_P2SH) !== 0);
            if (!hadWitness && witness.items.length > 0)
                throw new ScriptError('WITNESS_UNEXPECTED');
        }
    };
    /**
     * Verify a witness program. This runs after regular script
     * execution if a witness program is present. It will convert
     * the witness to a stack and execute the program.
     * @param {Witness} witness
     * @param {Script} output
     * @param {VerifyFlags} flags
     * @param {TX} tx
     * @param {Number} index
     * @param {Amount} value
     * @throws {ScriptError}
     */
    Script.verifyProgram = function (witness, output, flags, tx, index, value) {
        var program = output.getProgram();
        assert(program, 'verifyProgram called on non-witness-program.');
        assert((flags & Script.flags.VERIFY_WITNESS) !== 0);
        var stack = witness.toStack();
        var redeem;
        if (program.version === 0) {
            if (program.data.length === 32) {
                if (stack.length === 0)
                    throw new ScriptError('WITNESS_PROGRAM_WITNESS_EMPTY');
                var witnessScript = stack.pop();
                if (!sha256.digest(witnessScript).equals(program.data))
                    throw new ScriptError('WITNESS_PROGRAM_MISMATCH');
                redeem = Script.fromRaw(witnessScript);
            }
            else if (program.data.length === 20) {
                if (stack.length !== 2)
                    throw new ScriptError('WITNESS_PROGRAM_MISMATCH');
                redeem = Script.fromPubkeyhash(program.data);
            }
            else {
                // Failure on version=0 (bad program data length).
                throw new ScriptError('WITNESS_PROGRAM_WRONG_LENGTH');
            }
        }
        else {
            // Anyone can spend (we can return true here
            // if we want to always relay these transactions).
            // Otherwise, if we want to act like an "old"
            // implementation and only accept them in blocks,
            // we can use the regular output script which will
            // succeed in a block, but fail in the mempool
            // due to VERIFY_CLEANSTACK.
            if (flags & Script.flags.VERIFY_DISCOURAGE_UPGRADABLE_WITNESS_PROGRAM)
                throw new ScriptError('DISCOURAGE_UPGRADABLE_WITNESS_PROGRAM');
            return;
        }
        // Witnesses still have push limits.
        for (var j = 0; j < stack.length; j++) {
            if (stack.get(j).length > consensus.MAX_SCRIPT_PUSH)
                throw new ScriptError('PUSH_SIZE');
        }
        // Verify the redeem script.
        redeem.execute(stack, flags, tx, index, value, 1);
        // Verify the stack values.
        if (stack.length !== 1)
            throw new ScriptError('CLEANSTACK');
        if (!stack.getBool(-1))
            throw new ScriptError('EVAL_FALSE');
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    Script.prototype.fromReader = function (br) {
        return this.fromRaw(br.readVarBytes());
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer}
     */
    Script.prototype.fromRaw = function (data) {
        var br = bio.read(data);
        this.raw = data;
        while (br.left())
            this.code.push(Opcode.fromReader(br));
        return this;
    };
    /**
     * Create a script from buffer reader.
     * @param {BufferReader} br
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Script}
     */
    Script.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Create a script from a serialized buffer.
     * @param {Buffer|String} data - Serialized script.
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Script}
     */
    Script.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Test whether an object a Script.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Script.isScript = function (obj) {
        return obj instanceof Script;
    };
    return Script;
}());
/**
 * Script opcodes.
 * @enum {Number}
 * @default
 */
Script.opcodes = common.opcodes;
/**
 * Opcodes by value.
 * @const {RevMap}
 */
Script.opcodesByVal = common.opcodesByVal;
/**
 * Script and locktime flags. See {@link VerifyFlags}.
 * @enum {Number}
 */
Script.flags = common.flags;
/**
 * Sighash Types.
 * @enum {SighashType}
 * @default
 */
Script.hashType = common.hashType;
/**
 * Sighash types by value.
 * @const {RevMap}
 */
Script.hashTypeByVal = common.hashTypeByVal;
/**
 * Output script types.
 * @enum {Number}
 */
Script.types = common.types;
/**
 * Output script types by value.
 * @const {RevMap}
 */
Script.typesByVal = common.typesByVal;
/*
 * Helpers
 */
function sortKeys(keys) {
    return keys.slice().sort(function (a, b) {
        return a.compare(b);
    });
}
/**
 * Test whether the data element is a valid key if VERIFY_STRICTENC is enabled.
 * @param {Buffer} key
 * @param {VerifyFlags?} flags
 * @returns {Boolean}
 * @throws {ScriptError}
 */
function validateKey(key, flags, version) {
    assert(Buffer.isBuffer(key));
    assert(typeof flags === 'number');
    assert(typeof version === 'number');
    if (flags & Script.flags.VERIFY_STRICTENC) {
        if (!common.isKeyEncoding(key))
            throw new ScriptError('PUBKEYTYPE');
    }
    if (version === 1) {
        if (flags & Script.flags.VERIFY_WITNESS_PUBKEYTYPE) {
            if (!common.isCompressedEncoding(key))
                throw new ScriptError('WITNESS_PUBKEYTYPE');
        }
    }
    return true;
}
/**
 * Test whether the data element is a valid signature based
 * on the encoding, S value, and sighash type. Requires
 * VERIFY_DERSIG|VERIFY_LOW_S|VERIFY_STRICTENC, VERIFY_LOW_S
 * and VERIFY_STRING_ENC to be enabled respectively. Note that
 * this will allow zero-length signatures.
 * @param {Buffer} sig
 * @param {VerifyFlags?} flags
 * @returns {Boolean}
 * @throws {ScriptError}
 */
function validateSignature(sig, flags) {
    assert(Buffer.isBuffer(sig));
    assert(typeof flags === 'number');
    // Allow empty sigs
    if (sig.length === 0)
        return true;
    if ((flags & Script.flags.VERIFY_DERSIG)
        || (flags & Script.flags.VERIFY_LOW_S)
        || (flags & Script.flags.VERIFY_STRICTENC)) {
        if (!common.isSignatureEncoding(sig))
            throw new ScriptError('SIG_DER');
    }
    if (flags & Script.flags.VERIFY_LOW_S) {
        if (!common.isLowDER(sig))
            throw new ScriptError('SIG_HIGH_S');
    }
    if (flags & Script.flags.VERIFY_STRICTENC) {
        if (!common.isHashType(sig))
            throw new ScriptError('SIG_HASHTYPE');
    }
    return true;
}
/**
 * Verify a signature, taking into account sighash type.
 * @param {Buffer} msg - Signature hash.
 * @param {Buffer} sig
 * @param {Buffer} key
 * @returns {Boolean}
 */
function checksig(msg, sig, key) {
    return secp256k1.verifyDER(msg, sig.slice(0, -1), key);
}
/*
 * Expose
 */
module.exports = Script;
