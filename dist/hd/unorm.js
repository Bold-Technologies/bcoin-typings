/*!
 * Unorm
 * https://github.com/walling/unorm
 *
 * The software dual licensed under the MIT and GPL licenses. MIT license:
 *
 * Copyright (c) 2008-2013
 * Matsuza <matsuza@gmail.com>,
 * Bjarke Walling <bwp@bwp.dk>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * GPL notice (please read the [full GPL license] online):
 *
 * Copyright (C) 2008-2013
 * Matsuza <matsuza@gmail.com>,
 * Bjarke Walling <bwp@bwp.dk>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301, USA.
 *
 * [full GPL license]: http://www.gnu.org/licenses/gpl-2.0-standalone.html
*/
'use strict';
var udata = require('./udata.json');
var DEFAULT_FEATURE = [null, 0, {}];
var CACHE_THRESHOLD = 10;
var SBase = 0xac00;
var LBase = 0x1100;
var VBase = 0x1161;
var TBase = 0x11a7;
var LCount = 19;
var VCount = 21;
var TCount = 28;
var NCount = VCount * TCount; // 588
var SCount = LCount * NCount; // 11172
var cache = {};
var cacheCounter = [];
for (var i = 0; i <= 0xff; i++)
    cacheCounter[i] = 0;
