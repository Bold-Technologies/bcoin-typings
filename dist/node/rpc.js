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
var bweb = require('bweb');
var Lock = require('bmutex').Lock;
var IP = require('binet');
var Validator = require('bval');
var _a = require('buffer-map'), BufferMap = _a.BufferMap, BufferSet = _a.BufferSet;
var hash160 = require('bcrypto/lib/hash160');
var safeEqual = require('bcrypto/lib/safe').safeEqual;
var secp256k1 = require('bcrypto/lib/secp256k1');
var util = require('../utils/util');
var messageUtil = require('../utils/message');
var common = require('../blockchain/common');
var Amount = require('../btc/amount');
var NetAddress = require('../net/netaddress');
var Script = require('../script/script');
var Address = require('../primitives/address');
var Block = require('../primitives/block');
var Headers = require('../primitives/headers');
var Input = require('../primitives/input');
var KeyRing = require('../primitives/keyring');
var MerkleBlock = require('../primitives/merkleblock');
var MTX = require('../primitives/mtx');
var Network = require('../protocol/network');
var Outpoint = require('../primitives/outpoint');
var Output = require('../primitives/output');
var TX = require('../primitives/tx');
var consensus = require('../protocol/consensus');
var pkg = require('../pkg');
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
    // P2P client errors
    CLIENT_NOT_CONNECTED: -9,
    CLIENT_IN_INITIAL_DOWNLOAD: -10,
    CLIENT_NODE_ALREADY_ADDED: -23,
    CLIENT_NODE_NOT_ADDED: -24,
    CLIENT_NODE_NOT_CONNECTED: -29,
    CLIENT_INVALID_IP_OR_SUBNET: -30,
    CLIENT_P2P_DISABLED: -31
};
/**
 * Bitcoin RPC
 * @alias module:http.RPC
 * @extends bweb.RPC
 */
