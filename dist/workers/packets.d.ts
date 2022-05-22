declare namespace packetTypes {
    const ENV: number;
    const EVENT: number;
    const LOG: number;
    const ERROR: number;
    const ERRORRESULT: number;
    const CHECK: number;
    const CHECKRESULT: number;
    const SIGN: number;
    const SIGNRESULT: number;
    const CHECKINPUT: number;
    const CHECKINPUTRESULT: number;
    const SIGNINPUT: number;
    const SIGNINPUTRESULT: number;
    const ECVERIFY: number;
    const ECVERIFYRESULT: number;
    const ECSIGN: number;
    const ECSIGNRESULT: number;
    const MINE: number;
    const MINERESULT: number;
    const SCRYPT: number;
    const SCRYPTRESULT: number;
}
/**
 * EnvPacket
 */
export class EnvPacket extends Packet {
    static fromRaw(data: any): EnvPacket;
    constructor(env: any);
    env: any;
    json: string;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): EnvPacket;
}
/**
 * EventPacket
 */
export class EventPacket extends Packet {
    static fromRaw(data: any): EventPacket;
    constructor(items: any);
    items: any;
    json: string;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): EventPacket;
}
/**
 * LogPacket
 */
export class LogPacket extends Packet {
    static fromRaw(data: any): LogPacket;
    constructor(text: any);
    text: any;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): LogPacket;
}
/**
 * ErrorPacket
 */
export class ErrorPacket extends Packet {
    static fromRaw(data: any): ErrorPacket;
    constructor(error: any);
    error: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): ErrorPacket;
}
/**
 * ErrorResultPacket
 */
export class ErrorResultPacket extends ErrorPacket {
}
/**
 * CheckPacket
 */
export class CheckPacket extends Packet {
    static fromRaw(data: any): CheckPacket;
    constructor(tx: any, view: any, flags: any);
    tx: any;
    view: any;
    flags: any;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): CheckPacket;
}
/**
 * CheckResultPacket
 */
export class CheckResultPacket extends Packet {
    static fromRaw(data: any): CheckResultPacket;
    constructor(error: any);
    error: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): CheckResultPacket;
}
/**
 * SignPacket
 */
export class SignPacket extends Packet {
    static fromRaw(data: any): SignPacket;
    constructor(tx: any, rings: any, type: any);
    tx: any;
    rings: any;
    type: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): SignPacket;
}
/**
 * SignResultPacket
 */
export class SignResultPacket extends Packet {
    static fromTX(tx: any, total: any): SignResultPacket;
    static fromRaw(data: any): SignResultPacket;
    constructor(total: any, witness: any, script: any);
    total: any;
    script: any;
    witness: any;
    fromTX(tx: any, total: any): SignResultPacket;
    getSize(): number;
    toWriter(bw: any): any;
    inject(tx: any): void;
    fromRaw(data: any): SignResultPacket;
}
/**
 * CheckInputPacket
 */
export class CheckInputPacket extends Packet {
    static fromRaw(data: any): CheckInputPacket;
    constructor(tx: any, index: any, coin: any, flags: any);
    tx: any;
    index: any;
    coin: any;
    flags: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): CheckInputPacket;
}
/**
 * CheckInputResultPacket
 */
export class CheckInputResultPacket extends CheckResultPacket {
}
/**
 * SignInputPacket
 */
export class SignInputPacket extends Packet {
    static fromRaw(data: any): SignInputPacket;
    constructor(tx: any, index: any, coin: any, ring: any, type: any);
    tx: any;
    index: any;
    coin: any;
    ring: any;
    type: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): SignInputPacket;
}
/**
 * SignInputResultPacket
 */
export class SignInputResultPacket extends Packet {
    static fromTX(tx: any, i: any, value: any): SignInputResultPacket;
    static fromRaw(data: any): SignInputResultPacket;
    constructor(value: any, witness: any, script: any);
    value: any;
    script: any;
    witness: any;
    fromTX(tx: any, i: any, value: any): SignInputResultPacket;
    getSize(): any;
    toWriter(bw: any): any;
    inject(tx: any, i: any): void;
    fromRaw(data: any): SignInputResultPacket;
}
/**
 * ECVerifyPacket
 */
export class ECVerifyPacket extends Packet {
    static fromRaw(data: any): ECVerifyPacket;
    constructor(msg: any, sig: any, key: any);
    msg: any;
    sig: any;
    key: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): ECVerifyPacket;
}
/**
 * ECVerifyResultPacket
 */
export class ECVerifyResultPacket extends Packet {
    static fromRaw(data: any): ECVerifyResultPacket;
    constructor(value: any);
    value: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): ECVerifyResultPacket;
}
/**
 * ECSignPacket
 */
export class ECSignPacket extends Packet {
    static fromRaw(data: any): ECSignPacket;
    constructor(msg: any, key: any);
    msg: any;
    key: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): ECSignPacket;
}
/**
 * ECSignResultPacket
 */
export class ECSignResultPacket extends Packet {
    static fromRaw(data: any): ECSignResultPacket;
    constructor(sig: any);
    sig: any;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): ECSignResultPacket;
}
/**
 * MinePacket
 */
export class MinePacket extends Packet {
    static fromRaw(data: any): MinePacket;
    constructor(data: any, target: any, min: any, max: any);
    data: any;
    target: any;
    min: any;
    max: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): MinePacket;
}
/**
 * MineResultPacket
 */
export class MineResultPacket extends Packet {
    static fromRaw(data: any): MineResultPacket;
    constructor(nonce: any);
    nonce: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): MineResultPacket;
}
/**
 * ScryptPacket
 */
export class ScryptPacket extends Packet {
    static fromRaw(data: any): ScryptPacket;
    constructor(passwd: any, salt: any, N: any, r: any, p: any, len: any);
    passwd: any;
    salt: any;
    N: any;
    r: any;
    p: any;
    len: any;
    getSize(): number;
    toWriter(bw: any): any;
    fromRaw(data: any): ScryptPacket;
}
/**
 * ScryptResultPacket
 */
export class ScryptResultPacket extends Packet {
    static fromRaw(data: any): ScryptResultPacket;
    constructor(key: any);
    key: any;
    getSize(): any;
    toWriter(bw: any): any;
    fromRaw(data: any): ScryptResultPacket;
}
/**
 * Packet
 */
declare class Packet {
    static fromRaw(): void;
    id: number;
    cmd: number;
    getSize(): void;
    toWriter(): void;
    fromRaw(): void;
}
declare namespace Packet {
    const id: number;
}
export { packetTypes as types };
//# sourceMappingURL=packets.d.ts.map