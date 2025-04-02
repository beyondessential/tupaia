'use strict';

import { insertObject } from '../utilities';

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

const DASHBOARD_GROUP = {
  organisationLevel: 'Village',
  userGroup: 'STRIVE User',
  organisationUnitCode: 'PG',
  dashboardReports: '{PG_Strive_PNG_Weekly_Reported_Cases}',
  name: 'STRIVE PNG',
  code: 'PG_Strive_PNG_Village',
};

exports.up = async function (db) {
  return insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
};

exports.down = function (db) {
  return db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';`);
};

exports._meta = {
  version: 1,
};
