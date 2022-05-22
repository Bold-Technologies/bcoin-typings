/*!
 * scripterror.js - script error for bcoin
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
 * Script Error
 * An error thrown from the scripting system,
 * potentially pertaining to Script execution.
 * @alias module:script.ScriptError
 * @extends Error
 * @property {String} message - Error message.
 * @property {String} code - Original code passed in.
 * @property {Number} op - Opcode.
 * @property {Number} ip - Instruction pointer.
 */
var ScriptError = /** @class */ (function (_super) {
    __extends(ScriptError, _super);
    /**
     * Create an error.
     * @constructor
     * @param {String} code - Error code.
     * @param {Opcode} op - Opcode.
     * @param {Number?} ip - Instruction pointer.
     */
    function ScriptError(code, op, ip) {
        var _this = _super.call(this) || this;
        _this.type = 'ScriptError';
        _this.code = code;
        _this.message = code;
        _this.op = -1;
        _this.ip = -1;
        if (typeof op === 'string') {
            _this.message = op;
        }
        else if (op) {
            _this.message = "".concat(code, " (op=").concat(op.toSymbol(), ", ip=").concat(ip, ")");
            _this.op = op.value;
            _this.ip = ip;
        }
        if (Error.captureStackTrace)
            Error.captureStackTrace(_this, ScriptError);
        return _this;
    }
    return ScriptError;
}(Error));
/*
 * Expose
 */
module.exports = ScriptError;
