'use strict';

import { arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

const REPORT_CODES = ['PSSS_Weekly_Cases', 'PSSS_Weekly_Report', 'PSSS_Confirmed_Weekly_Report'];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  return db.runSql(`
      UPDATE report
      SET config = jsonb_set(config, '{transform,2}', '"lastValuePerPeriodPerOrgUnit"')
      WHERE code IN (${arrayToDbString(REPORT_CODES)})
  `);
};

exports.down = function (db) {
  return db.runSql(`
      UPDATE report
      SET config = jsonb_set(config, '{transform,2}', '"firstValuePerPeriodPerOrgUnit"')
      WHERE code IN (${arrayToDbString(REPORT_CODES)})
  `);
};

exports._meta = {
  version: 1,
};
