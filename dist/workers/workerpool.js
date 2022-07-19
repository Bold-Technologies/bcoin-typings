/*!
 * workerpool.js - worker processes for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
/* eslint no-nested-ternary: "off" */
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
var os = require('os');
var Network = require('../protocol/network');
var Child = require('./child');
var jobs = require('./jobs');
var Parser = require('./parser');
var Framer = require('./framer');
var packets = require('./packets');
/**
 * Worker Pool
 * @alias module:workers.WorkerPool
 * @extends EventEmitter
 * @property {Number} size
 * @property {Number} timeout
 * @property {Map} children
 * @property {Number} uid
 */
var WorkerPool = /** @class */ (function (_super) {
    __extends(WorkerPool, _super);
    /**
     * Create a worker pool.
     * @constructor
     * @param {Object} options
     * @param {Number} [options.size=num-cores] - Max pool size.
     * @param {Number} [options.timeout=120000] - Execution timeout.
     */
    function WorkerPool(options) {
        var _this = _super.call(this) || this;
        _this.enabled = false;
        _this.size = getCores();
        _this.timeout = 120000;
        _this.file = process.env.BCOIN_WORKER_FILE || 'worker.js';
        _this.children = new Map();
        _this.uid = 0;
        _this.set(options);
        return _this;
    }
    /**
     * Set worker pool options.
     * @param {Object} options
     */
    WorkerPool.prototype.set = function (options) {
        if (!options)
            return;
        if (options.enabled != null) {
            assert(typeof options.enabled === 'boolean');
            this.enabled = options.enabled;
        }
        if (options.size != null) {
            assert((options.size >>> 0) === options.size);
            assert(options.size > 0);
            this.size = options.size;
        }
        if (options.timeout != null) {
            assert(Number.isSafeInteger(options.timeout));
            assert(options.timeout >= -1);
            this.timeout = options.timeout;
        }
        if (options.file != null) {
            assert(typeof options.file === 'string');
            this.file = options.file;
        }
    };
    /**
     * Open worker pool.
     * @returns {Promise}
     */
    WorkerPool.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close worker pool.
     * @returns {Promise}
     */
    WorkerPool.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.destroy();
                return [2 /*return*/];
            });
        });
    };
    /**
     * Spawn a new worker.
     * @param {Number} id - Worker ID.
     * @returns {Worker}
     */
    WorkerPool.prototype.spawn = function (id) {
        var _this = this;
        var child = new Worker(this.file);
        child.id = id;
        child.on('error', function (err) {
            _this.emit('error', err, child);
        });
        child.on('exit', function (code) {
            _this.emit('exit', code, child);
            if (_this.children.get(id) === child)
                _this.children["delete"](id);
        });
        child.on('event', function (items) {
            _this.emit('event', items, child);
            _this.emit.apply(_this, items);
        });
        child.on('log', function (text) {
            _this.emit('log', text, child);
        });
        this.emit('spawn', child);
        return child;
    };
    /**
     * Allocate a new worker, will not go above `size` option
     * and will automatically load balance the workers.
     * @returns {Worker}
     */
    WorkerPool.prototype.alloc = function () {
        var id = this.uid++ % this.size;
        if (!this.children.has(id))
            this.children.set(id, this.spawn(id));
        return this.children.get(id);
    };
    /**
     * Emit an event on the worker side (all workers).
     * @param {String} event
     * @param {...Object} arg
     * @returns {Boolean}
     */
    WorkerPool.prototype.sendEvent = function () {
        var result = true;
        for (var _i = 0, _a = this.children.values(); _i < _a.length; _i++) {
            var child = _a[_i];
            if (!child.sendEvent.apply(child, arguments))
                result = false;
        }
        return result;
    };
    /**
     * Destroy all workers.
     */
    WorkerPool.prototype.destroy = function () {
        for (var _i = 0, _a = this.children.values(); _i < _a.length; _i++) {
            var child = _a[_i];
            child.destroy();
        }
    };
    /**
     * Call a method for a worker to execute.
     * @param {Packet} packet
     * @param {Number} timeout
     * @returns {Promise}
     */
    WorkerPool.prototype.execute = function (packet, timeout) {
        if (!this.enabled || !Child.hasSupport()) {
            return new Promise(function (resolve, reject) {
                setImmediate(function () {
                    var result;
                    try {
                        result = jobs.handle(packet);
                    }
                    catch (e) {
                        reject(e);
                        return;
                    }
                    resolve(result);
                });
            });
        }
        if (!timeout)
            timeout = this.timeout;
        var child = this.alloc();
        return child.execute(packet, timeout);
    };
    /**
     * Execute the tx check job (default timeout).
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    WorkerPool.prototype.check = function (tx, view, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.CheckPacket(tx, view, flags);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        if (result.error)
                            throw result.error;
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Execute the tx signing job (default timeout).
     * @method
     * @param {MTX} tx
     * @param {KeyRing[]} ring
     * @param {SighashType} type
     * @returns {Promise}
     */
    WorkerPool.prototype.sign = function (tx, ring, type) {
        return __awaiter(this, void 0, void 0, function () {
            var rings, packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rings = ring;
                        if (!Array.isArray(rings))
                            rings = [rings];
                        packet = new packets.SignPacket(tx, rings, type);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        result.inject(tx);
                        return [2 /*return*/, result.total];
                }
            });
        });
    };
    /**
     * Execute the tx input check job (default timeout).
     * @method
     * @param {TX} tx
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    WorkerPool.prototype.checkInput = function (tx, index, coin, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.CheckInputPacket(tx, index, coin, flags);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        if (result.error)
                            throw result.error;
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Execute the tx input signing job (default timeout).
     * @method
     * @param {MTX} tx
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @param {SighashType} type
     * @returns {Promise}
     */
    WorkerPool.prototype.signInput = function (tx, index, coin, ring, type) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.SignInputPacket(tx, index, coin, ring, type);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        result.inject(tx);
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    /**
     * Execute the secp256k1 verify job (no timeout).
     * @method
     * @param {Buffer} msg
     * @param {Buffer} sig - DER formatted.
     * @param {Buffer} key
     * @returns {Promise}
     */
    WorkerPool.prototype.ecVerify = function (msg, sig, key) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.ECVerifyPacket(msg, sig, key);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    /**
     * Execute the secp256k1 signing job (no timeout).
     * @method
     * @param {Buffer} msg
     * @param {Buffer} key
     * @returns {Promise}
     */
    WorkerPool.prototype.ecSign = function (msg, key) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.ECSignPacket(msg, key);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.sig];
                }
            });
        });
    };
    /**
     * Execute the mining job (no timeout).
     * @method
     * @param {Buffer} data
     * @param {Buffer} target
     * @param {Number} min
     * @param {Number} max
     * @returns {Promise} - Returns {Number}.
     */
    WorkerPool.prototype.mine = function (data, target, min, max) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.MinePacket(data, target, min, max);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.nonce];
                }
            });
        });
    };
    /**
     * Execute scrypt job (no timeout).
     * @method
     * @param {Buffer} passwd
     * @param {Buffer} salt
     * @param {Number} N
     * @param {Number} r
     * @param {Number} p
     * @param {Number} len
     * @returns {Promise}
     */
    WorkerPool.prototype.scrypt = function (passwd, salt, N, r, p, len) {
        return __awaiter(this, void 0, void 0, function () {
            var packet, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packet = new packets.ScryptPacket(passwd, salt, N, r, p, len);
                        return [4 /*yield*/, this.execute(packet, -1)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.key];
                }
            });
        });
    };
    return WorkerPool;
}(EventEmitter));
/**
 * Worker
 * @alias module:workers.Worker
 * @extends EventEmitter
 */
