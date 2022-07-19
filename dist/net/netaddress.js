/*!
 * netaddress.js - network address object for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var assert = require('bsert');
var bio = require('bufio');
var IP = require('binet');
var Network = require('../protocol/network');
var util = require('../utils/util');
var common = require('./common');
var inspectSymbol = require('../utils').inspectSymbol;
/**
 * Net Address
 * Represents a network address.
 * @alias module:net.NetAddress
 * @property {Host} host
 * @property {Number} port
 * @property {Number} services
 * @property {Number} time
 */
var NetAddress = /** @class */ (function () {
    /**
     * Create a network address.
     * @constructor
     * @param {Object} options
     * @param {Number?} options.time - Timestamp.
     * @param {Number?} options.services - Service bits.
     * @param {String?} options.host - IP address (IPv6 or IPv4).
     * @param {Number?} options.port - Port.
     */
    function NetAddress(options) {
        this.host = '0.0.0.0';
        this.port = 0;
        this.services = 0;
        this.time = 0;
        this.hostname = '0.0.0.0:0';
        this.raw = IP.ZERO_IP;
        if (options)
            this.fromOptions(options);
    }
    /**
     * Inject properties from options object.
     * @private
     * @param {Object} options
     */
    NetAddress.prototype.fromOptions = function (options) {
        assert(typeof options.host === 'string');
        assert(typeof options.port === 'number');
        this.raw = IP.toBuffer(options.host);
        this.host = IP.toString(this.raw);
        this.port = options.port;
        if (options.services) {
            assert(typeof options.services === 'number');
            this.services = options.services;
        }
        if (options.time) {
            assert(typeof options.time === 'number');
            this.time = options.time;
        }
        this.hostname = IP.toHostname(this.host, this.port);
        return this;
    };
    /**
     * Instantiate network address from options.
     * @param {Object} options
     * @returns {NetAddress}
     */
    NetAddress.fromOptions = function (options) {
        return new this().fromOptions(options);
    };
    /**
     * Test whether required services are available.
     * @param {Number} services
     * @returns {Boolean}
     */
    NetAddress.prototype.hasServices = function (services) {
        return (this.services & services) === services;
    };
    /**
     * Test whether the address is IPv4.
     * @returns {Boolean}
     */
    NetAddress.prototype.isIPv4 = function () {
        return IP.isIPv4(this.raw);
    };
    /**
     * Test whether the address is IPv6.
     * @returns {Boolean}
     */
    NetAddress.prototype.isIPv6 = function () {
        return IP.isIPv6(this.raw);
    };
    /**
     * Test whether the host is null.
     * @returns {Boolean}
     */
    NetAddress.prototype.isNull = function () {
        return IP.isNull(this.raw);
    };
    /**
     * Test whether the host is a local address.
     * @returns {Boolean}
     */
    NetAddress.prototype.isLocal = function () {
        return IP.isLocal(this.raw);
    };
    /**
     * Test whether the host is valid.
     * @returns {Boolean}
     */
    NetAddress.prototype.isValid = function () {
        return IP.isValid(this.raw);
    };
    /**
     * Test whether the host is routable.
     * @returns {Boolean}
     */
    NetAddress.prototype.isRoutable = function () {
        return IP.isRoutable(this.raw);
    };
    /**
     * Test whether the host is an onion address.
     * @returns {Boolean}
     */
    NetAddress.prototype.isOnion = function () {
        return IP.isOnion(this.raw);
    };
    /**
     * Compare against another network address.
     * @returns {Boolean}
     */
    NetAddress.prototype.equal = function (addr) {
        return this.compare(addr) === 0;
    };
    /**
     * Compare against another network address.
     * @returns {Number}
     */
    NetAddress.prototype.compare = function (addr) {
        var cmp = this.raw.compare(addr.raw);
        if (cmp !== 0)
            return cmp;
        return this.port - addr.port;
    };
    /**
     * Get reachable score to destination.
     * @param {NetAddress} dest
     * @returns {Number}
     */
    NetAddress.prototype.getReachability = function (dest) {
        return IP.getReachability(this.raw, dest.raw);
    };
    /**
     * Set null host.
     */
    NetAddress.prototype.setNull = function () {
        this.raw = IP.ZERO_IP;
        this.host = '0.0.0.0';
        this.hostname = IP.toHostname(this.host, this.port);
    };
    /**
     * Set host.
     * @param {String} host
     */
    NetAddress.prototype.setHost = function (host) {
        this.raw = IP.toBuffer(host);
        this.host = IP.toString(this.raw);
        this.hostname = IP.toHostname(this.host, this.port);
    };
    /**
     * Set port.
     * @param {Number} port
     */
    NetAddress.prototype.setPort = function (port) {
        assert(port >= 0 && port <= 0xffff);
        this.port = port;
        this.hostname = IP.toHostname(this.host, port);
    };
    /**
     * Inject properties from host, port, and network.
     * @private
     * @param {String} host
     * @param {Number} port
     * @param {(Network|NetworkType)?} network
     */
    NetAddress.prototype.fromHost = function (host, port, network) {
        network = Network.get(network);
        assert(port >= 0 && port <= 0xffff);
        this.raw = IP.toBuffer(host);
        this.host = IP.toString(this.raw);
        this.port = port;
        this.services = NetAddress.DEFAULT_SERVICES;
        this.time = network.now();
        this.hostname = IP.toHostname(this.host, this.port);
        return this;
    };
    /**
     * Instantiate a network address
     * from a host and port.
     * @param {String} host
     * @param {Number} port
     * @param {(Network|NetworkType)?} network
     * @returns {NetAddress}
     */
    NetAddress.fromHost = function (host, port, network) {
        return new this().fromHost(host, port, network);
    };
    /**
     * Inject properties from hostname and network.
     * @private
     * @param {String} hostname
     * @param {(Network|NetworkType)?} network
     */
    NetAddress.prototype.fromHostname = function (hostname, network) {
        network = Network.get(network);
        var addr = IP.fromHostname(hostname, network.port);
        return this.fromHost(addr.host, addr.port, network);
    };
    /**
     * Instantiate a network address
     * from a hostname (i.e. 127.0.0.1:8333).
     * @param {String} hostname
     * @param {(Network|NetworkType)?} network
     * @returns {NetAddress}
     */
    NetAddress.fromHostname = function (hostname, network) {
        return new this().fromHostname(hostname, network);
    };
    /**
     * Inject properties from socket.
     * @private
     * @param {net.Socket} socket
     */
    NetAddress.prototype.fromSocket = function (socket, network) {
        var host = socket.remoteAddress;
        var port = socket.remotePort;
        assert(typeof host === 'string');
        assert(typeof port === 'number');
        return this.fromHost(IP.normalize(host), port, network);
    };
    /**
     * Instantiate a network address
     * from a socket.
     * @param {net.Socket} socket
     * @returns {NetAddress}
     */
    NetAddress.fromSocket = function (hostname, network) {
        return new this().fromSocket(hostname, network);
    };
    /**
     * Inject properties from buffer reader.
     * @private
     * @param {BufferReader} br
     * @param {Boolean?} full - Include timestamp.
     */
    NetAddress.prototype.fromReader = function (br, full) {
        this.time = full ? br.readU32() : 0;
        this.services = br.readU32();
        // Note: hi service bits
        // are currently unused.
        br.readU32();
        this.raw = br.readBytes(16);
        this.host = IP.toString(this.raw);
        this.port = br.readU16BE();
        this.hostname = IP.toHostname(this.host, this.port);
        return this;
    };
    /**
     * Inject properties from serialized data.
     * @private
     * @param {Buffer} data
     * @param {Boolean?} full - Include timestamp.
     */
    NetAddress.prototype.fromRaw = function (data, full) {
        return this.fromReader(bio.read(data), full);
    };
    /**
     * Insantiate a network address from buffer reader.
     * @param {BufferReader} br
     * @param {Boolean?} full - Include timestamp.
     * @returns {NetAddress}
     */
    NetAddress.fromReader = function (br, full) {
        return new this().fromReader(br, full);
    };
    /**
     * Insantiate a network address from serialized data.
     * @param {Buffer} data
     * @param {Boolean?} full - Include timestamp.
     * @returns {NetAddress}
     */
    NetAddress.fromRaw = function (data, full) {
        return new this().fromRaw(data, full);
    };
    /**
     * Write network address to a buffer writer.
     * @param {BufferWriter} bw
     * @param {Boolean?} full - Include timestamp.
     * @returns {Buffer}
     */
    NetAddress.prototype.toWriter = function (bw, full) {
        if (full)
            bw.writeU32(this.time);
        bw.writeU32(this.services);
        bw.writeU32(0);
        bw.writeBytes(this.raw);
        bw.writeU16BE(this.port);
        return bw;
    };
    /**
     * Calculate serialization size of address.
     * @returns {Number}
     */
    NetAddress.prototype.getSize = function (full) {
        return 26 + (full ? 4 : 0);
    };
    /**
     * Serialize network address.
     * @param {Boolean?} full - Include timestamp.
     * @returns {Buffer}
     */
    NetAddress.prototype.toRaw = function (full) {
        var size = this.getSize(full);
        return this.toWriter(bio.write(size), full).render();
    };
    /**
     * Convert net address to json-friendly object.
     * @returns {Object}
     */
    NetAddress.prototype.toJSON = function () {
        return {
            host: this.host,
            port: this.port,
            services: this.services,
            time: this.time
        };
    };
    /**
     * Inject properties from json object.
     * @private
     * @param {Object} json
     * @returns {NetAddress}
     */
    NetAddress.prototype.fromJSON = function (json) {
        assert((json.port & 0xffff) === json.port);
        assert((json.services >>> 0) === json.services);
        assert((json.time >>> 0) === json.time);
        this.raw = IP.toBuffer(json.host);
        this.host = json.host;
        this.port = json.port;
        this.services = json.services;
        this.time = json.time;
        this.hostname = IP.toHostname(this.host, this.port);
        return this;
    };
    /**
     * Instantiate net address from json object.
     * @param {Object} json
     * @returns {NetAddress}
     */
    NetAddress.fromJSON = function (json) {
        return new this().fromJSON(json);
    };
    /**
     * Inspect the network address.
     * @returns {Object}
     */
    NetAddress.prototype[inspectSymbol] = function () {
        return '<NetAddress:'
            + " hostname=".concat(this.hostname)
            + " services=".concat(this.services.toString(2))
            + " date=".concat(util.date(this.time))
            + '>';
    };
    return NetAddress;
}());
/**
 * Default services for
 * unknown outbound peers.
 * @const {Number}
 * @default
 */
NetAddress.DEFAULT_SERVICES = 0
    | common.services.NETWORK
    | common.services.WITNESS
    | common.services.BLOOM;
/*
 * Expose
 */
module.exports = NetAddress;
