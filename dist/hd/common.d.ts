export const HARDENED: number;
export const MIN_ENTROPY: number;
export const MAX_ENTROPY: number;
export const cache: LRU;
/**
 * Parse a derivation path.
 * @param {Array} path
 * @param {Boolean} hard
 * @returns {Number[]}
 */
export function parsePathFromArray(path: any[], hard: boolean): number[];
/**
 * Parse a derivation path and return an array of indexes.
 * @see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
 * @param {String} path
 * @param {Boolean} hard
 * @returns {Number[]}
 */
export function parsePath(path: string, hard: boolean): number[];
/**
 * Format the derivation path (indexes).
 * @param {Array} path
 * @param {String} hardenedMarker `h` or `'`
 * Whether to format path using apostrophes (e.g. `m/44'/0'/0'`)
 * or with h (e.g. `m/44h/0h/0h`).
 * @returns {String}
 */
export function format(path: any[], hardenedMarker: string): string;
/**
 * Test whether the key is a master key.
 * @param {HDPrivateKey|HDPublicKey} key
 * @returns {Boolean}
 */
export function isMaster(key: HDPrivateKey | HDPublicKey): boolean;
/**
 * Test whether the key is (most likely) a BIP44 account key.
 * @param {HDPrivateKey|HDPublicKey} key
 * @param {Number?} account
 * @returns {Boolean}
 */
export function isAccount(key: HDPrivateKey | HDPublicKey, account: number | null): boolean;
export const ZERO_KEY: Buffer;
//# sourceMappingURL=common.d.ts.map