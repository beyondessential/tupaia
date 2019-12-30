'use strict';

import { insertObject } from '../migrationUtilities';

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

const DASHBOARD_CODE = 'PG_Strive_PNG';

exports.up = async function(db) {
  return insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Country',
    userGroup: 'Strive PNG',
    organisationUnitCode: 'PG',
    dashboardReports: {},
    name: 'Strive PNG',
    code: DASHBOARD_CODE,
  });
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" WHERE "code" = '${DASHBOARD_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
