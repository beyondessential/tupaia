'use strict';

var dbm;
var type;
var seed;

const REPORT_ID = 'PG_Strive_PNG_Positive_RDT_By_Result_Over_Time';

const DASHBOARD_GROUP_ID = 'PG_Strive_PNG_Country';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{${REPORT_ID}}'
    where code = '${DASHBOARD_GROUP_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", '${REPORT_ID}')
    where code = '${DASHBOARD_GROUP_ID}';
  `);
};

exports._meta = {
  version: 1,
};
