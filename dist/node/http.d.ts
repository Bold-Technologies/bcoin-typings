export = HTTP;
/**
 * HTTP
 * @alias module:http.Server
 */
declare class HTTP {
    /**
     * Create an http server.
     * @constructor
     * @param {Object} options
     */
    constructor(options: any);
    network: any;
    logger: any;
    node: any;
    chain: any;
    mempool: any;
    pool: any;
    fees: any;
    miner: any;
    rpc: any;
    /**
     * Initialize routes.
     * @private
     */
    private init;
    /**
     * Initialize routes.
     * @private
     */
    private initRouter;
    /**
     * Handle new websocket.
     * @private
     * @param {WebSocket} socket
     */
    private handleSocket;
    /**
     * Handle new auth'd websocket.
     * @private
     * @param {WebSocket} socket
     */
    private handleAuth;
    /**
     * Bind to chain events.
     * @private
     */
    private initSockets;
    /**
     * Filter block by socket.
     * @private
     * @param {WebSocket} socket
     * @param {Block} block
     * @returns {TX[]}
     */
    private filterBlock;
    /**
     * Filter transaction by socket.
     * @private
     * @param {WebSocket} socket
     * @param {TX} tx
     * @returns {Boolean}
     */
    private filterTX;
    /**
     * Scan using a socket's filter.
     * @private
     * @param {WebSocket} socket
     * @param {Hash} start
     * @returns {Promise}
     */
    private scan;
}
//# sourceMappingURL=http.d.ts.map