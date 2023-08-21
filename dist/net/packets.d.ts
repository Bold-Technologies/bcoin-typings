export namespace types {
    const VERSION: number;
    const VERACK: number;
    const PING: number;
    const PONG: number;
    const GETADDR: number;
    const ADDR: number;
    const INV: number;
    const GETDATA: number;
    const NOTFOUND: number;
    const GETBLOCKS: number;
    const GETHEADERS: number;
    const HEADERS: number;
    const SENDHEADERS: number;
    const BLOCK: number;
    const TX: number;
    const REJECT: number;
    const MEMPOOL: number;
    const FILTERLOAD: number;
    const FILTERADD: number;
    const FILTERCLEAR: number;
    const MERKLEBLOCK: number;
    const FEEFILTER: number;
    const SENDCMPCT: number;
    const CMPCTBLOCK: number;
    const GETBLOCKTXN: number;
    const BLOCKTXN: number;
    const GETCFILTERS: number;
    const CFILTER: number;
    const GETCFHEADERS: number;
    const CFHEADERS: number;
    const GETCFCHECKPT: number;
    const CFCHECKPT: number;
    const UNKNOWN: number;
    const INTERNAL: number;
    const DATA: number;
}
/**
 * *
 */
export type types = number;
export const typesByVal: string[];
export function fromRaw(cmd: string, data: Buffer): Packet;
/**
 * Base Packet
 */
export class Packet {
    type: number;
    cmd: string;
    /**
     * Get serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize packet to writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Serialize packet.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from buffer reader.
     * @param {BufferReader} br
     */
    fromReader(br: BufferReader): Packet;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     */
    fromRaw(data: Buffer): Packet;
}
/**
 * Version Packet
 * @extends Packet
 * @property {Number} version - Protocol version.
 * @property {Number} services - Service bits.
 * @property {Number} time - Timestamp of discovery.
 * @property {NetAddress} local - Our address.
 * @property {NetAddress} remote - Their address.
 * @property {Buffer} nonce
 * @property {String} agent - User agent string.
 * @property {Number} height - Chain height.
 * @property {Boolean} noRelay - Whether transactions
 * should be relayed immediately.
 */
