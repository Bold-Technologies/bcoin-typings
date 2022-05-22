/*!
 * mempool.js - mempool for bcoin
 * Copyright (c) 2018-2019, the bcoin developers (MIT License).
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var BufferMap = require('buffer-map').BufferMap;
var TXMeta = require('../primitives/txmeta');
/**
 * Address Indexer
 * @ignore
 */
var AddrIndexer = /** @class */ (function () {
    /**
     * Create TX address index.
     * @constructor
     * @param {Network} network
     */
    function AddrIndexer(network) {
        this.network = network;
        // Map of addr->entries.
        this.index = new BufferMap();
        // Map of txid->addrs.
        this.map = new BufferMap();
    }
    AddrIndexer.prototype.reset = function () {
        this.index.clear();
        this.map.clear();
    };
    AddrIndexer.prototype.getKey = function (addr) {
        var prefix = addr.getPrefix(this.network);
        if (prefix < 0)
            return null;
        var hash = addr.getHash();
        var size = hash.length + 1;
        var raw = Buffer.allocUnsafe(size);
        var written = raw.writeUInt8(prefix);
        written += hash.copy(raw, 1);
        assert(written === size);
        return raw;
    };
    /**
     * Get transactions by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    AddrIndexer.prototype.get = function (addr, options) {
        if (options === void 0) { options = {}; }
        var values = this.getEntries(addr, options);
        var out = [];
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var entry = values_1[_i];
            out.push(entry.tx);
        }
        return out;
    };
    /**
     * Get transaction meta by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    AddrIndexer.prototype.getMeta = function (addr, options) {
        if (options === void 0) { options = {}; }
        var values = this.getEntries(addr, options);
        var out = [];
        for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
            var entry = values_2[_i];
            var meta = TXMeta.fromTX(entry.tx);
            meta.mtime = entry.time;
            out.push(meta);
        }
        return out;
    };
    /**
     * Get entries by address.
     * @param {Address} addr
     * @param {Object} options
     * @param {Number} options.limit
     * @param {Number} options.reverse
     * @param {Buffer} options.after
     */
    AddrIndexer.prototype.getEntries = function (addr, options) {
        if (options === void 0) { options = {}; }
        var limit = options.limit, reverse = options.reverse, after = options.after;
        var key = this.getKey(addr);
        if (!key)
            return [];
        var items = this.index.get(key);
        if (!items)
            return [];
        var values = [];
        // Check to see if results should be skipped because
        // the after hash is expected to be within a following
        // confirmed query.
        var skip = (after && !items.has(after) && reverse);
        if (skip)
            return values;
        if (after && items.has(after)) {
            // Give results starting from after
            // the tx hash for the address.
            var index = 0;
            for (var _i = 0, _a = items.keys(); _i < _a.length; _i++) {
                var k = _a[_i];
                if (k.compare(after) === 0)
                    break;
                index += 1;
            }
            values = Array.from(items.values());
            var start = index + 1;
            var end = values.length;
            if (end - start > limit)
                end = start + limit;
            if (reverse) {
                start = 0;
                end = index;
                if (end > limit)
                    start = end - limit;
            }
            values = values.slice(start, end);
        }
        else {
            // Give earliest or latest results
            // for the address.
            values = Array.from(items.values());
            if (values.length > limit) {
                var start = 0;
                var end = limit;
                if (reverse) {
                    start = values.length - limit;
                    end = values.length;
                }
                values = values.slice(start, end);
            }
        }
        if (reverse)
            values.reverse();
        return values;
    };
    AddrIndexer.prototype.insert = function (entry, view) {
        var tx = entry.tx;
        var hash = tx.hash();
        var addrs = tx.getAddresses(view);
        if (addrs.length === 0)
            return;
        for (var _i = 0, addrs_1 = addrs; _i < addrs_1.length; _i++) {
            var addr = addrs_1[_i];
            var key = this.getKey(addr);
            if (!key)
                continue;
            var items = this.index.get(key);
            if (!items) {
                items = new BufferMap();
                this.index.set(key, items);
            }
            assert(!items.has(hash));
            items.set(hash, entry);
        }
        this.map.set(hash, addrs);
    };
    AddrIndexer.prototype.remove = function (hash) {
        var addrs = this.map.get(hash);
        if (!addrs)
            return;
        for (var _i = 0, addrs_2 = addrs; _i < addrs_2.length; _i++) {
            var addr = addrs_2[_i];
            var key = this.getKey(addr);
            if (!key)
                continue;
            var items = this.index.get(key);
            assert(items);
            assert(items.has(hash));
            items["delete"](hash);
            if (items.size === 0)
                this.index["delete"](key);
        }
        this.map["delete"](hash);
    };
    return AddrIndexer;
}());
/*
 * Expose
 */
module.exports = AddrIndexer;
