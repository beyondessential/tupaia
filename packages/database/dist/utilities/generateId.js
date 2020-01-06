'use strict';

var cov_1h98uc8egl = function () {
  var path = '/Users/Edwin/Documents/Git/tupaia/packages/database/src/utilities/generateId.js',
      hash = '538dd53da06b2e4f2a7f99cf31b683d1e36b6dda',
      Function = function () {}.constructor,
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/Edwin/Documents/Git/tupaia/packages/database/src/utilities/generateId.js',
    statementMap: {
      '0': {
        start: {
          line: 13,
          column: 26
        },
        end: {
          line: 31,
          column: 1
        }
      },
      '1': {
        start: {
          line: 14,
          column: 18
        },
        end: {
          line: 14,
          column: 59
        }
      },
      '2': {
        start: {
          line: 15,
          column: 20
        },
        end: {
          line: 19,
          column: 16
        }
      },
      '3': {
        start: {
          line: 20,
          column: 20
        },
        end: {
          line: 23,
          column: 21
        }
      },
      '4': {
        start: {
          line: 24,
          column: 18
        },
        end: {
          line: 28,
          column: 21
        }
      },
      '5': {
        start: {
          line: 30,
          column: 2
        },
        end: {
          line: 30,
          column: 51
        }
      },
      '6': {
        start: {
          line: 33,
          column: 48
        },
        end: {
          line: 34,
          column: 58
        }
      },
      '7': {
        start: {
          line: 34,
          column: 2
        },
        end: {
          line: 34,
          column: 58
        }
      },
      '8': {
        start: {
          line: 36,
          column: 38
        },
        end: {
          line: 39,
          column: 21
        }
      },
      '9': {
        start: {
          line: 37,
          column: 2
        },
        end: {
          line: 39,
          column: 21
        }
      }
    },
    fnMap: {
      '0': {
        name: '(anonymous_0)',
        decl: {
          start: {
            line: 13,
            column: 26
          },
          end: {
            line: 13,
            column: 27
          }
        },
        loc: {
          start: {
            line: 13,
            column: 32
          },
          end: {
            line: 31,
            column: 1
          }
        },
        line: 13
      },
      '1': {
        name: '(anonymous_1)',
        decl: {
          start: {
            line: 33,
            column: 48
          },
          end: {
            line: 33,
            column: 49
          }
        },
        loc: {
          start: {
            line: 34,
            column: 2
          },
          end: {
            line: 34,
            column: 58
          }
        },
        line: 34
      },
      '2': {
        name: '(anonymous_2)',
        decl: {
          start: {
            line: 36,
            column: 38
          },
          end: {
            line: 36,
            column: 39
          }
        },
        loc: {
          start: {
            line: 37,
            column: 2
          },
          end: {
            line: 39,
            column: 21
          }
        },
        line: 37
      }
    },
    branchMap: {},
    s: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0
    },
    f: {
      '0': 0,
      '1': 0,
      '2': 0
    },
    b: {},
    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
  },
      coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  coverageData.hash = hash;
  return coverage[path] = coverageData;
}(); /**
      * Tupaia MediTrak
      * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
      */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHighestPossibleIdForGivenTime = exports.generateId = undefined;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Generate and return a mongo style ID
 * Taken from https://gist.github.com/chrisveness/7975c33ac569c124e4ceb11490576c67
 **/
cov_1h98uc8egl.s[0]++;
var generateId = exports.generateId = function generateId() {
  cov_1h98uc8egl.f[0]++;

  var seconds = (cov_1h98uc8egl.s[1]++, getSecondsStringFromTimestamp(new Date()));
  var machineId = (cov_1h98uc8egl.s[2]++, _crypto2.default.createHash('md5').update(_os2.default.hostname()).digest('hex').slice(0, 6));
  var processId = (cov_1h98uc8egl.s[3]++, process.pid.toString(16).slice(0, 4).padStart(4, '0'));
  var counter = (cov_1h98uc8egl.s[4]++, process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0'));

  cov_1h98uc8egl.s[5]++;
  return seconds + machineId + processId + counter;
};

cov_1h98uc8egl.s[6]++;
var getHighestPossibleIdForGivenTime = exports.getHighestPossibleIdForGivenTime = function getHighestPossibleIdForGivenTime(timestamp) {
  cov_1h98uc8egl.f[1]++;
  cov_1h98uc8egl.s[7]++;
  return getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');
};

cov_1h98uc8egl.s[8]++;
var getSecondsStringFromTimestamp = function getSecondsStringFromTimestamp(timestamp) {
  cov_1h98uc8egl.f[2]++;
  cov_1h98uc8egl.s[9]++;
  return Math.floor(timestamp / 1000).toString(16).padStart(8, '0');
};