export class VersionPacket extends Packet {
    /**
     * Instantiate version packet from options.
     * @param {Object} options
     * @returns {VersionPacket}
     */
    static fromOptions(options: any): VersionPacket;
    /**
     * Instantiate version packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VersionPacket}
     */
    static fromReader(br: BufferReader): VersionPacket;
    /**
     * Instantiate version packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VersionPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): VersionPacket;
    /**
     * Create a version packet.
     * @constructor
     * @param {Object?} options
     * @param {Number} options.version - Protocol version.
     * @param {Number} options.services - Service bits.
     * @param {Number} options.time - Timestamp of discovery.
     * @param {NetAddress} options.local - Our address.
     * @param {NetAddress} options.remote - Their address.
     * @param {Buffer} options.nonce
     * @param {String} options.agent - User agent string.
     * @param {Number} options.height - Chain height.
     * @param {Boolean} options.noRelay - Whether transactions
     * should be relayed immediately.
     */
    constructor(options: any | null);
    version: 70015;
    services: number;
    time: number;
    remote: NetAddress;
    local: NetAddress;
    nonce: Buffer;
    agent: string;
    height: number;
    noRelay: boolean;
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * Verack Packet
 * @extends Packet
 */
export class VerackPacket extends Packet {
    /**
     * Instantiate verack packet from serialized data.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    static fromReader(br: BufferReader): VerackPacket;
    /**
     * Instantiate verack packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): VerackPacket;
}
/**
 * Ping Packet
 * @extends Packet
 * @property {Buffer|null} nonce
 */
export class PingPacket extends Packet {
    /**
     * Instantiate ping packet from serialized data.
     * @param {BufferReader} br
     * @returns {PingPacket}
     */
    static fromReader(br: BufferReader): PingPacket;
    /**
     * Instantiate ping packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {PingPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): PingPacket;
    /**
     * Create a `ping` packet.
     * @constructor
     * @param {Buffer?} nonce
     */
    constructor(nonce: Buffer | null);
    nonce: Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * Pong Packet
 * @extends Packet
 * @property {BN} nonce
 */
export class PongPacket extends Packet {
    /**
     * Instantiate pong packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    static fromReader(br: BufferReader): VerackPacket;
    /**
     * Instantiate pong packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): VerackPacket;
    /**
     * Create a `pong` packet.
     * @constructor
     * @param {BN?} nonce
     */
    constructor(nonce: BN | null);
    nonce: any;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * GetAddr Packet
 * @extends Packet
 */
export class GetAddrPacket extends Packet {
    /**
     * Instantiate getaddr packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetAddrPacket}
     */
    static fromReader(br: BufferReader): GetAddrPacket;
    /**
     * Instantiate getaddr packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetAddrPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): GetAddrPacket;
}
/**
 * Addr Packet
 * @extends Packet
 * @property {NetAddress[]} items
 */
export class AddrPacket extends Packet {
    /**
     * Instantiate addr packet from Buffer reader.
     * @param {BufferReader} br
     * @returns {AddrPacket}
     */
    static fromReader(br: BufferReader): AddrPacket;
    /**
     * Instantiate addr packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {AddrPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): AddrPacket;
    /**
     * Create a `addr` packet.
     * @constructor
     * @param {(NetAddress[])?} items
     */
    constructor(items: (NetAddress[]) | null);
    items: NetAddress[];
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * Inv Packet
 * @extends Packet
 * @property {InvItem[]} items
 */
export class InvPacket extends Packet {
    /**
     * Instantiate inv packet from buffer reader.
     * @param {BufferReader} br
     * @returns {InvPacket}
     */
    static fromReader(br: BufferReader): InvPacket;
    /**
     * Instantiate inv packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {InvPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): InvPacket;
    /**
     * Create a `inv` packet.
     * @constructor
     * @param {(InvItem[])?} items
     */
    constructor(items: (InvItem[]) | null);
    items: InvItem[];
    /**
     * Serialize inv packet to writer.
     * @param {Buffer} bw
     */
    toWriter(bw: Buffer): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * GetData Packet
 * @extends InvPacket
 */
export class GetDataPacket extends InvPacket {
}
/**
 * NotFound Packet
 * @extends InvPacket
 */
export class NotFoundPacket extends InvPacket {
}
/**
 * GetBlocks Packet
 * @extends Packet
 * @property {Hash[]} locator
 * @property {Hash|null} stop
 */
export class GetBlocksPacket extends Packet {
    /**
     * Instantiate getblocks packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetBlocksPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): GetBlocksPacket;
    /**
     * Create a `getblocks` packet.
     * @constructor
     * @param {Hash[]} locator
     * @param {Hash?} stop
     */
    constructor(locator: Hash[], stop: Hash | null);
    version: 70015;
    locator: Hash[];
    stop: Hash;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * GetHeader Packets
 * @extends GetBlocksPacket
 */
export class GetHeadersPacket extends GetBlocksPacket {
    /**
     * Instantiate getheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetHeadersPacket}
     */
    static fromReader(br: BufferReader): GetHeadersPacket;
}
/**
 * Headers Packet
 * @extends Packet
 * @property {Headers[]} items
 */
export class HeadersPacket extends Packet {
    /**
     * Instantiate headers packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): VerackPacket;
    /**
     * Create a `headers` packet.
     * @constructor
     * @param {(Headers[])?} items
     */
    constructor(items: (Headers[]) | null);
    items: Headers[];
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * SendHeaders Packet
 * @extends Packet
 */
export class SendHeadersPacket extends Packet {
    /**
     * Instantiate sendheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {SendHeadersPacket}
     */
    static fromReader(br: BufferReader): SendHeadersPacket;
    /**
     * Instantiate sendheaders packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {SendHeadersPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): SendHeadersPacket;
}
/**
 * Block Packet
 * @extends Packet
 * @property {Block} block
 * @property {Boolean} witness
 */
export class BlockPacket extends Packet {
    /**
     * Instantiate block packet from buffer reader.
     * @param {BufferReader} br
     * @returns {BlockPacket}
     */
    static fromReader(br: BufferReader): BlockPacket;
    /**
     * Instantiate block packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {BlockPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): BlockPacket;
    /**
     * Create a `block` packet.
     * @constructor
     * @param {Block|null} block
     * @param {Boolean?} witness
     */
    constructor(block: Block | null, witness: boolean | null);
    block: any;
    witness: boolean;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * TX Packet
 * @extends Packet
 * @property {TX} block
 * @property {Boolean} witness
 */
export class TXPacket extends Packet {
    /**
     * Instantiate tx packet from buffer reader.
     * @param {BufferReader} br
     * @returns {TXPacket}
     */
    static fromReader(br: BufferReader): TXPacket;
    /**
     * Instantiate tx packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {TXPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): TXPacket;
    /**
     * Create a `tx` packet.
     * @constructor
     * @param {TX|null} tx
     * @param {Boolean?} witness
     */
    constructor(tx: TX | null, witness: boolean | null);
    tx: TX;
    witness: boolean;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * Reject Packet
 * @extends Packet
 * @property {(Number|String)?} code - Code
 * (see {@link RejectPacket.codes}).
 * @property {String?} msg - Message.
 * @property {String?} reason - Reason.
 * @property {(Hash|Buffer)?} data - Transaction or block hash.
 */
export class RejectPacket extends Packet {
    /**
     * Instantiate reject packet from options.
     * @param {Object} options
     * @returns {RejectPacket}
     */
    static fromOptions(options: any): RejectPacket;
    /**
     * Instantiate reject packet from buffer reader.
     * @param {BufferReader} br
     * @returns {RejectPacket}
     */
    static fromReader(br: BufferReader): RejectPacket;
    /**
     * Instantiate reject packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {RejectPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): RejectPacket;
    /**
     * Instantiate reject packet from reason message.
     * @param {Number} code
     * @param {String} reason
     * @param {String?} msg
     * @param {Hash?} hash
     * @returns {RejectPacket}
     */
    static fromReason(code: number, reason: string, msg: string | null, hash: Hash | null): RejectPacket;
    /**
     * Instantiate reject packet from verify error.
     * @param {VerifyError} err
     * @param {(TX|Block)?} obj
     * @returns {RejectPacket}
     */
    static fromError(err: VerifyError, obj: (TX | Block) | null): RejectPacket;
    /**
     * Create reject packet.
     * @constructor
     */
    constructor(options: any);
    message: string;
    code: number;
    reason: string;
    hash: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Get uint256le hash if present.
     * @returns {Hash}
     */
    rhash(): Hash;
    /**
     * Get symbolic code.
     * @returns {String}
     */
    getCode(): string;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Inject properties from reason message and object.
     * @private
     * @param {Number|String} code
     * @param {String} reason
     * @param {String?} msg
     * @param {Hash?} hash
     */
    private fromReason;
}
export namespace RejectPacket {
    namespace codes {
        export const MALFORMED: number;
        export const INVALID: number;
        export const OBSOLETE: number;
        export const DUPLICATE: number;
        export const NONSTANDARD: number;
        export const DUST: number;
        export const INSUFFICIENTFEE: number;
        export const CHECKPOINT: number;
        const INTERNAL_1: number;
        export { INTERNAL_1 as INTERNAL };
        export const HIGHFEE: number;
        export const ALREADYKNOWN: number;
        export const CONFLICT: number;
    }
    /**
     * *
     */
    type codes = number;
    const codesByVal: {
        1: string;
        16: string;
        17: string;
        18: string;
        64: string;
        65: string;
        66: string;
        67: string;
        256: string;
        257: string;
        258: string;
        259: string;
    };
}
/**
 * Mempool Packet
 * @extends Packet
 */
export class MempoolPacket extends Packet {
    /**
     * Instantiate mempool packet from buffer reader.
     * @param {BufferReader} br
     * @returns {VerackPacket}
     */
    static fromReader(br: BufferReader): VerackPacket;
    /**
     * Instantiate mempool packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {VerackPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): VerackPacket;
}
/**
 * FilterLoad Packet
 * @extends Packet
 */
export class FilterLoadPacket extends Packet {
    /**
     * Instantiate filterload packet from buffer reader.
     * @param {BufferReader} br
     * @returns {FilterLoadPacket}
     */
    static fromReader(br: BufferReader): FilterLoadPacket;
    /**
     * Instantiate filterload packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterLoadPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): FilterLoadPacket;
    /**
     * Create a `filterload` packet.
     * @constructor
     * @param {BloomFilter|null} filter
     */
    constructor(filter: BloomFilter | null);
    filter: any;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Ensure the filter is within the size limits.
     * @returns {Boolean}
     */
    isWithinConstraints(): boolean;
}
/**
 * FilterAdd Packet
 * @extends Packet
 * @property {Buffer} data
 */
export class FilterAddPacket extends Packet {
    /**
     * Instantiate filteradd packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterAddPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): FilterAddPacket;
    /**
     * Create a `filteradd` packet.
     * @constructor
     * @param {Buffer?} data
     */
    constructor(data: Buffer | null);
    data: Buffer;
    /**
     * Serialize filteradd packet to writer.
     * @returns {BufferWriter} bw
     */
    toWriter(bw: any): BufferWriter;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * FilterClear Packet
 * @extends Packet
 */
export class FilterClearPacket extends Packet {
    /**
     * Instantiate filterclear packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FilterClearPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): FilterClearPacket;
}
/**
 * MerkleBlock Packet
 * @extends Packet
 * @property {MerkleBlock} block
 */
export class MerkleBlockPacket extends Packet {
    /**
     * Instantiate merkleblock packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {MerkleBlockPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): MerkleBlockPacket;
    /**
     * Create a `merkleblock` packet.
     * @constructor
     * @param {MerkleBlock?} block
     */
    constructor(block: MerkleBlock | null);
    block: MerkleBlock;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * FeeFilter Packet
 * @extends Packet
 * @property {Rate} rate
 */
export class FeeFilterPacket extends Packet {
    /**
     * Instantiate feefilter packet from buffer reader.
     * @param {BufferReader} br
     * @returns {FeeFilterPacket}
     */
    static fromReader(br: BufferReader): FeeFilterPacket;
    /**
     * Instantiate feefilter packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {FeeFilterPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): FeeFilterPacket;
    /**
     * Create a `feefilter` packet.
     * @constructor
     * @param {Rate?} rate
     */
    constructor(rate: Rate | null);
    rate: number;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * SendCmpct Packet
 * @extends Packet
 * @property {Number} mode
 * @property {Number} version
 */
export class SendCmpctPacket extends Packet {
    /**
     * Instantiate sendcmpct packet from buffer reader.
     * @param {BufferReader} br
     * @returns {SendCmpctPacket}
     */
    static fromReader(br: BufferReader): SendCmpctPacket;
    /**
     * Instantiate sendcmpct packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {SendCmpctPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): SendCmpctPacket;
    /**
     * Create a `sendcmpct` packet.
     * @constructor
     * @param {Number|null} mode
     * @param {Number|null} version
     */
    constructor(mode: number | null, version: number | null);
    mode: number;
    version: number;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * CmpctBlock Packet
 * @extends Packet
 * @property {Block} block
 * @property {Boolean} witness
 */
export class CmpctBlockPacket extends Packet {
    /**
     * Instantiate cmpctblock packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CmpctBlockPacket}
     */
    static fromReader(br: BufferReader): CmpctBlockPacket;
    /**
     * Instantiate cmpctblock packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {CmpctBlockPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): CmpctBlockPacket;
    /**
     * Create a `cmpctblock` packet.
     * @constructor
     * @param {Block|null} block
     * @param {Boolean|null} witness
     */
    constructor(block: Block | null, witness: boolean | null);
    block: any;
    witness: boolean;
    /**
     * Serialize cmpctblock packet.
     * @returns {Buffer}
     */
    getSize(): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * GetBlockTxn Packet
 * @extends Packet
 * @property {TXRequest} request
 */
export class GetBlockTxnPacket extends Packet {
    /**
     * Instantiate getblocktxn packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetBlockTxnPacket}
     */
    static fromReader(br: BufferReader): GetBlockTxnPacket;
    /**
     * Instantiate getblocktxn packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {GetBlockTxnPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): GetBlockTxnPacket;
    /**
     * Create a `getblocktxn` packet.
     * @constructor
     * @param {TXRequest?} request
     */
    constructor(request: TXRequest);
    request: any;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * BlockTxn Packet
 * @extends Packet
 * @property {TXResponse} response
 * @property {Boolean} witness
 */
export class BlockTxnPacket extends Packet {
    /**
     * Instantiate blocktxn packet from buffer reader.
     * @param {BufferReader} br
     * @returns {BlockTxnPacket}
     */
    static fromReader(br: BufferReader): BlockTxnPacket;
    /**
     * Instantiate blocktxn packet from serialized data.
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {BlockTxnPacket}
     */
    static fromRaw(data: Buffer, enc: string | null): BlockTxnPacket;
    /**
     * Create a `blocktxn` packet.
     * @constructor
     * @param {TXResponse?} response
     * @param {Boolean?} witness
     */
    constructor(response: TXResponse, witness: boolean | null);
    response: any;
    witness: boolean;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
}
/**
 * GetCFilters Packet
 * @extends Packet
 * @property {Number} startHeight
 * @property {Hash} stopHash
 * @property {Number} filterType
 */
export class GetCFiltersPacket extends Packet {
    /**
     * Instantiate getcfilters packet from buffer reader.
     * @param {BufferReader} br Serialization buffer.
     * @returns {GetCFiltersPacket}
     */
    static fromReader(br: BufferReader): GetCFiltersPacket;
    /**
     * Instantiate getcfilters packet from serialized data.
     * @param {Buffer} data Serialized data.
     * @returns {GetCFiltersPacket}
     */
    static fromRaw(data: Buffer): GetCFiltersPacket;
    /**
     * Create a `getcfilters` packet.
     * @param {Number} filterType - Filter type.
     * @param {Number} startHeight - Start block height.
     * @param {Hash} stopHash - Stop block hash.
     */
    constructor(filterType: number, startHeight: number, stopHash: Hash);
    startHeight: number;
    stopHash: Hash;
    filterType: number;
    /**
     * Inject properties from buffer reader.
     * @param {BufferReader} br Serialization buffer.
     * @returns {GetCFiltersPacket}
     */
    fromReader(br: BufferReader): GetCFiltersPacket;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data Serialized data.
     * @returns {GetCFiltersPacket}
     */
    fromRaw(data: Buffer): GetCFiltersPacket;
}
/**
 * GetCFilter Packet
 * @extends Packet
 * @property {Number?} filterType
 * @property {Hash?} blockHash
 * @property {Buffer?} filterBytes
 */
export class CFilterPacket extends Packet {
    /**
     * Instantiate cfilter packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CFilterPacket}
     */
    static fromReader(br: BufferReader): CFilterPacket;
    /**
     * Instantiate cfilter packet from serialized data.
     * @param {Buffer} data
     * @returns {CFilterPacket}
     */
    static fromRaw(data: Buffer): CFilterPacket;
    /**
     * Create a `cfilter` packet.
     * @constructor
     * @param filterType
     * @param blockHash
     * @param filterBytes
     */
    constructor(filterType: any, blockHash: any, filterBytes: any);
    filterType: any;
    blockHash: any;
    filterBytes: any;
    /**
     * Instantiate cfilter packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CFilterPacket}
     */
    fromReader(br: BufferReader): CFilterPacket;
    /**
     * Instantiate cfilter packet from serialized data.
     * @param {Buffer} data
     * @returns {CFilterPacket}
     */
    fromRaw(data: Buffer): CFilterPacket;
}
/**
 * GetCFHeaders Packet
 * @extends Packet
 * @property {Number} filterType
 * @property {Number} startHeight
 * @property {Hash} stopHash
 */
export class GetCFHeadersPacket extends Packet {
    /**
     * Instantiate getcfheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetCFHeadersPacket}
     */
    static fromReader(br: BufferReader): GetCFHeadersPacket;
    /**
     * Instantiate getcfheaders packet from serialized data.
     * @param {Buffer} data
     * @returns {GetCFHeadersPacket}
     */
    static fromRaw(data: Buffer): GetCFHeadersPacket;
    /**
     * Create a `getcfheaders` packet.
     * @constructor
     * @param {Number} filterType - Filter type.
     * @param {Number} startHeight - Start block height.
     * @param {Hash} stopHash - Stop block hash.
     */
    constructor(filterType: number, startHeight: number, stopHash: Hash);
    filterType: number;
    startHeight: number;
    stopHash: Hash;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {GetCFHeadersPacket}
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {GetCFHeadersPacket}
     */
    private fromRaw;
}
/**
 * CFHeaders Packet
 * @extends Packet
 * @property {Number} filterType
 * @property {Hash?} stopHash
 * @property {Hash} previousFilterHeader
 * @property {(Hash[])?} filterHashes
 */
export class CFHeadersPacket extends Packet {
    /**
     * Instantiate cfheaders packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CFHeadersPacket}
     */
    static fromReader(br: BufferReader): CFHeadersPacket;
    /**
     * Instantiate cfheaders packet from serialized data.
     * @param {Buffer} data
     * @returns {CFHeadersPacket}
     */
    static fromRaw(data: Buffer): CFHeadersPacket;
    /**
     * Create a `cfheaders` packet.
     * @constructor
     * @param {Number} filterType
     * @param {Hash?} stopHash
     * @param {Hash} previousFilterHeader
     * @param {(Hash[])?} filterHashes
     */
    constructor(filterType: number, stopHash: Hash | null, previousFilterHeader: Hash, filterHashes: (Hash[]) | null);
    filterType: number;
    stopHash: Hash;
    previousFilterHeader: Hash;
    filterHashes: Hash[];
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @returns {CFHeadersPacket}
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {CFHeadersPacket}
     */
    private fromRaw;
}
/**
 * create a getcfcheckpt packet.
 * @extends Packet
 * @property {Number} filterType
 * @property {Hash} stopHash
 */
export class GetCFCheckptPacket extends Packet {
    /**
     * Instantiate getcfcheckpt packet from buffer reader.
     * @param {BufferReader} br
     * @returns {GetCFCheckptPacket}
     */
    static fromReader(br: BufferReader): GetCFCheckptPacket;
    /**
     * Instantiate getcfcheckpt packet from serialized data.
     * @param {Buffer} data
     * @returns {GetCFCheckptPacket}
     */
    static fromRaw(data: Buffer): GetCFCheckptPacket;
    /**
     * Create a `getCFCheckptPacket` packet.
     * @constructor
     * @param {Number} filterType - Filter type.
     * @param {Hash?} stopHash - Stop block hash.
     */
    constructor(filterType: number, stopHash: Hash | null);
    filterType: number;
    stopHash: Hash;
    /**
     * Inject properties from buffer reader.
     * @param {BufferReader} br
     * @returns {GetCFCheckptPacket}
     */
    fromReader(br: BufferReader): GetCFCheckptPacket;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     * @returns {GetCFCheckptPacket}
     */
    fromRaw(data: Buffer): GetCFCheckptPacket;
}
/**
 * create a cfcheckpt packet.
 * @extends Packet
 * @property {Number} filterType
 * @property {Hash} stopHash
 * @property {Hash[]} filterHeaders
 */
export class CFCheckptPacket extends Packet {
    /**
     * Instantiate cfcheckpt packet from buffer reader.
     * @param {BufferReader} br
     * @returns {CFCheckptPacket}
     */
    static fromReader(br: BufferReader): CFCheckptPacket;
    /**
     * Instantiate cfcheckpt packet from serialized data.
     * @param {Buffer} data
     * @returns {CFCheckptPacket}
     */
    static fromRaw(data: Buffer): CFCheckptPacket;
    /**
     * Create a `cfcheckpt` packet.
     * @constructor
     * @param {Number} filterType - Filter type.
     * @param {Hash?} stopHash - Stop block hash.
     * @param {Hash[]} filterHeaders - Filter headers.
     */
    constructor(filterType: number, stopHash: Hash | null, filterHeaders: Hash[]);
    filterType: number;
    stopHash: Hash;
    filterHeaders: Hash[];
    /**
     * Inject properties from buffer reader.
     * @param {BufferReader} br
     * @returns {CFCheckptPacket}
     */
    fromReader(br: BufferReader): CFCheckptPacket;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     * @returns {CFCheckptPacket}
     */
    fromRaw(data: Buffer): CFCheckptPacket;
}
/**
 * Unknown Packet
 * @extends Packet
 * @property {String} cmd
 * @property {Buffer} data
 */
export class UnknownPacket extends Packet {
    /**
     * Instantiate unknown packet from serialized data.
     * @param {String} cmd
     * @param {Buffer} data
     * @param {String?} enc
     * @returns {UnknownPacket}
     */
    static fromRaw(cmd: string, data: Buffer, enc: string | null): UnknownPacket;
    /**
     * Create an unknown packet.
     * @constructor
     * @param {String|null} cmd
     * @param {Buffer|null} data
     */
    constructor(cmd: string | null, data: Buffer | null);
    data: Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {String} cmd
     * @param {Buffer} data
     */
    private fromRaw;
}
import NetAddress = require("./netaddress");
import InvItem = require("../primitives/invitem");
import Headers = require("../primitives/headers");
import TX_1 = require("../primitives/tx");
import MerkleBlock = require("../primitives/merkleblock");
//# sourceMappingURL=packets.d.ts.map