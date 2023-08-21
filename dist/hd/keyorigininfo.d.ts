export = KeyOriginInfo;
/**
 * KeyOriginInfo
 * Represents hd key path.
 * @property {Number} fingerPrint - master key fingerprint (uint32)
 * @property {Number[]} path - bip32 derivation path in uint32 array
 */
declare class KeyOriginInfo {
    /**
     * Instantiate KeyOriginInfo from options.
     * @param {Object} options
     * @returns {KeyOriginInfo}
     */
    static fromOptions(options: any): KeyOriginInfo;
    /**
     * Instantiate KeyOriginInfo from string.
     * @param {String} str
     * @returns {KeyOriginInfo}
     */
    static fromString(str: string): KeyOriginInfo;
    /**
     * Instantiate KeyOriginInfo from serialized data.
     * @param {Buffer} data
     * @returns {KeyOriginInfo}
     */
    static fromRaw(data: Buffer): KeyOriginInfo;
    /**
     * Instantiate KeyOriginInfo from buffer reader.
     * @param {BufferReader} br
     * @returns {KeyOriginInfo}
     */
    static fromReader(br: BufferReader): KeyOriginInfo;
    /**
     * Instantiate KeyOriginInfo from json object.
     * @param {Object} json
     * @returns {KeyOriginInfo}
     */
    static fromJSON(json: any): KeyOriginInfo;
    /**
     * Test whether an object is a KeyOriginInfo.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isKeyOriginInfo(obj: any): boolean;
    /**
     * Create key origin info.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    fingerPrint: number;
    path: any[];
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {KeyOriginInfo}
     */
    fromOptions(options: any): KeyOriginInfo;
    /**
     * Inject properties from string.
     * @param {String} str
     * @returns {KeyOriginInfo}
     */
    fromString(str: string): KeyOriginInfo;
    /**
     * Test whether two KeyOriginInfo objects are equal.
     * @param {KeyOriginInfo} keyInfo
     * @returns {Boolean}
     */
    equals(keyInfo: KeyOriginInfo): boolean;
    /**
     * Convert KeyOriginInfo to a more user-friendly object.
     * @returns {Object}
     */
    inspect(): any;
    /**
     * Convert KeyOriginInfo to a more user-friendly object.
     * (uses 'h' as the default hardened marker for path)
     * @returns {Object}
     */
    format(): any;
    /**
    * Inject properties from serialized data.
    * @private
    * @param {Buffer} data
    * @returns {KeyOriginInfo}
    */
    private fromRaw;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Serialize the KeyOriginInfo.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Write the KeyOriginInfo to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Convert KeyOriginInfo to a more json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Convert KeyOriginInfo to string.
     * @param {String} [hardenedMarker = 'h']
     * Whether to use apostrophe as the hardened marker for path.
     * Defaults to 'h' (uses 'h' as the hardened marker).
     * @returns {String}
     */
    toString(hardenedMarker?: string): string;
    /**
    * Inject properties from json object.
    * @private
    * @param {Object} json
    * @returns {KeyOriginInfo}
    */
    private fromJSON;
    /**
     * Clone the KeyOriginInfo.
     * @returns {KeyOriginInfo}
     */
    clone(): KeyOriginInfo;
    /**
     * Clear the KeyOriginInfo.
     */
    clear(): void;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
}
//# sourceMappingURL=keyorigininfo.d.ts.map