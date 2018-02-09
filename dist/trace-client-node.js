(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["trace"] = factory();
	else
		root["trace"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 18);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable node/no-deprecated-api */
var buffer = __webpack_require__(24);
var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps(src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer(arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length);
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number');
  }
  return Buffer(arg, encodingOrOffset, length);
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf;
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return Buffer(size);
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number');
  }
  return buffer.SlowBuffer(size);
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var safeBuffer = __webpack_require__(0);
var Limiter = __webpack_require__(25);
var zlib = __webpack_require__(26);

var bufferUtil = __webpack_require__(4);

var Buffer = safeBuffer.Buffer;

var TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
var EMPTY_BLOCK = Buffer.from([0x00]);

var kWriteInProgress = Symbol('write-in-progress');
var kPendingClose = Symbol('pending-close');
var kTotalLength = Symbol('total-length');
var kCallback = Symbol('callback');
var kBuffers = Symbol('buffers');
var kError = Symbol('error');
var kOwner = Symbol('owner');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
var zlibLimiter = void 0;

/**
 * permessage-deflate implementation.
 */

var PerMessageDeflate = function () {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} options Configuration options
   * @param {Boolean} options.serverNoContextTakeover Request/accept disabling
   *     of server context takeover
   * @param {Boolean} options.clientNoContextTakeover Advertise/acknowledge
   *     disabling of client context takeover
   * @param {(Boolean|Number)} options.serverMaxWindowBits Request/confirm the
   *     use of a custom server window size
   * @param {(Boolean|Number)} options.clientMaxWindowBits Advertise support
   *     for, or request, a custom client window size
   * @param {Number} options.level The value of zlib's `level` param
   * @param {Number} options.memLevel The value of zlib's `memLevel` param
   * @param {Number} options.threshold Size (in bytes) below which messages
   *     should not be compressed
   * @param {Number} options.concurrencyLimit The number of concurrent calls to
   *     zlib
   * @param {Boolean} isServer Create the instance in either server or client
   *     mode
   * @param {Number} maxPayload The maximum allowed message length
   */
  function PerMessageDeflate(options, isServer, maxPayload) {
    _classCallCheck(this, PerMessageDeflate);

    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold = this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      var concurrency = this._options.concurrencyLimit !== undefined ? this._options.concurrencyLimit : 10;
      zlibLimiter = new Limiter({ concurrency: concurrency });
    }
  }

  /**
   * @type {String}
   */


  _createClass(PerMessageDeflate, [{
    key: 'offer',


    /**
     * Create extension parameters offer.
     *
     * @return {Object} Extension parameters
     * @public
     */
    value: function offer() {
      var params = {};

      if (this._options.serverNoContextTakeover) {
        params.server_no_context_takeover = true;
      }
      if (this._options.clientNoContextTakeover) {
        params.client_no_context_takeover = true;
      }
      if (this._options.serverMaxWindowBits) {
        params.server_max_window_bits = this._options.serverMaxWindowBits;
      }
      if (this._options.clientMaxWindowBits) {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      } else if (this._options.clientMaxWindowBits == null) {
        params.client_max_window_bits = true;
      }

      return params;
    }

    /**
     * Accept extension offer.
     *
     * @param {Array} paramsList Extension parameters
     * @return {Object} Accepted configuration
     * @public
     */

  }, {
    key: 'accept',
    value: function accept(paramsList) {
      paramsList = this.normalizeParams(paramsList);

      var params;
      if (this._isServer) {
        params = this.acceptAsServer(paramsList);
      } else {
        params = this.acceptAsClient(paramsList);
      }

      this.params = params;
      return params;
    }

    /**
     * Releases all resources used by the extension.
     *
     * @public
     */

  }, {
    key: 'cleanup',
    value: function cleanup() {
      if (this._inflate) {
        if (this._inflate[kWriteInProgress]) {
          this._inflate[kPendingClose] = true;
        } else {
          this._inflate.close();
          this._inflate = null;
        }
      }
      if (this._deflate) {
        if (this._deflate[kWriteInProgress]) {
          this._deflate[kPendingClose] = true;
        } else {
          this._deflate.close();
          this._deflate = null;
        }
      }
    }

    /**
     * Accept extension offer from client.
     *
     * @param {Array} paramsList Extension parameters
     * @return {Object} Accepted configuration
     * @private
     */

  }, {
    key: 'acceptAsServer',
    value: function acceptAsServer(paramsList) {
      var _this = this;

      var accepted = {};
      var result = paramsList.some(function (params) {
        if (_this._options.serverNoContextTakeover === false && params.server_no_context_takeover || _this._options.serverMaxWindowBits === false && params.server_max_window_bits || typeof _this._options.serverMaxWindowBits === 'number' && typeof params.server_max_window_bits === 'number' && _this._options.serverMaxWindowBits > params.server_max_window_bits || typeof _this._options.clientMaxWindowBits === 'number' && !params.client_max_window_bits) {
          return;
        }

        if (_this._options.serverNoContextTakeover || params.server_no_context_takeover) {
          accepted.server_no_context_takeover = true;
        }
        if (_this._options.clientNoContextTakeover || _this._options.clientNoContextTakeover !== false && params.client_no_context_takeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof _this._options.serverMaxWindowBits === 'number') {
          accepted.server_max_window_bits = _this._options.serverMaxWindowBits;
        } else if (typeof params.server_max_window_bits === 'number') {
          accepted.server_max_window_bits = params.server_max_window_bits;
        }
        if (typeof _this._options.clientMaxWindowBits === 'number') {
          accepted.client_max_window_bits = _this._options.clientMaxWindowBits;
        } else if (_this._options.clientMaxWindowBits !== false && typeof params.client_max_window_bits === 'number') {
          accepted.client_max_window_bits = params.client_max_window_bits;
        }
        return true;
      });

      if (!result) throw new Error("Doesn't support the offered configuration");

      return accepted;
    }

    /**
     * Accept extension response from server.
     *
     * @param {Array} paramsList Extension parameters
     * @return {Object} Accepted configuration
     * @private
     */

  }, {
    key: 'acceptAsClient',
    value: function acceptAsClient(paramsList) {
      var params = paramsList[0];

      if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
        throw new Error('Invalid value for "client_no_context_takeover"');
      }

      if (typeof this._options.clientMaxWindowBits === 'number' && (!params.client_max_window_bits || params.client_max_window_bits > this._options.clientMaxWindowBits) || this._options.clientMaxWindowBits === false && params.client_max_window_bits) {
        throw new Error('Invalid value for "client_max_window_bits"');
      }

      return params;
    }

    /**
     * Normalize extensions parameters.
     *
     * @param {Array} paramsList Extension parameters
     * @return {Array} Normalized extensions parameters
     * @private
     */

  }, {
    key: 'normalizeParams',
    value: function normalizeParams(paramsList) {
      var _this2 = this;

      return paramsList.map(function (params) {
        Object.keys(params).forEach(function (key) {
          var value = params[key];
          if (value.length > 1) {
            throw new Error('Multiple extension parameters for ' + key);
          }

          value = value[0];

          switch (key) {
            case 'server_no_context_takeover':
            case 'client_no_context_takeover':
              if (value !== true) {
                throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
              }
              params[key] = true;
              break;
            case 'server_max_window_bits':
            case 'client_max_window_bits':
              if (typeof value === 'string') {
                value = parseInt(value, 10);
                if (Number.isNaN(value) || value < zlib.Z_MIN_WINDOWBITS || value > zlib.Z_MAX_WINDOWBITS) {
                  throw new Error('invalid extension parameter value for ' + key + ' (' + value + ')');
                }
              }
              if (!_this2._isServer && value === true) {
                throw new Error('Missing extension parameter value for ' + key);
              }
              params[key] = value;
              break;
            default:
              throw new Error('Not defined extension parameter (' + key + ')');
          }
        });
        return params;
      });
    }

    /**
     * Decompress data. Concurrency limited by async-limiter.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */

  }, {
    key: 'decompress',
    value: function decompress(data, fin, callback) {
      var _this3 = this;

      zlibLimiter.push(function (done) {
        _this3._decompress(data, fin, function (err, result) {
          done();
          callback(err, result);
        });
      });
    }

    /**
     * Compress data. Concurrency limited by async-limiter.
     *
     * @param {Buffer} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @public
     */

  }, {
    key: 'compress',
    value: function compress(data, fin, callback) {
      var _this4 = this;

      zlibLimiter.push(function (done) {
        _this4._compress(data, fin, function (err, result) {
          done();
          callback(err, result);
        });
      });
    }

    /**
     * Decompress data.
     *
     * @param {Buffer} data Compressed data
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */

  }, {
    key: '_decompress',
    value: function _decompress(data, fin, callback) {
      var _this5 = this;

      var endpoint = this._isServer ? 'client' : 'server';

      if (!this._inflate) {
        var key = endpoint + '_max_window_bits';
        var windowBits = typeof this.params[key] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];

        this._inflate = zlib.createInflateRaw({ windowBits: windowBits });
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];
        this._inflate[kOwner] = this;
        this._inflate.on('error', inflateOnError);
        this._inflate.on('data', inflateOnData);
      }

      this._inflate[kCallback] = callback;
      this._inflate[kWriteInProgress] = true;

      this._inflate.write(data);
      if (fin) this._inflate.write(TRAILER);

      this._inflate.flush(function () {
        var err = _this5._inflate[kError];

        if (err) {
          _this5._inflate.close();
          _this5._inflate = null;
          callback(err);
          return;
        }

        var data = bufferUtil.concat(_this5._inflate[kBuffers], _this5._inflate[kTotalLength]);

        if (fin && _this5.params[endpoint + '_no_context_takeover'] || _this5._inflate[kPendingClose]) {
          _this5._inflate.close();
          _this5._inflate = null;
        } else {
          _this5._inflate[kWriteInProgress] = false;
          _this5._inflate[kTotalLength] = 0;
          _this5._inflate[kBuffers] = [];
        }

        callback(null, data);
      });
    }

    /**
     * Compress data.
     *
     * @param {Buffer} data Data to compress
     * @param {Boolean} fin Specifies whether or not this is the last fragment
     * @param {Function} callback Callback
     * @private
     */

  }, {
    key: '_compress',
    value: function _compress(data, fin, callback) {
      var _this6 = this;

      if (!data || data.length === 0) {
        process.nextTick(callback, null, EMPTY_BLOCK);
        return;
      }

      var endpoint = this._isServer ? 'server' : 'client';

      if (!this._deflate) {
        var key = endpoint + '_max_window_bits';
        var windowBits = typeof this.params[key] !== 'number' ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];

        this._deflate = zlib.createDeflateRaw({
          memLevel: this._options.memLevel,
          level: this._options.level,
          flush: zlib.Z_SYNC_FLUSH,
          windowBits: windowBits
        });

        this._deflate[kTotalLength] = 0;
        this._deflate[kBuffers] = [];

        //
        // `zlib.DeflateRaw` emits an `'error'` event only when an attempt to use
        // it is made after it has already been closed. This cannot happen here,
        // so we only add a listener for the `'data'` event.
        //
        this._deflate.on('data', deflateOnData);
      }

      this._deflate[kWriteInProgress] = true;

      this._deflate.write(data);
      this._deflate.flush(zlib.Z_SYNC_FLUSH, function () {
        var data = bufferUtil.concat(_this6._deflate[kBuffers], _this6._deflate[kTotalLength]);

        if (fin) data = data.slice(0, data.length - 4);

        if (fin && _this6.params[endpoint + '_no_context_takeover'] || _this6._deflate[kPendingClose]) {
          _this6._deflate.close();
          _this6._deflate = null;
        } else {
          _this6._deflate[kWriteInProgress] = false;
          _this6._deflate[kTotalLength] = 0;
          _this6._deflate[kBuffers] = [];
        }

        callback(null, data);
      });
    }
  }], [{
    key: 'extensionName',
    get: function get() {
      return 'permessage-deflate';
    }
  }]);

  return PerMessageDeflate;
}();