var RPC = /** @class */ (function (_super) {
    __extends(RPC, _super);
    /**
     * Create RPC.
     * @param {Node} node
     */
    function RPC(node) {
        var _this = _super.call(this) || this;
        assert(node, 'RPC requires a Node.');
        _this.node = node;
        _this.network = node.network;
        _this.workers = node.workers;
        _this.chain = node.chain;
        _this.mempool = node.mempool;
        _this.pool = node.pool;
        _this.fees = node.fees;
        _this.miner = node.miner;
        _this.logger = node.logger.context('node-rpc');
        _this.locker = new Lock();
        _this.mining = false;
        _this.procLimit = 0;
        _this.attempt = null;
        _this.lastActivity = 0;
        _this.boundChain = false;
        _this.nonce1 = 0;
        _this.nonce2 = 0;
        _this.merkleMap = new BufferMap();
        _this.pollers = [];
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
            default:
                return errs.INTERNAL_ERROR;
        }
    };
    RPC.prototype.handleCall = function (cmd, query) {
        if (cmd.method !== 'getwork'
            && cmd.method !== 'getblocktemplate'
            && cmd.method !== 'getbestblockhash') {
            this.logger.debug('Handling RPC call: %s.', cmd.method);
            if (cmd.method !== 'submitblock'
                && cmd.method !== 'getmemorypool') {
                this.logger.debug(cmd.params);
            }
        }
        if (cmd.method === 'getwork') {
            if (query.longpoll)
                cmd.method = 'getworklp';
        }
    };
    RPC.prototype.init = function () {
        this.add('stop', this.stop);
        this.add('help', this.help);
        this.add('getblockchaininfo', this.getBlockchainInfo);
        this.add('getbestblockhash', this.getBestBlockHash);
        this.add('getblockcount', this.getBlockCount);
        this.add('getblock', this.getBlock);
        this.add('getblockbyheight', this.getBlockByHeight);
        this.add('getblockhash', this.getBlockHash);
        this.add('getblockheader', this.getBlockHeader);
        this.add('getblockfilter', this.getBlockFilter);
        this.add('getchaintips', this.getChainTips);
        this.add('getdifficulty', this.getDifficulty);
        this.add('getmempoolancestors', this.getMempoolAncestors);
        this.add('getmempooldescendants', this.getMempoolDescendants);
        this.add('getmempoolentry', this.getMempoolEntry);
        this.add('getmempoolinfo', this.getMempoolInfo);
        this.add('getrawmempool', this.getRawMempool);
        this.add('gettxout', this.getTXOut);
        this.add('gettxoutsetinfo', this.getTXOutSetInfo);
        this.add('pruneblockchain', this.pruneBlockchain);
        this.add('verifychain', this.verifyChain);
        this.add('invalidateblock', this.invalidateBlock);
        this.add('reconsiderblock', this.reconsiderBlock);
        this.add('getnetworkhashps', this.getNetworkHashPS);
        this.add('getmininginfo', this.getMiningInfo);
        this.add('prioritisetransaction', this.prioritiseTransaction);
        this.add('getwork', this.getWork);
        this.add('getworklp', this.getWorkLongpoll);
        this.add('getblocktemplate', this.getBlockTemplate);
        this.add('submitblock', this.submitBlock);
        this.add('verifyblock', this.verifyBlock);
        this.add('setgenerate', this.setGenerate);
        this.add('getgenerate', this.getGenerate);
        this.add('generate', this.generate);
        this.add('generatetoaddress', this.generateToAddress);
        this.add('estimatefee', this.estimateFee);
        this.add('estimatepriority', this.estimatePriority);
        this.add('estimatesmartfee', this.estimateSmartFee);
        this.add('estimatesmartpriority', this.estimateSmartPriority);
        this.add('getinfo', this.getInfo);
        this.add('validateaddress', this.validateAddress);
        this.add('createmultisig', this.createMultisig);
        this.add('createwitnessaddress', this.createWitnessAddress);
        this.add('verifymessage', this.verifyMessage);
        this.add('signmessagewithprivkey', this.signMessageWithPrivkey);
        this.add('setmocktime', this.setMockTime);
        this.add('getconnectioncount', this.getConnectionCount);
        this.add('ping', this.ping);
        this.add('getpeerinfo', this.getPeerInfo);
        this.add('addnode', this.addNode);
        this.add('disconnectnode', this.disconnectNode);
        this.add('getaddednodeinfo', this.getAddedNodeInfo);
        this.add('getnettotals', this.getNetTotals);
        this.add('getnetworkinfo', this.getNetworkInfo);
        this.add('setban', this.setBan);
        this.add('listbanned', this.listBanned);
        this.add('clearbanned', this.clearBanned);
        this.add('getnodeaddresses', this.getNodeAddresses);
        this.add('getrawtransaction', this.getRawTransaction);
        this.add('createrawtransaction', this.createRawTransaction);
        this.add('decoderawtransaction', this.decodeRawTransaction);
        this.add('decodescript', this.decodeScript);
        this.add('sendrawtransaction', this.sendRawTransaction);
        this.add('signrawtransaction', this.signRawTransaction);
        this.add('gettxoutproof', this.getTXOutProof);
        this.add('verifytxoutproof', this.verifyTXOutProof);
        this.add('getmemoryinfo', this.getMemoryInfo);
        this.add('setloglevel', this.setLogLevel);
    };
    /*
     * Overall control/query calls
     */
    RPC.prototype.getInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getinfo');
                return [2 /*return*/, {
                        version: pkg.version,
                        protocolversion: this.pool.options.version,
                        walletversion: 0,
                        balance: 0,
                        blocks: this.chain.height,
                        timeoffset: this.network.time.offset,
                        connections: this.pool.peers.size(),
                        proxy: '',
                        difficulty: toDifficulty(this.chain.tip.bits),
                        testnet: this.network !== Network.main,
                        keypoololdest: 0,
                        keypoolsize: 0,
                        unlocked_until: 0,
                        paytxfee: Amount.btc(this.network.feeRate, true),
                        relayfee: Amount.btc(this.network.minRelay, true),
                        errors: ''
                    }];
            });
        });
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
                this.node.close()["catch"](function (err) {
                    setImmediate(function () {
                        throw err;
                    });
                });
                return [2 /*return*/, 'Stopping.'];
            });
        });
    };
    /*
     * P2P networking
     */
    RPC.prototype.getNetworkInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var hosts, locals, _i, _a, local;
            return __generator(this, function (_b) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getnetworkinfo');
                hosts = this.pool.hosts;
                locals = [];
                for (_i = 0, _a = hosts.local.values(); _i < _a.length; _i++) {
                    local = _a[_i];
                    locals.push({
                        address: local.addr.host,
                        port: local.addr.port,
                        score: local.score
                    });
                }
                return [2 /*return*/, {
                        version: pkg.version,
                        subversion: this.pool.options.agent,
                        protocolversion: this.pool.options.version,
                        localservices: hex32(this.pool.options.services),
                        localservicenames: this.pool.getServiceNames(),
                        localrelay: !this.pool.options.noRelay,
                        timeoffset: this.network.time.offset,
                        networkactive: this.pool.connected,
                        connections: this.pool.peers.size(),
                        networks: [],
                        relayfee: Amount.btc(this.network.minRelay, true),
                        incrementalfee: 0,
                        localaddresses: locals,
                        warnings: ''
                    }];
            });
        });
    };
    RPC.prototype.addNode = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, node, cmd, addr, peer;
            return __generator(this, function (_a) {
                if (help || args.length !== 2)
                    throw new RPCError(errs.MISC_ERROR, 'addnode "node" "add|remove|onetry"');
                valid = new Validator(args);
                node = valid.str(0, '');
                cmd = valid.str(1, '');
                switch (cmd) {
                    case 'add': {
                        this.pool.hosts.addNode(node);
                        ; // fall through
                    }
                    case 'onetry': {
                        addr = parseNetAddress(node, this.network);
                        if (!this.pool.peers.get(addr.hostname)) {
                            peer = this.pool.createOutbound(addr);
                            this.pool.peers.add(peer);
                        }
                        break;
                    }
                    case 'remove': {
                        this.pool.hosts.removeNode(node);
                        break;
                    }
                }
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.disconnectNode = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, str, addr, peer;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'disconnectnode "node"');
                valid = new Validator(args);
                str = valid.str(0, '');
                addr = parseIP(str, this.network);
                peer = this.pool.peers.get(addr.hostname);
                if (peer)
                    peer.destroy();
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.getAddedNodeInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var hosts, valid, addr, target, result, _i, _a, node, peer;
            return __generator(this, function (_b) {
                if (help || args.length > 1)
                    throw new RPCError(errs.MISC_ERROR, 'getaddednodeinfo ( "node" )');
                hosts = this.pool.hosts;
                valid = new Validator(args);
                addr = valid.str(0, '');
                if (args.length === 1)
                    target = parseIP(addr, this.network);
                result = [];
                for (_i = 0, _a = hosts.nodes; _i < _a.length; _i++) {
                    node = _a[_i];
                    if (target) {
                        if (node.host !== target.host)
                            continue;
                        if (node.port !== target.port)
                            continue;
                    }
                    peer = this.pool.peers.get(node.hostname);
                    if (!peer || !peer.connected) {
                        result.push({
                            addednode: node.hostname,
                            connected: false,
                            addresses: []
                        });
                        continue;
                    }
                    result.push({
                        addednode: node.hostname,
                        connected: peer.connected,
                        addresses: [
                            {
                                address: peer.hostname(),
                                connected: peer.outbound
                                    ? 'outbound'
                                    : 'inbound'
                            }
                        ]
                    });
                }
                if (target && result.length === 0) {
                    throw new RPCError(errs.CLIENT_NODE_NOT_ADDED, 'Node has not been added.');
                }
                return [2 /*return*/, result];
            });
        });
    };
    RPC.prototype.getConnectionCount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getconnectioncount');
                return [2 /*return*/, this.pool.peers.size()];
            });
        });
    };
    RPC.prototype.getNetTotals = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var sent, recv, peer;
            return __generator(this, function (_a) {
                sent = 0;
                recv = 0;
                if (help || args.length > 0)
                    throw new RPCError(errs.MISC_ERROR, 'getnettotals');
                for (peer = this.pool.peers.head(); peer; peer = peer.next) {
                    sent += peer.socket.bytesWritten;
                    recv += peer.socket.bytesRead;
                }
                return [2 /*return*/, {
                        totalbytesrecv: recv,
                        totalbytessent: sent,
                        timemillis: Date.now()
                    }];
            });
        });
    };
    RPC.prototype.getPeerInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var peers, peer, offset, hashes, hash, str;
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getpeerinfo');
                peers = [];
                for (peer = this.pool.peers.head(); peer; peer = peer.next) {
                    offset = this.network.time.known.get(peer.hostname()) || 0;
                    hashes = [];
                    for (hash in peer.blockMap.keys()) {
                        str = util.revHex(hash);
                        hashes.push(str);
                    }
                    peer.getName();
                    peers.push({
                        id: peer.id,
                        addr: peer.hostname(),
                        addrlocal: !peer.local.isNull()
                            ? peer.local.hostname
                            : undefined,
                        name: peer.name || undefined,
                        services: hex32(peer.services),
                        servicenames: peer.getServiceNames(),
                        relaytxes: !peer.noRelay,
                        lastsend: peer.lastSend / 1000 | 0,
                        lastrecv: peer.lastRecv / 1000 | 0,
                        bytessent: peer.socket.bytesWritten,
                        bytesrecv: peer.socket.bytesRead,
                        conntime: peer.time !== 0 ? (Date.now() - peer.time) / 1000 | 0 : 0,
                        timeoffset: offset,
                        pingtime: peer.lastPong !== -1
                            ? (peer.lastPong - peer.lastPing) / 1000
                            : -1,
                        minping: peer.minPing !== -1 ? peer.minPing / 1000 : -1,
                        version: peer.version,
                        subver: peer.agent,
                        inbound: !peer.outbound,
                        startingheight: peer.height,
                        besthash: peer.bestHash ? util.revHex(peer.bestHash) : null,
                        bestheight: peer.bestHeight,
                        banscore: peer.banScore,
                        inflight: hashes,
                        whitelisted: false
                    });
                }
                return [2 /*return*/, peers];
            });
        });
    };
    RPC.prototype.ping = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var peer;
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'ping');
                for (peer = this.pool.peers.head(); peer; peer = peer.next)
                    peer.sendPing();
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.setBan = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, str, action, addr;
            return __generator(this, function (_a) {
                valid = new Validator(args);
                str = valid.str(0, '');
                action = valid.str(1, '');
                if (help
                    || args.length < 2
                    || (action !== 'add' && action !== 'remove')) {
                    throw new RPCError(errs.MISC_ERROR, 'setban "ip(/netmask)" "add|remove" (bantime) (absolute)');
                }
                addr = parseNetAddress(str, this.network);
                switch (action) {
                    case 'add':
                        this.pool.ban(addr);
                        break;
                    case 'remove':
                        this.pool.unban(addr);
                        break;
                }
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.listBanned = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var banned, _i, _a, _b, host, time;
            return __generator(this, function (_c) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'listbanned');
                banned = [];
                for (_i = 0, _a = this.pool.hosts.banned; _i < _a.length; _i++) {
                    _b = _a[_i], host = _b[0], time = _b[1];
                    banned.push({
                        address: host,
                        banned_until: time + this.pool.options.banTime,
                        ban_created: time,
                        ban_reason: ''
                    });
                }
                return [2 /*return*/, banned];
            });
        });
    };
    RPC.prototype.clearBanned = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'clearbanned');
                this.pool.hosts.clearBanned();
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.getNodeAddresses = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, count, hosts, maxHost;
            return __generator(this, function (_a) {
                if (help || args.length > 1)
                    throw new RPCError(errs.MISC_ERROR, 'getnodeaddresses (count)');
                valid = new Validator(args);
                count = valid.u32(0, 1);
                hosts = [];
                maxHost = this.pool.hosts.size();
                if (count !== 0)
                    count = Math.min(count, maxHost);
                else
                    count = maxHost;
                while (count--) {
                    hosts.push(this.pool.getHost());
                }
                return [2 /*return*/, hosts];
            });
        });
    };
    /* Block chain and UTXO */
    RPC.prototype.getBlockchainInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'getblockchaininfo');
                        _a = {
                            chain: this.network.type !== 'testnet'
                                ? this.network.type
                                : 'test',
                            blocks: this.chain.height,
                            headers: this.chain.height,
                            bestblockhash: this.chain.tip.rhash(),
                            difficulty: toDifficulty(this.chain.tip.bits)
                        };
                        return [4 /*yield*/, this.chain.getMedianTime(this.chain.tip)];
                    case 1:
                        _a.mediantime = _b.sent(),
                            _a.verificationprogress = this.chain.getProgress(),
                            _a.chainwork = this.chain.tip.chainwork.toString('hex', 64),
                            _a.pruned = this.chain.options.prune,
                            _a.softforks = this.getSoftforks();
                        return [4 /*yield*/, this.getBIP9Softforks()];
                    case 2: return [2 /*return*/, (_a.bip9_softforks = _b.sent(),
                            _a.pruneheight = this.chain.options.prune
                                ? Math.max(0, this.chain.height - this.network.block.keepBlocks)
                                : null,
                            _a)];
                }
            });
        });
    };
    RPC.prototype.getBestBlockHash = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getbestblockhash');
                return [2 /*return*/, this.chain.tip.rhash()];
            });
        });
    };
    RPC.prototype.getBlockCount = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getblockcount');
                return [2 /*return*/, this.chain.tip.height];
            });
        });
    };
    RPC.prototype.getBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, verbose, details, entry, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 3)
                            throw new RPCError(errs.MISC_ERROR, 'getblock "hash" ( verbose )');
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        verbose = valid.bool(1, true);
                        details = valid.bool(2, false);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid block hash.');
                        return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new RPCError(errs.MISC_ERROR, 'Block not found.');
                        return [4 /*yield*/, this.chain.getBlock(entry.hash)];
                    case 2:
                        block = _a.sent();
                        if (!block) {
                            if (this.chain.options.spv)
                                throw new RPCError(errs.MISC_ERROR, 'Block not available (spv mode)');
                            if (this.chain.options.prune) {
                                throw new RPCError(errs.MISC_ERROR, 'Block not available (pruned data)');
                            }
                            throw new RPCError(errs.MISC_ERROR, 'Can\'t read block from disk');
                        }
                        if (!verbose)
                            return [2 /*return*/, block.toRaw().toString('hex')];
                        return [4 /*yield*/, this.blockToJSON(entry, block, details)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.getBlockByHeight = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, height, verbose, details, entry, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'getblockbyheight "height" ( verbose )');
                        }
                        valid = new Validator(args);
                        height = valid.u32(0, -1);
                        verbose = valid.bool(1, true);
                        details = valid.bool(2, false);
                        if (height === -1)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid block height.');
                        return [4 /*yield*/, this.chain.getEntry(height)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new RPCError(errs.MISC_ERROR, 'Block not found.');
                        return [4 /*yield*/, this.chain.getBlock(entry.hash)];
                    case 2:
                        block = _a.sent();
                        if (!block) {
                            if (this.chain.options.spv)
                                throw new RPCError(errs.MISC_ERROR, 'Block not available (spv mode)');
                            if (this.chain.options.prune) {
                                throw new RPCError(errs.MISC_ERROR, 'Block not available (pruned data)');
                            }
                            throw new RPCError(errs.DATABASE_ERROR, 'Can\'t read block from disk');
                        }
                        if (!verbose)
                            return [2 /*return*/, block.toRaw().toString('hex')];
                        return [4 /*yield*/, this.blockToJSON(entry, block, details)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.getBlockHash = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, height, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'getblockhash index');
                        valid = new Validator(args);
                        height = valid.u32(0);
                        if (height == null || height > this.chain.height)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Block height out of range.');
                        return [4 /*yield*/, this.chain.getHash(height)];
                    case 1:
                        hash = _a.sent();
                        if (!hash)
                            throw new RPCError(errs.MISC_ERROR, 'Not found.');
                        return [2 /*return*/, util.revHex(hash)];
                }
            });
        });
    };
    RPC.prototype.getBlockHeader = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, verbose, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'getblockheader "hash" ( verbose )');
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        verbose = valid.bool(1, true);
                        if (!hash)
                            throw new RPCError(errs.MISC_ERROR, 'Invalid block hash.');
                        return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new RPCError(errs.MISC_ERROR, 'Block not found.');
                        if (!verbose)
                            return [2 /*return*/, entry.toRaw().toString('hex', 0, 80)];
                        return [4 /*yield*/, this.headerToJSON(entry)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.getBlockFilter = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'getblockfilter "hash"');
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        if (!hash)
                            throw new RPCError(errs.MISC_ERROR, 'Invalid block hash.');
                        return [4 /*yield*/, this.node.getBlockFilter(hash)];
                    case 1:
                        filter = _a.sent();
                        if (!filter)
                            throw new RPCError(errs.MISC_ERROR, 'Block filter not found.');
                        return [2 /*return*/, filter.toJSON()];
                }
            });
        });
    };
    RPC.prototype.getChainTips = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var tips, result, _i, tips_1, hash, entry, fork, main;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'getchaintips');
                        return [4 /*yield*/, this.chain.getTips()];
                    case 1:
                        tips = _a.sent();
                        result = [];
                        _i = 0, tips_1 = tips;
                        _a.label = 2;
                    case 2:
                        if (!(_i < tips_1.length)) return [3 /*break*/, 7];
                        hash = tips_1[_i];
                        return [4 /*yield*/, this.chain.getEntry(hash)];
                    case 3:
                        entry = _a.sent();
                        assert(entry);
                        return [4 /*yield*/, this.findFork(entry)];
                    case 4:
                        fork = _a.sent();
                        return [4 /*yield*/, this.chain.isMainChain(entry)];
                    case 5:
                        main = _a.sent();
                        result.push({
                            height: entry.height,
                            hash: entry.rhash(),
                            branchlen: entry.height - fork.height,
                            status: main ? 'active' : 'valid-headers'
                        });
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, result];
                }
            });
        });
    };
    RPC.prototype.getDifficulty = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getdifficulty');
                return [2 /*return*/, toDifficulty(this.chain.tip.bits)];
            });
        });
    };
    RPC.prototype.getMempoolInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getmempoolinfo');
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                return [2 /*return*/, {
                        size: this.mempool.map.size,
                        bytes: this.mempool.getSize(),
                        usage: this.mempool.getSize(),
                        maxmempool: this.mempool.options.maxSize,
                        mempoolminfee: Amount.btc(this.mempool.options.minRelay, true)
                    }];
            });
        });
    };
    RPC.prototype.getMempoolAncestors = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, verbose, entry, entries, out, _i, entries_1, entry_1, _a, entries_2, entry_2;
            return __generator(this, function (_b) {
                if (help || args.length < 1 || args.length > 2)
                    throw new RPCError(errs.MISC_ERROR, 'getmempoolancestors txid (verbose)');
                valid = new Validator(args);
                hash = valid.brhash(0);
                verbose = valid.bool(1, false);
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                if (!hash)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID.');
                entry = this.mempool.getEntry(hash);
                if (!entry)
                    throw new RPCError(errs.MISC_ERROR, 'Transaction not in mempool.');
                entries = this.mempool.getAncestors(entry);
                out = [];
                if (verbose) {
                    for (_i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                        entry_1 = entries_1[_i];
                        out.push(this.entryToJSON(entry_1));
                    }
                }
                else {
                    for (_a = 0, entries_2 = entries; _a < entries_2.length; _a++) {
                        entry_2 = entries_2[_a];
                        out.push(entry_2.txid());
                    }
                }
                return [2 /*return*/, out];
            });
        });
    };
    RPC.prototype.getMempoolDescendants = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, verbose, entry, entries, out, _i, entries_3, entry_3, _a, entries_4, entry_4;
            return __generator(this, function (_b) {
                if (help || args.length < 1 || args.length > 2) {
                    throw new RPCError(errs.MISC_ERROR, 'getmempooldescendants txid (verbose)');
                }
                valid = new Validator(args);
                hash = valid.brhash(0);
                verbose = valid.bool(1, false);
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                if (!hash)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID.');
                entry = this.mempool.getEntry(hash);
                if (!entry)
                    throw new RPCError(errs.MISC_ERROR, 'Transaction not in mempool.');
                entries = this.mempool.getDescendants(entry);
                out = [];
                if (verbose) {
                    for (_i = 0, entries_3 = entries; _i < entries_3.length; _i++) {
                        entry_3 = entries_3[_i];
                        out.push(this.entryToJSON(entry_3));
                    }
                }
                else {
                    for (_a = 0, entries_4 = entries; _a < entries_4.length; _a++) {
                        entry_4 = entries_4[_a];
                        out.push(entry_4.txid());
                    }
                }
                return [2 /*return*/, out];
            });
        });
    };
    RPC.prototype.getMempoolEntry = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, entry;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'getmempoolentry txid');
                valid = new Validator(args);
                hash = valid.brhash(0);
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                if (!hash)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID.');
                entry = this.mempool.getEntry(hash);
                if (!entry)
                    throw new RPCError(errs.MISC_ERROR, 'Transaction not in mempool.');
                return [2 /*return*/, this.entryToJSON(entry)];
            });
        });
    };
    RPC.prototype.getRawMempool = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, verbose, out, _i, _a, entry, hashes;
            return __generator(this, function (_b) {
                if (help || args.length > 1)
                    throw new RPCError(errs.MISC_ERROR, 'getrawmempool ( verbose )');
                valid = new Validator(args);
                verbose = valid.bool(0, false);
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                if (verbose) {
                    out = {};
                    for (_i = 0, _a = this.mempool.map.values(); _i < _a.length; _i++) {
                        entry = _a[_i];
                        out[entry.txid()] = this.entryToJSON(entry);
                    }
                    return [2 /*return*/, out];
                }
                hashes = this.mempool.getSnapshot();
                return [2 /*return*/, hashes.map(util.revHex)];
            });
        });
    };
    RPC.prototype.getTXOut = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, index, mempool, coin;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 2 || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'gettxout "txid" n ( includemempool )');
                        }
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        index = valid.u32(1);
                        mempool = valid.bool(2, true);
                        if (this.chain.options.spv)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot get coins in SPV mode.');
                        if (this.chain.options.prune)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot get coins when pruned.');
                        if (!hash || index == null)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid outpoint.');
                        if (mempool) {
                            if (!this.mempool)
                                throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                            coin = this.mempool.getCoin(hash, index);
                        }
                        if (!!coin) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.getCoin(hash, index)];
                    case 1:
                        coin = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!coin)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                bestblock: this.chain.tip.rhash(),
                                confirmations: coin.getDepth(this.chain.height),
                                value: Amount.btc(coin.value, true),
                                scriptPubKey: this.scriptToJSON(coin.script, true),
                                version: coin.version,
                                coinbase: coin.coinbase
                            }];
                }
            });
        });
    };
    RPC.prototype.getTXOutProof = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, txids, hash, items, set, hashes, last, i, hash_1, block, tx, coin, _i, hashes_1, hash_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || (args.length !== 1 && args.length !== 2)) {
                            throw new RPCError(errs.MISC_ERROR, 'gettxoutproof ["txid",...] ( blockhash )');
                        }
                        valid = new Validator(args);
                        txids = valid.array(0);
                        hash = valid.brhash(1);
                        if (this.chain.options.spv)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot get coins in SPV mode.');
                        if (this.chain.options.prune)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot get coins when pruned.');
                        if (!txids || txids.length === 0)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid TXIDs.');
                        items = new Validator(txids);
                        set = new BufferSet();
                        hashes = [];
                        last = null;
                        for (i = 0; i < txids.length; i++) {
                            hash_1 = items.brhash(i);
                            if (!hash_1)
                                throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID.');
                            if (set.has(hash_1))
                                throw new RPCError(errs.INVALID_PARAMETER, 'Duplicate txid.');
                            set.add(hash_1);
                            hashes.push(hash_1);
                            last = hash_1;
                        }
                        block = null;
                        if (!hash) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.getBlock(hash)];
                    case 1:
                        block = _a.sent();
                        return [3 /*break*/, 10];
                    case 2: return [4 /*yield*/, this.node.hasTX(last)];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.node.getMeta(last)];
                    case 4:
                        tx = _a.sent();
                        if (!tx) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.chain.getBlock(tx.block)];
                    case 5:
                        block = _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 10];
                    case 7: return [4 /*yield*/, this.chain.getCoin(last, 0)];
                    case 8:
                        coin = _a.sent();
                        if (!coin) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.chain.getBlock(coin.height)];
                    case 9:
                        block = _a.sent();
                        _a.label = 10;
                    case 10:
                        if (!block)
                            throw new RPCError(errs.MISC_ERROR, 'Block not found.');
                        for (_i = 0, hashes_1 = hashes; _i < hashes_1.length; _i++) {
                            hash_2 = hashes_1[_i];
                            if (!block.hasTX(hash_2)) {
                                throw new RPCError(errs.VERIFY_ERROR, 'Block does not contain all txids.');
                            }
                        }
                        block = MerkleBlock.fromHashes(block, hashes);
                        return [2 /*return*/, block.toRaw().toString('hex')];
                }
            });
        });
    };
    RPC.prototype.verifyTXOutProof = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, block, entry, tree, out, _i, _a, hash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'verifytxoutproof "proof"');
                        valid = new Validator(args);
                        data = valid.buf(0);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid hex string.');
                        block = MerkleBlock.fromRaw(data);
                        if (!block.verify())
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.chain.getEntry(block.hash())];
                    case 1:
                        entry = _b.sent();
                        if (!entry)
                            throw new RPCError(errs.MISC_ERROR, 'Block not found in chain.');
                        tree = block.getTree();
                        out = [];
                        for (_i = 0, _a = tree.matches; _i < _a.length; _i++) {
                            hash = _a[_i];
                            out.push(util.revHex(hash));
                        }
                        return [2 /*return*/, out];
                }
            });
        });
    };
    RPC.prototype.getTXOutSetInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'gettxoutsetinfo');
                if (this.chain.options.spv) {
                    throw new RPCError(errs.MISC_ERROR, 'Chainstate not available (SPV mode).');
                }
                return [2 /*return*/, {
                        height: this.chain.height,
                        bestblock: this.chain.tip.rhash(),
                        transactions: this.chain.db.state.tx,
                        txouts: this.chain.db.state.coin,
                        bytes_serialized: 0,
                        hash_serialized: 0,
                        total_amount: Amount.btc(this.chain.db.state.value, true)
                    }];
            });
        });
    };
    RPC.prototype.pruneBlockchain = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'pruneblockchain');
                        if (this.chain.options.spv)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot prune chain in SPV mode.');
                        if (this.chain.options.prune)
                            throw new RPCError(errs.MISC_ERROR, 'Chain is already pruned.');
                        if (this.chain.height < this.network.block.pruneAfterHeight)
                            throw new RPCError(errs.MISC_ERROR, 'Chain is too short for pruning.');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.prune()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        throw new RPCError(errs.DATABASE_ERROR, e_1.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype.verifyChain = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, level, blocks;
            return __generator(this, function (_a) {
                if (help || args.length > 2) {
                    throw new RPCError(errs.MISC_ERROR, 'verifychain ( checklevel numblocks )');
                }
                valid = new Validator(args);
                level = valid.u32(0);
                blocks = valid.u32(1);
                if (level == null || blocks == null)
                    throw new RPCError(errs.TYPE_ERROR, 'Missing parameters.');
                if (this.chain.options.spv)
                    throw new RPCError(errs.MISC_ERROR, 'Cannot verify chain in SPV mode.');
                if (this.chain.options.prune)
                    throw new RPCError(errs.MISC_ERROR, 'Cannot verify chain when pruned.');
                return [2 /*return*/, null];
            });
        });
    };
    /*
     * Mining
     */
    RPC.prototype.submitWork = function (data) {
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
                        return [4 /*yield*/, this._submitWork(data)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype._submitWork = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, raw, header, nonces, n1, n2, nonce, time, proof, block, entry, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = this.attempt;
                        if (!attempt)
                            return [2 /*return*/, false];
                        if (data.length !== 128)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid work size.');
                        raw = data.slice(0, 80);
                        swap32(raw);
                        header = Headers.fromHead(raw);
                        if (header.prevBlock !== attempt.prevBlock
                            || header.bits !== attempt.bits) {
                            return [2 /*return*/, false];
                        }
                        if (!header.verify())
                            return [2 /*return*/, false];
                        nonces = this.merkleMap.get(header.merkleRoot);
                        if (!nonces)
                            return [2 /*return*/, false];
                        n1 = nonces[0], n2 = nonces[1];
                        nonce = header.nonce;
                        time = header.time;
                        proof = attempt.getProof(n1, n2, time, nonce);
                        if (!proof.verify(attempt.target))
                            return [2 /*return*/, false];
                        block = attempt.commit(proof);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.add(block)];
                    case 2:
                        entry = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        if (err_1.type === 'VerifyError') {
                            this.logger.warning('RPC block rejected: %h (%s).', block.hash(), err_1.reason);
                            return [2 /*return*/, false];
                        }
                        throw err_1;
                    case 4:
                        if (!entry) {
                            this.logger.warning('RPC block rejected: %h (bad-prevblk).', block.hash());
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                }
            });
        });
    };
    RPC.prototype.createWork = function (data) {
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
                        return [4 /*yield*/, this._createWork(data)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype._createWork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, n1, n2, time, data, root, head;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.updateWork()];
                    case 1:
                        attempt = _a.sent();
                        n1 = this.nonce1;
                        n2 = this.nonce2;
                        time = attempt.time;
                        data = Buffer.allocUnsafe(128);
                        data.fill(0);
                        root = attempt.getRoot(n1, n2);
                        head = attempt.getHeader(root, time, 0);
                        head.copy(data, 0);
                        data[80] = 0x80;
                        data.writeUInt32BE(80 * 8, data.length - 4, true);
                        swap32(data);
                        return [2 /*return*/, {
                                data: data.toString('hex'),
                                target: attempt.target.toString('hex'),
                                height: attempt.height
                            }];
                }
            });
        });
    };
    RPC.prototype.getWorkLongpoll = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.longpoll()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.createWork()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.getWork = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (args.length > 1)
                            throw new RPCError(errs.MISC_ERROR, 'getwork ( "data" )');
                        if (!(args.length === 1)) return [3 /*break*/, 2];
                        valid = new Validator(args);
                        data = valid.buf(0);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid work data.');
                        return [4 /*yield*/, this.submitWork(data)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.createWork()];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.submitBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'submitblock "hexdata" ( "jsonparametersobject" )');
                        }
                        valid = new Validator(args);
                        data = valid.buf(0);
                        block = Block.fromRaw(data);
                        return [4 /*yield*/, this.addBlock(block)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.getBlockTemplate = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var validator, options, valid, mode, data, block, e_2, maxVersion, rules, capabilities, coinbase, txnCap, valueCap, _i, capabilities_1, capability, lpid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 1) {
                            throw new RPCError(errs.MISC_ERROR, 'getblocktemplate ( "jsonrequestobject" )');
                        }
                        validator = new Validator(args);
                        options = validator.obj(0, {});
                        valid = new Validator(options);
                        mode = valid.str('mode', 'template');
                        if (mode !== 'template' && mode !== 'proposal')
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid mode.');
                        if (!(mode === 'proposal')) return [3 /*break*/, 5];
                        data = valid.buf('data');
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Missing data parameter.');
                        block = Block.fromRaw(data);
                        if (!block.prevBlock.equals(this.chain.tip.hash))
                            return [2 /*return*/, 'inconclusive-not-best-prevblk'];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.verifyBlock(block)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        if (e_2.type === 'VerifyError')
                            return [2 /*return*/, e_2.reason];
                        throw e_2;
                    case 4: return [2 /*return*/, null];
                    case 5:
                        maxVersion = valid.u32('maxversion', -1);
                        rules = valid.array('rules');
                        if (rules)
                            maxVersion = -1;
                        capabilities = valid.array('capabilities');
                        coinbase = false;
                        if (capabilities) {
                            txnCap = false;
                            valueCap = false;
                            for (_i = 0, capabilities_1 = capabilities; _i < capabilities_1.length; _i++) {
                                capability = capabilities_1[_i];
                                if (typeof capability !== 'string')
                                    throw new RPCError(errs.TYPE_ERROR, 'Invalid capability.');
                                switch (capability) {
                                    case 'coinbasetxn':
                                        txnCap = true;
                                        break;
                                    case 'coinbasevalue':
                                        // Prefer value if they support it.
                                        valueCap = true;
                                        break;
                                }
                            }
                            // BIP22 states that we can't have coinbasetxn
                            // _and_ coinbasevalue in the same template.
                            // The problem is, many clients _say_ they
                            // support coinbasetxn when they don't (ckpool).
                            // To make matters worse, some clients will
                            // parse an undefined `coinbasevalue` as zero.
                            // Because of all of this, coinbasetxn is
                            // disabled for now.
                            valueCap = true;
                            if (txnCap && !valueCap) {
                                if (this.miner.addresses.length === 0) {
                                    throw new RPCError(errs.MISC_ERROR, 'No addresses available for coinbase.');
                                }
                                coinbase = true;
                            }
                        }
                        if (!this.network.selfConnect) {
                            if (this.pool.peers.size() === 0) {
                                throw new RPCError(errs.CLIENT_NOT_CONNECTED, 'Bitcoin is not connected!');
                            }
                            if (!this.chain.synced) {
                                throw new RPCError(errs.CLIENT_IN_INITIAL_DOWNLOAD, 'Bitcoin is downloading blocks...');
                            }
                        }
                        lpid = valid.str('longpollid');
                        if (!lpid) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.handleLongpoll(lpid)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!rules)
                            rules = [];
                        return [4 /*yield*/, this.createTemplate(maxVersion, coinbase, rules)];
                    case 8: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.createTemplate = function (maxVersion, coinbase, rules) {
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
                        return [4 /*yield*/, this._createTemplate(maxVersion, coinbase, rules)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype._createTemplate = function (maxVersion, coinbase, rules) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, scale, mutable, index, i, entry, txs, i, entry, tx, deps, j, input, dep, version, vbavailable, vbrules, _i, _a, deploy, state, name_1, json, tx, input, output;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getTemplate()];
                    case 1:
                        attempt = _b.sent();
                        scale = attempt.witness ? 1 : consensus.WITNESS_SCALE_FACTOR;
                        mutable = ['time', 'transactions', 'prevblock'];
                        // The miner doesn't support
                        // versionbits. Force them to
                        // encode our version.
                        if (maxVersion >= 2)
                            mutable.push('version/force');
                        // Allow the miner to change
                        // our provided coinbase.
                        // Note that these are implied
                        // without `coinbasetxn`.
                        if (coinbase) {
                            mutable.push('coinbase');
                            mutable.push('coinbase/append');
                            mutable.push('generation');
                        }
                        index = new BufferMap();
                        for (i = 0; i < attempt.items.length; i++) {
                            entry = attempt.items[i];
                            index.set(entry.hash, i + 1);
                        }
                        txs = [];
                        for (i = 0; i < attempt.items.length; i++) {
                            entry = attempt.items[i];
                            tx = entry.tx;
                            deps = [];
                            for (j = 0; j < tx.inputs.length; j++) {
                                input = tx.inputs[j];
                                dep = index.get(input.prevout.hash);
                                if (dep == null)
                                    continue;
                                if (deps.indexOf(dep) === -1) {
                                    assert(dep < i + 1);
                                    deps.push(dep);
                                }
                            }
                            txs.push({
                                data: tx.toRaw().toString('hex'),
                                txid: tx.txid(),
                                hash: tx.wtxid(),
                                depends: deps,
                                fee: entry.fee,
                                sigops: entry.sigops / scale | 0,
                                weight: tx.getWeight()
                            });
                        }
                        if (this.chain.options.bip91) {
                            rules.push('segwit');
                            rules.push('segsignal');
                        }
                        if (this.chain.options.bip148)
                            rules.push('segwit');
                        version = attempt.version;
                        vbavailable = {};
                        vbrules = [];
                        _i = 0, _a = this.network.deploys;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        deploy = _a[_i];
                        return [4 /*yield*/, this.chain.getState(this.chain.tip, deploy)];
                    case 3:
                        state = _b.sent();
                        name_1 = deploy.name;
                        switch (state) {
                            case common.thresholdStates.DEFINED:
                            case common.thresholdStates.FAILED:
                                break;
                            case common.thresholdStates.LOCKED_IN:
                                version |= 1 << deploy.bit;
                            case common.thresholdStates.STARTED:
                                if (!deploy.force) {
                                    if (rules.indexOf(name_1) === -1)
                                        version &= ~(1 << deploy.bit);
                                    if (deploy.required)
                                        name_1 = '!' + name_1;
                                }
                                vbavailable[name_1] = deploy.bit;
                                break;
                            case common.thresholdStates.ACTIVE:
                                if (!deploy.force && deploy.required) {
                                    if (rules.indexOf(name_1) === -1) {
                                        throw new RPCError(errs.INVALID_PARAMETER, "Client must support ".concat(name_1, "."));
                                    }
                                    name_1 = '!' + name_1;
                                }
                                vbrules.push(name_1);
                                break;
                            default:
                                assert(false, 'Bad state.');
                                break;
                        }
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        version >>>= 0;
                        json = {
                            capabilities: ['proposal'],
                            mutable: mutable,
                            version: version,
                            rules: vbrules,
                            vbavailable: vbavailable,
                            vbrequired: 0,
                            height: attempt.height,
                            previousblockhash: util.revHex(attempt.prevBlock),
                            target: util.revHex(attempt.target),
                            bits: hex32(attempt.bits),
                            noncerange: '00000000ffffffff',
                            curtime: attempt.time,
                            mintime: attempt.mtp + 1,
                            maxtime: attempt.time + 7200,
                            expires: attempt.time + 7200,
                            sigoplimit: consensus.MAX_BLOCK_SIGOPS_COST / scale | 0,
                            sizelimit: consensus.MAX_BLOCK_SIZE,
                            weightlimit: undefined,
                            longpollid: this.chain.tip.rhash() + hex32(this.totalTX()),
                            submitold: false,
                            coinbaseaux: {
                                flags: attempt.coinbaseFlags.toString('hex')
                            },
                            coinbasevalue: undefined,
                            coinbasetxn: undefined,
                            default_witness_commitment: undefined,
                            transactions: txs
                        };
                        // See:
                        // bitcoin/bitcoin#9fc7f0bce94f1cea0239b1543227f22a3f3b9274
                        if (attempt.witness) {
                            json.sizelimit = consensus.MAX_RAW_BLOCK_SIZE;
                            json.weightlimit = consensus.MAX_BLOCK_WEIGHT;
                        }
                        // The client wants a coinbasetxn
                        // instead of a coinbasevalue.
                        if (coinbase) {
                            tx = attempt.toCoinbase();
                            input = tx.inputs[0];
                            // Pop off the nonces.
                            input.script.pop();
                            input.script.compile();
                            if (attempt.witness) {
                                output = tx.outputs.pop();
                                assert(output.script.isCommitment());
                                // Also not including the witness nonce.
                                input.witness.clear();
                            }
                            tx.refresh();
                            json.coinbasetxn = {
                                data: tx.toRaw().toString('hex'),
                                txid: tx.txid(),
                                hash: tx.wtxid(),
                                depends: [],
                                fee: 0,
                                sigops: tx.getSigopsCost() / scale | 0,
                                weight: tx.getWeight()
                            };
                        }
                        else {
                            json.coinbasevalue = attempt.getReward();
                        }
                        if (rules.indexOf('segwit') !== -1)
                            json.default_witness_commitment = attempt.getWitnessScript().toJSON();
                        return [2 /*return*/, json];
                }
            });
        });
    };
    RPC.prototype.getMiningInfo = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, size, weight, txs, diff, _i, _a, item;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (help || args.length !== 0)
                            throw new RPCError(errs.MISC_ERROR, 'getmininginfo');
                        attempt = this.attempt;
                        size = 0;
                        weight = 0;
                        txs = 0;
                        diff = 0;
                        if (attempt) {
                            weight = attempt.weight;
                            txs = attempt.items.length + 1;
                            diff = attempt.getDifficulty();
                            size = 1000;
                            for (_i = 0, _a = attempt.items; _i < _a.length; _i++) {
                                item = _a[_i];
                                size += item.tx.getBaseSize();
                            }
                        }
                        _b = {
                            blocks: this.chain.height,
                            currentblocksize: size,
                            currentblockweight: weight,
                            currentblocktx: txs,
                            difficulty: diff,
                            errors: '',
                            genproclimit: this.procLimit
                        };
                        return [4 /*yield*/, this.getHashRate(120)];
                    case 1: return [2 /*return*/, (_b.networkhashps = _c.sent(),
                            _b.pooledtx = this.totalTX(),
                            _b.testnet = this.network !== Network.main,
                            _b.chain = this.network.type !== 'testnet'
                                ? this.network.type
                                : 'test',
                            _b.generate = this.mining,
                            _b)];
                }
            });
        });
    };
    RPC.prototype.getNetworkHashPS = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, lookup, height;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'getnetworkhashps ( blocks height )');
                        valid = new Validator(args);
                        lookup = valid.u32(0, 120);
                        height = valid.u32(1);
                        return [4 /*yield*/, this.getHashRate(lookup, height)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.prioritiseTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, pri, fee, entry;
            return __generator(this, function (_a) {
                if (help || args.length !== 3) {
                    throw new RPCError(errs.MISC_ERROR, 'prioritisetransaction <txid> <priority delta> <fee delta>');
                }
                valid = new Validator(args);
                hash = valid.brhash(0);
                pri = valid.i64(1);
                fee = valid.i64(2);
                if (!this.mempool)
                    throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                if (!hash)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID');
                if (pri == null || fee == null)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid fee or priority.');
                entry = this.mempool.getEntry(hash);
                if (!entry)
                    throw new RPCError(errs.MISC_ERROR, 'Transaction not in mempool.');
                this.mempool.prioritise(entry, pri, fee);
                return [2 /*return*/, true];
            });
        });
    };
    RPC.prototype.verifyBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, block, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'verifyblock "block-hex"');
                        valid = new Validator(args);
                        data = valid.buf(0);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid block hex.');
                        if (this.chain.options.spv)
                            throw new RPCError(errs.MISC_ERROR, 'Cannot verify block in SPV mode.');
                        block = Block.fromRaw(data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.chain.verifyBlock(block)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        if (e_3.type === 'VerifyError')
                            return [2 /*return*/, e_3.reason];
                        throw e_3;
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    /*
     * Coin generation
     */
    RPC.prototype.getGenerate = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (help || args.length !== 0)
                    throw new RPCError(errs.MISC_ERROR, 'getgenerate');
                return [2 /*return*/, this.mining];
            });
        });
    };
    RPC.prototype.setGenerate = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, mine, limit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'setgenerate mine ( proclimit )');
                        valid = new Validator(args);
                        mine = valid.bool(0, false);
                        limit = valid.u32(1, 0);
                        if (mine && this.miner.addresses.length === 0) {
                            throw new RPCError(errs.MISC_ERROR, 'No addresses available for coinbase.');
                        }
                        this.mining = mine;
                        this.procLimit = limit;
                        if (mine) {
                            this.miner.cpu.start();
                            return [2 /*return*/, true];
                        }
                        return [4 /*yield*/, this.miner.cpu.stop()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, false];
                }
            });
        });
    };
    RPC.prototype.generate = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks, tries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2)
                            throw new RPCError(errs.MISC_ERROR, 'generate numblocks ( maxtries )');
                        valid = new Validator(args);
                        blocks = valid.u32(0, 1);
                        tries = valid.u32(1);
                        if (this.miner.addresses.length === 0) {
                            throw new RPCError(errs.MISC_ERROR, 'No addresses available for coinbase.');
                        }
                        return [4 /*yield*/, this.mineBlocks(blocks, null, tries)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RPC.prototype.generateToAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks, str, tries, addr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 2 || args.length > 3) {
                            throw new RPCError(errs.MISC_ERROR, 'generatetoaddress numblocks address ( maxtries )');
                        }
                        valid = new Validator(args);
                        blocks = valid.u32(0, 1);
                        str = valid.str(1, '');
                        tries = valid.u32(2);
                        addr = parseAddress(str, this.network);
                        return [4 /*yield*/, this.mineBlocks(blocks, addr, tries)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /*
     * Raw transactions
     */
    RPC.prototype.createRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, inputs, sendTo, locktime, tx, _i, inputs_1, obj, valid_1, hash, index, sequence, input, sends, uniq, _a, _b, key, value_1, output_1, addr, b58, value, output;
            return __generator(this, function (_c) {
                if (help || args.length < 2 || args.length > 3) {
                    throw new RPCError(errs.MISC_ERROR, 'createrawtransaction'
                        + ' [{"txid":"id","vout":n},...]'
                        + ' {"address":amount,"data":"hex",...}'
                        + ' ( locktime )');
                }
                valid = new Validator(args);
                inputs = valid.array(0);
                sendTo = valid.obj(1);
                locktime = valid.u32(2);
                if (!inputs || !sendTo) {
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid parameters (inputs and sendTo).');
                }
                tx = new MTX();
                if (locktime != null)
                    tx.locktime = locktime;
                for (_i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
                    obj = inputs_1[_i];
                    valid_1 = new Validator(obj);
                    hash = valid_1.brhash('txid');
                    index = valid_1.u32('vout');
                    sequence = valid_1.u32('sequence', 0xffffffff);
                    if (tx.locktime)
                        sequence--;
                    if (!hash || index == null)
                        throw new RPCError(errs.TYPE_ERROR, 'Invalid outpoint.');
                    input = new Input();
                    input.prevout.hash = hash;
                    input.prevout.index = index;
                    input.sequence = sequence;
                    tx.inputs.push(input);
                }
                sends = new Validator(sendTo);
                uniq = new Set();
                for (_a = 0, _b = Object.keys(sendTo); _a < _b.length; _a++) {
                    key = _b[_a];
                    if (key === 'data') {
                        value_1 = sends.buf(key);
                        if (!value_1)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid nulldata..');
                        output_1 = new Output();
                        output_1.value = 0;
                        output_1.script.fromNulldata(value_1);
                        tx.outputs.push(output_1);
                        continue;
                    }
                    addr = parseAddress(key, this.network);
                    b58 = addr.toString(this.network);
                    if (uniq.has(b58))
                        throw new RPCError(errs.INVALID_PARAMETER, 'Duplicate address');
                    uniq.add(b58);
                    value = sends.ufixed(key, 8);
                    if (value == null)
                        throw new RPCError(errs.TYPE_ERROR, 'Invalid output value.');
                    output = new Output();
                    output.value = value;
                    output.script.fromAddress(addr);
                    tx.outputs.push(output);
                }
                return [2 /*return*/, tx.toRaw().toString('hex')];
            });
        });
    };
    RPC.prototype.decodeRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, tx;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'decoderawtransaction "hexstring"');
                valid = new Validator(args);
                data = valid.buf(0);
                if (!data)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid hex string.');
                tx = TX.fromRaw(data);
                return [2 /*return*/, this.txToJSON(tx)];
            });
        });
    };
    RPC.prototype.decodeScript = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, script, addr, json;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'decodescript "hex"');
                valid = new Validator(args);
                data = valid.buf(0);
                script = new Script();
                if (data)
                    script = Script.fromRaw(data);
                addr = Address.fromScripthash(script.hash160());
                json = this.scriptToJSON(script);
                json.p2sh = addr.toString(this.network);
                return [2 /*return*/, json];
            });
        });
    };
    RPC.prototype.getRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash, verbose, meta, tx, entry, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 2) {
                            throw new RPCError(errs.MISC_ERROR, 'getrawtransaction "txid" ( verbose )');
                        }
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        verbose = valid.bool(1, false);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid TXID.');
                        return [4 /*yield*/, this.node.getMeta(hash)];
                    case 1:
                        meta = _a.sent();
                        if (!meta)
                            throw new RPCError(errs.MISC_ERROR, 'Transaction not found.');
                        tx = meta.tx;
                        if (!verbose)
                            return [2 /*return*/, tx.toRaw().toString('hex')];
                        if (!meta.block) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.chain.getEntry(meta.block)];
                    case 2:
                        entry = _a.sent();
                        _a.label = 3;
                    case 3:
                        json = this.txToJSON(tx, entry);
                        json.time = meta.mtime;
                        json.hex = tx.toRaw().toString('hex');
                        return [2 /*return*/, json];
                }
            });
        });
    };
    RPC.prototype.sendRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, tx;
            return __generator(this, function (_a) {
                if (help || args.length < 1 || args.length > 2) {
                    throw new RPCError(errs.MISC_ERROR, 'sendrawtransaction "hexstring" ( allowhighfees )');
                }
                valid = new Validator(args);
                data = valid.buf(0);
                if (!data)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid hex string.');
                tx = TX.fromRaw(data);
                this.node.relay(tx);
                return [2 /*return*/, tx.txid()];
            });
        });
    };
    RPC.prototype.signRawTransaction = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, data, prevout, secrets, sighash, tx, _a, map, keys, valid_2, i, secret, key, _i, prevout_1, prev, valid_3, hash, index, scriptRaw, value, redeemRaw, outpoint, script, coin, redeem, _b, _c, op, key, type, parts;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (help || args.length < 1 || args.length > 4) {
                            throw new RPCError(errs.MISC_ERROR, 'signrawtransaction'
                                + ' "hexstring" ('
                                + ' [{"txid":"id","vout":n,"scriptPubKey":"hex",'
                                + 'redeemScript":"hex"},...] ["privatekey1",...]'
                                + ' sighashtype )');
                        }
                        valid = new Validator(args);
                        data = valid.buf(0);
                        prevout = valid.array(1);
                        secrets = valid.array(2);
                        sighash = valid.str(3);
                        if (!data)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid hex string.');
                        if (!this.mempool)
                            throw new RPCError(errs.MISC_ERROR, 'No mempool available.');
                        tx = MTX.fromRaw(data);
                        _a = tx;
                        return [4 /*yield*/, this.mempool.getSpentView(tx)];
                    case 1:
                        _a.view = _d.sent();
                        map = new BufferMap();
                        keys = [];
                        if (secrets) {
                            valid_2 = new Validator(secrets);
                            for (i = 0; i < secrets.length; i++) {
                                secret = valid_2.str(i, '');
                                key = parseSecret(secret, this.network);
                                map.set(key.getPublicKey(), key);
                                keys.push(key);
                            }
                        }
                        if (prevout) {
                            for (_i = 0, prevout_1 = prevout; _i < prevout_1.length; _i++) {
                                prev = prevout_1[_i];
                                valid_3 = new Validator(prev);
                                hash = valid_3.brhash('txid');
                                index = valid_3.u32('vout');
                                scriptRaw = valid_3.buf('scriptPubKey');
                                value = valid_3.ufixed('amount', 8);
                                redeemRaw = valid_3.buf('redeemScript');
                                if (!hash || index == null || !scriptRaw || value == null)
                                    throw new RPCError(errs.INVALID_PARAMETER, 'Invalid UTXO.');
                                outpoint = new Outpoint(hash, index);
                                script = Script.fromRaw(scriptRaw);
                                coin = Output.fromScript(script, value);
                                tx.view.addOutput(outpoint, coin);
                                if (keys.length === 0 || !redeemRaw)
                                    continue;
                                if (!script.isScripthash() && !script.isWitnessScripthash())
                                    continue;
                                if (!redeemRaw) {
                                    throw new RPCError(errs.INVALID_PARAMETER, 'P2SH requires redeem script.');
                                }
                                redeem = Script.fromRaw(redeemRaw);
                                for (_b = 0, _c = redeem.code; _b < _c.length; _b++) {
                                    op = _c[_b];
                                    if (!op.data)
                                        continue;
                                    key = map.get(op.data);
                                    if (key) {
                                        key.script = redeem;
                                        key.witness = script.isWitnessScripthash();
                                        key.refresh();
                                        break;
                                    }
                                }
                            }
                        }
                        type = Script.hashType.ALL;
                        if (sighash) {
                            parts = sighash.split('|');
                            if (parts.length < 1 || parts.length > 2)
                                throw new RPCError(errs.INVALID_PARAMETER, 'Invalid sighash type.');
                            type = Script.hashType[parts[0]];
                            if (type == null)
                                throw new RPCError(errs.INVALID_PARAMETER, 'Invalid sighash type.');
                            if (parts.length === 2) {
                                if (parts[1] !== 'ANYONECANPAY')
                                    throw new RPCError(errs.INVALID_PARAMETER, 'Invalid sighash type.');
                                type |= Script.hashType.ANYONECANPAY;
                            }
                        }
                        return [4 /*yield*/, tx.signAsync(keys, type, this.workers)];
                    case 2:
                        _d.sent();
                        return [2 /*return*/, {
                                hex: tx.toRaw().toString('hex'),
                                complete: tx.isSigned()
                            }];
                }
            });
        });
    };
    /*
     * Utility Functions
     */
    RPC.prototype.createMultisig = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, keys, m, n, items, i, key, script, addr;
            return __generator(this, function (_a) {
                if (help || args.length < 2 || args.length > 2) {
                    throw new RPCError(errs.MISC_ERROR, 'createmultisig nrequired ["key",...]');
                }
                valid = new Validator(args);
                keys = valid.array(1, []);
                m = valid.u32(0, 0);
                n = keys.length;
                if (m < 1 || n < m || n > 16)
                    throw new RPCError(errs.INVALID_PARAMETER, 'Invalid m and n values.');
                items = new Validator(keys);
                for (i = 0; i < keys.length; i++) {
                    key = items.buf(i);
                    if (!key)
                        throw new RPCError(errs.TYPE_ERROR, 'Invalid key.');
                    if (!secp256k1.publicKeyVerify(key))
                        throw new RPCError(errs.INVALID_ADDRESS_OR_KEY, 'Invalid key.');
                    keys[i] = key;
                }
                script = Script.fromMultisig(m, n, keys);
                if (script.getSize() > consensus.MAX_SCRIPT_PUSH) {
                    throw new RPCError(errs.VERIFY_ERROR, 'Redeem script exceeds size limit.');
                }
                addr = script.getAddress();
                return [2 /*return*/, {
                        address: addr.toString(this.network),
                        redeemScript: script.toJSON()
                    }];
            });
        });
    };
    RPC.prototype.createWitnessAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, raw, script, program, addr;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'createwitnessaddress "script"');
                valid = new Validator(args);
                raw = valid.buf(0);
                if (!raw)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid script hex.');
                script = Script.fromRaw(raw);
                program = script.forWitness();
                addr = program.getAddress();
                return [2 /*return*/, {
                        address: addr.toString(this.network),
                        witnessScript: program.toJSON()
                    }];
            });
        });
    };
    RPC.prototype.validateAddress = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, str, addr, script, isWitness, isScript, result;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'validateaddress "bitcoinaddress"');
                valid = new Validator(args);
                str = valid.str(0, '');
                try {
                    addr = Address.fromString(str, this.network);
                }
                catch (e) {
                    return [2 /*return*/, {
                            isvalid: false
                        }];
                }
                script = Script.fromAddress(addr);
                isWitness = addr.isProgram();
                isScript = script.isScripthash() || script.isWitnessScripthash();
                result = {
                    isvalid: true,
                    address: addr.toString(this.network),
                    scriptPubKey: script.toJSON(),
                    isscript: isScript,
                    iswitness: isWitness
                };
                if (isWitness) {
                    result.witness_version = addr.version;
                    result.witness_program = addr.hash.toString('hex');
                }
                return [2 /*return*/, result];
            });
        });
    };
    RPC.prototype.verifyMessage = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, b58, sig, str, addr, key;
            return __generator(this, function (_a) {
                if (help || args.length !== 3) {
                    throw new RPCError(errs.MISC_ERROR, 'verifymessage "bitcoinaddress" "signature" "message"');
                }
                valid = new Validator(args);
                b58 = valid.str(0, '');
                sig = valid.buf(1, null, 'base64');
                str = valid.str(2);
                if (!sig || !str)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid parameters.');
                addr = parseAddress(b58, this.network);
                key = messageUtil.recover(str, sig);
                if (!key)
                    return [2 /*return*/, false];
                return [2 /*return*/, safeEqual(hash160.digest(key), addr.hash) === 1];
            });
        });
    };
    RPC.prototype.signMessageWithPrivkey = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, wif, str, key, sig;
            return __generator(this, function (_a) {
                if (help || args.length !== 2) {
                    throw new RPCError(errs.MISC_ERROR, 'signmessagewithprivkey "privkey" "message"');
                }
                valid = new Validator(args);
                wif = valid.str(0, '');
                str = valid.str(1, '');
                key = parseSecret(wif, this.network);
                sig = messageUtil.sign(str, key);
                return [2 /*return*/, sig.toString('base64')];
            });
        });
    };
    RPC.prototype.estimateFee = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks, fee;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'estimatefee nblocks');
                valid = new Validator(args);
                blocks = valid.u32(0, 1);
                if (!this.fees)
                    throw new RPCError(errs.MISC_ERROR, 'Fee estimation not available.');
                fee = this.fees.estimateFee(blocks, false);
                if (fee === 0)
                    return [2 /*return*/, -1];
                return [2 /*return*/, Amount.btc(fee, true)];
            });
        });
    };
    RPC.prototype.estimatePriority = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'estimatepriority nblocks');
                valid = new Validator(args);
                blocks = valid.u32(0, 1);
                if (!this.fees)
                    throw new RPCError(errs.MISC_ERROR, 'Priority estimation not available.');
                return [2 /*return*/, this.fees.estimatePriority(blocks, false)];
            });
        });
    };
    RPC.prototype.estimateSmartFee = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks, fee;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'estimatesmartfee nblocks');
                valid = new Validator(args);
                blocks = valid.u32(0, 1);
                if (!this.fees)
                    throw new RPCError(errs.MISC_ERROR, 'Fee estimation not available.');
                fee = this.fees.estimateFee(blocks, true);
                if (fee === 0)
                    fee = -1;
                else
                    fee = Amount.btc(fee, true);
                return [2 /*return*/, {
                        fee: fee,
                        blocks: blocks
                    }];
            });
        });
    };
    RPC.prototype.estimateSmartPriority = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, blocks, pri;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'estimatesmartpriority nblocks');
                valid = new Validator(args);
                blocks = valid.u32(0, 1);
                if (!this.fees)
                    throw new RPCError(errs.MISC_ERROR, 'Priority estimation not available.');
                pri = this.fees.estimatePriority(blocks, true);
                return [2 /*return*/, {
                        priority: pri,
                        blocks: blocks
                    }];
            });
        });
    };
    RPC.prototype.invalidateBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (help || args.length !== 1)
                            throw new RPCError(errs.MISC_ERROR, 'invalidateblock "hash"');
                        valid = new Validator(args);
                        hash = valid.brhash(0);
                        if (!hash)
                            throw new RPCError(errs.TYPE_ERROR, 'Invalid block hash.');
                        return [4 /*yield*/, this.chain.invalidate(hash)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.reconsiderBlock = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, hash;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'reconsiderblock "hash"');
                valid = new Validator(args);
                hash = valid.brhash(0);
                if (!hash)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid block hash.');
                this.chain.removeInvalid(hash);
                return [2 /*return*/, null];
            });
        });
    };
    RPC.prototype.setMockTime = function (args, help) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, time, delta;
            return __generator(this, function (_a) {
                if (help || args.length !== 1)
                    throw new RPCError(errs.MISC_ERROR, 'setmocktime timestamp');
                valid = new Validator(args);
                time = valid.u32(0);
                if (time == null)
                    throw new RPCError(errs.TYPE_ERROR, 'Invalid timestamp.');
                this.network.time.offset = 0;
                delta = this.network.now() - time;
                this.network.time.offset = -delta;
                return [2 /*return*/, null];
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
    /*
     * Helpers
     */
    RPC.prototype.handleLongpoll = function (lpid) {
        return __awaiter(this, void 0, void 0, function () {
            var watched, lastTX, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (lpid.length !== 72)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid longpoll ID.');
                        watched = lpid.slice(0, 64);
                        lastTX = parseInt(lpid.slice(64, 72), 16);
                        if ((lastTX >>> 0) !== lastTX)
                            throw new RPCError(errs.INVALID_PARAMETER, 'Invalid longpoll ID.');
                        hash = util.revHex(watched);
                        if (!this.chain.tip.hash.equals(hash))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.longpoll()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype.longpoll = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.pollers.push({ resolve: resolve, reject: reject });
        });
    };
    RPC.prototype.refreshBlock = function () {
        var pollers = this.pollers;
        this.attempt = null;
        this.lastActivity = 0;
        this.merkleMap.clear();
        this.nonce1 = 0;
        this.nonce2 = 0;
        this.pollers = [];
        for (var _i = 0, pollers_1 = pollers; _i < pollers_1.length; _i++) {
            var job = pollers_1[_i];
            job.resolve();
        }
    };
    RPC.prototype.bindChain = function () {
        var _this = this;
        if (this.boundChain)
            return;
        this.boundChain = true;
        this.node.on('connect', function () {
            if (!_this.attempt)
                return;
            _this.refreshBlock();
        });
        if (!this.mempool)
            return;
        this.node.on('tx', function () {
            if (!_this.attempt)
                return;
            if (util.now() - _this.lastActivity > 10)
                _this.refreshBlock();
        });
    };
    RPC.prototype.getTemplate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.bindChain();
                        attempt = this.attempt;
                        if (!attempt) return [3 /*break*/, 1];
                        this.miner.updateTime(attempt);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.miner.createBlock()];
                    case 2:
                        attempt = _a.sent();
                        this.attempt = attempt;
                        this.lastActivity = util.now();
                        _a.label = 3;
                    case 3: return [2 /*return*/, attempt];
                }
            });
        });
    };
    RPC.prototype.updateWork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, n1_1, n2_1, root_1, n1, n2, root;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.bindChain();
                        attempt = this.attempt;
                        if (attempt) {
                            if (attempt.address.isNull()) {
                                throw new RPCError(errs.MISC_ERROR, 'No addresses available for coinbase.');
                            }
                            this.miner.updateTime(attempt);
                            if (++this.nonce2 === 0x100000000) {
                                this.nonce2 = 0;
                                this.nonce1++;
                            }
                            n1_1 = this.nonce1;
                            n2_1 = this.nonce2;
                            root_1 = attempt.getRoot(n1_1, n2_1);
                            this.merkleMap.set(root_1, [n1_1, n2_1]);
                            return [2 /*return*/, attempt];
                        }
                        if (this.miner.addresses.length === 0) {
                            throw new RPCError(errs.MISC_ERROR, 'No addresses available for coinbase.');
                        }
                        return [4 /*yield*/, this.miner.createBlock()];
                    case 1:
                        attempt = _a.sent();
                        n1 = this.nonce1;
                        n2 = this.nonce2;
                        root = attempt.getRoot(n1, n2);
                        this.attempt = attempt;
                        this.lastActivity = util.now();
                        this.merkleMap.set(root, [n1, n2]);
                        return [2 /*return*/, attempt];
                }
            });
        });
    };
    RPC.prototype.addBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var unlock1, unlock2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.locker.lock()];
                    case 1:
                        unlock1 = _a.sent();
                        return [4 /*yield*/, this.chain.locker.lock()];
                    case 2:
                        unlock2 = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, , 5, 6]);
                        return [4 /*yield*/, this._addBlock(block)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        unlock2();
                        unlock1();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype._addBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var prev, state, tx, input, entry, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.info('Handling submitted block: %h.', block.hash());
                        return [4 /*yield*/, this.chain.getEntry(block.prevBlock)];
                    case 1:
                        prev = _a.sent();
                        if (!prev) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.chain.getDeployments(block.time, prev)];
                    case 2:
                        state = _a.sent();
                        // Fix eloipool bug (witness nonce is not present).
                        if (state.hasWitness() && block.getCommitmentHash()) {
                            tx = block.txs[0];
                            input = tx.inputs[0];
                            if (!tx.hasWitness()) {
                                this.logger.warning('Submitted block had no witness nonce.');
                                this.logger.debug(tx);
                                // Recreate witness nonce (all zeroes).
                                input.witness.push(consensus.ZERO_HASH);
                                input.witness.compile();
                                tx.refresh();
                                block.refresh();
                            }
                        }
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.chain._add(block)];
                    case 4:
                        entry = _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _a.sent();
                        if (err_2.type === 'VerifyError') {
                            this.logger.warning('RPC block rejected: %h (%s).', block.hash(), err_2.reason);
                            return [2 /*return*/, "rejected: ".concat(err_2.reason)];
                        }
                        throw err_2;
                    case 6:
                        if (!entry) {
                            this.logger.warning('RPC block rejected: %h (bad-prevblk).', block.hash());
                            return [2 /*return*/, 'rejected: bad-prevblk'];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    };
    RPC.prototype.totalTX = function () {
        return this.mempool ? this.mempool.map.size : 0;
    };
    RPC.prototype.getSoftforks = function () {
        return [
            toDeployment('bip34', 2, this.chain.state.hasBIP34()),
            toDeployment('bip66', 3, this.chain.state.hasBIP66()),
            toDeployment('bip65', 4, this.chain.state.hasCLTV())
        ];
    };
    RPC.prototype.getBIP9Softforks = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tip, forks, _i, _a, deployment, state, status_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tip = this.chain.tip;
                        forks = {};
                        _i = 0, _a = this.network.deploys;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        deployment = _a[_i];
                        return [4 /*yield*/, this.chain.getState(tip, deployment)];
                    case 2:
                        state = _b.sent();
                        status_1 = void 0;
                        switch (state) {
                            case common.thresholdStates.DEFINED:
                                status_1 = 'defined';
                                break;
                            case common.thresholdStates.STARTED:
                                status_1 = 'started';
                                break;
                            case common.thresholdStates.LOCKED_IN:
                                status_1 = 'locked_in';
                                break;
                            case common.thresholdStates.ACTIVE:
                                status_1 = 'active';
                                break;
                            case common.thresholdStates.FAILED:
                                status_1 = 'failed';
                                break;
                            default:
                                assert(false, 'Bad state.');
                                break;
                        }
                        forks[deployment.name] = {
                            status: status_1,
                            bit: deployment.bit,
                            startTime: deployment.startTime,
                            timeout: deployment.timeout
                        };
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, forks];
                }
            });
        });
    };
    RPC.prototype.getHashRate = function (lookup, height) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, min, max, entry, i, diff, work;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tip = this.chain.tip;
                        if (!(height != null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.chain.getEntry(height)];
                    case 1:
                        tip = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!tip)
                            return [2 /*return*/, 0];
                        assert(typeof lookup === 'number');
                        assert(lookup >= 0);
                        if (lookup === 0)
                            lookup = tip.height % this.network.pow.retargetInterval + 1;
                        if (lookup > tip.height)
                            lookup = tip.height;
                        min = tip.time;
                        max = min;
                        entry = tip;
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < lookup)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.chain.getPrevious(entry)];
                    case 4:
                        entry = _a.sent();
                        if (!entry)
                            throw new RPCError(errs.DATABASE_ERROR, 'Not found.');
                        min = Math.min(entry.time, min);
                        max = Math.max(entry.time, max);
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        diff = max - min;
                        if (diff === 0)
                            return [2 /*return*/, 0];
                        work = tip.chainwork.sub(entry.chainwork);
                        return [2 /*return*/, Number(work.toString()) / diff];
                }
            });
        });
    };
    RPC.prototype.mineBlocks = function (blocks, addr, tries) {
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
                        return [4 /*yield*/, this._mineBlocks(blocks, addr, tries)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        unlock();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RPC.prototype._mineBlocks = function (blocks, addr, tries) {
        return __awaiter(this, void 0, void 0, function () {
            var hashes, i, block, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hashes = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < blocks)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.miner.mineBlock(null, addr)];
                    case 2:
                        block = _a.sent();
                        return [4 /*yield*/, this.chain.add(block)];
                    case 3:
                        entry = _a.sent();
                        assert(entry);
                        hashes.push(entry.rhash());
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, hashes];
                }
            });
        });
    };
    RPC.prototype.findFork = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!entry) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.chain.isMainChain(entry)];
                    case 1:
                        if (_a.sent())
                            return [2 /*return*/, entry];
                        return [4 /*yield*/, this.chain.getPrevious(entry)];
                    case 2:
                        entry = _a.sent();
                        return [3 /*break*/, 0];
                    case 3: throw new Error('Fork not found.');
                }
            });
        });
    };
    RPC.prototype.txToJSON = function (tx, entry) {
        var height = -1;
        var time = 0;
        var hash = null;
        var conf = 0;
        if (entry) {
            height = entry.height;
            time = entry.time;
            hash = entry.rhash();
            conf = this.chain.height - height + 1;
        }
        var vin = [];
        for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
            var input = _a[_i];
            var json = {
                coinbase: undefined,
                txid: undefined,
                scriptSig: undefined,
                txinwitness: undefined,
                sequence: input.sequence
            };
            if (tx.isCoinbase()) {
                json.coinbase = input.script.toJSON();
            }
            else {
                json.txid = input.prevout.txid();
                json.vout = input.prevout.index;
                json.scriptSig = {
                    asm: input.script.toASM(),
                    hex: input.script.toJSON()
                };
            }
            if (input.witness.items.length > 0) {
                json.txinwitness = input.witness.items.map(function (item) {
                    return item.toString('hex');
                });
            }
            vin.push(json);
        }
        var vout = [];
        for (var i = 0; i < tx.outputs.length; i++) {
            var output = tx.outputs[i];
            vout.push({
                value: Amount.btc(output.value, true),
                n: i,
                scriptPubKey: this.scriptToJSON(output.script, true)
            });
        }
        return {
            txid: tx.txid(),
            hash: tx.wtxid(),
            size: tx.getSize(),
            vsize: tx.getVirtualSize(),
            version: tx.version,
            locktime: tx.locktime,
            vin: vin,
            vout: vout,
            blockhash: hash,
            confirmations: conf,
            time: time,
            blocktime: time,
            hex: undefined
        };
    };
    RPC.prototype.scriptToJSON = function (script, hex) {
        var type = script.getType();
        var json = {
            asm: script.toASM(),
            hex: undefined,
            type: Script.typesByVal[type],
            reqSigs: 1,
            addresses: [],
            p2sh: undefined
        };
        if (hex)
            json.hex = script.toJSON();
        var m = script.getMultisig()[0];
        if (m !== -1)
            json.reqSigs = m;
        var addr = script.getAddress();
        if (addr) {
            var str = addr.toString(this.network);
            json.addresses.push(str);
        }
        return json;
    };
    RPC.prototype.headerToJSON = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var mtp, next, confirmations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.chain.getMedianTime(entry)];
                    case 1:
                        mtp = _a.sent();
                        return [4 /*yield*/, this.chain.getNextHash(entry.hash)];
                    case 2:
                        next = _a.sent();
                        confirmations = -1;
                        return [4 /*yield*/, this.chain.isMainChain(entry)];
                    case 3:
                        if (_a.sent())
                            confirmations = this.chain.height - entry.height + 1;
                        return [2 /*return*/, {
                                hash: entry.rhash(),
                                confirmations: confirmations,
                                height: entry.height,
                                version: entry.version,
                                versionHex: hex32(entry.version),
                                merkleroot: util.revHex(entry.merkleRoot),
                                time: entry.time,
                                mediantime: mtp,
                                nonce: entry.nonce,
                                bits: hex32(entry.bits),
                                difficulty: toDifficulty(entry.bits),
                                chainwork: entry.chainwork.toString('hex', 64),
                                previousblockhash: !entry.prevBlock.equals(consensus.ZERO_HASH)
                                    ? util.revHex(entry.prevBlock)
                                    : null,
                                nextblockhash: next ? util.revHex(next) : null
                            }];
                }
            });
        });
    };
    RPC.prototype.blockToJSON = function (entry, block, details) {
        return __awaiter(this, void 0, void 0, function () {
            var mtp, next, confirmations, txs, _i, _a, tx, json;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.chain.getMedianTime(entry)];
                    case 1:
                        mtp = _b.sent();
                        return [4 /*yield*/, this.chain.getNextHash(entry.hash)];
                    case 2:
                        next = _b.sent();
                        confirmations = -1;
                        return [4 /*yield*/, this.chain.isMainChain(entry)];
                    case 3:
                        if (_b.sent())
                            confirmations = this.chain.height - entry.height + 1;
                        txs = [];
                        for (_i = 0, _a = block.txs; _i < _a.length; _i++) {
                            tx = _a[_i];
                            if (details) {
                                json = this.txToJSON(tx, entry);
                                txs.push(json);
                                continue;
                            }
                            txs.push(tx.txid());
                        }
                        return [2 /*return*/, {
                                hash: entry.rhash(),
                                confirmations: confirmations,
                                strippedsize: block.getBaseSize(),
                                size: block.getSize(),
                                weight: block.getWeight(),
                                height: entry.height,
                                version: entry.version,
                                versionHex: hex32(entry.version),
                                merkleroot: util.revHex(entry.merkleRoot),
                                coinbase: block.txs[0].inputs[0].script.toJSON(),
                                tx: txs,
                                time: entry.time,
                                mediantime: mtp,
                                nonce: entry.nonce,
                                bits: hex32(entry.bits),
                                difficulty: toDifficulty(entry.bits),
                                chainwork: entry.chainwork.toString('hex', 64),
                                nTx: txs.length,
                                previousblockhash: !entry.prevBlock.equals(consensus.ZERO_HASH)
                                    ? util.revHex(entry.prevBlock)
                                    : null,
                                nextblockhash: next ? util.revHex(next) : null
                            }];
                }
            });
        });
    };
    RPC.prototype.entryToJSON = function (entry) {
        return {
            size: entry.size,
            fee: Amount.btc(entry.deltaFee, true),
            modifiedfee: 0,
            time: entry.time,
            height: entry.height,
            startingpriority: entry.priority,
            currentpriority: entry.getPriority(this.chain.height),
            descendantcount: this.mempool.countDescendants(entry),
            descendantsize: entry.descSize,
            descendantfees: entry.descFee,
            ancestorcount: this.mempool.countAncestors(entry),
            ancestorsize: 0,
            ancestorfees: 0,
            depends: this.mempool.getDepends(entry.tx).map(util.revHex)
        };
    };
    return RPC;
}(RPCBase));
/*
 * Helpers
 */
