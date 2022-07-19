export = UndoCoins;
/**
 * Undo Coins
 * Coins need to be resurrected from somewhere
 * during a reorg. The undo coins store all
 * spent coins in a single record per block
 * (in a compressed format).
 * @alias module:coins.UndoCoins
 * @property {UndoCoin[]} items
 */
declare class UndoCoins {
    /**
     * Instantiate undo coins from serialized data.
     * @param {Buffer} data
     * @returns {UndoCoins}
     */
    static fromRaw(data: Buffer): UndoCoins;
    items: any[];
    /**
     * Push coin entry onto undo coin array.
     * @param {CoinEntry}
     * @returns {Number}
     */
    push(coin: any): number;
    /**
     * Calculate undo coins size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize all undo coins.
     * @returns {Buffer}
     */
    toRaw(): Buffer;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @returns {UndoCoins}
     */
    private fromRaw;
    /**
     * Test whether the undo coins have any members.
     * @returns {Boolean}
     */
    isEmpty(): boolean;
    /**
     * Render the undo coins.
     * @returns {Buffer}
     */
    commit(): Buffer;
    /**
     * Re-apply undo coins to a view, effectively unspending them.
     * @param {CoinView} view
     * @param {Outpoint} prevout
     */
    apply(view: CoinView, prevout: Outpoint): void;
}
//# sourceMappingURL=undocoins.d.ts.map