module.exports = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (this[kOwner]._maxPayload < 1 || this[kTotalLength] <= this[kOwner]._maxPayload) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new Error('max payload size exceeded');
  this[kError].closeCode = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kOwner]._inflate = null;
  this[kCallback](err);
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var safeBuffer = __webpack_require__(0);

var Buffer = safeBuffer.Buffer;

exports.BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
exports.GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
exports.EMPTY_BUFFER = Buffer.alloc(0);
exports.NOOP = function () {};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var safeBuffer = __webpack_require__(0);

var Buffer = safeBuffer.Buffer;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
var concat = function concat(list, totalLength) {
  var target = Buffer.allocUnsafe(totalLength);
  var offset = 0;

  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(target, offset);
    offset += buf.length;
  }

  return target;
};

try {
  var bufferUtil = __webpack_require__(27);

  module.exports = Object.assign({ concat: concat }, bufferUtil.BufferUtil || bufferUtil);
} catch (e) /* istanbul ignore next */{
  /**
   * Masks a buffer using the given mask.
   *
   * @param {Buffer} source The buffer to mask
   * @param {Buffer} mask The mask to use
   * @param {Buffer} output The buffer where to store the result
   * @param {Number} offset The offset at which to start writing
   * @param {Number} length The number of bytes to mask.
   * @public
   */
  var mask = function mask(source, _mask, output, offset, length) {
    for (var i = 0; i < length; i++) {
      output[offset + i] = source[i] ^ _mask[i & 3];
    }
  };

  /**
   * Unmasks a buffer using the given mask.
   *
   * @param {Buffer} buffer The buffer to unmask
   * @param {Buffer} mask The mask to use
   * @public
   */
  var unmask = function unmask(buffer, mask) {
    // Required until https://github.com/nodejs/node/issues/9006 is resolved.
    var length = buffer.length;
    for (var i = 0; i < length; i++) {
      buffer[i] ^= mask[i & 3];
    }
  };

  module.exports = { concat: concat, mask: mask, unmask: unmask };
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = __webpack_require__(6);

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdapterBase = function () {
  function AdapterBase(onMessageHandler) {
    _classCallCheck(this, AdapterBase);

    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.hasError = false;
    this.clientId = null;
    this.onMessageHandler = onMessageHandler;
  }

  _createClass(AdapterBase, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var host = _config2.default.host,
            port = _config2.default.port;


        _config2.default.isConnecting = true;

        console.log('connecting:', host, port);
        _this.createSocket(host, port).then(function (socket) {
          _this.socket = socket;
          _this.isConnected = true;
          _this.isConnecting = false;

          _this.resolveConnection = resolve;
        }).catch(reject);
      });
    }
  }, {
    key: 'createSocket',
    value: function createSocket(host, port) {
      // 1. create socket implementation
      // 2. bind to handlers
      // 3. return Promise.resolve(socket)
      throw new Error('unimplemented');
    }
  }, {
    key: 'onMessage',
    value: function onMessage(data) {
      if (data.cmd === 'id.set') {
        this.clientId = data.value;
        this.resolveConnection();
      }
      this.onMessageHandler(data);
    }
  }, {
    key: 'onError',
    value: function onError(error) {
      this.hasError = true;
      console.log('error!', error);
    }
  }, {
    key: 'send',
    value: function send(cmd) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.hasError) {
        throw new Error('Cannot send trace data, socket has failed.');
      }

      var message = {
        clientId: this.clientId,
        cmd: cmd,
        data: data
      };

      try {
        var jsonStr = JSON.stringify(message);
        this.socketSend(jsonStr);
      } catch (e) {
        throw new Error('Cannot convert trace message data to JSON: ' + e.toString());
      }
    }
  }, {
    key: 'socketSend',
    value: function socketSend(jsonStr) {
      // send json string using socket implementation
      throw new Error('unimplemented');
    }
  }, {
    key: 'close',
    value: function close() {
      this.send('close');
    }
  }]);

  return AdapterBase;
}();

exports.default = AdapterBase;
;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var defaultConfig = {
  inproc: false,
  host: 'ws://127.0.0.1',
  port: 8080
};

var config = defaultConfig;

if ((typeof __TRACE_CONFIG__ === 'undefined' ? 'undefined' : _typeof(__TRACE_CONFIG__)) === 'object') {
  config = __TRACE_CONFIG__;
}

config.isConnected = false;

exports.default = config;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = __webpack_require__(8);
var crypto = __webpack_require__(3);
var Ultron = __webpack_require__(9);
var https = __webpack_require__(23);
var http = __webpack_require__(10);
var url = __webpack_require__(11);

var PerMessageDeflate = __webpack_require__(1);
var EventTarget = __webpack_require__(31);
var Extensions = __webpack_require__(14);
var constants = __webpack_require__(2);
var Receiver = __webpack_require__(15);
var Sender = __webpack_require__(17);

var protocolVersions = [8, 13];
var closeTimeout = 30 * 1000; // Allow 30 seconds to terminate the connection cleanly.

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */

