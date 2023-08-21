export = AddressDescriptor;
/**
 * AddressDescriptor
 * Represents the output script produced by the address in the descriptor.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0385.mediawiki#addr
 * @property {String} type
 * @property {Address} address
 * @property {String} scriptContext
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class AddressDescriptor extends AbstractDescriptor {
    /**
     * Instantiate address descriptor from options.
     * @param {Object} options
     * @returns {AddressDescriptor}
     */
    static fromOptions(options: any): AddressDescriptor;
    /**
     * Instantiate address descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {AddressDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): AddressDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    address: any;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {AddressDescriptor}
     */
    fromOptions(options: any): AddressDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {AddressDescriptor}
     */
    fromString(str: string, network: Network, context: string): AddressDescriptor;
    toPrivateString(): any;
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
//# sourceMappingURL=addr.d.ts.map