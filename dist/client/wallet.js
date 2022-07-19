/*!
 * wallet.js - http wallet client for bcoin
 * Copyright (c) 2017, Christopher Jeffrey (MIT License).
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var assert = require('bsert');
var EventEmitter = require('events');
var Client = require('bcurl').Client;
/**
 * Wallet Client
 * @extends {bcurl.Client}
 */
var WalletClient = /** @class */ (function (_super) {
    __extends(WalletClient, _super);
    /**
     * Create a wallet client.
     * @param {Object?} options
     */
    function WalletClient(options) {
        var _this = _super.call(this, options) || this;
        _this.wallets = new Map();
        return _this;
    }
    /**
     * Open the client.
     * @private
     * @returns {Promise}
     */
    WalletClient.prototype.init = function () {
        var _this = this;
        this.bind('tx', function (id, details) {
            _this.dispatch(id, 'tx', details);
        });
        this.bind('confirmed', function (id, details) {
            _this.dispatch(id, 'confirmed', details);
        });
        this.bind('unconfirmed', function (id, details) {
            _this.dispatch(id, 'unconfirmed', details);
        });
        this.bind('conflict', function (id, details) {
            _this.dispatch(id, 'conflict', details);
        });
        this.bind('updated', function (id, details) {
            _this.dispatch(id, 'updated', details);
        });
        this.bind('address', function (id, receive) {
            _this.dispatch(id, 'address', receive);
        });
        this.bind('balance', function (id, balance) {
            _this.dispatch(id, 'balance', balance);
        });
    };
    /**
     * Dispatch event.
     * @param {Number} id
     * @param {String} event
     * @private
     */
    WalletClient.prototype.dispatch = function (id, event) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var wallet = this.wallets.get(id);
        if (wallet)
            wallet.emit.apply(wallet, __spreadArray([event], args, false));
    };
    /**
     * Open the client.
     * @returns {Promise}
     */
    WalletClient.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.open.call(this)];
                    case 1:
                        _a.sent();
                        this.init();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the client.
     * @returns {Promise}
     */
    WalletClient.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.close.call(this)];
                    case 1:
                        _a.sent();
                        this.wallets = new Map();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Auth with server.
     * @returns {Promise}
     */
    WalletClient.prototype.auth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.call('auth', this.password)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Make an RPC call.
     * @returns {Promise}
     */
    WalletClient.prototype.execute = function (name, params) {
        return _super.prototype.execute.call(this, '/', name, params);
    };
    /**
     * Create a wallet object.
     * @param {Number} id
     * @param {String} token
     */
    WalletClient.prototype.wallet = function (id, token) {
        return new Wallet(this, id, token);
    };
    /**
     * Join a wallet.
     * @param {String} token
     */
    WalletClient.prototype.all = function (token) {
        return this.call('join', '*', token);
    };
    /**
     * Leave a wallet.
     */
    WalletClient.prototype.none = function () {
        return this.call('leave', '*');
    };
    /**
     * Join a wallet.
     * @param {Number} id
     * @param {String} token
     */
    WalletClient.prototype.join = function (id, token) {
        return this.call('join', id, token);
    };
    /**
     * Leave a wallet.
     * @param {Number} id
     */
    WalletClient.prototype.leave = function (id) {
        return this.call('leave', id);
    };
    /**
     * Rescan the chain.
     * @param {Number} height
     * @returns {Promise}
     */
    WalletClient.prototype.rescan = function (height) {
        return this.post('/rescan', { height: height });
    };
    /**
     * Resend pending transactions.
     * @returns {Promise}
     */
    WalletClient.prototype.resend = function () {
        return this.post('/resend');
    };
    /**
     * Backup the walletdb.
     * @param {String} path
     * @returns {Promise}
     */
    WalletClient.prototype.backup = function (path) {
        return this.post('/backup', { path: path });
    };
    /**
     * Get list of all wallet IDs.
     * @returns {Promise}
     */
    WalletClient.prototype.getWallets = function () {
        return this.get('/wallet');
    };
    /**
     * Create a wallet.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.createWallet = function (id, options) {
        return this.put("/wallet/".concat(id), options);
    };
    /**
     * Get wallet transaction history.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.getHistory = function (id, account) {
        return this.get("/wallet/".concat(id, "/tx/history"), { account: account });
    };
    /**
     * Get wallet coins.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.getCoins = function (id, account) {
        return this.get("/wallet/".concat(id, "/coin"), { account: account });
    };
    /**
     * Get all unconfirmed transactions.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.getPending = function (id, account) {
        return this.get("/wallet/".concat(id, "/tx/unconfirmed"), { account: account });
    };
    /**
     * Calculate wallet balance.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.getBalance = function (id, account) {
        return this.get("/wallet/".concat(id, "/balance"), { account: account });
    };
    /**
     * Get last N wallet transactions.
     * @param {Number} id
     * @param {String} account
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise}
     */
    WalletClient.prototype.getLast = function (id, account, limit) {
        return this.get("/wallet/".concat(id, "/tx/last"), { account: account, limit: limit });
    };
    /**
     * Get wallet transactions by timestamp range.
     * @param {Number} id
     * @param {String} account
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise}
     */
    WalletClient.prototype.getRange = function (id, account, options) {
        return this.get("/wallet/".concat(id, "/tx/range"), {
            account: account,
            start: options.start,
            end: options.end,
            limit: options.limit,
            reverse: options.reverse
        });
    };
    /**
     * Get transaction (only possible if the transaction
     * is available in the wallet history).
     * @param {Number} id
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletClient.prototype.getTX = function (id, hash) {
        return this.get("/wallet/".concat(id, "/tx/").concat(hash));
    };
    /**
     * Get wallet blocks.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.getBlocks = function (id) {
        return this.get("/wallet/".concat(id, "/block"));
    };
    /**
     * Get wallet block.
     * @param {Number} id
     * @param {Number} height
     * @returns {Promise}
     */
    WalletClient.prototype.getBlock = function (id, height) {
        return this.get("/wallet/".concat(id, "/block/").concat(height));
    };
    /**
     * Get unspent coin (only possible if the transaction
     * is available in the wallet history).
     * @param {Number} id
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    WalletClient.prototype.getCoin = function (id, hash, index) {
        return this.get("/wallet/".concat(id, "/coin/").concat(hash, "/").concat(index));
    };
    /**
     * @param {Number} id
     * @param {String} account
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    WalletClient.prototype.zap = function (id, account, age) {
        return this.post("/wallet/".concat(id, "/zap"), { account: account, age: age });
    };
    /**
     * @param {Number} id
     * @param {Hash} hash
     * @returns {Promise}
     */
    WalletClient.prototype.abandon = function (id, hash) {
        return this.del("/wallet/".concat(id, "/tx/").concat(hash));
    };
    /**
     * Create a transaction, fill.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.createTX = function (id, options) {
        return this.post("/wallet/".concat(id, "/create"), options);
    };
    /**
     * Create a transaction, fill, sign, and broadcast.
     * @param {Number} id
     * @param {Object} options
     * @param {String} options.address
     * @param {SatoshiAmount} options.value
     * @returns {Promise}
     */
    WalletClient.prototype.send = function (id, options) {
        return this.post("/wallet/".concat(id, "/send"), options);
    };
    /**
     * Sign a transaction.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.sign = function (id, options) {
        return this.post("/wallet/".concat(id, "/sign"), options);
    };
    /**
     * Get the raw wallet JSON.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.getInfo = function (id) {
        return this.get("/wallet/".concat(id));
    };
    /**
     * Get wallet accounts.
     * @param {Number} id
     * @returns {Promise} - Returns Array.
     */
    WalletClient.prototype.getAccounts = function (id) {
        return this.get("/wallet/".concat(id, "/account"));
    };
    /**
     * Get wallet master key.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.getMaster = function (id) {
        return this.get("/wallet/".concat(id, "/master"));
    };
    /**
     * Get wallet account.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.getAccount = function (id, account) {
        return this.get("/wallet/".concat(id, "/account/").concat(account));
    };
    /**
     * Create account.
     * @param {Number} id
     * @param {String} name
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.createAccount = function (id, name, options) {
        return this.put("/wallet/".concat(id, "/account/").concat(name), options);
    };
    /**
     * Create address.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.createAddress = function (id, account) {
        return this.post("/wallet/".concat(id, "/address"), { account: account });
    };
    /**
     * Create change address.
     * @param {Number} id
     * @param {Object} options
     * @returns {Promise}
     */
    WalletClient.prototype.createChange = function (id, account) {
        return this.post("/wallet/".concat(id, "/change"), { account: account });
    };
    /**
     * Create nested address.
     * @param {Number} id
     * @param {String} account
     * @returns {Promise}
     */
    WalletClient.prototype.createNested = function (id, account) {
        return this.post("/wallet/".concat(id, "/nested"), { account: account });
    };
    /**
     * Change or set master key`s passphrase.
     * @param {Number} id
     * @param {String|Buffer} passphrase
     * @param {(String|Buffer)?} old
     * @returns {Promise}
     */
    WalletClient.prototype.setPassphrase = function (id, passphrase, old) {
        return this.post("/wallet/".concat(id, "/passphrase"), { passphrase: passphrase, old: old });
    };
    /**
     * Generate a new token.
     * @param {Number} id
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    WalletClient.prototype.retoken = function (id, passphrase) {
        return this.post("/wallet/".concat(id, "/retoken"), {
            passphrase: passphrase
        });
    };
    /**
     * Import private key.
     * @param {Number} id
     * @param {String} account
     * @param {String} key
     * @returns {Promise}
     */
    WalletClient.prototype.importPrivate = function (id, account, privateKey, passphrase) {
        return this.post("/wallet/".concat(id, "/import"), {
            account: account,
            privateKey: privateKey,
            passphrase: passphrase
        });
    };
    /**
     * Import public key.
     * @param {Number} id
     * @param {Number|String} account
     * @param {String} publicKey
     * @returns {Promise}
     */
    WalletClient.prototype.importPublic = function (id, account, publicKey) {
        return this.post("/wallet/".concat(id, "/import"), {
            account: account,
            publicKey: publicKey
        });
    };
    /**
     * Import address.
     * @param {Number} id
     * @param {String} account
     * @param {String} address
     * @returns {Promise}
     */
    WalletClient.prototype.importAddress = function (id, account, address) {
        return this.post("/wallet/".concat(id, "/import"), { account: account, address: address });
    };
    /**
     * Lock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    WalletClient.prototype.lockCoin = function (id, hash, index) {
        return this.put("/wallet/".concat(id, "/locked/").concat(hash, "/").concat(index));
    };
    /**
     * Unlock a coin.
     * @param {Number} id
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    WalletClient.prototype.unlockCoin = function (id, hash, index) {
        return this.del("/wallet/".concat(id, "/locked/").concat(hash, "/").concat(index));
    };
    /**
     * Get locked coins.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.getLocked = function (id) {
        return this.get("/wallet/".concat(id, "/locked"));
    };
    /**
     * Lock wallet.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.lock = function (id) {
        return this.post("/wallet/".concat(id, "/lock"));
    };
    /**
     * Unlock wallet.
     * @param {Number} id
     * @param {String} passphrase
     * @param {Number} timeout
     * @returns {Promise}
     */
    WalletClient.prototype.unlock = function (id, passphrase, timeout) {
        return this.post("/wallet/".concat(id, "/unlock"), { passphrase: passphrase, timeout: timeout });
    };
    /**
     * Get wallet key.
     * @param {Number} id
     * @param {String} address
     * @returns {Promise}
     */
    WalletClient.prototype.getKey = function (id, address) {
        return this.get("/wallet/".concat(id, "/key/").concat(address));
    };
    /**
     * Get wallet key WIF dump.
     * @param {Number} id
     * @param {String} address
     * @param {String?} passphrase
     * @returns {Promise}
     */
    WalletClient.prototype.getWIF = function (id, address, passphrase) {
        return this.get("/wallet/".concat(id, "/wif/").concat(address), { passphrase: passphrase });
    };
    /**
     * Add a public account key to the wallet for multisig.
     * @param {Number} id
     * @param {String} account
     * @param {String} key - Account (bip44) key (base58).
     * @returns {Promise}
     */
    WalletClient.prototype.addSharedKey = function (id, account, accountKey) {
        return this.put("/wallet/".concat(id, "/shared-key"), { account: account, accountKey: accountKey });
    };
    /**
     * Remove a public account key to the wallet for multisig.
     * @param {Number} id
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    WalletClient.prototype.removeSharedKey = function (id, account, accountKey) {
        return this.del("/wallet/".concat(id, "/shared-key"), { account: account, accountKey: accountKey });
    };
    /**
     * Resend wallet transactions.
     * @param {Number} id
     * @returns {Promise}
     */
    WalletClient.prototype.resendWallet = function (id) {
        return this.post("/wallet/".concat(id, "/resend"));
    };
    return WalletClient;
}(Client));
/**
 * Wallet Instance
 * @extends {EventEmitter}
 */
