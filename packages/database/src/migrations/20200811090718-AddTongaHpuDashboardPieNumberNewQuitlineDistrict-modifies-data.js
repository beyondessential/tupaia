'use strict';

import { insertObject } from '../utilities/migration';

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

// Dashboard name: Number of new quitline calls (by District)
// Dashboard type: Pie chart
// View: National level
// Data source survey name: HP04 Monthly National Quitline
// Data source survey question code: HP216
// Numerator: value of a particular district
// Denominator:
// No data by district yet - build functionality (just do total national number now) 
// or put this one on hold until this data coming in.

// 'percentPerValuePerOrgUnit',
//           `{
//     "type": "chart",
//     "name": "Service Status By Facility",
//     "xName": "Facility",
//     "yName": "%",
//     "chartType": "bar",
//     "valueType": "percentage",
//     "presentationOptions": {
//       "1": {
//         "color": "#279A63", "label": "Green"
//       },
//       "2": {
//         "color": "#EE9A30", "label": "Orange"
//       },
//       "3": {
//         "color": "#EE4230", "label": "Red"
//       }
//     }
//   }`,
//           `{
//     "apiRoute": "analytics",
//     "dataElementCodes": [ "DE_GROUP-PEHSS" ],
//     "organisationUnitIsGroup":true,
//     "aggregationType": "ALL"

const dashboardGroups = ['TO_Health_Promotion_Unit_Country'];
const reportId = 'Tonga_HPU_Number_New_Quitline_Calls_District';
const dataBuilder = 'percentPerValuePerOrgUnit';
const dataBuilderConfig = {
  dataElementCodes: ['HP216'],
  programCode: 'HP04',
};
const viewJson = {
  name: 'Health Talks and Training: Setting Type',
  type: 'chart',
  chartType: 'pie',
  valueType: 'fractionAndPercentage',
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

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
     UPDATE "dashboardGroup"
     SET "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports.down = function(db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${report.id}';
     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
     WHERE "code" = '${dashboardGroups}';
   `);
};
exports._meta = {
  "version": 1
};
