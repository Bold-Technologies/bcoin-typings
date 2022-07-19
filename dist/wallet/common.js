/*!
 * common.js - commonly required functions for wallet.
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var BufferMap = require('buffer-map').BufferMap;
/**
 * @exports wallet/common
 */
var common = exports;
/**
 * Test whether a string is eligible
 * to be used as a name or ID.
 * @param {String} key
 * @returns {Boolean}
 */
common.isName = function isName(key) {
    if (typeof key !== 'string')
        return false;
    if (key.length === 0)
        return false;
    if (!/^[\-\._0-9A-Za-z]+$/.test(key))
        return false;
    // Prevents __proto__
    // from being used.
    switch (key[0]) {
        case '_':
        case '-':
        case '.':
            return false;
    }
    switch (key[key.length - 1]) {
        case '_':
        case '-':
        case '.':
            return false;
    }
    return key.length >= 1 && key.length <= 40;
};
/**
 * Sort an array of transactions by time.
 * @param {TX[]} txs
 * @returns {TX[]}
 */
common.sortTX = function sortTX(txs) {
    return txs.sort(function (a, b) {
        return a.mtime - b.mtime;
    });
};
/**
 * Sort an array of coins by height.
 * @param {Coin[]} txs
 * @returns {Coin[]}
 */
common.sortCoins = function sortCoins(coins) {
    return coins.sort(function (a, b) {
        a = a.height === -1 ? 0x7fffffff : a.height;
        b = b.height === -1 ? 0x7fffffff : b.height;
        return a - b;
    });
};
/**
 * Sort an array of transactions in dependency order.
 * @param {TX[]} txs
 * @returns {TX[]}
 */
common.sortDeps = function sortDeps(txs) {
    var map = new BufferMap();
    for (var _i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
        var tx = txs_1[_i];
        var hash = tx.hash();
        map.set(hash, tx);
    }
    var depMap = new BufferMap();
    var depCount = new BufferMap();
    var top = [];
    for (var _a = 0, map_1 = map; _a < map_1.length; _a++) {
        var _b = map_1[_a], hash = _b[0], tx = _b[1];
        depCount.set(hash, 0);
        var hasDeps = false;
        for (var _c = 0, _d = tx.inputs; _c < _d.length; _c++) {
            var input = _d[_c];
            var prev = input.prevout.hash;
            if (!map.has(prev))
                continue;
            var count = depCount.get(hash);
            depCount.set(hash, count + 1);
            hasDeps = true;
            if (!depMap.has(prev))
                depMap.set(prev, []);
            depMap.get(prev).push(tx);
        }
        if (hasDeps)
            continue;
        top.push(tx);
    }
    var result = [];
    for (var _e = 0, top_1 = top; _e < top_1.length; _e++) {
        var tx = top_1[_e];
        var deps = depMap.get(tx.hash());
        result.push(tx);
        if (!deps)
            continue;
        for (var _f = 0, deps_1 = deps; _f < deps_1.length; _f++) {
            var tx_1 = deps_1[_f];
            var count = depCount.get(tx_1.hash());
            if (--count === 0)
                top.push(tx_1);
            depCount.set(tx_1.hash(), count);
        }
    }
    return result;
};
