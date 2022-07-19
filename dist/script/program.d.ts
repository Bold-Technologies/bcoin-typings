export = Program;
/**
 * Witness Program
 * @alias module:script.Program
 * @property {Number} version - Ranges from 0 to 16.
 * @property {String|null} type - Null if malformed.
 * @property {Buffer} data - The hash (for now).
 */
declare class Program {
    /**
     * Create a witness program.
     * @constructor
     * @param {Number} version
     * @param {Buffer} data
     */
    constructor(version: number, data: Buffer);
    version: number;
    data: Buffer;
    /**
     * Get the witness program type.
     * @returns {ScriptType}
     */
    getType(): ScriptType;
    /**
     * Test whether the program is either
     * an unknown version or malformed.
     * @returns {Boolean}
     */
    isUnknown(): boolean;
    /**
     * Test whether the program is malformed.
     * @returns {Boolean}
     */
    isMalformed(): boolean;
}
//# sourceMappingURL=program.d.ts.map