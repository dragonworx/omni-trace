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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("blessed");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = trace;

var _local = __webpack_require__(2);

var _local2 = _interopRequireDefault(_local);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = new _local2.default();
server.start();

function trace() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  server.trace({
    clientId: 1,
    data: args
  });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ui = __webpack_require__(3);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalServer = function () {
  function LocalServer() {
    _classCallCheck(this, LocalServer);

    this.buffer = [];
  }

  _createClass(LocalServer, [{
    key: 'start',
    value: function start(port) {
      _ui.output.log('Trace Server started on port: {bold}' + (port ? port : 'in-proc') + '{/}');
    }
  }, {
    key: 'trace',
    value: function trace(event) {
      var bufferedEvent = _extends({}, event, {
        time: Date.now()
      });
      _ui.output.log('{bold}trace:{/} ' + JSON.stringify(bufferedEvent));
      this.buffer.push(bufferedEvent);
    }
  }]);

  return LocalServer;
}();

exports.default = LocalServer;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.output = undefined;

var _blessed = __webpack_require__(0);

var _blessed2 = _interopRequireDefault(_blessed);

var _blessedContrib = __webpack_require__(4);

var _blessedContrib2 = _interopRequireDefault(_blessedContrib);

var _log = __webpack_require__(7);

var _log2 = _interopRequireDefault(_log);

var _output = __webpack_require__(6);

var _output2 = _interopRequireDefault(_output);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var screen = _blessed2.default.screen({
  smartCSR: true,
  dockBorders: true
});

var program = _blessed2.default.program();

screen.key(['C-c'], function (ch, key) {
  return process.exit(0);
});

var borderStyle = {
  type: 'line',
  fg: 'cyan'
};

var labelStyle = {
  bold: true
};

var logBox = _blessed2.default.box({
  parent: screen,
  style: {
    bg: 'black',
    label: labelStyle
  },
  border: borderStyle,
  label: 'Log'
});

var outputLogger = _blessed2.default.log({
  parent: screen,
  style: {
    fg: 'green',
    bg: 'black',
    label: labelStyle
  },
  border: borderStyle,
  label: 'Output',
  tags: true,
  scrollback: 100,
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'grey'
    },
    style: {
      inverse: true
    }
  },
  keys: true,
  mouse: true
});

var inspectorBox = _blessed2.default.box({
  parent: screen,
  style: {
    bg: 'red',
    label: labelStyle
  },
  border: borderStyle,
  label: 'Inspector'
});

var clientsBox = _blessed2.default.box({
  parent: screen,
  style: {
    bg: 'green',
    label: labelStyle
  },
  border: borderStyle,
  label: 'Clients'
});

var onResize = function onResize() {
  var width = screen.width,
      height = screen.height;

  var mx = Math.round(width * 0.7);
  var my = Math.round(height * 0.7);

  logBox.left = 0;
  logBox.top = 0;
  logBox.width = mx + 1;
  logBox.height = my + 1;

  outputLogger.left = 0;
  outputLogger.top = my;
  outputLogger.width = mx + 1;
  outputLogger.height = height - my;

  inspectorBox.left = mx;
  inspectorBox.top = 0;
  inspectorBox.width = width - mx;
  inspectorBox.height = my + 1;

  clientsBox.left = mx;
  clientsBox.top = my;
  clientsBox.width = width - mx;
  clientsBox.height = height - my;

  screen.render();
};

screen.on('resize', onResize);

onResize();

var output = exports.output = new _output2.default(outputLogger);
var log = exports.log = new _log2.default(logBox);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("blessed-contrib");

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = __webpack_require__(0);

