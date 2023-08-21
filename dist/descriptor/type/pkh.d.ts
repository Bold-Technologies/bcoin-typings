export = PKHDescriptor;
/**
 * PKHDescriptor
 * Represents a P2PKH output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0381.mediawiki#pkh
 * @property {String} type
 * @property {String} scriptContext
 * @property {Network} network
 * @property {KeyProvider[]} keyProviders
 * @extends AbstractDescriptor
 */
declare class PKHDescriptor extends AbstractDescriptor {
    /**
     * Instantiate pkh descriptor from options object.
     * @param {Object} options
     * @returns {PKHDescriptor}
     */
    static fromOptions(options: any): PKHDescriptor;
    /**
     * Instantiate pkh descriptor from a string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {PKHDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): PKHDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {PKHDescriptor}
     */
    fromOptions(options: any): PKHDescriptor;
    /**
     * Instantiate pkh descriptor from a string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {PKHDescriptor}
     */
    fromString(str: string, network: Network, context: string): PKHDescriptor;
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
//# sourceMappingURL=pkh.d.ts.map