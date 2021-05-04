'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const DATA_SOURCE_CODES = [
  'MAL_3645d4bf',
  'MAL_199ffeec',
  'MAL_46cfdeec',
  'MAL_566bceec',
  'MAL_47bb143e',
  'MAL_ORS',
  'MAL_5de7d4bf',
  'MAL_5de2a4bf',
  'MAL_47b2b43e',
  'MAL_Artesunate',
  'MAL_Paracetemol',
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE data_source
    SET config = config || '{"indicator": { "dataPeriodType": "MONTH"}}'
    WHERE code IN (${arrayToDbString(DATA_SOURCE_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE data_source
    SET config = config - 'indicator'
    WHERE code IN (${arrayToDbString(DATA_SOURCE_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
