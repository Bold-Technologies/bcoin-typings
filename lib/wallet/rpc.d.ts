export = RPC;
/**
 * Wallet RPC
 * @alias module:wallet.RPC
 * @extends bweb.RPC
 */
declare class RPC {
    /**
     * Create an RPC.
     * @param {WalletDB} wdb
     */
    constructor(node: any);
    wdb: any;
    network: any;
    logger: any;
    client: any;
    locker: any;
    wallet: any;
    getCode(err: any): any;
    handleCall(cmd: any, query: any): void;
    init(): void;
    help(args: any, _help: any): Promise<any>;
    stop(args: any, help: any): Promise<string>;
    fundRawTransaction(args: any, help: any): Promise<{
        hex: any;
        changepos: any;
        fee: string;
    }>;
    resendWalletTransactions(args: any, help: any): Promise<any[]>;
    addMultisigAddress(args: any, help: any): Promise<void>;
    addWitnessAddress(args: any, help: any): Promise<void>;
    backupWallet(args: any, help: any): Promise<any>;
    dumpPrivKey(args: any, help: any): Promise<any>;
    dumpWallet(args: any, help: any): Promise<string>;
    encryptWallet(args: any, help: any): Promise<string>;
    getAccountAddress(args: any, help: any): Promise<any>;
    getAccount(args: any, help: any): Promise<any>;
    getAddressesByAccount(args: any, help: any): Promise<any[]>;
    getAddressInfo(args: any, help: any): Promise<{
        address: string;
        scriptPubKey: string;
        ismine: boolean;
        ischange: boolean;
        iswatchonly: any;
        isscript: boolean;
        iswitness: boolean;
    }>;
    getBalance(args: any, help: any): Promise<string | 0>;
    getNewAddress(args: any, help: any): Promise<any>;
    getRawChangeAddress(args: any, help: any): Promise<any>;
    getReceivedByAccount(args: any, help: any): Promise<string>;
    getReceivedByAddress(args: any, help: any): Promise<string>;
    _toWalletTX(wtx: any): Promise<{
        amount: string;
        confirmations: any;
        blockhash: string;
        blockindex: any;
        blocktime: any;
        txid: string;
        walletconflicts: any[];
        time: any;
        timereceived: any;
        'bip125-replaceable': string;
        details: ({
            account: any;
            address: any;
            category: string;
            amount: string;
            label: any;
            vout: number;
            fee?: undefined;
        } | {
            account: string;
            address: any;
            category: string;
            amount: number;
            fee: number;
            vout: number;
            label?: undefined;
        })[];
        hex: any;
    }>;
    getTransaction(args: any, help: any): Promise<{
        amount: string;
        confirmations: any;
        blockhash: string;
        blockindex: any;
        blocktime: any;
        txid: string;
        walletconflicts: any[];
        time: any;
        timereceived: any;
        'bip125-replaceable': string;
        details: ({
            account: any;
            address: any;
            category: string;
            amount: string;
            label: any;
            vout: number;
            fee?: undefined;
        } | {
            account: string;
            address: any;
            category: string;
            amount: number;
            fee: number;
            vout: number;
            label?: undefined;
        })[];
        hex: any;
    }>;
    abandonTransaction(args: any, help: any): Promise<any>;
    getUnconfirmedBalance(args: any, help: any): Promise<string>;
    getWalletInfo(args: any, help: any): Promise<{
        walletid: any;
        walletversion: number;
        balance: string;
        unconfirmed_balance: string;
        txcount: any;
        keypoololdest: number;
        keypoolsize: number;
        unlocked_until: any;
        paytxfee: string;
    }>;
    importPrivKey(args: any, help: any): Promise<any>;
    importWallet(args: any, help: any): Promise<any>;
    importAddress(args: any, help: any): Promise<any>;
    importPubkey(args: any, help: any): Promise<any>;
    keyPoolRefill(args: any, help: any): Promise<any>;
    listAccounts(args: any, help: any): Promise<{}>;
    listAddressGroupings(args: any, help: any): Promise<void>;
    listLockUnspent(args: any, help: any): Promise<{
        txid: any;
        vout: any;
    }[]>;
    listReceivedByAccount(args: any, help: any): Promise<any[]>;
    listReceivedByAddress(args: any, help: any): Promise<any[]>;
    _listReceived(minconf: any, empty: any, watchOnly: any, account: any): Promise<any[]>;
    listSinceBlock(args: any, help: any): Promise<any[] | {
        transactions: {
            account: any;
            address: any;
            category: string;
            amount: string;
            label: any;
            vout: number;
            confirmations: any;
            blockhash: string;
            blockindex: number;
            blocktime: any;
            blockheight: any;
            txid: string;
            walletconflicts: any[];
            time: any;
            timereceived: any;
            'bip125-replaceable': string;
        }[];
        lastblock: string;
    }>;
    _toListTX(wtx: any): Promise<{
        account: any;
        address: any;
        category: string;
        amount: string;
        label: any;
        vout: number;
        confirmations: any;
        blockhash: string;
        blockindex: number;
        blocktime: any;
        blockheight: any;
        txid: string;
        walletconflicts: any[];
        time: any;
        timereceived: any;
        'bip125-replaceable': string;
    }>;
    listTransactions(args: any, help: any): Promise<{
        account: any;
        address: any;
        category: string;
        amount: string;
        label: any;
        vout: number;
        confirmations: any;
        blockhash: string;
        blockindex: number;
        blocktime: any;
        blockheight: any;
        txid: string;
        walletconflicts: any[];
        time: any;
        timereceived: any;
        'bip125-replaceable': string;
    }[]>;
    listUnspent(args: any, help: any): Promise<{
        txid: any;
        vout: any;
        address: any;
        account: any;
        redeemScript: any;
        scriptPubKey: any;
        amount: string;
        confirmations: any;
        spendable: boolean;
        solvable: boolean;
    }[]>;
    lockUnspent(args: any, help: any): Promise<boolean>;
    move(args: any, help: any): Promise<void>;
    sendFrom(args: any, help: any): Promise<any>;
    sendMany(args: any, help: any): Promise<any>;
    sendToAddress(args: any, help: any): Promise<any>;
    setAccount(args: any, help: any): Promise<void>;
    setTXFee(args: any, help: any): Promise<boolean>;
    signMessage(args: any, help: any): Promise<any>;
    walletLock(args: any, help: any): Promise<any>;
    walletPassphraseChange(args: any, help: any): Promise<any>;
    walletPassphrase(args: any, help: any): Promise<any>;
    importPrunedFunds(args: any, help: any): Promise<any>;
    removePrunedFunds(args: any, help: any): Promise<any>;
    selectWallet(args: any, help: any): Promise<any>;
    getMemoryInfo(args: any, help: any): Promise<any>;
    setLogLevel(args: any, help: any): Promise<any>;
}
//# sourceMappingURL=rpc.d.ts.map