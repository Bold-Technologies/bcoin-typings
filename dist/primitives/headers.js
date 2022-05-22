/*!
 * headers.js - headers object for bcoin
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
var bio = require('bufio');
var util = require('../utils/util');
var AbstractBlock = require('./abstractblock');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Headers
 * Represents block headers obtained
 * from the network via `headers`.
 * @alias module:primitives.Headers
 * @extends AbstractBlock
 */
var Headers = /** @class */ (function (_super) {
    __extends(Headers, _super);
    /**
     * Create headers.
     * @constructor
     * @param {Object} options
     */
    function Headers(options) {
        var _this = _super.call(this) || this;
        if (options)
            _this.parseOptions(options);
        return _this;
    }
    /**
     * Perform non-contextual
     * verification on the headers.
     * @returns {Boolean}
     */
    Headers.prototype.verifyBody = function () {
        return true;
    };
    /**
     * Get size of the headers.
     * @returns {Number}
     */
    Headers.prototype.getSize = function () {
        return 81;
    };
    /**
     * Serialize the headers to a buffer writer.
     * @param {BufferWriter} bw
     */
    Headers.prototype.toWriter = function (bw) {
        this.writeHead(bw);
        bw.writeVarint(0);
        return bw;
    };
    /**
     * Serialize the headers.
     * @returns {Buffer|String}
     */
    Headers.prototype.toRaw = function () {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {Buffer} data
     */
    Headers.prototype.fromReader = function (br) {
        this.readHead(br);
        br.readVarint();
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Headers.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate headers from buffer reader.
     * @param {BufferReader} br
     * @returns {Headers}
     */
    Headers.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate headers from serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Headers}
     */
    Headers.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Instantiate headers from serialized data.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Headers}
     */
    Headers.fromHead = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromHead(data);
    };
    /**
     * Instantiate headers from a chain entry.
     * @param {ChainEntry} entry
     * @returns {Headers}
     */
    Headers.fromEntry = function (entry) {
        var headers = new this();
        headers.version = entry.version;
        headers.prevBlock = entry.prevBlock;
        headers.merkleRoot = entry.merkleRoot;
        headers.time = entry.time;
        headers.bits = entry.bits;
        headers.nonce = entry.nonce;
        headers._hash = entry.hash;
        headers._hhash = entry.hash;
        return headers;
    };
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    Headers.prototype.toHeaders = function () {
        return this;
    };
    /**
     * Convert the block to a headers object.
     * @param {Block|MerkleBlock} block
     * @returns {Headers}
     */
    Headers.fromBlock = function (block) {
        var headers = new this(block);
        headers._hash = block._hash;
        headers._hhash = block._hhash;
        return headers;
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    Headers.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    Headers.prototype.getJSON = function (network, view, height) {
        return {
            hash: this.rhash(),
            height: height,
            version: this.version,
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            time: this.time,
            bits: this.bits,
            nonce: this.nonce
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    Headers.prototype.fromJSON = function (json) {
        this.parseJSON(json);
        return this;
    };
    /**
     * Instantiate a merkle block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {Headers}
     */
    Headers.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Inspect the headers and return a more
     * user-friendly representation of the data.
     * @returns {Object}
     */
    Headers.prototype[inspectSymbol] = function () {
        return this.format();
    };
    /**
     * Inspect the headers and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    Headers.prototype.format = function (view, height) {
        return {
            hash: this.rhash(),
            height: height != null ? height : -1,
            date: util.date(this.time),
            version: this.version.toString(16),
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            time: this.time,
            bits: this.bits,
            nonce: this.nonce
        };
    };
    /**
     * Test an object to see if it is a Headers object.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Headers.isHeaders = function (obj) {
        return obj instanceof Headers;
    };
    return Headers;
}(AbstractBlock));
/*
 * Expose
 */
module.exports = Headers;
