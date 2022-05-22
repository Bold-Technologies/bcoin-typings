/*!
 * binary.js - binary search utils for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
/**
 * Perform a binary search on a sorted array.
 * @param {Array} items
 * @param {Object} key
 * @param {Function} compare
 * @param {Boolean?} insert
 * @returns {Number} Index.
 */
exports.search = function search(items, key, compare, insert) {
    var start = 0;
    var end = items.length - 1;
    while (start <= end) {
        var pos = (start + end) >>> 1;
        var cmp = compare(items[pos], key);
        if (cmp === 0)
            return pos;
        if (cmp < 0)
            start = pos + 1;
        else
            end = pos - 1;
    }
    if (!insert)
        return -1;
    return start;
};
/**
 * Perform a binary insert on a sorted array.
 * @param {Array} items
 * @param {Object} item
 * @param {Function} compare
 * @returns {Number} index
 */
exports.insert = function insert(items, item, compare, uniq) {
    var i = exports.search(items, item, compare, true);
    if (uniq && i < items.length) {
        if (compare(items[i], item) === 0)
            return -1;
    }
    if (i === 0)
        items.unshift(item);
    else if (i === items.length)
        items.push(item);
    else
        items.splice(i, 0, item);
    return i;
};
/**
 * Perform a binary removal on a sorted array.
 * @param {Array} items
 * @param {Object} item
 * @param {Function} compare
 * @returns {Boolean}
 */
exports.remove = function remove(items, item, compare) {
    var i = exports.search(items, item, compare, false);
    if (i === -1)
        return false;
    splice(items, i);
    return true;
};
/*
 * Helpers
 */
function splice(list, i) {
    if (i === 0) {
        list.shift();
        return;
    }
    var k = i + 1;
    while (k < list.length)
        list[i++] = list[k++];
    list.pop();
}
