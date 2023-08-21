export = WSHDescriptor;
/**
 * WSHDescriptor
 * Represents a P2WSH output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0382.mediawiki#wsh
 * @property {String} type
 * @property {String} scriptContext
 * @property {Descriptor[]} subdescriptors - Subdescriptors
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class WSHDescriptor extends AbstractDescriptor {
    /**
     * Instantiate wsh descriptor from options object.
     * @param {Object} options
     * @returns {WSHDescriptor}
     */
    static fromOptions(options: any): WSHDescriptor;
    /**
     * Instantiate wsh descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {WSHDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): WSHDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {WSHDescriptor}
     */
    fromOptions(options: any): WSHDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {WSHDescriptor}
     */
    fromString(str: string, network: Network, context: string): WSHDescriptor;
    isValidSubdescriptor(type: any): boolean;
    /**
     * Get the scripts (helper function).
     * @param {Buffer[]} pubkeys
     * @param {Script} subscripts
     * @returns {Script[]}
     */
    _getScripts(pubkeys: Buffer[], subscripts: Script): Script[];
}
import AbstractDescriptor = require("../abstractdescriptor");
import Network = require("../../protocol/network");
import Script = require("../../script/script");
//# sourceMappingURL=wsh.d.ts.map