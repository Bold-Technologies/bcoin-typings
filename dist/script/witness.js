/*!
 * witness.js - witness object for bcoin
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
var bio = require('bufio');
var Script = require('./script');
var common = require('./common');
var Address = require('../primitives/address');
var Stack = require('./stack');
var encoding = bio.encoding;
var scriptTypes = common.types;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Witness
 * Refers to the witness vector of
 * segregated witness transactions.
 * @alias module:script.Witness
 * @extends Stack
 * @property {Buffer[]} items
 * @property {Script?} redeem
 * @property {Number} length
 */
var Witness = /** @class */ (function (_super) {
    __extends(Witness, _super);
    /**
     * Create a witness.
     * @alias module:script.Witness
     * @constructor
     * @param {Buffer[]|Object} items - Array of
     * stack items.
     * @property {Buffer[]} items
     * @property {Script?} redeem
     * @property {Number} length
     */
    function Witness(options) {
        var _this = _super.call(this) || this;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Witness.prototype.fromOptions = function (options) {
        assert(options, 'Witness data is required.');
        if (Array.isArray(options))
            return this.fromArray(options);
        if (options.items)
            return this.fromArray(options.items);
        return this;
    };
    /**
     * Instantiate witness from options.
     * @param {Object} options
     * @returns {Witness}
     */
    Witness.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Convert witness to an array of buffers.
     * @returns {Buffer[]}
     */
    Witness.prototype.toArray = function () {
        return this.items.slice();
    };
    /**
     * Inject properties from an array of buffers.
     * @private
     * @param {Buffer[]} items
     */
    Witness.prototype.fromArray = function (items) {
        assert(Array.isArray(items));
        this.items = items;
        return this;
    };
    /**
     * Insantiate witness from an array of buffers.
     * @param {Buffer[]} items
     * @returns {Witness}
     */
    Witness.fromArray = function (items) {
        return new this().fromArray(items);
    };
    /**
     * Convert witness to an array of buffers.
     * @returns {Buffer[]}
     */
    Witness.prototype.toItems = function () {
        return this.items.slice();
    };
    /**
     * Inject properties from an array of buffers.
     * @private
     * @param {Buffer[]} items
     */
    Witness.prototype.fromItems = function (items) {
        assert(Array.isArray(items));
        this.items = items;
        return this;
    };
    /**
     * Insantiate witness from an array of buffers.
     * @param {Buffer[]} items
     * @returns {Witness}
     */
    Witness.fromItems = function (items) {
        return new this().fromItems(items);
    };
    /**
     * Convert witness to a stack.
     * @returns {Stack}
     */
    Witness.prototype.toStack = function () {
        return new Stack(this.toArray());
    };
    /**
     * Inject properties from a stack.
     * @private
     * @param {Stack} stack
     */
    Witness.prototype.fromStack = function (stack) {
        return this.fromArray(stack.items);
    };
    /**
     * Insantiate witness from a stack.
     * @param {Stack} stack
     * @returns {Witness}
     */
    Witness.fromStack = function (stack) {
        return new this().fromStack(stack);
    };
    /**
     * Inspect a Witness object.
     * @returns {String} Human-readable script.
     */
    Witness.prototype[inspectSymbol] = function () {
        return "<Witness: ".concat(this.toString(), ">");
    };
    /**
     * Clone the witness object.
     * @returns {Witness} A clone of the current witness object.
     */
    Witness.prototype.clone = function () {
        return new this.constructor().inject(this);
    };
    /**
     * Inject properties from witness.
     * Used for cloning.
     * @private
     * @param {Witness} witness
     * @returns {Witness}
     */
    Witness.prototype.inject = function (witness) {
        this.items = witness.items.slice();
        return this;
    };
    /**
     * Compile witness (NOP).
     * @returns {Witness}
     */
    Witness.prototype.compile = function () {
        return this;
    };
    /**
     * "Guess" the type of the witness.
     * This method is not 100% reliable.
     * @returns {ScriptType}
     */
    Witness.prototype.getInputType = function () {
        if (this.isPubkeyhashInput())
            return scriptTypes.WITNESSPUBKEYHASH;
        if (this.isScripthashInput())
            return scriptTypes.WITNESSSCRIPTHASH;
        return scriptTypes.NONSTANDARD;
    };
    /**
     * "Guess" the address of the witness.
     * This method is not 100% reliable.
     * @returns {Address|null}
     */
    Witness.prototype.getInputAddress = function () {
        return Address.fromWitness(this);
    };
    /**
     * "Test" whether the witness is a pubkey input.
     * Always returns false.
     * @returns {Boolean}
     */
    Witness.prototype.isPubkeyInput = function () {
        return false;
    };
    /**
     * Get P2PK signature if present.
     * Always returns null.
     * @returns {Buffer|null}
     */
    Witness.prototype.getPubkeyInput = function () {
        return null;
    };
    /**
     * "Guess" whether the witness is a pubkeyhash input.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Witness.prototype.isPubkeyhashInput = function () {
        return this.items.length === 2
            && common.isSignatureEncoding(this.items[0])
            && common.isKeyEncoding(this.items[1]);
    };
    /**
     * Get P2PKH signature and key if present.
     * @returns {Array} [sig, key]
     */
    Witness.prototype.getPubkeyhashInput = function () {
        if (!this.isPubkeyhashInput())
            return [null, null];
        return [this.items[0], this.items[1]];
    };
    /**
     * "Test" whether the witness is a multisig input.
     * Always returns false.
     * @returns {Boolean}
     */
    Witness.prototype.isMultisigInput = function () {
        return false;
    };
    /**
     * Get multisig signatures key if present.
     * Always returns null.
     * @returns {Buffer[]|null}
     */
    Witness.prototype.getMultisigInput = function () {
        return null;
    };
    /**
     * "Guess" whether the witness is a scripthash input.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Witness.prototype.isScripthashInput = function () {
        return this.items.length > 0 && !this.isPubkeyhashInput();
    };
    /**
     * Get P2SH redeem script if present.
     * @returns {Buffer|null}
     */
    Witness.prototype.getScripthashInput = function () {
        if (!this.isScripthashInput())
            return null;
        return this.items[this.items.length - 1];
    };
    /**
     * "Guess" whether the witness is an unknown/non-standard type.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    Witness.prototype.isUnknownInput = function () {
        return this.getInputType() === scriptTypes.NONSTANDARD;
    };
    /**
     * Test the witness against a bloom filter.
     * @param {Bloom} filter
     * @returns {Boolean}
     */
    Witness.prototype.test = function (filter) {
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.length === 0)
                continue;
            if (filter.test(item))
                return true;
        }
        return false;
    };
    /**
     * Grab and deserialize the redeem script from the witness.
     * @returns {Script} Redeem script.
     */
    Witness.prototype.getRedeem = function () {
        if (this.items.length === 0)
            return null;
        var redeem = this.items[this.items.length - 1];
        if (!redeem)
            return null;
        return Script.fromRaw(redeem);
    };
    /**
     * Find a data element in a witness.
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Index (`-1` if not present).
     */
    Witness.prototype.indexOf = function (data) {
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.equals(data))
                return i;
        }
        return -1;
    };
    /**
     * Calculate size of the witness
     * excluding the varint size bytes.
     * @returns {Number}
     */
    Witness.prototype.getSize = function () {
        var size = 0;
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            size += encoding.sizeVarBytes(item);
        }
        return size;
    };
    /**
     * Calculate size of the witness
     * including the varint size bytes.
     * @returns {Number}
     */
    Witness.prototype.getVarSize = function () {
        return encoding.sizeVarint(this.items.length) + this.getSize();
    };
    /**
     * Write witness to a buffer writer.
     * @param {BufferWriter} bw
     */
    Witness.prototype.toWriter = function (bw) {
        bw.writeVarint(this.items.length);
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            bw.writeVarBytes(item);
        }
        return bw;
    };
    /**
     * Encode the witness to a Buffer.
     * @param {String} enc - Encoding, either `'hex'` or `null`.
     * @returns {Buffer|String} Serialized script.
     */
    Witness.prototype.toRaw = function () {
        var size = this.getVarSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Convert witness to a hex string.
     * @returns {String}
     */
    Witness.prototype.toJSON = function () {
        return this.toRaw().toString('hex');
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {String} json
     */
    Witness.prototype.fromJSON = function (json) {
        assert(typeof json === 'string', 'Witness must be a string.');
        return this.fromRaw(Buffer.from(json, 'hex'));
    };
    /**
     * Insantiate witness from a hex string.
     * @param {String} json
     * @returns {Witness}
     */
    Witness.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    Witness.prototype.fromReader = function (br) {
        var count = br.readVarint();
        for (var i = 0; i < count; i++)
            this.items.push(br.readVarBytes());
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Witness.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Create a witness from a buffer reader.
     * @param {BufferReader} br
     */
    Witness.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Create a witness from a serialized buffer.
     * @param {Buffer|String} data - Serialized witness.
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Witness}
     */
    Witness.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Inject items from string.
     * @private
     * @param {String|String[]} items
     */
    Witness.prototype.fromString = function (items) {
        if (!Array.isArray(items)) {
            assert(typeof items === 'string');
            items = items.trim();
            if (items.length === 0)
                return this;
            items = items.split(/\s+/);
        }
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            this.items.push(Buffer.from(item, 'hex'));
        }
        return this;
    };
    /**
     * Parse a test script/array
     * string into a witness object. _Must_
     * contain only stack items (no non-push
     * opcodes).
     * @param {String|String[]} items - Script string.
     * @returns {Witness}
     * @throws Parse error.
     */
    Witness.fromString = function (items) {
        return new this().fromString(items);
    };
    /**
     * Test an object to see if it is a Witness.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Witness.isWitness = function (obj) {
        return obj instanceof Witness;
    };
    return Witness;
}(Stack));
/*
 * Expose
 */
module.exports = Witness;
