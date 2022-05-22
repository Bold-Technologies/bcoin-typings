/**
 * Test whether a string is eligible
 * to be used as a name or ID.
 * @param {String} key
 * @returns {Boolean}
 */
export function isName(key: string): boolean;
/**
 * Sort an array of transactions by time.
 * @param {TX[]} txs
 * @returns {TX[]}
 */
export function sortTX(txs: TX[]): TX[];
/**
 * Sort an array of coins by height.
 * @param {Coin[]} txs
 * @returns {Coin[]}
 */
export function sortCoins(coins: any): Coin[];
/**
 * Sort an array of transactions in dependency order.
 * @param {TX[]} txs
 * @returns {TX[]}
 */
export function sortDeps(txs: TX[]): TX[];
//# sourceMappingURL=common.d.ts.map