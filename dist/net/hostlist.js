/*!
 * hostlist.js - address management for bcoin
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
var assert = require('bsert');
var path = require('path');
var fs = require('bfile');
var IP = require('binet');
var dns = require('bdns');
var Logger = require('blgr');
var murmur3 = require('bcrypto/lib/murmur3');
var List = require('blst');
var randomRange = require('bcrypto/lib/random').randomRange;
var util = require('../utils/util');
var Network = require('../protocol/network');
var NetAddress = require('./netaddress');
var common = require('./common');
var seeds = require('./seeds');
var inspectSymbol = require('../utils').inspectSymbol;
/*
 * Constants
 */
var POOL32 = Buffer.allocUnsafe(32);
/**
 * Host List
 * @alias module:net.HostList
 */
var HostList = /** @class */ (function () {
    /**
     * Create a host list.
     * @constructor
     * @param {Object} options
     */
    function HostList(options) {
        this.options = new HostListOptions(options);
        this.network = this.options.network;
        this.logger = this.options.logger.context('hostlist');
        this.address = this.options.address;
        this.resolve = this.options.resolve;
        this.dnsSeeds = [];
        this.dnsNodes = [];
        this.map = new Map();
        this.fresh = [];
        this.totalFresh = 0;
        this.used = [];
        this.totalUsed = 0;
        this.nodes = [];
        this.local = new Map();
        this.banned = new Map();
        this.timer = null;
        this.needsFlush = false;
        this.flushing = false;
        this.init();
    }
    /**
     * Initialize list.
     * @private
     */
    HostList.prototype.init = function () {
        var options = this.options;
        var scores = HostList.scores;
        for (var i = 0; i < options.maxBuckets; i++)
            this.fresh.push(new Map());
        for (var i = 0; i < options.maxBuckets; i++)
            this.used.push(new List());
        this.setSeeds(options.seeds);
        this.setNodes(options.nodes);
        this.pushLocal(this.address, scores.MANUAL);
        this.addLocal(options.host, options.port, scores.BIND);
        var hosts = IP.getPublic();
        var port = this.address.port;
        for (var _i = 0, hosts_1 = hosts; _i < hosts_1.length; _i++) {
            var host = hosts_1[_i];
            this.addLocal(host, port, scores.IF);
        }
    };
    /**
     * Open hostlist and read hosts file.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.loadFile()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        this.logger.warning('Hosts deserialization failed.');
                        this.logger.error(e_1);
                        return [3 /*break*/, 3];
                    case 3:
                        if (this.size() === 0)
                            this.injectSeeds();
                        return [4 /*yield*/, this.discoverNodes()];
                    case 4:
                        _a.sent();
                        this.start();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close hostlist.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stop();
                        return [4 /*yield*/, this.flush()];
                    case 1:
                        _a.sent();
                        this.reset();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Start flush interval.
     */
    HostList.prototype.start = function () {
        var _this = this;
        if (this.options.memory)
            return;
        if (!this.options.filename)
            return;
        assert(this.timer == null);
        this.timer = setInterval(function () { return _this.flush(); }, this.options.flushInterval);
    };
    /**
     * Stop flush interval.
     */
    HostList.prototype.stop = function () {
        if (this.options.memory)
            return;
        if (!this.options.filename)
            return;
        assert(this.timer != null);
        clearInterval(this.timer);
        this.timer = null;
    };
    /**
     * Read and initialize from hosts file.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.injectSeeds = function () {
        var nodes = seeds.get(this.network.type);
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var addr = NetAddress.fromHostname(node, this.network);
            if (!addr.isRoutable())
                continue;
            if (!this.options.onion && addr.isOnion())
                continue;
            if (addr.port === 0)
                continue;
            this.add(addr);
        }
    };
    /**
     * Read and initialize from hosts file.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.loadFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filename, data, e_2, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filename = this.options.filename;
                        if (fs.unsupported)
                            return [2 /*return*/];
                        if (this.options.memory)
                            return [2 /*return*/];
                        if (!filename)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(filename, 'utf8')];
                    case 2:
                        data = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        if (e_2.code === 'ENOENT')
                            return [2 /*return*/];
                        throw e_2;
                    case 4:
                        json = JSON.parse(data);
                        this.fromJSON(json);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flush addrs to hosts file.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filename, json, data, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filename = this.options.filename;
                        if (fs.unsupported)
                            return [2 /*return*/];
                        if (this.options.memory)
                            return [2 /*return*/];
                        if (!filename)
                            return [2 /*return*/];
                        if (!this.needsFlush)
                            return [2 /*return*/];
                        if (this.flushing)
                            return [2 /*return*/];
                        this.needsFlush = false;
                        this.logger.debug('Writing hosts to %s.', filename);
                        json = this.toJSON();
                        data = JSON.stringify(json);
                        this.flushing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.writeFile(filename, data, 'utf8')];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        this.logger.warning('Writing hosts failed.');
                        this.logger.error(e_3);
                        return [3 /*break*/, 4];
                    case 4:
                        this.flushing = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get list size.
     * @returns {Number}
     */
    HostList.prototype.size = function () {
        return this.totalFresh + this.totalUsed;
    };
    /**
     * Test whether the host list is full.
     * @returns {Boolean}
     */
    HostList.prototype.isFull = function () {
        var max = this.options.maxBuckets * this.options.maxEntries;
        return this.size() >= max;
    };
    /**
     * Reset host list.
     */
    HostList.prototype.reset = function () {
        this.map.clear();
        for (var _i = 0, _a = this.fresh; _i < _a.length; _i++) {
            var bucket = _a[_i];
            bucket.clear();
        }
        for (var _b = 0, _c = this.used; _b < _c.length; _b++) {
            var bucket = _c[_b];
            bucket.reset();
        }
        this.totalFresh = 0;
        this.totalUsed = 0;
        this.nodes.length = 0;
    };
    /**
     * Mark a peer as banned.
     * @param {String} host
     */
    HostList.prototype.ban = function (host) {
        this.banned.set(host, util.now());
    };
    /**
     * Unban host.
     * @param {String} host
     */
    HostList.prototype.unban = function (host) {
        this.banned["delete"](host);
    };
    /**
     * Clear banned hosts.
     */
    HostList.prototype.clearBanned = function () {
        this.banned.clear();
    };
    /**
     * Test whether the host is banned.
     * @param {String} host
     * @returns {Boolean}
     */
    HostList.prototype.isBanned = function (host) {
        var time = this.banned.get(host);
        if (time == null)
            return false;
        if (util.now() > time + this.options.banTime) {
            this.banned["delete"](host);
            return false;
        }
        return true;
    };
    /**
     * Allocate a new host.
     * @returns {HostEntry}
     */
    HostList.prototype.getHost = function () {
        var buckets = null;
        if (this.totalFresh > 0)
            buckets = this.fresh;
        if (this.totalUsed > 0) {
            if (this.totalFresh === 0 || random(2) === 0)
                buckets = this.used;
        }
        if (!buckets)
            return null;
        var now = this.network.now();
        var factor = 1;
        for (;;) {
            var i = random(buckets.length);
            var bucket = buckets[i];
            if (bucket.size === 0)
                continue;
            var index = random(bucket.size);
            var entry = void 0;
            if (buckets === this.used) {
                entry = bucket.head;
                while (index--)
                    entry = entry.next;
            }
            else {
                for (var _i = 0, _a = bucket.values(); _i < _a.length; _i++) {
                    entry = _a[_i];
                    if (index === 0)
                        break;
                    index -= 1;
                }
            }
            var num = random(1 << 30);
            if (num < factor * entry.chance(now) * (1 << 30))
                return entry;
            factor *= 1.2;
        }
    };
    /**
     * Get fresh bucket for host.
     * @private
     * @param {HostEntry} entry
     * @returns {Map}
     */
    HostList.prototype.freshBucket = function (entry) {
        var addr = entry.addr;
        var src = entry.src;
        var data = concat32(addr.raw, src.raw);
        var hash = murmur3.sum(data, 0xfba4c795);
        var index = hash % this.fresh.length;
        return this.fresh[index];
    };
    /**
     * Get used bucket for host.
     * @private
     * @param {HostEntry} entry
     * @returns {List}
     */
    HostList.prototype.usedBucket = function (entry) {
        var addr = entry.addr;
        var hash = murmur3.sum(addr.raw, 0xfba4c795);
        var index = hash % this.used.length;
        return this.used[index];
    };
    /**
     * Add host to host list.
     * @param {NetAddress} addr
     * @param {NetAddress?} src
     * @returns {Boolean}
     */
    HostList.prototype.add = function (addr, src) {
        assert(addr.port !== 0);
        var entry = this.map.get(addr.hostname);
        if (entry) {
            var penalty = 2 * 60 * 60;
            var interval = 24 * 60 * 60;
            // No source means we're inserting
            // this ourselves. No penalty.
            if (!src)
                penalty = 0;
            // Update services.
            entry.addr.services |= addr.services;
            entry.addr.services >>>= 0;
            // Online?
            var now = this.network.now();
            if (now - addr.time < 24 * 60 * 60)
                interval = 60 * 60;
            // Periodically update time.
            if (entry.addr.time < addr.time - interval - penalty) {
                entry.addr.time = addr.time;
                this.needsFlush = true;
            }
            // Do not update if no new
            // information is present.
            if (entry.addr.time && addr.time <= entry.addr.time)
                return false;
            // Do not update if the entry was
            // already in the "used" table.
            if (entry.used)
                return false;
            assert(entry.refCount > 0);
            // Do not update if the max
            // reference count is reached.
            if (entry.refCount === HostList.MAX_REFS)
                return false;
            assert(entry.refCount < HostList.MAX_REFS);
            // Stochastic test: previous refCount
            // N: 2^N times harder to increase it.
            var factor = 1;
            for (var i = 0; i < entry.refCount; i++)
                factor *= 2;
            if (random(factor) !== 0)
                return false;
        }
        else {
            if (this.isFull())
                return false;
            if (!src)
                src = this.address;
            entry = new HostEntry(addr, src);
            this.totalFresh += 1;
        }
        var bucket = this.freshBucket(entry);
        if (bucket.has(entry.key()))
            return false;
        if (bucket.size >= this.options.maxEntries)
            this.evictFresh(bucket);
        bucket.set(entry.key(), entry);
        entry.refCount += 1;
        this.map.set(entry.key(), entry);
        this.needsFlush = true;
        return true;
    };
    /**
     * Evict a host from fresh bucket.
     * @param {Map} bucket
     */
    HostList.prototype.evictFresh = function (bucket) {
        var old = null;
        for (var _i = 0, _a = bucket.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            if (this.isStale(entry)) {
                bucket["delete"](entry.key());
                if (--entry.refCount === 0) {
                    this.map["delete"](entry.key());
                    this.totalFresh -= 1;
                }
                continue;
            }
            if (!old) {
                old = entry;
                continue;
            }
            if (entry.addr.time < old.addr.time)
                old = entry;
        }
        if (!old)
            return;
        bucket["delete"](old.key());
        if (--old.refCount === 0) {
            this.map["delete"](old.key());
            this.totalFresh -= 1;
        }
    };
    /**
     * Test whether a host is evictable.
     * @param {HostEntry} entry
     * @returns {Boolean}
     */
    HostList.prototype.isStale = function (entry) {
        var now = this.network.now();
        if (entry.lastAttempt && entry.lastAttempt >= now - 60)
            return false;
        if (entry.addr.time > now + 10 * 60)
            return true;
        if (entry.addr.time === 0)
            return true;
        if (now - entry.addr.time > HostList.HORIZON_DAYS * 24 * 60 * 60)
            return true;
        if (entry.lastSuccess === 0 && entry.attempts >= HostList.RETRIES)
            return true;
        if (now - entry.lastSuccess > HostList.MIN_FAIL_DAYS * 24 * 60 * 60) {
            if (entry.attempts >= HostList.MAX_FAILURES)
                return true;
        }
        return false;
    };
    /**
     * Remove host from host list.
     * @param {String} hostname
     * @returns {NetAddress}
     */
    HostList.prototype.remove = function (hostname) {
        var entry = this.map.get(hostname);
        if (!entry)
            return null;
        if (entry.used) {
            var head = entry;
            assert(entry.refCount === 0);
            while (head.prev)
                head = head.prev;
            for (var _i = 0, _a = this.used; _i < _a.length; _i++) {
                var bucket = _a[_i];
                if (bucket.head === head) {
                    bucket.remove(entry);
                    this.totalUsed -= 1;
                    head = null;
                    break;
                }
            }
            assert(!head);
        }
        else {
            for (var _b = 0, _c = this.fresh; _b < _c.length; _b++) {
                var bucket = _c[_b];
                if (bucket["delete"](entry.key()))
                    entry.refCount -= 1;
            }
            this.totalFresh -= 1;
            assert(entry.refCount === 0);
        }
        this.map["delete"](entry.key());
        return entry.addr;
    };
    /**
     * Mark host as failed.
     * @param {String} hostname
     */
    HostList.prototype.markAttempt = function (hostname) {
        var entry = this.map.get(hostname);
        var now = this.network.now();
        if (!entry)
            return;
        entry.attempts += 1;
        entry.lastAttempt = now;
    };
    /**
     * Mark host as successfully connected.
     * @param {String} hostname
     */
    HostList.prototype.markSuccess = function (hostname) {
        var entry = this.map.get(hostname);
        var now = this.network.now();
        if (!entry)
            return;
        if (now - entry.addr.time > 20 * 60)
            entry.addr.time = now;
    };
    /**
     * Mark host as successfully ack'd.
     * @param {String} hostname
     * @param {Number} services
     */
    HostList.prototype.markAck = function (hostname, services) {
        var entry = this.map.get(hostname);
        if (!entry)
            return;
        var now = this.network.now();
        entry.addr.services |= services;
        entry.addr.services >>>= 0;
        entry.lastSuccess = now;
        entry.lastAttempt = now;
        entry.attempts = 0;
        if (entry.used)
            return;
        assert(entry.refCount > 0);
        // Remove from fresh.
        var old = null;
        for (var _i = 0, _a = this.fresh; _i < _a.length; _i++) {
            var bucket_1 = _a[_i];
            if (bucket_1["delete"](entry.key())) {
                entry.refCount -= 1;
                old = bucket_1;
            }
        }
        assert(old);
        assert(entry.refCount === 0);
        this.totalFresh -= 1;
        // Find room in used bucket.
        var bucket = this.usedBucket(entry);
        if (bucket.size < this.options.maxEntries) {
            entry.used = true;
            bucket.push(entry);
            this.totalUsed += 1;
            return;
        }
        // No room. Evict.
        var evicted = this.evictUsed(bucket);
        var fresh = this.freshBucket(evicted);
        // Move to entry's old bucket if no room.
        if (fresh.size >= this.options.maxEntries)
            fresh = old;
        // Swap to evicted's used bucket.
        entry.used = true;
        bucket.replace(evicted, entry);
        // Move evicted to fresh bucket.
        evicted.used = false;
        fresh.set(evicted.key(), evicted);
        assert(evicted.refCount === 0);
        evicted.refCount += 1;
        this.totalFresh += 1;
    };
    /**
     * Pick used for eviction.
     * @param {List} bucket
     */
    HostList.prototype.evictUsed = function (bucket) {
        var old = bucket.head;
        for (var entry = bucket.head; entry; entry = entry.next) {
            if (entry.addr.time < old.addr.time)
                old = entry;
        }
        return old;
    };
    /**
     * Convert address list to array.
     * @returns {NetAddress[]}
     */
    HostList.prototype.toArray = function () {
        var out = [];
        for (var _i = 0, _a = this.map.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            out.push(entry.addr);
        }
        assert.strictEqual(out.length, this.size());
        return out;
    };
    /**
     * Add a preferred seed.
     * @param {String} host
     */
    HostList.prototype.addSeed = function (host) {
        var ip = IP.fromHostname(host, this.network.port);
        if (ip.type === IP.types.DNS) {
            // Defer for resolution.
            this.dnsSeeds.push(ip);
            return null;
        }
        var addr = NetAddress.fromHost(ip.host, ip.port, this.network);
        this.add(addr);
        return addr;
    };
    /**
     * Add a priority node.
     * @param {String} host
     * @returns {NetAddress}
     */
    HostList.prototype.addNode = function (host) {
        var ip = IP.fromHostname(host, this.network.port);
        if (ip.type === IP.types.DNS) {
            // Defer for resolution.
            this.dnsNodes.push(ip);
            return null;
        }
        var addr = NetAddress.fromHost(ip.host, ip.port, this.network);
        this.nodes.push(addr);
        this.add(addr);
        return addr;
    };
    /**
     * Remove a priority node.
     * @param {String} host
     * @returns {Boolean}
     */
    HostList.prototype.removeNode = function (host) {
        var addr = IP.fromHostname(host, this.network.port);
        for (var i = 0; i < this.nodes.length; i++) {
            var node = this.nodes[i];
            if (node.host !== addr.host)
                continue;
            if (node.port !== addr.port)
                continue;
            this.nodes.splice(i, 1);
            return true;
        }
        return false;
    };
    /**
     * Set initial seeds.
     * @param {String[]} seeds
     */
    HostList.prototype.setSeeds = function (seeds) {
        this.dnsSeeds.length = 0;
        for (var _i = 0, seeds_1 = seeds; _i < seeds_1.length; _i++) {
            var host = seeds_1[_i];
            this.addSeed(host);
        }
    };
    /**
     * Set priority nodes.
     * @param {String[]} nodes
     */
    HostList.prototype.setNodes = function (nodes) {
        this.dnsNodes.length = 0;
        this.nodes.length = 0;
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var host = nodes_2[_i];
            this.addNode(host);
        }
    };
    /**
     * Add a local address.
     * @param {String} host
     * @param {Number} port
     * @param {Number} score
     * @returns {Boolean}
     */
    HostList.prototype.addLocal = function (host, port, score) {
        var addr = NetAddress.fromHost(host, port, this.network);
        addr.services = this.options.services;
        return this.pushLocal(addr, score);
    };
    /**
     * Add a local address.
     * @param {NetAddress} addr
     * @param {Number} score
     * @returns {Boolean}
     */
    HostList.prototype.pushLocal = function (addr, score) {
        if (!addr.isRoutable())
            return false;
        if (this.local.has(addr.hostname))
            return false;
        var local = new LocalAddress(addr, score);
        this.local.set(addr.hostname, local);
        return true;
    };
    /**
     * Get local address based on reachability.
     * @param {NetAddress?} src
     * @returns {NetAddress}
     */
    HostList.prototype.getLocal = function (src) {
        var bestReach = -1;
        var bestScore = -1;
        var bestDest = null;
        if (!src)
            src = this.address;
        if (this.local.size === 0)
            return null;
        for (var _i = 0, _a = this.local.values(); _i < _a.length; _i++) {
            var dest = _a[_i];
            var reach = src.getReachability(dest.addr);
            if (reach < bestReach)
                continue;
            if (reach > bestReach || dest.score > bestScore) {
                bestReach = reach;
                bestScore = dest.score;
                bestDest = dest.addr;
            }
        }
        bestDest.time = this.network.now();
        return bestDest;
    };
    /**
     * Mark local address as seen during a handshake.
     * @param {NetAddress} addr
     * @returns {Boolean}
     */
    HostList.prototype.markLocal = function (addr) {
        var local = this.local.get(addr.hostname);
        if (!local)
            return false;
        local.score += 1;
        return true;
    };
    /**
     * Discover hosts from seeds.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.discoverSeeds = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobs, _i, _a, seed;
            return __generator(this, function (_b) {
                jobs = [];
                for (_i = 0, _a = this.dnsSeeds; _i < _a.length; _i++) {
                    seed = _a[_i];
                    jobs.push(this.populateSeed(seed));
                }
                return [2 /*return*/, Promise.all(jobs)];
            });
        });
    };
    /**
     * Discover hosts from nodes.
     * @method
     * @returns {Promise}
     */
    HostList.prototype.discoverNodes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var jobs, _i, _a, node;
            return __generator(this, function (_b) {
                jobs = [];
                for (_i = 0, _a = this.dnsNodes; _i < _a.length; _i++) {
                    node = _a[_i];
                    jobs.push(this.populateNode(node));
                }
                return [2 /*return*/, Promise.all(jobs)];
            });
        });
    };
    /**
     * Lookup node's domain.
     * @method
     * @param {Object} addr
     * @returns {Promise}
     */
    HostList.prototype.populateNode = function (addr) {
        return __awaiter(this, void 0, void 0, function () {
            var addrs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.populate(addr)];
                    case 1:
                        addrs = _a.sent();
                        if (addrs.length === 0)
                            return [2 /*return*/];
                        this.nodes.push(addrs[0]);
                        this.add(addrs[0]);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Populate from seed.
     * @method
     * @param {Object} seed
     * @returns {Promise}
     */
    HostList.prototype.populateSeed = function (seed) {
        return __awaiter(this, void 0, void 0, function () {
            var addrs, _i, addrs_1, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.populate(seed)];
                    case 1:
                        addrs = _a.sent();
                        for (_i = 0, addrs_1 = addrs; _i < addrs_1.length; _i++) {
                            addr = addrs_1[_i];
                            this.add(addr);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lookup hosts from dns host.
     * @method
     * @param {Object} target
     * @returns {Promise}
     */
    HostList.prototype.populate = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var addrs, hosts, e_4, _i, hosts_2, host, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addrs = [];
                        assert(target.type === IP.types.DNS, 'Resolved host passed.');
                        this.logger.info('Resolving host: %s.', target.host);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.resolve(target.host)];
                    case 2:
                        hosts = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        this.logger.error(e_4);
                        return [2 /*return*/, addrs];
                    case 4:
                        for (_i = 0, hosts_2 = hosts; _i < hosts_2.length; _i++) {
                            host = hosts_2[_i];
                            addr = NetAddress.fromHost(host, target.port, this.network);
                            addrs.push(addr);
                        }
                        return [2 /*return*/, addrs];
                }
            });
        });
    };
    /**
     * Convert host list to json-friendly object.
     * @returns {Object}
     */
    HostList.prototype.toJSON = function () {
        var addrs = [];
        var fresh = [];
        var used = [];
        for (var _i = 0, _a = this.map.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            addrs.push(entry.toJSON());
        }
        for (var _b = 0, _c = this.fresh; _b < _c.length; _b++) {
            var bucket = _c[_b];
            var keys = [];
            for (var _d = 0, _e = bucket.keys(); _d < _e.length; _d++) {
                var key = _e[_d];
                keys.push(key);
            }
            fresh.push(keys);
        }
        for (var _f = 0, _g = this.used; _f < _g.length; _f++) {
            var bucket = _g[_f];
            var keys = [];
            for (var entry = bucket.head; entry; entry = entry.next)
                keys.push(entry.key());
            used.push(keys);
        }
        return {
            version: HostList.VERSION,
            network: this.network.type,
            addrs: addrs,
            fresh: fresh,
            used: used
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @returns {HostList}
     */
    HostList.prototype.fromJSON = function (json) {
        var sources = new Map();
        var map = new Map();
        var fresh = [];
        var used = [];
        var totalFresh = 0;
        var totalUsed = 0;
        assert(json && typeof json === 'object');
        assert(!json.network || json.network === this.network.type, 'Network mistmatch.');
        assert(json.version === HostList.VERSION, 'Bad address serialization version.');
        assert(Array.isArray(json.addrs));
        for (var _i = 0, _a = json.addrs; _i < _a.length; _i++) {
            var addr = _a[_i];
            var entry = HostEntry.fromJSON(addr, this.network);
            var src = sources.get(entry.src.hostname);
            // Save some memory.
            if (!src) {
                src = entry.src;
                sources.set(src.hostname, src);
            }
            entry.src = src;
            map.set(entry.key(), entry);
        }
        assert(Array.isArray(json.fresh));
        assert(json.fresh.length <= this.options.maxBuckets, 'Buckets mismatch.');
        for (var _b = 0, _c = json.fresh; _b < _c.length; _b++) {
            var keys = _c[_b];
            var bucket = new Map();
            for (var _d = 0, keys_1 = keys; _d < keys_1.length; _d++) {
                var key = keys_1[_d];
                var entry = map.get(key);
                assert(entry);
                if (entry.refCount === 0)
                    totalFresh += 1;
                entry.refCount += 1;
                bucket.set(key, entry);
            }
            assert(bucket.size <= this.options.maxEntries, 'Bucket size mismatch.');
            fresh.push(bucket);
        }
        assert(fresh.length === this.fresh.length, 'Buckets mismatch.');
        assert(Array.isArray(json.used));
        assert(json.used.length <= this.options.maxBuckets, 'Buckets mismatch.');
        for (var _e = 0, _f = json.used; _e < _f.length; _e++) {
            var keys = _f[_e];
            var bucket = new List();
            for (var _g = 0, keys_2 = keys; _g < keys_2.length; _g++) {
                var key = keys_2[_g];
                var entry = map.get(key);
                assert(entry);
                assert(entry.refCount === 0);
                assert(!entry.used);
                entry.used = true;
                totalUsed += 1;
                bucket.push(entry);
            }
            assert(bucket.size <= this.options.maxEntries, 'Bucket size mismatch.');
            used.push(bucket);
        }
        assert(used.length === this.used.length, 'Buckets mismatch.');
        for (var _h = 0, _j = map.values(); _h < _j.length; _h++) {
            var entry = _j[_h];
            assert(entry.used || entry.refCount > 0);
        }
        this.map = map;
        this.fresh = fresh;
        this.totalFresh = totalFresh;
        this.used = used;
        this.totalUsed = totalUsed;
        return this;
    };
    /**
     * Instantiate host list from json object.
     * @param {Object} options
     * @param {Object} json
     * @returns {HostList}
     */
    HostList.fromJSON = function (options, json) {
        return new this(options).fromJSON(json);
    };
    return HostList;
}());
/**
 * Number of days before considering
 * an address stale.
 * @const {Number}
 * @default
 */
