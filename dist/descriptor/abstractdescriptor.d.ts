export = AbstractDescriptor;
/**
 * AbstractDescriptor
 * The class which all descriptor-like objects inherit from.
 * Represents an output script.
 * @alias module:descriptor.AbstractDescriptor
 * @see https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md
 * @property {String} type - script expression of descriptor function.
 * @property {KeyProvider[]} keyProviders - parsed key arguments
 * for the descriptor
 * (size 1 for PK, PKH, WPKH; any size for WSH and Multisig).
 * @property {AbstractDescriptor[]} subdescriptors - sub-descriptor arguments
 * for the descriptor (empty for everything but SH and WSH)
 * @property {String} scriptContext
 * @property {Network} network
 */
declare class AbstractDescriptor {
    type: any;
    keyProviders: any[];
    subdescriptors: any[];
    scriptContext: string;
    network: Network;
    /**
     * Inject properties from options object.
     * @param {Object} options
     * @returns {AbstractDescriptor}
     */
    fromOptions(options: any): AbstractDescriptor;
    /**
     * Inject properties from string.
     * @param {String} desc
     * @returns {AbstractDescriptor}
     */
    fromString(desc: string): AbstractDescriptor;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private parseOptions;
    /**
     * Test whether the descriptor contains any private key.
     * @returns {Boolean}
     */
    hasPrivateKeys(): boolean;
    /**
     * Test whether the descriptor contains public/private keys
     * in the form of HD chains
     * @returns {Boolean}
     */
    isRange(): boolean;
    /**
     * Whether this descriptor has all information about signing
     * (ignoring private keys).
     * Returns false only for `addr` and `raw` type.
     * @returns {Boolean}
     */
    isSolvable(): boolean;
    /**
     * Get string form for address and raw descriptors.
     * Also returns threshold string for multisig.
     * Used once in toStringHelper()
     * @returns {String}
     */
    toStringExtra(): string;
    _toStringSubScript(type: any): string;
    /**
     * Helper function to get a descriptor in string form based on string type
     * (Public, Private, Normalized)
     * @param {String} type
     * @returns {String}
     */
    _toString(type: string): string;
    /**
     * Get a descriptor string (public keys only)
     * @returns {String}
     */
    toString(): string;
    /**
     * Get descriptor string including private keys if available
     * @returns {String}
     */
    toPrivateString(): string;
    /**
     * Test whether this descriptor will return one scriptPubKey or
     * multiple (aka is or is not combo)
     * @returns {Boolean}
     */
    isSingleType(): boolean;
    /**
     * Get scripts for the descriptor at a specified position.
     * @param {Number} pos
     * @returns {Script[]}
     */
    generateScripts(pos: number): Script[];
    /**
     * Get the scripts (helper function).
     * @returns {Script[]}
     */
    _getScripts(): Script[];
    /**
     * Derive addresses for the descriptor at a specified position.
     * @param {Number} pos
     * @returns {Address[]}
     */
    getAddresses(pos: number): Address[];
}
import Network = require("../protocol/network");
//# sourceMappingURL=abstractdescriptor.d.ts.map