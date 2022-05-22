/**
 * One of {@link module :constants.inv}.
 */
type InvType = number | string;
/**
 * An output script type.
 */
type ScriptType = number | string;
/**
 * A subset of {@link ScriptType }, including
 * pubkeyhash, scripthash, witnesspubkeyhash,
 * and witnessscripthash. This value
 * specifically refers to the address prefix.
 * It is a network-agnostic way of representing
 * prefixes. May sometimes be a string if
 * specified.
 */
type AddressType = number | string;
/**
 * A bitfield containing locktime flags.
 */
type LockFlags = number;
/**
 * Base58 string.
 */
type Base58String = string;
/**
 * Bech32 string.
 */
type Bech32String = string;
/**
 * Serialized address.
 */
type AddressString = Base58String | Bech32String;
/**
 * Buffer or hex-string hash.
 */
type Hash = Buffer | string;
/**
 * Signature hash type. One of `all`, `single`, `none`, or
 * one of {@link constants.hashType }.
 */
type SighashType = string | number;
/**
 * A satoshi amount. This is technically a
 * JS double float, but it is regularly
 * enforced to be less than 53 bits and
 * less than MAX_MONEY in various
 * functions.
 */
type SatoshiAmount = number;
/**
 * Rate of satoshis per kB.
 */
type Rate = SatoshiAmount;
/**
 * A big number (bn.js)
 */
type BN = any;
/**
 * A bitfield containing script verify flags.
 */
type VerifyFlags = number;
/**
 * One of `main`, `testnet`, `regtest`, `simnet`.
 */
type NetworkType = string;
//# sourceMappingURL=types.d.ts.map