/*!
 * message.js - message signing utilities.
 * Copyright (c) 2019, The Bcoin Developers (MIT License).
 */
'use strict';
var assert = require('bsert');
var bufio = require('bufio');
var hash256 = require('bcrypto/lib/hash256');
var secp256k1 = require('bcrypto/lib/secp256k1');
/**
 * @exports utils/message
 */
var message = exports;
/**
 * Bitcoin signing magic string.
 * @const {String}
 * @default
 */
message.MAGIC_STRING = 'Bitcoin Signed Message:\n';
/**
 * Hash message with magic string.
 * @param {String} message
 * @param {String} [prefix = message.MAGIC_STRING]
 * @returns {Hash}
 */
message.magicHash = function (msg, prefix) {
    if (prefix === void 0) { prefix = message.MAGIC_STRING; }
    assert(typeof prefix === 'string', 'prefix must be a string.');
    assert(typeof msg === 'string', 'message must be a string');
    var bw = bufio.write();
    bw.writeVarString(prefix);
    bw.writeVarString(msg, 'utf8');
    return hash256.digest(bw.render());
};
/**
 * Sign message with key.
 * @param {String} msg
 * @param {KeyRing} ring
 * @param {String} [prefix = message.MAGIC_STRING]
 * @returns {Buffer}
 */
message.sign = function (msg, ring, prefix) {
    assert(ring.getPrivateKey(), 'Cannot sign without private key.');
    var hash = message.magicHash(msg, prefix);
    var compress = 0x04 !== ring.getPublicKey().readInt8(0);
    var _a = secp256k1.signRecoverable(hash, ring.getPrivateKey()), signature = _a[0], recovery = _a[1];
    var bw = bufio.write();
    bw.writeI8(recovery + 27 + (compress ? 4 : 0));
    bw.writeBytes(signature);
    return bw.render();
};
/**
 * Recover raw public key from message and signature.
 * @param {String} msg
 * @param {Buffer} signature
 * @param {String} [prefix = MAGIC_STRING]
 */
message.recover = function (msg, signature, prefix) {
    assert(typeof msg === 'string', 'msg must be a string');
    assert(Buffer.isBuffer(signature), 'sig must be a buffer');
    var hash = message.magicHash(msg, prefix);
    assert.strictEqual(signature.length, 65, 'Invalid signature length');
    var flagByte = signature.readUInt8(0) - 27;
    assert(flagByte < 8, 'Invalid signature parameter');
    var compressed = Boolean(flagByte & 4);
    var recovery = flagByte & 3;
    return secp256k1.recover(hash, signature.slice(1), recovery, compressed);
};
