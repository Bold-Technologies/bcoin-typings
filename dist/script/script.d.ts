export = Script;
/**
 * Script
 * Represents a input or output script.
 * @alias module:script.Script
 * @property {Array} code - Parsed script code.
 * @property {Buffer?} raw - Serialized script.
 * @property {Number} length - Number of parsed opcodes.
 */
declare class Script {
    /**
     * Insantiate script from options object.
     * @param {Object} options
     * @returns {Script}
     */
    static fromOptions(options: any): Script;
    /**
     * Instantiate script from an array
     * of buffers and numbers.
     * @param {Array} code
     * @returns {Script}
     */
    static fromArray(code: any[]): Script;
    /**
     * Instantiate script from stack items.
     * @param {Buffer[]} items
     * @returns {Script}
     */
    static fromItems(items: Buffer[]): Script;
    /**
     * Instantiate script from stack.
     * @param {Stack} stack
     * @returns {Script}
     */
    static fromStack(stack: Stack): Script;
    /**
     * Instantiate script from a hex string.
     * @params {String} json
     * @returns {Script}
     */
    static fromJSON(json: any): Script;
    /**
     * Create a pay-to-pubkey script.
     * @param {Buffer} key
     * @returns {Script}
     */
    static fromPubkey(key: Buffer): Script;
    /**
     * Create a pay-to-pubkeyhash script.
     * @param {Buffer} hash
     * @returns {Script}
     */
    static fromPubkeyhash(hash: Buffer): Script;
    /**
     * Create a pay-to-multisig script.
     * @param {Number} m
     * @param {Number} n
     * @param {Buffer[]} keys
     * @returns {Script}
     */
    static fromMultisig(m: number, n: number, keys: Buffer[]): Script;
    /**
     * Create a pay-to-scripthash script.
     * @param {Buffer} hash
     * @returns {Script}
     */
    static fromScripthash(hash: Buffer): Script;
    /**
     * Create a nulldata/opreturn script.
     * @param {Buffer} flags
     * @returns {Script}
     */
    static fromNulldata(flags: Buffer): Script;
    /**
     * Create a witness program.
     * @param {Number} version
     * @param {Buffer} data
     * @returns {Script}
     */
    static fromProgram(version: number, data: Buffer): Script;
    /**
     * Create an output script from an address.
     * @param {Address|AddressString} address
     * @returns {Script}
     */
    static fromAddress(address: Address | AddressString): Script;
    /**
     * Create a witness block commitment.
     * @param {Buffer} hash
     * @param {String|Buffer} flags
     * @returns {Script}
     */
    static fromCommitment(hash: Buffer, flags: string | Buffer): Script;
    /**
     * Get coinbase height.
     * @param {Buffer} raw - Raw script.
     * @returns {Number} `-1` if not present.
     */
    static getCoinbaseHeight(raw: Buffer): number;
    /**
     * Parse a bitcoind test script
     * string into a script object.
     * @param {String} items - Script string.
     * @returns {Script}
     * @throws Parse error.
     */
    static fromString(code: any): Script;
    /**
     * Verify an input and output script, and a witness if present.
     * @param {Script} input
     * @param {Witness} witness
     * @param {Script} output
     * @param {TX} tx
     * @param {Number} index
     * @param {SatoshiAmount} value
     * @param {VerifyFlags} flags
     * @throws {ScriptError}
     */
    static verify(input: Script, witness: Witness, output: Script, tx: TX, index: number, value: SatoshiAmount, flags: VerifyFlags): void;
    /**
     * Verify a witness program. This runs after regular script
     * execution if a witness program is present. It will convert
     * the witness to a stack and execute the program.
     * @param {Witness} witness
     * @param {Script} output
     * @param {VerifyFlags} flags
     * @param {TX} tx
     * @param {Number} index
     * @param {SatoshiAmount} value
     * @throws {ScriptError}
     */
    static verifyProgram(witness: Witness, output: Script, flags: VerifyFlags, tx: TX, index: number, value: SatoshiAmount): void;
    /**
     * Create a script from buffer reader.
     * @param {BufferReader} br
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Script}
     */
    static fromReader(br: BufferReader): Script;
    /**
     * Create a script from a serialized buffer.
     * @param {Buffer|String} data - Serialized script.
     * @param {String?} enc - Either `"hex"` or `null`.
     * @returns {Script}
     */
    static fromRaw(data: Buffer | string, enc: string | null): Script;
    /**
     * Test whether an object a Script.
     * @param {Object} obj
     * @returns {Boolean}
     */
    static isScript(obj: any): boolean;
    /**
     * Create a script.
     * @constructor
     * @param {Buffer|Array|Object} code
     */
    constructor(options: any);
    raw: any;
    code: any[];
    /**
     * Set length.
     * @param {Number} value
     */
    set length(arg: number);
    /**
     * Get length.
     * @returns {Number}
     */
    get length(): number;
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    private fromOptions;
    /**
     * Instantiate a value-only iterator.
     * @returns {ScriptIterator}
     */
    values(): ScriptIterator;
    /**
     * Instantiate a key and value iterator.
     * @returns {ScriptIterator}
     */
    entries(): ScriptIterator;
    /**
     * Convert the script to an array of
     * Buffers (pushdatas) and Numbers
     * (opcodes).
     * @returns {Array}
     */
    toArray(): any[];
    /**
     * Inject properties from an array of
     * of buffers and numbers.
     * @private
     * @param {Array} code
     * @returns {Script}
     */
    private fromArray;
    /**
     * Convert script to stack items.
     * @returns {Buffer[]}
     */
    toItems(): Buffer[];
    /**
     * Inject data from stack items.
     * @private
     * @param {Buffer[]} items
     * @returns {Script}
     */
    private fromItems;
    /**
     * Convert script to stack.
     * @returns {Stack}
     */
    toStack(): Stack;
    /**
     * Inject data from stack.
     * @private
     * @param {Stack} stack
     * @returns {Script}
     */
    private fromStack;
    /**
     * Clone the script.
     * @returns {Script} Cloned script.
     */
    clone(): Script;
    /**
     * Inject properties from script.
     * Used for cloning.
     * @private
     * @param {Script} script
     * @returns {Script}
     */
    private inject;
    /**
     * Test equality against script.
     * @param {Script} script
     * @returns {Boolean}
     */
    equals(script: Script): boolean;
    /**
     * Compare against another script.
     * @param {Script} script
     * @returns {Number}
     */
    compare(script: Script): number;
    /**
     * Clear the script.
     * @returns {Script}
     */
    clear(): Script;
    /**
     * Convert the script to a bitcoind test string.
     * @returns {String} Human-readable script code.
     */
    toString(): string;
    /**
     * Format the script as bitcoind asm.
     * @param {Boolean?} decode - Attempt to decode hash types.
     * @returns {String} Human-readable script.
     */
    toASM(decode: boolean | null): string;
    /**
     * Re-encode the script internally. Useful if you
     * changed something manually in the `code` array.
     * @returns {Script}
     */
    compile(): Script;
    /**
     * Write the script to a buffer writer.
     * @param {BufferWriter} bw
     */
    toWriter(bw: BufferWriter): BufferWriter;
    /**
     * Encode the script to a Buffer. See {@link Script#encode}.
     * @param {String} enc - Encoding, either `'hex'` or `null`.
     * @returns {Buffer|String} Serialized script.
     */
    toRaw(): Buffer | string;
    /**
     * Convert script to a hex string.
     * @returns {String}
     */
    toJSON(): string;
    /**
     * Inject properties from json object.
     * @private
     * @param {String} json
     */
    private fromJSON;
    /**
     * Get the script's "subscript" starting at a separator.
     * @param {Number} index - The last separator to sign/verify beyond.
     * @returns {Script} Subscript.
     */
    getSubscript(index: number): Script;
    /**
     * Get the script's "subscript" starting at a separator.
     * Remove all OP_CODESEPARATORs if present. This bizarre
     * behavior is necessary for signing and verification when
     * code separators are present.
     * @returns {Script} Subscript.
     */
    removeSeparators(): Script;
    /**
     * Execute and interpret the script.
     * @param {Stack} stack - Script execution stack.
     * @param {Number?} flags - Script standard flags.
     * @param {TX?} tx - Transaction being verified.
     * @param {Number?} index - Index of input being verified.
     * @param {SatoshiAmount?} value - Previous output value.
     * @param {Number?} version - Signature hash version (0=legacy, 1=segwit).
     * @throws {ScriptError} Will be thrown on VERIFY failures.
     */
    execute(stack: Stack, flags: number | null, tx: TX, index: number | null, value: SatoshiAmount | null, version: number | null): void;
    /**
     * Remove all matched data elements from
     * a script's code (used to remove signatures
     * before verification). Note that this
     * compares and removes data on the _byte level_.
     * It also reserializes the data to a single
     * script with minimaldata encoding beforehand.
     * A signature will _not_ be removed if it is
     * not minimaldata.
     * @see https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2014-November/006878.html
     * @see https://test.webbtc.com/tx/19aa42fee0fa57c45d3b16488198b27caaacc4ff5794510d0c17f173f05587ff
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Total.
     */
    findAndDelete(data: Buffer): number;
    /**
     * Find a data element in a script.
     * @param {Buffer} data - Data element to match against.
     * @returns {Number} Index (`-1` if not present).
     */
    indexOf(data: Buffer): number;
    /**
     * Test a script to see if it is likely
     * to be script code (no weird opcodes).
     * @returns {Boolean}
     */
    isCode(): boolean;
    /**
     * Inject properties from a pay-to-pubkey script.
     * @private
     * @param {Buffer} key
     */
    private fromPubkey;
    /**
     * Inject properties from a pay-to-pubkeyhash script.
     * @private
     * @param {Buffer} hash
     */
    private fromPubkeyhash;
    /**
     * Inject properties from pay-to-multisig script.
     * @private
     * @param {Number} m
     * @param {Number} n
     * @param {Buffer[]} keys
     */
    private fromMultisig;
    /**
     * Inject properties from a pay-to-scripthash script.
     * @private
     * @param {Buffer} hash
     */
    private fromScripthash;
    /**
     * Inject properties from a nulldata/opreturn script.
     * @private
     * @param {Buffer} flags
     */
    private fromNulldata;
    /**
     * Inject properties from a witness program.
     * @private
     * @param {Number} version
     * @param {Buffer} data
     */
    private fromProgram;
    /**
     * Inject properties from an address.
     * @private
     * @param {Address|AddressString} address
     */
    private fromAddress;
    /**
     * Inject properties from a witness block commitment.
     * @private
     * @param {Buffer} hash
     * @param {String|Buffer} flags
     */
    private fromCommitment;
    /**
     * Grab and deserialize the redeem script.
     * @returns {Script|null} Redeem script.
     */
    getRedeem(): Script | null;
    /**
     * Get the standard script type.
     * @returns {ScriptType}
     */
    getType(): ScriptType;
    /**
     * Test whether a script is of an unknown/non-standard type.
     * @returns {Boolean}
     */
    isUnknown(): boolean;
    /**
     * Test whether the script is standard by policy standards.
     * @returns {Boolean}
     */
    isStandard(): boolean;
    /**
     * Calculate the size of the script
     * excluding the varint size bytes.
     * @returns {Number}
     */
    getSize(): number;
    /**
     * Calculate the size of the script
     * including the varint size bytes.
     * @returns {Number}
     */
    getVarSize(): number;
    /**
     * "Guess" the address of the input script.
     * This method is not 100% reliable.
     * @returns {Address|null}
     */
    getInputAddress(): Address | null;
    /**
     * Get the address of the script if present. Note that
     * pubkey and multisig scripts will be treated as though
     * they are pubkeyhash and scripthashes respectively.
     * @returns {Address|null}
     */
    getAddress(): Address | null;
    /**
     * Get the hash160 of the raw script.
     * @param {String?} enc
     * @returns {Hash}
     */
    hash160(enc: string | null): Hash;
    /**
     * Get the sha256 of the raw script.
     * @param {String?} enc
     * @returns {Hash}
     */
    sha256(enc: string | null): Hash;
    /**
     * Test whether the output script is pay-to-pubkey.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    isPubkey(minimal?: boolean): boolean;
    /**
     * Get P2PK key if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    getPubkey(minimal?: boolean): Buffer | null;
    /**
     * Test whether the output script is pay-to-pubkeyhash.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    isPubkeyhash(minimal?: boolean): boolean;
    /**
     * Get P2PKH hash if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    getPubkeyhash(minimal?: boolean): Buffer | null;
    /**
     * Test whether the output script is pay-to-multisig.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    isMultisig(minimal?: boolean): boolean;
    /**
     * Get multisig m and n values if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Array} [m, n]
     */
    getMultisig(minimal?: boolean): any[];
    /**
     * Test whether the output script is pay-to-scripthash. Note that
     * bitcoin itself requires scripthashes to be in strict minimaldata
     * encoding. Using `OP_HASH160 OP_PUSHDATA1 [hash] OP_EQUAL` will
     * _not_ be recognized as a scripthash.
     * @returns {Boolean}
     */
    isScripthash(): boolean;
    /**
     * Get P2SH hash if present.
     * @returns {Buffer|null}
     */
    getScripthash(): Buffer | null;
    /**
     * Test whether the output script is nulldata/opreturn.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Boolean}
     */
    isNulldata(minimal?: boolean): boolean;
    /**
     * Get OP_RETURN data if present.
     * @param {Boolean} [minimal=false] - Minimaldata only.
     * @returns {Buffer|null}
     */
    getNulldata(minimal?: boolean): Buffer | null;
    /**
     * Test whether the output script is a segregated witness
     * commitment.
     * @returns {Boolean}
     */
    isCommitment(): boolean;
    /**
     * Get the commitment hash if present.
     * @returns {Buffer|null}
     */
    getCommitment(): Buffer | null;
    /**
     * Test whether the output script is a witness program.
     * Note that this will return true even for malformed
     * witness v0 programs.
     * @return {Boolean}
     */
    isProgram(): boolean;
    /**
     * Get the witness program if present.
     * @returns {Program|null}
     */
    getProgram(): Program | null;
    /**
     * Get the script to the equivalent witness
     * program (mimics bitcoind's scriptForWitness).
     * @returns {Script|null}
     */
    forWitness(): Script | null;
    /**
     * Test whether the output script is
     * a pay-to-witness-pubkeyhash program.
     * @returns {Boolean}
     */
    isWitnessPubkeyhash(): boolean;
    /**
     * Get P2WPKH hash if present.
     * @returns {Buffer|null}
     */
    getWitnessPubkeyhash(): Buffer | null;
    /**
     * Test whether the output script is
     * a pay-to-witness-scripthash program.
     * @returns {Boolean}
     */
    isWitnessScripthash(): boolean;
    /**
     * Get P2WSH hash if present.
     * @returns {Buffer|null}
     */
    getWitnessScripthash(): Buffer | null;
    /**
     * Test whether the output script is unspendable.
     * @returns {Boolean}
     */
    isUnspendable(): boolean;
    /**
     * "Guess" the type of the input script.
     * This method is not 100% reliable.
     * @returns {ScriptType}
     */
    getInputType(): ScriptType;
    /**
     * "Guess" whether the input script is an unknown/non-standard type.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isUnknownInput(): boolean;
    /**
     * "Guess" whether the input script is pay-to-pubkey.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isPubkeyInput(): boolean;
    /**
     * Get P2PK signature if present.
     * @returns {Buffer|null}
     */
    getPubkeyInput(): Buffer | null;
    /**
     * "Guess" whether the input script is pay-to-pubkeyhash.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isPubkeyhashInput(): boolean;
    /**
     * Get P2PKH signature and key if present.
     * @returns {Array} [sig, key]
     */
    getPubkeyhashInput(): any[];
    /**
     * "Guess" whether the input script is pay-to-multisig.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isMultisigInput(): boolean;
    /**
     * Get multisig signatures if present.
     * @returns {Buffer[]|null}
     */
    getMultisigInput(): Buffer[] | null;
    /**
     * "Guess" whether the input script is pay-to-scripthash.
     * This method is not 100% reliable.
     * @returns {Boolean}
     */
    isScripthashInput(): boolean;
    /**
     * Get P2SH redeem script if present.
     * @returns {Buffer|null}
     */
    getScripthashInput(): Buffer | null;
    /**
     * Get coinbase height.
     * @returns {Number} `-1` if not present.
     */
    getCoinbaseHeight(): number;
    /**
     * Test the script against a bloom filter.
     * @param {Bloom} filter
     * @returns {Boolean}
     */
    test(filter: Bloom): boolean;
    /**
     * Test the script to see if it contains only push ops.
     * Push ops are: OP_1NEGATE, OP_0-OP_16 and all PUSHDATAs.
     * @returns {Boolean}
     */
    isPushOnly(): boolean;
    /**
     * Count the sigops in the script.
     * @param {Boolean} accurate - Whether to enable accurate counting. This will
     * take into account the `n` value for OP_CHECKMULTISIG(VERIFY).
     * @returns {Number} sigop count
     */
    getSigops(accurate: boolean): number;
    /**
     * Count the sigops in the script, taking into account redeem scripts.
     * @param {Script} input - Input script, needed for access to redeem script.
     * @returns {Number} sigop count
     */
    getScripthashSigops(input: Script): number;
    /**
     * Count the sigops in a script, taking into account witness programs.
     * @param {Script} input
     * @param {Witness} witness
     * @returns {Number} sigop count
     */
    getWitnessSigops(input: Script, witness: Witness): number;
    get(index: any): any;
    pop(): any;
    shift(): any;
    remove(index: any): any;
    set(index: any, op: any): Script;
    push(op: any): Script;
    unshift(op: any): Script;
    insert(index: any, op: any): Script;
    getOp(index: any): any;
    popOp(): any;
    shiftOp(): any;
    removeOp(index: any): any;
    setOp(index: any, value: any): Script;
    pushOp(value: any): Script;
    unshiftOp(value: any): Script;
    insertOp(index: any, value: any): Script;
    getData(index: any): any;
    popData(): any;
    shiftData(): any;
    removeData(index: any): any;
    setData(index: any, data: any): Script;
    pushData(data: any): Script;
    unshiftData(data: any): Script;
    insertData(index: any, data: any): Script;
    getLength(index: any): any;
    getPush(index: any): any;
    popPush(): any;
    shiftPush(): any;
    removePush(index: any): any;
    setPush(index: any, data: any): Script;
    pushPush(data: any): Script;
    unshiftPush(data: any): Script;
    insertPush(index: any, data: any): Script;
    getString(index: any, enc: any): any;
    popString(enc: any): any;
    shiftString(enc: any): any;
    removeString(index: any, enc: any): any;
    setString(index: any, str: any, enc: any): Script;
    pushString(str: any, enc: any): Script;
    unshiftString(str: any, enc: any): Script;
    insertString(index: any, str: any, enc: any): Script;
    getSmall(index: any): any;
    popSmall(): any;
    shiftSmall(): any;
    removeSmall(index: any): any;
    setSmall(index: any, num: any): Script;
    pushSmall(num: any): Script;
    unshiftSmall(num: any): Script;
    insertSmall(index: any, num: any): Script;
    getNum(index: any, minimal: any, limit: any): any;
    popNum(minimal: any, limit: any): any;
    shiftNum(minimal: any, limit: any): any;
    removeNum(index: any, minimal: any, limit: any): any;
    setNum(index: any, num: any): Script;
    pushNum(num: any): Script;
    unshiftNum(num: any): Script;
    insertNum(index: any, num: any): Script;
    getInt(index: any, minimal: any, limit: any): any;
    popInt(minimal: any, limit: any): any;
    shiftInt(minimal: any, limit: any): any;
    removeInt(index: any, minimal: any, limit: any): any;
    setInt(index: any, num: any): Script;
    pushInt(num: any): Script;
    unshiftInt(num: any): Script;
    insertInt(index: any, num: any): Script;
    getBool(index: any): any;
    popBool(): any;
    shiftBool(): any;
    removeBool(index: any): any;
    setBool(index: any, value: any): Script;
    pushBool(value: any): Script;
    unshiftBool(value: any): Script;
    insertBool(index: any, value: any): Script;
    getSym(index: any): any;
    popSym(): any;
    shiftSym(): any;
    removeSym(index: any): any;
    setSym(index: any, symbol: any): Script;
    pushSym(symbol: any): Script;
    unshiftSym(symbol: any): Script;
    insertSym(index: any, symbol: any): Script;
    /**
     * Inject properties from bitcoind test string.
     * @private
     * @param {String} items - Script string.
     * @throws Parse error.
     */
    private fromString;
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     */
    private fromReader;
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer}
     */
    private fromRaw;
}
declare namespace Script {
    /**
     * *
     */
    type opcodes = number;
    const opcodes: {
        OP_0: number;
        OP_PUSHDATA1: number;
        OP_PUSHDATA2: number;
        OP_PUSHDATA4: number;
        OP_1NEGATE: number;
        OP_RESERVED: number;
        OP_1: number;
        OP_2: number;
        OP_3: number;
        OP_4: number;
        OP_5: number;
        OP_6: number;
        OP_7: number;
        OP_8: number;
        OP_9: number;
        OP_10: number;
        OP_11: number;
        OP_12: number;
        OP_13: number;
        OP_14: number;
        OP_15: number;
        OP_16: number;
        OP_NOP: number;
        OP_VER: number;
        OP_IF: number;
        OP_NOTIF: number;
        OP_VERIF: number;
        OP_VERNOTIF: number;
        OP_ELSE: number;
        OP_ENDIF: number;
        OP_VERIFY: number;
        OP_RETURN: number;
        OP_TOALTSTACK: number;
        OP_FROMALTSTACK: number;
        OP_2DROP: number;
        OP_2DUP: number;
        OP_3DUP: number;
        OP_2OVER: number;
        OP_2ROT: number;
        OP_2SWAP: number;
        OP_IFDUP: number;
        OP_DEPTH: number;
        OP_DROP: number;
        OP_DUP: number;
        OP_NIP: number;
        OP_OVER: number;
        OP_PICK: number;
        OP_ROLL: number;
        OP_ROT: number;
        OP_SWAP: number;
        OP_TUCK: number;
        OP_CAT: number;
        OP_SUBSTR: number;
        OP_LEFT: number;
        OP_RIGHT: number;
        OP_SIZE: number;
        OP_INVERT: number;
        OP_AND: number;
        OP_OR: number;
        OP_XOR: number;
        OP_EQUAL: number;
        OP_EQUALVERIFY: number;
        OP_RESERVED1: number;
        OP_RESERVED2: number;
        OP_1ADD: number;
        OP_1SUB: number;
        OP_2MUL: number;
        OP_2DIV: number;
        OP_NEGATE: number;
        OP_ABS: number;
        OP_NOT: number;
        OP_0NOTEQUAL: number;
        OP_ADD: number;
        OP_SUB: number;
        OP_MUL: number;
        OP_DIV: number;
        OP_MOD: number;
        OP_LSHIFT: number;
        OP_RSHIFT: number;
        OP_BOOLAND: number;
        OP_BOOLOR: number;
        OP_NUMEQUAL: number;
        OP_NUMEQUALVERIFY: number;
        OP_NUMNOTEQUAL: number;
        OP_LESSTHAN: number;
        OP_GREATERTHAN: number;
        OP_LESSTHANOREQUAL: number;
        OP_GREATERTHANOREQUAL: number;
        OP_MIN: number;
        OP_MAX: number;
        OP_WITHIN: number;
        OP_RIPEMD160: number;
        OP_SHA1: number;
        OP_SHA256: number;
        OP_HASH160: number;
        OP_HASH256: number;
        OP_CODESEPARATOR: number;
        OP_CHECKSIG: number;
        OP_CHECKSIGVERIFY: number;
        OP_CHECKMULTISIG: number;
        OP_CHECKMULTISIGVERIFY: number;
        OP_NOP1: number;
        OP_CHECKLOCKTIMEVERIFY: number;
        OP_CHECKSEQUENCEVERIFY: number;
        OP_NOP4: number;
        OP_NOP5: number;
        OP_NOP6: number;
        OP_NOP7: number;
        OP_NOP8: number;
        OP_NOP9: number;
        OP_NOP10: number;
        OP_INVALIDOPCODE: number;
    };
    const opcodesByVal: {
        0: string;
        76: string;
        77: string;
        78: string;
        79: string;
        80: string;
        81: string;
        82: string;
        83: string;
        84: string;
        85: string;
        86: string;
        87: string;
        88: string;
        89: string;
        /**
         * Instantiate a value-only iterator.
         * @returns {ScriptIterator}
         */
        90: string;
        91: string;
        92: string;
        93: string;
        94: string;
        95: string;
        96: string;
        97: string;
        98: string;
        99: string;
        100: string;
        101: string;
        102: string;
        103: string;
        104: string;
        105: string;
        106: string;
        /**
         * Inject properties from an array of
         * of buffers and numbers.
         * @private
         * @param {Array} code
         * @returns {Script}
         */
        107: string;
        108: string;
        109: string;
        110: string;
        111: string;
        112: string;
        113: string;
        114: string;
        115: string;
        116: string;
        117: string;
        118: string;
        119: string;
        120: string;
        121: string;
        122: string;
        123: string;
        124: string;
        125: string;
        126: string;
        127: string;
        128: string;
        129: string;
        130: string;
        131: string;
        132: string;
        133: string;
        134: string;
        135: string;
        136: string;
        137: string;
        138: string;
        139: string;
        140: string;
        141: string;
        142: string;
        143: string;
        144: string; /**
         * Inject data from stack items.
         * @private
         * @param {Buffer[]} items
         * @returns {Script}
         */
        145: string;
        146: string;
        147: string;
        148: string;
        149: string;
        150: string;
        151: string;
        152: string;
        153: string;
        154: string;
        155: string;
        156: string;
        157: string;
        158: string;
        159: string;
        160: string;
        161: string;
        162: string;
        163: string;
        164: string;
        165: string;
        166: string;
        167: string;
        168: string;
        169: string;
        170: string;
        171: string;
        172: string;
        173: string;
        174: string;
        175: string;
        176: string;
        177: string;
        178: string;
        179: string;
        180: string;
        181: string;
        182: string;
        183: string;
        184: string;
        185: string;
        255: string;
    };
    /**
     * Script and locktime flags. See {@link VerifyFlags }.
     */
    type flags = number;
    const flags: {
        VERIFY_NONE: number;
        VERIFY_P2SH: number;
        VERIFY_STRICTENC: number;
        VERIFY_DERSIG: number;
        VERIFY_LOW_S: number;
        VERIFY_NULLDUMMY: number;
        VERIFY_SIGPUSHONLY: number;
        VERIFY_MINIMALDATA: number;
        VERIFY_DISCOURAGE_UPGRADABLE_NOPS: number;
        /**
         * Inspect the script.
         * @returns {String} Human-readable script code.
         */
        VERIFY_CLEANSTACK: number;
        VERIFY_CHECKLOCKTIMEVERIFY: number;
        VERIFY_CHECKSEQUENCEVERIFY: number;
        VERIFY_WITNESS: number;
        VERIFY_DISCOURAGE_UPGRADABLE_WITNESS_PROGRAM: number;
        VERIFY_MINIMALIF: number;
        VERIFY_NULLFAIL: number;
        VERIFY_WITNESS_PUBKEYTYPE: number;
        VERIFY_CONST_SCRIPTCODE: number;
    };
    /**
     * *
     */
    type hashType = SighashType;
    const hashType: {
        ALL: number;
        NONE: number;
        SINGLE: number;
        ANYONECANPAY: number;
    };
    const hashTypeByVal: {
        1: string;
        2: string;
        3: string;
        128: string;
    };
    /**
     * Output script types.
     */
    type types = number;
    const types: {
        NONSTANDARD: number;
        PUBKEY: number;
        PUBKEYHASH: number;
        SCRIPTHASH: number;
        MULTISIG: number;
        NULLDATA: number;
        WITNESSMALFORMED: number;
        WITNESSSCRIPTHASH: number;
        WITNESSPUBKEYHASH: number;
    };
    const typesByVal: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        128: string;
        129: string;
        130: string;
    };
}
import Stack = require("./stack");
import Address = require("../primitives/address");
import Program = require("./program");
//# sourceMappingURL=script.d.ts.map