'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

async function addReportToGroupsOnTop(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = '{"${reportId}"}' || "dashboardReports" 
    WHERE
      "code" IN (${arrayToDbString(groupCodes)});
  `);
}
async function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}
async function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${arrayToDbString(groupCodes)});
  `);
}

const dashboardGroupCode = 'PW_General_Facility_Public';
const dashboardReport = {
  id: 'Palau_Facility_Opening_Hours',
  dataBuilder: 'facilityOpeningHours',
  dataBuilderConfig: {
    dataElementCodes: {
      Monday: ['FF16', 'FF20', 'FF21'],
      Tuesday: ['FF17', 'FF22', 'FF23'],
      Wednesday: ['BCD39D', 'FF24', 'FF25'],
      Thursday: ['BCD39E', 'FF26', 'FF27'],
      Friday: ['BCD39F', 'FF28', 'FF29'],
      Saturday: ['BCD39G', 'FF30', 'FF31'],
      Sunday: ['BCD39H', 'FF32', 'FF33'],
    },
  },
  viewJson: {
    name: 'Facility Opening Hours',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', dashboardReport);
  await addReportToGroupsOnTop(db, dashboardReport.id, [dashboardGroupCode]);
};

exports.down = async function (db) {
  await deleteReport(db, dashboardReport.id);
  await removeReportFromGroups(db, dashboardReport.id, [dashboardGroupCode]);
};

exports._meta = {
  version: 1,
};
