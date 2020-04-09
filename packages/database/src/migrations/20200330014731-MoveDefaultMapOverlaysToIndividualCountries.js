'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const COUNTRIES_WITH_DEFAULT_OVERLAYS = [
  'CK',
  'DL',
  'FJ',
  'KI',
  'LA',
  'PG',
  'PH',
  'WS',
  'SB',
  'TL',
  'TK',
  'TO',
  'VU',
  'VE',
];

exports.up = async function(db) {
  await db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "countryCodes" = '{${COUNTRIES_WITH_DEFAULT_OVERLAYS}}'
    WHERE
      "countryCodes" IS NULL AND name <> 'Operational facilities'
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
