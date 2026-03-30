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

const FJ_DASHBOARD_ID = 'FJ_COVID_TRACKING_By_Gender_Country';

const FJ_DASHBOARD_GROUP_CODE = 'FJ_Covid_Fiji_Country_COVID-19';

exports.up = async function (db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '${FJ_DASHBOARD_ID}')
    WHERE code = '${FJ_DASHBOARD_GROUP_CODE}'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${FJ_DASHBOARD_ID}}'
    WHERE code = '${FJ_DASHBOARD_GROUP_CODE}'
  `);
};

exports._meta = {
  version: 1,
};
