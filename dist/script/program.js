/*!
 * program.js - program object for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var common = require('./common');
var scriptTypes = common.types;
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Witness Program
 * @alias module:script.Program
 * @property {Number} version - Ranges from 0 to 16.
 * @property {String|null} type - Null if malformed.
 * @property {Buffer} data - The hash (for now).
 */
var Program = /** @class */ (function () {
    /**
     * Create a witness program.
     * @constructor
     * @param {Number} version
     * @param {Buffer} data
     */
    function Program(version, data) {
        assert((version & 0xff) === version);
        assert(version >= 0 && version <= 16);
        assert(Buffer.isBuffer(data));
        assert(data.length >= 2 && data.length <= 40);
        this.version = version;
        this.data = data;
    }
    /**
     * Get the witness program type.
     * @returns {ScriptType}
     */
    Program.prototype.getType = function () {
        if (this.version === 0) {
            if (this.data.length === 20)
                return scriptTypes.WITNESSPUBKEYHASH;
            if (this.data.length === 32)
                return scriptTypes.WITNESSSCRIPTHASH;
            // Fail on bad version=0
            return scriptTypes.WITNESSMALFORMED;
        }
        // No interpretation of script (anyone can spend)
        return scriptTypes.NONSTANDARD;
    };
    /**
     * Test whether the program is either
     * an unknown version or malformed.
     * @returns {Boolean}
     */
    Program.prototype.isUnknown = function () {
        var type = this.getType();
        return type === scriptTypes.WITNESSMALFORMED
            || type === scriptTypes.NONSTANDARD;
    };
    /**
     * Test whether the program is malformed.
     * @returns {Boolean}
     */
    Program.prototype.isMalformed = function () {
        return this.getType() === scriptTypes.WITNESSMALFORMED;
    };
    /**
     * Inspect the program.
     * @returns {String}
     */
    Program.prototype[inspectSymbol] = function () {
        var data = this.data.toString('hex');
        var type = common.typesByVal[this.getType()].toLowerCase();
        return "<Program: version=".concat(this.version, " data=").concat(data, " type=").concat(type, ">");
    };
    return Program;
}());
/*
 * Expose
 */
module.exports = Program;
