export = Parser;
/**
 * Protocol Message Parser
 * @alias module:net.Parser
 * @extends EventEmitter
 * @emits Parser#error
 * @emits Parser#packet
 */
declare class Parser {
    /**
     * Create a parser.
     * @constructor
     * @param {Network} network
     */
    constructor(network: Network);
    network: Network;
    pending: any[];
    total: number;
    waiting: number;
    header: Header;
    /**
     * Emit an error.
     * @private
     */
    private error;
    /**
     * Feed data to the parser.
     * @param {Buffer} data
     */
    feed(data: Buffer): void;
    /**
     * Parse a fully-buffered chunk.
     * @param {Buffer} data
     */
    parse(data: Buffer): void;
    /**
     * Parse buffered packet header.
     * @param {Buffer} data - Header.
     * @returns {Header}
     */
    parseHeader(data: Buffer): Header;
    /**
     * Parse a payload.
     * @param {String} cmd - Packet type.
     * @param {Buffer} data - Payload.
     * @returns {Object}
     */
    parsePayload(cmd: string, data: Buffer): any;
}
import Network = require("../protocol/network");
/**
 * Packet Header
 * @ignore
 */
declare class Header {
    /**
     * Create a header.
     * @constructor
     */
    constructor(cmd: any, size: any, checksum: any);
    cmd: any;
    size: any;
    checksum: any;
}
//# sourceMappingURL=parser.d.ts.map