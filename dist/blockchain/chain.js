/*!
 * chain.js - blockchain management for bcoin
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
var AsyncEmitter = require('bevent');
var Logger = require('blgr');
var Lock = require('bmutex').Lock;
var LRU = require('blru');
var BufferMap = require('buffer-map').BufferMap;
var Network = require('../protocol/network');
var ChainDB = require('./chaindb');
var common = require('./common');
var consensus = require('../protocol/consensus');
var util = require('../utils/util');
var ChainEntry = require('./chainentry');
var CoinView = require('../coins/coinview');
var Script = require('../script/script');
var VerifyError = require('../protocol/errors').VerifyError;
var thresholdStates = common.thresholdStates;
/**
 * Blockchain
 * @alias module:blockchain.Chain
 * @property {ChainDB} db
 * @property {ChainEntry?} tip
 * @property {Number} height
 * @property {DeploymentState} state
 */
var Chain = /** @class */ (function (_super) {
    __extends(Chain, _super);
    /**
     * Create a blockchain.
     * @constructor
     * @param {Object} options
     */
    function Chain(options) {
        var _this = _super.call(this) || this;
        _this.opened = false;
        _this.options = new ChainOptions(options);
        _this.network = _this.options.network;
        _this.logger = _this.options.logger.context('chain');
        _this.blocks = _this.options.blocks;
        _this.workers = _this.options.workers;
        _this.db = new ChainDB(_this.options);
        _this.locker = new Lock(true, BufferMap);
        _this.invalid = new LRU(100, null, BufferMap);
        _this.state = new DeploymentState();
        _this.tip = new ChainEntry();
        _this.height = -1;
        _this.synced = false;
        _this.orphanMap = new BufferMap();
        _this.orphanPrev = new BufferMap();
        return _this;
    }
    /**
     * Open the chain, wait for the database to load.
     * @returns {Promise}
     */
    Chain.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tip, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        assert(!this.opened, 'Chain is already open.');
                        this.opened = true;
                        this.logger.info('Chain is loading.');
                        if (this.options.checkpoints)
                            this.logger.info('Checkpoints are enabled.');
                        if (this.options.bip91)
                            this.logger.warning('BIP91 enabled. Segsignal will be enforced.');
                        if (this.options.bip148)
                            this.logger.warning('BIP148 enabled. UASF will be enforced.');
                        return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getTip()];
                    case 2:
                        tip = _a.sent();
                        assert(tip);
                        this.tip = tip;
                        this.height = tip.height;
                        this.logger.info('Chain Height: %d', tip.height);
                        this.logger.memory();
                        return [4 /*yield*/, this.getDeploymentState()];
                    case 3:
                        state = _a.sent();
                        this.setDeploymentState(state);
                        this.logger.memory();
                        this.emit('tip', tip);
                        this.maybeSync();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close the chain, wait for the database to close.
     * @returns {Promise}
     */
    Chain.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                assert(this.opened, 'Chain is not open.');
                this.opened = false;
                return [2 /*return*/, this.db.close()];
            });
        });
    };
    /**
     * Perform all necessary contextual verification on a block.
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise} - Returns {@link ContextResult}.
     */
    Chain.prototype.verifyContext = function (block, prev, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var state, view_1, view_2, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verify(block, prev, flags)];
                    case 1:
                        state = _a.sent();
                        // Skip everything if we're in SPV mode.
                        if (this.options.spv) {
                            view_1 = new CoinView();
                            return [2 /*return*/, [view_1, state]];
                        }
                        if (!this.isHistorical(prev)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updateInputs(block, prev)];
                    case 2:
                        view_2 = _a.sent();
                        return [2 /*return*/, [view_2, state]];
                    case 3:
                        if (!!state.hasBIP34()) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.verifyDuplicates(block, prev)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.verifyInputs(block, prev, state)];
                    case 6:
                        view = _a.sent();
                        return [2 /*return*/, [view, state]];
                }
            });
        });
    };
    /**
     * Perform all necessary contextual verification
     * on a block, without POW check.
     * @param {Block} block
     * @returns {Promise}
     */
    Chain.prototype.verifyBlock = function (block) {
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
                        return [4 /*yield*/, this._verifyBlock(block)];
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
     * Perform all necessary contextual verification
     * on a block, without POW check (no lock).
     * @private
     * @param {Block} block
     * @returns {Promise}
     */
    Chain.prototype._verifyBlock = function (block) {
        return __awaiter(this, void 0, void 0, function () {
            var flags;
            return __generator(this, function (_a) {
                flags = common.flags.DEFAULT_FLAGS & ~common.flags.VERIFY_POW;
                return [2 /*return*/, this.verifyContext(block, this.tip, flags)];
            });
        });
    };
    /**
     * Test whether the hash is in the main chain.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.isMainHash = function (hash) {
        return this.db.isMainHash(hash);
    };
    /**
     * Test whether the entry is in the main chain.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.isMainChain = function (entry) {
        return this.db.isMainChain(entry);
    };
    /**
     * Get ancestor by `height`.
     * @param {ChainEntry} entry
     * @param {Number} height
     * @returns {Promise} - Returns ChainEntry.
     */
    Chain.prototype.getAncestor = function (entry, height) {
        return this.db.getAncestor(entry, height);
    };
    /**
     * Get previous entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    Chain.prototype.getPrevious = function (entry) {
        return this.db.getPrevious(entry);
    };
    /**
     * Get previous cached entry.
     * @param {ChainEntry} entry
     * @returns {ChainEntry|null}
     */
    Chain.prototype.getPrevCache = function (entry) {
        return this.db.getPrevCache(entry);
    };
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    Chain.prototype.getNext = function (entry) {
        return this.db.getNext(entry);
    };
    /**
     * Get next entry.
     * @param {ChainEntry} entry
     * @returns {Promise} - Returns ChainEntry.
     */
    Chain.prototype.getNextEntry = function (entry) {
        return this.db.getNextEntry(entry);
    };
    /**
     * Calculate median time past.
     * @param {ChainEntry} prev
     * @param {Number?} time
     * @returns {Promise} - Returns Number.
     */
    Chain.prototype.getMedianTime = function (prev, time) {
        return __awaiter(this, void 0, void 0, function () {
            var timespan, median, entry, i, cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timespan = consensus.MEDIAN_TIMESPAN;
                        median = [];
                        // In case we ever want to check
                        // the MTP of the _current_ block
                        // (necessary for BIP148).
                        if (time != null) {
                            median.push(time);
                            timespan -= 1;
                        }
                        entry = prev;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < timespan && entry)) return [3 /*break*/, 5];
                        median.push(entry.time);
                        cache = this.getPrevCache(entry);
                        if (!cache) return [3 /*break*/, 2];
                        entry = cache;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getPrevious(entry)];
                    case 3:
                        entry = _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5:
                        median.sort(cmp);
                        return [2 /*return*/, median[median.length >>> 1]];
                }
            });
        });
    };
    /**
     * Test whether the entry is potentially
     * an ancestor of a checkpoint.
     * @param {ChainEntry} prev
     * @returns {Boolean}
     */
    Chain.prototype.isHistorical = function (prev) {
        if (this.options.checkpoints) {
            if (prev.height + 1 <= this.network.lastCheckpoint)
                return true;
        }
        return false;
    };
    /**
     * Contextual verification for a block, including
     * version deployments (IsSuperMajority), versionbits,
     * coinbase height, finality checks.
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    Chain.prototype.verify = function (block, prev, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, root, _a, valid, reason, score, bits, mtp, height, state, segwit, time, _i, _b, tx, commit;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        assert(typeof flags === 'number');
                        // Extra sanity check.
                        if (!block.prevBlock.equals(prev.hash))
                            throw new VerifyError(block, 'invalid', 'bad-prevblk', 0);
                        hash = block.hash();
                        if (!this.verifyCheckpoint(prev, hash)) {
                            throw new VerifyError(block, 'checkpoint', 'checkpoint mismatch', 100);
                        }
                        // Skip everything when using checkpoints.
                        // We can do this safely because every
                        // block in between each checkpoint was
                        // validated outside in the header chain.
                        if (this.isHistorical(prev)) {
                            if (this.options.spv)
                                return [2 /*return*/, this.state];
                            // Check merkle root.
                            if (flags & common.flags.VERIFY_BODY) {
                                assert(typeof block.createMerkleRoot === 'function');
                                root = block.createMerkleRoot();
                                if (!root || !block.merkleRoot.equals(root)) {
                                    throw new VerifyError(block, 'invalid', 'bad-txnmrklroot', 100, true);
                                }
                                flags &= ~common.flags.VERIFY_BODY;
                            }
                            // Once segwit is active, we will still
                            // need to check for block mutability.
                            if (!block.hasWitness() && !block.getCommitmentHash())
                                return [2 /*return*/, new DeploymentState()];
                        }
                        // Non-contextual checks.
                        if (flags & common.flags.VERIFY_BODY) {
                            _a = block.checkBody(), valid = _a[0], reason = _a[1], score = _a[2];
                            if (!valid)
                                throw new VerifyError(block, 'invalid', reason, score, true);
                        }
                        return [4 /*yield*/, this.getTarget(block.time, prev)];
                    case 1:
                        bits = _c.sent();
                        if (block.bits !== bits) {
                            throw new VerifyError(block, 'invalid', 'bad-diffbits', 100);
                        }
                        // Skip all blocks in spv mode once
                        // we've verified the network target.
                        if (this.options.spv)
                            return [2 /*return*/, this.state];
                        return [4 /*yield*/, this.getMedianTime(prev)];
                    case 2:
                        mtp = _c.sent();
                        if (block.time <= mtp) {
                            throw new VerifyError(block, 'invalid', 'time-too-old', 0);
                        }
                        // Check timestamp against adj-time+2hours.
                        // If this fails we may be able to accept
                        // the block later.
                        if (block.time > this.network.now() + 2 * 60 * 60) {
                            throw new VerifyError(block, 'invalid', 'time-too-new', 0, true);
                        }
                        height = prev.height + 1;
                        // Only allow version 2 blocks (coinbase height)
                        // once the majority of blocks are using it.
                        if (block.version < 2 && height >= this.network.block.bip34height)
                            throw new VerifyError(block, 'obsolete', 'bad-version', 0);
                        // Only allow version 3 blocks (sig validation)
                        // once the majority of blocks are using it.
                        if (block.version < 3 && height >= this.network.block.bip66height)
                            throw new VerifyError(block, 'obsolete', 'bad-version', 0);
                        // Only allow version 4 blocks (checklocktimeverify)
                        // once the majority of blocks are using it.
                        if (block.version < 4 && height >= this.network.block.bip65height)
                            throw new VerifyError(block, 'obsolete', 'bad-version', 0);
                        return [4 /*yield*/, this.getDeployments(block.time, prev)];
                    case 3:
                        state = _c.sent();
                        // Enforce BIP91/BIP148.
                        if (state.hasBIP91() || state.hasBIP148()) {
                            segwit = this.network.deployments.segwit;
                            if (!consensus.hasBit(block.version, segwit.bit))
                                throw new VerifyError(block, 'invalid', 'bad-no-segwit', 0);
                        }
                        time = state.hasMTP() ? mtp : block.time;
                        // Transactions must be finalized with
                        // regards to nSequence and nLockTime.
                        for (_i = 0, _b = block.txs; _i < _b.length; _i++) {
                            tx = _b[_i];
                            if (!tx.isFinal(height, time)) {
                                throw new VerifyError(block, 'invalid', 'bad-txns-nonfinal', 10);
                            }
                        }
                        // Make sure the height contained
                        // in the coinbase is correct.
                        if (state.hasBIP34()) {
                            if (block.getCoinbaseHeight() !== height) {
                                throw new VerifyError(block, 'invalid', 'bad-cb-height', 100);
                            }
                        }
                        commit = null;
                        if (state.hasWitness()) {
                            commit = block.getCommitmentHash();
                            if (commit) {
                                // These are totally malleable. Someone
                                // may have even accidentally sent us
                                // the non-witness version of the block.
                                // We don't want to consider this block
                                // "invalid" if either of these checks
                                // fail.
                                if (!block.getWitnessNonce()) {
                                    throw new VerifyError(block, 'invalid', 'bad-witness-nonce-size', 100, true);
                                }
                                if (!commit.equals(block.createCommitmentHash())) {
                                    throw new VerifyError(block, 'invalid', 'bad-witness-merkle-match', 100, true);
                                }
                            }
                        }
                        // Blocks that do not commit to
                        // witness data cannot contain it.
                        if (!commit) {
                            if (block.hasWitness()) {
                                throw new VerifyError(block, 'invalid', 'unexpected-witness', 100, true);
                            }
                        }
                        // Check block weight (different from block size
                        // check in non-contextual verification).
                        if (block.getWeight() > consensus.MAX_BLOCK_WEIGHT) {
                            throw new VerifyError(block, 'invalid', 'bad-blk-weight', 100);
                        }
                        return [2 /*return*/, state];
                }
            });
        });
    };
    /**
     * Check all deployments on a chain, ranging from p2sh to segwit.
     * @param {Number} time
     * @param {ChainEntry} prev
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    Chain.prototype.getDeployments = function (time, prev) {
        return __awaiter(this, void 0, void 0, function () {
            var deployments, height, state, witness, mtp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deployments = this.network.deployments;
                        height = prev.height + 1;
                        state = new DeploymentState();
                        // For some reason bitcoind has p2sh in the
                        // mandatory flags by default, when in reality
                        // it wasn't activated until march 30th 2012.
                        // The first p2sh output and redeem script
                        // appeared on march 7th 2012, only it did
                        // not have a signature. See:
                        // 6a26d2ecb67f27d1fa5524763b49029d7106e91e3cc05743073461a719776192
                        // 9c08a4d78931342b37fd5f72900fb9983087e6f46c4a097d8a1f52c74e28eaf6
                        if (time >= consensus.BIP16_TIME)
                            state.flags |= Script.flags.VERIFY_P2SH;
                        // Coinbase heights are now enforced (bip34).
                        if (height >= this.network.block.bip34height)
                            state.bip34 = true;
                        // Signature validation is now enforced (bip66).
                        if (height >= this.network.block.bip66height)
                            state.flags |= Script.flags.VERIFY_DERSIG;
                        // CHECKLOCKTIMEVERIFY is now usable (bip65).
                        if (height >= this.network.block.bip65height)
                            state.flags |= Script.flags.VERIFY_CHECKLOCKTIMEVERIFY;
                        return [4 /*yield*/, this.isActive(prev, deployments.csv)];
                    case 1:
                        // CHECKSEQUENCEVERIFY and median time
                        // past locktimes are now usable (bip9 & bip113).
                        if (_a.sent()) {
                            state.flags |= Script.flags.VERIFY_CHECKSEQUENCEVERIFY;
                            state.lockFlags |= common.lockFlags.VERIFY_SEQUENCE;
                            state.lockFlags |= common.lockFlags.MEDIAN_TIME_PAST;
                        }
                        return [4 /*yield*/, this.getState(prev, deployments.segwit)];
                    case 2:
                        witness = _a.sent();
                        // Segregrated witness (bip141) is now usable
                        // along with SCRIPT_VERIFY_NULLDUMMY (bip147).
                        if (witness === thresholdStates.ACTIVE) {
                            state.flags |= Script.flags.VERIFY_WITNESS;
                            state.flags |= Script.flags.VERIFY_NULLDUMMY;
                        }
                        if (!this.options.bip91) return [3 /*break*/, 4];
                        if (!(witness === thresholdStates.STARTED)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.isActive(prev, deployments.segsignal)];
                    case 3:
                        if (_a.sent())
                            state.bip91 = true;
                        _a.label = 4;
                    case 4:
                        if (!(this.options.bip148 && this.network === Network.main)) return [3 /*break*/, 6];
                        if (!(witness !== thresholdStates.LOCKED_IN
                            && witness !== thresholdStates.ACTIVE)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getMedianTime(prev, time)];
                    case 5:
                        mtp = _a.sent();
                        if (mtp >= 1501545600 && mtp <= 1510704000)
                            state.bip148 = true;
                        _a.label = 6;
                    case 6: return [2 /*return*/, state];
                }
            });
        });
    };
    /**
     * Set a new deployment state.
     * @param {DeploymentState} state
     */
    Chain.prototype.setDeploymentState = function (state) {
        if (this.options.checkpoints && this.height < this.network.lastCheckpoint) {
            this.state = state;
            return;
        }
        if (!this.state.hasP2SH() && state.hasP2SH())
            this.logger.warning('P2SH has been activated.');
        if (!this.state.hasBIP34() && state.hasBIP34())
            this.logger.warning('BIP34 has been activated.');
        if (!this.state.hasBIP66() && state.hasBIP66())
            this.logger.warning('BIP66 has been activated.');
        if (!this.state.hasCLTV() && state.hasCLTV())
            this.logger.warning('BIP65 has been activated.');
        if (!this.state.hasCSV() && state.hasCSV())
            this.logger.warning('CSV has been activated.');
        if (!this.state.hasWitness() && state.hasWitness())
            this.logger.warning('Segwit has been activated.');
        if (!this.state.hasBIP91() && state.hasBIP91())
            this.logger.warning('BIP91 has been activated.');
        if (!this.state.hasBIP148() && state.hasBIP148())
            this.logger.warning('BIP148 has been activated.');
        this.state = state;
    };
    /**
     * Determine whether to check block for duplicate txids in blockchain
     * history (BIP30). If we're on a chain that has bip34 activated, we
     * can skip this.
     * @private
     * @see https://github.com/bitcoin/bips/blob/master/bip-0030.mediawiki
     * @param {Block} block
     * @param {ChainEntry} prev
     * @returns {Promise}
     */
    Chain.prototype.verifyDuplicates = function (block, prev) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, tx, height, hash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = block.txs;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        tx = _a[_i];
                        return [4 /*yield*/, this.hasCoins(tx)];
                    case 2:
                        if (!(_b.sent()))
                            return [3 /*break*/, 3];
                        height = prev.height + 1;
                        hash = this.network.bip30[height];
                        // Blocks 91842 and 91880 created duplicate
                        // txids by using the same exact output script
                        // and extraNonce.
                        if (!hash || !block.hash().equals(hash))
                            throw new VerifyError(block, 'invalid', 'bad-txns-BIP30', 100);
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
     * Spend and update inputs (checkpoints only).
     * @private
     * @param {Block} block
     * @param {ChainEntry} prev
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Chain.prototype.updateInputs = function (block, prev) {
        return __awaiter(this, void 0, void 0, function () {
            var view, height, cb, i, tx, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        height = prev.height + 1;
                        cb = block.txs[0];
                        view.addTX(cb, height);
                        i = 1;
                        _b.label = 1;
                    case 1:
                        if (!(i < block.txs.length)) return [3 /*break*/, 4];
                        tx = block.txs[i];
                        _a = assert;
                        return [4 /*yield*/, view.spendInputs(this.db, tx)];
                    case 2:
                        _a.apply(void 0, [_b.sent(), 'BUG: Spent inputs in historical data!']);
                        view.addTX(tx, height);
                        _b.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Check block transactions for all things pertaining
     * to inputs. This function is important because it is
     * what actually fills the coins into the block. This
     * function will check the block reward, the sigops,
     * the tx values, and execute and verify the scripts (it
     * will attempt to do this on the worker pool). If
     * `checkpoints` is enabled, it will skip verification
     * for historical data.
     * @private
     * @see TX#verifyInputs
     * @see TX#verify
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {DeploymentState} state
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Chain.prototype.verifyInputs = function (block, prev, state) {
        return __awaiter(this, void 0, void 0, function () {
            var view, height, interval, sigops, reward, i, tx, valid, _a, fee, reason, score, jobs, i, tx, results, _i, results_1, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = new CoinView();
                        height = prev.height + 1;
                        interval = this.network.halvingInterval;
                        sigops = 0;
                        reward = 0;
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < block.txs.length)) return [3 /*break*/, 7];
                        tx = block.txs[i];
                        if (!(i > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, view.spendInputs(this.db, tx)];
                    case 2:
                        if (!(_b.sent())) {
                            throw new VerifyError(block, 'invalid', 'bad-txns-inputs-missingorspent', 100);
                        }
                        _b.label = 3;
                    case 3:
                        if (!(i > 0 && tx.version >= 2)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.verifyLocks(prev, tx, view, state.lockFlags)];
                    case 4:
                        valid = _b.sent();
                        if (!valid) {
                            throw new VerifyError(block, 'invalid', 'bad-txns-nonfinal', 100);
                        }
                        _b.label = 5;
                    case 5:
                        // Count sigops (legacy + scripthash? + witness?)
                        sigops += tx.getSigopsCost(view, state.flags);
                        if (sigops > consensus.MAX_BLOCK_SIGOPS_COST) {
                            throw new VerifyError(block, 'invalid', 'bad-blk-sigops', 100);
                        }
                        // Contextual sanity checks.
                        if (i > 0) {
                            _a = tx.checkInputs(view, height), fee = _a[0], reason = _a[1], score = _a[2];
                            if (fee === -1) {
                                throw new VerifyError(block, 'invalid', reason, score);
                            }
                            reward += fee;
                            if (reward > consensus.MAX_MONEY) {
                                throw new VerifyError(block, 'invalid', 'bad-txns-accumulated-fee-outofrange', 100);
                            }
                        }
                        // Add new coins.
                        view.addTX(tx, height);
                        _b.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // Make sure the miner isn't trying to conjure more coins.
                        reward += consensus.getReward(height, interval);
                        if (block.getClaimed() > reward) {
                            throw new VerifyError(block, 'invalid', 'bad-cb-amount', 100);
                        }
                        jobs = [];
                        for (i = 1; i < block.txs.length; i++) {
                            tx = block.txs[i];
                            jobs.push(tx.verifyAsync(view, state.flags, this.workers));
                        }
                        return [4 /*yield*/, Promise.all(jobs)];
                    case 8:
                        results = _b.sent();
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            if (!result) {
                                throw new VerifyError(block, 'invalid', 'mandatory-script-verify-flag-failed', 100);
                            }
                        }
                        return [2 /*return*/, view];
                }
            });
        });
    };
    /**
     * Find the block at which a fork occurred.
     * @private
     * @param {ChainEntry} fork - The current chain.
     * @param {ChainEntry} longer - The competing chain.
     * @returns {Promise}
     */
    Chain.prototype.findFork = function (fork, longer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!fork.hash.equals(longer.hash)) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        if (!(longer.height > fork.height)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getPrevious(longer)];
                    case 2:
                        longer = _a.sent();
                        if (!longer)
                            throw new Error('No previous entry for new tip.');
                        return [3 /*break*/, 1];
                    case 3:
                        if (fork.hash.equals(longer.hash))
                            return [2 /*return*/, fork];
                        return [4 /*yield*/, this.getPrevious(fork)];
                    case 4:
                        fork = _a.sent();
                        if (!fork)
                            throw new Error('No previous entry for old tip.');
                        return [3 /*break*/, 0];
                    case 5: return [2 /*return*/, fork];
                }
            });
        });
    };
    /**
     * Reorganize the blockchain (connect and disconnect inputs).
     * Called when a competing chain with a higher chainwork
     * is received.
     * @private
     * @param {ChainEntry} competitor - The competing chain's tip.
     * @returns {Promise}
     */
    Chain.prototype.reorganize = function (competitor) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, fork, disconnect, entry, connect, i, entry_1, i, entry_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tip = this.tip;
                        return [4 /*yield*/, this.findFork(tip, competitor)];
                    case 1:
                        fork = _a.sent();
                        assert(fork, 'No free space or data corruption.');
                        disconnect = [];
                        entry = tip;
                        _a.label = 2;
                    case 2:
                        if (!!entry.hash.equals(fork.hash)) return [3 /*break*/, 4];
                        disconnect.push(entry);
                        return [4 /*yield*/, this.getPrevious(entry)];
                    case 3:
                        entry = _a.sent();
                        assert(entry);
                        return [3 /*break*/, 2];
                    case 4:
                        connect = [];
                        entry = competitor;
                        _a.label = 5;
                    case 5:
                        if (!!entry.hash.equals(fork.hash)) return [3 /*break*/, 7];
                        connect.push(entry);
                        return [4 /*yield*/, this.getPrevious(entry)];
                    case 6:
                        entry = _a.sent();
                        assert(entry);
                        return [3 /*break*/, 5];
                    case 7:
                        i = 0;
                        _a.label = 8;
                    case 8:
                        if (!(i < disconnect.length)) return [3 /*break*/, 11];
                        entry_1 = disconnect[i];
                        return [4 /*yield*/, this.disconnect(entry_1)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 8];
                    case 11:
                        i = connect.length - 1;
                        _a.label = 12;
                    case 12:
                        if (!(i >= 1)) return [3 /*break*/, 15];
                        entry_2 = connect[i];
                        return [4 /*yield*/, this.reconnect(entry_2)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        i--;
                        return [3 /*break*/, 12];
                    case 15:
                        this.logger.warning('Chain reorganization: old=%h(%d) new=%h(%d)', tip.hash, tip.height, competitor.hash, competitor.height);
                        return [4 /*yield*/, this.emitAsync('reorganize', tip, competitor)];
                    case 16:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reorganize the blockchain for SPV. This
     * will reset the chain to the fork block.
     * @private
     * @param {ChainEntry} competitor - The competing chain's tip.
     * @returns {Promise}
     */
    Chain.prototype.reorganizeSPV = function (competitor) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, fork, disconnect, entry, _i, disconnect_1, entry_3, headers, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tip = this.tip;
                        return [4 /*yield*/, this.findFork(tip, competitor)];
                    case 1:
                        fork = _a.sent();
                        assert(fork, 'No free space or data corruption.');
                        disconnect = [];
                        entry = tip;
                        _a.label = 2;
                    case 2:
                        if (!!entry.hash.equals(fork.hash)) return [3 /*break*/, 4];
                        disconnect.push(entry);
                        return [4 /*yield*/, this.getPrevious(entry)];
                    case 3:
                        entry = _a.sent();
                        assert(entry);
                        return [3 /*break*/, 2];
                    case 4: 
                    // Reset the main chain back
                    // to the fork block, causing
                    // us to redownload the blocks
                    // on the new main chain.
                    return [4 /*yield*/, this._reset(fork.hash, true)];
                    case 5:
                        // Reset the main chain back
                        // to the fork block, causing
                        // us to redownload the blocks
                        // on the new main chain.
                        _a.sent();
                        _i = 0, disconnect_1 = disconnect;
                        _a.label = 6;
                    case 6:
                        if (!(_i < disconnect_1.length)) return [3 /*break*/, 9];
                        entry_3 = disconnect_1[_i];
                        headers = entry_3.toHeaders();
                        view = new CoinView();
                        return [4 /*yield*/, this.emitAsync('disconnect', entry_3, headers, view)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 6];
                    case 9:
                        this.logger.warning('SPV reorganization: old=%h(%d) new=%h(%d)', tip.hash, tip.height, competitor.hash, competitor.height);
                        this.logger.warning('Chain replay from height %d necessary.', fork.height);
                        return [2 /*return*/, this.emitAsync('reorganize', tip, competitor)];
                }
            });
        });
    };
    /**
     * Disconnect an entry from the chain (updates the tip).
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    Chain.prototype.disconnect = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var block, prev, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBlock(entry.hash)];
                    case 1:
                        block = _a.sent();
                        if (!block) {
                            if (!this.options.spv)
                                throw new Error('Block not found.');
                            block = entry.toHeaders();
                        }
                        return [4 /*yield*/, this.getPrevious(entry)];
                    case 2:
                        prev = _a.sent();
                        return [4 /*yield*/, this.db.disconnect(entry, block)];
                    case 3:
                        view = _a.sent();
                        assert(prev);
                        this.tip = prev;
                        this.height = prev.height;
                        this.emit('tip', prev);
                        return [2 /*return*/, this.emitAsync('disconnect', entry, block, view)];
                }
            });
        });
    };
    /**
     * Reconnect an entry to the chain (updates the tip).
     * This will do contextual-verification on the block
     * (necessary because we cannot validate the inputs
     * in alternate chains when they come in).
     * @param {ChainEntry} entry
     * @param {Number} flags
     * @returns {Promise}
     */
    Chain.prototype.reconnect = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var flags, block, prev, view, state, err_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        flags = common.flags.VERIFY_NONE;
                        return [4 /*yield*/, this.getBlock(entry.hash)];
                    case 1:
                        block = _b.sent();
                        if (!block) {
                            if (!this.options.spv)
                                throw new Error('Block not found.');
                            block = entry.toHeaders();
                        }
                        return [4 /*yield*/, this.getPrevious(entry)];
                    case 2:
                        prev = _b.sent();
                        assert(prev);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.verifyContext(block, prev, flags)];
                    case 4:
                        _a = _b.sent(), view = _a[0], state = _a[1];
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _b.sent();
                        if (err_1.type === 'VerifyError') {
                            if (!err_1.malleated)
                                this.setInvalid(entry.hash);
                            this.logger.warning('Tried to reconnect invalid block: %h (%d).', entry.hash, entry.height);
                        }
                        throw err_1;
                    case 6: return [4 /*yield*/, this.db.reconnect(entry, block, view)];
                    case 7:
                        _b.sent();
                        this.tip = entry;
                        this.height = entry.height;
                        this.setDeploymentState(state);
                        this.emit('tip', entry);
                        this.emit('reconnect', entry, block);
                        return [2 /*return*/, this.emitAsync('connect', entry, block, view)];
                }
            });
        });
    };
    /**
     * Set the best chain. This is called on every valid block
     * that comes in. It may add and connect the block (main chain),
     * save the block without connection (alternate chain), or
     * reorganize the chain (a higher fork).
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise}
     */
    Chain.prototype.setBestChain = function (entry, block, prev, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var view, state, err_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!entry.prevBlock.equals(this.tip.hash)) return [3 /*break*/, 2];
                        this.logger.warning('WARNING: Reorganizing chain.');
                        // In spv-mode, we reset the
                        // chain and redownload the blocks.
                        if (this.options.spv)
                            return [2 /*return*/, this.reorganizeSPV(entry)];
                        return [4 /*yield*/, this.reorganize(entry)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.verifyContext(block, prev, flags)];
                    case 3:
                        _a = _b.sent(), view = _a[0], state = _a[1];
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _b.sent();
                        if (err_2.type === 'VerifyError') {
                            if (!err_2.malleated)
                                this.setInvalid(entry.hash);
                            this.logger.warning('Tried to connect invalid block: %h (%d).', entry.hash, entry.height);
                        }
                        throw err_2;
                    case 5: 
                    // Save block and connect inputs.
                    return [4 /*yield*/, this.db.save(entry, block, view)];
                    case 6:
                        // Save block and connect inputs.
                        _b.sent();
                        // Expose the new state.
                        this.tip = entry;
                        this.height = entry.height;
                        this.setDeploymentState(state);
                        this.emit('tip', entry);
                        this.emit('block', block, entry);
                        return [2 /*return*/, this.emitAsync('connect', entry, block, view)];
                }
            });
        });
    };
    /**
     * Save block on an alternate chain.
     * @private
     * @param {ChainEntry} entry
     * @param {Block} block
     * @param {ChainEntry} prev
     * @param {Number} flags
     * @returns {Promise}
     */
    Chain.prototype.saveAlternate = function (entry, block, prev, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Do not accept forked chain older than the
                        // last checkpoint.
                        if (this.options.checkpoints) {
                            if (prev.height + 1 < this.network.lastCheckpoint)
                                throw new VerifyError(block, 'checkpoint', 'bad-fork-prior-to-checkpoint', 100);
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        // Do as much verification
                        // as we can before saving.
                        return [4 /*yield*/, this.verify(block, prev, flags)];
                    case 2:
                        // Do as much verification
                        // as we can before saving.
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        if (err_3.type === 'VerifyError') {
                            if (!err_3.malleated)
                                this.setInvalid(entry.hash);
                            this.logger.warning('Invalid block on alternate chain: %h (%d).', entry.hash, entry.height);
                        }
                        throw err_3;
                    case 4: return [4 /*yield*/, this.db.save(entry, block)];
                    case 5:
                        _a.sent();
                        this.logger.warning('Heads up: Competing chain at height %d:'
                            + ' tip-height=%d competitor-height=%d'
                            + ' tip-hash=%h competitor-hash=%h'
                            + ' tip-chainwork=%s competitor-chainwork=%s'
                            + ' chainwork-diff=%s', entry.height, this.tip.height, entry.height, this.tip.hash, entry.hash, this.tip.chainwork.toString(), entry.chainwork.toString(), this.tip.chainwork.sub(entry.chainwork).toString());
                        // Emit as a "competitor" block.
                        this.emit('competitor', block, entry);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset the chain to the desired block. This
     * is useful for replaying the blockchain download
     * for SPV.
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    Chain.prototype.reset = function (block) {
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
                        return [4 /*yield*/, this._reset(block, false)];
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
     * Reset the chain to the desired block without a lock.
     * @private
     * @param {Hash|Number} block
     * @returns {Promise}
     */
    Chain.prototype._reset = function (block, silent) {
        return __awaiter(this, void 0, void 0, function () {
            var tip, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.reset(block)];
                    case 1:
                        tip = _a.sent();
                        // Reset state.
                        this.tip = tip;
                        this.height = tip.height;
                        this.synced = false;
                        return [4 /*yield*/, this.getDeploymentState()];
                    case 2:
                        state = _a.sent();
                        this.setDeploymentState(state);
                        this.emit('tip', tip);
                        if (!!silent) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.emitAsync('reset', tip)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Reset the orphan map completely. There may
                        // have been some orphans on a forked chain we
                        // no longer need.
                        this.purgeOrphans();
                        this.maybeSync();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reset the chain to a height or hash. Useful for replaying
     * the blockchain download for SPV.
     * @param {Hash|Number} block - hash/height
     * @returns {Promise}
     */
    Chain.prototype.replay = function (block) {
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
                        return [4 /*yield*/, this._replay(block, true)];
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
     * Reset the chain without a lock.
     * @private
     * @param {Hash|Number} block - hash/height
     * @param {Boolean?} silent
     * @returns {Promise}
     */
    Chain.prototype._replay = function (block, silent) {
        return __awaiter(this, void 0, void 0, function () {
            var entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getEntry(block)];
                    case 1:
                        entry = _a.sent();
                        if (!entry)
                            throw new Error('Block not found.');
                        return [4 /*yield*/, this.isMainChain(entry)];
                    case 2:
                        if (!(_a.sent()))
                            throw new Error('Cannot reset on alternate chain.');
                        if (!entry.isGenesis()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._reset(entry.hash, silent)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this._reset(entry.prevBlock, silent)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Invalidate block.
     * @param {Hash} hash
     * @returns {Promise}
     */
    Chain.prototype.invalidate = function (hash) {
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
                        return [4 /*yield*/, this._invalidate(hash)];
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
     * Invalidate block (no lock).
     * @param {Hash} hash
     * @returns {Promise}
     */
    Chain.prototype._invalidate = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._replay(hash, false)];
                    case 1:
                        _a.sent();
                        this.setInvalid(hash);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Retroactively prune the database.
     * @returns {Promise}
     */
    Chain.prototype.prune = function () {
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
                        return [4 /*yield*/, this.db.prune()];
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
     * Scan the blockchain for transactions containing specified address hashes.
     * @param {Hash} start - Block hash to start at.
     * @param {Bloom} filter - Bloom filter containing tx and address hashes.
     * @param {Function} iter - Iterator.
     * @returns {Promise}
     */
    Chain.prototype.scan = function (start, filter, iter) {
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
                        return [4 /*yield*/, this.db.scan(start, filter, iter)];
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
     * Add a block to the chain, perform all necessary verification.
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     * @returns {Promise}
     */
    Chain.prototype.add = function (block, flags, id) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, unlock;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        return [4 /*yield*/, this.locker.lock(hash)];
                    case 1:
                        unlock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 4, 5]);
                        return [4 /*yield*/, this._add(block, flags, id)];
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
     * Add a block to the chain without a lock.
     * @private
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     * @returns {Promise}
     */
    Chain.prototype._add = function (block, flags, id) {
        return __awaiter(this, void 0, void 0, function () {
            var hash, prev, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        hash = block.hash();
                        if (flags == null)
                            flags = common.flags.DEFAULT_FLAGS;
                        if (id == null)
                            id = -1;
                        // Special case for genesis block.
                        if (hash.equals(this.network.genesis.hash)) {
                            this.logger.debug('Saw genesis block: %h.', block.hash());
                            throw new VerifyError(block, 'duplicate', 'duplicate', 0);
                        }
                        // Do we already have this block in the queue?
                        if (this.hasPending(hash)) {
                            this.logger.debug('Already have pending block: %h.', block.hash());
                            throw new VerifyError(block, 'duplicate', 'duplicate', 0);
                        }
                        // If the block is already known to be
                        // an orphan, ignore it.
                        if (this.hasOrphan(hash)) {
                            this.logger.debug('Already have orphan block: %h.', block.hash());
                            throw new VerifyError(block, 'duplicate', 'duplicate', 0);
                        }
                        // Do not revalidate known invalid blocks.
                        if (this.hasInvalid(block)) {
                            this.logger.debug('Invalid ancestors for block: %h.', block.hash());
                            throw new VerifyError(block, 'duplicate', 'duplicate', 100);
                        }
                        // Check the POW before doing anything.
                        if (flags & common.flags.VERIFY_POW) {
                            if (!block.verifyPOW())
                                throw new VerifyError(block, 'invalid', 'high-hash', 50);
                        }
                        return [4 /*yield*/, this.hasEntry(hash)];
                    case 1:
                        // Do we already have this block?
                        if (_a.sent()) {
                            this.logger.debug('Already have block: %h.', block.hash());
                            throw new VerifyError(block, 'duplicate', 'duplicate', 0);
                        }
                        return [4 /*yield*/, this.getEntry(block.prevBlock)];
                    case 2:
                        prev = _a.sent();
                        // If previous block wasn't ever seen,
                        // add it current to orphans and return.
                        if (!prev) {
                            this.storeOrphan(block, flags, id);
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, this.connect(prev, block, flags)];
                    case 3:
                        entry = _a.sent();
                        if (!this.hasNextOrphan(hash)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.handleOrphans(entry)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Connect block to chain.
     * @private
     * @param {ChainEntry} prev
     * @param {Block} block
     * @param {Number} flags
     * @returns {Promise}
     */
    Chain.prototype.connect = function (prev, block, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var start, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        start = util.bench();
                        // Sanity check.
                        assert(block.prevBlock.equals(prev.hash));
                        // Explanation: we try to keep as much data
                        // off the javascript heap as possible. Blocks
                        // in the future may be 8mb or 20mb, who knows.
                        // In fullnode-mode we store the blocks in
                        // "compact" form (the headers plus the raw
                        // Buffer object) until they're ready to be
                        // fully validated here. They are deserialized,
                        // validated, and connected. Hopefully the
                        // deserialized blocks get cleaned up by the
                        // GC quickly.
                        if (block.isMemory()) {
                            try {
                                block = block.toBlock();
                            }
                            catch (e) {
                                this.logger.error(e);
                                throw new VerifyError(block, 'malformed', 'error parsing message', 10, true);
                            }
                        }
                        entry = ChainEntry.fromBlock(block, prev);
                        if (!entry.chainwork.lte(this.tip.chainwork)) return [3 /*break*/, 2];
                        // Save block to an alternate chain.
                        return [4 /*yield*/, this.saveAlternate(entry, block, prev, flags)];
                    case 1:
                        // Save block to an alternate chain.
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: 
                    // Attempt to add block to the chain index.
                    return [4 /*yield*/, this.setBestChain(entry, block, prev, flags)];
                    case 3:
                        // Attempt to add block to the chain index.
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        // Keep track of stats.
                        this.logStatus(start, block, entry);
                        // Check sync state.
                        this.maybeSync();
                        return [2 /*return*/, entry];
                }
            });
        });
    };
    /**
     * Handle orphans.
     * @private
     * @param {ChainEntry} entry
     * @returns {Promise}
     */
    Chain.prototype.handleOrphans = function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var orphan, block, flags, id, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orphan = this.resolveOrphan(entry.hash);
                        _a.label = 1;
                    case 1:
                        if (!orphan) return [3 /*break*/, 6];
                        block = orphan.block, flags = orphan.flags, id = orphan.id;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.connect(entry, block, flags)];
                    case 3:
                        entry = _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _a.sent();
                        if (err_4.type === 'VerifyError') {
                            this.logger.warning('Could not resolve orphan block %h: %s.', block.hash(), err_4.message);
                            this.emit('bad orphan', err_4, id);
                            return [3 /*break*/, 6];
                        }
                        throw err_4;
                    case 5:
                        this.logger.debug('Orphan block was resolved: %h (%d).', block.hash(), entry.height);
                        this.emit('resolved', block, entry);
                        orphan = this.resolveOrphan(entry.hash);
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Test whether the chain has reached its slow height.
     * @private
     * @returns {Boolean}
     */
    Chain.prototype.isSlow = function () {
        if (this.options.spv)
            return false;
        if (this.synced)
            return true;
        if (this.height === 1 || this.height % 20 === 0)
            return true;
        if (this.height >= this.network.block.slowHeight)
            return true;
        return false;
    };
    /**
     * Calculate the time difference from
     * start time and log block.
     * @private
     * @param {Array} start
     * @param {Block} block
     * @param {ChainEntry} entry
     */
    Chain.prototype.logStatus = function (start, block, entry) {
        if (!this.isSlow())
            return;
        // Report memory for debugging.
        this.logger.memory();
        var elapsed = util.bench(start);
        this.logger.info('Block %h (%d) added to chain (size=%d txs=%d time=%d).', entry.hash, entry.height, block.getSize(), block.txs.length, elapsed);
    };
    /**
     * Verify a block hash and height against the checkpoints.
     * @private
     * @param {ChainEntry} prev
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Chain.prototype.verifyCheckpoint = function (prev, hash) {
        if (!this.options.checkpoints)
            return true;
        var height = prev.height + 1;
        var checkpoint = this.network.checkpointMap[height];
        if (!checkpoint)
            return true;
        if (hash.equals(checkpoint)) {
            this.logger.debug('Hit checkpoint block %h (%d).', hash, height);
            this.emit('checkpoint', hash, height);
            return true;
        }
        // Someone is either mining on top of
        // an old block for no reason, or the
        // consensus protocol is broken and
        // there was a 20k+ block reorg.
        this.logger.warning('Checkpoint mismatch at height %d: expected=%h received=%h', height, checkpoint, hash);
        this.purgeOrphans();
        return false;
    };
    /**
     * Store an orphan.
     * @private
     * @param {Block} block
     * @param {Number?} flags
     * @param {Number?} id
     */
    Chain.prototype.storeOrphan = function (block, flags, id) {
        var height = block.getCoinbaseHeight();
        var orphan = this.orphanPrev.get(block.prevBlock);
        // The orphan chain forked.
        if (orphan) {
            assert(!orphan.block.hash().equals(block.hash()));
            assert(orphan.block.prevBlock.equals(block.prevBlock));
            this.logger.warning('Removing forked orphan block: %h (%d).', orphan.block.hash(), height);
            this.removeOrphan(orphan);
        }
        this.limitOrphans();
        this.addOrphan(new Orphan(block, flags, id));
        this.logger.debug('Storing orphan block: %h (%d).', block.hash(), height);
        this.emit('orphan', block);
    };
    /**
     * Add an orphan.
     * @private
     * @param {Orphan} orphan
     * @returns {Orphan}
     */
    Chain.prototype.addOrphan = function (orphan) {
        var block = orphan.block;
        var hash = block.hash();
        assert(!this.orphanMap.has(hash));
        assert(!this.orphanPrev.has(block.prevBlock));
        assert(this.orphanMap.size >= 0);
        this.orphanMap.set(hash, orphan);
        this.orphanPrev.set(block.prevBlock, orphan);
        return orphan;
    };
    /**
     * Remove an orphan.
     * @private
     * @param {Orphan} orphan
     * @returns {Orphan}
     */
    Chain.prototype.removeOrphan = function (orphan) {
        var block = orphan.block;
        var hash = block.hash();
        assert(this.orphanMap.has(hash));
        assert(this.orphanPrev.has(block.prevBlock));
        assert(this.orphanMap.size > 0);
        this.orphanMap["delete"](hash);
        this.orphanPrev["delete"](block.prevBlock);
        return orphan;
    };
    /**
     * Test whether a hash would resolve the next orphan.
     * @private
     * @param {Hash} hash - Previous block hash.
     * @returns {Boolean}
     */
    Chain.prototype.hasNextOrphan = function (hash) {
        return this.orphanPrev.has(hash);
    };
    /**
     * Resolve an orphan.
     * @private
     * @param {Hash} hash - Previous block hash.
     * @returns {Orphan}
     */
    Chain.prototype.resolveOrphan = function (hash) {
        var orphan = this.orphanPrev.get(hash);
        if (!orphan)
            return null;
        return this.removeOrphan(orphan);
    };
    /**
     * Purge any waiting orphans.
     */
    Chain.prototype.purgeOrphans = function () {
        var count = this.orphanMap.size;
        if (count === 0)
            return;
        this.orphanMap.clear();
        this.orphanPrev.clear();
        this.logger.debug('Purged %d orphans.', count);
    };
    /**
     * Prune orphans, only keep the orphan with the highest
     * coinbase height (likely to be the peer's tip).
     */
    Chain.prototype.limitOrphans = function () {
        var now = util.now();
        var oldest = null;
        for (var _i = 0, _a = this.orphanMap.values(); _i < _a.length; _i++) {
            var orphan = _a[_i];
            if (now < orphan.time + 60 * 60) {
                if (!oldest || orphan.time < oldest.time)
                    oldest = orphan;
                continue;
            }
            this.removeOrphan(orphan);
        }
        if (this.orphanMap.size < this.options.maxOrphans)
            return;
        if (!oldest)
            return;
        this.removeOrphan(oldest);
    };
    /**
     * Test whether an invalid block hash has been seen.
     * @private
     * @param {Block} block
     * @returns {Boolean}
     */
    Chain.prototype.hasInvalid = function (block) {
        var hash = block.hash();
        if (this.invalid.has(hash))
            return true;
        if (this.invalid.has(block.prevBlock)) {
            this.setInvalid(hash);
            return true;
        }
        return false;
    };
    /**
     * Mark a block as invalid.
     * @private
     * @param {Hash} hash
     */
    Chain.prototype.setInvalid = function (hash) {
        this.invalid.set(hash, true);
    };
    /**
     * Forget an invalid block hash.
     * @private
     * @param {Hash} hash
     */
    Chain.prototype.removeInvalid = function (hash) {
        this.invalid.remove(hash);
    };
    /**
     * Test the chain to see if it contains
     * a block, or has recently seen a block.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.has = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.hasOrphan(hash))
                    return [2 /*return*/, true];
                if (this.locker.has(hash))
                    return [2 /*return*/, true];
                if (this.invalid.has(hash))
                    return [2 /*return*/, true];
                return [2 /*return*/, this.hasEntry(hash)];
            });
        });
    };
    /**
     * Find the corresponding block entry by hash or height.
     * @param {Hash|Number} hash/height
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    Chain.prototype.getEntry = function (hash) {
        return this.db.getEntry(hash);
    };
    /**
     * Retrieve a chain entry by height.
     * @param {Number} height
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    Chain.prototype.getEntryByHeight = function (height) {
        return this.db.getEntryByHeight(height);
    };
    /**
     * Retrieve a chain entry by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link ChainEntry}.
     */
    Chain.prototype.getEntryByHash = function (hash) {
        return this.db.getEntryByHash(hash);
    };
    /**
     * Get the hash of a block by height. Note that this
     * will only return hashes in the main chain.
     * @param {Number} height
     * @returns {Promise} - Returns {@link Hash}.
     */
    Chain.prototype.getHash = function (height) {
        return this.db.getHash(height);
    };
    /**
     * Get the height of a block by hash.
     * @param {Hash} hash
     * @returns {Promise} - Returns Number.
     */
    Chain.prototype.getHeight = function (hash) {
        return this.db.getHeight(hash);
    };
    /**
     * Test the chain to see if it contains a block.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.hasEntry = function (hash) {
        return this.db.hasEntry(hash);
    };
    /**
     * Get the _next_ block hash (does not work by height).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Hash}.
     */
    Chain.prototype.getNextHash = function (hash) {
        return this.db.getNextHash(hash);
    };
    /**
     * Check whether coins are still unspent. Necessary for bip30.
     * @see https://bitcointalk.org/index.php?topic=67738.0
     * @param {TX} tx
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.hasCoins = function (tx) {
        return this.db.hasCoins(tx);
    };
    /**
     * Get all tip hashes.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    Chain.prototype.getTips = function () {
        return this.db.getTips();
    };
    /**
     * Get range of hashes.
     * @param {Number} [start=-1]
     * @param {Number} [end=-1]
     * @returns {Promise}
     */
    Chain.prototype.getHashes = function (start, end) {
        if (start === void 0) { start = -1; }
        if (end === void 0) { end = -1; }
        return this.db.getHashes(start, end);
    };
    /**
     * Get a coin (unspents only).
     * @private
     * @param {Outpoint} prevout
     * @returns {Promise} - Returns {@link CoinEntry}.
     */
    Chain.prototype.readCoin = function (prevout) {
        return this.db.readCoin(prevout);
    };
    /**
     * Get a coin (unspents only).
     * @param {Hash} hash
     * @param {Number} index
     * @returns {Promise} - Returns {@link Coin}.
     */
    Chain.prototype.getCoin = function (hash, index) {
        return this.db.getCoin(hash, index);
    };
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    Chain.prototype.getBlock = function (hash) {
        return this.db.getBlock(hash);
    };
    /**
     * Retrieve a block from the database (not filled with coins).
     * @param {Hash} hash
     * @returns {Promise} - Returns {@link Block}.
     */
    Chain.prototype.getRawBlock = function (block) {
        return this.db.getRawBlock(block);
    };
    /**
     * Get a historical block coin viewpoint.
     * @param {Block} hash
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Chain.prototype.getBlockView = function (block) {
        return this.db.getBlockView(block);
    };
    /**
     * Get an orphan block.
     * @param {Hash} hash
     * @returns {Block}
     */
    Chain.prototype.getOrphan = function (hash) {
        return this.orphanMap.get(hash) || null;
    };
    /**
     * Test the chain to see if it contains an orphan.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.hasOrphan = function (hash) {
        return this.orphanMap.has(hash);
    };
    /**
     * Test the chain to see if it contains a pending block in its queue.
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.hasPending = function (hash) {
        return this.locker.pending(hash);
    };
    /**
     * Get coin viewpoint.
     * @param {TX} tx
     * @returns {Promise} - Returns {@link CoinView}.
     */
    Chain.prototype.getCoinView = function (tx) {
        return this.db.getCoinView(tx);
    };
    /**
     * Test the chain to see if it is synced.
     * @returns {Boolean}
     */
    Chain.prototype.isFull = function () {
        return this.synced;
    };
    /**
     * Potentially emit a `full` event.
     * @private
     */
    Chain.prototype.maybeSync = function () {
        if (this.synced)
            return;
        if (this.options.checkpoints) {
            if (this.height < this.network.lastCheckpoint)
                return;
        }
        if (this.tip.time < util.now() - this.network.block.maxTipAge)
            return;
        if (!this.hasChainwork())
            return;
        this.synced = true;
        this.emit('full');
    };
    /**
     * Test the chain to see if it has the
     * minimum required chainwork for the
     * network.
     * @returns {Boolean}
     */
    Chain.prototype.hasChainwork = function () {
        return this.tip.chainwork.gte(this.network.pow.chainwork);
    };
    /**
     * Get the fill percentage.
     * @returns {Number} percent - Ranges from 0.0 to 1.0.
     */
    Chain.prototype.getProgress = function () {
        var start = this.network.genesis.time;
        var current = this.tip.time - start;
        var end = util.now() - start - 40 * 60;
        return Math.min(1, current / end);
    };
    /**
     * Calculate chain locator (an array of hashes).
     * @param {Hash?} start - Height or hash to treat as the tip.
     * The current tip will be used if not present. Note that this can be a
     * non-existent hash, which is useful for headers-first locators.
     * @returns {Promise} - Returns {@link Hash}[].
     */
    Chain.prototype.getLocator = function (start) {
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
                        return [4 /*yield*/, this._getLocator(start)];
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
     * Calculate chain locator without a lock.
     * @private
     * @param {Hash?} start
     * @returns {Promise}
     */
    Chain.prototype._getLocator = function (start) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, hashes, main, hash, height, step, ancestor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (start == null)
                            start = this.tip.hash;
                        assert(Buffer.isBuffer(start));
                        return [4 /*yield*/, this.getEntry(start)];
                    case 1:
                        entry = _a.sent();
                        hashes = [];
                        if (!entry) {
                            entry = this.tip;
                            hashes.push(start);
                        }
                        return [4 /*yield*/, this.isMainChain(entry)];
                    case 2:
                        main = _a.sent();
                        hash = entry.hash;
                        height = entry.height;
                        step = 1;
                        hashes.push(hash);
                        _a.label = 3;
                    case 3:
                        if (!(height > 0)) return [3 /*break*/, 9];
                        height -= step;
                        if (height < 0)
                            height = 0;
                        if (hashes.length > 10)
                            step *= 2;
                        if (!main) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getHash(height)];
                    case 4:
                        // If we're on the main chain, we can
                        // do a fast lookup of the hash.
                        hash = _a.sent();
                        assert(hash);
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, this.getAncestor(entry, height)];
                    case 6:
                        ancestor = _a.sent();
                        assert(ancestor);
                        return [4 /*yield*/, this.isMainChain(ancestor)];
                    case 7:
                        main = _a.sent();
                        hash = ancestor.hash;
                        _a.label = 8;
                    case 8:
                        hashes.push(hash);
                        return [3 /*break*/, 3];
                    case 9: return [2 /*return*/, hashes];
                }
            });
        });
    };
    /**
     * Calculate the orphan root of the hash (if it is an orphan).
     * @param {Hash} hash
     * @returns {Hash}
     */
    Chain.prototype.getOrphanRoot = function (hash) {
        var root = null;
        assert(hash);
        for (;;) {
            var orphan = this.orphanMap.get(hash);
            if (!orphan)
                break;
            root = hash;
            hash = orphan.block.prevBlock;
        }
        return root;
    };
    /**
     * Calculate the time difference (in seconds)
     * between two blocks by examining chainworks.
     * @param {ChainEntry} to
     * @param {ChainEntry} from
     * @returns {Number}
     */
    Chain.prototype.getProofTime = function (to, from) {
        var pow = this.network.pow;
        var sign, work;
        if (to.chainwork.gt(from.chainwork)) {
            work = to.chainwork.sub(from.chainwork);
            sign = 1;
        }
        else {
            work = from.chainwork.sub(to.chainwork);
            sign = -1;
        }
        work = work.imuln(pow.targetSpacing);
        work = work.div(this.tip.getProof());
        if (work.bitLength() > 53)
            return sign * Number.MAX_SAFE_INTEGER;
        return sign * work.toNumber();
    };
    /**
     * Calculate the next target based on the chain tip.
     * @returns {Promise} - returns Number
     * (target is in compact/mantissa form).
     */
    Chain.prototype.getCurrentTarget = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getTarget(this.network.now(), this.tip)];
            });
        });
    };
    /**
     * Calculate the next target.
     * @param {Number} time - Next block timestamp.
     * @param {ChainEntry} prev - Previous entry.
     * @returns {Promise} - returns Number
     * (target is in compact/mantissa form).
     */
    Chain.prototype.getTarget = function (time, prev) {
        return __awaiter(this, void 0, void 0, function () {
            var pow, cache, height, first;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pow = this.network.pow;
                        // Genesis
                        if (!prev) {
                            assert(time === this.network.genesis.time);
                            return [2 /*return*/, pow.bits];
                        }
                        if (!((prev.height + 1) % pow.retargetInterval !== 0)) return [3 /*break*/, 6];
                        if (!pow.targetReset) return [3 /*break*/, 5];
                        // Special behavior for testnet:
                        if (time > prev.time + pow.targetSpacing * 2)
                            return [2 /*return*/, pow.bits];
                        _a.label = 1;
                    case 1:
                        if (!(prev.height !== 0
                            && prev.height % pow.retargetInterval !== 0
                            && prev.bits === pow.bits)) return [3 /*break*/, 5];
                        cache = this.getPrevCache(prev);
                        if (!cache) return [3 /*break*/, 2];
                        prev = cache;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getPrevious(prev)];
                    case 3:
                        prev = _a.sent();
                        _a.label = 4;
                    case 4:
                        assert(prev);
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, prev.bits];
                    case 6:
                        height = prev.height - (pow.retargetInterval - 1);
                        assert(height >= 0);
                        return [4 /*yield*/, this.getAncestor(prev, height)];
                    case 7:
                        first = _a.sent();
                        assert(first);
                        return [2 /*return*/, this.retarget(prev, first)];
                }
            });
        });
    };
    /**
     * Retarget. This is called when the chain height
     * hits a retarget diff interval.
     * @param {ChainEntry} prev - Previous entry.
     * @param {ChainEntry} first - Chain entry from 2 weeks prior.
     * @returns {Number} target - Target in compact/mantissa form.
     */
    Chain.prototype.retarget = function (prev, first) {
        var pow = this.network.pow;
        var targetTimespan = pow.targetTimespan;
        if (pow.noRetargeting)
            return prev.bits;
        var target = consensus.fromCompact(prev.bits);
        var actualTimespan = prev.time - first.time;
        if (actualTimespan < targetTimespan / 4 | 0)
            actualTimespan = targetTimespan / 4 | 0;
        if (actualTimespan > targetTimespan * 4)
            actualTimespan = targetTimespan * 4;
        target.imuln(actualTimespan);
        target.idivn(targetTimespan);
        if (target.gt(pow.limit))
            return pow.bits;
        return consensus.toCompact(target);
    };
    /**
     * Find a locator. Analagous to bitcoind's `FindForkInGlobalIndex()`.
     * @param {Hash[]} locator - Hashes.
     * @returns {Promise} - Returns {@link Hash} (the
     * hash of the latest known block).
     */
    Chain.prototype.findLocator = function (locator) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, locator_1, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, locator_1 = locator;
                        _a.label = 1;
                    case 1:
                        if (!(_i < locator_1.length)) return [3 /*break*/, 4];
                        hash = locator_1[_i];
                        return [4 /*yield*/, this.isMainHash(hash)];
                    case 2:
                        if (_a.sent())
                            return [2 /*return*/, hash];
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, this.network.genesis.hash];
                }
            });
        });
    };
    /**
     * Check whether a versionbits deployment is active (BIP9: versionbits).
     * @example
     * await chain.isActive(tip, deployments.segwit);
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {String} id - Deployment id.
     * @returns {Promise} - Returns Number.
     */
    Chain.prototype.isActive = function (prev, deployment) {
        return __awaiter(this, void 0, void 0, function () {
            var state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getState(prev, deployment)];
                    case 1:
                        state = _a.sent();
                        return [2 /*return*/, state === thresholdStates.ACTIVE];
                }
            });
        });
    };
    /**
     * Get chain entry state for a deployment (BIP9: versionbits).
     * @example
     * await chain.getState(tip, deployments.segwit);
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {String} id - Deployment id.
     * @returns {Promise} - Returns Number.
     */
    Chain.prototype.getState = function (prev, deployment) {
        return __awaiter(this, void 0, void 0, function () {
            var bit, window, threshold, height, entry, state, compute, cached, time, height, entry_4, _a, time, time, block, count, i;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        bit = deployment.bit;
                        if (deployment.startTime === -1)
                            return [2 /*return*/, thresholdStates.ACTIVE];
                        window = this.network.minerWindow;
                        threshold = this.network.activationThreshold;
                        if (deployment.threshold !== -1)
                            threshold = deployment.threshold;
                        if (deployment.window !== -1)
                            window = deployment.window;
                        if (!(((prev.height + 1) % window) !== 0)) return [3 /*break*/, 2];
                        height = prev.height - ((prev.height + 1) % window);
                        return [4 /*yield*/, this.getAncestor(prev, height)];
                    case 1:
                        prev = _b.sent();
                        if (!prev)
                            return [2 /*return*/, thresholdStates.DEFINED];
                        assert(prev.height === height);
                        assert(((prev.height + 1) % window) === 0);
                        _b.label = 2;
                    case 2:
                        entry = prev;
                        state = thresholdStates.DEFINED;
                        compute = [];
                        _b.label = 3;
                    case 3:
                        if (!entry) return [3 /*break*/, 6];
                        cached = this.db.stateCache.get(bit, entry);
                        if (cached !== -1) {
                            state = cached;
                            return [3 /*break*/, 6];
                        }
                        return [4 /*yield*/, this.getMedianTime(entry)];
                    case 4:
                        time = _b.sent();
                        if (time < deployment.startTime) {
                            state = thresholdStates.DEFINED;
                            this.db.stateCache.set(bit, entry, state);
                            return [3 /*break*/, 6];
                        }
                        compute.push(entry);
                        height = entry.height - window;
                        return [4 /*yield*/, this.getAncestor(entry, height)];
                    case 5:
                        entry = _b.sent();
                        return [3 /*break*/, 3];
                    case 6:
                        if (!compute.length) return [3 /*break*/, 19];
                        entry_4 = compute.pop();
                        _a = state;
                        switch (_a) {
                            case thresholdStates.DEFINED: return [3 /*break*/, 7];
                            case thresholdStates.STARTED: return [3 /*break*/, 9];
                            case thresholdStates.LOCKED_IN: return [3 /*break*/, 15];
                            case thresholdStates.FAILED: return [3 /*break*/, 16];
                            case thresholdStates.ACTIVE: return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 17];
                    case 7: return [4 /*yield*/, this.getMedianTime(entry_4)];
                    case 8:
                        time = _b.sent();
                        if (time >= deployment.timeout) {
                            state = thresholdStates.FAILED;
                            return [3 /*break*/, 18];
                        }
                        if (time >= deployment.startTime) {
                            state = thresholdStates.STARTED;
                            return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 18];
                    case 9: return [4 /*yield*/, this.getMedianTime(entry_4)];
                    case 10:
                        time = _b.sent();
                        if (time >= deployment.timeout) {
                            state = thresholdStates.FAILED;
                            return [3 /*break*/, 18];
                        }
                        block = entry_4;
                        count = 0;
                        i = 0;
                        _b.label = 11;
                    case 11:
                        if (!(i < window)) return [3 /*break*/, 14];
                        if (block.hasBit(bit))
                            count++;
                        if (count >= threshold) {
                            state = thresholdStates.LOCKED_IN;
                            return [3 /*break*/, 14];
                        }
                        return [4 /*yield*/, this.getPrevious(block)];
                    case 12:
                        block = _b.sent();
                        assert(block);
                        _b.label = 13;
                    case 13:
                        i++;
                        return [3 /*break*/, 11];
                    case 14: return [3 /*break*/, 18];
                    case 15:
                        {
                            state = thresholdStates.ACTIVE;
                            return [3 /*break*/, 18];
                        }
                        _b.label = 16;
                    case 16:
                        {
                            return [3 /*break*/, 18];
                        }
                        _b.label = 17;
                    case 17:
                        {
                            assert(false, 'Bad state.');
                            return [3 /*break*/, 18];
                        }
                        _b.label = 18;
                    case 18:
                        this.db.stateCache.set(bit, entry_4, state);
                        return [3 /*break*/, 6];
                    case 19: return [2 /*return*/, state];
                }
            });
        });
    };
    /**
     * Compute the version for a new block (BIP9: versionbits).
     * @see https://github.com/bitcoin/bips/blob/master/bip-0009.mediawiki
     * @param {ChainEntry} prev - Previous chain entry (usually the tip).
     * @returns {Promise} - Returns Number.
     */
    Chain.prototype.computeBlockVersion = function (prev) {
        return __awaiter(this, void 0, void 0, function () {
            var version, _i, _a, deployment, state;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        version = 0;
                        _i = 0, _a = this.network.deploys;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        deployment = _a[_i];
                        return [4 /*yield*/, this.getState(prev, deployment)];
                    case 2:
                        state = _b.sent();
                        if (state === thresholdStates.LOCKED_IN
                            || state === thresholdStates.STARTED) {
                            version |= 1 << deployment.bit;
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        version |= consensus.VERSION_TOP_BITS;
                        version >>>= 0;
                        return [2 /*return*/, version];
                }
            });
        });
    };
    /**
     * Get the current deployment state of the chain. Called on load.
     * @private
     * @returns {Promise} - Returns {@link DeploymentState}.
     */
    Chain.prototype.getDeploymentState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var prev;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getPrevious(this.tip)];
                    case 1:
                        prev = _a.sent();
                        if (!prev) {
                            assert(this.tip.isGenesis());
                            return [2 /*return*/, this.state];
                        }
                        if (this.options.spv)
                            return [2 /*return*/, this.state];
                        return [2 /*return*/, this.getDeployments(this.tip.time, prev)];
                }
            });
        });
    };
    /**
     * Check transaction finality, taking into account MEDIAN_TIME_PAST
     * if it is present in the lock flags.
     * @param {ChainEntry} prev - Previous chain entry.
     * @param {TX} tx
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.verifyFinal = function (prev, tx, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var height, time;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        height = prev.height + 1;
                        // We can skip MTP if the locktime is height.
                        if (tx.locktime < consensus.LOCKTIME_THRESHOLD)
                            return [2 /*return*/, tx.isFinal(height, -1)];
                        if (!(flags & common.lockFlags.MEDIAN_TIME_PAST)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getMedianTime(prev)];
                    case 1:
                        time = _a.sent();
                        return [2 /*return*/, tx.isFinal(height, time)];
                    case 2: return [2 /*return*/, tx.isFinal(height, this.network.now())];
                }
            });
        });
    };
    /**
     * Get the necessary minimum time and height sequence locks for a transaction.
     * @param {ChainEntry} prev
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise}
     */
    Chain.prototype.getLocks = function (prev, tx, view, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var GRANULARITY, DISABLE_FLAG, TYPE_FLAG, MASK, minHeight, minTime, _i, _a, _b, prevout, sequence, height, entry, time;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        GRANULARITY = consensus.SEQUENCE_GRANULARITY;
                        DISABLE_FLAG = consensus.SEQUENCE_DISABLE_FLAG;
                        TYPE_FLAG = consensus.SEQUENCE_TYPE_FLAG;
                        MASK = consensus.SEQUENCE_MASK;
                        if (!(flags & common.lockFlags.VERIFY_SEQUENCE))
                            return [2 /*return*/, [-1, -1]];
                        if (tx.isCoinbase() || tx.version < 2)
                            return [2 /*return*/, [-1, -1]];
                        minHeight = -1;
                        minTime = -1;
                        _i = 0, _a = tx.inputs;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], prevout = _b.prevout, sequence = _b.sequence;
                        if (sequence & DISABLE_FLAG)
                            return [3 /*break*/, 4];
                        height = view.getHeight(prevout);
                        if (height === -1)
                            height = this.height + 1;
                        if (!(sequence & TYPE_FLAG)) {
                            height += (sequence & MASK) - 1;
                            minHeight = Math.max(minHeight, height);
                            return [3 /*break*/, 4];
                        }
                        height = Math.max(height - 1, 0);
                        return [4 /*yield*/, this.getAncestor(prev, height)];
                    case 2:
                        entry = _c.sent();
                        assert(entry, 'Database is corrupt.');
                        return [4 /*yield*/, this.getMedianTime(entry)];
                    case 3:
                        time = _c.sent();
                        time += ((sequence & MASK) << GRANULARITY) - 1;
                        minTime = Math.max(minTime, time);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, [minHeight, minTime]];
                }
            });
        });
    };
    /**
     * Verify sequence locks.
     * @param {ChainEntry} prev
     * @param {TX} tx
     * @param {CoinView} view
     * @param {LockFlags} flags
     * @returns {Promise} - Returns Boolean.
     */
    Chain.prototype.verifyLocks = function (prev, tx, view, flags) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, height, time, mtp;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getLocks(prev, tx, view, flags)];
                    case 1:
                        _a = _b.sent(), height = _a[0], time = _a[1];
                        if (height !== -1) {
                            if (height >= prev.height + 1)
                                return [2 /*return*/, false];
                        }
                        if (!(time !== -1)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getMedianTime(prev)];
                    case 2:
                        mtp = _b.sent();
                        if (time >= mtp)
                            return [2 /*return*/, false];
                        _b.label = 3;
                    case 3: return [2 /*return*/, true];
                }
            });
        });
    };
    return Chain;
}(AsyncEmitter));
/**
 * ChainOptions
 * @alias module:blockchain.ChainOptions
 */
