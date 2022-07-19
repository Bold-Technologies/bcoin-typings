export = HTTP;
/**
 * HTTP
 * @alias module:wallet.HTTP
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
    wdb: any;
    rpc: any;
    /**
     * Initialize http server.
     * @private
     */
    private init;
    /**
     * Initialize routes.
     * @private
     */
    private initRouter;
    /**
     * Initialize websockets.
     * @private
     */
    private initSockets;
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
}
//# sourceMappingURL=http.d.ts.map