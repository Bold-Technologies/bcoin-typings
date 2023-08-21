export = MultisigDescriptor;
/**
 * MultisigDescriptor
 * Represents a multisig output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0383.mediawiki
 * @property {String} type
 * @property {KeyProvider[]} keyProviders
 * @property {String} scriptContext
 * @property {Number} threshold
 * @property {Boolean} isSorted - true if descriptor is sortedmulti
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class MultisigDescriptor extends AbstractDescriptor {
    /**
     * Instantiate multisig descriptor from options object.
     * @param {Object} options
     * @returns {MultisigDescriptor}
     */
    static fromOptions(options: any): MultisigDescriptor;
    /**
     * Instantiate multisig descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {MultisigDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): MultisigDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    isSorted: boolean;
    threshold: number;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {MultisigDescriptor}
     */
    fromOptions(options: any): MultisigDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {MultisigDescriptor}
     */
    fromString(str: string, network: Network, context: string): MultisigDescriptor;
    /**
     * Get the scripts (helper function).
     * @param {Buffer[]} pubkeys
     * @returns {Script[]}
     */
    _getScripts(pubkeys: Buffer[]): Script[];
    /**
     * Derive addresses from scripts.
     * @param {Script[]} scripts
     * @returns {Address[]}
     */
    getAddresses(scripts: Script[]): Address[];
}
import AbstractDescriptor = require("../abstractdescriptor");
import Network = require("../../protocol/network");
import Script = require("../../script/script");
//# sourceMappingURL=multisig.d.ts.map