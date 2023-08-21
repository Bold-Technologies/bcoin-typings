export = ScriptError;
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
declare class ScriptError extends Error {
    /**
     * Create an error.
     * @constructor
     * @param {String} code - Error code.
     * @param {Opcode} op - Opcode.
     * @param {Number?} ip - Instruction pointer.
     */
    constructor(code: string, op: Opcode, ip: number | null);
    type: string;
    code: string;
    op: any;
    ip: number;
}
//# sourceMappingURL=scripterror.d.ts.map