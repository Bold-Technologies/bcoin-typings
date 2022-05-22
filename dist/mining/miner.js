/*!
 * miner.js - block generator for bcoin
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
var EventEmitter = require('events');
var Heap = require('bheep');
var BufferMap = require('buffer-map').BufferMap;
var random = require('bcrypto/lib/random');
var Amount = require('../btc/amount');
var Address = require('../primitives/address');
var BlockTemplate = require('./template');
var Network = require('../protocol/network');
var consensus = require('../protocol/consensus');
var policy = require('../protocol/policy');
var CPUMiner = require('./cpuminer');
var BlockEntry = BlockTemplate.BlockEntry;
/**
 * Miner
 * A bitcoin miner and block generator.
 * @alias module:mining.Miner
 * @extends EventEmitter
 */
var Miner = /** @class */ (function (_super) {
    __extends(Miner, _super);
    /**
     * Create a bitcoin miner.
     * @constructor
     * @param {Object} options
     */
    function Miner(options) {
        var _this = _super.call(this) || this;
        _this.opened = false;
        _this.options = new MinerOptions(options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('miner');
        _this.workers = _this.options.workers;
        _this.chain = _this.options.chain;
        _this.mempool = _this.options.mempool;
        _this.addresses = _this.options.addresses;
        _this.locker = _this.chain.locker;
        _this.cpu = new CPUMiner(_this);
        _this.init();
        return _this;
    }
    /**
     * Initialize the miner.
     */
    Miner.prototype.init = function () {
        var _this = this;
        this.cpu.on('error', function (err) {
            _this.emit('error', err);
        });
    };
    /**
     * Open the miner, wait for the chain and mempool to load.
     * @returns {Promise}
     */
    Miner.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(!this.opened, 'Miner is already open.');
                        this.opened = true;
                        return [4 /*yield*/, this.cpu.open()];
                    case 1:
                        _a.sent();
                        this.logger.info('Miner loaded (flags=%s).', this.options.coinbaseFlags.toString('utf8'));
                        if (this.addresses.length === 0)
                            this.logger.warning('No reward address is set for miner!');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the miner.
     * @returns {Promise}
     */
    Miner.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(this.opened, 'Miner is not open.');
                this.opened = false;
                return [2 /*return*/, this.cpu.close()];
            });
        });
    };
    /**
     * Create a block template.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link BlockTemplate}.
     */
    Miner.prototype.createBlock = function (tip, address) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._createBlock(tip, address)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a block template (without a lock).
     * @method
     * @private
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link BlockTemplate}.
     */
    Miner.prototype._createBlock = function (tip, address) {
        return __awaiter(this, void 0, void 0, function () {
            var version, mtp, time, state, target, locktime, attempt, block, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        version = this.options.version;
                        if (!tip)
                            tip = this.chain.tip;
                        if (!address)
                            address = this.getAddress();
                        if (!(version === -1)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.computeBlockVersion(tip)];
                    case 1:
                        version = _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.chain.getMedianTime(tip)];
                    case 3:
                        mtp = _a.sent();
                        time = Math.max(this.network.now(), mtp + 1);
                        return [4 /*yield*/, this.chain.getDeployments(time, tip)];
                    case 4:
                        state = _a.sent();
                        return [4 /*yield*/, this.chain.getTarget(time, tip)];
                    case 5:
                        target = _a.sent();
                        locktime = state.hasMTP() ? mtp : time;
                        attempt = new BlockTemplate({
                            prevBlock: tip.hash,
                            height: tip.height + 1,
                            version: version,
                            time: time,
                            bits: target,
                            locktime: locktime,
                            mtp: mtp,
                            flags: state.flags,
                            address: address,
                            coinbaseFlags: this.options.coinbaseFlags,
                            witness: state.hasWitness(),
                            interval: this.network.halvingInterval,
                            weight: this.options.reservedWeight,
                            sigops: this.options.reservedSigops
                        });
                        this.assemble(attempt);
                        this.logger.debug('Created block tmpl (height=%d, weight=%d, fees=%d, txs=%s, diff=%d).', attempt.height, attempt.weight, Amount.btc(attempt.fees), attempt.items.length + 1, attempt.getDifficulty());
                        if (!this.options.preverify) return [3 /*break*/, 10];
                        block = attempt.toBlock();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.chain._verifyBlock(block)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_1 = _a.sent();
                        if (e_1.type === 'VerifyError') {
                            this.logger.warning('Miner created invalid block!');
                            this.logger.error(e_1);
                            throw new Error('BUG: Miner created invalid block.');
                        }
                        throw e_1;
                    case 9:
                        this.logger.debug('Preverified block %d successfully!', attempt.height);
                        _a.label = 10;
                    case 10: return [2 /*return*/, attempt];
                }
            });
        });
    };
    /**
     * Update block timestamp.
     * @param {BlockTemplate} attempt
     */
    Miner.prototype.updateTime = function (attempt) {
        attempt.time = Math.max(this.network.now(), attempt.mtp + 1);
    };
    /**
     * Create a cpu miner job.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} Returns {@link CPUJob}.
     */
    Miner.prototype.createJob = function (tip, address) {
        return this.cpu.createJob(tip, address);
    };
    /**
     * Mine a single block.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} Returns {@link Block}.
     */
    Miner.prototype.mineBlock = function (tip, address) {
        return this.cpu.mineBlock(tip, address);
    };
    /**
     * Add an address to the address list.
     * @param {Address} address
     */
    Miner.prototype.addAddress = function (address) {
        this.addresses.push(new Address(address));
    };
    /**
     * Get a random address from the address list.
     * @returns {Address}
     */
    Miner.prototype.getAddress = function () {
        if (this.addresses.length === 0)
            return new Address();
        return this.addresses[random.randomRange(0, this.addresses.length)];
    };
    /**
     * Get mempool entries, sort by dependency order.
     * Prioritize by priority and fee rates.
     * @param {BlockTemplate} attempt
     * @returns {MempoolEntry[]}
     */
    Miner.prototype.assemble = function (attempt) {
        if (!this.mempool) {
            attempt.refresh();
            return;
        }
        assert(this.mempool.tip.equals(this.chain.tip.hash), 'Mempool/chain tip mismatch! Unsafe to create block.');
        var depMap = new BufferMap();
        var queue = new Heap(cmpRate);
        var priority = this.options.priorityWeight > 0;
        if (priority)
            queue.set(cmpPriority);
        for (var _i = 0, _a = this.mempool.map.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            var item = BlockEntry.fromEntry(entry, attempt);
            var tx = item.tx;
            if (tx.isCoinbase())
                throw new Error('Cannot add coinbase to block.');
            for (var _b = 0, _c = tx.inputs; _b < _c.length; _b++) {
                var prevout = _c[_b].prevout;
                var hash = prevout.hash;
                if (!this.mempool.hasEntry(hash))
                    continue;
                item.depCount += 1;
                if (!depMap.has(hash))
                    depMap.set(hash, []);
                depMap.get(hash).push(item);
            }
            if (item.depCount > 0)
                continue;
            queue.insert(item);
        }
        while (queue.size() > 0) {
            var item = queue.shift();
            var tx = item.tx;
            var hash = item.hash;
            var weight = attempt.weight;
            var sigops = attempt.sigops;
            if (!tx.isFinal(attempt.height, attempt.locktime))
                continue;
            if (!attempt.witness && tx.hasWitness())
                continue;
            weight += tx.getWeight();
            if (weight > this.options.maxWeight)
                continue;
            sigops += item.sigops;
            if (sigops > this.options.maxSigops)
                continue;
            if (priority) {
                if (weight > this.options.priorityWeight
                    || item.priority < this.options.priorityThreshold) {
                    priority = false;
                    queue.set(cmpRate);
                    queue.init();
                    queue.insert(item);
                    continue;
                }
            }
            else {
                if (item.free && weight >= this.options.minWeight)
                    continue;
            }
            attempt.weight = weight;
            attempt.sigops = sigops;
            attempt.fees += item.fee;
            attempt.items.push(item);
            var deps = depMap.get(hash);
            if (!deps)
                continue;
            for (var _d = 0, deps_1 = deps; _d < deps_1.length; _d++) {
                var item_1 = deps_1[_d];
                if (--item_1.depCount === 0)
                    queue.insert(item_1);
            }
        }
        attempt.refresh();
        assert(attempt.weight <= consensus.MAX_BLOCK_WEIGHT, 'Block exceeds reserved weight!');
        if (this.options.preverify) {
            var block = attempt.toBlock();
            assert(block.getWeight() <= attempt.weight, 'Block exceeds reserved weight!');
            assert(block.getBaseSize() <= consensus.MAX_BLOCK_SIZE, 'Block exceeds max block size.');
        }
    };
    return Miner;
}(EventEmitter));
/**
 * Miner Options
 * @alias module:mining.MinerOptions
 */
