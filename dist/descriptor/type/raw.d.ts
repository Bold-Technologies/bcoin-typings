export = RawDescriptor;
/**
 * Raw Descriptor
 * Represents the script represented by HEX in input.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0385.mediawiki#raw
 * @property {String} type
 * @property {String} scriptContext
 * @property {Script} script
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class RawDescriptor extends AbstractDescriptor {
    /**
     * Instantiate raw descriptor from options object.
     * @param {Object} options
     * @returns {RawDescriptor}
     */
    static fromOptions(options: any): RawDescriptor;
    /**
     * Instantiate raw descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {RawDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): RawDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    script: any;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {RawDescriptor}
     */
    fromOptions(options: any): RawDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {RawDescriptor}
     */
    fromString(str: string, network: Network, context: string): RawDescriptor;
    toStringExtra(): any;
    /**
     * Get the scripts (helper function).
     * @returns {Script[]}
     */
    _getScripts(): Script[];
}
import AbstractDescriptor = require("../abstractdescriptor");
import Network = require("../../protocol/network");
import Script = require("../../script/script");
//# sourceMappingURL=raw.d.ts.map