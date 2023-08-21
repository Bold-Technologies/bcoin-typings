export = SHDescriptor;
/**
 * SHDescriptor
 * Represents a P2SH output script.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0381.mediawiki#sh
 * @property {String} type
 * @property {String} scriptContext
 * @property {Descriptor[]} subdescriptors
 * @property {Network} network
 * @extends AbstractDescriptor
 */
declare class SHDescriptor extends AbstractDescriptor {
    /**
     * Instantiate sh descriptor from options object.
     * @param {Object} options
     * @returns {SHDescriptor}
     */
    static fromOptions(options: any): SHDescriptor;
    /**
     * Instantiate sh descriptor from string.
     * @param {String} str
     * @param {Network} network
     * @param {String?} context
     * @returns {SHDescriptor}
     */
    static fromString(str: string, network: Network, context?: string | null): SHDescriptor;
    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: string;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {SHDescriptor}
     */
    fromOptions(options: any): SHDescriptor;
    /**
     * Inject properties from string.
     * @param {String} str
     * @param {Network} network
     * @param {String} context
     * @returns {SHDescriptor}
     */
    fromString(str: string, network: Network, context: string): SHDescriptor;
    isValidSubdescriptor(type: any): boolean;
    /**
     * Get the scripts (helper function).
     * @param {Buffer[]} pubkeys
     * @param {Script[]} subscripts
     * @returns {Script[]}
     */
    _getScripts(pubkeys: Buffer[], subscripts: Script[]): Script[];
}
import AbstractDescriptor = require("../abstractdescriptor");
import Network = require("../../protocol/network");
import Script = require("../../script/script");
//# sourceMappingURL=sh.d.ts.map