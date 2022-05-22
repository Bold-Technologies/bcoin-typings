export = HostList;
/**
 * Host List
 * @alias module:net.HostList
 */
declare class HostList {
    /**
     * Instantiate host list from json object.
     * @param {Object} options
     * @param {Object} json
     * @returns {HostList}
     */
    static fromJSON(options: any, json: any): HostList;
    /**
     * Create a host list.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    options: HostListOptions;
    network: Network;
    logger: any;
    address: NetAddress;
    resolve: any;
    dnsSeeds: any[];
    dnsNodes: any[];
    map: Map<any, any>;
    fresh: any[];
    totalFresh: number;
    used: any[];
    totalUsed: number;
    nodes: any[];
    local: Map<any, any>;
    banned: Map<any, any>;
    timer: number;
    needsFlush: boolean;
    flushing: boolean;
    /**
     * Initialize list.
     * @private
     */
    private init;
    /**
     * Open hostlist and read hosts file.
     * @method
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close hostlist.
     * @method
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Start flush interval.
     */
    start(): void;
    /**
     * Stop flush interval.
     */
    stop(): void;
    /**
     * Read and initialize from hosts file.
     * @method
     * @returns {Promise}
     */
    injectSeeds(): Promise<any>;
    /**
     * Read and initialize from hosts file.
     * @method
     * @returns {Promise}
     */
    loadFile(): Promise<any>;
    /**
     * Flush addrs to hosts file.
     * @method
     * @returns {Promise}
     */
    flush(): Promise<any>;
    /**
     * Get list size.
     * @returns {Number}
     */
    size(): number;
    /**
     * Test whether the host list is full.
     * @returns {Boolean}
     */
    isFull(): boolean;
    /**
     * Reset host list.
     */
    reset(): void;
    /**
     * Mark a peer as banned.
     * @param {String} host
     */
    ban(host: string): void;
    /**
     * Unban host.
     * @param {String} host
     */
    unban(host: string): void;
    /**
     * Clear banned hosts.
     */
    clearBanned(): void;
    /**
     * Test whether the host is banned.
     * @param {String} host
     * @returns {Boolean}
     */
    isBanned(host: string): boolean;
    /**
     * Allocate a new host.
     * @returns {HostEntry}
     */
    getHost(): HostEntry;
    /**
     * Get fresh bucket for host.
     * @private
     * @param {HostEntry} entry
     * @returns {Map}
     */
    private freshBucket;
    /**
     * Get used bucket for host.
     * @private
     * @param {HostEntry} entry
     * @returns {List}
     */
    private usedBucket;
    /**
     * Add host to host list.
     * @param {NetAddress} addr
     * @param {NetAddress?} src
     * @returns {Boolean}
     */
    add(addr: NetAddress, src: NetAddress | null): boolean;
    /**
     * Evict a host from fresh bucket.
     * @param {Map} bucket
     */
    evictFresh(bucket: Map<any, any>): void;
    /**
     * Test whether a host is evictable.
     * @param {HostEntry} entry
     * @returns {Boolean}
     */
    isStale(entry: HostEntry): boolean;
    /**
     * Remove host from host list.
     * @param {String} hostname
     * @returns {NetAddress}
     */
    remove(hostname: string): NetAddress;
    /**
     * Mark host as failed.
     * @param {String} hostname
     */
    markAttempt(hostname: string): void;
    /**
     * Mark host as successfully connected.
     * @param {String} hostname
     */
    markSuccess(hostname: string): void;
    /**
     * Mark host as successfully ack'd.
     * @param {String} hostname
     * @param {Number} services
     */
    markAck(hostname: string, services: number): void;
    /**
     * Pick used for eviction.
     * @param {List} bucket
     */
    evictUsed(bucket: List): any;
    /**
     * Convert address list to array.
     * @returns {NetAddress[]}
     */
    toArray(): NetAddress[];
    /**
     * Add a preferred seed.
     * @param {String} host
     */
    addSeed(host: string): NetAddress;
    /**
     * Add a priority node.
     * @param {String} host
     * @returns {NetAddress}
     */
    addNode(host: string): NetAddress;
    /**
     * Remove a priority node.
     * @param {String} host
     * @returns {Boolean}
     */
    removeNode(host: string): boolean;
    /**
     * Set initial seeds.
     * @param {String[]} seeds
     */
    setSeeds(seeds: string[]): void;
    /**
     * Set priority nodes.
     * @param {String[]} nodes
     */
    setNodes(nodes: string[]): void;
    /**
     * Add a local address.
     * @param {String} host
     * @param {Number} port
     * @param {Number} score
     * @returns {Boolean}
     */
    addLocal(host: string, port: number, score: number): boolean;
    /**
     * Add a local address.
     * @param {NetAddress} addr
     * @param {Number} score
     * @returns {Boolean}
     */
    pushLocal(addr: NetAddress, score: number): boolean;
    /**
     * Get local address based on reachability.
     * @param {NetAddress?} src
     * @returns {NetAddress}
     */
    getLocal(src: NetAddress | null): NetAddress;
    /**
     * Mark local address as seen during a handshake.
     * @param {NetAddress} addr
     * @returns {Boolean}
     */
    markLocal(addr: NetAddress): boolean;
    /**
     * Discover hosts from seeds.
     * @method
     * @returns {Promise}
     */
    discoverSeeds(): Promise<any>;
    /**
     * Discover hosts from nodes.
     * @method
     * @returns {Promise}
     */
    discoverNodes(): Promise<any>;
    /**
     * Lookup node's domain.
     * @method
     * @param {Object} addr
     * @returns {Promise}
     */
    populateNode(addr: any): Promise<any>;
    /**
     * Populate from seed.
     * @method
     * @param {Object} seed
     * @returns {Promise}
     */
    populateSeed(seed: any): Promise<any>;
    /**
     * Lookup hosts from dns host.
     * @method
     * @param {Object} target
     * @returns {Promise}
     */
    populate(target: any): Promise<any>;
    /**
     * Convert host list to json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @returns {HostList}
     */
    private fromJSON;
}
declare namespace HostList {
    const HORIZON_DAYS: number;
    const RETRIES: number;
    const MIN_FAIL_DAYS: number;
    const MAX_FAILURES: number;
    const MAX_REFS: number;
    const VERSION: number;
    namespace scores {
        const NONE: number;
        const IF: number;
        const BIND: number;
        const UPNP: number;
        const DNS: number;
        const MANUAL: number;
        const MAX: number;
    }
    /**
     * *
     */
    type scores = number;
}
/**
 * Host List Options
 * @alias module:net.HostListOptions
 */
