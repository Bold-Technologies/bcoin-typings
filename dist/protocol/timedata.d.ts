export = TimeData;
/**
 * Time Data
 * An object which handles "adjusted time". This may not
 * look it, but this is actually a semi-consensus-critical
 * piece of code. It handles version packets from peers
 * and calculates what to offset our system clock's time by.
 * @alias module:protocol.TimeData
 * @extends EventEmitter
 * @property {Array} samples
 * @property {Object} known
 * @property {Number} limit
 * @property {Number} offset
 */
declare class TimeData extends EventEmitter {
    /**
     * Create time data.
     * @constructor
     * @param {Number} [limit=200]
     */
    constructor(limit?: number);
    samples: any[];
    known: Map<any, any>;
    limit: number;
    offset: number;
    checked: boolean;
    /**
     * Add time data.
     * @param {String} id
     * @param {Number} time
     */
    add(id: string, time: number): void;
    /**
     * Get the current adjusted time.
     * @returns {Number} Adjusted Time.
     */
    now(): number;
    /**
     * Adjust a timestamp.
     * @param {Number} time
     * @returns {Number} Adjusted Time.
     */
    adjust(time: number): number;
    /**
     * Unadjust a timestamp.
     * @param {Number} time
     * @returns {Number} Local Time.
     */
    local(time: number): number;
    /**
     * Get the current adjusted time in milliseconds.
     * @returns {Number} Adjusted Time.
     */
    ms(): number;
}
import EventEmitter = require("events");
//# sourceMappingURL=timedata.d.ts.map