var WebSocket = function (_EventEmitter) {
  _inherits(WebSocket, _EventEmitter);

  /**
   * Create a new `WebSocket`.
   *
   * @param {String} address The URL to which to connect
   * @param {(String|String[])} protocols The subprotocols
   * @param {Object} options Connection options
   */
  function WebSocket(address, protocols, options) {
    _classCallCheck(this, WebSocket);

    var _this = _possibleConstructorReturn(this, (WebSocket.__proto__ || Object.getPrototypeOf(WebSocket)).call(this));

    if (!protocols) {
      protocols = [];
    } else if (typeof protocols === 'string') {
      protocols = [protocols];
    } else if (!Array.isArray(protocols)) {
      options = protocols;
      protocols = [];
    }

    _this.readyState = WebSocket.CONNECTING;
    _this.bytesReceived = 0;
    _this.extensions = {};
    _this.protocol = '';

    _this._binaryType = constants.BINARY_TYPES[0];
    _this._finalize = _this.finalize.bind(_this);
    _this._closeFrameReceived = false;
    _this._closeFrameSent = false;
    _this._closeMessage = '';
    _this._closeTimer = null;
    _this._finalized = false;
    _this._closeCode = 1006;
    _this._receiver = null;
    _this._sender = null;
    _this._socket = null;
    _this._ultron = null;

    if (Array.isArray(address)) {
      initAsServerClient.call(_this, address[0], address[1], options);
    } else {
      initAsClient.call(_this, address, protocols, options);
    }
    return _this;
  }

  _createClass(WebSocket, [{
    key: 'setSocket',


    /**
     * Set up the socket and the internal resources.
     *
     * @param {net.Socket} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @private
     */
    value: function setSocket(socket, head) {
      var _this2 = this;

      socket.setTimeout(0);
      socket.setNoDelay();

      this._receiver = new Receiver(this.extensions, this._maxPayload, this.binaryType);
      this._sender = new Sender(socket, this.extensions);
      this._ultron = new Ultron(socket);
      this._socket = socket;

      this._ultron.on('close', this._finalize);
      this._ultron.on('error', this._finalize);
      this._ultron.on('end', this._finalize);

      if (head.length > 0) socket.unshift(head);

      this._ultron.on('data', function (data) {
        _this2.bytesReceived += data.length;
        _this2._receiver.add(data);
      });

      this._receiver.onmessage = function (data) {
        return _this2.emit('message', data);
      };
      this._receiver.onping = function (data) {
        _this2.pong(data, !_this2._isServer, true);
        _this2.emit('ping', data);
      };
      this._receiver.onpong = function (data) {
        return _this2.emit('pong', data);
      };
      this._receiver.onclose = function (code, reason) {
        _this2._closeFrameReceived = true;
        _this2._closeMessage = reason;
        _this2._closeCode = code;
        if (!_this2._finalized) _this2.close(code, reason);
      };
      this._receiver.onerror = function (error, code) {
        _this2._closeMessage = '';
        _this2._closeCode = code;

        //
        // Ensure that the error is emitted even if `WebSocket#finalize()` has
        // already been called.
        //
        _this2.readyState = WebSocket.CLOSING;
        _this2.emit('error', error);
        _this2.finalize(true);
      };

      this.readyState = WebSocket.OPEN;
      this.emit('open');
    }

    /**
     * Clean up and release internal resources.
     *
     * @param {(Boolean|Error)} error Indicates whether or not an error occurred
     * @private
     */

  }, {
    key: 'finalize',
    value: function finalize(error) {
      var _this3 = this;

      if (this._finalized) return;

      this.readyState = WebSocket.CLOSING;
      this._finalized = true;

      if ((typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object') this.emit('error', error);
      if (!this._socket) return this.emitClose();

      clearTimeout(this._closeTimer);
      this._closeTimer = null;

      this._ultron.destroy();
      this._ultron = null;

      this._socket.on('error', constants.NOOP);

      if (!error) this._socket.end();else this._socket.destroy();

      this._socket = null;
      this._sender = null;

      this._receiver.cleanup(function () {
        return _this3.emitClose();
      });
      this._receiver = null;
    }

    /**
     * Emit the `close` event.
     *
     * @private
     */

  }, {
    key: 'emitClose',
    value: function emitClose() {
      this.readyState = WebSocket.CLOSED;

      this.emit('close', this._closeCode, this._closeMessage);

      if (this.extensions[PerMessageDeflate.extensionName]) {
        this.extensions[PerMessageDeflate.extensionName].cleanup();
      }

      this.extensions = null;

      this.removeAllListeners();
    }

    /**
     * Pause the socket stream.
     *
     * @public
     */

  }, {
    key: 'pause',
    value: function pause() {
      if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

      this._socket.pause();
    }

    /**
     * Resume the socket stream
     *
     * @public
     */

  }, {
    key: 'resume',
    value: function resume() {
      if (this.readyState !== WebSocket.OPEN) throw new Error('not opened');

      this._socket.resume();
    }

    /**
     * Start a closing handshake.
     *
     *            +----------+     +-----------+   +----------+
     *     + - - -|ws.close()|---->|close frame|-->|ws.close()|- - - -
     *            +----------+     +-----------+   +----------+       |
     *     |      +----------+     +-----------+         |
     *            |ws.close()|<----|close frame|<--------+            |
     *            +----------+     +-----------+         |
     *  CLOSING         |              +---+             |         CLOSING
     *                  |          +---|fin|<------------+
     *     |            |          |   +---+                          |
     *                  |          |   +---+      +-------------+
     *     |            +----------+-->|fin|----->|ws.finalize()| - - +
     *                             |   +---+      +-------------+
     *     |     +-------------+   |
     *      - - -|ws.finalize()|<--+
     *           +-------------+
     *
     * @param {Number} code Status code explaining why the connection is closing
     * @param {String} data A string explaining why the connection is closing
     * @public
     */

  }, {
    key: 'close',
    value: function close(code, data) {
      var _this4 = this;

      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        this._req.abort();
        this.finalize(new Error('closed before the connection is established'));
        return;
      }

      if (this.readyState === WebSocket.CLOSING) {
        if (this._closeFrameSent && this._closeFrameReceived) this._socket.end();
        return;
      }

      this.readyState = WebSocket.CLOSING;
      this._sender.close(code, data, !this._isServer, function (err) {
        //
        // This error is handled by the `'error'` listener on the socket. We only
        // want to know if the close frame has been sent here.
        //
        if (err) return;

        _this4._closeFrameSent = true;

        if (!_this4._finalized) {
          if (_this4._closeFrameReceived) _this4._socket.end();

          //
          // Ensure that the connection is cleaned up even when the closing
          // handshake fails.
          //
          _this4._closeTimer = setTimeout(_this4._finalize, closeTimeout, true);
        }
      });
    }

    /**
     * Send a ping message.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Indicates whether or not to mask `data`
     * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
     * @public
     */

  }, {
    key: 'ping',
    value: function ping(data, mask, failSilently) {
      if (this.readyState !== WebSocket.OPEN) {
        if (failSilently) return;
        throw new Error('not opened');
      }

      if (typeof data === 'number') data = data.toString();
      if (mask === undefined) mask = !this._isServer;
      this._sender.ping(data || constants.EMPTY_BUFFER, mask);
    }

    /**
     * Send a pong message.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Indicates whether or not to mask `data`
     * @param {Boolean} failSilently Indicates whether or not to throw if `readyState` isn't `OPEN`
     * @public
     */

  }, {
    key: 'pong',
    value: function pong(data, mask, failSilently) {
      if (this.readyState !== WebSocket.OPEN) {
        if (failSilently) return;
        throw new Error('not opened');
      }

      if (typeof data === 'number') data = data.toString();
      if (mask === undefined) mask = !this._isServer;
      this._sender.pong(data || constants.EMPTY_BUFFER, mask);
    }

    /**
     * Send a data message.
     *
     * @param {*} data The message to send
     * @param {Object} options Options object
     * @param {Boolean} options.compress Specifies whether or not to compress `data`
     * @param {Boolean} options.binary Specifies whether `data` is binary or text
     * @param {Boolean} options.fin Specifies whether the fragment is the last one
     * @param {Boolean} options.mask Specifies whether or not to mask `data`
     * @param {Function} cb Callback which is executed when data is written out
     * @public
     */

  }, {
    key: 'send',
    value: function send(data, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      if (this.readyState !== WebSocket.OPEN) {
        if (cb) cb(new Error('not opened'));else throw new Error('not opened');
        return;
      }

      if (typeof data === 'number') data = data.toString();

      var opts = Object.assign({
        binary: typeof data !== 'string',
        mask: !this._isServer,
        compress: true,
        fin: true
      }, options);

      if (!this.extensions[PerMessageDeflate.extensionName]) {
        opts.compress = false;
      }

      this._sender.send(data || constants.EMPTY_BUFFER, opts, cb);
    }

    /**
     * Forcibly close the connection.
     *
     * @public
     */

  }, {
    key: 'terminate',
    value: function terminate() {
      if (this.readyState === WebSocket.CLOSED) return;
      if (this.readyState === WebSocket.CONNECTING) {
        this._req.abort();
        this.finalize(new Error('closed before the connection is established'));
        return;
      }

      this.finalize(true);
    }
  }, {
    key: 'CONNECTING',
    get: function get() {
      return WebSocket.CONNECTING;
    }
  }, {
    key: 'CLOSING',
    get: function get() {
      return WebSocket.CLOSING;
    }
  }, {
    key: 'CLOSED',
    get: function get() {
      return WebSocket.CLOSED;
    }
  }, {
    key: 'OPEN',
    get: function get() {
      return WebSocket.OPEN;
    }

    /**
     * @type {Number}
     */

  }, {
    key: 'bufferedAmount',
    get: function get() {
      var amount = 0;

      if (this._socket) {
        amount = this._socket.bufferSize + this._sender._bufferedBytes;
      }
      return amount;
    }

    /**
     * This deviates from the WHATWG interface since ws doesn't support the required
     * default "blob" type (instead we define a custom "nodebuffer" type).
     *
     * @type {String}
     */

  }, {
    key: 'binaryType',
    get: function get() {
      return this._binaryType;
    },
    set: function set(type) {
      if (constants.BINARY_TYPES.indexOf(type) < 0) return;

      this._binaryType = type;

      //
      // Allow to change `binaryType` on the fly.
      //
      if (this._receiver) this._receiver._binaryType = type;
    }
  }]);

  return WebSocket;
}(EventEmitter);

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach(function (method) {
  Object.defineProperty(WebSocket.prototype, 'on' + method, {
    /**
     * Return the listener of the event.
     *
     * @return {(Function|undefined)} The event listener or `undefined`
     * @public
     */
    get: function get() {
      var listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        if (listeners[i]._listener) return listeners[i]._listener;
      }
    },

    /**
     * Add a listener for the event.
     *
     * @param {Function} listener The listener to add
     * @public
     */
    set: function set(listener) {
      var listeners = this.listeners(method);
      for (var i = 0; i < listeners.length; i++) {
        //
        // Remove only the listeners added via `addEventListener`.
        //
        if (listeners[i]._listener) this.removeListener(method, listeners[i]);
      }
      this.addEventListener(method, listener);
    }
  });
});

WebSocket.prototype.addEventListener = EventTarget.addEventListener;
WebSocket.prototype.removeEventListener = EventTarget.removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket server client.
 *
 * @param {http.IncomingMessage} req The request object
 * @param {net.Socket} socket The network socket between the server and client
 * @param {Buffer} head The first packet of the upgraded stream
 * @param {Object} options WebSocket attributes
 * @param {Number} options.protocolVersion The WebSocket protocol version
 * @param {Object} options.extensions The negotiated extensions
 * @param {Number} options.maxPayload The maximum allowed message size
 * @param {String} options.protocol The chosen subprotocol
 * @private
 */
function initAsServerClient(socket, head, options) {
  this.protocolVersion = options.protocolVersion;
  this._maxPayload = options.maxPayload;
  this.extensions = options.extensions;
  this.protocol = options.protocol;

  this._isServer = true;

  this.setSocket(socket, head);
}

/**
 * Initialize a WebSocket client.
 *
 * @param {String} address The URL to which to connect
 * @param {String[]} protocols The list of subprotocols
 * @param {Object} options Connection options
 * @param {String} options.protocol Value of the `Sec-WebSocket-Protocol` header
 * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
 * @param {Number} options.handshakeTimeout Timeout in milliseconds for the handshake request
 * @param {String} options.localAddress Local interface to bind for network connections
 * @param {Number} options.protocolVersion Value of the `Sec-WebSocket-Version` header
 * @param {Object} options.headers An object containing request headers
 * @param {String} options.origin Value of the `Origin` or `Sec-WebSocket-Origin` header
 * @param {http.Agent} options.agent Use the specified Agent
 * @param {String} options.host Value of the `Host` header
 * @param {Number} options.family IP address family to use during hostname lookup (4 or 6).
 * @param {Function} options.checkServerIdentity A function to validate the server hostname
 * @param {Boolean} options.rejectUnauthorized Verify or not the server certificate
 * @param {String} options.passphrase The passphrase for the private key or pfx
 * @param {String} options.ciphers The ciphers to use or exclude
 * @param {String} options.ecdhCurve The curves for ECDH key agreement to use or exclude
 * @param {(String|String[]|Buffer|Buffer[])} options.cert The certificate key
 * @param {(String|String[]|Buffer|Buffer[])} options.key The private key
 * @param {(String|Buffer)} options.pfx The private key, certificate, and CA certs
 * @param {(String|String[]|Buffer|Buffer[])} options.ca Trusted certificates
 * @private
 */
