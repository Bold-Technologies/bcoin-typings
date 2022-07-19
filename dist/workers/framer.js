/*!
 * workers.js - worker processes for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var bio = require('bufio');
/**
 * Framer
 * @alias module:workers.Framer
 */
var Framer = /** @class */ (function () {
    /**
     * Create a framer.
     * @constructor
     */
    function Framer() {
    }
    Framer.prototype.packet = function (payload) {
        var size = 10 + payload.getSize();
        var bw = bio.write(size);
        bw.writeU32(payload.id);
        bw.writeU8(payload.cmd);
        bw.seek(4);
        payload.toWriter(bw);
        bw.writeU8(0x0a);
        var msg = bw.render();
        msg.writeUInt32LE(msg.length - 10, 5, true);
        return msg;
    };
    return Framer;
}());
/*
 * Expose
 */
module.exports = Framer;
