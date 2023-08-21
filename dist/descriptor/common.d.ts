export namespace types {
    const PK: string;
    const PKH: string;
    const WPKH: string;
    const SH: string;
    const WSH: string;
    const COMBO: string;
    const ADDR: string;
    const MULTI: string;
    const SORTEDMULTI: string;
    const RAW: string;
}
export namespace typesByVal {
    const pk: string;
    const pkh: string;
    const wpkh: string;
    const sh: string;
    const wsh: string;
    const combo: string;
    const addr: string;
    const multi: string;
    const sortedmulti: string;
    const raw: string;
}
export namespace scriptContext {
    const TOP: string;
    const P2SH: string;
    const P2WPKH: string;
    const P2WSH: string;
}
/**
 * Test whether this descriptor string starts with particular script type
 * ('pk', 'pkh', 'wpkh' etc.)
 * @param {String} scriptType script type
 * @param {String} desc descriptor string
 * @returns {Boolean}
 */
export function isType(scriptType: string, desc: string): boolean;
/**
 * Test whether a string is hex string.
 * @param {String} str
 * @returns {Boolean}
 */
export function isHex(str: string): boolean;
/**
 * Get the top level script expression of the descriptor.
 * @param {String} desc descriptor string
 * @returns {String} script expression of descriptor
 */
export function getType(desc: string): string;
/**
 * Strip script expression string from descriptor
 * @param {String} desc descriptor string
 * @returns {String} descriptor string without script expression
 */
export function strip(desc: string): string;
/**
 * Get the checksum of a descriptor string
 * @param {String} desc
 * @returns {String} checksum string
 */
export function createChecksum(desc: string): string;
/**
 * Test whether the descriptor has valid checksum (if present).
 * If requireChecksum is true, will error if no checksum is present.
 * @param {String} desc
 * @param {Boolean?} requireChecksum
 * @returns {String} descriptor string without checksum part
 * @throws {AssertionError}
 */
export function checkChecksum(desc: string, requireChecksum?: boolean | null): string;
/**
 * Get descriptor string with checksum appended.
 * @param {String} desc
 * @returns {String} descriptor string with checksum appended
 */
export function addChecksum(desc: string): string;
//# sourceMappingURL=common.d.ts.map