function initAsClient(address, protocols, options) {
  var _this5 = this;

  options = Object.assign({
    protocolVersion: protocolVersions[1],
    protocol: protocols.join(','),
    perMessageDeflate: true,
    handshakeTimeout: null,
    localAddress: null,
    headers: null,
    family: null,
    origin: null,
    agent: null,
    host: null,

    //
    // SSL options.
    //
    checkServerIdentity: null,
    rejectUnauthorized: null,
    passphrase: null,
    ciphers: null,
    ecdhCurve: null,
    cert: null,
    key: null,
    pfx: null,
    ca: null
  }, options);

  if (protocolVersions.indexOf(options.protocolVersion) === -1) {
    throw new Error('unsupported protocol version: ' + options.protocolVersion + ' ' + ('(supported versions: ' + protocolVersions.join(', ') + ')'));
  }

  this.protocolVersion = options.protocolVersion;
  this._isServer = false;
  this.url = address;

  var serverUrl = url.parse(address);
  var isUnixSocket = serverUrl.protocol === 'ws+unix:';

  if (!serverUrl.host && (!isUnixSocket || !serverUrl.path)) {
    throw new Error('invalid url');
  }

  var isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
  var key = crypto.randomBytes(16).toString('base64');
  var httpObj = isSecure ? https : http;
  var perMessageDeflate;

  var requestOptions = {
    port: serverUrl.port || (isSecure ? 443 : 80),
    host: serverUrl.hostname,
    path: '/',
    headers: {
      'Sec-WebSocket-Version': options.protocolVersion,
      'Sec-WebSocket-Key': key,
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };

  if (options.headers) Object.assign(requestOptions.headers, options.headers);
  if (options.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(options.perMessageDeflate !== true ? options.perMessageDeflate : {}, false);
    requestOptions.headers['Sec-WebSocket-Extensions'] = Extensions.format(_defineProperty({}, PerMessageDeflate.extensionName, perMessageDeflate.offer()));
  }
  if (options.protocol) {
    requestOptions.headers['Sec-WebSocket-Protocol'] = options.protocol;
  }
  if (options.origin) {
    if (options.protocolVersion < 13) {
      requestOptions.headers['Sec-WebSocket-Origin'] = options.origin;
    } else {
      requestOptions.headers.Origin = options.origin;
    }
  }
  if (options.host) requestOptions.headers.Host = options.host;
  if (serverUrl.auth) requestOptions.auth = serverUrl.auth;

  if (options.localAddress) requestOptions.localAddress = options.localAddress;
  if (options.family) requestOptions.family = options.family;

  if (isUnixSocket) {
    var parts = serverUrl.path.split(':');

    requestOptions.socketPath = parts[0];
    requestOptions.path = parts[1];
  } else if (serverUrl.path) {
    //
    // Make sure that path starts with `/`.
    //
    if (serverUrl.path.charAt(0) !== '/') {
      requestOptions.path = '/' + serverUrl.path;
    } else {
      requestOptions.path = serverUrl.path;
    }
  }

  var agent = options.agent;

  //
  // A custom agent is required for these options.
  //
  if (options.rejectUnauthorized != null || options.checkServerIdentity || options.passphrase || options.ciphers || options.ecdhCurve || options.cert || options.key || options.pfx || options.ca) {
    if (options.passphrase) requestOptions.passphrase = options.passphrase;
    if (options.ciphers) requestOptions.ciphers = options.ciphers;
    if (options.ecdhCurve) requestOptions.ecdhCurve = options.ecdhCurve;
    if (options.cert) requestOptions.cert = options.cert;
    if (options.key) requestOptions.key = options.key;
    if (options.pfx) requestOptions.pfx = options.pfx;
    if (options.ca) requestOptions.ca = options.ca;
    if (options.checkServerIdentity) {
      requestOptions.checkServerIdentity = options.checkServerIdentity;
    }
    if (options.rejectUnauthorized != null) {
      requestOptions.rejectUnauthorized = options.rejectUnauthorized;
    }

    if (!agent) agent = new httpObj.Agent(requestOptions);
  }

  if (agent) requestOptions.agent = agent;

  this._req = httpObj.get(requestOptions);

  if (options.handshakeTimeout) {
    this._req.setTimeout(options.handshakeTimeout, function () {
      _this5._req.abort();
      _this5.finalize(new Error('opening handshake has timed out'));
    });
  }

  this._req.on('error', function (error) {
    if (_this5._req.aborted) return;

    _this5._req = null;
    _this5.finalize(error);
  });

  this._req.on('response', function (res) {
    if (!_this5.emit('unexpected-response', _this5._req, res)) {
      _this5._req.abort();
      _this5.finalize(new Error('unexpected server response (' + res.statusCode + ')'));
    }
  });

  this._req.on('upgrade', function (res, socket, head) {
    _this5.emit('headers', res.headers, res);

    //
    // The user may have closed the connection from a listener of the `headers`
    // event.
    //
    if (_this5.readyState !== WebSocket.CONNECTING) return;

    _this5._req = null;

    var digest = crypto.createHash('sha1').update(key + constants.GUID, 'binary').digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      socket.destroy();
      return _this5.finalize(new Error('invalid server key'));
    }

    var serverProt = res.headers['sec-websocket-protocol'];
    var protList = (options.protocol || '').split(/, */);
    var protError;

    if (!options.protocol && serverProt) {
      protError = 'server sent a subprotocol even though none requested';
    } else if (options.protocol && !serverProt) {
      protError = 'server sent no subprotocol even though requested';
    } else if (serverProt && protList.indexOf(serverProt) === -1) {
      protError = 'server responded with an invalid protocol';
    }

    if (protError) {
      socket.destroy();
      return _this5.finalize(new Error(protError));
    }

    if (serverProt) _this5.protocol = serverProt;

    if (perMessageDeflate) {
      try {
        var serverExtensions = Extensions.parse(res.headers['sec-websocket-extensions']);

        if (serverExtensions[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(serverExtensions[PerMessageDeflate.extensionName]);
          _this5.extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        socket.destroy();
        _this5.finalize(new Error('invalid Sec-WebSocket-Extensions header'));
        return;
      }
    }

    _this5.setSocket(socket, head);
  });
}

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty;

/**
 * An auto incrementing id which we can use to create "unique" Ultron instances
 * so we can track the event emitters that are added through the Ultron
 * interface.
 *
 * @type {Number}
 * @private
 */
var id = 0;

/**
 * Ultron is high-intelligence robot. It gathers intelligence so it can start improving
 * upon his rudimentary design. It will learn from your EventEmitting patterns
 * and exterminate them.
 *
 * @constructor
 * @param {EventEmitter} ee EventEmitter instance we need to wrap.
 * @api public
 */
function Ultron(ee) {
  if (!(this instanceof Ultron)) return new Ultron(ee);

  this.id = id++;
  this.ee = ee;
}

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.on = function on(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.on(event, fn, context);

  return this;
};
/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.once = function once(event, fn, context) {
  fn.__ultron = this.id;
  this.ee.once(event, fn, context);

  return this;
};

/**
 * Remove the listeners we assigned for the given event.
 *
 * @returns {Ultron}
 * @api public
 */
Ultron.prototype.remove = function remove() {
  var args = arguments,
      ee = this.ee,
      event;

  //
  // When no event names are provided we assume that we need to clear all the
  // events that were assigned through us.
  //
  if (args.length === 1 && 'string' === typeof args[0]) {
    args = args[0].split(/[, ]+/);
  } else if (!args.length) {
    if (ee.eventNames) {
      args = ee.eventNames();
    } else if (ee._events) {
      args = [];

      for (event in ee._events) {
        if (has.call(ee._events, event)) args.push(event);
      }

      if (Object.getOwnPropertySymbols) {
        args = args.concat(Object.getOwnPropertySymbols(ee._events));
      }
    }
  }

  for (var i = 0; i < args.length; i++) {
    var listeners = ee.listeners(args[i]);

    for (var j = 0; j < listeners.length; j++) {
      event = listeners[j];

      //
      // Once listeners have a `listener` property that stores the real listener
      // in the EventEmitter that ships with Node.js.
      //
      if (event.listener) {
        if (event.listener.__ultron !== this.id) continue;
      } else if (event.__ultron !== this.id) {
        continue;
      }

      ee.removeListener(args[i], event);
    }
  }

  return this;
};

/**
 * Destroy the Ultron instance, remove all listeners and release all references.
 *
 * @returns {Boolean}
 * @api public
 */
Ultron.prototype.destroy = function destroy() {
  if (!this.ee) return false;

  this.remove();
  this.ee = null;

  return true;
};

//
// Expose the module.
//
module.exports = Ultron;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__filename) {

/**
 * Module dependencies.
 */

var fs = __webpack_require__(28),
    path = __webpack_require__(29),
    join = path.join,
    dirname = path.dirname,
    exists = fs.accessSync && function (path) {
  try {
    fs.accessSync(path);
  } catch (e) {
    return false;
  }return true;
} || fs.existsSync || path.existsSync,
    defaults = {
  arrow: process.env.NODE_BINDINGS_ARROW || ' → ',
  compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled',
  platform: process.platform,
  arch: process.arch,
  version: process.versions.node,
  bindings: 'bindings.node',
  try: [
  // node-gyp's linked version in the "build" dir
  ['module_root', 'build', 'bindings']
  // node-waf and gyp_addon (a.k.a node-gyp)
  , ['module_root', 'build', 'Debug', 'bindings'], ['module_root', 'build', 'Release', 'bindings']
  // Debug files, for development (legacy behavior, remove for node v0.9)
  , ['module_root', 'out', 'Debug', 'bindings'], ['module_root', 'Debug', 'bindings']
  // Release files, but manually compiled (legacy behavior, remove for node v0.9)
  , ['module_root', 'out', 'Release', 'bindings'], ['module_root', 'Release', 'bindings']
  // Legacy from node-waf, node <= 0.4.x
  , ['module_root', 'build', 'default', 'bindings']
  // Production "Release" buildtype binary (meh...)
  , ['module_root', 'compiled', 'version', 'platform', 'arch', 'bindings']]

  /**
   * The main `bindings()` function loads the compiled bindings for a given module.
   * It uses V8's Error API to determine the parent filename that this function is
   * being invoked from, which is then used to find the root directory.
   */

};function bindings(opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts };
  } else if (!opts) {
    opts = {};
  }

  // maps `defaults` onto `opts` object
  Object.keys(defaults).map(function (i) {
    if (!(i in opts)) opts[i] = defaults[i];
  });

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName());
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node';
  }

  var tries = [],
      i = 0,
      l = opts.try.length,
      n,
      b,
      err;

  for (; i < l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p;
    }));
    tries.push(n);
    try {
      b = opts.path ? /*require.resolve*/(!(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) : !(function webpackMissingModule() { var e = new Error("Cannot find module \".\""); e.code = 'MODULE_NOT_FOUND'; throw e; }());
      if (!opts.path) {
        b.path = n;
      }
      return b;
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e;
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n' + tries.map(function (a) {
    return opts.arrow + a;
  }).join('\n'));
  err.tries = tries;
  throw err;
}
module.exports = exports = bindings;

/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName(calling_file) {
  var origPST = Error.prepareStackTrace,
      origSTL = Error.stackTraceLimit,
      dummy = {},
      fileName;

  Error.stackTraceLimit = 10;

  Error.prepareStackTrace = function (e, st) {
    for (var i = 0, l = st.length; i < l; i++) {
      fileName = st[i].getFileName();
      if (fileName !== __filename) {
        if (calling_file) {
          if (fileName !== calling_file) {
            return;
          }
        } else {
          return;
        }
      }
    }
  };

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy);
  dummy.stack;

  // cleanup
  Error.prepareStackTrace = origPST;
  Error.stackTraceLimit = origSTL;

  return fileName;
};

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot(file) {
  var dir = dirname(file),
      prev;
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd();
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir;
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file + '". Do you have a `package.json` file? ');
    }
    // Try the parent dir next
    prev = dir;
    dir = join(dir, '..');
  }
};
/* WEBPACK VAR INJECTION */}.call(exports, "/index.js"))

/***/ }),
/* 13 */
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 13;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//

var tokenChars = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (Object.prototype.hasOwnProperty.call(dest, name)) dest[name].push(elem);else dest[name] = [elem];
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse(header) {
  var offers = {};

  if (header === undefined || header === '') return offers;

  var params = {};
  var mustUnescape = false;
  var isEscaping = false;
  var inQuotes = false;
  var extensionName;
  var paramName;
  var start = -1;
  var end = -1;

  for (var i = 0; i < header.length; i++) {
    var code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 /* ' ' */ || code === 0x09 /* '\t' */) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
          if (start === -1) throw new Error('unexpected character at index ' + i);

          if (end === -1) end = i;
          var name = header.slice(start, end);
          if (code === 0x2c) {
            push(offers, name, params);
            params = {};
          } else {
            extensionName = name;
          }

          start = end = -1;
        } else {
        throw new Error('unexpected character at index ' + i);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error('unexpected character at index ' + i);

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new Error('unexpected character at index ' + i);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new Error('unexpected character at index ' + i);
        }
        if (start === -1) start = i;else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
            isEscaping = true;
          } else {
          throw new Error('unexpected character at index ' + i);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) throw new Error('unexpected character at index ' + i);

        if (end === -1) end = i;
        var value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = {};
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new Error('unexpected character at index ' + i);
      }
    }
  }

  if (start === -1 || inQuotes) throw new Error('unexpected end of input');

  if (end === -1) end = i;
  var token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, {});
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Serializes a parsed `Sec-WebSocket-Extensions` header to a string.
 *
 * @param {Object} value The object to format
 * @return {String} A string representing the given value
 * @public
 */
