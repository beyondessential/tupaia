'use strict';

import { insertObject } from '../utilities/migration';

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

const arrayToDbString = array => array.map(item => `"${item}"`).join(', ');

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

const DASHBOARD_GROUP_SUB_FACILITY = {
  organisationLevel: 'SubFacility',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{}',
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria_Sub_Facility',
  projectCodes: '{laos_eoc}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_SUB_FACILITY);
  const FIRST_REPORT = 'Laos_EOC_Malaria_Stock_Availability_Facility';
  const REST_OF_REPORTS = [
    'Laos_EOC_Malaria_Critical_Item_Availability',
    'Laos_EOC_Malaria_Critical_Item_Availability_Single_Value',
  ];
  const reports = [FIRST_REPORT];
  for (const reportId of REST_OF_REPORTS) {
    const report = await getDashboardReportById(db, reportId);
    const newId = `${report.id}_Sub_Facility`;
    const newDataBuilderConfig = {
      ...report.dataBuilderConfig,
      entityAggregation: { dataSourceEntityType: 'sub_facility' },
    };
    delete report.drillDownLevel;
    const newReport = { ...report, dataBuilderConfig: newDataBuilderConfig, id: newId };
    await insertObject(db, 'dashboardReport', newReport);
    reports.push(newId);
  }

  await db.runSql(`
    UPDATE "dashboardGroup" 
    SET "dashboardReports" = "dashboardReports" ||  '{${arrayToDbString(reports)}}'
    WHERE code = '${DASHBOARD_GROUP_SUB_FACILITY.code}';
  `);
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
