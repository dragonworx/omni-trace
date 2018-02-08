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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _traceClient = __webpack_require__(1);

var _traceClient2 = _interopRequireDefault(_traceClient);

var _socketAdapterBrowser = __webpack_require__(2);

var _socketAdapterBrowser2 = _interopRequireDefault(_socketAdapterBrowser);

var _hostConfig = __webpack_require__(3);

var _hostConfig2 = _interopRequireDefault(_hostConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = new _traceClient2.default(_socketAdapterBrowser2.default);

function trace() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  client.send(args);
}

trace.config = function (host) {
  var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8080;

  if (_hostConfig2.default.isConnected) {
    throw new Error('Trace host config cannot be set after client has connected, do it earlier.');
  }

  _hostConfig2.default.host = host;
  _hostConfig2.default.port = port;
};

exports.default = trace;

/***/ }),
/* 1 */
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
      // TODO: flush buffer to socket.send(...)
      // temp, show to console...

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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hostConfig = __webpack_require__(3);

var _hostConfig2 = _interopRequireDefault(_hostConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BrowserSocketAdapter = function () {
  function BrowserSocketAdapter(onMessageHandler) {
    _classCallCheck(this, BrowserSocketAdapter);

    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.hasError = false;
    this.clientId = null;
    this.onMessageHandler = onMessageHandler;
  }

  _createClass(BrowserSocketAdapter, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var host = _hostConfig2.default.host,
            port = _hostConfig2.default.port;


        try {
          var socket = new WebSocket(host + ':' + port);

          _hostConfig2.default.isConnecting = true;
          _this.socket = socket;

          socket.onopen = function (event) {
            _this.isConnected = true;
            _this.isConnecting = false;
            setTimeout(function () {
              resolve(socket);
            }, 0);
          };

          socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            if (data.cmd === 'id.set') {
              _this.clientId = data.value;
            }
            _this.onMessageHandler(data);
          };

          socket.onerror = function (error) {
            this.hasError = true;
            console.log('error!');
          };
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: 'send',
    value: function send(cmd, data) {
      if (this.hasError) {
        throw new Error('Cannot send trace data, socket has failed.');
      }

      var message = {
        clientId: this.clientId,
        cmd: cmd,
        data: data
      };

      try {
        var json = JSON.stringify(message);
        this.socket.send(json);
      } catch (e) {
        throw new Error('Cannot convert trace message data to JSON');
      }
    }
  }, {
    key: 'close',
    value: function close() {
      this.send('close');
    }
  }]);

  return BrowserSocketAdapter;
}();

exports.default = BrowserSocketAdapter;
;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  host: 'ws://127.0.0.1',
  port: 8080,
  isConnected: false
};

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=trace-client-browser.js.map