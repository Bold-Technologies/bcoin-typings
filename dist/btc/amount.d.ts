export = Amount;
/**
 * Amount
 * Represents a bitcoin amount (satoshis internally).
 * @alias module:btc.Amount
 * @property {SatoshiAmount} value
 */
declare class Amount {
    /**
     * Instantiate amount from options.
     * @param {(String|Number)?} value
     * @param {String?} unit
     * @returns {SatoshiAmount}
     */
    static fromOptions(value: (string | number) | null, unit: string | null): SatoshiAmount;
    /**
     * Instantiate amount from value.
     * @private
     * @param {SatoshiAmount} value
     * @returns {SatoshiAmount}
     */
    private static fromValue;
    /**
     * Instantiate amount from satoshis.
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    static fromSatoshis(value: number | string): SatoshiAmount;
    /**
     * Instantiate amount from bits.
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    static fromBits(value: number | string): SatoshiAmount;
    /**
     * Instantiate amount from mbtc.
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    static fromMBTC(value: number | string): SatoshiAmount;
    /**
     * Instantiate amount from btc.
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    static fromBTC(value: number | string): SatoshiAmount;
    /**
     * Instantiate amount from unit.
     * @param {String} unit
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    static from(unit: string, value: number | string): SatoshiAmount;
    /**
     * Safely convert satoshis to a BTC string.
     * This function explicitly avoids any
     * floating point arithmetic.
     * @param {SatoshiAmount|String} value - Satoshis.
     * @param {Boolean} num
     * @returns {String} BTC string.
     */
    static btc(value: SatoshiAmount | string, num: boolean): string;
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String} str - BTC
     * @returns {SatoshiAmount} Satoshis.
     * @throws on parse error
     */
    static value(str: string): SatoshiAmount;
    /**
     * Safely convert satoshis to a BTC string.
     * @param {SatoshiAmount} value
     * @param {Number} exp - Exponent.
     * @param {Boolean} num - Return a number.
     * @returns {String|Number}
     */
    static encode(value: SatoshiAmount, exp: number, num: boolean): string | number;
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String|Number} value - BTC
     * @param {Number} exp - Exponent.
     * @returns {SatoshiAmount} Satoshis.
     * @throws on parse error
     */
    static decode(value: string | number, exp: number): SatoshiAmount;
    /**
     * Create an amount.
     * @constructor
     * @param {(String|Number)?} value
     * @param {String?} unit
     */
    constructor(value: (string | number) | null, unit: string | null);
    value: number;
    /**
     * Inject properties from options.
     * @private
     * @param {(String|Number)?} value
     * @param {String?} unit
     * @returns {SatoshiAmount}
     */
    private fromOptions;
    /**
     * Get satoshi value.
     * @returns {SatoshiAmount}
     */
    toValue(): SatoshiAmount;
    /**
     * Get satoshi string or value.
     * @param {Boolean?} num
     * @returns {String|SatoshiAmount}
     */
    toSatoshis(num: boolean | null): string | SatoshiAmount;
    /**
     * Get bits string or value.
     * @param {Boolean?} num
     * @returns {String|SatoshiAmount}
     */
    toBits(num: boolean | null): string | SatoshiAmount;
    /**
     * Get mbtc string or value.
     * @param {Boolean?} num
     * @returns {String|SatoshiAmount}
     */
    toMBTC(num: boolean | null): string | SatoshiAmount;
    /**
     * Get btc string or value.
     * @param {Boolean?} num
     * @returns {String|SatoshiAmount}
     */
    toBTC(num: boolean | null): string | SatoshiAmount;
    /**
     * Get unit string or value.
     * @param {String} unit - Can be `sat`,
     * `ubtc`, `bits`, `mbtc`, or `btc`.
     * @param {Boolean?} num
     * @returns {String|SatoshiAmount}
     */
    to(unit: string, num: boolean | null): string | SatoshiAmount;
    /**
     * Convert amount to bitcoin string.
     * @returns {String}
     */
    toString(): string;
    /**
     * Inject properties from value.
     * @private
     * @param {SatoshiAmount} value
     * @returns {SatoshiAmount}
     */
    private fromValue;
    /**
     * Inject properties from satoshis.
     * @private
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    private fromSatoshis;
    /**
     * Inject properties from bits.
     * @private
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    private fromBits;
    /**
     * Inject properties from mbtc.
     * @private
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    private fromMBTC;
    /**
     * Inject properties from btc.
     * @private
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    private fromBTC;
    /**
     * Inject properties from unit.
     * @private
     * @param {String} unit
     * @param {Number|String} value
     * @returns {SatoshiAmount}
     */
    private from;
}
//# sourceMappingURL=amount.d.ts.map