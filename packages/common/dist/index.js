'use strict';

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