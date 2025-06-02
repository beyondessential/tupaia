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

const DASHBOARD_GROUP_CODES = [
  'NR_EHEALTH_NAURU_Country_Donor',
  'FJ_SUPPLYCHAIN_FIJI_Country_Donor',
];

exports.up = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" WHERE code IN (${arrayToDbString(DASHBOARD_GROUP_CODES)}) ;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
