/**
 * Return hrtime (shim for browser).
 * @param {Array} time
 * @returns {Array} [seconds, nanoseconds]
 */
export function bench(time: any[]): any[];
/**
 * Get current time in unix time (seconds).
 * @returns {Number}
 */
export function now(): number;
/**
 * Get current time in unix time (milliseconds).
 * @returns {Number}
 */
export function ms(): number;
/**
 * Create a Date ISO string from time in unix time (seconds).
 * @param {Number?} time - Seconds in unix time.
 * @returns {String}
 */
export function date(time: number | null): string;
/**
 * Get unix seconds from a Date string.
 * @param {String?} date - Date ISO String.
 * @returns {Number}
 */
export function time(date: string | null): number;
/**
 * Reverse a hex-string.
 * @param {Buffer}
 * @returns {String} Reversed hex string.
 */
export function revHex(buf: any): string;
export function fromRev(str: any): any;
//# sourceMappingURL=util.d.ts.map