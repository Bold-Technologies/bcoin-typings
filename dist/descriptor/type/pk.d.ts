export = PKDescriptor;
/**
 * PKDescriptor
 * Represents a P2PK output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0381.mediawiki#pk
 * @property {String} type
 * @property {String} scriptContext
 * @property {KeyProvider[]} keyProviders
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class PKDescriptor extends AbstractDescriptor {
    /**
     * Instantiate pk descriptor from options object.
     * @param {Object} options
     * @returns {PKDescriptor}
     */
    static fromOptions(options: any): PKDescriptor;
    /**
     * Instantiate pk descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {PKDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): PKDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {PKDescriptor}
     */
    fromOptions(options: any): PKDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {PKDescriptor}
     */
    fromString(str: string, network: Network, context: string): PKDescriptor;
    /**
     * Get the scripts (helper function).
     * @param {Buffer[]} pubkeys
     * @returns {Script[]}
     */
    _getScripts(pubkeys: Buffer[]): Script[];
}
import AbstractDescriptor = require("../abstractdescriptor");
import Network = require("../../protocol/network");
import Script = require("../../script/script");
//# sourceMappingURL=pk.d.ts.map