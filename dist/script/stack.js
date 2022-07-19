/*!
 * stack.js - stack object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var common = require('./common');
var ScriptNum = require('./scriptnum');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Stack
 * Represents the stack of a Script during execution.
 * @alias module:script.Stack
 * @property {Buffer[]} items - Stack items.
 * @property {Number} length - Size of stack.
 */
var Stack = /** @class */ (function () {
    /**
     * Create a stack.
     * @constructor
     * @param {Buffer[]?} items - Stack items.
     */
    function Stack(items) {
        this.items = items || [];
    }
    Object.defineProperty(Stack.prototype, "length", {
        /**
         * Get length.
         * @returns {Number}
         */
        get: function () {
            return this.items.length;
        },
        /**
         * Set length.
         * @param {Number} value
         */
        set: function (value) {
            this.items.length = value;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Instantiate a value-only iterator.
     * @returns {StackIterator}
     */
    Stack.prototype[Symbol.iterator] = function () {
        return this.items[Symbol.iterator]();
    };
    /**
     * Instantiate a value-only iterator.
     * @returns {StackIterator}
     */
    Stack.prototype.values = function () {
        return this.items.values();
    };
    /**
     * Instantiate a key and value iterator.
     * @returns {StackIterator}
     */
    Stack.prototype.entries = function () {
        return this.items.entries();
    };
    /**
     * Inspect the stack.
     * @returns {String} Human-readable stack.
     */
    Stack.prototype[inspectSymbol] = function () {
        return "<Stack: ".concat(this.toString(), ">");
    };
    /**
     * Convert the stack to a string.
     * @returns {String} Human-readable stack.
     */
    Stack.prototype.toString = function () {
        var out = [];
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            out.push(item.toString('hex'));
        }
        return out.join(' ');
    };
    /**
     * Format the stack as bitcoind asm.
     * @param {Boolean?} decode - Attempt to decode hash types.
     * @returns {String} Human-readable script.
     */
    Stack.prototype.toASM = function (decode) {
        var out = [];
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            out.push(common.toASM(item, decode));
        }
        return out.join(' ');
    };
    /**
     * Clone the stack.
     * @returns {Stack} Cloned stack.
     */
    Stack.prototype.clone = function () {
        return new this.constructor(this.items.slice());
    };
    /**
     * Clear the stack.
     * @returns {Stack}
     */
    Stack.prototype.clear = function () {
        this.items.length = 0;
        return this;
    };
    /**
     * Get a stack item by index.
     * @param {Number} index
     * @returns {Buffer|null}
     */
    Stack.prototype.get = function (index) {
        if (index < 0)
            index += this.items.length;
        if (index < 0 || index >= this.items.length)
            return null;
        return this.items[index];
    };
    /**
     * Pop a stack item.
     * @see Array#pop
     * @returns {Buffer|null}
     */
    Stack.prototype.pop = function () {
        var item = this.items.pop();
        return item || null;
    };
    /**
     * Shift a stack item.
     * @see Array#shift
     * @returns {Buffer|null}
     */
    Stack.prototype.shift = function () {
        var item = this.items.shift();
        return item || null;
    };
    /**
     * Remove an item.
     * @param {Number} index
     * @returns {Buffer}
     */
    Stack.prototype.remove = function (index) {
        if (index < 0)
            index += this.items.length;
        if (index < 0 || index >= this.items.length)
            return null;
        var items = this.items.splice(index, 1);
        if (items.length === 0)
            return null;
        return items[0];
    };
    /**
     * Set stack item at index.
     * @param {Number} index
     * @param {Buffer} value
     * @returns {Buffer}
     */
    Stack.prototype.set = function (index, item) {
        if (index < 0)
            index += this.items.length;
        assert(Buffer.isBuffer(item));
        assert(index >= 0 && index <= this.items.length);
        this.items[index] = item;
        return this;
    };
    /**
     * Push item onto stack.
     * @see Array#push
     * @param {Buffer} item
     * @returns {Number} Stack size.
     */
    Stack.prototype.push = function (item) {
        assert(Buffer.isBuffer(item));
        this.items.push(item);
        return this;
    };
    /**
     * Unshift item from stack.
     * @see Array#unshift
     * @param {Buffer} item
     * @returns {Number}
     */
    Stack.prototype.unshift = function (item) {
        assert(Buffer.isBuffer(item));
        this.items.unshift(item);
        return this;
    };
    /**
     * Insert an item.
     * @param {Number} index
     * @param {Buffer} item
     * @returns {Buffer}
     */
    Stack.prototype.insert = function (index, item) {
        if (index < 0)
            index += this.items.length;
        assert(Buffer.isBuffer(item));
        assert(index >= 0 && index <= this.items.length);
        this.items.splice(index, 0, item);
        return this;
    };
    /**
     * Erase stack items.
     * @param {Number} start
     * @param {Number} end
     * @returns {Buffer[]}
     */
    Stack.prototype.erase = function (start, end) {
        if (start < 0)
            start = this.items.length + start;
        if (end < 0)
            end = this.items.length + end;
        this.items.splice(start, end - start);
    };
    /**
     * Swap stack values.
     * @param {Number} i1 - Index 1.
     * @param {Number} i2 - Index 2.
     */
    Stack.prototype.swap = function (i1, i2) {
        if (i1 < 0)
            i1 = this.items.length + i1;
        if (i2 < 0)
            i2 = this.items.length + i2;
        var v1 = this.items[i1];
        var v2 = this.items[i2];
        this.items[i1] = v2;
        this.items[i2] = v1;
    };
    /*
     * Data
     */
    Stack.prototype.getData = function (index) {
        return this.get(index);
    };
    Stack.prototype.popData = function () {
        return this.pop();
    };
    Stack.prototype.shiftData = function () {
        return this.shift();
    };
    Stack.prototype.removeData = function (index) {
        return this.remove(index);
    };
    Stack.prototype.setData = function (index, data) {
        return this.set(index, data);
    };
    Stack.prototype.pushData = function (data) {
        return this.push(data);
    };
    Stack.prototype.unshiftData = function (data) {
        return this.unshift(data);
    };
    Stack.prototype.insertData = function (index, data) {
        return this.insert(index, data);
    };
    /*
     * Length
     */
    Stack.prototype.getLength = function (index) {
        var item = this.get(index);
        return item ? item.length : -1;
    };
    /*
     * String
     */
    Stack.prototype.getString = function (index, enc) {
        var item = this.get(index);
        return item ? Stack.toString(item, enc) : null;
    };
    Stack.prototype.popString = function (enc) {
        var item = this.pop();
        return item ? Stack.toString(item, enc) : null;
    };
    Stack.prototype.shiftString = function (enc) {
        var item = this.shift();
        return item ? Stack.toString(item, enc) : null;
    };
    Stack.prototype.removeString = function (index, enc) {
        var item = this.remove(index);
        return item ? Stack.toString(item, enc) : null;
    };
    Stack.prototype.setString = function (index, str, enc) {
        return this.set(index, Stack.fromString(str, enc));
    };
    Stack.prototype.pushString = function (str, enc) {
        return this.push(Stack.fromString(str, enc));
    };
    Stack.prototype.unshiftString = function (str, enc) {
        return this.unshift(Stack.fromString(str, enc));
    };
    Stack.prototype.insertString = function (index, str, enc) {
        return this.insert(index, Stack.fromString(str, enc));
    };
    /*
     * Num
     */
    Stack.prototype.getNum = function (index, minimal, limit) {
        var item = this.get(index);
        return item ? Stack.toNum(item, minimal, limit) : null;
    };
    Stack.prototype.popNum = function (minimal, limit) {
        var item = this.pop();
        return item ? Stack.toNum(item, minimal, limit) : null;
    };
    Stack.prototype.shiftNum = function (minimal, limit) {
        var item = this.shift();
        return item ? Stack.toNum(item, minimal, limit) : null;
    };
    Stack.prototype.removeNum = function (index, minimal, limit) {
        var item = this.remove(index);
        return item ? Stack.toNum(item, minimal, limit) : null;
    };
    Stack.prototype.setNum = function (index, num) {
        return this.set(index, Stack.fromNum(num));
    };
    Stack.prototype.pushNum = function (num) {
        return this.push(Stack.fromNum(num));
    };
    Stack.prototype.unshiftNum = function (num) {
        return this.unshift(Stack.fromNum(num));
    };
    Stack.prototype.insertNum = function (index, num) {
        return this.insert(index, Stack.fromNum(num));
    };
    /*
     * Int
     */
    Stack.prototype.getInt = function (index, minimal, limit) {
        var item = this.get(index);
        return item ? Stack.toInt(item, minimal, limit) : -1;
    };
    Stack.prototype.popInt = function (minimal, limit) {
        var item = this.pop();
        return item ? Stack.toInt(item, minimal, limit) : -1;
    };
    Stack.prototype.shiftInt = function (minimal, limit) {
        var item = this.shift();
        return item ? Stack.toInt(item, minimal, limit) : -1;
    };
    Stack.prototype.removeInt = function (index, minimal, limit) {
        var item = this.remove(index);
        return item ? Stack.toInt(item, minimal, limit) : -1;
    };
    Stack.prototype.setInt = function (index, num) {
        return this.set(index, Stack.fromInt(num));
    };
    Stack.prototype.pushInt = function (num) {
        return this.push(Stack.fromInt(num));
    };
    Stack.prototype.unshiftInt = function (num) {
        return this.unshift(Stack.fromInt(num));
    };
    Stack.prototype.insertInt = function (index, num) {
        return this.insert(index, Stack.fromInt(num));
    };
    /*
     * Bool
     */
    Stack.prototype.getBool = function (index) {
        var item = this.get(index);
        return item ? Stack.toBool(item) : false;
    };
    Stack.prototype.popBool = function () {
        var item = this.pop();
        return item ? Stack.toBool(item) : false;
    };
    Stack.prototype.shiftBool = function () {
        var item = this.shift();
        return item ? Stack.toBool(item) : false;
    };
    Stack.prototype.removeBool = function (index) {
        var item = this.remove(index);
        return item ? Stack.toBool(item) : false;
    };
    Stack.prototype.setBool = function (index, value) {
        return this.set(index, Stack.fromBool(value));
    };
    Stack.prototype.pushBool = function (value) {
        return this.push(Stack.fromBool(value));
    };
    Stack.prototype.unshiftBool = function (value) {
        return this.unshift(Stack.fromBool(value));
    };
    Stack.prototype.insertBool = function (index, value) {
        return this.insert(index, Stack.fromBool(value));
    };
    /**
     * Test an object to see if it is a Stack.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Stack.isStack = function (obj) {
        return obj instanceof Stack;
    };
    /*
     * Encoding
     */
    Stack.toString = function (item, enc) {
        assert(Buffer.isBuffer(item));
        return item.toString(enc || 'utf8');
    };
    Stack.fromString = function (str, enc) {
        assert(typeof str === 'string');
        return Buffer.from(str, enc || 'utf8');
    };
    Stack.toNum = function (item, minimal, limit) {
        return ScriptNum.decode(item, minimal, limit);
    };
    Stack.fromNum = function (num) {
        assert(ScriptNum.isScriptNum(num));
        return num.encode();
    };
    Stack.toInt = function (item, minimal, limit) {
        var num = Stack.toNum(item, minimal, limit);
        return num.getInt();
    };
    Stack.fromInt = function (int) {
        assert(typeof int === 'number');
        if (int >= -1 && int <= 16)
            return common.small[int + 1];
        var num = ScriptNum.fromNumber(int);
        return Stack.fromNum(num);
    };
    Stack.toBool = function (item) {
        assert(Buffer.isBuffer(item));
        for (var i = 0; i < item.length; i++) {
            if (item[i] !== 0) {
                // Cannot be negative zero
                if (i === item.length - 1 && item[i] === 0x80)
                    return false;
                return true;
            }
        }
        return false;
    };
    Stack.fromBool = function (value) {
        assert(typeof value === 'boolean');
        return Stack.fromInt(value ? 1 : 0);
    };
    return Stack;
}());
/*
 * Expose
 */
module.exports = Stack;