var Worker = /** @class */ (function (_super) {
    __extends(Worker, _super);
    /**
     * Create a worker.
     * @constructor
     * @param {String} file
     */
    function Worker(file) {
        var _this = _super.call(this) || this;
        _this.id = -1;
        _this.framer = new Framer();
        _this.parser = new Parser();
        _this.pending = new Map();
        _this.child = new Child(file);
        _this.init();
        return _this;
    }
    /**
     * Initialize worker. Bind to events.
     * @private
     */
    Worker.prototype.init = function () {
        var _this = this;
        this.child.on('data', function (data) {
            _this.parser.feed(data);
        });
        this.child.on('exit', function (code, signal) {
            _this.emit('exit', code, signal);
        });
        this.child.on('error', function (err) {
            _this.emit('error', err);
        });
        this.parser.on('error', function (err) {
            _this.emit('error', err);
        });
        this.parser.on('packet', function (packet) {
            _this.emit('packet', packet);
        });
        this.listen();
    };
    /**
     * Listen for packets.
     * @private
     */
    Worker.prototype.listen = function () {
        var _this = this;
        this.on('exit', function (code, signal) {
            _this.killJobs();
        });
        this.on('error', function (err) {
            _this.killJobs();
        });
        this.on('packet', function (packet) {
            try {
                _this.handlePacket(packet);
            }
            catch (e) {
                _this.emit('error', e);
            }
        });
        this.sendEnv({
            BCOIN_WORKER_NETWORK: Network.type,
            BCOIN_WORKER_ISTTY: process.stdout
                ? (process.stdout.isTTY ? '1' : '0')
                : '0'
        });
    };
    /**
     * Handle packet.
     * @private
     * @param {Packet} packet
     */
    Worker.prototype.handlePacket = function (packet) {
        switch (packet.cmd) {
            case packets.types.EVENT:
                this.emit('event', packet.items);
                this.emit.apply(this, packet.items);
                break;
            case packets.types.LOG:
                this.emit('log', packet.text);
                break;
            case packets.types.ERROR:
                this.emit('error', packet.error);
                break;
            case packets.types.ERRORRESULT:
                this.rejectJob(packet.id, packet.error);
                break;
            default:
                this.resolveJob(packet.id, packet);
                break;
        }
    };
    /**
     * Send data to worker.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    Worker.prototype.write = function (data) {
        return this.child.write(data);
    };
    /**
     * Frame and send a packet.
     * @param {Packet} packet
     * @returns {Boolean}
     */
    Worker.prototype.send = function (packet) {
        return this.write(this.framer.packet(packet));
    };
    /**
     * Send environment.
     * @param {Object} env
     * @returns {Boolean}
     */
    Worker.prototype.sendEnv = function (env) {
        return this.send(new packets.EnvPacket(env));
    };
    /**
     * Emit an event on the worker side.
     * @param {String} event
     * @param {...Object} arg
     * @returns {Boolean}
     */
    Worker.prototype.sendEvent = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        return this.send(new packets.EventPacket(items));
    };
    /**
     * Destroy the worker.
     */
    Worker.prototype.destroy = function () {
        return this.child.destroy();
    };
    /**
     * Call a method for a worker to execute.
     * @param {Packet} packet
     * @param {Number} timeout
     * @returns {Promise}
     */
    Worker.prototype.execute = function (packet, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._execute(packet, timeout, resolve, reject);
        });
    };
    /**
     * Call a method for a worker to execute.
     * @private
     * @param {Packet} packet
     * @param {Number} timeout
     * @param {Function} resolve
     * @param {Function} reject
     * the worker method specifies.
     */
    Worker.prototype._execute = function (packet, timeout, resolve, reject) {
        var job = new PendingJob(this, packet.id, resolve, reject);
        assert(!this.pending.has(packet.id), 'ID overflow.');
        this.pending.set(packet.id, job);
        job.start(timeout);
        this.send(packet);
    };
    /**
     * Resolve a job.
     * @param {Number} id
     * @param {Packet} result
     */
    Worker.prototype.resolveJob = function (id, result) {
        var job = this.pending.get(id);
        if (!job)
            throw new Error("Job ".concat(id, " is not in progress."));
        job.resolve(result);
    };
    /**
     * Reject a job.
     * @param {Number} id
     * @param {Error} err
     */
    Worker.prototype.rejectJob = function (id, err) {
        var job = this.pending.get(id);
        if (!job)
            throw new Error("Job ".concat(id, " is not in progress."));
        job.reject(err);
    };
    /**
     * Kill all jobs associated with worker.
     */
    Worker.prototype.killJobs = function () {
        for (var _i = 0, _a = this.pending.values(); _i < _a.length; _i++) {
            var job = _a[_i];
            job.destroy();
        }
    };
    return Worker;
}(EventEmitter));
/**
 * Pending Job
 * @ignore
 */
