export = WalletClient;
declare class WalletClient extends NodeClient {
    constructor(options: any);
    bind(event: any, handler: any): void;
    hook(event: any, handler: any): void;
    getTip(): Promise<{
        hash: any;
        height: any;
        time: any;
    }>;
    getEntry(block: any): Promise<{
        hash: any;
        height: any;
        time: any;
    }>;
    send(tx: any): Promise<any>;
    setFilter(filter: any): Promise<any>;
    rescan(start: any): Promise<any>;
}
import NodeClient = require("../client/node");
//# sourceMappingURL=client.d.ts.map