'use strict';

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
/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

var generateId = exports.generateId = function generateId() {
  var seconds = getSecondsStringFromTimestamp(new Date());
  var machineId = _crypto2.default.createHash('md5').update(_os2.default.hostname()).digest('hex').slice(0, 6);
  var processId = process.pid.toString(16).slice(0, 4).padStart(4, '0');
  var counter = process.hrtime()[1].toString(16).slice(0, 6).padStart(6, '0');

  return seconds + machineId + processId + counter;
};

var getHighestPossibleIdForGivenTime = exports.getHighestPossibleIdForGivenTime = function getHighestPossibleIdForGivenTime(timestamp) {
  return getSecondsStringFromTimestamp(timestamp).padEnd(24, 'f');
};

var getSecondsStringFromTimestamp = function getSecondsStringFromTimestamp(timestamp) {
  return Math.floor(timestamp / 1000).toString(16).padStart(8, '0');
};