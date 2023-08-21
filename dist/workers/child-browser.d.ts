export = Child;
/**
 * Child
 * Represents a child process.
 * @alias module:workers.Child
 * @extends EventEmitter
 * @ignore
 */
declare class Child extends EventEmitter {
    /**
     * Test whether child process support is available.
     * @returns {Boolean}
     */
    static hasSupport(): boolean;
    /**
     * Represents a child process.
     * @constructor
     * @param {String} file
     */
    constructor(file: string);
    /**
     * Initialize child process. Bind to events.
     * @private
     * @param {String} file
     */
    private init;
    child: Worker;
    /**
     * Send data to child process.
     * @param {Buffer} data
     * @returns {Boolean}
     */
    write(data: Buffer): boolean;
    /**
     * Destroy the child process.
     */
    destroy(): void;
}
import EventEmitter = require("events");
//# sourceMappingURL=child-browser.d.ts.map