export = Peer;
/**
 * Represents a network peer.
 * @alias module:net.Peer
 * @extends EventEmitter
 * @property {net.Socket} socket
 * @property {NetAddress} address
 * @property {Parser} parser
 * @property {Framer} framer
 * @property {Number} version
 * @property {Boolean} destroyed
 * @property {Boolean} ack - Whether verack has been received.
 * @property {Boolean} connected
 * @property {Number} time
 * @property {Boolean} preferHeaders - Whether the peer has
 * requested getheaders.
 * @property {Hash?} hashContinue - The block hash at which to continue
 * the sync for the peer.
 * @property {Bloom?} spvFilter - The _peer's_ bloom spvFilter.
 * @property {Boolean} noRelay - Whether to relay transactions
 * immediately to the peer.
 * @property {BN} challenge - Local nonce.
 * @property {Number} lastPong - Timestamp for last `pong`
 * received (unix time).
 * @property {Number} lastPing - Timestamp for last `ping`
 * sent (unix time).
 * @property {Number} minPing - Lowest ping time seen.
 * @property {Number} banScore
 */
declare class Peer {
    /**
     * Create inbound peer from socket.
     * @param {PeerOptions} options
     * @param {net.Socket} socket
     * @returns {Peer}
     */
    static fromInbound(options: PeerOptions, socket: net.Socket): Peer;
    /**
     * Create outbound peer from net address.
     * @param {PeerOptions} options
     * @param {NetAddress} addr
     * @returns {Peer}
     */
    static fromOutbound(options: PeerOptions, addr: NetAddress): Peer;
    /**
     * Create a peer from options.
     * @param {Object} options
     * @returns {Peer}
     */
    static fromOptions(options: any): Peer;
    /**
     * Create a peer.
     * @alias module:net.Peer
     * @constructor
     * @param {PeerOptions|PoolOptions} options
     */
    constructor(options: PeerOptions | PoolOptions);
    options: any;
    network: any;
    logger: any;
    locker: any;
    parser: Parser;
    framer: Framer;
    id: number;
    socket: any;
    opened: boolean;
    outbound: boolean;
    loader: boolean;
    address: NetAddress;
    local: NetAddress;
    name: any;
    connected: boolean;
    destroyed: boolean;
    ack: boolean;
    handshake: boolean;
    time: number;
    lastSend: number;
    lastRecv: number;
    drainSize: number;
    drainQueue: any[];
    banScore: number;
    invQueue: any[];
    onPacket: any;
    next: any;
    prev: any;
    version: number;
    services: number;
    height: number;
    agent: any;
    noRelay: boolean;
    preferHeaders: boolean;
    hashContinue: any;
    spvFilter: any;
    feeRate: number;
    compactMode: number;
    compactWitness: boolean;
    merkleBlock: any;
    merkleTime: number;
    merkleMatches: number;
    merkleMap: any;
    syncing: boolean;
    sentAddr: boolean;
    sentGetAddr: boolean;
    challenge: any;
    lastPong: number;
    lastPing: number;
    minPing: number;
    blockTime: number;
    bestHash: any;
    bestHeight: number;
    connectTimeout: any;
    pingTimer: number;
    invTimer: number;
    stallTimer: number;
    addrFilter: any;
    invFilter: any;
    blockMap: any;
    txMap: any;
    responseMap: Map<any, any>;
    compactBlocks: any;
    /**
     * Begin peer initialization.
     * @private
     */
    private init;
    /**
     * Getter to retrieve hostname.
     * @returns {String}
     */
    hostname(): string;
    /**
     * Frame a payload with a header.
     * @param {String} cmd - Packet type.
     * @param {Buffer} payload
     * @param {Buffer?} checksum
     * @returns {Buffer} Payload with header prepended.
     */
    framePacket(cmd: string, payload: Buffer, checksum: Buffer): Buffer;
    /**
     * Feed data to the parser.
     * @param {Buffer} data
     */
    feedParser(data: Buffer): void;
    /**
     * Bind to socket.
     * @param {net.Socket} socket
     */
    _bind(socket: net.Socket): void;
    /**
     * Accept an inbound socket.
     * @param {net.Socket} socket
     * @returns {net.Socket}
     */
    accept(socket: net.Socket): net.Socket;
    /**
     * Create the socket and begin connecting. This method
     * will use `options.createSocket` if provided.
     * @param {NetAddress} addr
     * @returns {net.Socket}
     */
    connect(addr: NetAddress): net.Socket;
    /**
     * Do a reverse dns lookup on peer's addr.
     * @returns {Promise}
     */
    getName(): Promise<any>;
    /**
     * Open and perform initial handshake (without rejection).
     * @method
     * @returns {Promise}
     */
    tryOpen(): Promise<any>;
    /**
     * Open and perform initial handshake.
     * @method
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Open and perform initial handshake.
     * @method
     * @returns {Promise}
     */
    _open(): Promise<any>;
    /**
     * Wait for connection.
     * @private
     * @returns {Promise}
     */
    private initConnect;
    /**
     * Setup stall timer.
     * @private
     * @returns {Promise}
     */
    private initStall;
    /**
     * Handle post handshake.
     * @method
     * @private
     * @returns {Promise}
     */
    private initVersion;
    /**
     * Finalize peer after handshake.
     * @method
     * @private
     * @returns {Promise}
     */
    private finalize;
    /**
     * Broadcast blocks to peer.
     * @param {Block|Block[]} blocks
     */
    announceBlock(blocks: Block | Block[]): void;
    /**
     * Broadcast transactions to peer.
     * @param {TX|TX[]} txs
     */
    announceTX(txs: TX | TX[]): void;
    /**
     * Send inv to a peer.
     * @param {InvItem[]} items
     */
    queueInv(items: InvItem[]): void;
    /**
     * Flush inv queue.
     * @private
     */
    private flushInv;
    /**
     * Force send an inv (no filter check).
     * @param {InvItem[]} items
     */
    sendInv(items: InvItem[]): void;
    /**
     * Send headers to a peer.
     * @param {Headers[]} items
     */
    sendHeaders(items: Headers[]): void;
    /**
     * Send a compact block.
     * @private
     * @param {Block} block
     * @returns {Boolean}
     */
    private sendCompactBlock;
    /**
     * Send a `version` packet.
     */
    sendVersion(): void;
    /**
     * Send a `getaddr` packet.
     */
    sendGetAddr(): void;
    /**
     * Send a `ping` packet.
     */
    sendPing(): void;
    /**
     * Send `filterload` to update the local bloom filter.
     */
    sendFilterLoad(filter: any): void;
    /**
     * Set a fee rate filter for the peer.
     * @param {Rate} rate
     */
    sendFeeRate(rate: Rate): void;
    /**
     * Disconnect from and destroy the peer.
     */
    destroy(): void;
    /**
     * Write data to the peer's socket.
     * @param {Buffer} data
     */
    write(data: Buffer): void;
    /**
     * Send a packet.
     * @param {Packet} packet
     */
    send(packet: Packet): void;
    /**
     * Send a packet.
     * @param {String} cmd - Packet type.
     * @param {Buffer} body
     * @param {Buffer?} checksum
     */
    sendRaw(cmd: string, body: Buffer, checksum: Buffer): void;
    /**
     * Wait for a drain event.
     * @returns {Promise}
     */
    drain(): Promise<any>;
    /**
     * Handle drain event.
     * @private
     */
    private handleDrain;
    /**
     * Add to drain counter.
     * @private
     * @param {Number} size
     */
    private needsDrain;
    /**
     * Potentially add response timeout.
     * @private
     * @param {Packet} packet
     */
    private addTimeout;
    /**
     * Potentially finish response timeout.
     * @private
     * @param {Packet} packet
     */
    private fulfill;
    /**
     * Potentially timeout peer if it hasn't responded.
     * @private
     */
    private maybeTimeout;
    /**
     * Wait for a packet to be received from peer.
     * @private
     * @param {Number} type - Packet type.
     * @param {Number} timeout
     * @returns {RequestEntry}
     */
    private request;
    /**
     * Fulfill awaiting requests created with {@link Peer#request}.
     * @private
     * @param {Number} type - Packet type.
     * @param {Object} payload
     */
    private response;
    /**
     * Wait for a packet to be received from peer.
     * @private
     * @param {Number} type - Packet type.
     * @param {Number} timeout
     * @returns {Promise} - Returns Object(payload).
     * Executed on timeout or once packet is received.
     */
    private wait;
    /**
     * Emit an error and destroy the peer.
     * @private
     * @param {...String|Error} err
     */
    private error;
    /**
     * Calculate peer block inv type (filtered,
     * compact, witness, or non-witness).
     * @returns {Number}
     */
    blockType(): number;
    /**
     * Calculate peer tx inv type (witness or non-witness).
     * @returns {Number}
     */
    txType(): number;
    /**
     * Send `getdata` to peer.
     * @param {InvItem[]} items
     */
    getData(items: InvItem[]): void;
    /**
     * Send batched `getdata` to peer.
     * @param {InvType} type
     * @param {Hash[]} hashes
     */
    getItems(type: InvType, hashes: Hash[]): void;
    /**
     * Send batched `getdata` to peer (blocks).
     * @param {Hash[]} hashes
     */
    getBlock(hashes: Hash[]): void;
    /**
     * Send batched `getdata` to peer (txs).
     * @param {Hash[]} hashes
     */
    getTX(hashes: Hash[]): void;
    /**
     * Send `getdata` to peer for a single block.
     * @param {Hash} hash
     */
    getFullBlock(hash: Hash): void;
    /**
     * Handle a packet payload.
     * @method
     * @private
     * @param {Packet} packet
     */
    private readPacket;
    /**
     * Handle a packet payload without a lock.
     * @method
     * @private
     * @param {Packet} packet
     */
    private handlePacket;
    /**
     * Handle `version` packet.
     * @method
     * @private
     * @param {VersionPacket} packet
     */
    private handleVersion;
    /**
     * Handle `verack` packet.
     * @method
     * @private
     * @param {VerackPacket} packet
     */
    private handleVerack;
    /**
     * Handle `ping` packet.
     * @method
     * @private
     * @param {PingPacket} packet
     */
    private handlePing;
    /**
     * Handle `pong` packet.
     * @method
     * @private
     * @param {PongPacket} packet
     */
    private handlePong;
    /**
     * Handle `sendheaders` packet.
     * @method
     * @private
     * @param {SendHeadersPacket} packet
     */
    private handleSendHeaders;
    /**
     * Handle `filterload` packet.
     * @method
     * @private
     * @param {FilterLoadPacket} packet
     */
    private handleFilterLoad;
    /**
     * Handle `filteradd` packet.
     * @method
     * @private
     * @param {FilterAddPacket} packet
     */
    private handleFilterAdd;
    /**
     * Handle `filterclear` packet.
     * @method
     * @private
     * @param {FilterClearPacket} packet
     */
    private handleFilterClear;
    /**
     * Handle `feefilter` packet.
     * @method
     * @private
     * @param {FeeFilterPacket} packet
     */
    private handleFeeFilter;
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {SendCmpctPacket} packet
     */
    private handleSendCmpct;
    /**
     * Send `getheaders` to peer. Note that unlike
     * `getblocks`, `getheaders` can have a null locator.
     * @param {Hash[]?} locator - Chain locator.
     * @param {Hash?} stop - Hash to stop at.
     */
    sendGetHeaders(locator: Hash[] | null, stop: Hash | null): void;
    /**
     * Send `getblocks` to peer.
     * @param {Hash[]} locator - Chain locator.
     * @param {Hash?} stop - Hash to stop at.
     */
    sendGetBlocks(locator: Hash[], stop: Hash | null): void;
    /**
     * Send `cfilter` to peer.
     * @param {Number} filterType
     * @param {Hash} blockHash
     * @param {Buffer} filter
     */
    sendCFilter(filterType: number, blockHash: Hash, filter: Buffer): void;
    /**
     * Send `cfheaders` to peer.
     * @param {Number} filterType
     * @param {Hash} stopHash
     * @param {Hash} previousFilterHeader
     * @param {Hash[]} filterHashes
     */
    sendCFHeaders(filterType: number, stopHash: Hash, previousFilterHeader: Hash, filterHashes: Hash[]): void;
    /**
     * send `cfcheckpt` to peer.
     * @param {Number} filterType
     * @param {Hash} stopHash
     * @param {Hash[]} filterHeaders
     */
    sendCFCheckpt(filterType: number, stopHash: Hash, filterHeaders: Hash[]): void;
    /**
     * Send `mempool` to peer.
     */
    sendMempool(): void;
    /**
     * Send `reject` to peer.
     * @param {Number} code
     * @param {String} reason
     * @param {String} msg
     * @param {Hash} hash
     */
    sendReject(code: number, reason: string, msg: string, hash: Hash): void;
    /**
     * Send a `sendcmpct` packet.
     * @param {Number} mode
     */
    sendCompact(mode: number): void;
    /**
     * Increase banscore on peer.
     * @param {Number} score
     * @returns {Boolean}
     */
    increaseBan(score: number): boolean;
    /**
     * Ban peer.
     */
    ban(): void;
    /**
     * Send a `reject` packet to peer.
     * @param {String} msg
     * @param {VerifyError} err
     * @returns {Boolean}
     */
    reject(msg: string, err: VerifyError): boolean;
    /**
     * Returns human readable list of services
     * that are available.
     * @returns {String[]}
     */
    getServiceNames(): string[];
    /**
     * Test whether required services are available.
     * @param {Number} services
     * @returns {Boolean}
     */
    hasServices(services: number): boolean;
    /**
     * Test whether the WITNESS service bit is set.
     * @returns {Boolean}
     */
    hasWitness(): boolean;
    /**
     * Test whether the peer supports compact blocks.
     * @returns {Boolean}
     */
    hasCompactSupport(): boolean;
    /**
     * Test whether the peer sent us a
     * compatible compact block handshake.
     * @returns {Boolean}
     */
    hasCompact(): boolean;
}
declare namespace Peer {
    const DRAIN_MAX: number;
    const STALL_INTERVAL: number;
    const PING_INTERVAL: number;
    const INV_INTERVAL: number;
    const RESPONSE_TIMEOUT: number;
    const BLOCK_TIMEOUT: number;
    const TX_TIMEOUT: number;
    const TIMEOUT_INTERVAL: number;
}
import Parser = require("./parser");
import Framer = require("./framer");
import NetAddress = require("./netaddress");
import Block = require("../primitives/block");
import TX = require("../primitives/tx");
import InvItem = require("../primitives/invitem");
/**
 * Peer Options
 * @alias module:net.PeerOptions
 */
