/*!
 * block.js - block object for bcoin
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
var assert = require('bsert');
var bio = require('bufio');
var BufferSet = require('buffer-map').BufferSet;
var hash256 = require('bcrypto/lib/hash256');
var merkle = require('bcrypto/lib/merkle');
var consensus = require('../protocol/consensus');
var AbstractBlock = require('./abstractblock');
var TX = require('./tx');
var MerkleBlock = require('./merkleblock');
var Headers = require('./headers');
var Network = require('../protocol/network');
var util = require('../utils/util');
var encoding = bio.encoding;
var inspectSymbol = require('../utils').inspectSymbol;
var opcodes = require('../script/common').opcodes;
var BasicFilter = require('../golomb/basicFilter');
/**
 * Block
 * Represents a full block.
 * @alias module:primitives.Block
 * @extends AbstractBlock
 */
var Block = /** @class */ (function (_super) {
    __extends(Block, _super);
    /**
     * Create a block.
     * @constructor
     * @param {Object} options
     */
    function Block(options) {
        var _this = _super.call(this) || this;
        _this.txs = [];
        _this._raw = null;
        _this._size = -1;
        _this._witness = -1;
        if (options)
            _this.fromOptions(options);
        return _this;
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Block.prototype.fromOptions = function (options) {
        this.parseOptions(options);
        if (options.txs) {
            assert(Array.isArray(options.txs));
            for (var _i = 0, _a = options.txs; _i < _a.length; _i++) {
                var tx = _a[_i];
                assert(tx instanceof TX);
                this.txs.push(tx);
            }
        }
        return this;
    };
    /**
     * Instantiate block from options.
     * @param {Object} options
     * @returns {Block}
     */
    Block.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Clear any cached values.
     * @param {Boolean?} all - Clear transactions.
     */
    Block.prototype.refresh = function (all) {
        this._refresh();
        this._raw = null;
        this._size = -1;
        this._witness = -1;
        if (!all)
            return this;
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            tx.refresh();
        }
        return this;
    };
    /**
     * Serialize the block. Include witnesses if present.
     * @returns {Buffer}
     */
    Block.prototype.toRaw = function () {
        return this.frame().data;
    };
    /**
     * Check if block has been serialized.
     * @returns {Buffer}
     */
    Block.prototype.hasRaw = function () {
        return Boolean(this._raw);
    };
    /**
     * Serialize the block, do not include witnesses.
     * @returns {Buffer}
     */
    Block.prototype.toNormal = function () {
        if (this.hasWitness())
            return this.frameNormal().data;
        return this.toRaw();
    };
    /**
     * Serialize the block. Include witnesses if present.
     * @param {BufferWriter} bw
     */
    Block.prototype.toWriter = function (bw) {
        if (this.mutable)
            return this.writeWitness(bw);
        var raw = this.frame();
        bw.writeBytes(raw.data);
        return bw;
    };
    /**
     * Serialize the block, do not include witnesses.
     * @param {BufferWriter} bw
     */
    Block.prototype.toNormalWriter = function (bw) {
        if (this.hasWitness()) {
            this.writeNormal(bw);
            return bw;
        }
        return this.toWriter(bw);
    };
    /**
     * Get the raw block serialization.
     * Include witnesses if present.
     * @private
     * @returns {RawBlock}
     */
    Block.prototype.frame = function () {
        if (this.mutable) {
            assert(!this._raw);
            return this.frameWitness();
        }
        if (this._raw) {
            assert(this._size >= 0);
            assert(this._witness >= 0);
            var raw_1 = new RawBlock(this._size, this._witness);
            raw_1.data = this._raw;
            return raw_1;
        }
        var raw = this.frameWitness();
        this._raw = raw.data;
        this._size = raw.size;
        this._witness = raw.witness;
        return raw;
    };
    /**
     * Calculate real size and size of the witness bytes.
     * @returns {Object} Contains `size` and `witness`.
     */
    Block.prototype.getSizes = function () {
        if (this.mutable)
            return this.getWitnessSizes();
        return this.frame();
    };
    /**
     * Calculate virtual block size.
     * @returns {Number} Virtual size.
     */
    Block.prototype.getVirtualSize = function () {
        var scale = consensus.WITNESS_SCALE_FACTOR;
        return (this.getWeight() + scale - 1) / scale | 0;
    };
    /**
     * Calculate block weight.
     * @returns {Number} weight
     */
    Block.prototype.getWeight = function () {
        var raw = this.getSizes();
        var base = raw.size - raw.witness;
        return base * (consensus.WITNESS_SCALE_FACTOR - 1) + raw.size;
    };
    /**
     * Get real block size.
     * @returns {Number} size
     */
    Block.prototype.getSize = function () {
        return this.getSizes().size;
    };
    /**
     * Get base block size (without witness).
     * @returns {Number} size
     */
    Block.prototype.getBaseSize = function () {
        var raw = this.getSizes();
        return raw.size - raw.witness;
    };
    /**
     * Test whether the block contains a
     * transaction with a non-empty witness.
     * @returns {Boolean}
     */
    Block.prototype.hasWitness = function () {
        if (this._witness !== -1)
            return this._witness !== 0;
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            if (tx.hasWitness())
                return true;
        }
        return false;
    };
    /**
     * Test the block's transaction vector against a hash.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    Block.prototype.hasTX = function (hash) {
        return this.indexOf(hash) !== -1;
    };
    /**
     * Find the index of a transaction in the block.
     * @param {Hash} hash
     * @returns {Number} index (-1 if not present).
     */
    Block.prototype.indexOf = function (hash) {
        for (var i = 0; i < this.txs.length; i++) {
            var tx = this.txs[i];
            if (tx.hash().equals(hash))
                return i;
        }
        return -1;
    };
    /**
     * Calculate merkle root. Returns null
     * if merkle tree has been malleated.
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Hash|null}
     */
    Block.prototype.createMerkleRoot = function (enc) {
        var leaves = [];
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            leaves.push(tx.hash());
        }
        var _b = merkle.createRoot(hash256, leaves), root = _b[0], malleated = _b[1];
        if (malleated)
            return null;
        return enc === 'hex' ? root.toString('hex') : root;
    };
    /**
     * Create a witness nonce (for mining).
     * @returns {Buffer}
     */
    Block.prototype.createWitnessNonce = function () {
        return Buffer.from(consensus.ZERO_HASH);
    };
    /**
     * Calculate commitment hash (the root of the
     * witness merkle tree hashed with the witnessNonce).
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Hash}
     */
    Block.prototype.createCommitmentHash = function (enc) {
        var nonce = this.getWitnessNonce();
        var leaves = [];
        assert(nonce, 'No witness nonce present.');
        leaves.push(consensus.ZERO_HASH);
        for (var i = 1; i < this.txs.length; i++) {
            var tx = this.txs[i];
            leaves.push(tx.witnessHash());
        }
        var root = merkle.createRoot(hash256, leaves)[0];
        // Note: malleation check ignored here.
        // assert(!malleated);
        var hash = hash256.root(root, nonce);
        return enc === 'hex'
            ? hash.toString('hex')
            : hash;
    };
    /**
     * Retrieve the merkle root from the block header.
     * @param {String?} enc
     * @returns {Hash}
     */
    Block.prototype.getMerkleRoot = function (enc) {
        if (enc === 'hex')
            return this.merkleRoot.toString('hex');
        return this.merkleRoot;
    };
    /**
     * Retrieve the witness nonce from the
     * coinbase's witness vector (if present).
     * @returns {Buffer|null}
     */
    Block.prototype.getWitnessNonce = function () {
        if (this.txs.length === 0)
            return null;
        var coinbase = this.txs[0];
        if (coinbase.inputs.length !== 1)
            return null;
        var input = coinbase.inputs[0];
        if (input.witness.items.length !== 1)
            return null;
        if (input.witness.items[0].length !== 32)
            return null;
        return input.witness.items[0];
    };
    /**
     * Retrieve the commitment hash
     * from the coinbase's outputs.
     * @param {String?} enc
     * @returns {Hash|null}
     */
    Block.prototype.getCommitmentHash = function (enc) {
        if (this.txs.length === 0)
            return null;
        var coinbase = this.txs[0];
        var hash = null;
        for (var i = coinbase.outputs.length - 1; i >= 0; i--) {
            var output = coinbase.outputs[i];
            if (output.script.isCommitment()) {
                hash = output.script.getCommitment();
                break;
            }
        }
        if (!hash)
            return null;
        return enc === 'hex'
            ? hash.toString('hex')
            : hash;
    };
    /**
     * Do non-contextual verification on the block. Including checking the block
     * size, the coinbase and the merkle root. This is consensus-critical.
     * @returns {Boolean}
     */
    Block.prototype.verifyBody = function () {
        var valid = this.checkBody()[0];
        return valid;
    };
    /**
     * Do non-contextual verification on the block. Including checking the block
     * size, the coinbase and the merkle root. This is consensus-critical.
     * @returns {Array} [valid, reason, score]
     */
    Block.prototype.checkBody = function () {
        // Check base size.
        if (this.txs.length === 0
            || this.txs.length > consensus.MAX_BLOCK_SIZE
            || this.getBaseSize() > consensus.MAX_BLOCK_SIZE) {
            return [false, 'bad-blk-length', 100];
        }
        // First TX must be a coinbase.
        if (this.txs.length === 0 || !this.txs[0].isCoinbase())
            return [false, 'bad-cb-missing', 100];
        // Check merkle root.
        var root = this.createMerkleRoot();
        // If the merkle is mutated,
        // we have duplicate txs.
        if (!root)
            return [false, 'bad-txns-duplicate', 100];
        if (!this.merkleRoot.equals(root))
            return [false, 'bad-txnmrklroot', 100];
        // Test all transactions.
        var scale = consensus.WITNESS_SCALE_FACTOR;
        var sigops = 0;
        for (var i = 0; i < this.txs.length; i++) {
            var tx = this.txs[i];
            // The rest of the txs must not be coinbases.
            if (i > 0 && tx.isCoinbase())
                return [false, 'bad-cb-multiple', 100];
            // Sanity checks.
            var _a = tx.checkSanity(), valid = _a[0], reason = _a[1], score = _a[2];
            if (!valid)
                return [valid, reason, score];
            // Count legacy sigops (do not count scripthash or witness).
            sigops += tx.getLegacySigops();
            if (sigops * scale > consensus.MAX_BLOCK_SIGOPS_COST)
                return [false, 'bad-blk-sigops', 100];
        }
        return [true, 'valid', 0];
    };
    /**
     * Retrieve the coinbase height from the coinbase input script.
     * @returns {Number} height (-1 if not present).
     */
    Block.prototype.getCoinbaseHeight = function () {
        if (this.version < 2)
            return -1;
        if (this.txs.length === 0)
            return -1;
        var coinbase = this.txs[0];
        if (coinbase.inputs.length === 0)
            return -1;
        return coinbase.inputs[0].script.getCoinbaseHeight();
    };
    /**
     * Get the "claimed" reward by the coinbase.
     * @returns {SatoshiAmount} claimed
     */
    Block.prototype.getClaimed = function () {
        assert(this.txs.length > 0);
        assert(this.txs[0].isCoinbase());
        return this.txs[0].getOutputValue();
    };
    /**
     * Get all unique outpoint hashes in the
     * block. Coinbases are ignored.
     * @returns {Hash[]} Outpoint hashes.
     */
    Block.prototype.getPrevout = function () {
        var prevout = new BufferSet();
        for (var i = 1; i < this.txs.length; i++) {
            var tx = this.txs[i];
            for (var _i = 0, _a = tx.inputs; _i < _a.length; _i++) {
                var input = _a[_i];
                prevout.add(input.prevout.hash);
            }
        }
        return prevout.toArray();
    };
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @returns {Object}
     */
    Block.prototype[inspectSymbol] = function () {
        return this.format();
    };
    /**
     * Inspect the block and return a more
     * user-friendly representation of the data.
     * @param {CoinView} view
     * @param {Number} height
     * @returns {Object}
     */
    Block.prototype.format = function (view, height) {
        var commitmentHash = this.getCommitmentHash();
        return {
            hash: this.rhash(),
            height: height != null ? height : -1,
            size: this.getSize(),
            virtualSize: this.getVirtualSize(),
            date: util.date(this.time),
            version: this.version.toString(16),
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            commitmentHash: commitmentHash
                ? util.revHex(commitmentHash)
                : null,
            time: this.time,
            bits: this.bits,
            nonce: this.nonce,
            txs: this.txs.map(function (tx, i) {
                return tx.format(view, null, i);
            })
        };
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    Block.prototype.toJSON = function () {
        return this.getJSON();
    };
    /**
     * Convert the block to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {CoinView} view
     * @param {Number} height
     * @param {Number} depth
     * @returns {Object}
     */
    Block.prototype.getJSON = function (network, view, height, depth) {
        network = Network.get(network);
        return {
            hash: this.rhash(),
            height: height,
            depth: depth,
            version: this.version,
            prevBlock: util.revHex(this.prevBlock),
            merkleRoot: util.revHex(this.merkleRoot),
            time: this.time,
            bits: this.bits,
            nonce: this.nonce,
            txs: this.txs.map(function (tx, i) {
                return tx.getJSON(network, view, null, i);
            })
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    Block.prototype.fromJSON = function (json) {
        assert(json, 'Block data is required.');
        assert(Array.isArray(json.txs));
        this.parseJSON(json);
        for (var _i = 0, _a = json.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            this.txs.push(TX.fromJSON(tx));
        }
        return this;
    };
    /**
     * Instantiate a block from a jsonified block object.
     * @param {Object} json - The jsonified block object.
     * @returns {Block}
     */
    Block.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Block.prototype.fromReader = function (br) {
        br.start();
        this.readHead(br);
        var count = br.readVarint();
        var witness = 0;
        for (var i = 0; i < count; i++) {
            var tx = TX.fromReader(br, true);
            witness += tx._witness;
            this.txs.push(tx);
        }
        if (!this.mutable) {
            this._raw = br.endData();
            this._size = this._raw.length;
            this._witness = witness;
        }
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Block.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate a block from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Block}
     */
    Block.fromReader = function (data) {
        return new this().fromReader(data);
    };
    /**
     * Instantiate a block from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Block}
     */
    Block.fromRaw = function (data, enc) {
        if (typeof data === 'string')
            data = Buffer.from(data, enc);
        return new this().fromRaw(data);
    };
    /**
     * Convert the Block to a MerkleBlock.
     * @param {Bloom} filter - Bloom filter for transactions
     * to match. The merkle block will contain only the
     * matched transactions.
     * @returns {MerkleBlock}
     */
    Block.prototype.toMerkle = function (filter) {
        return MerkleBlock.fromBlock(this, filter);
    };
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    Block.prototype.writeNormal = function (bw) {
        this.writeHead(bw);
        bw.writeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            tx.toNormalWriter(bw);
        }
        return bw;
    };
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    Block.prototype.writeWitness = function (bw) {
        this.writeHead(bw);
        bw.writeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            tx.toWriter(bw, true);
        }
        return bw;
    };
    /**
     * Serialze block with or without witness data.
     * @private
     * @param {Boolean} witness
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    Block.prototype.frameNormal = function () {
        var raw = this.getNormalSizes();
        var bw = bio.write(raw.size);
        this.writeNormal(bw);
        raw.data = bw.render();
        return raw;
    };
    /**
     * Serialze block without witness data.
     * @private
     * @param {BufferWriter?} writer
     * @returns {Buffer}
     */
    Block.prototype.frameWitness = function () {
        var raw = this.getWitnessSizes();
        var bw = bio.write(raw.size);
        this.writeWitness(bw);
        raw.data = bw.render();
        return raw;
    };
    /**
     * Convert the block to a headers object.
     * @returns {Headers}
     */
    Block.prototype.toHeaders = function () {
        return Headers.fromBlock(this);
    };
    /**
     * Get real block size without witness.
     * @returns {RawBlock}
     */
    Block.prototype.getNormalSizes = function () {
        var size = 0;
        size += 80;
        size += encoding.sizeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            size += tx.getBaseSize();
        }
        return new RawBlock(size, 0);
    };
    /**
     * Get real block size with witness.
     * @returns {RawBlock}
     */
    Block.prototype.getWitnessSizes = function () {
        var size = 0;
        var witness = 0;
        size += 80;
        size += encoding.sizeVarint(this.txs.length);
        for (var _i = 0, _a = this.txs; _i < _a.length; _i++) {
            var tx = _a[_i];
            var raw = tx.getSizes();
            size += raw.size;
            witness += raw.witness;
        }
        return new RawBlock(size, witness);
    };
    /**
     * Test whether an object is a Block.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Block.isBlock = function (obj) {
        return obj instanceof Block;
    };
    /*
     * Get block filter (BIP 158)
     * @see https://github.com/bitcoin/bips/blob/master/bip-0158.mediawiki
     * @param {CoinView} view
     * @returns {Object} See {@link Golomb}
     */
    Block.prototype.toFilter = function (view) {
        var hash = this.hash();
        var key = hash.slice(0, 16);
        var items = new BufferSet();
        for (var i = 0; i < this.txs.length; i++) {
            var tx = this.txs[i];
            for (var _i = 0, _a = tx.outputs; _i < _a.length; _i++) {
                var output = _a[_i];
                if (output.script.length === 0)
                    continue;
                // In order to allow the filters to later be committed
                // to within an OP_RETURN output, we ignore all
                // OP_RETURNs to avoid a circular dependency.
                if (output.script.raw[0] === opcodes.OP_RETURN)
                    continue;
                items.add(output.script.raw);
            }
        }
        for (var _b = 0, _c = view.map; _b < _c.length; _b++) {
            var _d = _c[_b], coins = _d[1];
            for (var _e = 0, _f = coins.outputs; _e < _f.length; _e++) {
                var _g = _f[_e], coin = _g[1];
                if (coin.output.script.length === 0)
                    continue;
                items.add(coin.output.script.raw);
            }
        }
        return new BasicFilter().fromItems(key, items);
    };
    return Block;
}(AbstractBlock));
/*
 * Helpers
 */
var RawBlock = /** @class */ (function () {
    function RawBlock(size, witness) {
        this.data = null;
        this.size = size;
        this.witness = witness;
    }
    return RawBlock;
}());
/*
 * Expose
 */
module.exports = Block;
