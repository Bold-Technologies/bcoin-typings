/*!
 * rpc.js - bitcoind-compatible json rpc for bcoin.
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
var format = require('util').format;
var bweb = require('bweb');
var Lock = require('bmutex').Lock;
var fs = require('bfile');
var Validator = require('bval');
var _a = require('buffer-map'), BufferMap = _a.BufferMap, BufferSet = _a.BufferSet;
var util = require('../utils/util');
var messageUtil = require('../utils/message');
var Amount = require('../btc/amount');
var Script = require('../script/script');
var Address = require('../primitives/address');
var KeyRing = require('../primitives/keyring');
var MerkleBlock = require('../primitives/merkleblock');
var MTX = require('../primitives/mtx');
var Outpoint = require('../primitives/outpoint');
var Output = require('../primitives/output');
var TX = require('../primitives/tx');
var consensus = require('../protocol/consensus');
var pkg = require('../pkg');
var common = require('./common');
var BlockMeta = require('./records').BlockMeta;
var RPCBase = bweb.RPC;
var RPCError = bweb.RPCError;
/*
 * Constants
 */
var errs = {
    // Standard JSON-RPC 2.0 errors
    INVALID_REQUEST: bweb.errors.INVALID_REQUEST,
    METHOD_NOT_FOUND: bweb.errors.METHOD_NOT_FOUND,
    INVALID_PARAMS: bweb.errors.INVALID_PARAMS,
    INTERNAL_ERROR: bweb.errors.INTERNAL_ERROR,
    PARSE_ERROR: bweb.errors.PARSE_ERROR,
    // General application defined errors
    MISC_ERROR: -1,
    FORBIDDEN_BY_SAFE_MODE: -2,
    TYPE_ERROR: -3,
    INVALID_ADDRESS_OR_KEY: -5,
    OUT_OF_MEMORY: -7,
    INVALID_PARAMETER: -8,
    DATABASE_ERROR: -20,
    DESERIALIZATION_ERROR: -22,
    VERIFY_ERROR: -25,
    VERIFY_REJECTED: -26,
    VERIFY_ALREADY_IN_CHAIN: -27,
    IN_WARMUP: -28,
    // Wallet errors
    WALLET_ERROR: -4,
    WALLET_INSUFFICIENT_FUNDS: -6,
    WALLET_INVALID_ACCOUNT_NAME: -11,
    WALLET_KEYPOOL_RAN_OUT: -12,
    WALLET_UNLOCK_NEEDED: -13,
    WALLET_PASSPHRASE_INCORRECT: -14,
    WALLET_WRONG_ENC_STATE: -15,
    WALLET_ENCRYPTION_FAILED: -16,
    WALLET_ALREADY_UNLOCKED: -17
};
/**
 * Wallet RPC
 * @alias module:wallet.RPC
 * @extends bweb.RPC
 */
