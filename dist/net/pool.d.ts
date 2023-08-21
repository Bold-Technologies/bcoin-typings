export = Pool;
/**
 * Pool
 * A pool of peers for handling all network activity.
 * @alias module:net.Pool
 * @extends EventEmitter
 */
declare class Pool extends EventEmitter {
    /**
     * Create a pool.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    opened: boolean;
    options: PoolOptions;
    network: Network;
    logger: any;
    chain: any;
    mempool: any;
    server: any;
    nonces: NonceList;
    filterIndexers: any;
    locker: any;
    connected: boolean;
    disconnecting: boolean;
    syncing: boolean;
    discovering: boolean;
    spvFilter: any;
    txFilter: any;
    blockMap: any;
    txMap: any;
    compactBlocks: any;
    invMap: any;
    pendingFilter: any;
    pendingRefill: any;
    checkpoints: boolean;
    headerChain: any;
    headerNext: any;
    headerTip: any;
    peers: PeerList;
    hosts: HostList;
    id: number;
    /**
     * Initialize the pool.
     * @private
     */
    private init;
    /**
     * Open the pool, wait for the chain to load.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close and destroy the pool.
     * @method
     * @alias Pool#close
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Reset header chain.
     */
    resetChain(): void;
    /**
     * Connect to the network.
     * @method
     * @returns {Promise}
     */
    connect(): Promise<any>;
    /**
     * Connect to the network (no lock).
     * @method
     * @returns {Promise}
     */
    _connect(): Promise<any>;
    /**
     * Disconnect from the network.
     * @method
     * @returns {Promise}
     */
    disconnect(): Promise<any>;
    /**
     * Disconnect from the network.
     * @method
     * @returns {Promise}
     */
    _disconnect(): Promise<any>;
    /**
     * Start listening on a server socket.
     * @method
     * @private
     * @returns {Promise}
     */
    private listen;
    /**
     * Stop listening on server socket.
     * @method
     * @private
     * @returns {Promise}
     */
    private unlisten;
    /**
     * Start discovery timer.
     * @private
     */
    private startTimer;
    timer: NodeJS.Timeout;
    /**
     * Stop discovery timer.
     * @private
     */
    private stopTimer;
    /**
     * Rediscover seeds and internet gateway.
     * Attempt to add port mapping once again.
     * @returns {Promise}
     */
    discover(): Promise<any>;
    /**
     * Attempt to add port mapping (i.e.
     * remote:8333->local:8333) via UPNP.
     * @returns {Promise}
     */
    discoverGateway(): Promise<any>;
    /**
     * Attempt to resolve DNS seeds if necessary.
     * @param {Boolean} checkPeers
     * @returns {Promise}
     */
    discoverSeeds(checkPeers: boolean): Promise<any>;
    /**
     * Attempt to discover external IP via DNS.
     * @returns {Promise}
     */
    discoverExternal(): Promise<any>;
    /**
     * Handle incoming connection.
     * @private
     * @param {net.Socket} socket
     */
    private handleSocket;
    /**
     * Add a loader peer. Necessary for
     * a sync to even begin.
     * @private
     */
    private addLoader;
    /**
     * Add a loader peer. Necessary for
     * a sync to even begin.
     * @private
     */
    private setLoader;
    /**
     * Start the blockchain sync.
     */
    startSync(): void;
    /**
     * Force sending of a sync to each peer.
     */
    forceSync(): void;
    /**
     * Send a sync to each peer.
     */
    sync(): void;
    /**
     * Stop the sync.
     * @private
     */
    private stopSync;
    /**
     * Send a sync to each peer.
     * @private
     * @param {Boolean?} force
     * @returns {Promise}
     */
    private resync;
    /**
     * Test whether a peer is sync-worthy.
     * @param {Peer} peer
     * @returns {Boolean}
     */
    isSyncable(peer: Peer): boolean;
    /**
     * Start syncing from peer.
     * @method
     * @param {Peer} peer
     * @returns {Promise}
     */
    sendSync(peer: Peer): Promise<any>;
    /**
     * Send a chain locator and start syncing from peer.
     * @method
     * @param {Hash[]} locator
     * @param {Peer} peer
     * @returns {Boolean}
     */
    sendLocator(locator: Hash[], peer: Peer): boolean;
    /**
     * Send `mempool` to all peers.
     */
    sendMempool(): void;
    /**
     * Send `getaddr` to all peers.
     */
    sendGetAddr(): void;
    /**
     * Request current header chain blocks.
     * @private
     * @param {Peer} peer
     */
    private resolveHeaders;
    /**
     * Update all peer heights by their best hash.
     * @param {Hash} hash
     * @param {Number} height
     */
    resolveHeight(hash: Hash, height: number): void;
    /**
     * Find the next checkpoint.
     * @private
     * @param {Number} height
     * @returns {Object}
     */
    private getNextTip;
    /**
     * Announce broadcast list to peer.
     * @param {Peer} peer
     */
    announceList(peer: Peer): void;
    /**
     * Get a block/tx from the broadcast map.
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Promise}
     */
    private getBroadcasted;
    /**
     * Get a block/tx either from the broadcast map, mempool, or blockchain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Promise}
     */
    private getItem;
    /**
     * Send a block from the broadcast list or chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvItem} item
     * @param {Boolean?} witness
     * @returns {Boolean}
     */
    private sendBlock;
    /**
     * Create an outbound peer with no special purpose.
     * @private
     * @param {NetAddress} addr
     * @returns {Peer}
     */
    private createOutbound;
    /**
     * Accept an inbound socket.
     * @private
     * @param {net.Socket} socket
     * @returns {Peer}
     */
    private createInbound;
    /**
     * Allocate new peer id.
     * @returns {Number}
     */
    uid(): number;
    /**
     * Bind to peer events.
     * @private
     * @param {Peer} peer
     */
    private bindPeer;
    /**
     * Handle peer packet event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Packet} packet
     * @returns {Promise}
     */
    private handlePacket;
    /**
     * Handle peer connect event.
     * @method
     * @private
     * @param {Peer} peer
     */
    private handleConnect;
    /**
     * Handle peer open event.
     * @method
     * @private
     * @param {Peer} peer
     */
    private handleOpen;
    /**
     * Handle peer close event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Boolean} connected
     */
    private handleClose;
    /**
     * Handle ban event.
     * @method
     * @private
     * @param {Peer} peer
     */
    private handleBan;
    /**
     * Handle peer version event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {VersionPacket} packet
     */
    private handleVersion;
    /**
     * Handle `verack` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {VerackPacket} packet
     */
    private handleVerack;
    /**
     * Handle `ping` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {PingPacket} packet
     */
    private handlePing;
    /**
     * Handle `pong` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {PongPacket} packet
     */
    private handlePong;
    /**
     * Handle `getaddr` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetAddrPacket} packet
     */
    private handleGetAddr;
    /**
     * Handle peer addr event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {AddrPacket} packet
     */
    private handleAddr;
    /**
     * Handle `inv` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvPacket} packet
     */
    private handleInv;
    /**
     * Handle `inv` packet (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {InvPacket} packet
     */
    private _handleInv;
    /**
     * Handle `inv` packet from peer (containing only BLOCK types).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash[]} hashes
     * @returns {Promise}
     */
    private handleBlockInv;
    /**
     * Handle peer inv packet (txs).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    private handleTXInv;
    /**
     * Handle `getdata` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetDataPacket} packet
     */
    private handleGetData;
    /**
     * Handle peer notfound packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {NotFoundPacket} packet
     */
    private handleNotFound;
    /**
     * Handle peer `getcfilters` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetCFiltersPacket} packet
     */
    private handleGetCFilters;
    /**
     * Handle peer `getcfheaders` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetCFHeadersPacket} packet
     */
    private handleGetCFHeaders;
    /**
     * Handle peer `getcfcheckpt` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetCFCheckptPacket} packet
     */
    private handleGetCFCheckpt;
    /**
     * Handle `getblocks` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetBlocksPacket} packet
     */
    private handleGetBlocks;
    /**
     * Handle `getheaders` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetHeadersPacket} packet
     */
    private handleGetHeaders;
    /**
     * Handle `headers` packet from a given peer.
     * @method
     * @private
     * @param {Peer} peer
     * @param {HeadersPacket} packet
     * @returns {Promise}
     */
    private handleHeaders;
    /**
     * Handle `headers` packet from
     * a given peer without a lock.
     * @method
     * @private
     * @param {Peer} peer
     * @param {HeadersPacket} packet
     * @returns {Promise}
     */
    private _handleHeaders;
    /**
     * Handle `sendheaders` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {SendHeadersPacket} packet
     * @returns {Promise}
     */
    private handleSendHeaders;
    /**
     * Handle `block` packet. Attempt to add to chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {BlockPacket} packet
     * @returns {Promise}
     */
    private handleBlock;
    /**
     * Attempt to add block to chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Block} block
     * @param {Number?} flags
     * @returns {Promise}
     */
    private addBlock;
    /**
     * Attempt to add block to chain (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {Block} block
     * @param {Number?} flags
     * @returns {Promise}
     */
    private _addBlock;
    /**
     * Resolve header chain.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Promise}
     */
    private resolveChain;
    /**
     * Switch to getblocks.
     * @method
     * @private
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Promise}
     */
    private switchSync;
    /**
     * Handle bad orphan.
     * @method
     * @private
     * @param {String} msg
     * @param {VerifyError} err
     * @param {Number} id
     */
    private handleBadOrphan;
    /**
     * Log sync status.
     * @private
     * @param {Block} block
     */
    private logStatus;
    /**
     * Handle a transaction. Attempt to add to mempool.
     * @method
     * @private
     * @param {Peer} peer
     * @param {TXPacket} packet
     * @returns {Promise}
     */
    private handleTX;
    /**
     * Handle a transaction. Attempt to add to mempool (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {TXPacket} packet
     * @returns {Promise}
     */
    private _handleTX;
    /**
     * Handle peer reject event.
     * @method
     * @private
     * @param {Peer} peer
     * @param {RejectPacket} packet
     */
    private handleReject;
    /**
     * Handle `mempool` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {MempoolPacket} packet
     */
    private handleMempool;
    /**
     * Handle `filterload` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterLoadPacket} packet
     */
    private handleFilterLoad;
    /**
     * Handle `filteradd` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterAddPacket} packet
     */
    private handleFilterAdd;
    /**
     * Handle `filterclear` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FilterClearPacket} packet
     */
    private handleFilterClear;
    /**
     * Handle `merkleblock` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {MerkleBlockPacket} packet
     */
    private handleMerkleBlock;
    /**
     * Handle `merkleblock` packet (without a lock).
     * @method
     * @private
     * @param {Peer} peer
     * @param {MerkleBlockPacket} packet
     */
    private _handleMerkleBlock;
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {FeeFilterPacket} packet
     */
    private handleFeeFilter;
    /**
     * Handle `sendcmpct` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {SendCmpctPacket} packet
     */
    private handleSendCmpct;
    /**
     * Handle `cmpctblock` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {CmpctBlockPacket} packet
     */
    private handleCmpctBlock;
    /**
     * Handle `getblocktxn` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {GetBlockTxnPacket} packet
     */
    private handleGetBlockTxn;
    /**
     * Handle `blocktxn` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {BlockTxnPacket} packet
     */
    private handleBlockTxn;
    /**
     * Handle `unknown` packet.
     * @method
     * @private
     * @param {Peer} peer
     * @param {UnknownPacket} packet
     */
    private handleUnknown;
    /**
     * Create an inbound peer from an existing socket.
     * @private
     * @param {net.Socket} socket
     */
    private addInbound;
    /**
     * Allocate a host from the host list.
     * @returns {NetAddress}
     */
    getHost(): NetAddress;
    /**
     * Create an outbound non-loader peer. These primarily
     * exist for transaction relaying.
     * @private
     */
    private addOutbound;
    /**
     * Attempt to refill the pool with peers (no lock).
     * @private
     */
    private fillOutbound;
    /**
     * Attempt to refill the pool with peers (no lock).
     * @private
     */
    private refill;
    /**
     * Remove a peer from any list. Drop all load requests.
     * @private
     * @param {Peer} peer
     */
    private removePeer;
    /**
     * Ban peer.
     * @param {NetAddress} addr
     */
    ban(addr: NetAddress): void;
    /**
     * Unban peer.
     * @param {NetAddress} addr
     */
    unban(addr: NetAddress): void;
    /**
     * Set the spv filter.
     * @param {BloomFilter} filter
     */
    setFilter(filter: BloomFilter): void;
    /**
     * Watch a an address hash (filterload, SPV-only).
     * @param {Buffer|Hash} data
     * @param {String?} enc
     */
    watch(data: Buffer | Hash, enc: string | null): void;
    /**
     * Reset the spv filter (filterload, SPV-only).
     */
    unwatch(): void;
    /**
     * Queue a resend of the bloom filter.
     */
    queueFilterLoad(): void;
    /**
     * Resend the bloom filter to peers.
     */
    sendFilterLoad(): void;
    /**
     * Add an address to the bloom filter (SPV-only).
     * @param {Address|AddressString} address
     */
    watchAddress(address: Address | AddressString): void;
    /**
     * Add an outpoint to the bloom filter (SPV-only).
     * @param {Outpoint} outpoint
     */
    watchOutpoint(outpoint: Outpoint): void;
    /**
     * Send `getblocks` to peer after building
     * locator and resolving orphan root.
     * @method
     * @param {Peer} peer
     * @param {Hash} orphan - Orphan hash to resolve.
     * @returns {Promise}
     */
    resolveOrphan(peer: Peer, orphan: Hash): Promise<any>;
    /**
     * Send `getheaders` to peer after building locator.
     * @method
     * @param {Peer} peer
     * @param {Hash} tip - Tip to build chain locator from.
     * @param {Hash?} stop
     * @returns {Promise}
     */
    getHeaders(peer: Peer, tip: Hash, stop: Hash | null): Promise<any>;
    /**
     * Send `getblocks` to peer after building locator.
     * @method
     * @param {Peer} peer
     * @param {Hash} tip - Tip hash to build chain locator from.
     * @param {Hash?} stop
     * @returns {Promise}
     */
    getBlocks(peer: Peer, tip: Hash, stop: Hash | null): Promise<any>;
    /**
     * Queue a `getdata` request to be sent.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    getBlock(peer: Peer, hashes: Hash[]): void;
    /**
     * Queue a `getdata` request to be sent.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    getTX(peer: Peer, hashes: Hash[]): void;
    /**
     * Test whether the chain has or has seen an item.
     * @method
     * @param {Hash} hash
     * @returns {Promise} - Returns Boolean.
     */
    hasBlock(hash: Hash): Promise<any>;
    /**
     * Test whether the mempool has or has seen an item.
     * @param {Hash} hash
     * @returns {Boolean}
     */
    hasTX(hash: Hash): boolean;
    /**
     * Queue a `getdata` request to be sent.
     * Check tx existence before requesting.
     * @param {Peer} peer
     * @param {Hash[]} hashes
     */
    ensureTX(peer: Peer, hashes: Hash[]): void;
    /**
     * Fulfill a requested tx.
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Boolean}
     */
    resolveTX(peer: Peer, hash: Hash): boolean;
    /**
     * Fulfill a requested block.
     * @param {Peer} peer
     * @param {Hash} hash
     * @returns {Boolean}
     */
    resolveBlock(peer: Peer, hash: Hash): boolean;
    /**
     * Fulfill a requested item.
     * @param {Peer} peer
     * @param {InvItem} item
     * @returns {Boolean}
     */
    resolveItem(peer: Peer, item: InvItem): boolean;
    /**
     * Broadcast a transaction or block.
     * @param {TX|Block} msg
     * @returns {Promise}
     */
    broadcast(msg: TX | Block): Promise<any>;
    /**
     * Announce a block to all peers.
     * @param {Block|Block[]} blocks
     */
    announceBlock(blocks: Block | Block[]): void;
    /**
     * Announce a transaction to all peers.
     * @param {TX|TX[]} txs
     */
    announceTX(txs: TX | TX[]): void;
    /**
     * Returns human readable list of services
     * that are available.
     * @returns {String[]}
     */
    getServiceNames(): string[];
    /**
     * Returns the indexer for the required filterType
     * that are available.
     * @param {Number} filterType - filter type
     * @returns {Indexer} - indexer
     */
    getFilterIndexer(filterType: number): any;
}
declare namespace Pool {
    const DISCOVERY_INTERVAL: number;
}
import EventEmitter = require("events");
/**
 * Pool Options
 * @alias module:net.PoolOptions
 */
