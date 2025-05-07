'use strict';

import { insertObject, removeArrayValue } from '../utilities';

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

const DASHBOARD_GROUP = 'dashboardGroup';
const newRawDataDownloadDashboardGroup = {
  organisationLevel: 'Country',
  userGroup: 'COVID-19 Senior',
  organisationUnitCode: 'WS',
  projectCodes: '{covid_samoa}',
  name: 'COVID-19 Raw Data Downloads',
  code: 'WS_Covid_Raw_Data_Downloads_Country',
};
const rawDataDashboardReport = 'Raw_Data_Samoa_Covid_Surveys';
const customRawDataDashboardReport = 'Samoa_Covid_Customised_Raw_Data_Download';
const dashboardGroupCodes = ['WS_Covid_Samoa_Country', 'WS_Covid_Country'];
async function deleteDashboardGroup(db, code) {
  return db.runSql(`
    DELETE FROM
      "${DASHBOARD_GROUP}"
    WHERE
      "code" = '${code}';
  `);
}

exports.up = async function (db) {
  await insertObject(db, DASHBOARD_GROUP, {
    dashboardReports: `{${rawDataDashboardReport}, ${customRawDataDashboardReport}}`,
    ...newRawDataDownloadDashboardGroup,
  });

  for (const groupCode of dashboardGroupCodes) {
    await removeArrayValue(
      db,
      DASHBOARD_GROUP,
      'dashboardReports',
      rawDataDashboardReport,
      `code = '${groupCode}'`,
    );
  }

  await removeArrayValue(
    db,
    DASHBOARD_GROUP,
    'dashboardReports',
    customRawDataDashboardReport,
    `code = '${dashboardGroupCodes[0]}'`,
  );
};

exports.down = async function (db) {
  await deleteDashboardGroup(db, newRawDataDownloadDashboardGroup.code);
  for (const groupCode of dashboardGroupCodes) {
    await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${rawDataDashboardReport}"}'
    WHERE
      code = '${groupCode}';
  `);
  }
};

exports._meta = {
  version: 1,
};
