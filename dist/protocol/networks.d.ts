export var types: string[];
export var main: any;
export namespace testnet {
    const type: string;
    const seeds: string[];
    const magic: number;
    const port: number;
    const checkpointMap: {
        546: any;
        10000: any;
        50000: any;
        90000: any;
        100000: any;
        140000: any;
        170000: any;
        210000: any;
        230000: any;
        270000: any;
        300000: any;
        340000: any;
        350000: any;
        390000: any;
        420000: any;
        460000: any;
        500000: any;
        540000: any;
        570000: any;
        600000: any;
        630000: any;
        670000: any;
        700000: any;
        740000: any;
        780000: any;
        800000: any;
        840000: any;
        880000: any;
        900000: any;
        940000: any;
        980000: any;
        1010000: any;
        1050000: any;
    };
    const lastCheckpoint: number;
    const halvingInterval: number;
    namespace genesis {
        const version: number;
        const hash: any;
        const prevBlock: any;
        const merkleRoot: any;
        const time: number;
        const bits: number;
        const nonce: number;
        const height: number;
    }
    const genesisBlock: string;
    namespace pow {
        export const limit: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        const bits_1: number;
        export { bits_1 as bits };
        export const chainwork: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        export const targetTimespan: number;
        export const targetSpacing: number;
        export const retargetInterval: number;
        export const targetReset: boolean;
        export const noRetargeting: boolean;
    }
    namespace block {
        const bip34height: number;
        const bip34hash: any;
        const bip65height: number;
        const bip65hash: any;
        const bip66height: number;
        const bip66hash: any;
        const pruneAfterHeight: number;
        const keepBlocks: number;
        const maxTipAge: number;
        const slowHeight: number;
    }
    const bip30: {};
    const activationThreshold: number;
    const minerWindow: number;
    namespace deployments {
        namespace csv {
            const name: string;
            const bit: number;
            const startTime: number;
            const timeout: number;
            const threshold: number;
            const window: number;
            const required: boolean;
            const force: boolean;
        }
        namespace segwit {
            const name_1: string;
            export { name_1 as name };
            const bit_1: number;
            export { bit_1 as bit };
            const startTime_1: number;
            export { startTime_1 as startTime };
            const timeout_1: number;
            export { timeout_1 as timeout };
            const threshold_1: number;
            export { threshold_1 as threshold };
            const window_1: number;
            export { window_1 as window };
            const required_1: boolean;
            export { required_1 as required };
            const force_1: boolean;
            export { force_1 as force };
        }
        namespace segsignal {
            const name_2: string;
            export { name_2 as name };
            const bit_2: number;
            export { bit_2 as bit };
            const startTime_2: number;
            export { startTime_2 as startTime };
            const timeout_2: number;
            export { timeout_2 as timeout };
            const threshold_2: number;
            export { threshold_2 as threshold };
            const window_2: number;
            export { window_2 as window };
            const required_2: boolean;
            export { required_2 as required };
            const force_2: boolean;
            export { force_2 as force };
        }
        namespace testdummy {
            const name_3: string;
            export { name_3 as name };
            const bit_3: number;
            export { bit_3 as bit };
            const startTime_3: number;
            export { startTime_3 as startTime };
            const timeout_3: number;
            export { timeout_3 as timeout };
            const threshold_3: number;
            export { threshold_3 as threshold };
            const window_3: number;
            export { window_3 as window };
            const required_3: boolean;
            export { required_3 as required };
            const force_3: boolean;
            export { force_3 as force };
        }
    }
    const deploys: {
        name: string;
        bit: number;
        startTime: number;
        timeout: number;
        threshold: number;
        window: number;
        required: boolean;
        force: boolean;
    }[];
    namespace keyPrefix {
        const privkey: number;
        const xpubkey: number;
        const xprivkey: number;
        const xpubkey58: string;
        const xprivkey58: string;
        const coinType: number;
    }
    namespace addressPrefix {
        const pubkeyhash: number;
        const scripthash: number;
        const bech32: string;
    }
    const requireStandard: boolean;
    const rpcPort: number;
    const walletPort: number;
    const minRelay: number;
    const feeRate: number;
    const maxFeeRate: number;
    const selfConnect: boolean;
    const requestMempool: boolean;
}
export namespace regtest {
    const type_1: string;
    export { type_1 as type };
    const seeds_1: any[];
    export { seeds_1 as seeds };
    const magic_1: number;
    export { magic_1 as magic };
    const port_1: number;
    export { port_1 as port };
    const checkpointMap_1: {};
    export { checkpointMap_1 as checkpointMap };
    const lastCheckpoint_1: number;
    export { lastCheckpoint_1 as lastCheckpoint };
    const halvingInterval_1: number;
    export { halvingInterval_1 as halvingInterval };
    export namespace genesis_1 {
        const version_1: number;
        export { version_1 as version };
        const hash_1: any;
        export { hash_1 as hash };
        const prevBlock_1: any;
        export { prevBlock_1 as prevBlock };
        const merkleRoot_1: any;
        export { merkleRoot_1 as merkleRoot };
        const time_1: number;
        export { time_1 as time };
        const bits_2: number;
        export { bits_2 as bits };
        const nonce_1: number;
        export { nonce_1 as nonce };
        const height_1: number;
        export { height_1 as height };
    }
    export { genesis_1 as genesis };
    const genesisBlock_1: string;
    export { genesisBlock_1 as genesisBlock };
    export namespace pow_1 {
        const limit_1: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        export { limit_1 as limit };
        const bits_3: number;
        export { bits_3 as bits };
        const chainwork_1: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        export { chainwork_1 as chainwork };
        const targetTimespan_1: number;
        export { targetTimespan_1 as targetTimespan };
        const targetSpacing_1: number;
        export { targetSpacing_1 as targetSpacing };
        const retargetInterval_1: number;
        export { retargetInterval_1 as retargetInterval };
        const targetReset_1: boolean;
        export { targetReset_1 as targetReset };
        const noRetargeting_1: boolean;
        export { noRetargeting_1 as noRetargeting };
    }
    export { pow_1 as pow };
    export namespace block_1 {
        const bip34height_1: number;
        export { bip34height_1 as bip34height };
        const bip34hash_1: any;
        export { bip34hash_1 as bip34hash };
        const bip65height_1: number;
        export { bip65height_1 as bip65height };
        const bip65hash_1: any;
        export { bip65hash_1 as bip65hash };
        const bip66height_1: number;
        export { bip66height_1 as bip66height };
        const bip66hash_1: any;
        export { bip66hash_1 as bip66hash };
        const pruneAfterHeight_1: number;
        export { pruneAfterHeight_1 as pruneAfterHeight };
        const keepBlocks_1: number;
        export { keepBlocks_1 as keepBlocks };
        const maxTipAge_1: number;
        export { maxTipAge_1 as maxTipAge };
        const slowHeight_1: number;
        export { slowHeight_1 as slowHeight };
    }
    export { block_1 as block };
    const bip30_1: {};
    export { bip30_1 as bip30 };
    const activationThreshold_1: number;
    export { activationThreshold_1 as activationThreshold };
    const minerWindow_1: number;
    export { minerWindow_1 as minerWindow };
    export namespace deployments_1 {
        export namespace csv_1 {
            const name_4: string;
            export { name_4 as name };
            const bit_4: number;
            export { bit_4 as bit };
            const startTime_4: number;
            export { startTime_4 as startTime };
            const timeout_4: number;
            export { timeout_4 as timeout };
            const threshold_4: number;
            export { threshold_4 as threshold };
            const window_4: number;
            export { window_4 as window };
            const required_4: boolean;
            export { required_4 as required };
            const force_4: boolean;
            export { force_4 as force };
        }
        export { csv_1 as csv };
        export namespace segwit_1 {
            const name_5: string;
            export { name_5 as name };
            const bit_5: number;
            export { bit_5 as bit };
            const startTime_5: number;
            export { startTime_5 as startTime };
            const timeout_5: number;
            export { timeout_5 as timeout };
            const threshold_5: number;
            export { threshold_5 as threshold };
            const window_5: number;
            export { window_5 as window };
            const required_5: boolean;
            export { required_5 as required };
            const force_5: boolean;
            export { force_5 as force };
        }
        export { segwit_1 as segwit };
        export namespace segsignal_1 {
            const name_6: string;
            export { name_6 as name };
            const bit_6: number;
            export { bit_6 as bit };
            const startTime_6: number;
            export { startTime_6 as startTime };
            const timeout_6: number;
            export { timeout_6 as timeout };
            const threshold_6: number;
            export { threshold_6 as threshold };
            const window_6: number;
            export { window_6 as window };
            const required_6: boolean;
            export { required_6 as required };
            const force_6: boolean;
            export { force_6 as force };
        }
        export { segsignal_1 as segsignal };
        export namespace testdummy_1 {
            const name_7: string;
            export { name_7 as name };
            const bit_7: number;
            export { bit_7 as bit };
            const startTime_7: number;
            export { startTime_7 as startTime };
            const timeout_7: number;
            export { timeout_7 as timeout };
            const threshold_7: number;
            export { threshold_7 as threshold };
            const window_7: number;
            export { window_7 as window };
            const required_7: boolean;
            export { required_7 as required };
            const force_7: boolean;
            export { force_7 as force };
        }
        export { testdummy_1 as testdummy };
    }
    export { deployments_1 as deployments };
    const deploys_1: {
        name: string;
        bit: number;
        startTime: number;
        timeout: number;
        threshold: number;
        window: number;
        required: boolean;
        force: boolean;
    }[];
    export { deploys_1 as deploys };
    export namespace keyPrefix_1 {
        const privkey_1: number;
        export { privkey_1 as privkey };
        const xpubkey_1: number;
        export { xpubkey_1 as xpubkey };
        const xprivkey_1: number;
        export { xprivkey_1 as xprivkey };
        const xpubkey58_1: string;
        export { xpubkey58_1 as xpubkey58 };
        const xprivkey58_1: string;
        export { xprivkey58_1 as xprivkey58 };
        const coinType_1: number;
        export { coinType_1 as coinType };
    }
    export { keyPrefix_1 as keyPrefix };
    export namespace addressPrefix_1 {
        const pubkeyhash_1: number;
        export { pubkeyhash_1 as pubkeyhash };
        const scripthash_1: number;
        export { scripthash_1 as scripthash };
        const bech32_1: string;
        export { bech32_1 as bech32 };
    }
    export { addressPrefix_1 as addressPrefix };
    const requireStandard_1: boolean;
    export { requireStandard_1 as requireStandard };
    const rpcPort_1: number;
    export { rpcPort_1 as rpcPort };
    const walletPort_1: number;
    export { walletPort_1 as walletPort };
    const minRelay_1: number;
    export { minRelay_1 as minRelay };
    const feeRate_1: number;
    export { feeRate_1 as feeRate };
    const maxFeeRate_1: number;
    export { maxFeeRate_1 as maxFeeRate };
    const selfConnect_1: boolean;
    export { selfConnect_1 as selfConnect };
    const requestMempool_1: boolean;
    export { requestMempool_1 as requestMempool };
}
export namespace simnet {
    const type_2: string;
    export { type_2 as type };
    const seeds_2: string[];
    export { seeds_2 as seeds };
    const magic_2: number;
    export { magic_2 as magic };
    const port_2: number;
    export { port_2 as port };
    const checkpointMap_2: {};
    export { checkpointMap_2 as checkpointMap };
    const lastCheckpoint_2: number;
    export { lastCheckpoint_2 as lastCheckpoint };
    const halvingInterval_2: number;
    export { halvingInterval_2 as halvingInterval };
    export namespace genesis_2 {
        const version_2: number;
        export { version_2 as version };
        const hash_2: any;
        export { hash_2 as hash };
        const prevBlock_2: any;
        export { prevBlock_2 as prevBlock };
        const merkleRoot_2: any;
        export { merkleRoot_2 as merkleRoot };
        const time_2: number;
        export { time_2 as time };
        const bits_4: number;
        export { bits_4 as bits };
        const nonce_2: number;
        export { nonce_2 as nonce };
        const height_2: number;
        export { height_2 as height };
    }
    export { genesis_2 as genesis };
    const genesisBlock_2: string;
    export { genesisBlock_2 as genesisBlock };
    export namespace pow_2 {
        const limit_2: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        export { limit_2 as limit };
        const bits_5: number;
        export { bits_5 as bits };
        const chainwork_2: import("../../../bcrypto/lib/native/bn") | import("../../../bcrypto/lib/js/bn");
        export { chainwork_2 as chainwork };
        const targetTimespan_2: number;
        export { targetTimespan_2 as targetTimespan };
        const targetSpacing_2: number;
        export { targetSpacing_2 as targetSpacing };
        const retargetInterval_2: number;
        export { retargetInterval_2 as retargetInterval };
        const targetReset_2: boolean;
        export { targetReset_2 as targetReset };
        const noRetargeting_2: boolean;
        export { noRetargeting_2 as noRetargeting };
    }
    export { pow_2 as pow };
    export namespace block_2 {
        const bip34height_2: number;
        export { bip34height_2 as bip34height };
        const bip34hash_2: any;
        export { bip34hash_2 as bip34hash };
        const bip65height_2: number;
        export { bip65height_2 as bip65height };
        const bip65hash_2: any;
        export { bip65hash_2 as bip65hash };
        const bip66height_2: number;
        export { bip66height_2 as bip66height };
        const bip66hash_2: any;
        export { bip66hash_2 as bip66hash };
        const pruneAfterHeight_2: number;
        export { pruneAfterHeight_2 as pruneAfterHeight };
        const keepBlocks_2: number;
        export { keepBlocks_2 as keepBlocks };
        const maxTipAge_2: number;
        export { maxTipAge_2 as maxTipAge };
        const slowHeight_2: number;
        export { slowHeight_2 as slowHeight };
    }
    export { block_2 as block };
    const bip30_2: {};
    export { bip30_2 as bip30 };
    const activationThreshold_2: number;
    export { activationThreshold_2 as activationThreshold };
    const minerWindow_2: number;
    export { minerWindow_2 as minerWindow };
    export namespace deployments_2 {
        export namespace csv_2 {
            const name_8: string;
            export { name_8 as name };
            const bit_8: number;
            export { bit_8 as bit };
            const startTime_8: number;
            export { startTime_8 as startTime };
            const timeout_8: number;
            export { timeout_8 as timeout };
            const threshold_8: number;
            export { threshold_8 as threshold };
            const window_8: number;
            export { window_8 as window };
            const required_8: boolean;
            export { required_8 as required };
            const force_8: boolean;
            export { force_8 as force };
        }
        export { csv_2 as csv };
        export namespace segwit_2 {
            const name_9: string;
            export { name_9 as name };
            const bit_9: number;
            export { bit_9 as bit };
            const startTime_9: number;
            export { startTime_9 as startTime };
            const timeout_9: number;
            export { timeout_9 as timeout };
            const threshold_9: number;
            export { threshold_9 as threshold };
            const window_9: number;
            export { window_9 as window };
            const required_9: boolean;
            export { required_9 as required };
            const force_9: boolean;
            export { force_9 as force };
        }
        export { segwit_2 as segwit };
        export namespace segsignal_2 {
            const name_10: string;
            export { name_10 as name };
            const bit_10: number;
            export { bit_10 as bit };
            const startTime_10: number;
            export { startTime_10 as startTime };
            const timeout_10: number;
            export { timeout_10 as timeout };
            const threshold_10: number;
            export { threshold_10 as threshold };
            const window_10: number;
            export { window_10 as window };
            const required_10: boolean;
            export { required_10 as required };
            const force_10: boolean;
            export { force_10 as force };
        }
        export { segsignal_2 as segsignal };
        export namespace testdummy_2 {
            const name_11: string;
            export { name_11 as name };
            const bit_11: number;
            export { bit_11 as bit };
            const startTime_11: number;
            export { startTime_11 as startTime };
            const timeout_11: number;
            export { timeout_11 as timeout };
            const threshold_11: number;
            export { threshold_11 as threshold };
            const window_11: number;
            export { window_11 as window };
            const required_11: boolean;
            export { required_11 as required };
            const force_11: boolean;
            export { force_11 as force };
        }
        export { testdummy_2 as testdummy };
    }
    export { deployments_2 as deployments };
    const deploys_2: {
        name: string;
        bit: number;
        startTime: number;
        timeout: number;
        threshold: number;
        window: number;
        required: boolean;
        force: boolean;
    }[];
    export { deploys_2 as deploys };
    export namespace keyPrefix_2 {
        const privkey_2: number;
        export { privkey_2 as privkey };
        const xpubkey_2: number;
        export { xpubkey_2 as xpubkey };
        const xprivkey_2: number;
        export { xprivkey_2 as xprivkey };
        const xpubkey58_2: string;
        export { xpubkey58_2 as xpubkey58 };
        const xprivkey58_2: string;
        export { xprivkey58_2 as xprivkey58 };
        const coinType_2: number;
        export { coinType_2 as coinType };
    }
    export { keyPrefix_2 as keyPrefix };
    export namespace addressPrefix_2 {
        const pubkeyhash_2: number;
        export { pubkeyhash_2 as pubkeyhash };
        const scripthash_2: number;
        export { scripthash_2 as scripthash };
        const bech32_2: string;
        export { bech32_2 as bech32 };
    }
    export { addressPrefix_2 as addressPrefix };
    const requireStandard_2: boolean;
    export { requireStandard_2 as requireStandard };
    const rpcPort_2: number;
    export { rpcPort_2 as rpcPort };
    const walletPort_2: number;
    export { walletPort_2 as walletPort };
    const minRelay_2: number;
    export { minRelay_2 as minRelay };
    const feeRate_2: number;
    export { feeRate_2 as feeRate };
    const maxFeeRate_2: number;
    export { maxFeeRate_2 as maxFeeRate };
    const selfConnect_2: boolean;
    export { selfConnect_2 as selfConnect };
    const requestMempool_2: boolean;
    export { requestMempool_2 as requestMempool };
}
//# sourceMappingURL=networks.d.ts.map