export = Stack;
/**
 * Stack
 * Represents the stack of a Script during execution.
 * @alias module:script.Stack
 * @property {Buffer[]} items - Stack items.
 * @property {Number} length - Size of stack.
 */
declare class Stack {
    /**
     * Test an object to see if it is a Stack.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isStack(obj: any): boolean;
    static toString(item: any, enc: any): any;
    static fromString(str: any, enc: any): any;
    static toNum(item: any, minimal: any, limit: any): ScriptNum;
    static fromNum(num: any): any;
    static toInt(item: any, minimal: any, limit: any): number;
    static fromInt(int: any): any;
    static toBool(item: any): boolean;
    static fromBool(value: any): any;
    /**
     * Create a stack.
     * @constructor
     * @param {Buffer[]?} items - Stack items.
     */
    constructor(items: Buffer[] | null);
    items: Buffer[];
    /**
     * Set length.
     * @param {Number} value
     */
    set length(arg: number);
    /**
     * Get length.
     * @returns {Number}
     */
    get length(): number;
    /**
     * Instantiate a value-only iterator.
     * @returns {StackIterator}
     */
    values(): StackIterator;
    /**
     * Instantiate a key and value iterator.
     * @returns {StackIterator}
     */
    entries(): StackIterator;
    /**
     * Convert the stack to a string.
     * @returns {String} Human-readable stack.
     */
    toString(): string;
    /**
     * Format the stack as bitcoind asm.
     * @param {Boolean?} decode - Attempt to decode hash types.
     * @returns {String} Human-readable script.
     */
    toASM(decode: boolean | null): string;
    /**
     * Clone the stack.
     * @returns {Stack} Cloned stack.
     */
    clone(): Stack;
    /**
     * Clear the stack.
     * @returns {Stack}
     */
    clear(): Stack;
    /**
     * Get a stack item by index.
     * @param {Number} index
     * @returns {Buffer|null}
     */
    get(index: number): Buffer | null;
    /**
     * Pop a stack item.
     * @see Array#pop
     * @returns {Buffer|null}
     */
    pop(): Buffer | null;
    /**
     * Shift a stack item.
     * @see Array#shift
     * @returns {Buffer|null}
     */
    shift(): Buffer | null;
    /**
     * Remove an item.
     * @param {Number} index
     * @returns {Buffer}
     */
    remove(index: number): Buffer;
    /**
     * Set stack item at index.
     * @param {Number} index
     * @param {Buffer} value
     * @returns {Buffer}
     */
    set(index: number, item: any): Buffer;
    /**
     * Push item onto stack.
     * @see Array#push
     * @param {Buffer} item
     * @returns {Number} Stack size.
     */
    push(item: Buffer): number;
    /**
     * Unshift item from stack.
     * @see Array#unshift
     * @param {Buffer} item
     * @returns {Number}
     */
    unshift(item: Buffer): number;
    /**
     * Insert an item.
     * @param {Number} index
     * @param {Buffer} item
     * @returns {Buffer}
     */
    insert(index: number, item: Buffer): Buffer;
    /**
     * Erase stack items.
     * @param {Number} start
     * @param {Number} end
     * @returns {Buffer[]}
     */
    erase(start: number, end: number): Buffer[];
    /**
     * Swap stack values.
     * @param {Number} i1 - Index 1.
     * @param {Number} i2 - Index 2.
     */
    swap(i1: number, i2: number): void;
    getData(index: any): any;
    popData(): any;
    shiftData(): any;
    removeData(index: any): Buffer;
    setData(index: any, data: any): Buffer;
    pushData(data: any): number;
    unshiftData(data: any): number;
    insertData(index: any, data: any): Buffer;
    getLength(index: any): any;
    getString(index: any, enc: any): any;
    popString(enc: any): any;
    shiftString(enc: any): any;
    removeString(index: any, enc: any): any;
    setString(index: any, str: any, enc: any): Buffer;
    pushString(str: any, enc: any): number;
    unshiftString(str: any, enc: any): number;
    insertString(index: any, str: any, enc: any): Buffer;
    getNum(index: any, minimal: any, limit: any): ScriptNum;
    popNum(minimal: any, limit: any): ScriptNum;
    shiftNum(minimal: any, limit: any): ScriptNum;
    removeNum(index: any, minimal: any, limit: any): ScriptNum;
    setNum(index: any, num: any): Buffer;
    pushNum(num: any): number;
    unshiftNum(num: any): number;
    insertNum(index: any, num: any): Buffer;
    getInt(index: any, minimal: any, limit: any): number;
    popInt(minimal: any, limit: any): number;
    shiftInt(minimal: any, limit: any): number;
    removeInt(index: any, minimal: any, limit: any): number;
    setInt(index: any, num: any): Buffer;
    pushInt(num: any): number;
    unshiftInt(num: any): number;
    insertInt(index: any, num: any): Buffer;
    getBool(index: any): boolean;
    popBool(): boolean;
    shiftBool(): boolean;
    removeBool(index: any): boolean;
    setBool(index: any, value: any): Buffer;
    pushBool(value: any): number;
    unshiftBool(value: any): number;
    insertBool(index: any, value: any): Buffer;
}
import ScriptNum = require("./scriptnum");
//# sourceMappingURL=stack.d.ts.map