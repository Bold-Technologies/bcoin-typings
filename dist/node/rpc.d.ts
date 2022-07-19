export = RPC;
/**
 * Bitcoin RPC
 * @alias module:http.RPC
 * @extends bweb.RPC
 */
declare class RPC {
    /**
     * Create RPC.
     * @param {Node} node
     */
    constructor(node: Node);
    node: Node;
    network: any;
    workers: any;
    chain: any;
    mempool: any;
    pool: any;
    fees: any;
    miner: any;
    logger: any;
    locker: any;
    mining: boolean;
    procLimit: number;
    attempt: any;
    lastActivity: number;
    boundChain: boolean;
    nonce1: number;
    nonce2: number;
    merkleMap: any;
    pollers: any[];
    getCode(err: any): any;
    handleCall(cmd: any, query: any): void;
    init(): void;
    getInfo(args: any, help: any): Promise<{
        version: any;
        protocolversion: any;
        walletversion: number;
        balance: number;
        blocks: any;
        timeoffset: any;
        connections: any;
        proxy: string;
        difficulty: number;
        testnet: boolean;
        keypoololdest: number;
        keypoolsize: number;
        unlocked_until: number;
        paytxfee: string;
        relayfee: string;
        errors: string;
    }>;
    help(args: any, _help: any): Promise<any>;
    stop(args: any, help: any): Promise<string>;
    getNetworkInfo(args: any, help: any): Promise<{
        version: any;
        subversion: any;
        protocolversion: any;
        localservices: any;
        localservicenames: any;
        localrelay: boolean;
        timeoffset: any;
        networkactive: any;
        connections: any;
        networks: any[];
        relayfee: string;
        incrementalfee: number;
        localaddresses: {
            address: any;
            port: any;
            score: any;
        }[];
        warnings: string;
    }>;
    addNode(args: any, help: any): Promise<any>;
    disconnectNode(args: any, help: any): Promise<any>;
    getAddedNodeInfo(args: any, help: any): Promise<{
        addednode: any;
        connected: any;
        addresses: {
            address: any;
            connected: string;
        }[];
    }[]>;
    getConnectionCount(args: any, help: any): Promise<any>;
    getNetTotals(args: any, help: any): Promise<{
        totalbytesrecv: number;
        totalbytessent: number;
        timemillis: number;
    }>;
    getPeerInfo(args: any, help: any): Promise<{
        id: any;
        addr: any;
        addrlocal: any;
        name: any;
        services: any;
        servicenames: any;
        relaytxes: boolean;
        lastsend: number;
        lastrecv: number;
        bytessent: any;
        bytesrecv: any;
        conntime: number;
        timeoffset: any;
        pingtime: number;
        minping: number;
        version: any;
        subver: any;
        inbound: boolean;
        startingheight: any;
        besthash: string;
        bestheight: any;
        banscore: any;
        inflight: string[];
        whitelisted: boolean;
    }[]>;
    ping(args: any, help: any): Promise<any>;
    setBan(args: any, help: any): Promise<any>;
    listBanned(args: any, help: any): Promise<{
        address: any;
        banned_until: any;
        ban_created: any;
        ban_reason: string;
    }[]>;
    clearBanned(args: any, help: any): Promise<any>;
    getNodeAddresses(args: any, help: any): Promise<any[]>;
    getBlockchainInfo(args: any, help: any): Promise<{
        chain: any;
        blocks: any;
        headers: any;
        bestblockhash: any;
        difficulty: number;
        mediantime: any;
        verificationprogress: any;
        chainwork: any;
        pruned: any;
        softforks: {
            id: any;
            version: any;
            reject: {
                status: any;
            };
        }[];
        bip9_softforks: {};
        pruneheight: number;
    }>;
    getBestBlockHash(args: any, help: any): Promise<any>;
    getBlockCount(args: any, help: any): Promise<any>;
    getBlock(args: any, help: any): Promise<any>;
    getBlockByHeight(args: any, help: any): Promise<any>;
    getBlockHash(args: any, help: any): Promise<string>;
    getBlockHeader(args: any, help: any): Promise<any>;
    getBlockFilter(args: any, help: any): Promise<any>;
    getChainTips(args: any, help: any): Promise<{
        height: any;
        hash: any;
        branchlen: number;
        status: string;
    }[]>;
    getDifficulty(args: any, help: any): Promise<number>;
    getMempoolInfo(args: any, help: any): Promise<{
        size: any;
        bytes: any;
        usage: any;
        maxmempool: any;
        mempoolminfee: string;
    }>;
    getMempoolAncestors(args: any, help: any): Promise<any[]>;
    getMempoolDescendants(args: any, help: any): Promise<any[]>;
    getMempoolEntry(args: any, help: any): Promise<{
        size: any;
        fee: string;
        modifiedfee: number;
        time: any;
        height: any;
        startingpriority: any;
        currentpriority: any;
        descendantcount: any;
        descendantsize: any;
        descendantfees: any;
        ancestorcount: any;
        ancestorsize: number;
        ancestorfees: number;
        depends: any;
    }>;
    getRawMempool(args: any, help: any): Promise<any>;
    getTXOut(args: any, help: any): Promise<{
        bestblock: any;
        confirmations: any;
        value: string;
        scriptPubKey: {
            asm: any;
            hex: any;
            type: any;
            reqSigs: number;
            addresses: any[];
            p2sh: any;
        };
        version: any;
        coinbase: any;
    }>;
    getTXOutProof(args: any, help: any): Promise<any>;
    verifyTXOutProof(args: any, help: any): Promise<string[]>;
    getTXOutSetInfo(args: any, help: any): Promise<{
        height: any;
        bestblock: any;
        transactions: any;
        txouts: any;
        bytes_serialized: number;
        hash_serialized: number;
        total_amount: string;
    }>;
    pruneBlockchain(args: any, help: any): Promise<void>;
    verifyChain(args: any, help: any): Promise<any>;
    submitWork(data: any): Promise<boolean>;
    _submitWork(data: any): Promise<boolean>;
    createWork(data: any): Promise<{
        data: any;
        target: any;
        height: any;
    }>;
    _createWork(): Promise<{
        data: any;
        target: any;
        height: any;
    }>;
    getWorkLongpoll(args: any, help: any): Promise<{
        data: any;
        target: any;
        height: any;
    }>;
    getWork(args: any, help: any): Promise<boolean | {
        data: any;
        target: any;
        height: any;
    }>;
    submitBlock(args: any, help: any): Promise<string>;
    getBlockTemplate(args: any, help: any): Promise<any>;
    createTemplate(maxVersion: any, coinbase: any, rules: any): Promise<{
        capabilities: string[];
        mutable: string[];
        version: any;
        rules: any[];
        vbavailable: {};
        vbrequired: number;
        height: any;
        previousblockhash: string;
        target: string;
        bits: any;
        noncerange: string;
        curtime: any;
        mintime: any;
        maxtime: any;
        expires: any;
        sigoplimit: number;
        sizelimit: number;
        weightlimit: any;
        longpollid: any;
        submitold: boolean;
        coinbaseaux: {
            flags: any;
        };
        coinbasevalue: any;
        coinbasetxn: any;
        default_witness_commitment: any;
        transactions: {
            data: any;
            txid: any;
            hash: any;
            depends: any[];
            fee: any;
            sigops: number;
            weight: any;
        }[];
    }>;
    _createTemplate(maxVersion: any, coinbase: any, rules: any): Promise<{
        capabilities: string[];
        mutable: string[];
        version: any;
        rules: any[];
        vbavailable: {};
        vbrequired: number;
        height: any;
        previousblockhash: string;
        target: string;
        bits: any;
        noncerange: string;
        curtime: any;
        mintime: any;
        maxtime: any;
        expires: any;
        sigoplimit: number;
        sizelimit: number;
        weightlimit: any;
        longpollid: any;
        submitold: boolean;
        coinbaseaux: {
            flags: any;
        };
        coinbasevalue: any;
        coinbasetxn: any;
        default_witness_commitment: any;
        transactions: {
            data: any;
            txid: any;
            hash: any;
            depends: any[];
            fee: any;
            sigops: number;
            weight: any;
        }[];
    }>;
    getMiningInfo(args: any, help: any): Promise<{
        blocks: any;
        currentblocksize: number;
        currentblockweight: number;
        currentblocktx: number;
        difficulty: number;
        errors: string;
        genproclimit: number;
        networkhashps: number;
        pooledtx: any;
        testnet: boolean;
        chain: any;
        generate: boolean;
    }>;
    getNetworkHashPS(args: any, help: any): Promise<number>;
    prioritiseTransaction(args: any, help: any): Promise<boolean>;
    verifyBlock(args: any, help: any): Promise<any>;
    getGenerate(args: any, help: any): Promise<boolean>;
    setGenerate(args: any, help: any): Promise<boolean>;
    generate(args: any, help: any): Promise<any[]>;
    generateToAddress(args: any, help: any): Promise<any[]>;
    createRawTransaction(args: any, help: any): Promise<any>;
    decodeRawTransaction(args: any, help: any): Promise<{
        txid: any;
        hash: any;
        size: any;
        vsize: any;
        version: any;
        locktime: any;
        vin: {
            coinbase: any;
            txid: any;
            scriptSig: any;
            txinwitness: any;
            sequence: any;
        }[];
        vout: {
            value: string;
            n: number;
            scriptPubKey: {
                asm: any;
                hex: any;
                type: any;
                reqSigs: number;
                addresses: any[];
                p2sh: any;
            };
        }[];
        blockhash: any;
        confirmations: number;
        time: number;
        blocktime: number;
        hex: any;
    }>;
    decodeScript(args: any, help: any): Promise<{
        asm: any;
        hex: any;
        type: any;
        reqSigs: number;
        addresses: any[];
        p2sh: any;
    }>;
    getRawTransaction(args: any, help: any): Promise<any>;
    sendRawTransaction(args: any, help: any): Promise<any>;
    signRawTransaction(args: any, help: any): Promise<{
        hex: any;
        complete: any;
    }>;
    createMultisig(args: any, help: any): Promise<{
        address: string;
        redeemScript: string;
    }>;
    createWitnessAddress(args: any, help: any): Promise<{
        address: string;
        witnessScript: string;
    }>;
    validateAddress(args: any, help: any): Promise<{
        isvalid: boolean;
        address: string;
        scriptPubKey: string;
        isscript: boolean;
        iswitness: boolean;
    } | {
        isvalid: boolean;
    }>;
    verifyMessage(args: any, help: any): Promise<boolean>;
    signMessageWithPrivkey(args: any, help: any): Promise<any>;
    estimateFee(args: any, help: any): Promise<string | -1>;
    estimatePriority(args: any, help: any): Promise<any>;
    estimateSmartFee(args: any, help: any): Promise<{
        fee: any;
        blocks: any;
    }>;
    estimateSmartPriority(args: any, help: any): Promise<{
        priority: any;
        blocks: any;
    }>;
    invalidateBlock(args: any, help: any): Promise<any>;
    reconsiderBlock(args: any, help: any): Promise<any>;
    setMockTime(args: any, help: any): Promise<any>;
    getMemoryInfo(args: any, help: any): Promise<any>;
    setLogLevel(args: any, help: any): Promise<any>;
    handleLongpoll(lpid: any): Promise<void>;
    longpoll(): any;
    refreshBlock(): void;
    bindChain(): void;
    getTemplate(): Promise<any>;
    updateWork(): Promise<any>;
    addBlock(block: any): Promise<string>;
    _addBlock(block: any): Promise<string>;
    totalTX(): any;
    getSoftforks(): {
        id: any;
        version: any;
        reject: {
            status: any;
        };
    }[];
    getBIP9Softforks(): Promise<{}>;
    getHashRate(lookup: any, height: any): Promise<number>;
    mineBlocks(blocks: any, addr: any, tries: any): Promise<any[]>;
    _mineBlocks(blocks: any, addr: any, tries: any): Promise<any[]>;
    findFork(entry: any): Promise<any>;
    txToJSON(tx: any, entry: any): {
        txid: any;
        hash: any;
        size: any;
        vsize: any;
        version: any;
        locktime: any;
        vin: {
            coinbase: any;
            txid: any;
            scriptSig: any;
            txinwitness: any;
            sequence: any;
        }[];
        vout: {
            value: string;
            n: number;
            scriptPubKey: {
                asm: any;
                hex: any;
                type: any;
                reqSigs: number;
                addresses: any[];
                p2sh: any;
            };
        }[];
        blockhash: any;
        confirmations: number;
        time: number;
        blocktime: number;
        hex: any;
    };
    scriptToJSON(script: any, hex: any): {
        asm: any;
        hex: any;
        type: any;
        reqSigs: number;
        addresses: any[];
        p2sh: any;
    };
    headerToJSON(entry: any): Promise<{
        hash: any;
        confirmations: number;
        height: any;
        version: any;
        versionHex: any;
        merkleroot: string;
        time: any;
        mediantime: any;
        nonce: any;
        bits: any;
        difficulty: number;
        chainwork: any;
        previousblockhash: string;
        nextblockhash: string;
    }>;
    blockToJSON(entry: any, block: any, details: any): Promise<{
        hash: any;
        confirmations: number;
        strippedsize: any;
        size: any;
        weight: any;
        height: any;
        version: any;
        versionHex: any;
        merkleroot: string;
        coinbase: any;
        tx: any[];
        time: any;
        mediantime: any;
        nonce: any;
        bits: any;
        difficulty: number;
        chainwork: any;
        nTx: number;
        previousblockhash: string;
        nextblockhash: string;
    }>;
    entryToJSON(entry: any): {
        size: any;
        fee: string;
        modifiedfee: number;
        time: any;
        height: any;
        startingpriority: any;
        currentpriority: any;
        descendantcount: any;
        descendantsize: any;
        descendantfees: any;
        ancestorcount: any;
        ancestorsize: number;
        ancestorfees: number;
        depends: any;
    };
}
//# sourceMappingURL=rpc.d.ts.map