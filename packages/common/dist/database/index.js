'use strict';

var cov_1ddty7y6f = function () {
  var path = '/Users/Edwin/Documents/Git/tupaia/packages/common/src/database/index.js',
      hash = '692ae4b0976d59733c25ecc85c82b2fc64dca2b6',
      Function = function () {}.constructor,
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/Edwin/Documents/Git/tupaia/packages/common/src/database/index.js',
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

var _getConnectionConfig = require('./getConnectionConfig');

Object.defineProperty(exports, 'getConnectionConfig', {
  enumerable: true,
  get: function get() {
    return _getConnectionConfig.getConnectionConfig;
  }
});