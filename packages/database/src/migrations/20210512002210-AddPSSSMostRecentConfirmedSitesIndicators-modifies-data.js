'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

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

const CONFIRMED_SITES = {
  code: `PSSS_Most_Recent_Confirmed_Sites`,
  builder: 'analyticArithmetic',
  config: {
    formula: `PSSS_Confirmed_Sites`,
    aggregation: 'MOST_RECENT',
  },
};

const CONFIRMED_SITES_REPORTED = {
  code: `PSSS_Most_Recent_Confirmed_Sites_Reported`,
  builder: 'analyticArithmetic',
  config: {
    formula: `PSSS_Confirmed_Sites_Reported`,
    aggregation: 'MOST_RECENT',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'indicator', {
    id: generateId(),
    ...CONFIRMED_SITES,
  });

  await insertObject(db, 'indicator', {
    id: generateId(),
    ...CONFIRMED_SITES_REPORTED,
  });
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM indicator
    WHERE code IN (${arrayToDbString([CONFIRMED_SITES.code, CONFIRMED_SITES_REPORTED.code])})
  `);
};

exports._meta = {
  version: 1,
};
