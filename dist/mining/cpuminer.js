/*!
 * cpuminer.js - inefficient cpu miner for bcoin (because we can)
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
var Lock = require('bmutex').Lock;
var util = require('../utils/util');
var mine = require('./mine');
/**
 * CPU miner.
 * @alias module:mining.CPUMiner
 */
var CPUMiner = /** @class */ (function (_super) {
    __extends(CPUMiner, _super);
    /**
     * Create a CPU miner.
     * @constructor
     * @param {Miner} miner
     */
    function CPUMiner(miner) {
        var _this = _super.call(this) || this;
        _this.opened = false;
        _this.miner = miner;
        _this.network = _this.miner.network;
        _this.logger = _this.miner.logger.context('cpuminer');
        _this.workers = _this.miner.workers;
        _this.chain = _this.miner.chain;
        _this.locker = new Lock();
        _this.running = false;
        _this.stopping = false;
        _this.job = null;
        _this.stopJob = null;
        _this.init();
        return _this;
    }
    /**
     * Initialize the miner.
     * @private
     */
    CPUMiner.prototype.init = function () {
        var _this = this;
        this.chain.on('tip', function (tip) {
            if (!_this.job)
                return;
            if (_this.job.attempt.prevBlock.equals(tip.prevBlock))
                _this.job.destroy();
        });
    };
    /**
     * Open the miner.
     * @returns {Promise}
     */
    CPUMiner.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(!this.opened, 'CPUMiner is already open.');
                this.opened = true;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close the miner.
     * @returns {Promise}
     */
    CPUMiner.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(this.opened, 'CPUMiner is not open.');
                this.opened = false;
                return [2 /*return*/, this.stop()];
            });
        });
    };
    /**
     * Start mining.
     * @method
     */
    CPUMiner.prototype.start = function () {
        assert(!this.running, 'Miner is already running.');
        this._start()["catch"](function () { });
    };
    /**
     * Start mining.
     * @method
     * @private
     * @returns {Promise}
     */
    CPUMiner.prototype._start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, e_1, block, e_2, entry, e_3, job;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        assert(!this.running, 'Miner is already running.');
                        this.running = true;
                        this.stopping = false;
                        _b.label = 1;
                    case 1:
                        this.job = null;
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        _a = this;
                        return [4 /*yield*/, this.createJob()];
                    case 3:
                        _a.job = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        this.emit('error', e_1);
                        return [3 /*break*/, 15];
                    case 5:
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        block = void 0;
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.mineAsync(this.job)];
                    case 7:
                        block = _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        e_2 = _b.sent();
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        this.emit('error', e_2);
                        return [3 /*break*/, 15];
                    case 9:
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        if (!block)
                            return [3 /*break*/, 14];
                        entry = void 0;
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.chain.add(block)];
                    case 11:
                        entry = _b.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        e_3 = _b.sent();
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        if (e_3.type === 'VerifyError') {
                            this.logger.warning('Mined an invalid block!');
                            this.logger.error(e_3);
                            return [3 /*break*/, 14];
                        }
                        this.emit('error', e_3);
                        return [3 /*break*/, 15];
                    case 13:
                        if (!entry) {
                            this.logger.warning('Mined a bad-prevblk (race condition?)');
                            return [3 /*break*/, 14];
                        }
                        if (this.stopping)
                            return [3 /*break*/, 15];
                        // Log the block hex as a failsafe (in case we can't send it).
                        this.logger.info('Found block: %d (%h).', entry.height, entry.hash);
                        this.emit('block', block, entry);
                        _b.label = 14;
                    case 14: return [3 /*break*/, 1];
                    case 15:
                        job = this.stopJob;
                        if (job) {
                            this.stopJob = null;
                            job.resolve();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stop mining.
     * @method
     * @returns {Promise}
     */
    CPUMiner.prototype.stop = function () {
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
                        return [4 /*yield*/, this._stop()];
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
     * Stop mining (without a lock).
     * @method
     * @returns {Promise}
     */
    CPUMiner.prototype._stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.running)
                            return [2 /*return*/];
                        assert(this.running, 'Miner is not running.');
                        assert(!this.stopping, 'Miner is already stopping.');
                        this.stopping = true;
                        if (this.job) {
                            this.job.destroy();
                            this.job = null;
                        }
                        return [4 /*yield*/, this.wait()];
                    case 1:
                        _a.sent();
                        this.running = false;
                        this.stopping = false;
                        this.job = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Wait for `done` event.
     * @private
     * @returns {Promise}
     */
    CPUMiner.prototype.wait = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            assert(!_this.stopJob);
            _this.stopJob = { resolve: resolve, reject: reject };
        });
    };
    /**
     * Create a mining job.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns {@link Job}.
     */
    CPUMiner.prototype.createJob = function (tip, address) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.miner.createBlock(tip, address)];
                    case 1:
                        attempt = _a.sent();
                        return [2 /*return*/, new CPUJob(this, attempt)];
                }
            });
        });
    };
    /**
     * Mine a single block.
     * @method
     * @param {ChainEntry?} tip
     * @param {Address?} address
     * @returns {Promise} - Returns [{@link Block}].
     */
    CPUMiner.prototype.mineBlock = function (tip, address) {
        return __awaiter(this, void 0, void 0, function () {
            var job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createJob(tip, address)];
                    case 1:
                        job = _a.sent();
                        return [4 /*yield*/, this.mineAsync(job)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Notify the miner that a new
     * tx has entered the mempool.
     */
    CPUMiner.prototype.notifyEntry = function () {
        if (!this.running)
            return;
        if (!this.job)
            return;
        if (util.now() - this.job.start > 10) {
            this.job.destroy();
            this.job = null;
        }
    };
    /**
     * Hash until the nonce overflows.
     * @param {CPUJob} job
     * @returns {Number} nonce
     */
    CPUMiner.prototype.findNonce = function (job) {
        var data = job.getHeader();
        var target = job.attempt.target;
        var interval = CPUMiner.INTERVAL;
        var min = 0;
        var max = interval;
        var nonce;
        while (max <= 0xffffffff) {
            nonce = mine(data, target, min, max);
            if (nonce !== -1)
                break;
            this.sendStatus(job, max);
            min += interval;
            max += interval;
        }
        return nonce;
    };
    /**
     * Hash until the nonce overflows.
     * @method
     * @param {CPUJob} job
     * @returns {Promise} Returns Number.
     */
    CPUMiner.prototype.findNonceAsync = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var data, target, interval, min, max, nonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.workers)
                            return [2 /*return*/, this.findNonce(job)];
                        data = job.getHeader();
                        target = job.attempt.target;
                        interval = CPUMiner.INTERVAL;
                        min = 0;
                        max = interval;
                        _a.label = 1;
                    case 1:
                        if (!(max <= 0xffffffff)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.workers.mine(data, target, min, max)];
                    case 2:
                        nonce = _a.sent();
                        if (nonce !== -1)
                            return [3 /*break*/, 3];
                        if (job.destroyed)
                            return [2 /*return*/, nonce];
                        this.sendStatus(job, max);
                        min += interval;
                        max += interval;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, nonce];
                }
            });
        });
    };
    /**
     * Mine synchronously until the block is found.
     * @param {CPUJob} job
     * @returns {Block}
     */
    CPUMiner.prototype.mine = function (job) {
        job.start = util.now();
        var nonce;
        for (;;) {
            nonce = this.findNonce(job);
            if (nonce !== -1)
                break;
            job.updateNonce();
            this.sendStatus(job, 0);
        }
        return job.commit(nonce);
    };
    /**
     * Mine asynchronously until the block is found.
     * @method
     * @param {CPUJob} job
     * @returns {Promise} - Returns {@link Block}.
     */
    CPUMiner.prototype.mineAsync = function (job) {
        return __awaiter(this, void 0, void 0, function () {
            var nonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        job.start = util.now();
                        _a.label = 1;
                    case 1: return [4 /*yield*/, this.findNonceAsync(job)];
                    case 2:
                        nonce = _a.sent();
                        if (nonce !== -1)
                            return [3 /*break*/, 4];
                        if (job.destroyed)
                            return [2 /*return*/, null];
                        job.updateNonce();
                        this.sendStatus(job, 0);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, job.commit(nonce)];
                }
            });
        });
    };
    /**
     * Send a progress report (emits `status`).
     * @param {CPUJob} job
     * @param {Number} nonce
     */
    CPUMiner.prototype.sendStatus = function (job, nonce) {
        var attempt = job.attempt;
        var tip = attempt.prevBlock;
        var hashes = job.getHashes(nonce);
        var hashrate = job.getRate(nonce);
        this.logger.info('Status: hashrate=%dkhs hashes=%d target=%d height=%d tip=%h', Math.floor(hashrate / 1000), hashes, attempt.bits, attempt.height, tip);
        this.emit('status', job, hashes, hashrate);
    };
    return CPUMiner;
}(EventEmitter));
/**
 * Nonce range interval.
 * @const {Number}
 * @default
 */
