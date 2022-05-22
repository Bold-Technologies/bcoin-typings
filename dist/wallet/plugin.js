/*!
 * plugin.js - wallet plugin for bcoin
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
var EventEmitter = require('events');
var WalletDB = require('./walletdb');
var NodeClient = require('./nodeclient');
var HTTP = require('./http');
var RPC = require('./rpc');
/**
 * @exports wallet/plugin
 */
var plugin = exports;
/**
 * Plugin
 * @extends EventEmitter
 */
var Plugin = /** @class */ (function (_super) {
    __extends(Plugin, _super);
    /**
     * Create a plugin.
     * @constructor
     * @param {Node} node
     */
    function Plugin(node) {
        var _this = _super.call(this) || this;
        _this.config = node.config.filter('wallet');
        if (node.config.options.file)
            _this.config.open('wallet.conf');
        _this.network = node.network;
        _this.logger = node.logger;
        _this.client = new NodeClient(node);
        _this.wdb = new WalletDB({
            network: _this.network,
            logger: _this.logger,
            workers: _this.workers,
            client: _this.client,
            prefix: _this.config.prefix,
            memory: _this.config.bool('memory', node.memory),
            maxFiles: _this.config.uint('max-files'),
            cacheSize: _this.config.mb('cache-size'),
            witness: _this.config.bool('witness'),
            wipeNoReally: _this.config.bool('wipe-no-really'),
            spv: node.spv
        });
        _this.rpc = new RPC(_this);
        _this.http = new HTTP({
            network: _this.network,
            logger: _this.logger,
            node: _this,
            ssl: _this.config.bool('ssl'),
            keyFile: _this.config.path('ssl-key'),
            certFile: _this.config.path('ssl-cert'),
            host: _this.config.str('http-host'),
            port: _this.config.uint('http-port'),
            apiKey: _this.config.str('api-key', node.config.str('api-key')),
            walletAuth: _this.config.bool('wallet-auth'),
            noAuth: _this.config.bool('no-auth'),
            cors: _this.config.bool('cors'),
            adminToken: _this.config.str('admin-token')
        });
        _this.init();
        return _this;
    }
    Plugin.prototype.init = function () {
        var _this = this;
        this.wdb.on('error', function (err) { return _this.emit('error', err); });
        this.http.on('error', function (err) { return _this.emit('error', err); });
    };
    Plugin.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wdb.open()];
                    case 1:
                        _a.sent();
                        this.rpc.wallet = this.wdb.primary;
                        return [4 /*yield*/, this.http.open()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Plugin.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.close()];
                    case 1:
                        _a.sent();
                        this.rpc.wallet = null;
                        return [4 /*yield*/, this.wdb.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Plugin;
}(EventEmitter));
/**
 * Plugin name.
 * @const {String}
 */
plugin.id = 'walletdb';
/**
 * Plugin initialization.
 * @param {Node} node
 * @returns {WalletDB}
 */
plugin.init = function init(node) {
    return new Plugin(node);
};
