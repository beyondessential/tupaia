"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Multilock = undefined;

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _set = require("babel-runtime/core-js/set");

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Multilock = exports.Multilock = function () {
  function Multilock() {
    (0, _classCallCheck3.default)(this, Multilock);

    this.locks = new _set2.default();
    this.promise = null;
    this.resolve = null;
  }

  (0, _createClass3.default)(Multilock, [{
    key: "isLocked",
    value: function isLocked() {
      return this.locks.size > 0;
    }
  }, {
    key: "waitWithDebounce",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(debounce) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.wait();

              case 2:
                _context.next = 4;
                return new _promise2.default(function (resolve) {
                  return setTimeout(resolve, debounce);
                });

              case 4:
                if (!this.isLocked()) {
                  _context.next = 6;
                  break;
                }

                return _context.abrupt("return", this.waitWithDebounce(debounce));

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function waitWithDebounce(_x) {
        return _ref.apply(this, arguments);
      }

      return waitWithDebounce;
    }()
  }, {
    key: "wait",
    value: function wait() {
      var _this = this;

      if (!this.isLocked()) {
        return _promise2.default.resolve();
      }

      if (!this.promise) {
        this.promise = new _promise2.default(function (resolve, reject) {
          _this.resolve = resolve;
        });
      }

      return this.promise;
    }
  }, {
    key: "finished",
    value: function finished() {
      if (!this.resolve) return;

      this.resolve();
      this.promise = null;
      this.resolve = null;
    }
  }, {
    key: "createLock",
    value: function createLock(id) {
      var _this2 = this;

      var key = (0, _symbol2.default)(id);
      this.locks.add(key);

      var unlock = function unlock() {
        _this2.locks.delete(key);
        if (_this2.resolve && _this2.locks.size === 0) {
          _this2.finished();
        }
      };

      return unlock;
    }
  }]);
  return Multilock;
}();