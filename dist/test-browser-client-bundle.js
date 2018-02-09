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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = __webpack_require__(1);

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
        this.clientId = _config2.default.clientId = data.value;
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var defaultConfig = {
  inproc: false,
  host: 'ws://127.0.0.1',
  port: 8080,
  clientId: null
};

var config = defaultConfig;

if ((typeof __TRACE__ === 'undefined' ? 'undefined' : _typeof(__TRACE__)) === 'object') {
  config = __TRACE__;
} else {
  global.__TRACE__ = config;
}

config.isConnected = false;

exports.default = config;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6)))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _browser = __webpack_require__(3);

var _browser2 = _interopRequireDefault(_browser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _browser2.default)('hello', 'world!');

document.getElementById('button').onclick = function () {
  return (0, _browser2.default)('hello!', Date.now());
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trace;

var _traceClient = __webpack_require__(4);

var _traceClient2 = _interopRequireDefault(_traceClient);

var _adapterSocketBrowser = __webpack_require__(5);

var _adapterSocketBrowser2 = _interopRequireDefault(_adapterSocketBrowser);

var _adapterFactory = __webpack_require__(7);

var _adapterFactory2 = _interopRequireDefault(_adapterFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = new _traceClient2.default((0, _adapterFactory2.default)(_adapterSocketBrowser2.default));

function trace() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  client.send(args);
}

/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _adapterBase = __webpack_require__(0);

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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getAdapter;

var _config = __webpack_require__(1);

var _config2 = _interopRequireDefault(_config);

var _adapterInproc = __webpack_require__(8);

var _adapterInproc2 = _interopRequireDefault(_adapterInproc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getAdapter(Adapter) {
  return _config2.default.inproc ? _adapterInproc2.default : Adapter;
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _adapterBase = __webpack_require__(0);

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
//# sourceMappingURL=test-browser-client-bundle.js.map