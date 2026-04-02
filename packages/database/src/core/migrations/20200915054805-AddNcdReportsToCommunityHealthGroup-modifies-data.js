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
const reportIds = [
  'TO_HPU_Number_NCD_Risk_Factor_Screening_Events_By_Setting',
  'TO_Total_Screened_For_NCD_Risk_Factors',
  'TO_HPU_Total_Screened_For_NCD_Risk_Factors_By_Age_And_Gender',
];
const dashboardGroupCode = 'Tonga_Community_Health_Country';

exports.up = function (db) {
  console.log(reportIds.join(','));
  return db.runSql(`
      UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{${reportIds.join(',')}}'
      WHERE "code" = '${dashboardGroupCode}';
  `);
};

const removeReportFromGroup = (db, reportId) =>
  db.runSql(` 
  UPDATE "dashboardGroup"
  SET "dashboardReports" = array_remove("dashboardReports", '${reportId}')
  WHERE "code" = '${dashboardGroupCode}';
  `);

exports.down = function (db) {
  return Promise.all(reportIds.map(reportId => removeReportFromGroup(db, reportId)));
};

exports._meta = {
  version: 1,
};
