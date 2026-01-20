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

const REPORT_ID = 'PG_Strive_PNG_Weekly_mRDT_Positive';

const NEW_DASHBOARD_GROUP_CODES = ['PG_Strive_PNG_Province', 'PG_Strive_PNG_Country'];

const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

exports.up = async function (db) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_ID} }'
    WHERE
      "code" in (${arrayToDbString(NEW_DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    WHERE
      "code" in (${arrayToDbString(NEW_DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
