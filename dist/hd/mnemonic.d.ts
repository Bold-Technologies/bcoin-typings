export = Mnemonic;
/**
 * HD Mnemonic
 * @alias module:hd.Mnemonic
 */
declare class Mnemonic {
    /**
     * Instantiate mnemonic from options.
     * @param {Object} options
     * @returns {Mnemonic}
     */
    static fromOptions(options: any): Mnemonic;
    /**
     * Instantiate mnemonic from a phrase (validates checksum).
     * @param {String} phrase
     * @returns {Mnemonic}
     * @throws on bad checksum
     */
    static fromPhrase(phrase: string): Mnemonic;
    /**
     * Instantiate mnemonic from entropy.
     * @param {Buffer} entropy
     * @param {String?} lang
     * @returns {Mnemonic}
     */
    static fromEntropy(entropy: Buffer, lang: string | null): Mnemonic;
    /**
     * Determine a single word's language.
     * @param {String} word
     * @returns {String} Language.
     * @throws on not found.
     */
    static getLanguage(word: string): string;
    /**
     * Retrieve the wordlist for a language.
     * @param {String} lang
     * @returns {Object}
     */
    static getWordlist(lang: string): any;
    /**
     * Instantiate mnemonic from json object.
     * @param {Object} json
     * @returns {Mnemonic}
     */
    static fromJSON(json: any): Mnemonic;
    /**
     * Instantiate mnemonic from buffer reader.
     * @param {BufferReader} br
     * @returns {Mnemonic}
     */
    static fromReader(br: BufferReader): Mnemonic;
    /**
     * Instantiate mnemonic from serialized data.
     * @param {Buffer} data
     * @returns {Mnemonic}
     */
    static fromRaw(data: Buffer): Mnemonic;
    /**
     * Test whether an object is a Mnemonic.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isMnemonic(obj: any): boolean;
    /**
     * Create a mnemonic.
     * @constructor
     * @param {Object} options
     * @param {Number?} options.bit - Bits of entropy (Must
     * be a multiple of 8) (default=128).
     * @param {Buffer?} options.entropy - Entropy bytes. Will
     * be generated with `options.bits` bits of entropy
     * if not present.
     * @param {String?} options.phrase - Mnemonic phrase (will
     * be generated if not present).
     * @param {String?} options.language - Language.
     */
    constructor(options: {
        bit: number | null;
        entropy: Buffer | null;
        phrase: string | null;
        language: string | null;
    });
    bits: number;
    language: string;
    entropy: any;
    phrase: any;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Destroy the mnemonic (zeroes entropy).
     */
    destroy(): void;
    /**
     * Generate the seed.
     * @param {String?} passphrase
     * @returns {Buffer} pbkdf2 seed.
     */
    toSeed(passphrase: string | null): Buffer;
    /**
     * Get or generate entropy.
     * @returns {Buffer}
     */
    getEntropy(): Buffer;
    /**
     * Generate a mnemonic phrase from chosen language.
     * @returns {String}
     */
    getPhrase(): string;
    /**
     * Inject properties from phrase.
     * @private
     * @param {String} phrase
     */
    private fromPhrase;
    /**
     * Inject properties from entropy.
     * @private
     * @param {Buffer} entropy
     * @param {String?} lang
     */
    private fromEntropy;
    /**
     * Convert mnemonic to a json-friendly object.
     * @returns {Object}
     */
    toJSON(): any;
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    private fromJSON;
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Write the mnemonic to a buffer writer.
     * @params {BufferWriter} bw
     */
    toWriter(bw: any): any;
    /**
     * Serialize mnemonic.
     * @returns {Buffer}
     */
    toRaw(writer: any): Buffer;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    private fromRaw;
    /**
     * Convert the mnemonic to a string.
     * @returns {String}
     */
    toString(): string;
}
declare namespace Mnemonic {
    const languages: string[];
}
//# sourceMappingURL=mnemonic.d.ts.map