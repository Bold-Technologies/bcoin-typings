export = Filter;
/**
 * Filter
 * Represents a GCSFilter.
 * @alias module:primitives.Filter
 * @property {Hash} hash
 * @property {Number} index
 */
declare class Filter {
    /**
     * Instantate outpoint from options object.
     * @param {Object} options
     * @returns {Filter}
     */
    static fromOptions(options: any): Filter;
    /**
     * Instantiate filter from a buffer reader.
     * @param {BufferReader} br
     * @returns {Filter}
     */
    static fromReader(br: BufferReader): Filter;
    /**
     * Instantiate filter from serialized data.
     * @param {Buffer} data
     * @returns {Filter}
     */
    static fromRaw(data: Buffer): Filter;
    /**
     * Instantiate filter from json object.
     * @param {Object} json
     * @returns {Filter}
     */
    static fromJSON(json: any): Filter;
    /**
     * Test an object to see if it is an filter.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isFilter(obj: any): boolean;
    /**
     * Create an filter.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    header: any;
    filter: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Write filter to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Calculate size of filter.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize filter.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
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
     * Inject properties from json object.
     * @private
     * @params {Object} json
     */
    private fromJSON;
    /**
     * Convert the filter to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    toJSON(): any;
}
//# sourceMappingURL=filter.d.ts.map