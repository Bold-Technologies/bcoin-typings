export = Output;
/**
 * Represents a transaction output.
 * @alias module:primitives.Output
 * @property  {SatoshiAmount} value
 * @property {Script} script
 */
declare class Output {
    /**
     * Instantiate output from options object.
     * @param {Object} options
     * @returns {Output}
     */
    static fromOptions(options: any): Output;
    /**
     * Instantiate output from script/value pair.
     * @param {Script|Address} script
     * @param  {SatoshiAmount} value
     * @returns {Output}
     */
    static fromScript(script: Script | Address, value: SatoshiAmount): Output;
    /**
     * Instantiate an Output from a jsonified output object.
     * @param {Object} json - The jsonified output object.
     * @returns {Output}
     */
    static fromJSON(json: any): Output;
    /**
     * Instantiate an output from a buffer reader.
     * @param {BufferReader} br
     * @returns {Output}
     */
    static fromReader(br: BufferReader): Output;
    /**
     * Instantiate an output from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Output}
     */
    static fromRaw(data: Buffer, enc: string | null): Output;
    /**
     * Test an object to see if it is an Output.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isOutput(obj: any): boolean;
    /**
     * Create an output.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    value: number;
    script: Script;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Inject properties from script/value pair.
     * @private
     * @param {Script|Address} script
     * @param  {SatoshiAmount} value
     * @returns {Output}
     */
    private fromScript;
    /**
     * Clone the output.
     * @returns {Output}
     */
    clone(): Output;
    /**
     * Test equality against another output.
     * @param {Output} output
     * @returns {Boolean}
     */
    equals(output: Output): boolean;
    /**
     * Compare against another output (BIP69).
     * @param {Output} output
     * @returns {Number}
     */
    compare(output: Output): number;
    /**
     * Get the script type as a string.
     * @returns {ScriptType} type
     */
    getType(): ScriptType;
    /**
     * Get the address.
     * @returns {Address} address
     */
    getAddress(): Address;
    /**
     * Get the address hash.
     * @param {String?} enc
     * @returns {Hash} hash
     */
    getHash(enc: string | null): Hash;
    /**
     * Convert the output to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Convert the output to an object suitable
     * for JSON serialization.
     * @param {Network} network
     * @returns {Object}
     */
    getJSON(network: Network): any;
    /**
     * Calculate the dust threshold for this
     * output, based on serialize size and rate.
     * @param {Rate?} rate
     * @returns  {SatoshiAmount}
     */
    getDustThreshold(rate: Rate | null): SatoshiAmount;
    /**
     * Calculate size of serialized output.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Test whether the output should be considered dust.
     * @param {Rate?} rate
     * @returns {Boolean}
     */
    isDust(rate: Rate | null): boolean;
    /**
     * Inject properties from a JSON object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Write the output to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize the output.
     * @returns {Buffer|String}
     */
    toRaw(): Buffer | string;
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
}
import Script = require("../script/script");
import Address = require("../primitives/address");
import Network = require("../protocol/network");
//# sourceMappingURL=output.d.ts.map