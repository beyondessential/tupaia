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

const REPORT_ID = 'LAOS_SCHOOL_BINARY_TABLE';
const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_School_Laos_Schools_User';

exports.up = function (db) {
  return db.runSql(`	
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function (db) {
  return null; // No down migrations
};

exports._meta = {
  version: 1,
};
