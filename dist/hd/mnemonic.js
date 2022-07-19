/*!
 * mnemonic.js - hd mnemonics for bcoin
 * Copyright (c) 2015-2016, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var sha256 = require('bcrypto/lib/sha256');
var cleanse = require('bcrypto/lib/cleanse');
var random = require('bcrypto/lib/random');
var pbkdf2 = require('bcrypto/lib/pbkdf2');
var sha512 = require('bcrypto/lib/sha512');
var wordlist = require('./wordlist');
var common = require('./common');
var nfkd = require('./nfkd');
var inspectSymbol = require('../utils').inspectSymbol;
/*
 * Constants
 */
var wordlistCache = Object.create(null);
/**
 * HD Mnemonic
 * @alias module:hd.Mnemonic
 */
var Mnemonic = /** @class */ (function () {
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
    function Mnemonic(options) {
        this.bits = 256; // previously using 128
        this.language = 'english';
        this.entropy = null;
        this.phrase = null;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    Mnemonic.prototype.fromOptions = function (options) {
        if (typeof options === 'string')
            options = { phrase: options };
        if (options.bits != null) {
            assert((options.bits & 0xffff) === options.bits);
            assert(options.bits >= common.MIN_ENTROPY);
            assert(options.bits <= common.MAX_ENTROPY);
            assert(options.bits % 32 === 0);
            this.bits = options.bits;
        }
        if (options.language) {
            assert(typeof options.language === 'string');
            assert(Mnemonic.languages.indexOf(options.language) !== -1);
            this.language = options.language;
        }
        if (options.phrase) {
            this.fromPhrase(options.phrase);
            return this;
        }
        if (options.entropy) {
            this.fromEntropy(options.entropy);
            return this;
        }
        return this;
    };
    /**
     * Instantiate mnemonic from options.
     * @param {Object} options
     * @returns {Mnemonic}
     */
    Mnemonic.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Destroy the mnemonic (zeroes entropy).
     */
    Mnemonic.prototype.destroy = function () {
        this.bits = common.MIN_ENTROPY;
        this.language = 'english';
        if (this.entropy) {
            cleanse(this.entropy);
            this.entropy = null;
        }
        this.phrase = null;
    };
    /**
     * Generate the seed.
     * @param {String?} passphrase
     * @returns {Buffer} pbkdf2 seed.
     */
    Mnemonic.prototype.toSeed = function (passphrase) {
        if (!passphrase)
            passphrase = '';
        var phrase = nfkd(this.getPhrase());
        var passwd = nfkd("mnemonic".concat(passphrase));
        return pbkdf2.derive(sha512, Buffer.from(phrase, 'utf8'), Buffer.from(passwd, 'utf8'), 2048, 64);
    };
    /**
     * Get or generate entropy.
     * @returns {Buffer}
     */
    Mnemonic.prototype.getEntropy = function () {
        if (!this.entropy)
            this.entropy = random.randomBytes(this.bits / 8);
        assert(this.bits / 8 === this.entropy.length);
        return this.entropy;
    };
    /**
     * Generate a mnemonic phrase from chosen language.
     * @returns {String}
     */
    Mnemonic.prototype.getPhrase = function () {
        if (this.phrase)
            return this.phrase;
        // Include the first `ENT / 32` bits
        // of the hash (the checksum).
        var wbits = this.bits + (this.bits / 32);
        // Get entropy and checksum.
        var entropy = this.getEntropy();
        var chk = sha256.digest(entropy);
        // Append the hash to the entropy to
        // make things easy when grabbing
        // the checksum bits.
        var size = Math.ceil(wbits / 8);
        var data = Buffer.allocUnsafe(size);
        entropy.copy(data, 0);
        chk.copy(data, entropy.length);
        // Build the mnemonic by reading
        // 11 bit indexes from the entropy.
        var list = Mnemonic.getWordlist(this.language);
        var phrase = [];
        for (var i = 0; i < wbits / 11; i++) {
            var index = 0;
            for (var j = 0; j < 11; j++) {
                var pos = i * 11 + j;
                var bit = pos % 8;
                var oct = (pos - bit) / 8;
                index <<= 1;
                index |= (data[oct] >>> (7 - bit)) & 1;
            }
            phrase.push(list.words[index]);
        }
        // Japanese likes double-width spaces.
        if (this.language === 'japanese')
            phrase = phrase.join('\u3000');
        else
            phrase = phrase.join(' ');
        this.phrase = phrase;
        return phrase;
    };
    /**
     * Inject properties from phrase.
     * @private
     * @param {String} phrase
     */
    Mnemonic.prototype.fromPhrase = function (phrase) {
        assert(typeof phrase === 'string');
        assert(phrase.length <= 1000);
        var words = phrase.trim().split(/[\s\u3000]+/);
        var wbits = words.length * 11;
        var cbits = wbits % 32;
        assert(cbits !== 0, 'Invalid checksum.');
        var bits = wbits - cbits;
        assert(bits >= common.MIN_ENTROPY);
        assert(bits <= common.MAX_ENTROPY);
        assert(bits % 32 === 0);
        var size = Math.ceil(wbits / 8);
        var data = Buffer.allocUnsafe(size);
        data.fill(0);
        var lang = Mnemonic.getLanguage(words[0]);
        var list = Mnemonic.getWordlist(lang);
        // Rebuild entropy bytes.
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            var index = list.map[word];
            if (index == null)
                throw new Error('Could not find word.');
            for (var j = 0; j < 11; j++) {
                var pos = i * 11 + j;
                var bit = pos % 8;
                var oct = (pos - bit) / 8;
                var val = (index >>> (10 - j)) & 1;
                data[oct] |= val << (7 - bit);
            }
        }
        var cbytes = Math.ceil(cbits / 8);
        var entropy = data.slice(0, data.length - cbytes);
        var chk1 = data.slice(data.length - cbytes);
        var chk2 = sha256.digest(entropy);
        // Verify checksum.
        for (var i = 0; i < cbits; i++) {
            var bit = i % 8;
            var oct = (i - bit) / 8;
            var b1 = (chk1[oct] >>> (7 - bit)) & 1;
            var b2 = (chk2[oct] >>> (7 - bit)) & 1;
            if (b1 !== b2)
                throw new Error('Invalid checksum.');
        }
        assert(bits / 8 === entropy.length);
        this.bits = bits;
        this.language = lang;
        this.entropy = entropy;
        this.phrase = phrase;
        return this;
    };
    /**
     * Instantiate mnemonic from a phrase (validates checksum).
     * @param {String} phrase
     * @returns {Mnemonic}
     * @throws on bad checksum
     */
    Mnemonic.fromPhrase = function (phrase) {
        return new this().fromPhrase(phrase);
    };
    /**
     * Inject properties from entropy.
     * @private
     * @param {Buffer} entropy
     * @param {String?} lang
     */
    Mnemonic.prototype.fromEntropy = function (entropy, lang) {
        assert(Buffer.isBuffer(entropy));
        assert(entropy.length * 8 >= common.MIN_ENTROPY);
        assert(entropy.length * 8 <= common.MAX_ENTROPY);
        assert((entropy.length * 8) % 32 === 0);
        assert(!lang || Mnemonic.languages.indexOf(lang) !== -1);
        this.entropy = entropy;
        this.bits = entropy.length * 8;
        if (lang)
            this.language = lang;
        return this;
    };
    /**
     * Instantiate mnemonic from entropy.
     * @param {Buffer} entropy
     * @param {String?} lang
     * @returns {Mnemonic}
     */
    Mnemonic.fromEntropy = function (entropy, lang) {
        return new this().fromEntropy(entropy, lang);
    };
    /**
     * Determine a single word's language.
     * @param {String} word
     * @returns {String} Language.
     * @throws on not found.
     */
    Mnemonic.getLanguage = function (word) {
        for (var _i = 0, _a = Mnemonic.languages; _i < _a.length; _i++) {
            var lang = _a[_i];
            var list = Mnemonic.getWordlist(lang);
            if (list.map[word] != null)
                return lang;
        }
        throw new Error('Could not determine language.');
    };
    /**
     * Retrieve the wordlist for a language.
     * @param {String} lang
     * @returns {Object}
     */
    Mnemonic.getWordlist = function (lang) {
        var cache = wordlistCache[lang];
        if (cache)
            return cache;
        var words = wordlist.get(lang);
        var list = new WordList(words);
        wordlistCache[lang] = list;
        return list;
    };
    /**
     * Convert mnemonic to a json-friendly object.
     * @returns {Object}
     */
    Mnemonic.prototype.toJSON = function () {
        return {
            bits: this.bits,
            language: this.language,
            entropy: this.getEntropy().toString('hex'),
            phrase: this.getPhrase()
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     */
    Mnemonic.prototype.fromJSON = function (json) {
        assert(json);
        assert((json.bits & 0xffff) === json.bits);
        assert(typeof json.language === 'string');
        assert(typeof json.entropy === 'string');
        assert(typeof json.phrase === 'string');
        assert(json.bits >= common.MIN_ENTROPY);
        assert(json.bits <= common.MAX_ENTROPY);
        assert(json.bits % 32 === 0);
        assert(json.bits / 8 === json.entropy.length / 2);
        this.bits = json.bits;
        this.language = json.language;
        this.entropy = Buffer.from(json.entropy, 'hex');
        this.phrase = json.phrase;
        return this;
    };
    /**
     * Instantiate mnemonic from json object.
     * @param {Object} json
     * @returns {Mnemonic}
     */
    Mnemonic.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Calculate serialization size.
     * @returns {Number}
     */
    Mnemonic.prototype.getSize = function () {
        var size = 0;
        size += 3;
        size += this.getEntropy().length;
        return size;
    };
    /**
     * Write the mnemonic to a buffer writer.
     * @params {BufferWriter} bw
     */
    Mnemonic.prototype.toWriter = function (bw) {
        var lang = Mnemonic.languages.indexOf(this.language);
        assert(lang !== -1);
        bw.writeU16(this.bits);
        bw.writeU8(lang);
        bw.writeBytes(this.getEntropy());
        return bw;
    };
    /**
     * Serialize mnemonic.
     * @returns {Buffer}
     */
    Mnemonic.prototype.toRaw = function (writer) {
        var size = this.getSize();
        return this.toWriter(bio.write(size)).render();
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    Mnemonic.prototype.fromReader = function (br) {
        var bits = br.readU16();
        assert(bits >= common.MIN_ENTROPY);
        assert(bits <= common.MAX_ENTROPY);
        assert(bits % 32 === 0);
        var language = Mnemonic.languages[br.readU8()];
        assert(language);
        this.bits = bits;
        this.language = language;
        this.entropy = br.readBytes(bits / 8);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     */
    Mnemonic.prototype.fromRaw = function (data) {
        return this.fromReader(bio.read(data));
    };
    /**
     * Instantiate mnemonic from buffer reader.
     * @param {BufferReader} br
     * @returns {Mnemonic}
     */
    Mnemonic.fromReader = function (br) {
        return new this().fromReader(br);
    };
    /**
     * Instantiate mnemonic from serialized data.
     * @param {Buffer} data
     * @returns {Mnemonic}
     */
    Mnemonic.fromRaw = function (data) {
        return new this().fromRaw(data);
    };
    /**
     * Convert the mnemonic to a string.
     * @returns {String}
     */
    Mnemonic.prototype.toString = function () {
        return this.getPhrase();
    };
    /**
     * Inspect the mnemonic.
     * @returns {String}
     */
    Mnemonic.prototype[inspectSymbol] = function () {
        return "<Mnemonic: ".concat(this.getPhrase(), ">");
    };
    /**
     * Test whether an object is a Mnemonic.
     * @param {Object} obj
     * @returns {Boolean}
     */
    Mnemonic.isMnemonic = function (obj) {
        return obj instanceof Mnemonic;
    };
    return Mnemonic;
}());
/**
 * List of languages.
 * @const {String[]}
 * @default
 */
Mnemonic.languages = [
    'simplified chinese',
    'traditional chinese',
    'english',
    'french',
    'italian',
    'japanese',
    'spanish'
];
/**
 * Word List
 * @ignore
 */
var WordList = /** @class */ (function () {
    /**
     * Create word list.
     * @constructor
     * @ignore
     * @param {Array} words
     */
    function WordList(words) {
        this.words = words;
        this.map = Object.create(null);
        for (var i = 0; i < words.length; i++) {
            var word = words[i];
            this.map[word] = i;
        }
    }
    return WordList;
}());
/*
 * Expose
 */
module.exports = Mnemonic;
