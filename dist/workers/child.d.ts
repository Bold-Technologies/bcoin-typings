/// <reference types="node" />
/// <reference types="node" />
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
     * Initialize child process (node.js).
     * @private
     * @param {String} file
     */
    private init;
    child: cp.ChildProcessWithoutNullStreams & cp.ChildProcessByStdio<import("stream").Writable, import("stream").Readable, import("stream").Readable> & cp.ChildProcessByStdio<import("stream").Writable, import("stream").Readable, null> & cp.ChildProcessByStdio<import("stream").Writable, null, import("stream").Readable> & cp.ChildProcessByStdio<null, import("stream").Readable, import("stream").Readable> & cp.ChildProcessByStdio<import("stream").Writable, null, null> & cp.ChildProcessByStdio<null, import("stream").Readable, null> & cp.ChildProcessByStdio<null, null, import("stream").Readable> & cp.ChildProcessByStdio<null, null, null> & cp.ChildProcess;
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
import cp = require("child_process");
//# sourceMappingURL=child.d.ts.map