export = Parent;
/**
 * Parent
 * Represents the parent process.
 * @alias module:workers.Parent
 * @extends EventEmitter
 */
declare class Parent {
    /**
     * Initialize master (node.js).
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
//# sourceMappingURL=parent.d.ts.map