'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _chai = require('chai');

var _multilock = require('../utilities/multilock');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Multilock', function () {
  it('Should wait for one lock', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var m, unlock;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            m = new _multilock.Multilock();
            unlock = m.createLock('a');


            (0, _chai.expect)(m.isLocked()).to.be.true;

            setTimeout(unlock, 10);
            _context.next = 6;
            return m.wait();

          case 6:

            (0, _chai.expect)(m.isLocked()).to.be.false;

          case 7:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it('Should wait for two locks', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var m, unlockA, unlockB;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            m = new _multilock.Multilock();
            unlockA = m.createLock('a');
            unlockB = m.createLock('b');


            (0, _chai.expect)(m.isLocked()).to.be.true;

            setTimeout(unlockA, 22);
            setTimeout(unlockB, 30);
            _context2.next = 8;
            return m.wait();

          case 8:

            (0, _chai.expect)(m.isLocked()).to.be.false;

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  it('Should wait for zero locks', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var m;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            m = new _multilock.Multilock();


            (0, _chai.expect)(m.isLocked()).to.be.false;

            _context3.next = 4;
            return m.wait();

          case 4:

            (0, _chai.expect)(m.isLocked()).to.be.false;

          case 5:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  it('Should wait for two locks with the same friendly name', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var m, unlockA, unlockB;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            m = new _multilock.Multilock();
            unlockA = m.createLock('a');
            unlockB = m.createLock('a');


            (0, _chai.expect)(m.isLocked()).to.be.true;

            unlockA();

            (0, _chai.expect)(m.isLocked()).to.be.true;

            unlockB();

            (0, _chai.expect)(m.isLocked()).to.be.false;

          case 8:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  })));

  it('Should be fine with multiple waits', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    var m, unlock, waiters;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            m = new _multilock.Multilock();
            unlock = m.createLock('a');
            waiters = _promise2.default.all([m.wait(), m.wait(), m.wait(), m.wait()]);


            setTimeout(unlock, 10);
            _context5.next = 6;
            return waiters;

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  })));

  it('Should allow a debounce', (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
    var m, val, unlock, valAfterLock;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            m = new _multilock.Multilock();
            val = 'before';

            // unlock 10ms from now

            unlock = m.createLock();

            setTimeout(unlock, 10);

            // lock and unlock 20ms from now
            setTimeout(function () {
              var unlock2 = m.createLock();
              val = 'after';
              unlock2();
            }, 20);

            // start waiting for the lock *15* ms from now
            // - after the 10ms unlock has triggered
            // - before the 20ms lock/unlock has triggered
            // the debounce should still the second unlock
            _context7.next = 7;
            return new _promise2.default(function (resolve) {
              setTimeout((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return m.waitWithDebounce(20);

                      case 2:
                        resolve(val);

                      case 3:
                      case 'end':
                        return _context6.stop();
                    }
                  }
                }, _callee6, undefined);
              })), 15);
            });

          case 7:
            valAfterLock = _context7.sent;


            (0, _chai.expect)(valAfterLock).to.equal('after');

          case 9:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  })));
});