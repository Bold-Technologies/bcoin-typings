export var PROTOCOL_VERSION: number;
export var MIN_VERSION: number;
export var HEADERS_VERSION: number;
export var PONG_VERSION: number;
export var BLOOM_VERSION: number;
export var SENDHEADERS_VERSION: number;
export var COMPACT_VERSION: number;
export var COMPACT_WITNESS_VERSION: number;
export namespace services {
    const NETWORK: number;
    const GETUTXO: number;
    const BLOOM: number;
    const WITNESS: number;
}
/**
 * *
 */
export type services = number;
export var LOCAL_SERVICES: number;
export var REQUIRED_SERVICES: number;
export var USER_AGENT: string;
export var MAX_MESSAGE: number;
export var BAN_TIME: number;
export var BAN_SCORE: number;
export function nonce(): Buffer;
export var ZERO_KEY: any;
export var ZERO_SIG: any;
export var ZERO_NONCE: any;
export var MAX_INV: number;
export var MAX_REQUEST: number;
export var MAX_BLOCK_REQUEST: number;
export var MAX_TX_REQUEST: number;
//# sourceMappingURL=common.d.ts.map