declare class PoolOptions {
    /**
     * Instantiate options from object.
     * @param {Object} options
     * @returns {PoolOptions}
     */
    static fromOptions(options: any): PoolOptions;
    /**
     * Create pool options.
     * @constructor
     */
    constructor(options: any);
    network: Network;
    logger: any;
    chain: any;
    mempool: any;
    filterIndexers: any;
    nonces: NonceList;
    prefix: any;
    checkpoints: boolean;
    spv: boolean;
    bip37: boolean;
    bip157: boolean;
    listen: boolean;
    compact: boolean;
    noRelay: boolean;
    host: string;
    port: any;
    publicHost: string;
    publicPort: any;
    maxOutbound: number;
    maxInbound: number;
    createSocket: any;
    createServer: any;
    resolve: any;
    proxy: any;
    onion: boolean;
    upnp: boolean;
    selfish: boolean;
    version: 70015;
    agent: string;
    banScore: 100;
    banTime: number;
    feeRate: number;
    seeds: any;
    nodes: any[];
    invTimeout: number;
    blockMode: number;
    services: number;
    requiredServices: number;
    memory: boolean;
    discover: boolean;
    /**
     * Inject properties from object.
     * @private
     * @param {Object} options
     * @returns {PoolOptions}
     */
    private fromOptions;
    /**
     * Get the chain height.
     * @private
     * @returns {Number}
     */
    private getHeight;
    /**
     * Test whether the chain is synced.
     * @private
     * @returns {Boolean}
     */
    private isFull;
    /**
     * Get required services for outbound peers.
     * @private
     * @returns {Number}
     */
    private getRequiredServices;
    /**
     * Test whether required services are available.
     * @param {Number} services
     * @returns {Boolean}
     */
    hasServices(services: number): boolean;
    /**
     * Whether segwit is enabled.
     * @private
     * @returns {Boolean}
     */
    private hasWitness;
    /**
     * Create a version packet nonce.
     * @private
     * @param {String} hostname
     * @returns {Buffer}
     */
    private createNonce;
    /**
     * Test whether version nonce is ours.
     * @private
     * @param {Buffer} nonce
     * @returns {Boolean}
     */
    private hasNonce;
    /**
     * Get fee rate for txid.
     * @private
     * @param {Hash} hash
     * @returns {Rate}
     */
    private getRate;
    /**
     * Default createSocket call.
     * @private
     * @param {Number} port
     * @param {String} host
     * @returns {net.Socket}
     */
    private _createSocket;
    /**
     * Default resolve call.
     * @private
     * @param {String} name
     * @returns {String[]}
     */
    private _resolve;
}
import Network = require("../protocol/network");
/**
 * Nonce List
 * @ignore
 */
