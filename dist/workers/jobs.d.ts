/**
 * Execute a job on the worker.
 * @param {String} cmd
 * @param {Array} args
 * @returns {Object}
 * @throws on unknown command
 */
export function execute(p: any): any;
/**
 * Execute a job on the worker.
 * @param {String} cmd
 * @param {Array} args
 * @returns {Object}
 * @throws on unknown command
 */
export function handle(p: any): any;
/**
 * Execute tx.check() on worker.
 * @see TX#check
 * @param {TX} tx
 * @param {CoinView} view
 * @param {VerifyFlags} flags
 * @returns {CheckResultPacket}
 */
export function check(tx: TX, view: CoinView, flags: VerifyFlags): CheckResultPacket;
/**
 * Execute tx.checkInput() on worker.
 * @see TX#checkInput
 * @param {TX} tx
 * @param {Number} index
 * @param {Output} coin
 * @param {VerifyFlags} flags
 * @returns {CheckInputResultPacket}
 */
export function checkInput(tx: TX, index: number, coin: Output, flags: VerifyFlags): CheckInputResultPacket;
/**
 * Execute tx.sign() on worker.
 * @see MTX#sign
 * @param {MTX} tx
 * @param {KeyRing[]} ring
 * @param {SighashType} type
 */
export function sign(tx: MTX, ring: KeyRing[], type: SighashType): packets.SignResultPacket;
/**
 * Execute tx.signInput() on worker.
 * @see MTX#signInput
 * @param {MTX} tx
 * @param {Number} index
 * @param {Output} coin
 * @param {KeyRing} ring
 * @param {SighashType} type
 */
export function signInput(tx: MTX, index: number, coin: Output, ring: KeyRing, type: SighashType): packets.SignInputResultPacket;
/**
 * Execute secp256k1.verify() on worker.
 * @see secp256k1.verify
 * @param {TX} tx
 * @param {VerifyFlags} flags
 * @returns {Boolean}
 */
export function ecVerify(msg: any, sig: any, key: any): boolean;
/**
 * Execute secp256k1.sign() on worker.
 * @see secp256k1.sign
 * @param {TX} tx
 * @param {Number} index
 * @param {VerifyFlags} flags
 * @returns {Boolean}
 */
export function ecSign(msg: any, key: any): boolean;
/**
 * Mine a block on worker.
 * @param {Buffer} data
 * @param {Buffer} target
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function mine(data: Buffer, target: Buffer, min: number, max: number): number;
/**
 * Execute scrypt() on worker.
 * @see scrypt
 * @param {Buffer} passwd
 * @param {Buffer} salt
 * @param {Number} N
 * @param {Number} r
 * @param {Number} p
 * @param {Number} len
 * @returns {Buffer}
 */
export function scrypt(passwd: Buffer, salt: Buffer, N: number, r: number, p: number, len: number): Buffer;
import packets = require("./packets");
//# sourceMappingURL=jobs.d.ts.map