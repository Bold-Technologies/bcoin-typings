export = Master;
/**
 * Master
 * Represents the master process.
 * @alias module:workers.Master
 * @extends EventEmitter
 */
declare class Master {
    parent: Parent;
    framer: Framer;
    parser: Parser;
    listening: boolean;
    color: boolean;
    /**
     * Initialize master. Bind events.
     * @private
     */
    private init;
    /**
     * Set environment.
     * @param {Object} env
     */
    setEnv(env: any): void;
    /**
     * Set primary network.
     * @param {NetworkType|Network} network
     */
    set(network: NetworkType | Network): Network;
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
     * Emit an event on the worker side.
     * @param {...Object} items
     * @returns {Boolean}
     */
    sendEvent(...items: any[]): boolean;
    /**
     * Destroy the worker.
     */
    destroy(): void;
    /**
     * Write a message to stdout in the master process.
     */
    log(...args: any[]): void;
    /**
     * Listen for messages from master process (only if worker).
     */
    listen(): void;
    /**
     * Handle packet.
     * @private
     * @param {Packet} packet
     */
    private handlePacket;
}
import Parent = require("./parent");
import Framer = require("./framer");
import Parser = require("./parser");
import Network = require("../protocol/network");
//# sourceMappingURL=master.d.ts.map