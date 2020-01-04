'use strict';

var cov_140ao1z4y7 = function () {
  var path = '/Users/Edwin/Documents/Git/tupaia/packages/common/src/index.js',
      hash = '8b44232c5b3c56217c0b861c6448ca5c920f24a0',
      Function = function () {}.constructor,
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/Edwin/Documents/Git/tupaia/packages/common/src/index.js',
    statementMap: {},
    fnMap: {},
    branchMap: {},
    s: {},
    f: {},
    b: {},
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

var _database = require('./database');

Object.defineProperty(exports, 'getConnectionConfig', {
  enumerable: true,
  get: function get() {
    return _database.getConnectionConfig;
  }
});