var ChainOptions = /** @class */ (function () {
    /**
     * Create chain options.
     * @constructor
     * @param {Object} options
     */
    function ChainOptions(options) {
        this.network = Network.primary;
        this.logger = Logger.global;
        this.blocks = null;
        this.workers = null;
        this.prefix = null;
        this.location = null;
        this.memory = true;
        this.maxFiles = 64;
        this.cacheSize = 32 << 20;
        this.compression = true;
        this.spv = false;
        this.bip91 = false;
        this.bip148 = false;
        this.prune = false;
        this.forceFlags = false;
        this.entryCache = 5000;
        this.maxOrphans = 20;
        this.checkpoints = true;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {ChainOptions}
     */
    ChainOptions.prototype.fromOptions = function (options) {
        if (!options.spv) {
            assert(options.blocks && typeof options.blocks === 'object', 'Chain requires a blockstore.');
        }
        this.blocks = options.blocks;
        if (options.network != null)
            this.network = Network.get(options.network);
        if (options.logger != null) {
            assert(typeof options.logger === 'object');
            this.logger = options.logger;
        }
        if (options.workers != null) {
            assert(typeof options.workers === 'object');
            this.workers = options.workers;
        }
        if (options.spv != null) {
            assert(typeof options.spv === 'boolean');
            this.spv = options.spv;
        }
        if (options.prefix != null) {
            assert(typeof options.prefix === 'string');
            this.prefix = options.prefix;
            this.location = this.spv
                ? path.join(this.prefix, 'spvchain')
                : path.join(this.prefix, 'chain');
        }
        if (options.location != null) {
            assert(typeof options.location === 'string');
            this.location = options.location;
        }
        if (options.memory != null) {
            assert(typeof options.memory === 'boolean');
            this.memory = options.memory;
        }
        if (options.maxFiles != null) {
            assert((options.maxFiles >>> 0) === options.maxFiles);
            this.maxFiles = options.maxFiles;
        }
        if (options.cacheSize != null) {
            assert(Number.isSafeInteger(options.cacheSize));
            assert(options.cacheSize >= 0);
            this.cacheSize = options.cacheSize;
        }
        if (options.compression != null) {
            assert(typeof options.compression === 'boolean');
            this.compression = options.compression;
        }
        if (options.prune != null) {
            assert(typeof options.prune === 'boolean');
            this.prune = options.prune;
        }
        if (options.forceFlags != null) {
            assert(typeof options.forceFlags === 'boolean');
            this.forceFlags = options.forceFlags;
        }
        if (options.bip91 != null) {
            assert(typeof options.bip91 === 'boolean');
            this.bip91 = options.bip91;
        }
        if (options.bip148 != null) {
            assert(typeof options.bip148 === 'boolean');
            this.bip148 = options.bip148;
        }
        if (options.entryCache != null) {
            assert((options.entryCache >>> 0) === options.entryCache);
            this.entryCache = options.entryCache;
        }
        if (options.maxOrphans != null) {
            assert((options.maxOrphans >>> 0) === options.maxOrphans);
            this.maxOrphans = options.maxOrphans;
        }
        if (options.checkpoints != null) {
            assert(typeof options.checkpoints === 'boolean');
            this.checkpoints = options.checkpoints;
        }
        return this;
    };
    /**
     * Instantiate chain options from object.
     * @param {Object} options
     * @returns {ChainOptions}
     */
    ChainOptions.fromOptions = function (options) {
        return new ChainOptions().fromOptions(options);
    };
    return ChainOptions;
}());
/**
 * Deployment State
 * @alias module:blockchain.DeploymentState
 * @property {VerifyFlags} flags
 * @property {LockFlags} lockFlags
 * @property {Boolean} bip34
 */
var DeploymentState = /** @class */ (function () {
    /**
     * Create a deployment state.
     * @constructor
     */
    function DeploymentState() {
        this.flags = Script.flags.MANDATORY_VERIFY_FLAGS;
        this.flags &= ~Script.flags.VERIFY_P2SH;
        this.lockFlags = common.lockFlags.MANDATORY_LOCKTIME_FLAGS;
        this.bip34 = false;
        this.bip91 = false;
        this.bip148 = false;
    }
    /**
     * Test whether p2sh is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasP2SH = function () {
        return (this.flags & Script.flags.VERIFY_P2SH) !== 0;
    };
    /**
     * Test whether bip34 (coinbase height) is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasBIP34 = function () {
        return this.bip34;
    };
    /**
     * Test whether bip66 (VERIFY_DERSIG) is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasBIP66 = function () {
        return (this.flags & Script.flags.VERIFY_DERSIG) !== 0;
    };
    /**
     * Test whether cltv is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasCLTV = function () {
        return (this.flags & Script.flags.VERIFY_CHECKLOCKTIMEVERIFY) !== 0;
    };
    /**
     * Test whether median time past locktime is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasMTP = function () {
        return (this.lockFlags & common.lockFlags.MEDIAN_TIME_PAST) !== 0;
    };
    /**
     * Test whether csv is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasCSV = function () {
        return (this.flags & Script.flags.VERIFY_CHECKSEQUENCEVERIFY) !== 0;
    };
    /**
     * Test whether segwit is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasWitness = function () {
        return (this.flags & Script.flags.VERIFY_WITNESS) !== 0;
    };
    /**
     * Test whether bip91 is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasBIP91 = function () {
        return this.bip91;
    };
    /**
     * Test whether bip148 is active.
     * @returns {Boolean}
     */
    DeploymentState.prototype.hasBIP148 = function () {
        return this.bip148;
    };
    return DeploymentState;
}());
/**
 * Orphan
 * @ignore
 */
var Orphan = /** @class */ (function () {
    /**
     * Create an orphan.
     * @constructor
     */
    function Orphan(block, flags, id) {
        this.block = block;
        this.flags = flags;
        this.id = id;
        this.time = util.now();
    }
    return Orphan;
}());
/*
 * Helpers
 */
function cmp(a, b) {
    return a - b;
}
/*
 * Expose
 */
module.exports = Chain;
