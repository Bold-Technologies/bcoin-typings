export = Parser;
/**
 * Parser
 * @alias module:workers.Parser
 * @extends EventEmitter
 */
declare class Parser {
    waiting: number;
    header: any;
    pending: any[];
    total: number;
    feed(data: any): void;
    read(size: any): any;
    parse(data: any): void;
    parseHeader(data: any): Header;
    parsePacket(header: any, data: any): packets.EnvPacket | packets.EventPacket | packets.LogPacket | packets.ErrorPacket | packets.CheckPacket | packets.CheckResultPacket | packets.SignPacket | packets.SignResultPacket | packets.CheckInputPacket | packets.SignInputPacket | packets.SignInputResultPacket | packets.ECVerifyPacket | packets.ECVerifyResultPacket | packets.ECSignPacket | packets.ECSignResultPacket | packets.MinePacket | packets.MineResultPacket | packets.ScryptPacket | packets.ScryptResultPacket;
}
/**
 * Header
 * @ignore
 */
declare class Header {
    /**
     * Create a header.
     * @constructor
     */
    constructor(id: any, cmd: any, size: any);
    id: any;
    cmd: any;
    size: any;
}
import packets = require("./packets");
//# sourceMappingURL=parser.d.ts.map