function format(value) {
  return Object.keys(value).map(function (token) {
    var paramsList = value[token];
    if (!Array.isArray(paramsList)) paramsList = [paramsList];
    return paramsList.map(function (params) {
      return [token].concat(Object.keys(params).map(function (k) {
        var p = params[k];
        if (!Array.isArray(p)) p = [p];
        return p.map(function (v) {
          return v === true ? k : k + '=' + v;
        }).join('; ');
      })).join('; ');
    }).join(', ');
  }).join(', ');
}

module.exports = { format: format, parse: parse };

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var safeBuffer = __webpack_require__(0);

var PerMessageDeflate = __webpack_require__(1);
var isValidUTF8 = __webpack_require__(32);
var bufferUtil = __webpack_require__(4);
var ErrorCodes = __webpack_require__(16);
var constants = __webpack_require__(2);

var Buffer = safeBuffer.Buffer;

var GET_INFO = 0;
var GET_PAYLOAD_LENGTH_16 = 1;
var GET_PAYLOAD_LENGTH_64 = 2;
var GET_MASK = 3;
var GET_DATA = 4;
var INFLATING = 5;

/**
 * HyBi Receiver implementation.
 */

var Receiver = function () {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} extensions An object containing the negotiated extensions
   * @param {Number} maxPayload The maximum allowed message length
   * @param {String} binaryType The type for binary data
   */
  function Receiver(extensions, maxPayload, binaryType) {
    _classCallCheck(this, Receiver);

    this._binaryType = binaryType || constants.BINARY_TYPES[0];
    this._extensions = extensions || {};
    this._maxPayload = maxPayload | 0;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._mask = null;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._cleanupCallback = null;
    this._hadError = false;
    this._dead = false;
    this._loop = false;

    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this.onping = null;
    this.onpong = null;

    this._state = GET_INFO;
  }

  /**
   * Consumes bytes from the available buffered data.
   *
   * @param {Number} bytes The number of bytes to consume
   * @return {Buffer} Consumed bytes
   * @private
   */


  _createClass(Receiver, [{
    key: 'readBuffer',
    value: function readBuffer(bytes) {
      var offset = 0;
      var dst;
      var l;

      this._bufferedBytes -= bytes;

      if (bytes === this._buffers[0].length) return this._buffers.shift();

      if (bytes < this._buffers[0].length) {
        dst = this._buffers[0].slice(0, bytes);
        this._buffers[0] = this._buffers[0].slice(bytes);
        return dst;
      }

      dst = Buffer.allocUnsafe(bytes);

      while (bytes > 0) {
        l = this._buffers[0].length;

        if (bytes >= l) {
          this._buffers[0].copy(dst, offset);
          offset += l;
          this._buffers.shift();
        } else {
          this._buffers[0].copy(dst, offset, 0, bytes);
          this._buffers[0] = this._buffers[0].slice(bytes);
        }

        bytes -= l;
      }

      return dst;
    }

    /**
     * Checks if the number of buffered bytes is bigger or equal than `n` and
     * calls `cleanup` if necessary.
     *
     * @param {Number} n The number of bytes to check against
     * @return {Boolean} `true` if `bufferedBytes >= n`, else `false`
     * @private
     */

  }, {
    key: 'hasBufferedBytes',
    value: function hasBufferedBytes(n) {
      if (this._bufferedBytes >= n) return true;

      this._loop = false;
      if (this._dead) this.cleanup(this._cleanupCallback);
      return false;
    }

    /**
     * Adds new data to the parser.
     *
     * @public
     */

  }, {
    key: 'add',
    value: function add(data) {
      if (this._dead) return;

      this._bufferedBytes += data.length;
      this._buffers.push(data);
      this.startLoop();
    }

    /**
     * Starts the parsing loop.
     *
     * @private
     */

  }, {
    key: 'startLoop',
    value: function startLoop() {
      this._loop = true;

      while (this._loop) {
        switch (this._state) {
          case GET_INFO:
            this.getInfo();
            break;
          case GET_PAYLOAD_LENGTH_16:
            this.getPayloadLength16();
            break;
          case GET_PAYLOAD_LENGTH_64:
            this.getPayloadLength64();
            break;
          case GET_MASK:
            this.getMask();
            break;
          case GET_DATA:
            this.getData();
            break;
          default:
            // `INFLATING`
            this._loop = false;
        }
      }
    }

    /**
     * Reads the first two bytes of a frame.
     *
     * @private
     */

  }, {
    key: 'getInfo',
    value: function getInfo() {
      if (!this.hasBufferedBytes(2)) return;

      var buf = this.readBuffer(2);

      if ((buf[0] & 0x30) !== 0x00) {
        this.error(new Error('RSV2 and RSV3 must be clear'), 1002);
        return;
      }

      var compressed = (buf[0] & 0x40) === 0x40;

      if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
        this.error(new Error('RSV1 must be clear'), 1002);
        return;
      }

      this._fin = (buf[0] & 0x80) === 0x80;
      this._opcode = buf[0] & 0x0f;
      this._payloadLength = buf[1] & 0x7f;

      if (this._opcode === 0x00) {
        if (compressed) {
          this.error(new Error('RSV1 must be clear'), 1002);
          return;
        }

        if (!this._fragmented) {
          this.error(new Error('invalid opcode: ' + this._opcode), 1002);
          return;
        } else {
          this._opcode = this._fragmented;
        }
      } else if (this._opcode === 0x01 || this._opcode === 0x02) {
        if (this._fragmented) {
          this.error(new Error('invalid opcode: ' + this._opcode), 1002);
          return;
        }

        this._compressed = compressed;
      } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
        if (!this._fin) {
          this.error(new Error('FIN must be set'), 1002);
          return;
        }

        if (compressed) {
          this.error(new Error('RSV1 must be clear'), 1002);
          return;
        }

        if (this._payloadLength > 0x7d) {
          this.error(new Error('invalid payload length'), 1002);
          return;
        }
      } else {
        this.error(new Error('invalid opcode: ' + this._opcode), 1002);
        return;
      }

      if (!this._fin && !this._fragmented) this._fragmented = this._opcode;

      this._masked = (buf[1] & 0x80) === 0x80;

      if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;else this.haveLength();
    }

    /**
     * Gets extended payload length (7+16).
     *
     * @private
     */

  }, {
    key: 'getPayloadLength16',
    value: function getPayloadLength16() {
      if (!this.hasBufferedBytes(2)) return;

      this._payloadLength = this.readBuffer(2).readUInt16BE(0, true);
      this.haveLength();
    }

    /**
     * Gets extended payload length (7+64).
     *
     * @private
     */

  }, {
    key: 'getPayloadLength64',
    value: function getPayloadLength64() {
      if (!this.hasBufferedBytes(8)) return;

      var buf = this.readBuffer(8);
      var num = buf.readUInt32BE(0, true);

      //
      // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
      // if payload length is greater than this number.
      //
      if (num > Math.pow(2, 53 - 32) - 1) {
        this.error(new Error('max payload size exceeded'), 1009);
        return;
      }

      this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4, true);
      this.haveLength();
    }

    /**
     * Payload length has been read.
     *
     * @private
     */

  }, {
    key: 'haveLength',
    value: function haveLength() {
      if (this._opcode < 0x08 && this.maxPayloadExceeded(this._payloadLength)) {
        return;
      }

      if (this._masked) this._state = GET_MASK;else this._state = GET_DATA;
    }

    /**
     * Reads mask bytes.
     *
     * @private
     */

  }, {
    key: 'getMask',
    value: function getMask() {
      if (!this.hasBufferedBytes(4)) return;

      this._mask = this.readBuffer(4);
      this._state = GET_DATA;
    }

    /**
     * Reads data bytes.
     *
     * @private
     */

  }, {
    key: 'getData',
    value: function getData() {
      var data = constants.EMPTY_BUFFER;

      if (this._payloadLength) {
        if (!this.hasBufferedBytes(this._payloadLength)) return;

        data = this.readBuffer(this._payloadLength);
        if (this._masked) bufferUtil.unmask(data, this._mask);
      }

      if (this._opcode > 0x07) {
        this.controlMessage(data);
      } else if (this._compressed) {
        this._state = INFLATING;
        this.decompress(data);
      } else if (this.pushFragment(data)) {
        this.dataMessage();
      }
    }

    /**
     * Decompresses data.
     *
     * @param {Buffer} data Compressed data
     * @private
     */

  }, {
    key: 'decompress',
    value: function decompress(data) {
      var _this = this;

      var perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

      perMessageDeflate.decompress(data, this._fin, function (err, buf) {
        if (err) {
          _this.error(err, err.closeCode === 1009 ? 1009 : 1007);
          return;
        }

        if (_this.pushFragment(buf)) _this.dataMessage();
        _this.startLoop();
      });
    }

    /**
     * Handles a data message.
     *
     * @private
     */

  }, {
    key: 'dataMessage',
    value: function dataMessage() {
      if (this._fin) {
        var messageLength = this._messageLength;
        var fragments = this._fragments;

        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];

        if (this._opcode === 2) {
          var data;

          if (this._binaryType === 'nodebuffer') {
            data = toBuffer(fragments, messageLength);
          } else if (this._binaryType === 'arraybuffer') {
            data = toArrayBuffer(toBuffer(fragments, messageLength));
          } else {
            data = fragments;
          }

          this.onmessage(data);
        } else {
          var buf = toBuffer(fragments, messageLength);

          if (!isValidUTF8(buf)) {
            this.error(new Error('invalid utf8 sequence'), 1007);
            return;
          }

          this.onmessage(buf.toString());
        }
      }

      this._state = GET_INFO;
    }

    /**
     * Handles a control message.
     *
     * @param {Buffer} data Data to handle
     * @private
     */

  }, {
    key: 'controlMessage',
    value: function controlMessage(data) {
      if (this._opcode === 0x08) {
        if (data.length === 0) {
          this.onclose(1000, '');
          this._loop = false;
          this.cleanup(this._cleanupCallback);
        } else if (data.length === 1) {
          this.error(new Error('invalid payload length'), 1002);
        } else {
          var code = data.readUInt16BE(0, true);

          if (!ErrorCodes.isValidErrorCode(code)) {
            this.error(new Error('invalid status code: ' + code), 1002);
            return;
          }

          var buf = data.slice(2);

          if (!isValidUTF8(buf)) {
            this.error(new Error('invalid utf8 sequence'), 1007);
            return;
          }

          this.onclose(code, buf.toString());
          this._loop = false;
          this.cleanup(this._cleanupCallback);
        }

        return;
      }

      if (this._opcode === 0x09) this.onping(data);else this.onpong(data);

      this._state = GET_INFO;
    }

    /**
     * Handles an error.
     *
     * @param {Error} err The error
     * @param {Number} code Close code
     * @private
     */

  }, {
    key: 'error',
    value: function error(err, code) {
      this.onerror(err, code);
      this._hadError = true;
      this._loop = false;
      this.cleanup(this._cleanupCallback);
    }

    /**
     * Checks payload size, disconnects socket when it exceeds `maxPayload`.
     *
     * @param {Number} length Payload length
     * @private
     */

  }, {
    key: 'maxPayloadExceeded',
    value: function maxPayloadExceeded(length) {
      if (length === 0 || this._maxPayload < 1) return false;

      var fullLength = this._totalPayloadLength + length;

      if (fullLength <= this._maxPayload) {
        this._totalPayloadLength = fullLength;
        return false;
      }

      this.error(new Error('max payload size exceeded'), 1009);
      return true;
    }

    /**
     * Appends a fragment in the fragments array after checking that the sum of
     * fragment lengths does not exceed `maxPayload`.
     *
     * @param {Buffer} fragment The fragment to add
     * @return {Boolean} `true` if `maxPayload` is not exceeded, else `false`
     * @private
     */

  }, {
    key: 'pushFragment',
    value: function pushFragment(fragment) {
      if (fragment.length === 0) return true;

      var totalLength = this._messageLength + fragment.length;

      if (this._maxPayload < 1 || totalLength <= this._maxPayload) {
        this._messageLength = totalLength;
        this._fragments.push(fragment);
        return true;
      }

      this.error(new Error('max payload size exceeded'), 1009);
      return false;
    }

    /**
     * Releases resources used by the receiver.
     *
     * @param {Function} cb Callback
     * @public
     */

  }, {
    key: 'cleanup',
    value: function cleanup(cb) {
      this._dead = true;

      if (!this._hadError && (this._loop || this._state === INFLATING)) {
        this._cleanupCallback = cb;
      } else {
        this._extensions = null;
        this._fragments = null;
        this._buffers = null;
        this._mask = null;

        this._cleanupCallback = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        this.onping = null;
        this.onpong = null;

        if (cb) cb();
      }
    }
  }]);

  return Receiver;
}();