CPUMiner.INTERVAL = 0xffffffff / 1500 | 0;
/**
 * Mining Job
 * @ignore
 */
var CPUJob = /** @class */ (function () {
    /**
     * Create a mining job.
     * @constructor
     * @param {CPUMiner} miner
     * @param {BlockTemplate} attempt
     */
    function CPUJob(miner, attempt) {
        this.miner = miner;
        this.attempt = attempt;
        this.destroyed = false;
        this.committed = false;
        this.start = util.now();
        this.nonce1 = 0;
        this.nonce2 = 0;
        this.refresh();
    }
    /**
     * Get the raw block header.
     * @param {Number} nonce
     * @returns {Buffer}
     */
    CPUJob.prototype.getHeader = function () {
        var attempt = this.attempt;
        var n1 = this.nonce1;
        var n2 = this.nonce2;
        var time = attempt.time;
        var root = attempt.getRoot(n1, n2);
        var data = attempt.getHeader(root, time, 0);
        return data;
    };
    /**
     * Commit job and return a block.
     * @param {Number} nonce
     * @returns {Block}
     */
    CPUJob.prototype.commit = function (nonce) {
        var attempt = this.attempt;
        var n1 = this.nonce1;
        var n2 = this.nonce2;
        var time = attempt.time;
        assert(!this.committed, 'Job already committed.');
        this.committed = true;
        var proof = attempt.getProof(n1, n2, time, nonce);
        return attempt.commit(proof);
    };
    /**
     * Mine block synchronously.
     * @returns {Block}
     */
    CPUJob.prototype.mine = function () {
        return this.miner.mine(this);
    };
    /**
     * Mine block asynchronously.
     * @returns {Promise}
     */
    CPUJob.prototype.mineAsync = function () {
        return this.miner.mineAsync(this);
    };
    /**
     * Refresh the block template.
     */
    CPUJob.prototype.refresh = function () {
        return this.attempt.refresh();
    };
    /**
     * Increment the extraNonce.
     */
    CPUJob.prototype.updateNonce = function () {
        if (++this.nonce2 === 0x100000000) {
            this.nonce2 = 0;
            this.nonce1++;
        }
    };
    /**
     * Destroy the job.
     */
    CPUJob.prototype.destroy = function () {
        assert(!this.destroyed, 'Job already destroyed.');
        this.destroyed = true;
    };
    /**
     * Calculate number of hashes computed.
     * @param {Number} nonce
     * @returns {Number}
     */
    CPUJob.prototype.getHashes = function (nonce) {
        var extra = this.nonce1 * 0x100000000 + this.nonce2;
        return extra * 0xffffffff + nonce;
    };
    /**
     * Calculate hashrate.
     * @param {Number} nonce
     * @returns {Number}
     */
    CPUJob.prototype.getRate = function (nonce) {
        var hashes = this.getHashes(nonce);
        var seconds = util.now() - this.start;
        return Math.floor(hashes / Math.max(1, seconds));
    };
    /**
     * Add a transaction to the block.
     * @param {TX} tx
     * @param {CoinView} view
     */
    CPUJob.prototype.addTX = function (tx, view) {
        return this.attempt.addTX(tx, view);
    };
    /**
     * Add a transaction to the block
     * (less verification than addTX).
     * @param {TX} tx
     * @param {CoinView?} view
     */
    CPUJob.prototype.pushTX = function (tx, view) {
        return this.attempt.pushTX(tx, view);
    };
    return CPUJob;
}());
/*
 * Expose
 */
module.exports = CPUMiner;
