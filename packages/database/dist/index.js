'use strict';

var cov_1y5ibh64iy = function () {
  var path = '/Users/Edwin/Documents/Git/tupaia/packages/database/src/index.js',
      hash = '557be34838dcd6515b6487926384d00dae518e35',
      Function = function () {}.constructor,
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/Edwin/Documents/Git/tupaia/packages/database/src/index.js',
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

var _generateId = require('./utilities/generateId');

Object.defineProperty(exports, 'generateId', {
  enumerable: true,
  get: function get() {
    return _generateId.generateId;
  }
});
Object.defineProperty(exports, 'getHighestPossibleIdForGivenTime', {
  enumerable: true,
  get: function get() {
    return _generateId.getHighestPossibleIdForGivenTime;
  }
});

var _TupaiaDatabase = require('./TupaiaDatabase');

Object.defineProperty(exports, 'TupaiaDatabase', {
  enumerable: true,
  get: function get() {
    return _TupaiaDatabase.TupaiaDatabase;
  }
});
Object.defineProperty(exports, 'QUERY_CONJUNCTIONS', {
  enumerable: true,
  get: function get() {
    return _TupaiaDatabase.QUERY_CONJUNCTIONS;
  }
});
Object.defineProperty(exports, 'JOIN_TYPES', {
  enumerable: true,
  get: function get() {
    return _TupaiaDatabase.JOIN_TYPES;
  }
});