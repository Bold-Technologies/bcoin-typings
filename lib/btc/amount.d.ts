export = Amount;
/**
 * Amount
 * Represents a bitcoin amount (satoshis internally).
 * @alias module:btc.Amount
 * @property {Amount} value
 */
declare class Amount {
    /**
     * Instantiate amount from options.
     * @param {(String|Number)?} value
     * @param {String?} unit
     * @returns {Amount}
     */
    static fromOptions(value: (string | number) | null, unit: string | null): Amount;
    /**
     * Instantiate amount from value.
     * @private
     * @param {Amount} value
     * @returns {Amount}
     */
    private static fromValue;
    /**
     * Instantiate amount from satoshis.
     * @param {Number|String} value
     * @returns {Amount}
     */
    static fromSatoshis(value: number | string): Amount;
    /**
     * Instantiate amount from bits.
     * @param {Number|String} value
     * @returns {Amount}
     */
    static fromBits(value: number | string): Amount;
    /**
     * Instantiate amount from mbtc.
     * @param {Number|String} value
     * @returns {Amount}
     */
    static fromMBTC(value: number | string): Amount;
    /**
     * Instantiate amount from btc.
     * @param {Number|String} value
     * @returns {Amount}
     */
    static fromBTC(value: number | string): Amount;
    /**
     * Instantiate amount from unit.
     * @param {String} unit
     * @param {Number|String} value
     * @returns {Amount}
     */
    static from(unit: string, value: number | string): Amount;
    /**
     * Safely convert satoshis to a BTC string.
     * This function explicitly avoids any
     * floating point arithmetic.
     * @param {Amount} value - Satoshis.
     * @returns {String} BTC string.
     */
    static btc(value: Amount, num: any): string;
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String} str - BTC
     * @returns {Amount} Satoshis.
     * @throws on parse error
     */
    static value(str: string): Amount;
    /**
     * Safely convert satoshis to a BTC string.
     * @param {Amount} value
     * @param {Number} exp - Exponent.
     * @param {Boolean} num - Return a number.
     * @returns {String|Number}
     */
    static encode(value: Amount, exp: number, num: boolean): string | number;
    /**
     * Safely convert a BTC string to satoshis.
     * @param {String|Number} value - BTC
     * @param {Number} exp - Exponent.
     * @returns {Amount} Satoshis.
     * @throws on parse error
     */
    static decode(value: string | number, exp: number): Amount;
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
     * @returns {Amount}
     */
    private fromOptions;
    /**
     * Get satoshi value.
     * @returns {Amount}
     */
    toValue(): Amount;
    /**
     * Get satoshi string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    toSatoshis(num: boolean | null): string | Amount;
    /**
     * Get bits string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    toBits(num: boolean | null): string | Amount;
    /**
     * Get mbtc string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    toMBTC(num: boolean | null): string | Amount;
    /**
     * Get btc string or value.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    toBTC(num: boolean | null): string | Amount;
    /**
     * Get unit string or value.
     * @param {String} unit - Can be `sat`,
     * `ubtc`, `bits`, `mbtc`, or `btc`.
     * @param {Boolean?} num
     * @returns {String|Amount}
     */
    to(unit: string, num: boolean | null): string | Amount;
    /**
     * Convert amount to bitcoin string.
     * @returns {String}
     */
    toString(): string;
    /**
     * Inject properties from value.
     * @private
     * @param {Amount} value
     * @returns {Amount}
     */
    private fromValue;
    /**
     * Inject properties from satoshis.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    private fromSatoshis;
    /**
     * Inject properties from bits.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    private fromBits;
    /**
     * Inject properties from mbtc.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    private fromMBTC;
    /**
     * Inject properties from btc.
     * @private
     * @param {Number|String} value
     * @returns {Amount}
     */
    private fromBTC;
    /**
     * Inject properties from unit.
     * @private
     * @param {String} unit
     * @param {Number|String} value
     * @returns {Amount}
     */
    private from;
}
//# sourceMappingURL=amount.d.ts.map