module.exports = Receiver;

/**
 * Makes a buffer from a list of fragments.
 *
 * @param {Buffer[]} fragments The list of fragments composing the message
 * @param {Number} messageLength The length of the message
 * @return {Buffer}
 * @private
 */
function toBuffer(fragments, messageLength) {
  if (fragments.length === 1) return fragments[0];
  if (fragments.length > 1) return bufferUtil.concat(fragments, messageLength);
  return constants.EMPTY_BUFFER;
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 */
function toArrayBuffer(buf) {
  if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



module.exports = {
  isValidErrorCode: function isValidErrorCode(code) {
    return code >= 1000 && code <= 1013 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3000 && code <= 4999;
  },
  1000: 'normal',
  1001: 'going away',
  1002: 'protocol error',
  1003: 'unsupported data',
  1004: 'reserved',
  1005: 'reserved for extensions',
  1006: 'reserved for extensions',
  1007: 'inconsistent or invalid data',
  1008: 'policy violation',
  1009: 'message too big',
  1010: 'extension handshake missing',
  1011: 'an unexpected condition prevented the request from being fulfilled',
  1012: 'service restart',
  1013: 'try again later'
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var safeBuffer = __webpack_require__(0);
var crypto = __webpack_require__(3);

var PerMessageDeflate = __webpack_require__(1);
var bufferUtil = __webpack_require__(4);
var ErrorCodes = __webpack_require__(16);
var constants = __webpack_require__(2);

var Buffer = safeBuffer.Buffer;

/**
 * HyBi Sender implementation.
 */

var Sender = function () {
  /**
   * Creates a Sender instance.
   *
   * @param {net.Socket} socket The connection socket
   * @param {Object} extensions An object containing the negotiated extensions
   */
  function Sender(socket, extensions) {
    _classCallCheck(this, Sender);

    this._extensions = extensions || {};
    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} options.readOnly Specifies whether `data` can be modified
   * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
   * @param {Boolean} options.mask Specifies whether or not to mask `data`
   * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */


  _createClass(Sender, [{
    key: 'close',


    /**
     * Sends a close message to the other peer.
     *
     * @param {(Number|undefined)} code The status code component of the body
     * @param {String} data The message component of the body
     * @param {Boolean} mask Specifies whether or not to mask the message
     * @param {Function} cb Callback
     * @public
     */
    value: function close(code, data, mask, cb) {
      var buf;

      if (code === undefined) {
        code = 1000;
      } else if (typeof code !== 'number' || !ErrorCodes.isValidErrorCode(code)) {
        throw new Error('first argument must be a valid error code number');
      }

      if (data === undefined || data === '') {
        if (code === 1000) {
          buf = constants.EMPTY_BUFFER;
        } else {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0, true);
        }
      } else {
        buf = Buffer.allocUnsafe(2 + Buffer.byteLength(data));
        buf.writeUInt16BE(code, 0, true);
        buf.write(data, 2);
      }

      if (this._deflating) {
        this.enqueue([this.doClose, buf, mask, cb]);
      } else {
        this.doClose(buf, mask, cb);
      }
    }

    /**
     * Frames and sends a close message.
     *
     * @param {Buffer} data The message to send
     * @param {Boolean} mask Specifies whether or not to mask `data`
     * @param {Function} cb Callback
     * @private
     */

  }, {
    key: 'doClose',
    value: function doClose(data, mask, cb) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x08,
        mask: mask,
        readOnly: false
      }), cb);
    }

    /**
     * Sends a ping message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Specifies whether or not to mask `data`
     * @public
     */

  }, {
    key: 'ping',
    value: function ping(data, mask) {
      var readOnly = true;

      if (!Buffer.isBuffer(data)) {
        if (data instanceof ArrayBuffer) {
          data = Buffer.from(data);
        } else if (ArrayBuffer.isView(data)) {
          data = viewToBuffer(data);
        } else {
          data = Buffer.from(data);
          readOnly = false;
        }
      }

      if (this._deflating) {
        this.enqueue([this.doPing, data, mask, readOnly]);
      } else {
        this.doPing(data, mask, readOnly);
      }
    }

    /**
     * Frames and sends a ping message.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Specifies whether or not to mask `data`
     * @param {Boolean} readOnly Specifies whether `data` can be modified
     * @private
     */

  }, {
    key: 'doPing',
    value: function doPing(data, mask, readOnly) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x09,
        mask: mask,
        readOnly: readOnly
      }));
    }

    /**
     * Sends a pong message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Specifies whether or not to mask `data`
     * @public
     */

  }, {
    key: 'pong',
    value: function pong(data, mask) {
      var readOnly = true;

      if (!Buffer.isBuffer(data)) {
        if (data instanceof ArrayBuffer) {
          data = Buffer.from(data);
        } else if (ArrayBuffer.isView(data)) {
          data = viewToBuffer(data);
        } else {
          data = Buffer.from(data);
          readOnly = false;
        }
      }

      if (this._deflating) {
        this.enqueue([this.doPong, data, mask, readOnly]);
      } else {
        this.doPong(data, mask, readOnly);
      }
    }

    /**
     * Frames and sends a pong message.
     *
     * @param {*} data The message to send
     * @param {Boolean} mask Specifies whether or not to mask `data`
     * @param {Boolean} readOnly Specifies whether `data` can be modified
     * @private
     */

  }, {
    key: 'doPong',
    value: function doPong(data, mask, readOnly) {
      this.sendFrame(Sender.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x0a,
        mask: mask,
        readOnly: readOnly
      }));
    }

    /**
     * Sends a data message to the other peer.
     *
     * @param {*} data The message to send
     * @param {Object} options Options object
     * @param {Boolean} options.compress Specifies whether or not to compress `data`
     * @param {Boolean} options.binary Specifies whether `data` is binary or text
     * @param {Boolean} options.fin Specifies whether the fragment is the last one
     * @param {Boolean} options.mask Specifies whether or not to mask `data`
     * @param {Function} cb Callback
     * @public
     */

  }, {
    key: 'send',
    value: function send(data, options, cb) {
      var opcode = options.binary ? 2 : 1;
      var rsv1 = options.compress;
      var readOnly = true;

      if (!Buffer.isBuffer(data)) {
        if (data instanceof ArrayBuffer) {
          data = Buffer.from(data);
        } else if (ArrayBuffer.isView(data)) {
          data = viewToBuffer(data);
        } else {
          data = Buffer.from(data);
          readOnly = false;
        }
      }

      var perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

      if (this._firstFragment) {
        this._firstFragment = false;
        if (rsv1 && perMessageDeflate) {
          rsv1 = data.length >= perMessageDeflate._threshold;
        }
        this._compress = rsv1;
      } else {
        rsv1 = false;
        opcode = 0;
      }

      if (options.fin) this._firstFragment = true;

      if (perMessageDeflate) {
        var opts = {
          fin: options.fin,
          rsv1: rsv1,
          opcode: opcode,
          mask: options.mask,
          readOnly: readOnly
        };

        if (this._deflating) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      } else {
        this.sendFrame(Sender.frame(data, {
          fin: options.fin,
          rsv1: false,
          opcode: opcode,
          mask: options.mask,
          readOnly: readOnly
        }), cb);
      }
    }

    /**
     * Dispatches a data message.
     *
     * @param {Buffer} data The message to send
     * @param {Boolean} compress Specifies whether or not to compress `data`
     * @param {Object} options Options object
     * @param {Number} options.opcode The opcode
     * @param {Boolean} options.readOnly Specifies whether `data` can be modified
     * @param {Boolean} options.fin Specifies whether or not to set the FIN bit
     * @param {Boolean} options.mask Specifies whether or not to mask `data`
     * @param {Boolean} options.rsv1 Specifies whether or not to set the RSV1 bit
     * @param {Function} cb Callback
     * @private
     */

  }, {
    key: 'dispatch',
    value: function dispatch(data, compress, options, cb) {
      var _this = this;

      if (!compress) {
        this.sendFrame(Sender.frame(data, options), cb);
        return;
      }

      var perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

      this._deflating = true;
      perMessageDeflate.compress(data, options.fin, function (_, buf) {
        options.readOnly = false;
        _this.sendFrame(Sender.frame(buf, options), cb);
        _this._deflating = false;
        _this.dequeue();
      });
    }

    /**
     * Executes queued send operations.
     *
     * @private
     */

  }, {
    key: 'dequeue',
    value: function dequeue() {
      while (!this._deflating && this._queue.length) {
        var params = this._queue.shift();

        this._bufferedBytes -= params[1].length;
        params[0].apply(this, params.slice(1));
      }
    }

    /**
     * Enqueues a send operation.
     *
     * @param {Array} params Send operation parameters.
     * @private
     */

  }, {
    key: 'enqueue',
    value: function enqueue(params) {
      this._bufferedBytes += params[1].length;
      this._queue.push(params);
    }

    /**
     * Sends a frame.
     *
     * @param {Buffer[]} list The frame to send
     * @param {Function} cb Callback
     * @private
     */

  }, {
    key: 'sendFrame',
    value: function sendFrame(list, cb) {
      if (list.length === 2) {
        this._socket.write(list[0]);
        this._socket.write(list[1], cb);
      } else {
        this._socket.write(list[0], cb);
      }
    }
  }], [{
    key: 'frame',
    value: function frame(data, options) {
      var merge = data.length < 1024 || options.mask && options.readOnly;
      var offset = options.mask ? 6 : 2;
      var payloadLength = data.length;

      if (data.length >= 65536) {
        offset += 8;
        payloadLength = 127;
      } else if (data.length > 125) {
        offset += 2;
        payloadLength = 126;
      }

      var target = Buffer.allocUnsafe(merge ? data.length + offset : offset);

      target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
      if (options.rsv1) target[0] |= 0x40;

      if (payloadLength === 126) {
        target.writeUInt16BE(data.length, 2, true);
      } else if (payloadLength === 127) {
        target.writeUInt32BE(0, 2, true);
        target.writeUInt32BE(data.length, 6, true);
      }

      if (!options.mask) {
        target[1] = payloadLength;
        if (merge) {
          data.copy(target, offset);
          return [target];
        }

        return [target, data];
      }

      var mask = crypto.randomBytes(4);

      target[1] = payloadLength | 0x80;
      target[offset - 4] = mask[0];
      target[offset - 3] = mask[1];
      target[offset - 2] = mask[2];
      target[offset - 1] = mask[3];

      if (merge) {
        bufferUtil.mask(data, mask, target, offset, data.length);
        return [target];
      }

      bufferUtil.mask(data, mask, data, 0, data.length);
      return [target, data];
    }
  }]);

  return Sender;
}();

