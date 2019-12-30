'use strict';

import { replaceArrayValue, updateValues } from '../migrationUtilities';

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

const OLD_DATA_BUILDER = 'matrixOrganisationUnitDataElement';
const NEW_DATA_BUILDER = 'organisationUnitTable';
const NEW_REPORT_ID = 'TO_PEHS';

// Update data builder configuration for a report
async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

exports.up = async function(db) {
  await updateValues(
    db,
    'dashboardReport',
    { dataBuilder: NEW_DATA_BUILDER },
    { dataBuilder: OLD_DATA_BUILDER },
  );
  await updateValues(db, 'dashboardReport', { id: NEW_REPORT_ID }, { id: '37' });
  await updateBuilderConfigByReportId(
    db,
    {
      dataSource: { type: 'groupSet', codes: ['PEHS_Service_Categories'] },
      optionSetCode: 'white.green.orange.red',
      columnTitle: 'Services',
    },
    NEW_REPORT_ID,
  );

  // Replace both '37' and '41' dashboard reports with the new 'TO_PEHS' report
  await replaceArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    '37',
    NEW_REPORT_ID,
    `name = 'PEHS' AND "organisationLevel" IN ('Country', 'Province')`,
  );
  await replaceArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    '41',
    NEW_REPORT_ID,
    `name = 'PEHS' AND "organisationLevel" = 'Facility'`,
  );
  return db.runSql(`DELETE FROM "dashboardReport" WHERE id = '41';`);
};

exports.down = async function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