function swap32(data) {
    for (var i = 0; i < data.length; i += 4) {
        var field = data.readUInt32LE(i, true);
        data.writeUInt32BE(field, i, true);
    }
    return data;
}
function toDeployment(id, version, status) {
    return {
        id: id,
        version: version,
        reject: {
            status: status
        }
    };
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
function parseIP(addr, network) {
    try {
        return IP.fromHostname(addr, network.port);
    }
    catch (e) {
        throw new RPCError(errs.CLIENT_INVALID_IP_OR_SUBNET, 'Invalid IP address or subnet.');
    }
}
function parseNetAddress(addr, network) {
    try {
        return NetAddress.fromHostname(addr, network);
    }
    catch (e) {
        throw new RPCError(errs.CLIENT_INVALID_IP_OR_SUBNET, 'Invalid IP address or subnet.');
    }
}
function toDifficulty(bits) {
    var shift = (bits >>> 24) & 0xff;
    var diff = 0x0000ffff / (bits & 0x00ffffff);
    while (shift < 29) {
        diff *= 256.0;
        shift++;
    }
    while (shift > 29) {
        diff /= 256.0;
        shift--;
    }
    return diff;
}
function hex32(num) {
    assert(num >= 0);
    num = num.toString(16);
    assert(num.length <= 8);
    while (num.length < 8)
        num = '0' + num;
    return num;
}
/*
 * Expose
 */
module.exports = RPC;
