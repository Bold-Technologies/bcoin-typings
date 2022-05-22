export = WalletNode;
/**
 * Wallet Node
 * @extends Node
 */
declare class WalletNode extends Node {
    /**
     * Create a wallet node.
     * @constructor
     * @param {Object?} options
     */
    constructor(options: any | null);
    opened: boolean;
    client: Client;
    wdb: WalletDB;
    rpc: RPC;
    http: HTTP;
    /**
     * Initialize the node.
     * @private
     */
    private init;
    /**
     * Open the node and all its child objects,
     * wait for the database to load.
     * @returns {Promise}
     */
    open(): Promise<any>;
    /**
     * Close the node, wait for the database to close.
     * @returns {Promise}
     */
    close(): Promise<any>;
}
import Node = require("../node/node");
import Client = require("./client");
import WalletDB = require("./walletdb");
import RPC = require("./rpc");
import HTTP = require("./http");
//# sourceMappingURL=node.d.ts.map