/*!
 * sigcache.js - signature cache for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var BufferMap = require('buffer-map').BufferMap;
var secp256k1 = require('bcrypto/lib/secp256k1');
/**
 * Signature cache.
 * @alias module:script.SigCache
 * @property {Number} size
 * @property {Hash[]} keys
 * @property {Object} valid
 */
var SigCache = /** @class */ (function () {
    /**
     * Create a signature cache.
     * @constructor
     * @param {Number} [size=10000]
     */
    function SigCache(size) {
        if (size == null)
            size = 10000;
        assert((size >>> 0) === size);
        this.size = size;
        this.keys = [];
        this.valid = new BufferMap();
    }
    /**
     * Resize the sigcache.
     * @param {Number} size
     */
    SigCache.prototype.resize = function (size) {
        assert((size >>> 0) === size);
        this.size = size;
        this.keys.length = 0;
        this.valid.clear();
    };
    /**
     * Add item to the sigcache.
     * Potentially evict a random member.
     * @param {Hash} msg - Sig hash.
     * @param {Buffer} sig
     * @param {Buffer} key
     */
    SigCache.prototype.add = function (msg, sig, key) {
        if (this.size === 0)
            return;
        this.valid.set(msg, new SigCacheEntry(sig, key));
        if (this.keys.length >= this.size) {
            var i = Math.floor(Math.random() * this.keys.length);
            var k = this.keys[i];
            this.valid["delete"](k);
            this.keys[i] = msg;
        }
        else {
            this.keys.push(msg);
        }
    };
    /**
     * Test whether the sig exists.
     * @param {Hash} msg - Sig hash.
     * @param {Buffer} sig
     * @param {Buffer} key
     * @returns {Boolean}
     */
    SigCache.prototype.has = function (msg, sig, key) {
        var entry = this.valid.get(msg);
        if (!entry)
            return false;
        return entry.equals(sig, key);
    };
    /**
     * Verify a signature, testing
     * it against the cache first.
     * @param {Buffer} msg
     * @param {Buffer} sig
     * @param {Buffer} key
     * @returns {Boolean}
     */
    SigCache.prototype.verify = function (msg, sig, key) {
        if (this.size === 0)
            return secp256k1.verifyDER(msg, sig, key);
        if (this.has(msg, sig, key))
            return true;
        var result = secp256k1.verifyDER(msg, sig, key);
        if (!result)
            return false;
        this.add(msg, sig, key);
        return true;
    };
    return SigCache;
}());
/**
 * Signature Cache Entry
 * @ignore
 * @property {Buffer} sig
 * @property {Buffer} key
 */
var SigCacheEntry = /** @class */ (function () {
    /**
     * Create a cache entry.
     * @constructor
     * @param {Buffer} sig
     * @param {Buffer} key
     */
    function SigCacheEntry(sig, key) {
        this.sig = Buffer.from(sig);
        this.key = Buffer.from(key);
    }
    /**
     * Compare an entry to a sig and key.
     * @param {Buffer} sig
     * @param {Buffer} key
     * @returns {Boolean}
     */
    SigCacheEntry.prototype.equals = function (sig, key) {
        return this.sig.equals(sig) && this.key.equals(key);
    };
    return SigCacheEntry;
}());
/*
 * Expose
 */
module.exports = SigCache;
