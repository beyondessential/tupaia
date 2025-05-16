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

// Dashboard Group | Health Promotion Unit
// Dashboard Title | Nutrition Counselling: Total Sessions Conducted, Tonga
// Dashboard type | Bar chart
// x axis = month, y axis = number of clients
// Permission Group | Tonga Health Promotion Unit
// Countries | Tonga
// Hierarchy Level | National
// Survey: HP08 Monthly Nutrition Counselling
// Yearly selector please.
// Data

// HP299a 'Total Number of One on One Sessions Delivered' + HP323a 'Total Number of Group Sessions Delivered' = Total number of sessions conducted

const dashboardGroups = ['TO_Health_Promotion_Unit_Country'];
const reportId = 'TO_HPU_Nutrition_Counselling_Total_Sessions_Conducted';
const dataBuilder = 'sumPerMonth';
const dataBuilderConfig = {
  dataClasses: {
    value: {
      codes: ['HP299a', 'HP323a'],
    },
  },
  periodType: 'month',
};
const viewJson = {
  name: 'Nutrition Counselling: Total Sessions Conducted',
  type: 'chart',
  chartType: 'bar',
  label: 'Total Sessions Conducted',
  periodGranularity: 'one_year_at_a_time',
  xName: 'Month',
  yName: 'Number of Clients',
  presentationOptions: {
    hideAverage: true,
    periodTickFormat: 'MMMM',
  },
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
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${report.id}';

     UPDATE "dashboardGroup"
     SET "dashboardReports" = array_remove("dashboardReports", '${report.id}')
     WHERE "code" = '${dashboardGroups}';
   `);
};

exports._meta = {
  version: 1,
};