var Wallet = /** @class */ (function (_super) {
    __extends(Wallet, _super);
    /**
     * Create a wallet client.
     * @param {Object?} options
     */
    function Wallet(parent, id, token) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.client = parent.clone();
        _this.client.token = token;
        _this.id = id;
        _this.token = token;
        return _this;
    }
    /**
     * Open wallet.
     * @returns {Promise}
     */
    Wallet.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.join(this.id, this.token)];
                    case 1:
                        _a.sent();
                        this.parent.wallets.set(this.id, this);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close wallet.
     * @returns {Promise}
     */
    Wallet.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parent.leave(this.id)];
                    case 1:
                        _a.sent();
                        this.parent.wallets["delete"](this.id);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get wallet transaction history.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.getHistory = function (account) {
        return this.client.getHistory(this.id, account);
    };
    /**
     * Get wallet coins.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.getCoins = function (account) {
        return this.client.getCoins(this.id, account);
    };
    /**
     * Get all unconfirmed transactions.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.getPending = function (account) {
        return this.client.getPending(this.id, account);
    };
    /**
     * Calculate wallet balance.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.getBalance = function (account) {
        return this.client.getBalance(this.id, account);
    };
    /**
     * Get last N wallet transactions.
     * @param {String} account
     * @param {Number} limit - Max number of transactions.
     * @returns {Promise}
     */
    Wallet.prototype.getLast = function (account, limit) {
        return this.client.getLast(this.id, account, limit);
    };
    /**
     * Get wallet transactions by timestamp range.
     * @param {String} account
     * @param {Object} options
     * @param {Number} options.start - Start time.
     * @param {Number} options.end - End time.
     * @param {Number?} options.limit - Max number of records.
     * @param {Boolean?} options.reverse - Reverse order.
     * @returns {Promise}
     */
    Wallet.prototype.getRange = function (account, options) {
        return this.client.getRange(this.id, account, options);
    };
    /**
     * Get transaction (only possible if the transaction
     * is available in the wallet history).
     * @param {Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype.getTX = function (hash) {
        return this.client.getTX(this.id, hash);
    };
    /**
     * Get wallet blocks.
     * @param {Number} height
     * @returns {Promise}
     */
    Wallet.prototype.getBlocks = function () {
        return this.client.getBlocks(this.id);
    };
    /**
     * Get wallet block.
     * @param {Number} height
     * @returns {Promise}
     */
    Wallet.prototype.getBlock = function (height) {
        return this.client.getBlock(this.id, height);
    };
    /**
     * Get unspent coin (only possible if the transaction
     * is available in the wallet history).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise}
     */
    Wallet.prototype.getCoin = function (hash, index) {
        return this.client.getCoin(this.id, hash, index);
    };
    /**
     * @param {String} account
     * @param {Number} age - Age delta.
     * @returns {Promise}
     */
    Wallet.prototype.zap = function (account, age) {
        return this.client.zap(this.id, account, age);
    };
    /**
     * Used to remove a pending transaction from the wallet.
     * That is likely the case if it has a policy or low fee
     * that prevents it from proper network propagation.
     * @param {Hash} hash
     * @returns {Promise}
     */
    Wallet.prototype.abandon = function (hash) {
        return this.client.abandon(this.id, hash);
    };
    /**
     * Create a transaction, fill.
     * @param {Object} options
     * @returns {Promise}
     */
    Wallet.prototype.createTX = function (options) {
        return this.client.createTX(this.id, options);
    };
    /**
     * Create a transaction, fill, sign, and broadcast.
     * @param {Object} options
     * @param {String} options.address
     * @param {SatoshiAmount} options.value
     * @returns {Promise}
     */
    Wallet.prototype.send = function (options) {
        return this.client.send(this.id, options);
    };
    /**
     * Sign a transaction.
     * @param {Object} options
     * @returns {Promise}
     */
    Wallet.prototype.sign = function (options) {
        return this.client.sign(this.id, options);
    };
    /**
     * Get the raw wallet JSON.
     * @returns {Promise}
     */
    Wallet.prototype.getInfo = function () {
        return this.client.getInfo(this.id);
    };
    /**
     * Get wallet accounts.
     * @returns {Promise} - Returns Array.
     */
    Wallet.prototype.getAccounts = function () {
        return this.client.getAccounts(this.id);
    };
    /**
     * Get wallet master key.
     * @returns {Promise}
     */
    Wallet.prototype.getMaster = function () {
        return this.client.getMaster(this.id);
    };
    /**
     * Get wallet account.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.getAccount = function (account) {
        return this.client.getAccount(this.id, account);
    };
    /**
     * Create account.
     * @param {String} name
     * @param {Object} options
     * @returns {Promise}
     */
    Wallet.prototype.createAccount = function (name, options) {
        return this.client.createAccount(this.id, name, options);
    };
    /**
     * Create address.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.createAddress = function (account) {
        return this.client.createAddress(this.id, account);
    };
    /**
     * Create change address.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.createChange = function (account) {
        return this.client.createChange(this.id, account);
    };
    /**
     * Create nested address.
     * @param {String} account
     * @returns {Promise}
     */
    Wallet.prototype.createNested = function (account) {
        return this.client.createNested(this.id, account);
    };
    /**
     * Change or set master key`s passphrase.
     * @param {String|Buffer} passphrase
     * @param {(String|Buffer)?} old
     * @returns {Promise}
     */
    Wallet.prototype.setPassphrase = function (passphrase, old) {
        return this.client.setPassphrase(this.id, passphrase, old);
    };
    /**
     * Generate a new token.
     * @param {(String|Buffer)?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.retoken = function (passphrase) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.retoken(this.id, passphrase)];
                    case 1:
                        result = _a.sent();
                        assert(result);
                        assert(typeof result.token === 'string');
                        this.token = result.token;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Import private key.
     * @param {Number|String} account
     * @param {String} privateKey
     * @param {String} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.importPrivate = function (account, privateKey, passphrase) {
        return this.client.importPrivate(this.id, account, privateKey, passphrase);
    };
    /**
     * Import public key.
     * @param {Number|String} account
     * @param {String} publicKey
     * @returns {Promise}
     */
    Wallet.prototype.importPublic = function (account, publicKey) {
        return this.client.importPublic(this.id, account, publicKey);
    };
    /**
     * Import address.
     * @param {Number|String} account
     * @param {String} address
     * @returns {Promise}
     */
    Wallet.prototype.importAddress = function (account, address) {
        return this.client.importAddress(this.id, account, address);
    };
    /**
     * Lock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    Wallet.prototype.lockCoin = function (hash, index) {
        return this.client.lockCoin(this.id, hash, index);
    };
    /**
     * Unlock a coin.
     * @param {String} hash
     * @param {Number} index
     * @returns {Promise}
     */
    Wallet.prototype.unlockCoin = function (hash, index) {
        return this.client.unlockCoin(this.id, hash, index);
    };
    /**
     * Get locked coins.
     * @returns {Promise}
     */
    Wallet.prototype.getLocked = function () {
        return this.client.getLocked(this.id);
    };
    /**
     * Lock wallet.
     * @returns {Promise}
     */
    Wallet.prototype.lock = function () {
        return this.client.lock(this.id);
    };
    /**
     * Unlock wallet.
     * @param {String} passphrase
     * @param {Number} timeout
     * @returns {Promise}
     */
    Wallet.prototype.unlock = function (passphrase, timeout) {
        return this.client.unlock(this.id, passphrase, timeout);
    };
    /**
     * Get wallet key.
     * @param {String} address
     * @returns {Promise}
     */
    Wallet.prototype.getKey = function (address) {
        return this.client.getKey(this.id, address);
    };
    /**
     * Get wallet key WIF dump.
     * @param {String} address
     * @param {String?} passphrase
     * @returns {Promise}
     */
    Wallet.prototype.getWIF = function (address, passphrase) {
        return this.client.getWIF(this.id, address, passphrase);
    };
    /**
     * Add a public account key to the wallet for multisig.
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    Wallet.prototype.addSharedKey = function (account, accountKey) {
        return this.client.addSharedKey(this.id, account, accountKey);
    };
    /**
     * Remove a public account key to the wallet for multisig.
     * @param {String} account
     * @param {String} accountKey - Account (bip44) key (base58).
     * @returns {Promise}
     */
    Wallet.prototype.removeSharedKey = function (account, accountKey) {
        return this.client.removeSharedKey(this.id, account, accountKey);
    };
    /**
     * Resend wallet transactions.
     * @returns {Promise}
     */
    Wallet.prototype.resend = function () {
        return this.client.resendWallet(this.id);
    };
    return Wallet;
}(EventEmitter));
/*
 * Expose
 */
module.exports = WalletClient;
