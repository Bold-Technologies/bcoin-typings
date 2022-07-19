export = Witness;
/**
 * Witness
 * Refers to the witness vector of
 * segregated witness transactions.
 * @alias module:script.Witness
 * @extends Stack
 * @property {Buffer[]} items
 * @property {Script?} redeem
 * @property {Number} length
 */
declare class Witness extends Stack {
    /**
     * Instantiate witness from options.
     * @param {Object} options
     * @returns {Witness}
     */
    static fromOptions(options: any): Witness;
    /**
     * Insantiate witness from an array of buffers.
     * @param {Buffer[]} items
     * @returns {Witness}
     */
    static fromArray(items: Buffer[]): Witness;
    /**
     * Insantiate witness from an array of buffers.
     * @param {Buffer[]} items
     * @returns {Witness}
     */
    static fromItems(items: Buffer[]): Witness;
    /**
     * Insantiate witness from a stack.
     * @param {Stack} stack
     * @returns {Witness}
     */
    static fromStack(stack: Stack): Witness;
    /**
     * Insantiate witness from a hex string.
     * @param {String} json
     * @returns {Witness}
     */
    static fromJSON(json: string): Witness;
    /**
     * Create a witness from a buffer reader.
     * @param {BufferReader} br
     */
    static fromReader(br: BufferReader): Witness;
    /**
     * Create a witness from a serialized buffer.
     * @param {Buffer|String} data - Serialized witness.
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Witness}
     */
    static fromRaw(data: Buffer | string, enc: string | null): Witness;
    /**
     * Parse a test script/array
     * string into a witness object. _Must_
     * contain only stack items (no non-push
     * opcodes).
     * @param {String|String[]} items - Script string.
     * @returns {Witness}
     * @throws Parse error.
     */
    static fromString(items: string | string[]): Witness;
    /**
     * Test an object to see if it is a Witness.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isWitness(obj: any): boolean;
    /**
     * Create a witness.
     * @alias module:script.Witness
     * @constructor
     * @param {Buffer[]|Object} items - Array of
     * stack items.
     * @property {Buffer[]} items
     * @property {Script?} redeem
     * @property {Number} length
     */
    constructor(options: any);
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Convert witness to an array of buffers.
     * @returns {Buffer[]}
     */
    toArray(): Buffer[];
    /**
     * Inject properties from an array of buffers.
     * @private
     * @param {Buffer[]} items
     */
    private fromArray;
    items: any;
    /**
     * Convert witness to an array of buffers.
     * @returns {Buffer[]}
     */
    toItems(): Buffer[];
    /**
     * Inject properties from an array of buffers.
     * @private
     * @param {Buffer[]} items
     */
    private fromItems;
    /**
     * Convert witness to a stack.
     * @returns {Stack}
     */
    toStack(): Stack;
    /**
     * Inject properties from a stack.
     * @private
     * @param {Stack} stack
     */
    private fromStack;
    /**
     * Clone the witness object.
     * @returns {Witness} A clone of the current witness object.
     */
    clone(): Witness;
    /**
     * Inject properties from witness.
     * Used for cloning.
     * @private
     * @param {Witness} witness
     * @returns {Witness}
     */
    private inject;
    /**
     * Compile witness (NOP).
     * @returns {Witness}
     */
    compile(): Witness;
    /**
     * "Guess" the type of the witness.
     * This method is not 100% reliable.
     * @returns {ScriptType}
     */
    getInputType(): ScriptType;
    /**
     * "Guess" the address of the witness.
     * This method is not 100% reliable.
     * @returns {Address|null}
     */
    getInputAddress(): Address | null;
    /**
     * "Test" whether the witness is a pubkey input.
     * Always returns false.
     * @returns {Boolean}
     */
    isPubkeyInput(): boolean;
    /**
     * Get P2PK signature if present.
     * Always returns null.
     * @returns {Buffer|null}
     */
    getPubkeyInput(): Buffer | null;
    /**
     * "Guess" whether the witness is a pubkeyhash input.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isPubkeyhashInput(): boolean;
    /**
     * Get P2PKH signature and key if present.
     * @returns {Array} [sig, key]
     */
    getPubkeyhashInput(): any[];
    /**
     * "Test" whether the witness is a multisig input.
     * Always returns false.
     * @returns {Boolean}
     */
    isMultisigInput(): boolean;
    /**
     * Get multisig signatures key if present.
     * Always returns null.
     * @returns {Buffer[]|null}
     */
    getMultisigInput(): Buffer[] | null;
    /**
     * "Guess" whether the witness is a scripthash input.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isScripthashInput(): boolean;
    /**
     * Get P2SH redeem script if present.
     * @returns {Buffer|null}
     */
    getScripthashInput(): Buffer | null;
    /**
     * "Guess" whether the witness is an unknown/non-standard type.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isUnknownInput(): boolean;
    /**
     * Test the witness against a bloom filter.
     * @param {Bloom} filter
     * @returns {Boolean}
     */
    test(filter: Bloom): boolean;
    /**
     * Grab and deserialize the redeem script from the witness.
     * @returns {Script} Redeem script.
     */
    getRedeem(): Script;
    /**
     * Find a data element in a witness.
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Index (`-1` if not present).
     */
    indexOf(data: Buffer): number;
    /**
     * Calculate size of the witness
     * excluding the varint size bytes.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Calculate size of the witness
     * including the varint size bytes.
     * @returns {Number}
     */
    getVarSize(): number;
    /**
     * Write witness to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Encode the witness to a Buffer.
     * @param {String} enc - Encoding, either `'hex'` or `null`.
     * @returns {Buffer|String} Serialized script.
     */
    toRaw(): Buffer | string;
    /**
     * Convert witness to a hex string.
     * @returns {String}
     */
    toJSON(): string;
    /**
     * Inject properties from json object.
     * @private
     * @param {String} json
     */
    private fromJSON;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Inject items from string.
     * @private
     * @param {String|String[]} items
     */
    private fromString;
}
import Stack = require("./stack");
import Address = require("../primitives/address");
import Script = require("./script");
//# sourceMappingURL=witness.d.ts.map