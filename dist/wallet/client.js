/*!
 * client.js - http client for wallets
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
var NodeClient = require('../client/node');
var util = require('../utils/util');
var TX = require('../primitives/tx');
var hash256 = require('bcrypto/lib/hash256');
var parsers = {
    'block connect': function (entry, txs) { return parseBlock(entry, txs); },
    'block disconnect': function (entry) { return [parseEntry(entry)]; },
    'block rescan': function (entry, txs) { return parseBlock(entry, txs); },
    'chain reset': function (entry) { return [parseEntry(entry)]; },
    'tx': function (tx) { return [TX.fromRaw(tx)]; }
};
var WalletClient = /** @class */ (function (_super) {
    __extends(WalletClient, _super);
    function WalletClient(options) {
        return _super.call(this, options) || this;
    }
    WalletClient.prototype.bind = function (event, handler) {
        var parser = parsers[event];
        if (!parser) {
            _super.prototype.bind.call(this, event, handler);
            return;
        }
        _super.prototype.bind.call(this, event, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return handler.apply(void 0, parser.apply(void 0, args));
        });
    };
    WalletClient.prototype.hook = function (event, handler) {
        var parser = parsers[event];
        if (!parser) {
            _super.prototype.hook.call(this, event, handler);
            return;
        }
        _super.prototype.hook.call(this, event, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return handler.apply(void 0, parser.apply(void 0, args));
        });
    };
    WalletClient.prototype.getTip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = parseEntry;
                        return [4 /*yield*/, _super.prototype.getTip.call(this)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    WalletClient.prototype.getEntry = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (Buffer.isBuffer(block))
                            block = util.revHex(block);
                        _a = parseEntry;
                        return [4 /*yield*/, _super.prototype.getEntry.call(this, block)];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    WalletClient.prototype.send = function (tx) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _super.prototype.send.call(this, tx.toRaw())];
            });
        });
    };
    WalletClient.prototype.setFilter = function (filter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, _super.prototype.setFilter.call(this, filter.toRaw())];
            });
        });
    };
    WalletClient.prototype.rescan = function (start) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (Buffer.isBuffer(start))
                    start = util.revHex(start);
                return [2 /*return*/, _super.prototype.rescan.call(this, start)];
            });
        });
    };
    return WalletClient;
}(NodeClient));
/*
 * Helpers
 */
function parseEntry(data) {
    assert(Buffer.isBuffer(data));
    assert(data.length >= 84);
    var hash = hash256.digest(data.slice(0, 80));
    return {
        hash: hash,
        height: data.readUInt32LE(80, true),
        time: data.readUInt32LE(68, true)
    };
}
function parseBlock(entry, txs) {
    var block = parseEntry(entry);
    var out = [];
    for (var _i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
        var tx = txs_1[_i];
        out.push(TX.fromRaw(tx));
    }
    return [block, out];
}
/*
 * Expose
 */
module.exports = WalletClient;
