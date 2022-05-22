export = Network;
/**
 * Network
 * Represents a network.
 * @alias module:protocol.Network
 */
declare class Network {
    /**
     * Create a network. Get existing network if possible.
     * @param {NetworkType|Object} options
     * @returns {Network}
     */
    static create(options: NetworkType | any): Network;
    /**
     * Set the default network. This network will be used
     * if nothing is passed as the `network` option for
     * certain objects.
     * @param {NetworkType} type - Network type.
     * @returns {Network}
     */
    static set(type: NetworkType): Network;
    /**
     * Get a network with a string or a Network object.
     * @param {NetworkType|Network} type - Network type.
     * @returns {Network}
     */
    static get(type: NetworkType | Network): Network;
    /**
     * Get a network with a string or a Network object.
     * @param {NetworkType|Network} type - Network type.
     * @returns {Network}
     */
    static ensure(type: NetworkType | Network): Network;
    /**
     * Get a network by an associated comparator.
     * @private
     * @param {Object} value
     * @param {Function} compare
     * @param {Network|null} network
     * @param {String} name
     * @returns {Network}
     */
    private static by;
    /**
     * Get a network by its magic number.
     * @param {Number} value
     * @param {Network?} network
     * @returns {Network}
     */
    static fromMagic(value: number, network: Network | null): Network;
    /**
     * Get a network by its WIF prefix.
     * @param {Number} value
     * @param {Network?} network
     * @returns {Network}
     */
    static fromWIF(prefix: any, network: Network | null): Network;
    /**
     * Get a network by its xpubkey prefix.
     * @param {Number} value
     * @param {Network?} network
     * @returns {Network}
     */
    static fromPublic(prefix: any, network: Network | null): Network;
    /**
     * Get a network by its xprivkey prefix.
     * @param {Number} value
     * @param {Network?} network
     * @returns {Network}
     */
    static fromPrivate(prefix: any, network: Network | null): Network;
    /**
     * Get a network by its xpubkey base58 prefix.
     * @param {String} prefix
     * @param {Network?} network
     * @returns {Network}
     */
    static fromPublic58(prefix: string, network: Network | null): Network;
    /**
     * Get a network by its xprivkey base58 prefix.
     * @param {String} prefix
     * @param {Network?} network
     * @returns {Network}
     */
    static fromPrivate58(prefix: string, network: Network | null): Network;
    /**
     * Get a network by its base58 address prefix.
     * @param {Number} value
     * @param {Network?} network
     * @returns {Network}
     */
    static fromBase58(prefix: any, network: Network | null): Network;
    /**
     * Get a network by its bech32 address prefix.
     * @param {String} hrp
     * @param {Network?} network
     * @returns {Network}
     */
    static fromBech32(hrp: string, network: Network | null): Network;
    /**
     * Get a network by its bech32m address prefix.
     * @param {String} hrp
     * @param {Network?} network
     * @returns {Network}
     */
    static fromBech32m(hrp: string, network: Network | null): Network;
    /**
     * Test an object to see if it is a Network.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isNetwork(obj: any): boolean;
    /**
     * Create a network.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    type: any;
    seeds: any;
    magic: any;
    port: any;
    checkpointMap: any;
    lastCheckpoint: any;
    checkpoints: any[];
    halvingInterval: any;
    genesis: any;
    genesisBlock: any;
    pow: any;
    block: any;
    bip30: any;
    activationThreshold: any;
    minerWindow: any;
    deployments: any;
    deploys: any;
    unknownBits: number;
    keyPrefix: any;
    addressPrefix: any;
    requireStandard: any;
    rpcPort: any;
    walletPort: any;
    minRelay: any;
    feeRate: any;
    maxFeeRate: any;
    selfConnect: any;
    requestMempool: any;
    time: TimeData;
    /**
     * Get a deployment by bit index.
     * @param {Number} bit
     * @returns {Object}
     */
    init(): any;
    /**
     * Get a deployment by bit index.
     * @param {Number} bit
     * @returns {Object}
     */
    byBit(bit: number): any;
    /**
     * Get network adjusted time.
     * @returns {Number}
     */
    now(): number;
    /**
     * Get network adjusted time in milliseconds.
     * @returns {Number}
     */
    ms(): number;
    /**
     * Convert the network to a string.
     * @returns {String}
     */
    toString(): string;
}
declare namespace Network {
    const primary: Network;
    const type: string;
    const main: any;
    const testnet: any;
    const regtest: any;
    const simnet: any;
}
import TimeData = require("./timedata");
//# sourceMappingURL=network.d.ts.map