export = ComboDescriptor;
/**
 * ComboDescriptor
 * Represents a P2PK, P2PKH, P2WPKH, and P2SH-P2WPKH output scripts.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0384.mediawiki
 * @property {String} type
 * @property {KeyProvider[]} keyProviders
 * @property {String} scriptContext
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class ComboDescriptor extends AbstractDescriptor {
    /**
     * Instantiate combo descriptor from options.
     * @param {Object} options
     * @returns {ComboDescriptor}
     */
    static fromOptions(options: any): ComboDescriptor;
    /**
     * Instantiate combo descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {ComboDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): ComboDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {ComboDescriptor}
     */
    fromOptions(options: any): ComboDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {ComboDescriptor}
     */
    fromString(str: string, network: Network, context: string): ComboDescriptor;
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
//# sourceMappingURL=combo.d.ts.map