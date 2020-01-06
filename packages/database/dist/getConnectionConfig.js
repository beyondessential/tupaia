'use strict';

var cov_bkiqgnp6c = function () {
  var path = '/Users/Edwin/Documents/Git/tupaia/packages/database/src/getConnectionConfig.js',
      hash = '9d85181a97b6524c5866b95dafc6b5efe80dd623',
      Function = function () {}.constructor,
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/Edwin/Documents/Git/tupaia/packages/database/src/getConnectionConfig.js',
    statementMap: {
      '0': {
        start: {
          line: 7,
          column: 35
        },
        end: {
          line: 29,
          column: 1
        }
      },
      '1': {
        start: {
          line: 8,
          column: 2
        },
        end: {
          line: 28,
          column: 8
        }
      }
    },
    fnMap: {
      '0': {
        name: '(anonymous_0)',
        decl: {
          start: {
            line: 7,
            column: 35
          },
          end: {
            line: 7,
            column: 36
          }
        },
        loc: {
          start: {
            line: 7,
            column: 41
          },
          end: {
            line: 29,
            column: 1
          }
        },
        line: 7
      }
    },
    branchMap: {
      '0': {
        loc: {
          start: {
            line: 8,
            column: 9
          },
          end: {
            line: 28,
            column: 7
          }
        },
        type: 'cond-expr',
        locations: [{
          start: {
            line: 9,
            column: 6
          },
          end: {
            line: 15,
            column: 7
          }
        }, {
          start: {
            line: 16,
            column: 6
          },
          end: {
            line: 28,
            column: 7
          }
        }],
        line: 8
      },
      '1': {
        loc: {
          start: {
            line: 22,
            column: 10
          },
          end: {
            line: 27,
            column: 15
          }
        },
        type: 'cond-expr',
        locations: [{
          start: {
            line: 23,
            column: 14
          },
          end: {
            line: 23,
            column: 18
          }
        }, {
          start: {
            line: 24,
            column: 14
          },
          end: {
            line: 27,
            column: 15
          }
        }],
        line: 22
      }
    },
    s: {
      '0': 0,
      '1': 0
    },
    f: {
      '0': 0
    },
    b: {
      '0': [0, 0],
      '1': [0, 0]
    },
    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
  },
      coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  coverageData.hash = hash;
  return coverage[path] = coverageData;
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
cov_bkiqgnp6c.s[0]++;
/**
 * Tupaia
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

// Note: Must use function to guarantee environment variables have loaded.
var getConnectionConfig = exports.getConnectionConfig = function getConnectionConfig() {
  cov_bkiqgnp6c.f[0]++;
  cov_bkiqgnp6c.s[1]++;

  return process.env.CI_NAME === 'codeship' ? (cov_bkiqgnp6c.b[0][0]++, {
    host: process.env.CI_TEST_DB_URL,
    user: process.env.CI_TEST_DB_USER,
    password: process.env.CI_TEST_DB_PASSWORD,
    database: process.env.CI_TEST_DB_NAME,
    ssl: null
  }) : (cov_bkiqgnp6c.b[0][1]++, {
    host: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_DISABLE_SSL === 'true' ? (cov_bkiqgnp6c.b[1][0]++, null) : (cov_bkiqgnp6c.b[1][1]++, {
      // Test server cannot turn on ssl, so sets the env to disable it
      rejectUnauthorized: false
    })
  });
};