var PendingJob = /** @class */ (function () {
    /**
     * Create a pending job.
     * @constructor
     * @param {Worker} worker
     * @param {Number} id
     * @param {Function} resolve
     * @param {Function} reject
     */
    function PendingJob(worker, id, resolve, reject) {
        this.worker = worker;
        this.id = id;
        this.job = { resolve: resolve, reject: reject };
        this.timer = null;
    }
    /**
     * Start the timer.
     * @param {Number} timeout
     */
    PendingJob.prototype.start = function (timeout) {
        var _this = this;
        if (!timeout || timeout <= 0)
            return;
        this.timer = setTimeout(function () {
            _this.reject(new Error('Worker timed out.'));
        }, timeout);
    };
    /**
     * Destroy the job with an error.
     */
    PendingJob.prototype.destroy = function () {
        this.reject(new Error('Job was destroyed.'));
    };
    /**
     * Cleanup job state.
     * @returns {Job}
     */
    PendingJob.prototype.cleanup = function () {
        var job = this.job;
        assert(job, 'Already finished.');
        this.job = null;
        if (this.timer != null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        assert(this.worker.pending.has(this.id));
        this.worker.pending["delete"](this.id);
        return job;
    };
    /**
     * Complete job with result.
     * @param {Object} result
     */
    PendingJob.prototype.resolve = function (result) {
        var job = this.cleanup();
        job.resolve(result);
    };
    /**
     * Complete job with error.
     * @param {Error} err
     */
    PendingJob.prototype.reject = function (err) {
        var job = this.cleanup();
        job.reject(err);
    };
    return PendingJob;
}());
/*
 * Helpers
 */
function getCores() {
    return Math.max(2, os.cpus().length);
}
/*
 * Expose
 */
module.exports = WorkerPool;
