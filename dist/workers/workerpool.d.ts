export = WorkerPool;
/**
 * Worker Pool
 * @alias module:workers.WorkerPool
 * @extends EventEmitter
 * @property {Number} size
 * @property {Number} timeout
 * @property {Map} children
 * @property {Number} uid
 */
declare class WorkerPool {
    /**
     * Create a worker pool.
     * @constructor
     * @param {Object} options
     * @param {Number} [options.size=num-cores] - Max pool size.
     * @param {Number} [options.timeout=120000] - Execution timeout.
     */
    constructor(options: {
        size?: number;
        timeout?: number;
    });
    enabled: boolean;
    size: number;
    timeout: number;
    file: any;
    children: Map<any, any>;
    uid: number;
    /**
     * Set worker pool options.
     * @param {Object} options
     */
    set(options: any): void;
    /**
     * Open worker pool.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close worker pool.
     * @returns {Promise}
     */
    close(): Promise<any>;
    /**
     * Spawn a new worker.
     * @param {Number} id - Worker ID.
     * @returns {Worker}
     */
    spawn(id: number): Worker;
    /**
     * Allocate a new worker, will not go above `size` option
     * and will automatically load balance the workers.
     * @returns {Worker}
     */
    alloc(): Worker;
    /**
     * Emit an event on the worker side (all workers).
     * @param {String} event
     * @param {...Object} arg
     * @returns {Boolean}
     */
    sendEvent(...args: any[]): boolean;
    /**
     * Destroy all workers.
     */
    destroy(): void;
    /**
     * Call a method for a worker to execute.
     * @param {Packet} packet
     * @param {Number} timeout
     * @returns {Promise}
     */
    execute(packet: Packet, timeout: number): Promise<any>;
    /**
     * Execute the tx check job (default timeout).
     * @method
     * @param {TX} tx
     * @param {CoinView} view
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    check(tx: TX, view: CoinView, flags: VerifyFlags): Promise<any>;
    /**
     * Execute the tx signing job (default timeout).
     * @method
     * @param {MTX} tx
     * @param {KeyRing[]} ring
     * @param {SighashType} type
     * @returns {Promise}
     */
    sign(tx: MTX, ring: KeyRing[], type: SighashType): Promise<any>;
    /**
     * Execute the tx input check job (default timeout).
     * @method
     * @param {TX} tx
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {VerifyFlags} flags
     * @returns {Promise}
     */
    checkInput(tx: TX, index: number, coin: Coin | Output, flags: VerifyFlags): Promise<any>;
    /**
     * Execute the tx input signing job (default timeout).
     * @method
     * @param {MTX} tx
     * @param {Number} index
     * @param {Coin|Output} coin
     * @param {KeyRing} ring
     * @param {SighashType} type
     * @returns {Promise}
     */
    signInput(tx: MTX, index: number, coin: Coin | Output, ring: KeyRing, type: SighashType): Promise<any>;
    /**
     * Execute the secp256k1 verify job (no timeout).
     * @method
     * @param {Buffer} msg
     * @param {Buffer} sig - DER formatted.
     * @param {Buffer} key
     * @returns {Promise}
     */
    ecVerify(msg: Buffer, sig: Buffer, key: Buffer): Promise<any>;
    /**
     * Execute the secp256k1 signing job (no timeout).
     * @method
     * @param {Buffer} msg
     * @param {Buffer} key
     * @returns {Promise}
     */
    ecSign(msg: Buffer, key: Buffer): Promise<any>;
    /**
     * Execute the mining job (no timeout).
     * @method
     * @param {Buffer} data
     * @param {Buffer} target
     * @param {Number} min
     * @param {Number} max
     * @returns {Promise} - Returns {Number}.
     */
    mine(data: Buffer, target: Buffer, min: number, max: number): Promise<any>;
    /**
     * Execute scrypt job (no timeout).
     * @method
     * @param {Buffer} passwd
     * @param {Buffer} salt
     * @param {Number} N
     * @param {Number} r
     * @param {Number} p
     * @param {Number} len
     * @returns {Promise}
     */
    scrypt(passwd: Buffer, salt: Buffer, N: number, r: number, p: number, len: number): Promise<any>;
}
/**
 * Worker
 * @alias module:workers.Worker
 * @extends EventEmitter
 */
declare class Worker {
    /**
     * Create a worker.
     * @constructor
     * @param {String} file
     */
    constructor(file: string);
    id: number;
    framer: Framer;
    parser: Parser;
    pending: Map<any, any>;
    child: Child;
    /**
     * Initialize worker. Bind to events.
     * @private
     */
    private init;
    /**
     * Listen for packets.
     * @private
     */
    private listen;
    /**
     * Handle packet.
     * @private
     * @param {Packet} packet
     */
    private handlePacket;
    /**
     * Send data to worker.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    write(data: Buffer): boolean;
    /**
     * Frame and send a packet.
     * @param {Packet} packet
     * @returns {Boolean}
     */
    send(packet: Packet): boolean;
    /**
     * Send environment.
     * @param {Object} env
     * @returns {Boolean}
     */
    sendEnv(env: any): boolean;
    /**
     * Emit an event on the worker side.
     * @param {String} event
     * @param {...Object} arg
     * @returns {Boolean}
     */
    sendEvent(...items: any[]): boolean;
    /**
     * Destroy the worker.
     */
    destroy(): void;
    /**
     * Call a method for a worker to execute.
     * @param {Packet} packet
     * @param {Number} timeout
     * @returns {Promise}
     */
    execute(packet: Packet, timeout: number): Promise<any>;
    /**
     * Call a method for a worker to execute.
     * @private
     * @param {Packet} packet
     * @param {Number} timeout
     * @param {Function} resolve
     * @param {Function} reject
     * the worker method specifies.
     */
    private _execute;
    /**
     * Resolve a job.
     * @param {Number} id
     * @param {Packet} result
     */
    resolveJob(id: number, result: Packet): void;
    /**
     * Reject a job.
     * @param {Number} id
     * @param {Error} err
     */
    rejectJob(id: number, err: Error): void;
    /**
     * Kill all jobs associated with worker.
     */
    killJobs(): void;
}
import Framer = require("./framer");
import Parser = require("./parser");
import Child = require("./child");
//# sourceMappingURL=workerpool.d.ts.map