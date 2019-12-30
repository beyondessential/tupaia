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

/**
 * The following migration utilities have been copy pasted from migrationUtilities.js
 */

// Add a dashboard report to a dashboard group
function addReportToGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${reportId}"}'
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

// Remove a dashboard report from a dashboard group
function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

// Delete a report
function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}

const REPORT_ID = 'Imms_Stockouts';
const GROUP_CODES = ['VU_Imms_Facility', 'VU_Imms_Country', 'VU_Imms_Province'];

exports.up = async function(db) {
  const dashboardReport = {
    id: REPORT_ID,
    dataBuilder: 'stockouts',
    dataBuilderConfig: {
      programCode: 'FRIDGE_DAILY',
      dataElementCodes: [
        'QTY_375874bf',
        'QTY_44ec84bf',
        'QTY_7191781d',
        'QTY_6fc9d81d',
        'QTY_cd2d581d',
        'QTY_4e6a681d',
        'QTY_40a8681d',
        'QTY_452a74bf',
        'QTY_64ed34bf',
      ],
    },
    viewJson: {
      name: 'Vaccine Stockouts',
      type: 'view',
      viewType: 'multiValue',
      valueType: 'text',
    },
  };
  await insertObject(db, 'dashboardReport', dashboardReport);
  return addReportToGroups(db, REPORT_ID, GROUP_CODES);
};

exports.down = async function(db) {
  await removeReportFromGroups(db, REPORT_ID, GROUP_CODES);
  return deleteReport(db, REPORT_ID);
};

exports._meta = {
  version: 1,
};