var fromCharCode = null;
var UChar = /** @class */ (function () {
    function UChar(cp, feature) {
        this.codepoint = cp;
        this.feature = feature;
    }
    UChar.isHighSurrogate = function (cp) {
        return cp >= 0xd800 && cp <= 0xdbff;
    };
    UChar.isLowSurrogate = function (cp) {
        return cp >= 0xdc00 && cp <= 0xdfff;
    };
    UChar.prototype.prepFeature = function () {
        if (!this.feature)
            this.feature = fromCharCode(this.codepoint, true).feature;
    };
    UChar.prototype.toString = function () {
        if (this.codepoint < 0x10000)
            return String.fromCharCode(this.codepoint);
        var x = this.codepoint - 0x10000;
        return String.fromCharCode(Math.floor(x / 0x400) + 0xd800, x % 0x400 + 0xdc00);
    };
    UChar.prototype.getDecomp = function () {
        this.prepFeature();
        return this.feature[0] || null;
    };
    UChar.prototype.isCompatibility = function () {
        this.prepFeature();
        return Boolean(this.feature[1]) && (this.feature[1] & (1 << 8)) !== 0;
    };
    UChar.prototype.isExclude = function () {
        this.prepFeature();
        return Boolean(this.feature[1]) && (this.feature[1] & (1 << 9)) !== 0;
    };
    UChar.prototype.getCanonicalClass = function () {
        this.prepFeature();
        return this.feature[1] ? (this.feature[1] & 0xff) : 0;
    };
    UChar.prototype.getComposite = function (following) {
        this.prepFeature();
        if (!this.feature[2])
            return null;
        var cp = this.feature[2][following.codepoint];
        return cp ? fromCharCode(cp) : null;
    };
    return UChar;
}());
function fromCache(next, cp, needFeature) {
    var ret = cache[cp];
    if (!ret) {
        ret = next(cp, needFeature);
        if (ret.feature && ++cacheCounter[(cp >> 8) & 0xff] > CACHE_THRESHOLD)
            cache[cp] = ret;
    }
    return ret;
}
function fromData(next, cp, needFeature) {
    var hash = cp & 0xff00;
    var dunit = udata[hash] || {};
    var f = dunit[cp];
    return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
}
function fromCpOnly(next, cp, needFeature) {
    return needFeature ? next(cp, needFeature) : new UChar(cp, null);
}
function fromRuleBasedJamo(next, cp, needFeature) {
    if (cp < LBase
        || (LBase + LCount <= cp && cp < SBase)
        || (SBase + SCount < cp)) {
        return next(cp, needFeature);
    }
    if (LBase <= cp && cp < LBase + LCount) {
        var c = {};
        var base = (cp - LBase) * VCount;
        for (var j = 0; j < VCount; j++)
            c[VBase + j] = SBase + TCount * (j + base);
        return new UChar(cp, [null, null, c]);
    }
    var SIndex = cp - SBase;
    var TIndex = SIndex % TCount;
    var feature = [];
    if (TIndex !== 0) {
        feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
    }
    else {
        feature[0] = [
            LBase + Math.floor(SIndex / NCount),
            VBase + Math.floor((SIndex % NCount) / TCount)
        ];
        feature[2] = {};
        for (var j = 1; j < TCount; j++)
            feature[2][TBase + j] = cp + j;
    }
    return new UChar(cp, feature);
}
function fromCpFilter(next, cp, needFeature) {
    return cp < 60 || 13311 < cp && cp < 42607
        ? new UChar(cp, DEFAULT_FEATURE)
        : next(cp, needFeature);
}
var strategies = [
    fromCpFilter,
    fromCache,
    fromCpOnly,
    fromRuleBasedJamo,
    fromData
];
fromCharCode = strategies.reduceRight(function (next, strategy) {
    return function (cp, needFeature) {
        return strategy(next, cp, needFeature);
    };
}, null);
var UCharIterator = /** @class */ (function () {
    function UCharIterator(str) {
        this.str = str;
        this.cursor = 0;
    }
    UCharIterator.prototype.next = function () {
        if (this.str && this.cursor < this.str.length) {
            var cp = this.str.charCodeAt(this.cursor++);
            if (UChar.isHighSurrogate(cp) && this.cursor < this.str.length) {
                var d = this.str.charCodeAt(this.cursor);
                if (UChar.isLowSurrogate(d)) {
                    cp = (cp - 0xd800) * 0x400 + (d - 0xdc00) + 0x10000;
                    this.cursor += 1;
                }
            }
            return fromCharCode(cp);
        }
        this.str = null;
        return null;
    };
    return UCharIterator;
}());
var RecursDecompIterator = /** @class */ (function () {
    function RecursDecompIterator(it, cano) {
        this.it = it;
        this.canonical = cano;
        this.resBuf = [];
    }
    RecursDecompIterator.prototype.recursiveDecomp = function (uchar) {
        var cano = this.canonical;
        var decomp = uchar.getDecomp();
        if (decomp && !(cano && uchar.isCompatibility())) {
            var ret = [];
            for (var i = 0; i < decomp.length; i++) {
                var a = this.recursiveDecomp(fromCharCode(decomp[i]));
                ret = ret.concat(a);
            }
            return ret;
        }
        return [uchar];
    };
    RecursDecompIterator.prototype.next = function () {
        if (this.resBuf.length === 0) {
            var uchar = this.it.next();
            if (!uchar)
                return null;
            this.resBuf = this.recursiveDecomp(uchar);
        }
        return this.resBuf.shift();
    };
    return RecursDecompIterator;
}());
var DecompIterator = /** @class */ (function () {
    function DecompIterator(it) {
        this.it = it;
        this.resBuf = [];
    }
    DecompIterator.prototype.next = function () {
        if (this.resBuf.length === 0) {
            for (;;) {
                var uchar = this.it.next();
                if (!uchar)
                    break;
                var cc = uchar.getCanonicalClass();
                var inspt = this.resBuf.length;
                if (cc !== 0) {
                    while (inspt > 0) {
                        var uchar2 = this.resBuf[inspt - 1];
                        var cc2 = uchar2.getCanonicalClass();
                        if (cc2 <= cc)
                            break;
                        inspt -= 1;
                    }
                }
                this.resBuf.splice(inspt, 0, uchar);
                if (cc === 0)
                    break;
            }
        }
        return this.resBuf.shift();
    };
    return DecompIterator;
}());
var CompIterator = /** @class */ (function () {
    function CompIterator(it) {
        this.it = it;
        this.procBuf = [];
        this.resBuf = [];
        this.lastClass = null;
    }
    CompIterator.prototype.next = function () {
        while (this.resBuf.length === 0) {
            var uchar = this.it.next();
            if (!uchar) {
                this.resBuf = this.procBuf;
                this.procBuf = [];
                break;
            }
            if (this.procBuf.length === 0) {
                this.lastClass = uchar.getCanonicalClass();
                this.procBuf.push(uchar);
                continue;
            }
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if (composite && (this.lastClass < cc || this.lastClass === 0)) {
                this.procBuf[0] = composite;
                continue;
            }
            if (cc === 0) {
                this.resBuf = this.procBuf;
                this.procBuf = [];
            }
            this.lastClass = cc;
            this.procBuf.push(uchar);
        }
        return this.resBuf.shift();
    };
    return CompIterator;
}());
function createIterator(mode, str) {
    switch (mode) {
        case 'NFD': {
            var it1 = new UCharIterator(str);
            var it2 = new RecursDecompIterator(it1, true);
            return new DecompIterator(it2);
        }
        case 'NFKD': {
            var it1 = new UCharIterator(str);
            var it2 = new RecursDecompIterator(it1, false);
            return new DecompIterator(it2);
        }
        case 'NFC': {
            var it1 = new UCharIterator(str);
            var it2 = new RecursDecompIterator(it1, true);
            var it3 = new DecompIterator(it2);
            return new CompIterator(it3);
        }
        case 'NFKC': {
            var it1 = new UCharIterator(str);
            var it2 = new RecursDecompIterator(it1, false);
            var it3 = new DecompIterator(it2);
            return new CompIterator(it3);
        }
    }
    throw new Error("".concat(mode, " is invalid."));
}
function normalize(mode, str) {
    var it = createIterator(mode, str);
    var ret = '';
    var uchar;
    for (;;) {
        uchar = it.next();
        if (!uchar)
            break;
        ret += uchar.toString();
    }
    return ret;
}
;
function nfd(str) {
    return normalize('NFD', str);
}
function nfkd(str) {
    return normalize('NFKD', str);
}
function nfc(str) {
    return normalize('NFC', str);
}
function nfkc(str) {
    return normalize('NFKC', str);
}
exports.nfc = nfc;
exports.nfd = nfd;
exports.nfkc = nfkc;
exports.nfkd = nfkd;