module.exports = Sender;

/**
 * Converts an `ArrayBuffer` view into a buffer.
 *
 * @param {(DataView|TypedArray)} view The view to convert
 * @return {Buffer} Converted view
 * @private
 */
function viewToBuffer(view) {
  var buf = Buffer.from(view.buffer);

  if (view.byteLength !== view.buffer.byteLength) {
    return buf.slice(view.byteOffset, view.byteOffset + view.byteLength);
  }

  return buf;
}

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trace;

var _traceClient = __webpack_require__(19);

var _traceClient2 = _interopRequireDefault(_traceClient);

var _adapterSocketNode = __webpack_require__(20);

var _adapterSocketNode2 = _interopRequireDefault(_adapterSocketNode);

var _adapterFactory = __webpack_require__(36);

var _adapterFactory2 = _interopRequireDefault(_adapterFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = new _traceClient2.default((0, _adapterFactory2.default)(_adapterSocketNode2.default));

function trace() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  client.send(args);
}

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TraceClient = function () {
  function TraceClient(SocketAdapter) {
    _classCallCheck(this, TraceClient);

    this.onMessage = function (data) {
      console.log('onMessage:', data);
    };

    console.log(SocketAdapter.name);
    this.socketAdapter = new SocketAdapter(this.onMessage);
    this.buffer = [];
  }

  _createClass(TraceClient, [{
    key: 'send',
    value: function send() {
      var _this = this;

      var socketAdapter = this.socketAdapter,
          buffer = this.buffer;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      buffer.push([].concat(args));

      if (socketAdapter.isConnected) {
        this.flush();
      } else {
        if (!socketAdapter.isConnecting) {
          socketAdapter.connect().then(function () {
            _this.flush();
          });
        }
      }
    }
  }, {
    key: 'flush',
    value: function flush() {
      var socketAdapter = this.socketAdapter,
          buffer = this.buffer;

      while (buffer.length) {
        var row = buffer.shift();
        console.log('flush:', row);
        socketAdapter.send('trace', row);
      }
    }
  }]);

  return TraceClient;
}();

exports.default = TraceClient;
;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _adapterSocketBrowser = __webpack_require__(21);

var _adapterSocketBrowser2 = _interopRequireDefault(_adapterSocketBrowser);

var _ws = __webpack_require__(22);

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NodeSocketAdapter = function (_BrowserAdapterBase) {
  _inherits(NodeSocketAdapter, _BrowserAdapterBase);

  function NodeSocketAdapter(onMessageHandler) {
    _classCallCheck(this, NodeSocketAdapter);

    //do something when app is closing
    var _this = _possibleConstructorReturn(this, (NodeSocketAdapter.__proto__ || Object.getPrototypeOf(NodeSocketAdapter)).call(this, onMessageHandler));

    process.on('exit', _this.onExit.bind(_this, { cleanup: true }));

    //catches ctrl+c event
    process.on('SIGINT', _this.onExit.bind(_this, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', _this.onExit.bind(_this, { exit: true }));
    process.on('SIGUSR2', _this.onExit.bind(_this, { exit: true }));

    //catches uncaught exceptions
    process.on('uncaughtException', _this.onExit.bind(_this, { exit: true }));
    process.on('unhandledRejection', _this.onExit.bind(_this, { exit: true }));
    return _this;
  }

  _createClass(NodeSocketAdapter, [{
    key: 'onExit',
    value: function onExit(options, err) {
      this.close();

      if (options.exit) {
        process.exit();
      }
    }
  }, {
    key: 'newSocket',
    value: function newSocket(host, port) {
      return new _ws2.default(host + ':' + port);
    }
  }]);

  return NodeSocketAdapter;
}(_adapterSocketBrowser2.default);

exports.default = NodeSocketAdapter;
;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _adapterBase = __webpack_require__(5);

var _adapterBase2 = _interopRequireDefault(_adapterBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BrowserSocketAdapter = function (_AdapterBase) {
  _inherits(BrowserSocketAdapter, _AdapterBase);

  function BrowserSocketAdapter() {
    _classCallCheck(this, BrowserSocketAdapter);

    return _possibleConstructorReturn(this, (BrowserSocketAdapter.__proto__ || Object.getPrototypeOf(BrowserSocketAdapter)).apply(this, arguments));
  }

  _createClass(BrowserSocketAdapter, [{
    key: 'createSocket',
    value: function createSocket(host, port) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        try {
          var socket = _this2.newSocket(host, port);

          socket.onopen = function (event) {
            resolve(socket);
          };

          socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            _this2.onMessage(data);
          };

          socket.onerror = function (error) {
            _this2.onError(error);
          };
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: 'newSocket',
    value: function newSocket(host, port) {
      return new WebSocket(host + ':' + port);
    }
  }, {
    key: 'socketSend',
    value: function socketSend(jsonStr) {
      this.socket.send(jsonStr);
    }
  }]);

  return BrowserSocketAdapter;
}(_adapterBase2.default);

exports.default = BrowserSocketAdapter;
;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var WebSocket = __webpack_require__(7);

WebSocket.Server = __webpack_require__(35);
WebSocket.Receiver = __webpack_require__(15);
WebSocket.Sender = __webpack_require__(17);

module.exports = WebSocket;

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("https");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("buffer");

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }

  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.pending = 0;
  this.jobs = [];
  this.cbs = [];
  this._done = done.bind(this);
}

var arrayAddMethods = ['push', 'unshift', 'splice'];

arrayAddMethods.forEach(function (method) {
  Queue.prototype[method] = function () {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    this._run();
    return methodResult;
  };
});

Object.defineProperty(Queue.prototype, 'length', {
  get: function get() {
    return this.pending + this.jobs.length;
  }
});

Queue.prototype._run = function () {
  if (this.pending === this.concurrency) {
    return;
  }
  if (this.jobs.length) {
    var job = this.jobs.shift();
    this.pending++;
    job(this._done);
    this._run();
  }

  if (this.pending === 0) {
    while (this.cbs.length !== 0) {
      var cb = this.cbs.pop();
      process.nextTick(cb);
    }
  }
};

Queue.prototype.onDone = function (cb) {
  if (typeof cb === 'function') {
    this.cbs.push(cb);
    this._run();
  }
};

function done() {
  this.pending--;
  this._run();
}

module.exports = Queue;

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = require("zlib");

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


try {
  module.exports = __webpack_require__(12)('bufferutil');
} catch (e) {
  module.exports = __webpack_require__(30);
}

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * bufferutil: WebSocket buffer utils
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */

var mask = function mask(source, _mask, output, offset, length) {
  for (var i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ _mask[i & 3];
  }
};

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
var unmask = function unmask(buffer, mask) {
  // Required until https://github.com/nodejs/node/issues/9006 is resolved.
  var length = buffer.length;
  for (var i = 0; i < length; i++) {
    buffer[i] ^= mask[i & 3];
  }
};

module.exports = { mask: mask, unmask: unmask };

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Class representing an event.
 *
 * @private
 */

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event =
/**
 * Create a new `Event`.
 *
 * @param {String} type The name of the event
 * @param {Object} target A reference to the target to which the event was dispatched
 */
function Event(type, target) {
  _classCallCheck(this, Event);

  this.target = target;
  this.type = type;
};

/**
 * Class representing a message event.
 *
 * @extends Event
 * @private
 */


var MessageEvent = function (_Event) {
  _inherits(MessageEvent, _Event);

  /**
   * Create a new `MessageEvent`.
   *
   * @param {(String|Buffer|ArrayBuffer|Buffer[])} data The received data
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  function MessageEvent(data, target) {
    _classCallCheck(this, MessageEvent);

    var _this = _possibleConstructorReturn(this, (MessageEvent.__proto__ || Object.getPrototypeOf(MessageEvent)).call(this, 'message', target));

    _this.data = data;
    return _this;
  }

  return MessageEvent;
}(Event);

/**
 * Class representing a close event.
 *
 * @extends Event
 * @private
 */


var CloseEvent = function (_Event2) {
  _inherits(CloseEvent, _Event2);

  /**
   * Create a new `CloseEvent`.
   *
   * @param {Number} code The status code explaining why the connection is being closed
   * @param {String} reason A human-readable string explaining why the connection is closing
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  function CloseEvent(code, reason, target) {
    _classCallCheck(this, CloseEvent);

    var _this2 = _possibleConstructorReturn(this, (CloseEvent.__proto__ || Object.getPrototypeOf(CloseEvent)).call(this, 'close', target));

    _this2.wasClean = target._closeFrameReceived && target._closeFrameSent;
    _this2.reason = reason;
    _this2.code = code;
    return _this2;
  }

  return CloseEvent;
}(Event);

/**
 * Class representing an open event.
 *
 * @extends Event
 * @private
 */


var OpenEvent = function (_Event3) {
  _inherits(OpenEvent, _Event3);

  /**
   * Create a new `OpenEvent`.
   *
   * @param {WebSocket} target A reference to the target to which the event was dispatched
   */
  function OpenEvent(target) {
    _classCallCheck(this, OpenEvent);

    return _possibleConstructorReturn(this, (OpenEvent.__proto__ || Object.getPrototypeOf(OpenEvent)).call(this, 'open', target));
  }

  return OpenEvent;
}(Event);

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */


var EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} method A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @public
   */
  addEventListener: function addEventListener(method, listener) {
    if (typeof listener !== 'function') return;

    function onMessage(data) {
      listener.call(this, new MessageEvent(data, this));
    }

    function onClose(code, message) {
      listener.call(this, new CloseEvent(code, message, this));
    }

    function onError(event) {
      event.type = 'error';
      event.target = this;
      listener.call(this, event);
    }

    function onOpen() {
      listener.call(this, new OpenEvent(this));
    }

    if (method === 'message') {
      onMessage._listener = listener;
      this.on(method, onMessage);
    } else if (method === 'close') {
      onClose._listener = listener;
      this.on(method, onClose);
    } else if (method === 'error') {
      onError._listener = listener;
      this.on(method, onError);
    } else if (method === 'open') {
      onOpen._listener = listener;
      this.on(method, onOpen);
    } else {
      this.on(method, listener);
    }
  },


  /**
   * Remove an event listener.
   *
   * @param {String} method A string representing the event type to remove
   * @param {Function} listener The listener to remove
   * @public
   */
  removeEventListener: function removeEventListener(method, listener) {
    var listeners = this.listeners(method);

    for (var i = 0; i < listeners.length; i++) {
      if (listeners[i] === listener || listeners[i]._listener === listener) {
        this.removeListener(method, listeners[i]);
      }
    }
  }
};

module.exports = EventTarget;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

try {
  var isValidUTF8 = __webpack_require__(33);

  module.exports = (typeof isValidUTF8 === 'undefined' ? 'undefined' : _typeof(isValidUTF8)) === 'object' ? isValidUTF8.Validation.isValidUTF8 // utf-8-validate@<3.0.0
  : isValidUTF8;
} catch (e) /* istanbul ignore next */{
  module.exports = function () {
    return true;
  };
}

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


try {
  module.exports = __webpack_require__(12)('validation');
} catch (e) {
  module.exports = __webpack_require__(34);
}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * UTF-8 validate: UTF-8 validation for WebSockets.
 * Copyright(c) 2015 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */

var isValidUTF8 = function isValidUTF8(buf) {
  var len = buf.length;
  var i = 0;

  while (i < len) {
    if (buf[i] < 0x80) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (i + 1 === len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i] & 0xfe) === 0xc0 // overlong
      ) {
          return false;
        } else {
        i += 2;
      }
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (i + 2 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80 || // overlong
      buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0 // surrogate (U+D800 - U+DFFF)
      ) {
          return false;
        } else {
        i += 3;
      }
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (i + 3 >= len || (buf[i + 1] & 0xc0) !== 0x80 || (buf[i + 2] & 0xc0) !== 0x80 || (buf[i + 3] & 0xc0) !== 0x80 || buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80 || // overlong
      buf[i] === 0xf4 && buf[i + 1] > 0x8f || buf[i] > 0xf4 // > U+10FFFF
      ) {
          return false;
        } else {
        i += 4;
      }
    } else {
      return false;
    }
  }

  return true;
};