declare class NonceList {
    map: any;
    hosts: Map<any, any>;
    alloc(hostname: any): Buffer;
    has(nonce: any): any;
    remove(hostname: any): boolean;
}
/**
 * Peer List
 * @alias module:net.PeerList
 */
declare class PeerList {
    map: Map<any, any>;
    ids: Map<any, any>;
    list: any;
    load: any;
    inbound: number;
    outbound: number;
    /**
     * Get the list head.
     * @returns {Peer}
     */
    head(): Peer;
    /**
     * Get the list tail.
     * @returns {Peer}
     */
    tail(): Peer;
    /**
     * Get list size.
     * @returns {Number}
     */
    size(): number;
    /**
     * Add peer to list.
     * @param {Peer} peer
     */
    add(peer: Peer): void;
    /**
     * Remove peer from list.
     * @param {Peer} peer
     */
    remove(peer: Peer): void;
    /**
     * Get peer by hostname.
     * @param {String} hostname
     * @returns {Peer}
     */
    get(hostname: string): Peer;
    /**
     * Test whether a peer exists.
     * @param {String} hostname
     * @returns {Boolean}
     */
    has(hostname: string): boolean;
    /**
     * Get peer by ID.
     * @param {Number} id
     * @returns {Peer}
     */
    find(id: number): Peer;
    /**
     * Destroy peer list (kills peers).
     */
    destroy(): void;
}
import HostList = require("./hostlist");
import Peer = require("./peer");
import Address = require("../primitives/address");
import InvItem = require("../primitives/invitem");
//# sourceMappingURL=pool.d.ts.map