var MinerOptions = /** @class */ (function () {
    /**
     * Create miner options.
     * @constructor
     * @param {Object}
     */
    function MinerOptions(options) {
        this.network = Network.primary;
        this.logger = null;
        this.workers = null;
        this.chain = null;
        this.mempool = null;
        this.version = -1;
        this.addresses = [];
        this.coinbaseFlags = Buffer.from('mined by bcoin', 'ascii');
        this.preverify = false;
        this.minWeight = policy.MIN_BLOCK_WEIGHT;
        this.maxWeight = policy.MAX_BLOCK_WEIGHT;
        this.priorityWeight = policy.BLOCK_PRIORITY_WEIGHT;
        this.priorityThreshold = policy.BLOCK_PRIORITY_THRESHOLD;
        this.maxSigops = consensus.MAX_BLOCK_SIGOPS_COST;
        this.reservedWeight = 4000;
        this.reservedSigops = 400;
        this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {MinerOptions}
     */
    MinerOptions.prototype.fromOptions = function (options) {
        assert(options, 'Miner requires options.');
        assert(options.chain && typeof options.chain === 'object', 'Miner requires a blockchain.');
        this.chain = options.chain;
        this.network = options.chain.network;
        this.logger = options.chain.logger;
        this.workers = options.chain.workers;
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.workers != null) {
            assert(typeof options.workers === 'object');
            this.workers = options.workers;
        }
        if (options.mempool != null) {
            assert(typeof options.mempool === 'object');
            this.mempool = options.mempool;
        }
        if (options.version != null) {
            assert((options.version >>> 0) === options.version);
            this.version = options.version;
        }
        if (options.address) {
            if (Array.isArray(options.address)) {
                for (var _i = 0, _a = options.address; _i < _a.length; _i++) {
                    var item = _a[_i];
                    this.addresses.push(new Address(item));
                }
            }
            else {
                this.addresses.push(new Address(options.address));
            }
        }
        if (options.addresses) {
            assert(Array.isArray(options.addresses));
            for (var _b = 0, _c = options.addresses; _b < _c.length; _b++) {
                var item = _c[_b];
                this.addresses.push(new Address(item));
            }
        }
        if (options.coinbaseFlags) {
            var flags = options.coinbaseFlags;
            if (typeof flags === 'string')
                flags = Buffer.from(flags, 'utf8');
            assert(Buffer.isBuffer(flags));
            assert(flags.length <= 20, 'Coinbase flags > 20 bytes.');
            this.coinbaseFlags = flags;
        }
        if (options.preverify != null) {
            assert(typeof options.preverify === 'boolean');
            this.preverify = options.preverify;
        }
        if (options.minWeight != null) {
            assert((options.minWeight >>> 0) === options.minWeight);
            this.minWeight = options.minWeight;
        }
        if (options.maxWeight != null) {
            assert((options.maxWeight >>> 0) === options.maxWeight);
            assert(options.maxWeight <= consensus.MAX_BLOCK_WEIGHT, 'Max weight must be below MAX_BLOCK_WEIGHT');
            this.maxWeight = options.maxWeight;
        }
        if (options.maxSigops != null) {
            assert((options.maxSigops >>> 0) === options.maxSigops);
            assert(options.maxSigops <= consensus.MAX_BLOCK_SIGOPS_COST, 'Max sigops must be below MAX_BLOCK_SIGOPS_COST');
            this.maxSigops = options.maxSigops;
        }
        if (options.priorityWeight != null) {
            assert((options.priorityWeight >>> 0) === options.priorityWeight);
            this.priorityWeight = options.priorityWeight;
        }
        if (options.priorityThreshold != null) {
            assert((options.priorityThreshold >>> 0) === options.priorityThreshold);
            this.priorityThreshold = options.priorityThreshold;
        }
        if (options.reservedWeight != null) {
            assert((options.reservedWeight >>> 0) === options.reservedWeight);
            this.reservedWeight = options.reservedWeight;
        }
        if (options.reservedSigops != null) {
            assert((options.reservedSigops >>> 0) === options.reservedSigops);
            this.reservedSigops = options.reservedSigops;
        }
        return this;
    };
    /**
     * Instantiate miner options from object.
     * @param {Object} options
     * @returns {MinerOptions}
     */
    MinerOptions.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    return MinerOptions;
}());
/*
 * Helpers
 */
function cmpPriority(a, b) {
    if (a.priority === b.priority)
        return cmpRate(a, b);
    return b.priority - a.priority;
}
function cmpRate(a, b) {
    var x = a.rate;
    var y = b.rate;
    if (a.descRate > a.rate)
        x = a.descRate;
    if (b.descRate > b.rate)
        y = b.descRate;
    if (x === y) {
        x = a.priority;
        y = b.priority;
    }
    return y - x;
}
/*
 * Expose
 */
module.exports = Miner;
