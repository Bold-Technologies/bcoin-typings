/*!
 * server.js - http server for bcoin
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
var path = require('path');
var Server = require('bweb').Server;
var Validator = require('bval');
var base58 = require('bcrypto/lib/encoding/base58');
var MTX = require('../primitives/mtx');
var Outpoint = require('../primitives/outpoint');
var Script = require('../script/script');
var sha256 = require('bcrypto/lib/sha256');
var random = require('bcrypto/lib/random');
var safeEqual = require('bcrypto/lib/safe').safeEqual;
var Network = require('../protocol/network');
var Address = require('../primitives/address');
var KeyRing = require('../primitives/keyring');
var Mnemonic = require('../hd/mnemonic');
var HDPrivateKey = require('../hd/private');
var HDPublicKey = require('../hd/public');
var common = require('./common');
var pkg = require('../pkg');
/**
 * HTTP
 * @alias module:wallet.HTTP
 */
var HTTP = /** @class */ (function (_super) {
    __extends(HTTP, _super);
    /**
     * Create an http server.
     * @constructor
     * @param {Object} options
     */
    function HTTP(options) {
        var _this = _super.call(this, new HTTPOptions(options)) || this;
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('wallet-http');
        _this.wdb = _this.options.node.wdb;
        _this.rpc = _this.options.node.rpc;
        _this.init();
        return _this;
    }
    /**
     * Initialize http server.
     * @private
     */
    HTTP.prototype.init = function () {
        var _this = this;
        this.on('request', function (req, res) {
            if (req.method === 'POST' && req.pathname === '/')
                return;
            _this.logger.debug('Request for method=%s path=%s (%s).', req.method, req.pathname, req.socket.remoteAddress);
        });
        this.on('listening', function (address) {
            _this.logger.info('Wallet HTTP server listening on %s (port=%d).', address.address, address.port);
        });
        this.initRouter();
        this.initSockets();
    };
    /**
     * Initialize routes.
     * @private
     */
    HTTP.prototype.initRouter = function () {
        var _this = this;
        if (this.options.cors)
            this.use(this.cors());
        if (!this.options.noAuth) {
            this.use(this.basicAuth({
                hash: sha256.digest,
                password: this.options.apiKey,
                realm: 'wallet'
            }));
        }
        this.use(this.bodyParser({
            type: 'json'
        }));
        this.use(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, token;
            return __generator(this, function (_a) {
                if (!this.options.walletAuth) {
                    req.admin = true;
                    return [2 /*return*/];
                }
                valid = Validator.fromRequest(req);
                token = valid.buf('token');
                if (token && safeEqual(token, this.options.adminToken)) {
                    req.admin = true;
                    return [2 /*return*/];
                }
                if (req.method === 'POST' && req.path.length === 0) {
                    res.json(403);
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        }); });
        this.use(this.jsonRPC());
        this.use(this.router());
        this.error(function (err, req, res) {
            var code = err.statusCode || 500;
            res.json(code, {
                error: {
                    type: err.type,
                    code: err.code,
                    message: err.message
                }
            });
        });
        this.hook(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, id, token, wallet_1, wallet, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (req.path.length < 2)
                            return [2 /*return*/];
                        if (req.path[0] !== 'wallet')
                            return [2 /*return*/];
                        if (req.method === 'PUT' && req.path.length === 2)
                            return [2 /*return*/];
                        valid = Validator.fromRequest(req);
                        id = valid.str('id');
                        token = valid.buf('token');
                        if (!id) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        if (!(req.admin || !this.options.walletAuth)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.wdb.get(id)];
                    case 1:
                        wallet_1 = _a.sent();
                        if (!wallet_1) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        req.wallet = wallet_1;
                        return [2 /*return*/];
                    case 2:
                        if (!token) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.wdb.auth(id, token)];
                    case 4:
                        wallet = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _a.sent();
                        this.logger.info('Auth failure for %s: %s.', id, err_1.message);
                        res.json(403);
                        return [2 /*return*/];
                    case 6:
                        if (!wallet) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        req.wallet = wallet;
                        this.logger.info('Successful auth for %s.', id);
                        return [2 /*return*/];
                }
            });
        }); });
        // Info
        this.get('/', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                res.json(200, {
                    version: pkg.version,
                    network: this.network.type
                });
                return [2 /*return*/];
            });
        }); });
        // Rescan
        this.post('/rescan', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.admin) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        valid = Validator.fromRequest(req);
                        height = valid.u32('height');
                        res.json(200, { success: true });
                        return [4 /*yield*/, this.wdb.rescan(height)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Resend
        this.post('/resend', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.admin) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.wdb.resend()];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Backup WalletDB
        this.post('/backup', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.admin) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        valid = Validator.fromRequest(req);
                        path = valid.str('path');
                        enforce(path, 'Path is required.');
                        return [4 /*yield*/, this.wdb.backup(path)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // List wallets
        this.get('/wallet', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var wallets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.admin) {
                            res.json(403);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.wdb.getWallets()];
                    case 1:
                        wallets = _a.sent();
                        res.json(200, wallets);
                        return [2 /*return*/];
                }
            });
        }); });
        // Get wallet
        this.get('/wallet/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, req.wallet.getBalance()];
                    case 1:
                        balance = _a.sent();
                        res.json(200, req.wallet.toJSON(false, balance));
                        return [2 /*return*/];
                }
            });
        }); });
        // Get wallet master key
        this.get('/wallet/:id/master', function (req, res) {
            if (!req.admin) {
                res.json(403);
                return;
            }
            res.json(200, req.wallet.master.toJSON(_this.network, true));
        });
        // Create wallet
        this.put('/wallet/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, master, mnemonic, accountKey, wallet, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        master = valid.str('master');
                        mnemonic = valid.str('mnemonic');
                        accountKey = valid.str('accountKey');
                        if (master)
                            master = HDPrivateKey.fromBase58(master, this.network);
                        if (mnemonic)
                            mnemonic = Mnemonic.fromPhrase(mnemonic);
                        if (accountKey)
                            accountKey = HDPublicKey.fromBase58(accountKey, this.network);
                        return [4 /*yield*/, this.wdb.create({
                                id: valid.str('id'),
                                type: valid.str('type'),
                                m: valid.u32('m'),
                                n: valid.u32('n'),
                                passphrase: valid.str('passphrase'),
                                master: master,
                                mnemonic: mnemonic,
                                witness: valid.bool('witness'),
                                accountKey: accountKey,
                                watchOnly: valid.bool('watchOnly')
                            })];
                    case 1:
                        wallet = _a.sent();
                        return [4 /*yield*/, wallet.getBalance()];
                    case 2:
                        balance = _a.sent();
                        res.json(200, wallet.toJSON(false, balance));
                        return [2 /*return*/];
                }
            });
        }); });
        // List accounts
        this.get('/wallet/:id/account', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var accounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, req.wallet.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        res.json(200, accounts);
                        return [2 /*return*/];
                }
            });
        }); });
        // Get account
        this.get('/wallet/:id/account/:account', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, account, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.getAccount(acct)];
                    case 1:
                        account = _a.sent();
                        if (!account) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, req.wallet.getBalance(account.accountIndex)];
                    case 2:
                        balance = _a.sent();
                        res.json(200, account.toJSON(balance));
                        return [2 /*return*/];
                }
            });
        }); });
        // Create account
        this.put('/wallet/:id/account/:account', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, accountKey, options, account, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        accountKey = valid.get('accountKey');
                        if (accountKey)
                            accountKey = HDPublicKey.fromBase58(accountKey, this.network);
                        options = {
                            name: valid.str('account'),
                            witness: valid.bool('witness'),
                            type: valid.str('type'),
                            m: valid.u32('m'),
                            n: valid.u32('n'),
                            accountKey: accountKey,
                            lookahead: valid.u32('lookahead')
                        };
                        return [4 /*yield*/, req.wallet.createAccount(options, passphrase)];
                    case 1:
                        account = _a.sent();
                        return [4 /*yield*/, req.wallet.getBalance(account.accountIndex)];
                    case 2:
                        balance = _a.sent();
                        res.json(200, account.toJSON(balance));
                        return [2 /*return*/];
                }
            });
        }); });
        // Change passphrase
        this.post('/wallet/:id/passphrase', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, old;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        old = valid.str('old');
                        enforce(passphrase, 'Passphrase is required.');
                        return [4 /*yield*/, req.wallet.setPassphrase(passphrase, old)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Unlock wallet
        this.post('/wallet/:id/unlock', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, timeout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        timeout = valid.u32('timeout');
                        enforce(passphrase, 'Passphrase is required.');
                        return [4 /*yield*/, req.wallet.unlock(passphrase, timeout)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Lock wallet
        this.post('/wallet/:id/lock', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, req.wallet.lock()];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Import key
        this.post('/wallet/:id/import', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, passphrase, pub, priv, address, key, key, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        passphrase = valid.str('passphrase');
                        pub = valid.buf('publicKey');
                        priv = valid.str('privateKey');
                        address = valid.str('address');
                        if (!pub) return [3 /*break*/, 2];
                        key = KeyRing.fromPublic(pub);
                        return [4 /*yield*/, req.wallet.importKey(acct, key)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                    case 2:
                        if (!priv) return [3 /*break*/, 4];
                        key = KeyRing.fromSecret(priv, this.network);
                        return [4 /*yield*/, req.wallet.importKey(acct, key, passphrase)];
                    case 3:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                    case 4:
                        if (!address) return [3 /*break*/, 6];
                        addr = Address.fromString(address, this.network);
                        return [4 /*yield*/, req.wallet.importAddress(acct, addr)];
                    case 5:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                    case 6:
                        enforce(false, 'Key or address is required.');
                        return [2 /*return*/];
                }
            });
        }); });
        // Generate new token
        this.post('/wallet/:id/retoken', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        return [4 /*yield*/, req.wallet.retoken(passphrase)];
                    case 1:
                        token = _a.sent();
                        res.json(200, {
                            token: token.toString('hex')
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        // Send TX
        this.post('/wallet/:id/send', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, outputs, options, _i, outputs_1, output, valid_1, addr, script, tx, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        outputs = valid.array('outputs', []);
                        options = {
                            rate: valid.u64('rate'),
                            blocks: valid.u32('blocks'),
                            maxFee: valid.u64('maxFee'),
                            selection: valid.str('selection'),
                            smart: valid.bool('smart'),
                            account: valid.str('account'),
                            sort: valid.bool('sort'),
                            subtractFee: valid.bool('subtractFee'),
                            subtractIndex: valid.i32('subtractIndex'),
                            depth: valid.u32(['confirmations', 'depth']),
                            outputs: []
                        };
                        for (_i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
                            output = outputs_1[_i];
                            valid_1 = new Validator(output);
                            addr = valid_1.str('address');
                            script = valid_1.buf('script');
                            if (addr)
                                addr = Address.fromString(addr, this.network);
                            if (script)
                                script = Script.fromRaw(script);
                            options.outputs.push({
                                address: addr,
                                script: script,
                                value: valid_1.u64('value')
                            });
                        }
                        return [4 /*yield*/, req.wallet.send(options, passphrase)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, req.wallet.getDetails(tx.hash())];
                    case 2:
                        details = _a.sent();
                        res.json(200, details.toJSON(this.network, this.wdb.height));
                        return [2 /*return*/];
                }
            });
        }); });
        // Create TX
        this.post('/wallet/:id/create', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, outputs, sign, options, _i, outputs_2, output, valid_2, addr, script, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        outputs = valid.array('outputs', []);
                        sign = valid.bool('sign', true);
                        options = {
                            rate: valid.u64('rate'),
                            blocks: valid.u32('blocks'),
                            maxFee: valid.u64('maxFee'),
                            selection: valid.str('selection'),
                            smart: valid.bool('smart'),
                            account: valid.str('account'),
                            sort: valid.bool('sort'),
                            subtractFee: valid.bool('subtractFee'),
                            subtractIndex: valid.i32('subtractIndex'),
                            depth: valid.u32(['confirmations', 'depth']),
                            template: valid.bool('template', sign),
                            outputs: []
                        };
                        for (_i = 0, outputs_2 = outputs; _i < outputs_2.length; _i++) {
                            output = outputs_2[_i];
                            valid_2 = new Validator(output);
                            addr = valid_2.str('address');
                            script = valid_2.buf('script');
                            if (addr)
                                addr = Address.fromString(addr, this.network);
                            if (script)
                                script = Script.fromRaw(script);
                            options.outputs.push({
                                address: addr,
                                script: script,
                                value: valid_2.u64('value')
                            });
                        }
                        return [4 /*yield*/, req.wallet.createTX(options)];
                    case 1:
                        tx = _a.sent();
                        if (!sign) return [3 /*break*/, 3];
                        return [4 /*yield*/, req.wallet.sign(tx, passphrase)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        res.json(200, tx.getJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Sign TX
        this.post('/wallet/:id/sign', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, passphrase, raw, tx, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        passphrase = valid.str('passphrase');
                        raw = valid.buf('tx');
                        enforce(raw, 'TX is required.');
                        tx = MTX.fromRaw(raw);
                        _a = tx;
                        return [4 /*yield*/, req.wallet.getCoinView(tx)];
                    case 1:
                        _a.view = _b.sent();
                        return [4 /*yield*/, req.wallet.sign(tx, passphrase)];
                    case 2:
                        _b.sent();
                        res.json(200, tx.getJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Zap Wallet TXs
        this.post('/wallet/:id/zap', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, age;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        age = valid.u32('age');
                        enforce(age, 'Age is required.');
                        return [4 /*yield*/, req.wallet.zap(acct, age)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // Abandon Wallet TX
        this.del('/wallet/:id/tx/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.brhash('hash');
                        enforce(hash, 'Hash is required.');
                        return [4 /*yield*/, req.wallet.abandon(hash)];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        // List blocks
        this.get('/wallet/:id/block', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var heights;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, req.wallet.getBlocks()];
                    case 1:
                        heights = _a.sent();
                        res.json(200, heights);
                        return [2 /*return*/];
                }
            });
        }); });
        // Get Block Record
        this.get('/wallet/:id/block/:height', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, height, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        height = valid.u32('height');
                        enforce(height != null, 'Height is required.');
                        return [4 /*yield*/, req.wallet.getBlock(height)];
                    case 1:
                        block = _a.sent();
                        if (!block) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, block.toJSON());
                        return [2 /*return*/];
                }
            });
        }); });
        // Add key
        this.put('/wallet/:id/shared-key', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, b58, key, added;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        b58 = valid.str('accountKey');
                        enforce(b58, 'Key is required.');
                        key = HDPublicKey.fromBase58(b58, this.network);
                        return [4 /*yield*/, req.wallet.addSharedKey(acct, key)];
                    case 1:
                        added = _a.sent();
                        res.json(200, {
                            success: true,
                            addedKey: added
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        // Remove key
        this.del('/wallet/:id/shared-key', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, b58, key, removed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        b58 = valid.str('accountKey');
                        enforce(b58, 'Key is required.');
                        key = HDPublicKey.fromBase58(b58, this.network);
                        return [4 /*yield*/, req.wallet.removeSharedKey(acct, key)];
                    case 1:
                        removed = _a.sent();
                        res.json(200, {
                            success: true,
                            removedKey: removed
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        // Get key by address
        this.get('/wallet/:id/key/:address', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, b58, addr, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        b58 = valid.str('address');
                        enforce(b58, 'Address is required.');
                        addr = Address.fromString(b58, this.network);
                        return [4 /*yield*/, req.wallet.getKey(addr)];
                    case 1:
                        key = _a.sent();
                        if (!key) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, key.toJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Get private key
        this.get('/wallet/:id/wif/:address', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, address, passphrase, addr, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        address = valid.str('address');
                        passphrase = valid.str('passphrase');
                        enforce(address, 'Address is required.');
                        addr = Address.fromString(address, this.network);
                        return [4 /*yield*/, req.wallet.getPrivateKey(addr, passphrase)];
                    case 1:
                        key = _a.sent();
                        if (!key) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, { privateKey: key.toSecret(this.network) });
                        return [2 /*return*/];
                }
            });
        }); });
        // Create address
        this.post('/wallet/:id/address', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.createReceive(acct)];
                    case 1:
                        addr = _a.sent();
                        res.json(200, addr.toJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Create change address
        this.post('/wallet/:id/change', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.createChange(acct)];
                    case 1:
                        addr = _a.sent();
                        res.json(200, addr.toJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Create nested address
        this.post('/wallet/:id/nested', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.createNested(acct)];
                    case 1:
                        addr = _a.sent();
                        res.json(200, addr.toJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet Balance
        this.get('/wallet/:id/balance', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.getBalance(acct)];
                    case 1:
                        balance = _a.sent();
                        if (!balance) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, balance.toJSON());
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet UTXOs
        this.get('/wallet/:id/coin', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, coins, result, _i, coins_1, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.getCoins(acct)];
                    case 1:
                        coins = _a.sent();
                        result = [];
                        common.sortCoins(coins);
                        for (_i = 0, coins_1 = coins; _i < coins_1.length; _i++) {
                            coin = coins_1[_i];
                            result.push(coin.getJSON(this.network));
                        }
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Locked coins
        this.get('/wallet/:id/locked', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var locked, result, _i, locked_1, outpoint;
            return __generator(this, function (_a) {
                locked = req.wallet.getLocked();
                result = [];
                for (_i = 0, locked_1 = locked; _i < locked_1.length; _i++) {
                    outpoint = locked_1[_i];
                    result.push(outpoint.toJSON());
                }
                res.json(200, result);
                return [2 /*return*/];
            });
        }); });
        // Lock coin
        this.put('/wallet/:id/locked/:hash/:index', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, index, outpoint;
            return __generator(this, function (_a) {
                valid = Validator.fromRequest(req);
                hash = valid.brhash('hash');
                index = valid.u32('index');
                enforce(hash, 'Hash is required.');
                enforce(index != null, 'Index is required.');
                outpoint = new Outpoint(hash, index);
                req.wallet.lockCoin(outpoint);
                res.json(200, { success: true });
                return [2 /*return*/];
            });
        }); });
        // Unlock coin
        this.del('/wallet/:id/locked/:hash/:index', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, index, outpoint;
            return __generator(this, function (_a) {
                valid = Validator.fromRequest(req);
                hash = valid.brhash('hash');
                index = valid.u32('index');
                enforce(hash, 'Hash is required.');
                enforce(index != null, 'Index is required.');
                outpoint = new Outpoint(hash, index);
                req.wallet.unlockCoin(outpoint);
                res.json(200, { success: true });
                return [2 /*return*/];
            });
        }); });
        // Wallet Coin
        this.get('/wallet/:id/coin/:hash/:index', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, index, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.brhash('hash');
                        index = valid.u32('index');
                        enforce(hash, 'Hash is required.');
                        enforce(index != null, 'Index is required.');
                        return [4 /*yield*/, req.wallet.getCoin(hash, index)];
                    case 1:
                        coin = _a.sent();
                        if (!coin) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        res.json(200, coin.getJSON(this.network));
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet TXs
        this.get('/wallet/:id/tx/history', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, txs, details, result, _i, details_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.getHistory(acct)];
                    case 1:
                        txs = _a.sent();
                        common.sortTX(txs);
                        return [4 /*yield*/, req.wallet.toDetails(txs)];
                    case 2:
                        details = _a.sent();
                        result = [];
                        for (_i = 0, details_1 = details; _i < details_1.length; _i++) {
                            item = details_1[_i];
                            result.push(item.toJSON(this.network, this.wdb.height));
                        }
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet Pending TXs
        this.get('/wallet/:id/tx/unconfirmed', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, txs, details, result, _i, details_2, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        return [4 /*yield*/, req.wallet.getPending(acct)];
                    case 1:
                        txs = _a.sent();
                        common.sortTX(txs);
                        return [4 /*yield*/, req.wallet.toDetails(txs)];
                    case 2:
                        details = _a.sent();
                        result = [];
                        for (_i = 0, details_2 = details; _i < details_2.length; _i++) {
                            item = details_2[_i];
                            result.push(item.toJSON(this.network, this.wdb.height));
                        }
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet TXs within time range
        this.get('/wallet/:id/tx/range', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, options, txs, details, result, _i, details_3, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        options = {
                            start: valid.u32('start'),
                            end: valid.u32('end'),
                            limit: valid.u32('limit'),
                            reverse: valid.bool('reverse')
                        };
                        return [4 /*yield*/, req.wallet.getRange(acct, options)];
                    case 1:
                        txs = _a.sent();
                        return [4 /*yield*/, req.wallet.toDetails(txs)];
                    case 2:
                        details = _a.sent();
                        result = [];
                        for (_i = 0, details_3 = details; _i < details_3.length; _i++) {
                            item = details_3[_i];
                            result.push(item.toJSON(this.network, this.wdb.height));
                        }
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Last Wallet TXs
        this.get('/wallet/:id/tx/last', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, acct, limit, txs, details, result, _i, details_4, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        acct = valid.str('account');
                        limit = valid.u32('limit');
                        return [4 /*yield*/, req.wallet.getLast(acct, limit)];
                    case 1:
                        txs = _a.sent();
                        return [4 /*yield*/, req.wallet.toDetails(txs)];
                    case 2:
                        details = _a.sent();
                        result = [];
                        for (_i = 0, details_4 = details; _i < details_4.length; _i++) {
                            item = details_4[_i];
                            result.push(item.toJSON(this.network, this.wdb.height));
                        }
                        res.json(200, result);
                        return [2 /*return*/];
                }
            });
        }); });
        // Wallet TX
        this.get('/wallet/:id/tx/:hash', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var valid, hash, tx, details;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = Validator.fromRequest(req);
                        hash = valid.brhash('hash');
                        enforce(hash, 'Hash is required.');
                        return [4 /*yield*/, req.wallet.getTX(hash)];
                    case 1:
                        tx = _a.sent();
                        if (!tx) {
                            res.json(404);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, req.wallet.toDetails(tx)];
                    case 2:
                        details = _a.sent();
                        res.json(200, details.toJSON(this.network, this.wdb.height));
                        return [2 /*return*/];
                }
            });
        }); });
        // Resend
        this.post('/wallet/:id/resend', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, req.wallet.resend()];
                    case 1:
                        _a.sent();
                        res.json(200, { success: true });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Initialize websockets.
     * @private
     */
    HTTP.prototype.initSockets = function () {
        var _this = this;
        var handleTX = function (event, wallet, tx, details) {
            var name = "w:".concat(wallet.id);
            if (!_this.channel(name) && !_this.channel('w:*'))
                return;
            var json = details.toJSON(_this.network, _this.wdb.liveHeight());
            if (_this.channel(name))
                _this.to(name, event, wallet.id, json);
            if (_this.channel('w:*'))
                _this.to('w:*', event, wallet.id, json);
        };
        this.wdb.on('tx', function (wallet, tx, details) {
            handleTX('tx', wallet, tx, details);
        });
        this.wdb.on('confirmed', function (wallet, tx, details) {
            handleTX('confirmed', wallet, tx, details);
        });
        this.wdb.on('unconfirmed', function (wallet, tx, details) {
            handleTX('unconfirmed', wallet, tx, details);
        });
        this.wdb.on('conflict', function (wallet, tx, details) {
            handleTX('conflict', wallet, tx, details);
        });
        this.wdb.on('balance', function (wallet, balance) {
            var name = "w:".concat(wallet.id);
            if (!_this.channel(name) && !_this.channel('w:*'))
                return;
            var json = balance.toJSON();
            if (_this.channel(name))
                _this.to(name, 'balance', wallet.id, json);
            if (_this.channel('w:*'))
                _this.to('w:*', 'balance', wallet.id, json);
        });
        this.wdb.on('address', function (wallet, receive) {
            var name = "w:".concat(wallet.id);
            if (!_this.channel(name) && !_this.channel('w:*'))
                return;
            var json = [];
            for (var _i = 0, receive_1 = receive; _i < receive_1.length; _i++) {
                var addr = receive_1[_i];
                json.push(addr.toJSON(_this.network));
            }
            if (_this.channel(name))
                _this.to(name, 'address', wallet.id, json);
            if (_this.channel('w:*'))
                _this.to('w:*', 'address', wallet.id, json);
        });
    };
    /**
     * Handle new websocket.
     * @private
     * @param {WebSocket} socket
     */
    HTTP.prototype.handleSocket = function (socket) {
        var _this = this;
        socket.hook('auth', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (socket.channel('auth'))
                throw new Error('Already authed.');
            if (!_this.options.noAuth) {
                var valid = new Validator(args);
                var key = valid.str(0, '');
                if (key.length > 255)
                    throw new Error('Invalid API key.');
                var data = Buffer.from(key, 'utf8');
                var hash = sha256.digest(data);
                if (!safeEqual(hash, _this.options.apiHash))
                    throw new Error('Invalid API key.');
            }
            socket.join('auth');
            _this.logger.info('Successful auth from %s.', socket.host);
            _this.handleAuth(socket);
            return null;
        });
    };
    /**
     * Handle new auth'd websocket.
     * @private
     * @param {WebSocket} socket
     */
    HTTP.prototype.handleAuth = function (socket) {
        var _this = this;
        socket.hook('join', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var valid, id, token, wallet, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            valid = new Validator(args);
                            id = valid.str(0, '');
                            token = valid.buf(1);
                            if (!id)
                                throw new Error('Invalid parameter.');
                            if (!this.options.walletAuth) {
                                socket.join('admin');
                            }
                            else if (token) {
                                if (safeEqual(token, this.options.adminToken))
                                    socket.join('admin');
                            }
                            if (socket.channel('admin') || !this.options.walletAuth) {
                                socket.join("w:".concat(id));
                                return [2 /*return*/, null];
                            }
                            if (id === '*')
                                throw new Error('Bad token.');
                            if (!token)
                                throw new Error('Invalid parameter.');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.wdb.auth(id, token)];
                        case 2:
                            wallet = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.logger.info('Wallet auth failure for %s: %s.', id, e_1.message);
                            throw new Error('Bad token.');
                        case 4:
                            if (!wallet)
                                throw new Error('Wallet does not exist.');
                            this.logger.info('Successful wallet auth for %s.', id);
                            socket.join("w:".concat(id));
                            return [2 /*return*/, null];
                    }
                });
            });
        });
        socket.hook('leave', function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var valid = new Validator(args);
            var id = valid.str(0, '');
            if (!id)
                throw new Error('Invalid parameter.');
            socket.leave("w:".concat(id));
            return null;
        });
    };
    return HTTP;
}(Server));
var HTTPOptions = /** @class */ (function () {
    /**
     * HTTPOptions
     * @alias module:http.HTTPOptions
     * @constructor
     * @param {Object} options
     */
    function HTTPOptions(options) {
        this.network = Network.primary;
        this.logger = null;
        this.node = null;
        this.apiKey = base58.encode(random.randomBytes(20));
        this.apiHash = sha256.digest(Buffer.from(this.apiKey, 'ascii'));
        this.adminToken = random.randomBytes(32);
        this.serviceHash = this.apiHash;
        this.noAuth = false;
        this.cors = false;
        this.walletAuth = false;
        this.prefix = null;
        this.host = '127.0.0.1';
        this.port = 8080;
        this.ssl = false;
        this.keyFile = null;
        this.certFile = null;
        this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {HTTPOptions}
     */
    HTTPOptions.prototype.fromOptions = function (options) {
        assert(options);
        assert(options.node && typeof options.node === 'object', 'HTTP Server requires a WalletDB.');
        this.node = options.node;
        this.network = options.node.network;
        this.logger = options.node.logger;
        this.port = this.network.walletPort;
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.apiKey != null) {
            assert(typeof options.apiKey === 'string', 'API key must be a string.');
            assert(options.apiKey.length <= 255, 'API key must be under 255 bytes.');
            this.apiKey = options.apiKey;
            this.apiHash = sha256.digest(Buffer.from(this.apiKey, 'ascii'));
        }
        if (options.adminToken != null) {
            if (typeof options.adminToken === 'string') {
                assert(options.adminToken.length === 64, 'Admin token must be a 32 byte hex string.');
                var token = Buffer.from(options.adminToken, 'hex');
                assert(token.length === 32, 'Admin token must be a 32 byte hex string.');
                this.adminToken = token;
            }
            else {
                assert(Buffer.isBuffer(options.adminToken), 'Admin token must be a hex string or buffer.');
                assert(options.adminToken.length === 32, 'Admin token must be 32 bytes.');
                this.adminToken = options.adminToken;
            }
        }
        if (options.noAuth != null) {
            assert(typeof options.noAuth === 'boolean');
            this.noAuth = options.noAuth;
        }
        if (options.cors != null) {
            assert(typeof options.cors === 'boolean');
            this.cors = options.cors;
        }
        if (options.walletAuth != null) {
            assert(typeof options.walletAuth === 'boolean');
            this.walletAuth = options.walletAuth;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.keyFile = path.join(this.prefix, 'key.pem');
            this.certFile = path.join(this.prefix, 'cert.pem');
        }
        if (options.host != null) {
            assert(typeof options.host === 'string');
            this.host = options.host;
        }
        if (options.port != null) {
            assert((options.port & 0xffff) === options.port, 'Port must be a number.');
            this.port = options.port;
        }
        if (options.ssl != null) {
            assert(typeof options.ssl === 'boolean');
            this.ssl = options.ssl;
        }
        if (options.keyFile != null) {
            assert(typeof options.keyFile === 'string');
            this.keyFile = options.keyFile;
        }
        if (options.certFile != null) {
            assert(typeof options.certFile === 'string');
            this.certFile = options.certFile;
        }
        // Allow no-auth implicitly
        // if we're listening locally.
        if (!options.apiKey) {
            if (this.host === '127.0.0.1' || this.host === '::1')
                this.noAuth = true;
        }
        return this;
    };
    /**
     * Instantiate http options from object.
     * @param {Object} options
     * @returns {HTTPOptions}
     */
    HTTPOptions.fromOptions = function (options) {
        return new HTTPOptions().fromOptions(options);
    };
    return HTTPOptions;
}());
/*
 * Helpers
 */
function enforce(value, msg) {
    if (!value) {
        var err = new Error(msg);
        err.statusCode = 400;
        throw err;
    }
}
/*
 * Expose
 */
module.exports = HTTP;
