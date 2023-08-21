export = Opcode;
/**
 * Opcode
 * A simple struct which contains
 * an opcode and pushdata buffer.
 * @alias module:script.Opcode
 * @property {Number} value
 * @property {Buffer|null} data
 */
declare class Opcode {
    /**
     * Instantiate an opcode from a number opcode.
     * @param {Number} op
     * @returns {Opcode}
     */
    static fromOp(op: number): Opcode;
    /**
     * Instantiate a pushdata opcode from
     * a buffer (will encode minimaldata).
     * @param {Buffer} data
     * @returns {Opcode}
     */
    static fromData(data: Buffer): Opcode;
    /**
     * Instantiate a pushdata opcode from a
     * buffer (this differs from fromData in
     * that it will _always_ be a pushdata op).
     * @param {Buffer} data
     * @returns {Opcode}
     */
    static fromPush(data: Buffer): Opcode;
    /**
     * Instantiate a pushdata opcode from a string.
     * @param {String} str
     * @param {String} [enc=utf8]
     * @returns {Opcode}
     */
    static fromString(str: string, enc?: string): Opcode;
    /**
     * Instantiate an opcode from a small number.
     * @param {Number} num
     * @returns {Opcode}
     */
    static fromSmall(num: number): Opcode;
    /**
     * Instantiate an opcode from a ScriptNum.
     * @param {ScriptNum} num
     * @returns {Opcode}
     */
    static fromNum(num: ScriptNum): Opcode;
    /**
     * Instantiate an opcode from a Number.
     * @param {Number} num
     * @returns {Opcode}
     */
    static fromInt(num: number): Opcode;
    /**
     * Instantiate an opcode from a Number.
     * @param {Boolean} value
     * @returns {Opcode}
     */
    static fromBool(value: boolean): Opcode;
    /**
     * Instantiate a pushdata opcode from symbolic name.
     * @example
     *   Opcode.fromSymbol('checksequenceverify')
     * @param {String} name
     * @returns {Opcode}
     */
    static fromSymbol(name: string): Opcode;
    /**
     * Instantiate opcode from buffer reader.
     * @param {BufferReader} br
     * @returns {Opcode}
     */
    static fromReader(br: BufferReader): Opcode;
    /**
     * Instantiate opcode from serialized data.
     * @param {Buffer} data
     * @returns {Opcode}
     */
    static fromRaw(data: Buffer): Opcode;
    /**
     * Test whether an object an Opcode.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isOpcode(obj: any): boolean;
    /**
     * Create an opcode.
     * Note: this should not be called directly.
     * @constructor
     * @param {Number} value - Opcode.
     * @param {Buffer?} data - Pushdata buffer.
     */
    constructor(value: number, data: Buffer | null);
    value: number;
    data: Buffer;
    /**
     * Test whether a pushdata abides by minimaldata.
     * @returns {Boolean}
     */
    isMinimal(): boolean;
    /**
     * Test whether opcode is a disabled opcode.
     * @returns {Boolean}
     */
    isDisabled(): boolean;
    /**
     * Test whether opcode is a branch (if/else/endif).
     * @returns {Boolean}
     */
    isBranch(): boolean;
    /**
     * Test opcode equality.
     * @param {Opcode} op
     * @returns {Boolean}
     */
    equals(op: Opcode): boolean;
    /**
     * Convert Opcode to opcode value.
     * @returns {Number}
     */
    toOp(): number;
    /**
     * Covert opcode to data push.
     * @returns {Buffer|null}
     */
    toData(): Buffer | null;
    /**
     * Covert opcode to data length.
     * @returns {Number}
     */
    toLength(): number;
    /**
     * Covert and _cast_ opcode to data push.
     * @returns {Buffer|null}
     */
    toPush(): Buffer | null;
    /**
     * Get string for opcode.
     * @param {String?} enc
     * @returns {Buffer|null}
     */
    toString(enc: string | null): Buffer | null;
    /**
     * Convert opcode to small integer.
     * @returns {Number}
     */
    toSmall(): number;
    /**
     * Convert opcode to script number.
     * @param {Boolean?} minimal
     * @param {Number?} limit
     * @returns {ScriptNum|null}
     */
    toNum(minimal: boolean | null, limit: number | null): ScriptNum | null;
    /**
     * Convert opcode to integer.
     * @param {Boolean?} minimal
     * @param {Number?} limit
     * @returns {Number}
     */
    toInt(minimal: boolean | null, limit: number | null): number;
    /**
     * Convert opcode to boolean.
     * @returns {Boolean}
     */
    toBool(): boolean;
    /**
     * Convert opcode to its symbolic representation.
     * @returns {String}
     */
    toSymbol(): string;
    /**
     * Calculate opcode size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Encode the opcode to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Encode the opcode.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Convert the opcode to a bitcoind test string.
     * @returns {String} Human-readable script code.
     */
    toFormat(): string;
    /**
     * Format the opcode as bitcoind asm.
     * @param {Boolean?} decode - Attempt to decode hash types.
     * @returns {String} Human-readable script.
     */
    toASM(decode: boolean | null): string;
}
import ScriptNum = require("./scriptnum");
//# sourceMappingURL=opcode.d.ts.map