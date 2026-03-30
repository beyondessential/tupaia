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

// Dashboard name: Number of new quitline calls (by District)
// Dashboard type: Pie chart
// View: National level
// Data source survey name: HP04 Monthly National Quitline
// Data source survey question code: HP216
// Numerator: value of a particular district
// Denominator:
// No data by district yet - build functionality (just do total national number now)
// or put this one on hold until this data coming in.

const dashboardGroup = 'TO_Health_Promotion_Unit_Country';
const reportId = 'TO_HPU_Number_New_Quitline_Calls_District';
const dataBuilder = 'sumByOrgUnit';
const dataBuilderConfig = {
  aggregationType: 'SUM_PER_ORG_GROUP',
  dataElementCodes: ['HP216'],
  entityAggregation: {
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'district',
  },
};
const viewJson = {
  name: 'Number of New Quitline Calls',
  type: 'chart',
  chartType: 'pie',
  valueType: 'number',
  periodGranularity: 'one_year_at_a_time',
};

const dataServices = [{ isDataRegional: false }];

const report = {
  id: reportId,
  dataBuilder,
  dataBuilderConfig,
  viewJson,
  dataServices,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
     UPDATE "dashboardGroup"
     SET "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
     WHERE "code" = '${dashboardGroup}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${report.id}';
     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
     WHERE "code" = '${dashboardGroup}';
   `);
};
exports._meta = {
  version: 1,
};
