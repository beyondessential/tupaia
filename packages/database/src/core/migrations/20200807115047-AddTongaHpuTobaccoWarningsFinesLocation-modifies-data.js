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
// Dashboard Title | Tobacco Warnings and Fines by location, Tonga
// Dashboard type | Bar chart (2 bars - Warnings/Fines separated)
// x axis = location (Workplace, School, Church Halls, Other), y axis = number
// Year selector: Yes
// Permission Group | Tonga Health Promotion Unit
// Countries | Tonga
// Hierarchy Level | National
// Survey: HP06 Monthly Tobacco Enforcement

// DataElement |  Answer Type |  Description
// Number of People Given Warning on the Spot at:
// HP263 Number Workplace
// HP264 Number School
// HP265 Number Church Halls
// HP266 Number Other

// Number of People Fined on the Spot at:
// HP268 Number Workplace
// HP269 Number School
// HP270 Number Church Halls
// HP271 Number Other

const dashboardGroups = ['TO_Health_Promotion_Unit_Country'];
const reportId = 'TO_HPU_Tobacco_Warnings_Fines_location';
const dataBuilder = 'sumPerMonthPerSeries';
const dataBuilderConfig = {
  series: {
    Warnings: {
      School: ['HP264'],
      Workplace: ['HP263'],
      'Church Halls': ['HP265'],
      Other: ['HP266'],
    },
    Fines: {
      School: ['HP269'],
      Workplace: ['HP268'],
      'Church Halls': ['HP270'],
      Other: ['HP271'],
    },
  },
  dataClassKeyOrder: ['School', 'Workplace', 'Church Halls', 'Other'],
  periodType: 'year',
};

const viewJson = {
  name: 'Tobacco Warnings and Fines by location Type',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'one_year_at_a_time',
  chartConfig: {
    Warnings: {
      label: 'Warnings',
      stackId: 1,
      legendOrder: 1,
      color: 'orange',
    },
    Fines: {
      label: 'Fines',
      stackId: 2,
      legendOrder: 2,
      color: '#00bcd4',
    },
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
