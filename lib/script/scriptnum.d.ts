export = ScriptNum;
/**
 * Script Number
 * @see https://github.com/chjj/n64
 * @alias module:script.ScriptNum
 * @property {Number} hi
 * @property {Number} lo
 * @property {Number} sign
 */
declare class ScriptNum {
    /**
     * Test wether a serialized script
     * number is in its most minimal form.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    static isMinimal(data: Buffer): boolean;
    /**
     * Decode and verify script number.
     * @param {Buffer} data
     * @param {Boolean?} minimal - Require minimal encoding.
     * @param {Number?} limit - Size limit.
     * @returns {ScriptNum}
     */
    static decode(data: Buffer, minimal: boolean | null, limit: number | null): ScriptNum;
    /**
     * Test whether object is a script number.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isScriptNum(obj: any): boolean;
    /**
     * Create a script number.
     * @constructor
     * @param {(Number|String|Buffer|Object)?} num
     * @param {(String|Number)?} base
     */
    constructor(num: (number | string | Buffer | any) | null, base: (string | number) | null);
    /**
     * Cast to int32.
     * @returns {Number}
     */
    getInt(): number;
    /**
     * Serialize script number.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Instantiate script number from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {ScriptNum}
     */
    private fromRaw;
    /**
     * Serialize script number.
     * @returns {Buffer}
     */
    encode(): Buffer;
    /**
     * Decode and verify script number.
     * @private
     * @param {Buffer} data
     * @param {Boolean?} minimal - Require minimal encoding.
     * @param {Number?} limit - Size limit.
     * @returns {ScriptNum}
     */
    private decode;
}
//# sourceMappingURL=scriptnum.d.ts.map