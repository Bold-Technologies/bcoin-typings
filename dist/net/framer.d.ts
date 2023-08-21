export = Framer;
/**
 * Protocol Message Framer
 * @alias module:net.Framer
 */
declare class Framer {
    /**
     * Create a framer.
     * @constructor
     * @param {Network} network
     */
    constructor(network: Network);
    network: Network;
    /**
     * Frame a payload with a header.
     * @param {String} cmd - Packet type.
     * @param {Buffer} payload
     * @param {Buffer?} checksum - Precomputed checksum.
     * @returns {Buffer} Payload with header prepended.
     */
    packet(cmd: string, payload: Buffer, checksum: Buffer | null): Buffer;
}
import Network = require("../protocol/network");
//# sourceMappingURL=framer.d.ts.map