/**
 * Verify Error
 * An error thrown during verification. Can be either
 * a mempool transaction validation error or a blockchain
 * block verification error. Ultimately used to send
 * `reject` packets to peers.
 * @extends Error
 * @param {Block|TX} msg
 * @param {String} code - Reject packet code.
 * @param {String} reason - Reject packet reason.
 * @param {Number} score - Ban score increase
 * (can be -1 for no reject packet).
 * @param {Boolean} malleated
 */
export class VerifyError extends Error {
    /**
     * Create a verify error.
     * @constructor
     * @param {Block|TX} msg
     * @param {String} code - Reject packet code.
     * @param {String} reason - Reject packet reason.
     * @param {Number} score - Ban score increase
     * (can be -1 for no reject packet).
     * @param {Boolean} malleated
     */
    constructor(msg: Block | TX, code: string, reason: string, score: number, malleated: boolean);
    type: string;
    code: string;
    reason: string;
    score: number;
    hash: any;
    malleated: boolean;
}
//# sourceMappingURL=errors.d.ts.map