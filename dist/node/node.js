/*!
 * node.js - node object for bcoin
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
var fs = require('bfile');
var Logger = require('blgr');
var Config = require('bcfg');
var Network = require('../protocol/network');
var WorkerPool = require('../workers/workerpool');
/**
 * Node
 * Base class from which every other
 * Node-like object inherits.
 * @alias module:node.Node
 * @extends EventEmitter
 * @abstract
 */
var Node = /** @class */ (function (_super) {
    __extends(Node, _super);
    /**
     * Create a node.
     * @constructor
     * @param {Object} options
     */
    function Node(module, config, file, options) {
        var _this = _super.call(this) || this;
        _this.config = new Config(module, {
            suffix: 'network',
            fallback: 'main',
            alias: { 'n': 'network' }
        });
        _this.config.inject(options);
        _this.config.load(options);
        if (options.file || options.config)
            _this.config.open(config);
        _this.network = Network.get(_this.config.getSuffix());
        _this.memory = _this.config.bool('memory', true);
        _this.startTime = -1;
        _this.bound = [];
        _this.plugins = Object.create(null);
        _this.stack = [];
        _this.logger = null;
        _this.workers = null;
        _this.spv = false;
        _this.blocks = null;
        _this.chain = null;
        _this.fees = null;
        _this.mempool = null;
        _this.pool = null;
        _this.miner = null;
        _this.http = null;
        _this.txindex = null;
        _this.addrindex = null;
        _this.filterindex = null;
        _this._init(file);
        return _this;
    }
    /**
     * Initialize node.
     * @private
     * @param {Object} options
     */
    Node.prototype._init = function (file) {
        var _this = this;
        var config = this.config;
        var logger = new Logger();
        if (config.has('logger'))
            logger = config.obj('logger');
        logger.set({
            filename: !this.memory && config.bool('log-file')
                ? config.location(file)
                : null,
            level: config.str('log-level'),
            console: config.bool('log-console'),
            shrink: config.bool('log-shrink'),
            maxFileSize: config.mb('log-max-file-size'),
            maxFiles: config.uint('log-max-files')
        });
        this.logger = logger.context('node');
        this.workers = new WorkerPool({
            enabled: config.bool('workers'),
            size: config.uint('workers-size'),
            timeout: config.uint('workers-timeout'),
            file: config.str('worker-file')
        });
        this.on('error', function () { });
        this.workers.on('spawn', function (child) {
            _this.logger.info('Spawning worker process: %d.', child.id);
        });
        this.workers.on('exit', function (code, child) {
            _this.logger.warning('Worker %d exited: %s.', child.id, code);
        });
        this.workers.on('log', function (text, child) {
            _this.logger.debug('Worker %d says:', child.id);
            _this.logger.debug(text);
        });
        this.workers.on('error', function (err, child) {
            if (child) {
                _this.logger.error('Worker %d error: %s', child.id, err.message);
                return;
            }
            _this.emit('error', err);
        });
    };
    /**
     * Ensure prefix directory.
     * @returns {Promise}
     */
    Node.prototype.ensure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (fs.unsupported)
                            return [2 /*return*/, undefined];
                        if (this.memory)
                            return [2 /*return*/, undefined];
                        if (!this.blocks) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.blocks.ensure()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, fs.mkdirp(this.config.prefix)];
                }
            });
        });
    };
    /**
     * Create a file path using `prefix`.
     * @param {String} file
     * @returns {String}
     */
    Node.prototype.location = function (name) {
        return this.config.location(name);
    };
    /**
     * Open node. Bind all events.
     * @private
     */
    Node.prototype.handlePreopen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logger.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.workers.open()];
                    case 2:
                        _a.sent();
                        this._bind(this.network.time, 'offset', function (offset) {
                            _this.logger.info('Time offset: %d (%d minutes).', offset, offset / 60 | 0);
                        });
                        this._bind(this.network.time, 'sample', function (sample, total) {
                            _this.logger.debug('Added time data: samples=%d, offset=%d (%d minutes).', total, sample, sample / 60 | 0);
                        });
                        this._bind(this.network.time, 'mismatch', function () {
                            _this.logger.warning('Adjusted time mismatch!');
                            _this.logger.warning('Please make sure your system clock is correct!');
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open node.
     * @private
     */
    Node.prototype.handleOpen = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.startTime = Date.now();
                if (!this.workers.enabled) {
                    this.logger.warning('Warning: worker pool is disabled.');
                    this.logger.warning('Verification will be slow.');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Open node. Bind all events.
     * @private
     */
    Node.prototype.handlePreclose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                ;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Close node. Unbind all events.
     * @private
     */
    Node.prototype.handleClose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, obj, event_1, listener;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        for (_i = 0, _a = this.bound; _i < _a.length; _i++) {
                            _b = _a[_i], obj = _b[0], event_1 = _b[1], listener = _b[2];
                            obj.removeListener(event_1, listener);
                        }
                        this.bound.length = 0;
                        this.startTime = -1;
                        this.logger.info('Node is closed.');
                        return [4 /*yield*/, this.workers.close()];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.logger.close()];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bind to an event on `obj`, save listener for removal.
     * @private
     * @param {EventEmitter} obj
     * @param {String} event
     * @param {Function} listener
     */
    Node.prototype._bind = function (obj, event, listener) {
        this.bound.push([obj, event, listener]);
        obj.on(event, listener);
    };
    /**
     * Emit and log an error.
     * @private
     * @param {Error} err
     */
    Node.prototype.error = function (err) {
        this.logger.error(err);
        this.emit('error', err);
    };
    /**
     * Get node uptime in seconds.
     * @returns {Number}
     */
    Node.prototype.uptime = function () {
        if (this.startTime === -1)
            return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    };
    /**
     * Attach a plugin.
     * @param {Object} plugin
     * @returns {Object} Plugin instance.
     */
    Node.prototype.use = function (plugin) {
        var _this = this;
        assert(plugin, 'Plugin must be an object.');
        assert(typeof plugin.init === 'function', '`init` must be a function.');
        assert(!this.loaded, 'Cannot add plugin after node is loaded.');
        var instance = plugin.init(this);
        assert(!instance.open || typeof instance.open === 'function', '`open` must be a function.');
        assert(!instance.close || typeof instance.close === 'function', '`close` must be a function.');
        if (plugin.id) {
            assert(typeof plugin.id === 'string', '`id` must be a string.');
            // Reserved names
            switch (plugin.id) {
                case 'chain':
                case 'fees':
                case 'mempool':
                case 'miner':
                case 'pool':
                case 'rpc':
                case 'http':
                    assert(false, "".concat(plugin.id, " is already added."));
                    break;
            }
            assert(!this.plugins[plugin.id], "".concat(plugin.id, " is already added."));
            this.plugins[plugin.id] = instance;
        }
        this.stack.push(instance);
        if (typeof instance.on === 'function')
            instance.on('error', function (err) { return _this.error(err); });
        return instance;
    };
    /**
     * Test whether a plugin is available.
     * @param {String} name
     * @returns {Boolean}
     */
    Node.prototype.has = function (name) {
        return this.plugins[name] != null;
    };
    /**
     * Get a plugin.
     * @param {String} name
     * @returns {Object|null}
     */
    Node.prototype.get = function (name) {
        assert(typeof name === 'string', 'Plugin name must be a string.');
        // Reserved names.
        switch (name) {
            case 'chain':
                assert(this.chain, 'chain is not loaded.');
                return this.chain;
            case 'fees':
                assert(this.fees, 'fees is not loaded.');
                return this.fees;
            case 'mempool':
                assert(this.mempool, 'mempool is not loaded.');
                return this.mempool;
            case 'miner':
                assert(this.miner, 'miner is not loaded.');
                return this.miner;
            case 'pool':
                assert(this.pool, 'pool is not loaded.');
                return this.pool;
            case 'rpc':
                assert(this.rpc, 'rpc is not loaded.');
                return this.rpc;
            case 'http':
                assert(this.http, 'http is not loaded.');
                return this.http;
        }
        return this.plugins[name] || null;
    };
    /**
     * Require a plugin.
     * @param {String} name
     * @returns {Object}
     * @throws {Error} on onloaded plugin
     */
    Node.prototype.require = function (name) {
        var plugin = this.get(name);
        assert(plugin, "".concat(name, " is not loaded."));
        return plugin;
    };
    /**
     * Load plugins.
     * @private
     */
    Node.prototype.loadPlugins = function () {
        var plugins = this.config.array('plugins', []);
        var loader = this.config.func('loader');
        for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
            var plugin = plugins_1[_i];
            if (typeof plugin === 'string') {
                assert(loader, 'Must pass a loader function.');
                plugin = loader(plugin);
            }
            this.use(plugin);
        }
    };
    /**
     * Open plugins.
     * @private
     */
    Node.prototype.openPlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, plugin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.stack;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        plugin = _a[_i];
                        if (!plugin.open) return [3 /*break*/, 3];
                        return [4 /*yield*/, plugin.open()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close plugins.
     * @private
     */
    Node.prototype.closePlugins = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, plugin;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.stack;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        plugin = _a[_i];
                        if (!plugin.close) return [3 /*break*/, 3];
                        return [4 /*yield*/, plugin.close()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Node;
}(EventEmitter));
/*
 * Expose
 */
module.exports = Node;
