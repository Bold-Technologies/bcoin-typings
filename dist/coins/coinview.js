/*!
 * coinview.js - coin viewpoint object for bcoin
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
var BufferMap = require('buffer-map').BufferMap;
var Coins = require('./coins');
var UndoCoins = require('./undocoins');
var CoinEntry = require('./coinentry');
/**
 * Coin View
 * Represents a coin viewpoint:
 * a snapshot of {@link Coins} objects.
 * @alias module:coins.CoinView
 * @property {Object} map
 * @property {UndoCoins} undo
 */
var CoinView = /** @class */ (function () {
    /**
     * Create a coin view.
     * @constructor
     */
    function CoinView() {
        this.map = new BufferMap();
        this.undo = new UndoCoins();
    }
    /**
     * Get coins.
     * @param {Hash} hash
     * @returns {Coins} coins
     */
    CoinView.prototype.get = function (hash) {
        return this.map.get(hash);
    };
    /**
     * Test whether the view has an entry.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    CoinView.prototype.has = function (hash) {
        return this.map.has(hash);
    };
    /**
     * Add coins to the collection.
     * @param {Hash} hash
     * @param {Coins} coins
     * @returns {Coins}
     */
    CoinView.prototype.add = function (hash, coins) {
        this.map.set(hash, coins);
        return coins;
    };
    /**
     * Ensure existence of coins object in the collection.
     * @param {Hash} hash
     * @returns {Coins}
     */
    CoinView.prototype.ensure = function (hash) {
        var coins = this.map.get(hash);
        if (coins)
            return coins;
        return this.add(hash, new Coins());
    };
    /**
     * Remove coins from the collection.
     * @param {Coins} coins
     * @returns {Coins|null}
     */
    CoinView.prototype.remove = function (hash) {
        var coins = this.map.get(hash);
        if (!coins)
            return null;
        this.map["delete"](hash);
        return coins;
    };
    /**
     * Add a tx to the collection.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    CoinView.prototype.addTX = function (tx, height) {
        var hash = tx.hash();
        var coins = Coins.fromTX(tx, height);
        return this.add(hash, coins);
    };
    /**
     * Remove a tx from the collection.
     * @param {TX} tx
     * @param {Number} height
     * @returns {Coins}
     */
    CoinView.prototype.removeTX = function (tx, height) {
        var hash = tx.hash();
        var coins = Coins.fromTX(tx, height);
        for (var _i = 0, _a = coins.outputs.values(); _i < _a.length; _i++) {
            var coin = _a[_i];
            coin.spent = true;
        }
        return this.add(hash, coins);
    };
    /**
     * Add an entry to the collection.
     * @param {Outpoint} prevout
     * @param {CoinEntry} coin
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.addEntry = function (prevout, coin) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.ensure(hash);
        return coins.add(index, coin);
    };
    /**
     * Add a coin to the collection.
     * @param {Coin} coin
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.addCoin = function (coin) {
        var coins = this.ensure(coin.hash);
        return coins.addCoin(coin);
    };
    /**
     * Add an output to the collection.
     * @param {Outpoint} prevout
     * @param {Output} output
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.addOutput = function (prevout, output) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.ensure(hash);
        return coins.addOutput(index, output);
    };
    /**
     * Add an output to the collection by output index.
     * @param {TX} tx
     * @param {Number} index
     * @param {Number} height
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.addIndex = function (tx, index, height) {
        var hash = tx.hash();
        var coins = this.ensure(hash);
        return coins.addIndex(tx, index, height);
    };
    /**
     * Spend an output.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.spendEntry = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return null;
        var coin = coins.spend(index);
        if (!coin)
            return null;
        this.undo.push(coin);
        return coin;
    };
    /**
     * Remove an output.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.removeEntry = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return null;
        return coins.remove(index);
    };
    /**
     * Test whether the view has an entry by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    CoinView.prototype.hasEntry = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return false;
        return coins.has(index);
    };
    /**
     * Get a single entry by prevout.
     * @param {Outpoint} prevout
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.getEntry = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return null;
        return coins.get(index);
    };
    /**
     * Test whether an entry has been spent by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    CoinView.prototype.isUnspent = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return false;
        return coins.isUnspent(index);
    };
    /**
     * Get a single coin by prevout.
     * @param {Outpoint} prevout
     * @returns {Coin|null}
     */
    CoinView.prototype.getCoin = function (prevout) {
        var coins = this.get(prevout.hash);
        if (!coins)
            return null;
        return coins.getCoin(prevout);
    };
    /**
     * Get a single output by prevout.
     * @param {Outpoint} prevout
     * @returns {Output|null}
     */
    CoinView.prototype.getOutput = function (prevout) {
        var hash = prevout.hash, index = prevout.index;
        var coins = this.get(hash);
        if (!coins)
            return null;
        return coins.getOutput(index);
    };
    /**
     * Get coins height by prevout.
     * @param {Outpoint} prevout
     * @returns {Number}
     */
    CoinView.prototype.getHeight = function (prevout) {
        var coin = this.getEntry(prevout);
        if (!coin)
            return -1;
        return coin.height;
    };
    /**
     * Get coins coinbase flag by prevout.
     * @param {Outpoint} prevout
     * @returns {Boolean}
     */
    CoinView.prototype.isCoinbase = function (prevout) {
        var coin = this.getEntry(prevout);
        if (!coin)
            return false;
        return coin.coinbase;
    };
    /**
     * Test whether the view has an entry by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    CoinView.prototype.hasEntryFor = function (input) {
        return this.hasEntry(input.prevout);
    };
    /**
     * Get a single entry by input.
     * @param {Input} input
     * @returns {CoinEntry|null}
     */
    CoinView.prototype.getEntryFor = function (input) {
        return this.getEntry(input.prevout);
    };
    /**
     * Test whether an entry has been spent by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    CoinView.prototype.isUnspentFor = function (input) {
        return this.isUnspent(input.prevout);
    };
    /**
     * Get a single coin by input.
     * @param {Input} input
     * @returns {Coin|null}
     */
    CoinView.prototype.getCoinFor = function (input) {
        return this.getCoin(input.prevout);
    };
    /**
     * Get a single output by input.
     * @param {Input} input
     * @returns {Output|null}
     */
    CoinView.prototype.getOutputFor = function (input) {
        return this.getOutput(input.prevout);
    };
    /**
     * Get coins height by input.
     * @param {Input} input
     * @returns {Number}
     */
    CoinView.prototype.getHeightFor = function (input) {
        return this.getHeight(input.prevout);
    };
    /**
     * Get coins coinbase flag by input.
     * @param {Input} input
     * @returns {Boolean}
     */
    CoinView.prototype.isCoinbaseFor = function (input) {
        return this.isCoinbase(input.prevout);
    };
    /**
     * Retrieve coins from database.
     * @method
     * @param {ChainDB} db
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link CoinEntry}.
     */
    CoinView.prototype.readCoin = function (db, prevout) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache = this.getEntry(prevout);
                        if (cache)
                            return [2 /*return*/, cache];
                        return [4 /*yield*/, db.readCoin(prevout)];
                    case 1:
                        coin = _a.sent();
                        if (!coin)
                            return [2 /*return*/, null];
                        return [2 /*return*/, this.addEntry(prevout, coin)];
                }
            });
        });
    };
    /**
     * Read all input coins into unspent map.
     * @method
     * @param {ChainDB} db
     * @param {TX} tx
     * @returns {Promise} - Returns {Boolean}.
     */
    CoinView.prototype.readInputs = function (db, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var found, _i, _a, prevout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        found = true;
                        _i = 0, _a = tx.inputs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        prevout = _a[_i].prevout;
                        return [4 /*yield*/, this.readCoin(db, prevout)];
                    case 2:
                        if (!(_b.sent()))
                            found = false;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, found];
                }
            });
        });
    };
    /**
     * Spend coins for transaction.
     * @method
     * @param {ChainDB} db
     * @param {TX} tx
     * @returns {Promise} - Returns {Boolean}.
     */
    CoinView.prototype.spendInputs = function (db, tx) {
        return __awaiter(this, void 0, void 0, function () {
            var i, len, jobs, prevout, coins, _i, coins_1, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tx.inputs.length)) return [3 /*break*/, 3];
                        len = Math.min(i + 4, tx.inputs.length);
                        jobs = [];
                        for (; i < len; i++) {
                            prevout = tx.inputs[i].prevout;
                            jobs.push(this.readCoin(db, prevout));
                        }
                        return [4 /*yield*/, Promise.all(jobs)];
                    case 2:
                        coins = _a.sent();
                        for (_i = 0, coins_1 = coins; _i < coins_1.length; _i++) {
                            coin = coins_1[_i];
                            if (!coin || coin.spent)
                                return [2 /*return*/, false];
                            coin.spent = true;
                            this.undo.push(coin);
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    CoinView.prototype.getSize = function (tx) {
        var size = 0;
        size += tx.inputs.length;
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var coin = this.getEntry(prevout);
            if (!coin)
                continue;
            size += coin.getSize();
        }
        return size;
    };
    /**
     * Write coin data to buffer writer
     * as it pertains to a transaction.
     * @param {BufferWriter} bw
     * @param {TX} tx
     */
    CoinView.prototype.toWriter = function (bw, tx) {
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            var coin = this.getEntry(prevout);
            if (!coin) {
                bw.writeU8(0);
                continue;
            }
            bw.writeU8(1);
            coin.toWriter(bw);
        }
        return bw;
    };
    /**
     * Read serialized view data from a buffer
     * reader as it pertains to a transaction.
     * @private
     * @param {BufferReader} br
     * @param {TX} tx
     */
    CoinView.prototype.fromReader = function (br, tx) {
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var prevout = _a[_i].prevout;
            if (br.readU8() === 0)
                continue;
            var coin = CoinEntry.fromReader(br);
            this.addEntry(prevout, coin);
        }
        return this;
    };
    /**
     * Read serialized view data from a buffer
     * reader as it pertains to a transaction.
     * @param {BufferReader} br
     * @param {TX} tx
     * @returns {CoinView}
     */
    CoinView.fromReader = function (br, tx) {
        return new this().fromReader(br, tx);
    };
    return CoinView;
}());
/*
 * Expose
 */
module.exports = CoinView;