module.exports = isValidUTF8;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */



var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var safeBuffer = __webpack_require__(0);
var EventEmitter = __webpack_require__(8);
var crypto = __webpack_require__(3);
var Ultron = __webpack_require__(9);
var http = __webpack_require__(10);
var url = __webpack_require__(11);

var PerMessageDeflate = __webpack_require__(1);
var Extensions = __webpack_require__(14);
var constants = __webpack_require__(2);
var WebSocket = __webpack_require__(7);

var Buffer = safeBuffer.Buffer;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */

var WebSocketServer = function (_EventEmitter) {
  _inherits(WebSocketServer, _EventEmitter);

  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {String} options.host The hostname where to bind the server
   * @param {Number} options.port The port where to bind the server
   * @param {http.Server} options.server A pre-created HTTP/S server to use
   * @param {Function} options.verifyClient An hook to reject connections
   * @param {Function} options.handleProtocols An hook to handle protocols
   * @param {String} options.path Accept only connections matching this path
   * @param {Boolean} options.noServer Enable no server mode
   * @param {Boolean} options.clientTracking Specifies whether or not to track clients
   * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
   * @param {Number} options.maxPayload The maximum allowed message size
   * @param {Function} callback A listener for the `listening` event
   */
  function WebSocketServer(options, callback) {
    _classCallCheck(this, WebSocketServer);

    var _this = _possibleConstructorReturn(this, (WebSocketServer.__proto__ || Object.getPrototypeOf(WebSocketServer)).call(this));

    options = Object.assign({
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null
    }, options);

    if (options.port == null && !options.server && !options.noServer) {
      throw new TypeError('missing or invalid options');
    }

    if (options.port != null) {
      _this._server = http.createServer(function (req, res) {
        var body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      _this._server.listen(options.port, options.host, options.backlog, callback);
    } else if (options.server) {
      _this._server = options.server;
    }

    if (_this._server) {
      _this._ultron = new Ultron(_this._server);
      _this._ultron.on('listening', function () {
        return _this.emit('listening');
      });
      _this._ultron.on('error', function (err) {
        return _this.emit('error', err);
      });
      _this._ultron.on('upgrade', function (req, socket, head) {
        _this.handleUpgrade(req, socket, head, function (client) {
          _this.emit('connection', client, req);
        });
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) _this.clients = new Set();
    _this.options = options;
    return _this;
  }

  /**
   * Close the server.
   *
   * @param {Function} cb Callback
   * @public
   */


  _createClass(WebSocketServer, [{
    key: 'close',
    value: function close(cb) {
      //
      // Terminate all associated clients.
      //
      if (this.clients) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.clients[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var client = _step.value;
            client.terminate();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      var server = this._server;

      if (server) {
        this._ultron.destroy();
        this._ultron = this._server = null;

        //
        // Close the http server if it was internally created.
        //
        if (this.options.port != null) return server.close(cb);
      }

      if (cb) cb();
    }

    /**
     * See if a given request should be handled by this server instance.
     *
     * @param {http.IncomingMessage} req Request object to inspect
     * @return {Boolean} `true` if the request is valid, else `false`
     * @public
     */

  }, {
    key: 'shouldHandle',
    value: function shouldHandle(req) {
      if (this.options.path && url.parse(req.url).pathname !== this.options.path) {
        return false;
      }

      return true;
    }

    /**
     * Handle a HTTP Upgrade request.
     *
     * @param {http.IncomingMessage} req The request object
     * @param {net.Socket} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Function} cb Callback
     * @public
     */

  }, {
    key: 'handleUpgrade',
    value: function handleUpgrade(req, socket, head, cb) {
      var _this2 = this;

      socket.on('error', socketError);

      var version = +req.headers['sec-websocket-version'];
      var extensions = {};

      if (req.method !== 'GET' || req.headers.upgrade.toLowerCase() !== 'websocket' || !req.headers['sec-websocket-key'] || version !== 8 && version !== 13 || !this.shouldHandle(req)) {
        return abortConnection(socket, 400);
      }

      if (this.options.perMessageDeflate) {
        var perMessageDeflate = new PerMessageDeflate(this.options.perMessageDeflate, true, this.options.maxPayload);

        try {
          var offers = Extensions.parse(req.headers['sec-websocket-extensions']);

          if (offers[PerMessageDeflate.extensionName]) {
            perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
            extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
          }
        } catch (err) {
          return abortConnection(socket, 400);
        }
      }

      var protocol = (req.headers['sec-websocket-protocol'] || '').split(/, */);

      //
      // Optionally call external protocol selection handler.
      //
      if (this.options.handleProtocols) {
        protocol = this.options.handleProtocols(protocol, req);
        if (protocol === false) return abortConnection(socket, 401);
      } else {
        protocol = protocol[0];
      }

      //
      // Optionally call external client verification handler.
      //
      if (this.options.verifyClient) {
        var info = {
          origin: req.headers['' + (version === 8 ? 'sec-websocket-origin' : 'origin')],
          secure: !!(req.connection.authorized || req.connection.encrypted),
          req: req
        };

        if (this.options.verifyClient.length === 2) {
          this.options.verifyClient(info, function (verified, code, message) {
            if (!verified) return abortConnection(socket, code || 401, message);

            _this2.completeUpgrade(protocol, extensions, version, req, socket, head, cb);
          });
          return;
        }

        if (!this.options.verifyClient(info)) return abortConnection(socket, 401);
      }

      this.completeUpgrade(protocol, extensions, version, req, socket, head, cb);
    }

    /**
     * Upgrade the connection to WebSocket.
     *
     * @param {String} protocol The chosen subprotocol
     * @param {Object} extensions The accepted extensions
     * @param {Number} version The WebSocket protocol version
     * @param {http.IncomingMessage} req The request object
     * @param {net.Socket} socket The network socket between the server and client
     * @param {Buffer} head The first packet of the upgraded stream
     * @param {Function} cb Callback
     * @private
     */

  }, {
    key: 'completeUpgrade',
    value: function completeUpgrade(protocol, extensions, version, req, socket, head, cb) {
      var _this3 = this;

      //
      // Destroy the socket if the client has already sent a FIN packet.
      //
      if (!socket.readable || !socket.writable) return socket.destroy();

      var key = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + constants.GUID, 'binary').digest('base64');

      var headers = ['HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + key];

      if (protocol) headers.push('Sec-WebSocket-Protocol: ' + protocol);
      if (extensions[PerMessageDeflate.extensionName]) {
        var params = extensions[PerMessageDeflate.extensionName].params;
        var value = Extensions.format(_defineProperty({}, PerMessageDeflate.extensionName, [params]));
        headers.push('Sec-WebSocket-Extensions: ' + value);
      }

      //
      // Allow external modification/inspection of handshake headers.
      //
      this.emit('headers', headers, req);

      socket.write(headers.concat('\r\n').join('\r\n'));

      var client = new WebSocket([socket, head], null, {
        maxPayload: this.options.maxPayload,
        protocolVersion: version,
        extensions: extensions,
        protocol: protocol
      });

      if (this.clients) {
        this.clients.add(client);
        client.on('close', function () {
          return _this3.clients.delete(client);
        });
      }

      socket.removeListener('error', socketError);
      cb(client);
    }
  }]);

  return WebSocketServer;
}(EventEmitter);

module.exports = WebSocketServer;

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @private
 */
function abortConnection(socket, code, message) {
  if (socket.writable) {
    message = message || http.STATUS_CODES[code];
    socket.write('HTTP/1.1 ' + code + ' ' + http.STATUS_CODES[code] + '\r\n' + 'Connection: close\r\n' + 'Content-type: text/html\r\n' + ('Content-Length: ' + Buffer.byteLength(message) + '\r\n') + '\r\n' + message);
  }

  socket.removeListener('error', socketError);
  socket.destroy();
}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAdapter;

var _config = __webpack_require__(6);

var _config2 = _interopRequireDefault(_config);

var _adapterInproc = __webpack_require__(37);

var _adapterInproc2 = _interopRequireDefault(_adapterInproc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAdapter(Adapter) {
  return _config2.default.inproc ? _adapterInproc2.default : Adapter;
};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _adapterBase = __webpack_require__(5);

var _adapterBase2 = _interopRequireDefault(_adapterBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InProcAdapter = function (_AdapterBase) {
  _inherits(InProcAdapter, _AdapterBase);

  function InProcAdapter() {
    _classCallCheck(this, InProcAdapter);

    return _possibleConstructorReturn(this, (InProcAdapter.__proto__ || Object.getPrototypeOf(InProcAdapter)).apply(this, arguments));
  }

  _createClass(InProcAdapter, [{
    key: 'createSocket',
    value: function createSocket(host, port) {
      return Promise.resolve();
    }
  }]);

  return InProcAdapter;
}(_adapterBase2.default);

exports.default = InProcAdapter;
;

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=trace-client-node.js.map