declare class HostListOptions {
    /**
     * Create host list options.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    network: Network;
    logger: any;
    resolve: any;
    host: string;
    port: any;
    services: number;
    onion: boolean;
    banTime: number;
    address: NetAddress;
    seeds: any;
    nodes: any[];
    maxBuckets: number;
    maxEntries: number;
    prefix: any;
    filename: any;
    memory: boolean;
    flushInterval: number;
    /**
     * Inject properties from options.
     * @private
     * @param {Object} options
     */
    private fromOptions;
}
import Network = require("../protocol/network");
import NetAddress = require("./netaddress");
/**
 * Host Entry
 * @alias module:net.HostEntry
 */
declare class HostEntry {
    /**
     * Instantiate host entry from options.
     * @param {NetAddress} addr
     * @param {NetAddress} src
     * @returns {HostEntry}
     */
    static fromOptions(addr: NetAddress, src: NetAddress): HostEntry;
    /**
     * Instantiate host entry from json object.
     * @param {Object} json
     * @param {Network} network
     * @returns {HostEntry}
     */
    static fromJSON(json: any, network: Network): HostEntry;
    /**
     * Create a host entry.
     * @constructor
     * @param {NetAddress} addr
     * @param {NetAddress} src
     */
    constructor(addr: NetAddress, src: NetAddress);
    addr: NetAddress;
    src: NetAddress;
    prev: any;
    next: any;
    used: boolean;
    refCount: number;
    attempts: number;
    lastSuccess: number;
    lastAttempt: number;
    /**
     * Inject properties from options.
     * @private
     * @param {NetAddress} addr
     * @param {NetAddress} src
     * @returns {HostEntry}
     */
    private fromOptions;
    /**
     * Get key suitable for a hash table (hostname).
     * @returns {String}
     */
    key(): string;
    /**
     * Get host priority.
     * @param {Number} now
     * @returns {Number}
     */
    chance(now: number): number;
    /**
     * Convert host entry to json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @param {Network} network
     * @returns {HostEntry}
     */
    private fromJSON;
}
//# sourceMappingURL=hostlist.d.ts.map