HostList.HORIZON_DAYS = 30;
/**
 * Number of retries (without success)
 * before considering an address stale.
 * @const {Number}
 * @default
 */
HostList.RETRIES = 3;
/**
 * Number of days after reaching
 * MAX_FAILURES to consider an
 * address stale.
 * @const {Number}
 * @default
 */
HostList.MIN_FAIL_DAYS = 7;
/**
 * Maximum number of failures
 * allowed before considering
 * an address stale.
 * @const {Number}
 * @default
 */
HostList.MAX_FAILURES = 10;
/**
 * Maximum number of references
 * in fresh buckets.
 * @const {Number}
 * @default
 */
HostList.MAX_REFS = 8;
/**
 * Serialization version.
 * @const {Number}
 * @default
 */
HostList.VERSION = 0;
/**
 * Local address scores.
 * @enum {Number}
 * @default
 */
HostList.scores = {
    NONE: 0,
    IF: 1,
    BIND: 2,
    UPNP: 3,
    DNS: 3,
    MANUAL: 4,
    MAX: 5
};
/**
 * Host Entry
 * @alias module:net.HostEntry
 */
var HostEntry = /** @class */ (function () {
    /**
     * Create a host entry.
     * @constructor
     * @param {NetAddress} addr
     * @param {NetAddress} src
     */
    function HostEntry(addr, src) {
        this.addr = addr || new NetAddress();
        this.src = src || new NetAddress();
        this.prev = null;
        this.next = null;
        this.used = false;
        this.refCount = 0;
        this.attempts = 0;
        this.lastSuccess = 0;
        this.lastAttempt = 0;
        if (addr)
            this.fromOptions(addr, src);
    }
    /**
     * Inject properties from options.
     * @private
     * @param {NetAddress} addr
     * @param {NetAddress} src
     * @returns {HostEntry}
     */
    HostEntry.prototype.fromOptions = function (addr, src) {
        assert(addr instanceof NetAddress);
        assert(src instanceof NetAddress);
        this.addr = addr;
        this.src = src;
        return this;
    };
    /**
     * Instantiate host entry from options.
     * @param {NetAddress} addr
     * @param {NetAddress} src
     * @returns {HostEntry}
     */
    HostEntry.fromOptions = function (addr, src) {
        return new this().fromOptions(addr, src);
    };
    /**
     * Get key suitable for a hash table (hostname).
     * @returns {String}
     */
    HostEntry.prototype.key = function () {
        return this.addr.hostname;
    };
    /**
     * Get host priority.
     * @param {Number} now
     * @returns {Number}
     */
    HostEntry.prototype.chance = function (now) {
        var c = 1;
        if (now - this.lastAttempt < 60 * 10)
            c *= 0.01;
        c *= Math.pow(0.66, Math.min(this.attempts, 8));
        return c;
    };
    /**
     * Inspect host address.
     * @returns {Object}
     */
    HostEntry.prototype[inspectSymbol] = function () {
        return {
            addr: this.addr,
            src: this.src,
            used: this.used,
            refCount: this.refCount,
            attempts: this.attempts,
            lastSuccess: util.date(this.lastSuccess),
            lastAttempt: util.date(this.lastAttempt)
        };
    };
    /**
     * Convert host entry to json-friendly object.
     * @returns {Object}
     */
    HostEntry.prototype.toJSON = function () {
        return {
            addr: this.addr.hostname,
            src: this.src.hostname,
            services: this.addr.services.toString(2),
            time: this.addr.time,
            attempts: this.attempts,
            lastSuccess: this.lastSuccess,
            lastAttempt: this.lastAttempt
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @param {Network} network
     * @returns {HostEntry}
     */
    HostEntry.prototype.fromJSON = function (json, network) {
        assert(json && typeof json === 'object');
        assert(typeof json.addr === 'string');
        assert(typeof json.src === 'string');
        this.addr.fromHostname(json.addr, network);
        if (json.services != null) {
            assert(typeof json.services === 'string');
            assert(json.services.length > 0);
            assert(json.services.length <= 32);
            var services = parseInt(json.services, 2);
            assert((services >>> 0) === services);
            this.addr.services = services;
        }
        if (json.time != null) {
            assert(Number.isSafeInteger(json.time));
            assert(json.time >= 0);
            this.addr.time = json.time;
        }
        if (json.src != null) {
            assert(typeof json.src === 'string');
            this.src.fromHostname(json.src, network);
        }
        if (json.attempts != null) {
            assert((json.attempts >>> 0) === json.attempts);
            this.attempts = json.attempts;
        }
        if (json.lastSuccess != null) {
            assert(Number.isSafeInteger(json.lastSuccess));
            assert(json.lastSuccess >= 0);
            this.lastSuccess = json.lastSuccess;
        }
        if (json.lastAttempt != null) {
            assert(Number.isSafeInteger(json.lastAttempt));
            assert(json.lastAttempt >= 0);
            this.lastAttempt = json.lastAttempt;
        }
        return this;
    };
    /**
     * Instantiate host entry from json object.
     * @param {Object} json
     * @param {Network} network
     * @returns {HostEntry}
     */
    HostEntry.fromJSON = function (json, network) {
        return new this().fromJSON(json, network);
    };
    return HostEntry;
}());
/**
 * Local Address
 * @alias module:net.LocalAddress
 */
var LocalAddress = /** @class */ (function () {
    /**
     * Create a local address.
     * @constructor
     * @param {NetAddress} addr
     * @param {Number?} score
     */
    function LocalAddress(addr, score) {
        this.addr = addr;
        this.score = score || 0;
    }
    return LocalAddress;
}());
/**
 * Host List Options
 * @alias module:net.HostListOptions
 */
var HostListOptions = /** @class */ (function () {
    /**
     * Create host list options.
     * @constructor
     * @param {Object?} options
     */
    function HostListOptions(options) {
        this.network = Network.primary;
        this.logger = Logger.global;
        this.resolve = dns.lookup;
        this.host = '0.0.0.0';
        this.port = this.network.port;
        this.services = common.LOCAL_SERVICES;
        this.onion = false;
        this.banTime = common.BAN_TIME;
        this.address = new NetAddress();
        this.address.services = this.services;
        this.address.time = this.network.now();
        this.seeds = this.network.seeds;
        this.nodes = [];
        this.maxBuckets = 20;
        this.maxEntries = 50;
        this.prefix = null;
        this.filename = null;
        this.memory = true;
        this.flushInterval = 120000;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     */
    HostListOptions.prototype.fromOptions = function (options) {
        assert(options, 'Options are required.');
        if (options.network != null) {
            this.network = Network.get(options.network);
            this.seeds = this.network.seeds;
            this.address.port = this.network.port;
            this.port = this.network.port;
        }
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.resolve != null) {
            assert(typeof options.resolve === 'function');
            this.resolve = options.resolve;
        }
        if (options.banTime != null) {
            assert(options.banTime >= 0);
            this.banTime = options.banTime;
        }
        if (options.seeds) {
            assert(Array.isArray(options.seeds));
            this.seeds = options.seeds;
        }
        if (options.nodes) {
            assert(Array.isArray(options.nodes));
            this.nodes = options.nodes;
        }
        if (options.host != null) {
            assert(typeof options.host === 'string');
            var raw = IP.toBuffer(options.host);
            this.host = IP.toString(raw);
            if (IP.isRoutable(raw))
                this.address.setHost(this.host);
        }
        if (options.port != null) {
            assert(typeof options.port === 'number');
            assert(options.port > 0 && options.port <= 0xffff);
            this.port = options.port;
            this.address.setPort(this.port);
        }
        if (options.publicHost != null) {
            assert(typeof options.publicHost === 'string');
            this.address.setHost(options.publicHost);
        }
        if (options.publicPort != null) {
            assert(typeof options.publicPort === 'number');
            assert(options.publicPort > 0 && options.publicPort <= 0xffff);
            this.address.setPort(options.publicPort);
        }
        if (options.services != null) {
            assert(typeof options.services === 'number');
            this.services = options.services;
        }
        if (options.onion != null) {
            assert(typeof options.onion === 'boolean');
            this.onion = options.onion;
        }
        if (options.maxBuckets != null) {
            assert(typeof options.maxBuckets === 'number');
            this.maxBuckets = options.maxBuckets;
        }
        if (options.maxEntries != null) {
            assert(typeof options.maxEntries === 'number');
            this.maxEntries = options.maxEntries;
        }
        if (options.memory != null) {
            assert(typeof options.memory === 'boolean');
            this.memory = options.memory;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.filename = path.join(this.prefix, 'hosts.json');
        }
        if (options.filename != null) {
            assert(typeof options.filename === 'string');
            this.filename = options.filename;
        }
        if (options.flushInterval != null) {
            assert(options.flushInterval >= 0);
            this.flushInterval = options.flushInterval;
        }
        this.address.time = this.network.now();
        this.address.services = this.services;
        return this;
    };
    return HostListOptions;
}());
/*
 * Helpers
 */
function concat32(left, right) {
    var data = POOL32;
    left.copy(data, 0);
    right.copy(data, 32);
    return data;
}
function random(max) {
    return randomRange(0, max);
}
/*
 * Expose
 */
module.exports = HostList;
