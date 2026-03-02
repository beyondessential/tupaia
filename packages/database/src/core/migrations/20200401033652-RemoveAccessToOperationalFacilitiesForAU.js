'use strict';

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

const COUNTRIES_WITH_DEFAULT_OVERLAYS = [
  'NR',
  'NU',
  'PW',
  'TV',
  'AS',
  'GU',
  'PF',
  'NC',
  'MP',
  'PI',
  'WF',
  'FJ',
  'CK',
  'PG',
  'DL',
  'SB',
  'TK',
  'PH',
  'VE',
  'MH',
  'WS',
  'FM',
  'KI',
  'CI',
  'TO',
  'VU',
  'LA',
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = '{${COUNTRIES_WITH_DEFAULT_OVERLAYS}}'
    WHERE
      id = '126' OR id = '171'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = NULL
    WHERE
      id = '126' OR id = '171'
  `);
};

exports._meta = {
  version: 1,
};