declare class PeerOptions {
    /**
     * Instantiate options from object.
     * @param {Object} options
     * @returns {PeerOptions}
     */
    static fromOptions(options: any): PeerOptions;
    /**
     * Get the chain height.
     * @private
     * @returns {Number}
     */
    private static getHeight;
    /**
     * Test whether the chain is synced.
     * @private
     * @returns {Boolean}
     */
    private static isFull;
    /**
     * Whether segwit is enabled.
     * @private
     * @returns {Boolean}
     */
    private static hasWitness;
    /**
     * Create a version packet nonce.
     * @private
     * @param {String} hostname
     * @returns {Buffer}
     */
    private static createNonce;
    /**
     * Test whether version nonce is ours.
     * @private
     * @param {Buffer} nonce
     * @returns {Boolean}
     */
    private static hasNonce;
    /**
     * Get fee rate for txid.
     * @private
     * @param {Hash} hash
     * @returns {Rate}
     */
    private static getRate;
    /**
     * Create peer options.
     * @constructor
     */
    constructor(options: any);
    network: Network;
    logger: any;
    createSocket: any;
    version: number;
    services: number;
    agent: string;
    noRelay: boolean;
    spv: boolean;
    compact: boolean;
    headers: boolean;
    banScore: number;
    getHeight: typeof PeerOptions.getHeight;
    isFull: typeof PeerOptions.isFull;
    hasWitness: typeof PeerOptions.hasWitness;
    createNonce: typeof PeerOptions.createNonce;
    hasNonce: typeof PeerOptions.hasNonce;
    getRate: typeof PeerOptions.getRate;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {PeerOptions}
     */
    private fromOptions;
}
import Network = require("../protocol/network");
//# sourceMappingURL=peer.d.ts.map