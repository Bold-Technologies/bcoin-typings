/*!
 * errors.js - error objects for bcoin
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
/**
 * @module protocol/errors
 */
var assert = require('bsert');
/**
 * Verify Error
 * An error thrown during verification. Can be either
 * a mempool transaction validation error or a blockchain
 * block verification error. Ultimately used to send
 * `reject` packets to peers.
 * @extends Error
 * @param {Block|TX} msg
 * @param {String} code - Reject packet code.
 * @param {String} reason - Reject packet reason.
 * @param {Number} score - Ban score increase
 * (can be -1 for no reject packet).
 * @param {Boolean} malleated
 */
var VerifyError = /** @class */ (function (_super) {
    __extends(VerifyError, _super);
    /**
     * Create a verify error.
     * @constructor
     * @param {Block|TX} msg
     * @param {String} code - Reject packet code.
     * @param {String} reason - Reject packet reason.
     * @param {Number} score - Ban score increase
     * (can be -1 for no reject packet).
     * @param {Boolean} malleated
     */
    function VerifyError(msg, code, reason, score, malleated) {
        var _this = _super.call(this) || this;
        assert(typeof code === 'string');
        assert(typeof reason === 'string');
        assert(score >= 0);
        _this.type = 'VerifyError';
        _this.message = '';
        _this.code = code;
        _this.reason = reason;
        _this.score = score;
        _this.hash = msg.hash();
        _this.malleated = malleated || false;
        _this.message = "Verification failure: ".concat(reason)
            + " (code=".concat(code, " score=").concat(score, " hash=").concat(msg.rhash(), ")");
        if (Error.captureStackTrace)
            Error.captureStackTrace(_this, VerifyError);
        return _this;
    }
    return VerifyError;
}(Error));
/*
 * Expose
 */
exports.VerifyError = VerifyError;
