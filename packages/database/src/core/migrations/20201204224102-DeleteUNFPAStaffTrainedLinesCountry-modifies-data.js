'use strict';

const { arrayToDbString } = require('../utilities/migration');

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

const DASHBOARD_GROUP_CODES = ['UNFPA_Project'];

const REPORT_IDS = ['UNFPA_Percentage_Of_Facilities_At_Least_1_Staff_Trained_SRH_Services'];

const deleteReport = async (db, reportId) => {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${reportId}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.up = async function (db) {
  for (let i = 0; i < REPORT_IDS.length; i++) {
    await deleteReport(db, REPORT_IDS[i]);
  }
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
