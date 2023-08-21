export namespace types {
    const BLOCK: number;
    const UNDO: number;
    const FILTER_BASIC: number;
    const MERKLE: number;
}
/**
 * Block data types.
 */
export type types = number;
export namespace filters {
    import BASIC = FILTER_BASIC;
    export { BASIC };
}
/**
 * Filter types
 */
export type filters = number;
/**
 * File prefixes for block data types.
 */
export type prefixes = string;
export const prefixes: {
    1: string;
    2: string;
    3: string;
    4: string;
};
declare namespace ___Users_anmolsharma_Desktop_Projects_bcoin_typings_lib_blockstore_common_ { }
export {};
//# sourceMappingURL=common.d.ts.map