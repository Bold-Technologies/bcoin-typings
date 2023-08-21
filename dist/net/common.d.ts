export const PROTOCOL_VERSION: 70015;
export const MIN_VERSION: 70001;
export const HEADERS_VERSION: 31800;
export const PONG_VERSION: 60000;
export const BLOOM_VERSION: 70011;
export const SENDHEADERS_VERSION: 7012;
export const COMPACT_VERSION: 70014;
export const COMPACT_WITNESS_VERSION: 70015;
export namespace services {
    const NETWORK: number;
    const GETUTXO: number;
    const BLOOM: number;
    const WITNESS: number;
    const NODE_COMPACT_FILTERS: number;
}
/**
 * *
 */
export type services = number;
export const LOCAL_SERVICES: number;
export const REQUIRED_SERVICES: number;
export const USER_AGENT: string;
export const MAX_MESSAGE: number;
export const BAN_TIME: number;
export const BAN_SCORE: 100;
export function nonce(): Buffer;
export const ZERO_KEY: Buffer;
export const ZERO_SIG: Buffer;
export const ZERO_NONCE: Buffer;
export const MAX_INV: 50000;
export const MAX_REQUEST: 5000;
export const MAX_BLOCK_REQUEST: number;
export const MAX_TX_REQUEST: 10000;
export namespace FILTERS {
    const BASIC: number;
}
export const filtersByVal: {
    0: string;
};
export const MAX_CFILTERS: 1000;
export const MAX_CFHEADERS: 2000;
//# sourceMappingURL=common.d.ts.map