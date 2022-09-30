export = Input;
/**
 * Input
 * Represents a transaction input.
 * @alias module:primitives.Input
 * @property {Outpoint} prevout - Outpoint.
 * @property {Script} script - Input script / scriptSig.
 * @property {Number} sequence - nSequence.
 * @property {Witness} witness - Witness (empty if not present).
 */
declare class Input {
    /**
     * Instantiate an Input from options object.
     * @param {Object} options
     * @returns {Input}
     */
    static fromOptions(options: any): Input;
    /**
     * Instantiate an Input from a jsonified input object.
     * @param {Object} json - The jsonified input object.
     * @returns {Input}
     */
    static fromJSON(json: any): Input;
    /**
     * Instantiate an input from a buffer reader.
     * @param {BufferReader} br
     * @returns {Input}
     */
    static fromReader(br: BufferReader): Input;
    /**
     * Instantiate an input from a serialized Buffer.
     * @param {Buffer} data
     * @param {String?} enc - Encoding, can be `'hex'` or null.
     * @returns {Input}
     */
    static fromRaw(data: Buffer, enc: string | null): Input;
    /**
     * Instantiate input from outpoint.
     * @param {Outpoint} outpoint
     * @returns {Input}
     */
    static fromOutpoint(outpoint: Outpoint): Input;
    /**
     * Instantiate input from coin.
     * @param {Coin} coin
     * @returns {Input}
     */
    static fromCoin(coin: Coin): Input;
    /**
     * Instantiate input from tx.
     * @param {TX} tx
     * @param {Number} index
     * @returns {Input}
     */
    static fromTX(tx: TX, index: number): Input;
    /**
     * Test an object to see if it is an Input.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isInput(obj: any): boolean;
    /**
     * Create transaction input.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    prevout: Outpoint;
    script: Script;
    sequence: number;
    witness: Witness;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Clone the input.
     * @returns {Input}
     */
    clone(): Input;
    /**
     * Test equality against another input.
     * @param {Input} input
     * @returns {Boolean}
     */
    equals(input: Input): boolean;
    /**
     * Compare against another input (BIP69).
     * @param {Input} input
     * @returns {Number}
     */
    compare(input: Input): number;
    /**
     * Get the previous output script type as a string.
     * Will "guess" based on the input script and/or
     * witness if coin is not available.
     * @param {Coin?} coin
     * @returns {ScriptType} type
     */
    getType(coin: Coin): ScriptType;
    /**
     * Get the redeem script. Will attempt to resolve nested
     * redeem scripts if witnessscripthash is behind a scripthash.
     * @param {Coin?} coin
     * @returns {Script|null} Redeem script.
     */
    getRedeem(coin: Coin): Script | null;
    /**
     * Get the redeem script type.
     * @param {Coin?} coin
     * @returns {String} subtype
     */
    getSubtype(coin: Coin): string;
    /**
     * Get the previous output script's address. Will "guess"
     * based on the input script and/or witness if coin
     * is not available.
     * @param {Coin?} coin
     * @returns {Address|null} addr
     */
    getAddress(coin: Coin): Address | null;
    /**
     * Get the address hash.
     * @param {Coin?} coin
     * @param {String?} enc
     * @returns {Hash} hash
     */
    getHash(coin: Coin, enc: string | null): Hash;
    /**
     * Test to see if nSequence is equal to uint32max.
     * @returns {Boolean}
     */
    isFinal(): boolean;
    /**
     * Test to see if nSequence is less than 0xfffffffe.
     * @returns {Boolean}
     */
    isRBF(): boolean;
    /**
     * Test to see if outpoint is null.
     * @returns {Boolean}
     */
    isCoinbase(): boolean;
    /**
     * Convert the input to a more user-friendly object.
     * @param {Coin?} coin
     * @returns {Object}
     */
    format(coin: Coin): any;
    /**
     * Convert the input to an object suitable
     * for JSON serialization.
     * @returns {Object}
     */
    toJSON(network: any, coin: any): any;
    /**
     * Convert the input to an object suitable
     * for JSON serialization. Note that the hashes
     * will be reversed to abide by bitcoind's legacy
     * of little-endian uint256s.
     * @param {Network} network
     * @param {Coin} coin
     * @returns {Object}
     */
    getJSON(network: Network, coin: Coin): any;
    /**
     * Inject properties from a JSON object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Calculate size of serialized input.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Serialize the input.
     * @returns {Buffer|String}
     */
    toRaw(): Buffer | string;
    /**
     * Write the input to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @param {Buffer} data
     */
    fromRaw(data: Buffer): Input;
    /**
     * Inject properties from outpoint.
     * @private
     * @param {Outpoint} outpoint
     */
    private fromOutpoint;
    /**
     * Inject properties from coin.
     * @private
     * @param {Coin} coin
     */
    private fromCoin;
    /**
     * Inject properties from transaction.
     * @private
     * @param {TX} tx
     * @param {Number} index
     */
    private fromTX;
}
import Outpoint = require("./outpoint");
import Script = require("../script/script");
import Witness = require("../script/witness");
import Network = require("../protocol/network");
//# sourceMappingURL=input.d.ts.map