var RPC = /** @class */ (function (_super) {
    __extends(RPC, _super);
    /**
     * Create an RPC.
     * @param {WalletDB} wdb
     */
    function RPC(node) {
        var _this = _super.call(this) || this;
        assert(node, 'RPC requires a WalletDB.');
        _this.wdb = node.wdb;
        _this.network = node.network;
        _this.logger = node.logger.context('wallet-rpc');
        _this.client = node.client;
        _this.locker = new Lock();
        _this.wallet = null;
        _this.init();
        return _this;
    }
    RPC.prototype.getCode = function (err) {
        switch (err.type) {
            case 'RPCError':
                return err.code;
            case 'ValidationError':
                return errs.TYPE_ERROR;
            case 'EncodingError':
                return errs.DESERIALIZATION_ERROR;
            case 'FundingError':
                return errs.WALLET_INSUFFICIENT_FUNDS;
            default:
                return errs.INTERNAL_ERROR;
        }
    };
    RPC.prototype.handleCall = function (cmd, query) {
        this.logger.debug('Handling RPC call: %s.', cmd.method);
    };
    RPC.prototype.init = function () {
        this.add('help', this.help);
        this.add('stop', this.stop);
        this.add('fundrawtransaction', this.fundRawTransaction);
        this.add('resendwallettransactions', this.resendWalletTransactions);
        this.add('abandontransaction', this.abandonTransaction);
        this.add('addmultisigaddress', this.addMultisigAddress);
        this.add('addwitnessaddress', this.addWitnessAddress);
        this.add('backupwallet', this.backupWallet);
        this.add('dumpprivkey', this.dumpPrivKey);
        this.add('dumpwallet', this.dumpWallet);
        this.add('encryptwallet', this.encryptWallet);
        this.add('getaddressinfo', this.getAddressInfo);
        this.add('getaccountaddress', this.getAccountAddress);
        this.add('getaccount', this.getAccount);
        this.add('getaddressesbyaccount', this.getAddressesByAccount);
        this.add('getbalance', this.getBalance);
        this.add('getnewaddress', this.getNewAddress);
        this.add('getrawchangeaddress', this.getRawChangeAddress);
        this.add('getreceivedbyaccount', this.getReceivedByAccount);
        this.add('getreceivedbyaddress', this.getReceivedByAddress);
        this.add('gettransaction', this.getTransaction);
        this.add('getunconfirmedbalance', this.getUnconfirmedBalance);
        this.add('getwalletinfo', this.getWalletInfo);
        this.add('importprivkey', this.importPrivKey);
        this.add('importwallet', this.importWallet);
        this.add('importaddress', this.importAddress);
        this.add('importprunedfunds', this.importPrunedFunds);
        this.add('importpubkey', this.importPubkey);
        this.add('keypoolrefill', this.keyPoolRefill);
        this.add('listaccounts', this.listAccounts);
        this.add('listaddressgroupings', this.listAddressGroupings);
        this.add('listlockunspent', this.listLockUnspent);
        this.add('listreceivedbyaccount', this.listReceivedByAccount);
        this.add('listreceivedbyaddress', this.listReceivedByAddress);
        this.add('listsinceblock', this.listSinceBlock);
        this.add('listtransactions', this.listTransactions);
        this.add('listunspent', this.listUnspent);
        this.add('lockunspent', this.lockUnspent);
        this.add('move', this.move);
        this.add('sendfrom', this.sendFrom);
        this.add('sendmany', this.sendMany);
        this.add('sendtoaddress', this.sendToAddress);
        this.add('setaccount', this.setAccount);
        this.add('settxfee', this.setTXFee);
        this.add('signmessage', this.signMessage);
        this.add('walletlock', this.walletLock);
        this.add('walletpassphrasechange', this.walletPassphraseChange);
        this.add('walletpassphrase', this.walletPassphrase);
        this.add('removeprunedfunds', this.removePrunedFunds);
        this.add('selectwallet', this.selectWallet);
        this.add('getmemoryinfo', this.getMemoryInfo);
        this.add('setloglevel', this.setLogLevel);
    };
    RPC.prototype.help = function (args, _help) {
        return __awaiter(this, void 0, void 0, function () {
            var json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (args.length === 0)
                            return [2 /*return*/, "Select a command:\n".concat(Object.keys(this.calls).join('\n'))];
                        json = {
                            method: args[0],
                            params: []
                        };
                        return [4 /*yield*/, this.execute(json, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.stop = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'stop');
                this.wdb.close();
                return [2 /*return*/, 'Stopping.'];
            });
        });
    };
    RPC.prototype.fundRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, data, options, tx, rate, change, valid_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'fundrawtransaction "hexstring" ( options )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        data = valid.buf(0);
                        options = valid.obj(1);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid hex string.');
                        tx = MTX.fromRaw(data);
                        if (tx.outputs.length === 0) {
                            throw new RPCError(errs.INVALID_PARAMETER, 'TX must have at least one output.');
                        }
                        rate = null;
                        change = null;
                        if (options) {
                            valid_1 = new Validator(options);
                            rate = valid_1.ufixed('feeRate', 8);
                            change = valid_1.str('changeAddress');
                            if (change)
                                change = parseAddress(change, this.network);
                        }
                        return [4 /*yield*/, wallet.fund(tx, {
                                rate: rate,
                                changeAddress: change
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                hex: tx.toRaw().toString('hex'),
                                changepos: tx.changeIndex,
                                fee: Amount.btc(tx.getFee(), true)
                            }];
                }
            });
        });
    };
    /*
     * Wallet
     */
    RPC.prototype.resendWalletTransactions = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, txs, hashes, _i, txs_1, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'resendwallettransactions');
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.resend()];
                    case 1:
                        txs = _a.sent();
                        hashes = [];
                        for (_i = 0, txs_1 = txs; _i < txs_1.length; _i++) {
                            tx = txs_1[_i];
                            hashes.push(tx.txid());
                        }
                        return [2 /*return*/, hashes];
                }
            });
        });
    };
    RPC.prototype.addMultisigAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Impossible to implement in bcoin (no address book).
                throw new Error('Not implemented.');
            });
        });
    };
    RPC.prototype.addWitnessAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Unlikely to be implemented.
                throw new Error('Not implemented.');
            });
        });
    };
    RPC.prototype.backupWallet = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, dest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = new Validator(args);
                        dest = valid.str(0);
                        if (help || args.length !== 1 || !dest)
                            throw new RPCError(errs.MISC_ERROR, 'backupwallet "destination"');
                        return [4 /*yield*/, this.wdb.backup(dest)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.dumpPrivKey = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, addr, hash, ring;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'dumpprivkey "bitcoinaddress"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        addr = valid.str(0, '');
                        hash = parseHash(addr, this.network);
                        return [4 /*yield*/, wallet.getPrivateKey(hash)];
                    case 1:
                        ring = _a.sent();
                        if (!ring)
                            throw new RPCError(errs.MISC_ERROR, 'Key not found.');
                        return [2 /*return*/, ring.toSecret(this.network)];
                }
            });
        });
    };
    RPC.prototype.dumpWallet = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, file, tip, time, out, hashes, _i, hashes_1, hash, ring, addr, fmt, str, dump;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'dumpwallet "filename"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        file = valid.str(0);
                        if (!file)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        return [4 /*yield*/, this.wdb.getTip()];
                    case 1:
                        tip = _a.sent();
                        time = util.date();
                        out = [
                            format('# Wallet Dump created by Bcoin %s', pkg.version),
                            format('# * Created on %s', time),
                            format('# * Best block at time of backup was %d (%s).', tip.height, util.revHex(tip.hash)),
                            format('# * File: %s', file),
                            ''
                        ];
                        return [4 /*yield*/, wallet.getAddressHashes()];
                    case 2:
                        hashes = _a.sent();
                        _i = 0, hashes_1 = hashes;
                        _a.label = 3;
                    case 3:
                        if (!(_i < hashes_1.length)) return [3 /*break*/, 6];
                        hash = hashes_1[_i];
                        return [4 /*yield*/, wallet.getPrivateKey(hash)];
                    case 4:
                        ring = _a.sent();
                        if (!ring)
                            return [3 /*break*/, 5];
                        addr = ring.getAddress('string', this.network);
                        fmt = '%s %s label= addr=%s';
                        if (ring.branch === 1)
                            fmt = '%s %s change=1 addr=%s';
                        str = format(fmt, ring.toSecret(this.network), time, addr);
                        out.push(str);
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        out.push('');
                        out.push('# End of dump');
                        out.push('');
                        dump = out.join('\n');
                        if (fs.unsupported)
                            return [2 /*return*/, dump];
                        return [4 /*yield*/, fs.writeFile(file, dump, 'utf8')];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.encryptWallet = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, passphrase, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wallet = this.wallet;
                        if (!wallet.master.encrypted && (help || args.length !== 1))
                            throw new RPCError(errs.MISC_ERROR, 'encryptwallet "passphrase"');
                        valid = new Validator(args);
                        passphrase = valid.str(0, '');
                        if (wallet.master.encrypted) {
                            throw new RPCError(errs.WALLET_WRONG_ENC_STATE, 'Already running with an encrypted wallet.');
                        }
                        if (passphrase.length < 1)
                            throw new RPCError(errs.MISC_ERROR, 'encryptwallet "passphrase"');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, wallet.encrypt(passphrase)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new RPCError(errs.WALLET_ENCRYPTION_FAILED, 'Encryption failed.');
                    case 4: return [2 /*return*/, 'wallet encrypted; we do not need to stop!'];
                }
            });
        });
    };
    RPC.prototype.getAccountAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'getaccountaddress "account"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0, '');
                        if (!name)
                            name = 'default';
                        return [4 /*yield*/, wallet.receiveAddress(name)];
                    case 1:
                        addr = _a.sent();
                        if (!addr)
                            return [2 /*return*/, ''];
                        return [2 /*return*/, addr.toString(this.network)];
                }
            });
        });
    };
    RPC.prototype.getAccount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, addr, hash, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'getaccount "bitcoinaddress"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        addr = valid.str(0, '');
                        hash = parseHash(addr, this.network);
                        return [4 /*yield*/, wallet.getPath(hash)];
                    case 1:
                        path = _a.sent();
                        if (!path)
                            return [2 /*return*/, ''];
                        return [2 /*return*/, path.name];
                }
            });
        });
    };
    RPC.prototype.getAddressesByAccount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, addrs, paths, e_2, _i, paths_1, path, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'getaddressesbyaccount "account"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0, '');
                        addrs = [];
                        if (name === '')
                            name = 'default';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, wallet.getPaths(name)];
                    case 2:
                        paths = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        if (e_2.message === 'Account not found.')
                            return [2 /*return*/, []];
                        throw e_2;
                    case 4:
                        for (_i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
                            path = paths_1[_i];
                            addr = path.toAddress();
                            addrs.push(addr.toString(this.network));
                        }
                        return [2 /*return*/, addrs];
                }
            });
        });
    };
    RPC.prototype.getAddressInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, addr, address, script, wallet, path, isScript, isWitness, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'getaddressinfo "address"');
                        valid = new Validator(args);
                        addr = valid.str(0, '');
                        address = parseAddress(addr, this.network);
                        script = Script.fromAddress(address);
                        wallet = this.wallet.toJSON();
                        return [4 /*yield*/, this.wallet.getPath(address)];
                    case 1:
                        path = _a.sent();
                        isScript = script.isScripthash() || script.isWitnessScripthash();
                        isWitness = address.isProgram();
                        result = {
                            address: address.toString(this.network),
                            scriptPubKey: script ? script.toJSON() : undefined,
                            ismine: path != null,
                            ischange: path ? path.branch === 1 : false,
                            iswatchonly: wallet.watchOnly,
                            isscript: isScript,
                            iswitness: isWitness
                        };
                        if (isWitness) {
                            result.witness_version = address.version;
                            result.witness_program = address.hash.toString('hex');
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    RPC.prototype.getBalance = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, minconf, watchOnly, balance, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'getbalance ( "account" minconf includeWatchonly )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        minconf = valid.u32(1, 1);
                        watchOnly = valid.bool(2, false);
                        if (name === '')
                            name = 'default';
                        if (name === '*')
                            name = null;
                        if (wallet.watchOnly !== watchOnly)
                            return [2 /*return*/, 0];
                        return [4 /*yield*/, wallet.getBalance(name)];
                    case 1:
                        balance = _a.sent();
                        if (minconf > 0)
                            value = balance.confirmed;
                        else
                            value = balance.unconfirmed;
                        return [2 /*return*/, Amount.btc(value, true)];
                }
            });
        });
    };
    RPC.prototype.getNewAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 1)
                            throw new RPCError(errs.MISC_ERROR, 'getnewaddress ( "account" )');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        if (name === '' || args.length === 0)
                            name = 'default';
                        return [4 /*yield*/, wallet.createReceive(name)];
                    case 1:
                        addr = _a.sent();
                        return [2 /*return*/, addr.getAddress('string', this.network)];
                }
            });
        });
    };
    RPC.prototype.getRawChangeAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'getrawchangeaddress');
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.createChange()];
                    case 1:
                        addr = _a.sent();
                        return [2 /*return*/, addr.getAddress('string', this.network)];
                }
            });
        });
    };
    RPC.prototype.getReceivedByAccount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, minconf, height, paths, filter, _i, paths_2, path, txs, total, lastConf, _a, txs_2, wtx, conf, _b, _c, output, hash;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'getreceivedbyaccount "account" ( minconf )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        minconf = valid.u32(1, 0);
                        height = this.wdb.state.height;
                        if (name === '')
                            name = 'default';
                        return [4 /*yield*/, wallet.getPaths(name)];
                    case 1:
                        paths = _d.sent();
                        filter = new BufferSet();
                        for (_i = 0, paths_2 = paths; _i < paths_2.length; _i++) {
                            path = paths_2[_i];
                            filter.add(path.hash);
                        }
                        return [4 /*yield*/, wallet.getHistory(name)];
                    case 2:
                        txs = _d.sent();
                        total = 0;
                        lastConf = -1;
                        for (_a = 0, txs_2 = txs; _a < txs_2.length; _a++) {
                            wtx = txs_2[_a];
                            conf = wtx.getDepth(height);
                            if (conf < minconf)
                                continue;
                            if (lastConf === -1 || conf < lastConf)
                                lastConf = conf;
                            for (_b = 0, _c = wtx.tx.outputs; _b < _c.length; _b++) {
                                output = _c[_b];
                                hash = output.getHash();
                                if (hash && filter.has(hash))
                                    total += output.value;
                            }
                        }
                        return [2 /*return*/, Amount.btc(total, true)];
                }
            });
        });
    };
    RPC.prototype.getReceivedByAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, addr, minconf, height, hash, txs, total, _i, txs_3, wtx, _a, _b, output, addr_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'getreceivedbyaddress "bitcoinaddress" ( minconf )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        addr = valid.str(0, '');
                        minconf = valid.u32(1, 0);
                        height = this.wdb.state.height;
                        hash = parseHash(addr, this.network);
                        return [4 /*yield*/, wallet.getHistory()];
                    case 1:
                        txs = _c.sent();
                        total = 0;
                        for (_i = 0, txs_3 = txs; _i < txs_3.length; _i++) {
                            wtx = txs_3[_i];
                            if (wtx.getDepth(height) < minconf)
                                continue;
                            for (_a = 0, _b = wtx.tx.outputs; _a < _b.length; _a++) {
                                output = _b[_a];
                                addr_1 = output.getAddress();
                                if (!addr_1)
                                    continue;
                                if (addr_1.getHash().equals(hash))
                                    total += output.value;
                            }
                        }
                        return [2 /*return*/, Amount.btc(total, true)];
                }
            });
        });
    };
    RPC.prototype._toWalletTX = function (wtx) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, details, receive, _i, _a, member, det, sent, received, i, member;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.toDetails(wtx)];
                    case 1:
                        details = _b.sent();
                        if (!details)
                            throw new RPCError(errs.WALLET_ERROR, 'TX not found.');
                        receive = true;
                        for (_i = 0, _a = details.inputs; _i < _a.length; _i++) {
                            member = _a[_i];
                            if (member.path) {
                                receive = false;
                                break;
                            }
                        }
                        det = [];
                        sent = 0;
                        received = 0;
                        for (i = 0; i < details.outputs.length; i++) {
                            member = details.outputs[i];
                            if (member.path) {
                                if (member.path.branch === 1)
                                    continue;
                                det.push({
                                    account: member.path.name,
                                    address: member.address.toString(this.network),
                                    category: 'receive',
                                    amount: Amount.btc(member.value, true),
                                    label: member.path.name,
                                    vout: i
                                });
                                received += member.value;
                                continue;
                            }
                            if (receive)
                                continue;
                            det.push({
                                account: '',
                                address: member.address
                                    ? member.address.toString(this.network)
                                    : null,
                                category: 'send',
                                amount: -(Amount.btc(member.value, true)),
                                fee: -(Amount.btc(details.fee, true)),
                                vout: i
                            });
                            sent += member.value;
                        }
                        return [2 /*return*/, {
                                amount: Amount.btc(receive ? received : -sent, true),
                                confirmations: details.confirmations,
                                blockhash: details.block ? util.revHex(details.block) : null,
                                blockindex: details.index,
                                blocktime: details.time,
                                txid: util.revHex(details.hash),
                                walletconflicts: [],
                                time: details.mtime,
                                timereceived: details.mtime,
                                'bip125-replaceable': 'no',
                                details: det,
                                hex: details.tx.toRaw().toString('hex')
                            }];
                }
            });
        });
    };
    RPC.prototype.getTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, hash, watchOnly, wtx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'gettransaction "txid" ( includeWatchonly )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        watchOnly = valid.bool(1, false);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter');
                        return [4 /*yield*/, wallet.getTX(hash)];
                    case 1:
                        wtx = _a.sent();
                        if (!wtx)
                            throw new RPCError(errs.WALLET_ERROR, 'TX not found.');
                        return [4 /*yield*/, this._toWalletTX(wtx, watchOnly)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.abandonTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, hash, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'abandontransaction "txid"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        return [4 /*yield*/, wallet.abandon(hash)];
                    case 1:
                        result = _a.sent();
                        if (!result)
                            throw new RPCError(errs.WALLET_ERROR, 'Transaction not in wallet.');
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.getUnconfirmedBalance = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 0)
                            throw new RPCError(errs.MISC_ERROR, 'getunconfirmedbalance');
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.getBalance()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, Amount.btc(balance.unconfirmed, true)];
                }
            });
        });
    };
    RPC.prototype.getWalletInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'getwalletinfo');
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.getBalance()];
                    case 1:
                        balance = _a.sent();
                        return [2 /*return*/, {
                                walletid: wallet.id,
                                walletversion: 6,
                                balance: Amount.btc(balance.unconfirmed, true),
                                unconfirmed_balance: Amount.btc(balance.unconfirmed, true),
                                txcount: balance.tx,
                                keypoololdest: 0,
                                keypoolsize: 0,
                                unlocked_until: wallet.master.until,
                                paytxfee: Amount.btc(this.wdb.feeRate, true)
                            }];
                }
            });
        });
    };
    RPC.prototype.importPrivKey = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, secret, rescan, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'importprivkey "bitcoinprivkey" ( "label" rescan )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        secret = valid.str(0);
                        rescan = valid.bool(2, false);
                        key = parseSecret(secret, this.network);
                        return [4 /*yield*/, wallet.importKey(0, key)];
                    case 1:
                        _a.sent();
                        if (!rescan) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.wdb.rescan(0)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.importWallet = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, file, rescan, data, e_3, lines, keys, _i, lines_1, line, parts, secret, _a, keys_1, key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'importwallet "filename" ( rescan )');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        file = valid.str(0);
                        rescan = valid.bool(1, false);
                        if (fs.unsupported)
                            throw new RPCError(errs.INTERNAL_ERROR, 'FS not available.');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.readFile(file, 'utf8')];
                    case 2:
                        data = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _b.sent();
                        throw new RPCError(errs.INTERNAL_ERROR, e_3.code || '');
                    case 4:
                        lines = data.split(/\n+/);
                        keys = [];
                        for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                            line = lines_1[_i];
                            line = line.trim();
                            if (line.length === 0)
                                continue;
                            if (/^\s*#/.test(line))
                                continue;
                            parts = line.split(/\s+/);
                            if (parts.length < 4)
                                throw new RPCError(errs.DESERIALIZATION_ERROR, 'Malformed wallet.');
                            secret = parseSecret(parts[0], this.network);
                            keys.push(secret);
                        }
                        _a = 0, keys_1 = keys;
                        _b.label = 5;
                    case 5:
                        if (!(_a < keys_1.length)) return [3 /*break*/, 8];
                        key = keys_1[_a];
                        return [4 /*yield*/, wallet.importKey(0, key)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        _a++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (!rescan) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.wdb.rescan(0)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.importAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, addr, rescan, p2sh, script, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 4) {
                            throw new RPCError(errs.MISC_ERROR, 'importaddress "address" ( "label" rescan p2sh )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        addr = valid.str(0, '');
                        rescan = valid.bool(2, false);
                        p2sh = valid.bool(3, false);
                        if (p2sh) {
                            script = valid.buf(0);
                            if (!script)
                                throw new RPCError(errs.TYPE_ERROR, 'Invalid parameters.');
                            script = Script.fromRaw(script);
                            script = Script.fromScripthash(script.hash160());
                            addr = script.getAddress();
                        }
                        else {
                            addr = parseAddress(addr, this.network);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, wallet.importAddress(0, addr)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        if (e_4.message !== 'Address already exists.')
                            throw e_4;
                        return [3 /*break*/, 4];
                    case 4:
                        if (!rescan) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.wdb.rescan(0)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.importPubkey = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, data, rescan, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'importpubkey "pubkey" ( "label" rescan )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        data = valid.buf(0);
                        rescan = valid.bool(2, false);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        key = KeyRing.fromPublic(data, this.network);
                        return [4 /*yield*/, wallet.importKey(0, key)];
                    case 1:
                        _a.sent();
                        if (!rescan) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.wdb.rescan(0)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.keyPoolRefill = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length > 1)
                    throw new RPCError(errs.MISC_ERROR, 'keypoolrefill ( newsize )');
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.listAccounts = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, minconf, watchOnly, accounts, map, _i, accounts_1, account, balance, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'listaccounts ( minconf includeWatchonly)');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        minconf = valid.u32(0, 0);
                        watchOnly = valid.bool(1, false);
                        return [4 /*yield*/, wallet.getAccounts()];
                    case 1:
                        accounts = _a.sent();
                        map = {};
                        _i = 0, accounts_1 = accounts;
                        _a.label = 2;
                    case 2:
                        if (!(_i < accounts_1.length)) return [3 /*break*/, 5];
                        account = accounts_1[_i];
                        return [4 /*yield*/, wallet.getBalance(account)];
                    case 3:
                        balance = _a.sent();
                        value = balance.unconfirmed;
                        if (minconf > 0)
                            value = balance.confirmed;
                        if (wallet.watchOnly !== watchOnly)
                            value = 0;
                        map[account] = Amount.btc(value, true);
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, map];
                }
            });
        });
    };
    RPC.prototype.listAddressGroupings = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Not implemented.');
            });
        });
    };
    RPC.prototype.listLockUnspent = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, outpoints, out, _i, outpoints_1, outpoint;
            return __generator(this, function (_a) {
                if (help || args.length > 0)
                    throw new RPCError(errs.MISC_ERROR, 'listlockunspent');
                wallet = this.wallet;
                outpoints = wallet.getLocked();
                out = [];
                for (_i = 0, outpoints_1 = outpoints; _i < outpoints_1.length; _i++) {
                    outpoint = outpoints_1[_i];
                    out.push({
                        txid: outpoint.txid(),
                        vout: outpoint.index
                    });
                }
                return [2 /*return*/, out];
            });
        });
    };
    RPC.prototype.listReceivedByAccount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, minconf, includeEmpty, watchOnly;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'listreceivedbyaccount ( minconf includeempty includeWatchonly )');
                        }
                        valid = new Validator(args);
                        minconf = valid.u32(0, 0);
                        includeEmpty = valid.bool(1, false);
                        watchOnly = valid.bool(2, false);
                        return [4 /*yield*/, this._listReceived(minconf, includeEmpty, watchOnly, true)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.listReceivedByAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, minconf, includeEmpty, watchOnly;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'listreceivedbyaddress ( minconf includeempty includeWatchonly )');
                        }
                        valid = new Validator(args);
                        minconf = valid.u32(0, 0);
                        includeEmpty = valid.bool(1, false);
                        watchOnly = valid.bool(2, false);
                        return [4 /*yield*/, this._listReceived(minconf, includeEmpty, watchOnly, false)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype._listReceived = function (minconf, empty, watchOnly, account) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, paths, height, map, _i, paths_3, path, addr, txs, _a, txs_4, wtx, conf, _b, _c, output, addr, hash, entry, out, _d, _e, entry, map_1, _f, out_1, entry, item, _g, _h, entry, result, _j, out_2, entry;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.getPaths()];
                    case 1:
                        paths = _k.sent();
                        height = this.wdb.state.height;
                        map = new BufferMap();
                        for (_i = 0, paths_3 = paths; _i < paths_3.length; _i++) {
                            path = paths_3[_i];
                            addr = path.toAddress();
                            map.set(path.hash, {
                                involvesWatchonly: wallet.watchOnly,
                                address: addr.toString(this.network),
                                account: path.name,
                                amount: 0,
                                confirmations: -1,
                                label: ''
                            });
                        }
                        return [4 /*yield*/, wallet.getHistory()];
                    case 2:
                        txs = _k.sent();
                        for (_a = 0, txs_4 = txs; _a < txs_4.length; _a++) {
                            wtx = txs_4[_a];
                            conf = wtx.getDepth(height);
                            if (conf < minconf)
                                continue;
                            for (_b = 0, _c = wtx.tx.outputs; _b < _c.length; _b++) {
                                output = _c[_b];
                                addr = output.getAddress();
                                if (!addr)
                                    continue;
                                hash = addr.getHash();
                                entry = map.get(hash);
                                if (entry) {
                                    if (entry.confirmations === -1 || conf < entry.confirmations)
                                        entry.confirmations = conf;
                                    entry.address = addr.toString(this.network);
                                    entry.amount += output.value;
                                }
                            }
                        }
                        out = [];
                        for (_d = 0, _e = map.values(); _d < _e.length; _d++) {
                            entry = _e[_d];
                            out.push(entry);
                        }
                        if (account) {
                            map_1 = new Map();
                            for (_f = 0, out_1 = out; _f < out_1.length; _f++) {
                                entry = out_1[_f];
                                item = map_1.get(entry.account);
                                if (!item) {
                                    map_1.set(entry.account, entry);
                                    entry.address = undefined;
                                    continue;
                                }
                                item.amount += entry.amount;
                            }
                            out = [];
                            for (_g = 0, _h = map_1.values(); _g < _h.length; _g++) {
                                entry = _h[_g];
                                out.push(entry);
                            }
                        }
                        result = [];
                        for (_j = 0, out_2 = out; _j < out_2.length; _j++) {
                            entry = out_2[_j];
                            if (!empty && entry.amount === 0)
                                continue;
                            if (entry.confirmations === -1)
                                entry.confirmations = 0;
                            entry.amount = Amount.btc(entry.amount, true);
                            result.push(entry);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    RPC.prototype.listSinceBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, chainHeight, valid, block, minconf, watchOnly, height, entry, txs, out, highest, _i, txs_5, wtx, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'listsinceblock ( "blockhash" target-confirmations includeWatchonly)');
                        }
                        wallet = this.wallet;
                        chainHeight = this.wdb.state.height;
                        valid = new Validator(args);
                        block = valid.brhash(0);
                        minconf = valid.u32(1, 0);
                        watchOnly = valid.bool(2, false);
                        if (wallet.watchOnly !== watchOnly)
                            return [2 /*return*/, []];
                        height = -1;
                        if (!block) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.getEntry(block)];
                    case 1:
                        entry = _a.sent();
                        if (entry)
                            height = entry.height;
                        else
                            throw new RPCError(errs.MISC_ERROR, 'Block not found.');
                        _a.label = 2;
                    case 2:
                        if (height === -1)
                            height = chainHeight;
                        return [4 /*yield*/, wallet.getHistory()];
                    case 3:
                        txs = _a.sent();
                        out = [];
                        highest = null;
                        _i = 0, txs_5 = txs;
                        _a.label = 4;
                    case 4:
                        if (!(_i < txs_5.length)) return [3 /*break*/, 7];
                        wtx = txs_5[_i];
                        if (wtx.height < height)
                            return [3 /*break*/, 6];
                        if (wtx.getDepth(chainHeight) < minconf)
                            return [3 /*break*/, 6];
                        if (!highest || wtx.height > highest)
                            highest = wtx;
                        return [4 /*yield*/, this._toListTX(wtx)];
                    case 5:
                        json = _a.sent();
                        out.push(json);
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, {
                            transactions: out,
                            lastblock: highest && highest.block
                                ? util.revHex(highest.block)
                                : util.revHex(consensus.ZERO_HASH)
                        }];
                }
            });
        });
    };
    RPC.prototype._toListTX = function (wtx) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, details, receive, _i, _a, member_1, sent, received, sendMember, recMember, sendIndex, recIndex, i, member_2, member, index, rbf;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wallet = this.wallet;
                        return [4 /*yield*/, wallet.toDetails(wtx)];
                    case 1:
                        details = _b.sent();
                        if (!details)
                            throw new RPCError(errs.WALLET_ERROR, 'TX not found.');
                        receive = true;
                        for (_i = 0, _a = details.inputs; _i < _a.length; _i++) {
                            member_1 = _a[_i];
                            if (member_1.path) {
                                receive = false;
                                break;
                            }
                        }
                        sent = 0;
                        received = 0;
                        sendMember = null;
                        recMember = null;
                        sendIndex = -1;
                        recIndex = -1;
                        for (i = 0; i < details.outputs.length; i++) {
                            member_2 = details.outputs[i];
                            if (member_2.path) {
                                if (member_2.path.branch === 1)
                                    continue;
                                received += member_2.value;
                                recMember = member_2;
                                recIndex = i;
                                continue;
                            }
                            sent += member_2.value;
                            sendMember = member_2;
                            sendIndex = i;
                        }
                        member = null;
                        index = -1;
                        if (receive) {
                            assert(recMember);
                            member = recMember;
                            index = recIndex;
                        }
                        else {
                            if (sendMember) {
                                member = sendMember;
                                index = sendIndex;
                            }
                            else {
                                // In the odd case where we send to ourselves.
                                receive = true;
                                received = 0;
                                member = recMember;
                                index = recIndex;
                            }
                        }
                        rbf = false;
                        if (wtx.height === -1 && wtx.tx.isRBF())
                            rbf = true;
                        return [2 /*return*/, {
                                account: member.path ? member.path.name : '',
                                address: member.address
                                    ? member.address.toString(this.network)
                                    : null,
                                category: receive ? 'receive' : 'send',
                                amount: Amount.btc(receive ? received : -sent, true),
                                label: member.path ? member.path.name : undefined,
                                vout: index,
                                confirmations: details.getDepth(this.wdb.height),
                                blockhash: details.block ? util.revHex(details.block) : null,
                                blockindex: -1,
                                blocktime: details.time,
                                blockheight: details.height,
                                txid: util.revHex(details.hash),
                                walletconflicts: [],
                                time: details.mtime,
                                timereceived: details.mtime,
                                'bip125-replaceable': rbf ? 'yes' : 'no'
                            }];
                }
            });
        });
    };
    RPC.prototype.listTransactions = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, count, from, watchOnly, txs, end, to, out, i, wtx, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 4) {
                            throw new RPCError(errs.MISC_ERROR, 'listtransactions ( "account" count from includeWatchonly)');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        count = valid.u32(1, 10);
                        from = valid.u32(2, 0);
                        watchOnly = valid.bool(3, false);
                        if (wallet.watchOnly !== watchOnly)
                            return [2 /*return*/, []];
                        if (name === '')
                            name = 'default';
                        return [4 /*yield*/, wallet.getHistory(name)];
                    case 1:
                        txs = _a.sent();
                        common.sortTX(txs);
                        end = from + count;
                        to = Math.min(end, txs.length);
                        out = [];
                        i = from;
                        _a.label = 2;
                    case 2:
                        if (!(i < to)) return [3 /*break*/, 5];
                        wtx = txs[i];
                        return [4 /*yield*/, this._toListTX(wtx)];
                    case 3:
                        json = _a.sent();
                        out.push(json);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, out];
                }
            });
        });
    };
    RPC.prototype.listUnspent = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, minDepth, maxDepth, addrs, height, map, valid_2, i, addr, hash, coins, out, _i, coins_1, coin, depth, addr, hash, ring;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'listunspent ( minconf maxconf  ["address",...] )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        minDepth = valid.u32(0, 1);
                        maxDepth = valid.u32(1, 9999999);
                        addrs = valid.array(2);
                        height = this.wdb.state.height;
                        map = new BufferSet();
                        if (addrs) {
                            valid_2 = new Validator(addrs);
                            for (i = 0; i < addrs.length; i++) {
                                addr = valid_2.str(i, '');
                                hash = parseHash(addr, this.network);
                                if (map.has(hash))
                                    throw new RPCError(errs.INVALID_PARAMETER, 'Duplicate address.');
                                map.add(hash);
                            }
                        }
                        return [4 /*yield*/, wallet.getCoins()];
                    case 1:
                        coins = _a.sent();
                        common.sortCoins(coins);
                        out = [];
                        _i = 0, coins_1 = coins;
                        _a.label = 2;
                    case 2:
                        if (!(_i < coins_1.length)) return [3 /*break*/, 5];
                        coin = coins_1[_i];
                        depth = coin.getDepth(height);
                        if (depth < minDepth || depth > maxDepth)
                            return [3 /*break*/, 4];
                        addr = coin.getAddress();
                        if (!addr)
                            return [3 /*break*/, 4];
                        hash = coin.getHash();
                        if (addrs) {
                            if (!hash || !map.has(hash))
                                return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, wallet.getKey(hash)];
                    case 3:
                        ring = _a.sent();
                        out.push({
                            txid: coin.txid(),
                            vout: coin.index,
                            address: addr ? addr.toString(this.network) : null,
                            account: ring ? ring.name : undefined,
                            redeemScript: ring && ring.script
                                ? ring.script.toJSON()
                                : undefined,
                            scriptPubKey: coin.script.toJSON(),
                            amount: Amount.btc(coin.value, true),
                            confirmations: depth,
                            spendable: !wallet.isLocked(coin),
                            solvable: true
                        });
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, out];
                }
            });
        });
    };
    RPC.prototype.lockUnspent = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, unlock, outputs, _i, outputs_1, output, valid_3, hash, index, outpoint;
            return __generator(this, function (_a) {
                if (help || args.length < 1 || args.length > 2) {
                    throw new RPCError(errs.MISC_ERROR, 'lockunspent unlock ([{"txid":"txid","vout":n},...])');
                }
                wallet = this.wallet;
                valid = new Validator(args);
                unlock = valid.bool(0, false);
                outputs = valid.array(1);
                if (args.length === 1) {
                    if (unlock)
                        wallet.unlockCoins();
                    return [2 /*return*/, true];
                }
                if (!outputs)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                for (_i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
                    output = outputs_1[_i];
                    valid_3 = new Validator(output);
                    hash = valid_3.brhash('txid');
                    index = valid_3.u32('vout');
                    if (hash == null || index == null)
                        throw new RPCError(errs.INVALID_PARAMETER, 'Invalid parameter.');
                    outpoint = new Outpoint(hash, index);
                    if (unlock) {
                        wallet.unlockCoin(outpoint);
                        continue;
                    }
                    wallet.lockCoin(outpoint);
                }
                return [2 /*return*/, true];
            });
        });
    };
    RPC.prototype.move = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Not implementing: stupid and deprecated.
                throw new Error('Not implemented.');
            });
        });
    };
    RPC.prototype.sendFrom = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, str, value, minconf, addr, options, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 3 || args.length > 6) {
                            throw new RPCError(errs.MISC_ERROR, 'sendfrom "fromaccount" "tobitcoinaddress"'
                                + ' amount ( minconf "comment" "comment-to" )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        str = valid.str(1);
                        value = valid.ufixed(2, 8);
                        minconf = valid.u32(3, 0);
                        addr = parseAddress(str, this.network);
                        if (!addr || value == null)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        if (name === '')
                            name = 'default';
                        options = {
                            account: name,
                            depth: minconf,
                            outputs: [{
                                    address: addr,
                                    value: value
                                }]
                        };
                        return [4 /*yield*/, wallet.send(options)];
                    case 1:
                        tx = _a.sent();
                        return [2 /*return*/, tx.txid()];
                }
            });
        });
    };
    RPC.prototype.sendMany = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, name, sendTo, minconf, subtract, to, uniq, outputs, _i, _a, key, value, addr, hash, output, options, tx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (help || args.length < 2 || args.length > 5) {
                            throw new RPCError(errs.MISC_ERROR, 'sendmany "fromaccount" {"address":amount,...}'
                                + ' ( minconf "comment" subtractfee )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        name = valid.str(0);
                        sendTo = valid.obj(1);
                        minconf = valid.u32(2, 1);
                        subtract = valid.bool(4, false);
                        if (name === '')
                            name = 'default';
                        if (!sendTo)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid send-to address.');
                        to = new Validator(sendTo);
                        uniq = new BufferSet();
                        outputs = [];
                        for (_i = 0, _a = Object.keys(sendTo); _i < _a.length; _i++) {
                            key = _a[_i];
                            value = to.ufixed(key, 8);
                            addr = parseAddress(key, this.network);
                            hash = addr.getHash();
                            if (value == null)
                                throw new RPCError(errs.INVALID_PARAMETER, 'Invalid amount.');
                            if (uniq.has(hash))
                                throw new RPCError(errs.INVALID_PARAMETER, 'Each send-to address must be unique.');
                            uniq.add(hash);
                            output = new Output();
                            output.value = value;
                            output.script.fromAddress(addr);
                            outputs.push(output);
                        }
                        options = {
                            outputs: outputs,
                            subtractFee: subtract,
                            account: name,
                            depth: minconf
                        };
                        return [4 /*yield*/, wallet.send(options)];
                    case 1:
                        tx = _b.sent();
                        return [2 /*return*/, tx.txid()];
                }
            });
        });
    };
    RPC.prototype.sendToAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, str, value, subtract, addr, options, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 2 || args.length > 5) {
                            throw new RPCError(errs.MISC_ERROR, 'sendtoaddress "bitcoinaddress" amount'
                                + ' ( "comment" "comment-to" subtractfeefromamount )');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        str = valid.str(0);
                        value = valid.ufixed(1, 8);
                        subtract = valid.bool(4, false);
                        addr = parseAddress(str, this.network);
                        if (!addr || value == null)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        options = {
                            subtractFee: subtract,
                            outputs: [{
                                    address: addr,
                                    value: value
                                }]
                        };
                        return [4 /*yield*/, wallet.send(options)];
                    case 1:
                        tx = _a.sent();
                        return [2 /*return*/, tx.txid()];
                }
            });
        });
    };
    RPC.prototype.setAccount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Impossible to implement in bcoin:
                throw new Error('Not implemented.');
            });
        });
    };
    RPC.prototype.setTXFee = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, rate;
            return __generator(this, function (_a) {
                valid = new Validator(args);
                rate = valid.ufixed(0, 8);
                if (help || args.length < 1 || args.length > 1)
                    throw new RPCError(errs.MISC_ERROR, 'settxfee amount');
                if (rate == null)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                this.wdb.feeRate = rate;
                return [2 /*return*/, true];
            });
        });
    };
    RPC.prototype.signMessage = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, b58, str, addr, ring, sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 2) {
                            throw new RPCError(errs.MISC_ERROR, 'signmessage "bitcoinaddress" "message"');
                        }
                        wallet = this.wallet;
                        valid = new Validator(args);
                        b58 = valid.str(0, '');
                        str = valid.str(1, '');
                        addr = parseHash(b58, this.network);
                        return [4 /*yield*/, wallet.getKey(addr)];
                    case 1:
                        ring = _a.sent();
                        if (!ring)
                            throw new RPCError(errs.WALLET_ERROR, 'Address not found.');
                        if (!wallet.master.key)
                            throw new RPCError(errs.WALLET_UNLOCK_NEEDED, 'Wallet is locked.');
                        sig = messageUtil.sign(str, ring);
                        return [2 /*return*/, sig.toString('base64')];
                }
            });
        });
    };
    RPC.prototype.walletLock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wallet = this.wallet;
                        if (help || (wallet.master.encrypted && args.length !== 0))
                            throw new RPCError(errs.MISC_ERROR, 'walletlock');
                        if (!wallet.master.encrypted) {
                            throw new RPCError(errs.WALLET_WRONG_ENC_STATE, 'Wallet is not encrypted.');
                        }
                        return [4 /*yield*/, wallet.lock()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.walletPassphraseChange = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, old, passphrase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wallet = this.wallet;
                        if (help || (wallet.master.encrypted && args.length !== 2)) {
                            throw new RPCError(errs.MISC_ERROR, 'walletpassphrasechange'
                                + ' "oldpassphrase" "newpassphrase"');
                        }
                        valid = new Validator(args);
                        old = valid.str(0, '');
                        passphrase = valid.str(1, '');
                        if (!wallet.master.encrypted) {
                            throw new RPCError(errs.WALLET_WRONG_ENC_STATE, 'Wallet is not encrypted.');
                        }
                        if (old.length < 1 || passphrase.length < 1)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid parameter');
                        return [4 /*yield*/, wallet.setPassphrase(passphrase, old)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.walletPassphrase = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, passphrase, timeout;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        wallet = this.wallet;
                        valid = new Validator(args);
                        passphrase = valid.str(0, '');
                        timeout = valid.u32(1);
                        if (help || (wallet.master.encrypted && args.length !== 2)) {
                            throw new RPCError(errs.MISC_ERROR, 'walletpassphrase "passphrase" timeout');
                        }
                        if (!wallet.master.encrypted) {
                            throw new RPCError(errs.WALLET_WRONG_ENC_STATE, 'Wallet is not encrypted.');
                        }
                        if (passphrase.length < 1)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid parameter');
                        if (timeout == null)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter');
                        return [4 /*yield*/, wallet.unlock(passphrase, timeout)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.importPrunedFunds = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, txRaw, blockRaw, tx, block, hash, entry, meta;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 2) {
                            throw new RPCError(errs.MISC_ERROR, 'importprunedfunds "rawtransaction" "txoutproof"');
                        }
                        valid = new Validator(args);
                        txRaw = valid.buf(0);
                        blockRaw = valid.buf(1);
                        if (!txRaw || !blockRaw)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        tx = TX.fromRaw(txRaw);
                        block = MerkleBlock.fromRaw(blockRaw);
                        hash = block.hash();
                        if (!block.verify())
                            throw new RPCError(errs.VERIFY_ERROR, 'Invalid proof.');
                        if (!block.hasTX(tx.hash()))
                            throw new RPCError(errs.VERIFY_ERROR, 'Invalid proof.');
                        return [4 /*yield*/, this.client.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new RPCError(errs.VERIFY_ERROR, 'Invalid proof.');
                        meta = BlockMeta.fromEntry(entry);
                        return [4 /*yield*/, this.wdb.addTX(tx, meta)];
                    case 2:
                        if (!(_a.sent()))
                            throw new RPCError(errs.WALLET_ERROR, 'Address for TX not in wallet, or TX already in wallet');
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.removePrunedFunds = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var wallet, valid, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'removeprunedfunds "txid"');
                        wallet = this.wallet;
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid parameter.');
                        return [4 /*yield*/, wallet.remove(hash)];
                    case 1:
                        if (!(_a.sent()))
                            throw new RPCError(errs.WALLET_ERROR, 'Transaction not in wallet.');
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.selectWallet = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, id, wallet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valid = new Validator(args);
                        id = valid.str(0);
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'selectwallet "id"');
                        return [4 /*yield*/, this.wdb.get(id)];
                    case 1:
                        wallet = _a.sent();
                        if (!wallet)
                            throw new RPCError(errs.WALLET_ERROR, 'Wallet not found.');
                        this.wallet = wallet;
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.getMemoryInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getmemoryinfo');
                return [2 /*return*/, this.logger.memoryUsage()];
            });
        });
    };
    RPC.prototype.setLogLevel = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, level;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'setloglevel "level"');
                valid = new Validator(args);
                level = valid.str(0, '');
                this.logger.setLevel(level);
                return [2 /*return*/, null];
            });
        });
    };
    return RPC;
}(RPCBase));
/*
 * Helpers
 */
function parseHash(raw, network) {
    var addr = parseAddress(raw, network);
    return addr.getHash();
}
function parseAddress(raw, network) {
    try {
        return Address.fromString(raw, network);
    }
    catch (e) {
        throw new RPCError(errs.INVALID_ADDRESS_OR_KEY, 'Invalid address.');
    }
}
function parseSecret(raw, network) {
    try {
        return KeyRing.fromSecret(raw, network);
    }
    catch (e) {
        throw new RPCError(errs.INVALID_ADDRESS_OR_KEY, 'Invalid key.');
    }
}
/*
 * Expose
 */
module.exports = RPC;
