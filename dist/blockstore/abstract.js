/*!
 * blockstore/abstract.js - abstract blockstore for bcoin
 * Copyright (c) 2019, Braydon Fuller (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Logger = require('blgr');
/**
 * Abstract Block Store
 *
 * @alias module:blockstore.AbstractBlockStore
 * @abstract
 */
var AbstractBlockStore = /** @class */ (function () {
    /**
     * Create an abstract blockstore.
     * @constructor
     */
    function AbstractBlockStore(options) {
        this.options = options || {};
        if (this.options.logger != null)
            this.logger = this.options.logger.context('blockstore');
        else
            this.logger = Logger.global.context('blockstore');
    }
    /**
     * This method ensures that resources are available
     * before opening.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.ensure = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method opens any necessary resources and
     * initializes the store to be ready to be queried.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method closes resources and prepares
     * the store to be closed.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method stores merkle blocks including
     * all the relevant transactions.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.writeMerkle = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method stores block undo coin data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.writeUndo = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method stores serialized block filter data in files.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.writeFilter = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method stores block data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.write = function (hash, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method reads merkle block data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.readMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method will retrieve serialized block filter data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.readFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method will retrieve block filter header only.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.readFilterHeader = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method will retrieve block undo coin data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.readUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This method will retrieve block data. Smaller portions of
     * the block can be read by using the offset and size arguments.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.read = function (hash, offset, size) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will free resources for storing the merkle block data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.pruneMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will free resources for storing the block undo coin data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.pruneUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will free resources for storing the serialized block filter data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.pruneFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will free resources for storing the block data.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.prune = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will check if merkle block data has been stored
     * and is available.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.hasMerkle = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will check if a block undo coin data has been stored
     * and is available.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.hasUndo = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will check if a block filter has been stored
     * and is available.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.hasFilter = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    /**
     * This will check if a block has been stored and is available.
     * @returns {Promise}
     */
    AbstractBlockStore.prototype.has = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Abstract method.');
            });
        });
    };
    return AbstractBlockStore;
}());
/*
 * Expose
 */
module.exports = AbstractBlockStore;