var _blessed2 = _interopRequireDefault(_blessed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = function log() {
  console.log.apply(console, arguments);
};

var Input = function () {
  function Input(opts) {
    var _this = this;

    _classCallCheck(this, Input);

    _initialiseProps.call(this);

    var parent = opts.parent,
        _opts$top = opts.top,
        top = _opts$top === undefined ? 0 : _opts$top,
        _opts$left = opts.left,
        left = _opts$left === undefined ? 0 : _opts$left,
        _opts$width = opts.width,
        width = _opts$width === undefined ? '100%' : _opts$width,
        _opts$bg = opts.bg,
        bg = _opts$bg === undefined ? 'blue' : _opts$bg,
        _opts$fg = opts.fg,
        fg = _opts$fg === undefined ? 'white' : _opts$fg,
        value = opts.value,
        onAccept = opts.onAccept;

    var screen = parent.screen;

    var box = _blessed2.default.box({
      parent: parent,
      left: left,
      top: top,
      width: width,
      height: 1,
      style: {
        fg: fg,
        bg: bg
      },
      tags: true,
      clickable: true
    });

    box.on('focus', function () {
      return _this.focus();
    });
    box.on('blur', function () {
      return _this.blur();
    });
    box.on('mousedown', this.onMouseDown);

    screen.on('keypress', function (key, event) {
      if (_this.hasFocus) {
        _this.onKeyPress(event);
      }
    });

    this.box = box;
    this.screen = screen;
    this.acceptHandler = onAccept || this.acceptHandler;

    if (value) {
      this.buffer = value.split('');
      this.cursorPos = value.length;
      this.render();
    }
  }

  _createClass(Input, [{
    key: 'onKeyPress',
    value: function onKeyPress(event) {
      var sequence = event.sequence,
          name = event.name,
          ctrl = event.ctrl,
          meta = event.meta,
          shift = event.shift,
          full = event.full,
          ch = event.ch;
      var buffer = this.buffer,
          cursorPos = this.cursorPos;

      if (sequence && sequence === name) {
        this.insert(name);
      } else if (ch) {
        this.insert(ch);
      } else if (name === 'space') {
        this.insert(' ');
      } else if (name === 'left' && cursorPos > 0) {
        this.cursorPos--;
        this.render();
      } else if (name === 'right' && cursorPos < buffer.length) {
        this.cursorPos++;
        this.render();
      } else if (name === 'backspace' && cursorPos > 0) {
        this.buffer.splice(cursorPos - 1, 1);
        this.setCursorPos(cursorPos - 1);
      } else if (name === 'delete' && buffer.length > 0) {
        this.buffer.splice(cursorPos, 1);
        this.render();
      } else if (name === 'home') {
        this.setCursorPos(0);
      } else if (name === 'end') {
        this.setCursorPos(buffer.length);
      } else if (name === 'escape') {
        this.blur();
      } else if (name === 'return') {
        this.acceptHandler(this.value);
      }
    }
  }, {
    key: 'insert',
    value: function insert(char) {
      this.buffer.splice(this.cursorPos, 0, char);
      this.cursorPos++;
      this.render();
    }
  }, {
    key: 'focus',
    value: function focus() {
      if (!this.hasFocus) {
        this.hasFocus = true;
        this.render();
      }
    }
  }, {
    key: 'blur',
    value: function blur() {
      if (this.hasFocus) {
        this.hasFocus = false;
        this.render();
      }
    }
  }, {
    key: 'setCursorPos',
    value: function setCursorPos(pos) {
      this.cursorPos = pos;
      this.render();
    }
  }, {
    key: 'render',
    value: function render() {
      var buffer = this.buffer,
          box = this.box,
          screen = this.screen,
          cursorPos = this.cursorPos;

      var content = buffer.slice();
      if (this.hasFocus) {
        content[cursorPos] = '{' + box.style.bg + '-fg}{' + box.style.fg + '-bg}' + (content[cursorPos] || ' ') + '{/}';
      }
      box.setContent(content.join(''));
      screen.render();
    }
  }, {
    key: 'value',
    get: function get() {
      return this.buffer.join('');
    }
  }]);

  return Input;
}();

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.hasFocus = false;
  this.buffer = [];
  this.cursorPos = 0;

  this.acceptHandler = function () {};

  this.onMouseDown = function (mouse) {
    var box = _this2.box,
        buffer = _this2.buffer;

    _this2.setCursorPos(Math.min(mouse.x - box.aleft, buffer.length));
  };
};

exports.default = Input;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _blessed = __webpack_require__(0);

var _blessed2 = _interopRequireDefault(_blessed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Output = function () {
  function Output(logger) {
    _classCallCheck(this, Output);

    this.logger = logger;
  }

  _createClass(Output, [{
    key: 'log',
    value: function log(textMessage) {
      this.logger.log(textMessage);
    }
  }]);

  return Output;
}();

exports.default = Output;
;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _blessed = __webpack_require__(0);

var _blessed2 = _interopRequireDefault(_blessed);

var _input = __webpack_require__(5);

var _input2 = _interopRequireDefault(_input);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = function Log(box) {
  _classCallCheck(this, Log);

  this.box = box;

  var input = new _input2.default({
    parent: box,
    value: 'abcdefg',
    width: '100%-2',
    onAccept: function onAccept(value) {
      console.log(value);
    }
  });
};

exports.default = Log;
;

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=client-inproc.js.map