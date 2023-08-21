export = Parent;
/**
 * Parent
 * Represents the parent process.
 * @alias module:workers.Parent
 * @extends EventEmitter
 * @ignore
 */
declare class Parent extends EventEmitter {
    /**
     * Create the parent process.
     * @constructor
     */
    constructor();
    /**
     * Initialize master (web workers).
     * @private
     */
    private init;
    /**
     * Send data to parent process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    write(data: Buffer): boolean;
    /**
     * Destroy the parent process.
     */
    destroy(): void;
}
import EventEmitter = require("events");
//# sourceMappingURL=parent-browser.d.ts.map