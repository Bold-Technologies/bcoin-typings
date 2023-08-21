export = WPKHDescriptor;
/**
 * WPKHDescriptor
 * Represents a P2WPKH output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0382.mediawiki#wpkh
 * @property {String} type
 * @property {String} scriptContext
 * @property {KeyProvider[]} keyProviders
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class WPKHDescriptor extends AbstractDescriptor {
    /**
     * Instantiate wpkh descriptor from options object.
     * @param {Object} options
     * @returns {WPKHDescriptor}
     */
    static fromOptions(options: any): WPKHDescriptor;
    /**
     * Instantiate wpkh descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {WPKHDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): WPKHDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {WPKHDescriptor}
     */
    fromOptions(options: any): WPKHDescriptor;
    /**
     * Instantiate wpkh descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {WPKHDescriptor}
     */
    fromString(str: string, network: Network, context: string): WPKHDescriptor;
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
//# sourceMappingURL=wpkh.d.ts.map